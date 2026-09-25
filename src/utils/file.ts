/**
 * Tiện ích hỗ trợ tải file hoặc mở khay chia sẻ native trên Mobile App (Capacitor / Android / iOS)
 */
import React from 'react';
import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Chuyển đổi Blob thành Base64 Data URL để lưu file qua Capacitor Filesystem
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};

export const getFilenameFromContentDisposition = (
  disposition?: string,
  defaultFilename: string = 'file.xlsx'
): string => {
  if (!disposition || disposition.indexOf('attachment') === -1) {
    return defaultFilename;
  }

  // 1. Ưu tiên đọc chuẩn filename*=UTF-8''... (hỗ trợ tiếng Việt có dấu chuẩn RFC 5987)
  const utf8Regex = /filename\*=UTF-8''([^;]+)/i;
  const utf8Matches = utf8Regex.exec(disposition);
  if (utf8Matches && utf8Matches[1]) {
    try {
      return decodeURIComponent(utf8Matches[1]);
    } catch {
      return utf8Matches[1];
    }
  }

  // 2. Đọc chuẩn thông thường filename="..."
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i;
  const matches = filenameRegex.exec(disposition);
  if (matches != null && matches[1]) {
    try {
      return decodeURIComponent(matches[1].replace(/['"]/g, ''));
    } catch {
      return matches[1].replace(/['"]/g, '');
    }
  }

  return defaultFilename;
};

/**
 * Tải file về thiết bị hoặc kích hoạt khay chia sẻ native trên Mobile (Android/iOS)
 */
export const downloadOrShareBlob = async (
  data: BlobPart,
  filename: string,
  mimeType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
): Promise<void> => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });

  // 1. Ưu tiên cao nhất trên Native Mobile App (Capacitor Android / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      await Share.share({
        title: filename,
        text: filename,
        url: savedFile.uri,
        dialogTitle: 'Chia sẻ hoặc mở file',
      });
      return;
    } catch (error: any) {
      // Người dùng bấm ra ngoài để hủy khay chia sẻ -> Kết thúc bình thường
      if (
        error?.name === 'AbortError' ||
        error?.message?.includes('canceled') ||
        error?.message?.includes('cancelled') ||
        error?.message?.includes('dismiss')
      ) {
        return;
      }
      console.warn('Lỗi chia sẻ Native Capacitor, chuyển sang phương thức dự phòng:', error);
    }
  }

  const isMobile =
    typeof window !== 'undefined' &&
    (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator as any).userAgentData?.mobile);

  // 1. Trên Mobile App / Mobile Browser: Ưu tiên Web Share API để mở khay chia sẻ native
  if (isMobile && typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
        });
        return;
      }
    } catch (error: any) {
      // Người dùng nhấn Hủy/Dismiss khay chia sẻ native -> Kết thúc bình thường
      if (error?.name === 'AbortError') {
        return;
      }

      // Nếu bị chặn do mất quyền cử chỉ (NotAllowedError: Must be handling a user gesture),
      // hiển thị toast có nút bấm trực tiếp để tạo User Gesture mới 100% hợp lệ!
      if (error?.name === 'NotAllowedError') {
        toast(
          (t) => (
            React.createElement('div', { className: 'flex items-center justify-between gap-3 text-sm py-0.5' },
              React.createElement('span', { className: 'font-medium text-slate-800 truncate max-w-[170px]' }, filename),
              React.createElement('button', {
                type: 'button',
                onClick: async () => {
                  toast.dismiss(t.id);
                  try {
                    const freshFile = new File([blob], filename, { type: mimeType });
                    if (navigator.canShare && navigator.canShare({ files: [freshFile] })) {
                      await navigator.share({ files: [freshFile], title: filename });
                    }
                  } catch (err: any) {
                    if (err?.name !== 'AbortError') {
                      console.warn('Lỗi chia sẻ lại:', err);
                    }
                  }
                },
                className: 'px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-md shadow-xs hover:bg-primary-dark cursor-pointer shrink-0'
              }, 'Mở file 📥')
            )
          ),
          { duration: 10000 }
        );
        return;
      }
      console.warn('Lỗi chia sẻ Web Share API:', error);
    }
  }

  // 2. Trên Desktop Web (hoặc thiết bị không hỗ trợ share file): Tải trực tiếp bằng thẻ <a> download
  if (typeof window !== 'undefined') {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(url);
    }, 1500);
  }
};
