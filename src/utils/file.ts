/**
 * Tiện ích hỗ trợ tải file hoặc mở khay chia sẻ native trên Mobile App (Capacitor / Android / iOS)
 */

export const getFilenameFromContentDisposition = ( disposition?: string, defaultFilename: string = 'file.xlsx' ): string => {
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

  // 1. Kiểm tra môi trường mobile / Web Share API hỗ trợ chia sẻ file
  if (typeof navigator !== 'undefined' && navigator.canShare) {
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
      // Người dùng nhấn Hủy/Dismiss khay chia sẻ native -> Không ném lỗi
      if (error?.name === 'AbortError') {
        return;
      }
      console.warn('Lỗi chia sẻ Web Share API, chuyển sang tải truyền thống:', error);
    }
  }

  // 2. Fallback cho Web Desktop: Dùng thẻ <a> download
  if (typeof window !== 'undefined') {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Trì hoãn hủy object URL để đảm bảo trình duyệt kịp bắt luồng tải về
    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(url);
    }, 1500);
  }
};
