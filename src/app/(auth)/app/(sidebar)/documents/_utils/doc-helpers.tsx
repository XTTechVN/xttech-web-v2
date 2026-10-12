import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  FileImage,
  FileArchive,
  File,
} from 'lucide-react';

// Định dạng dung lượng tệp
export function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Tự động sinh mã tài liệu theo tên tài liệu
export function generateSlugCode(text: string, prefix = 'DOC'): string {
  if (!text) return `${prefix}_${Date.now().toString().slice(-4)}`;
  // Remove accents
  const nonAccent = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

  const slug = nonAccent
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return slug || `${prefix}_${Date.now().toString().slice(-4)}`;
}

// Lấy đuôi file
export function getFileExtension(filename?: string): string {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

// Định nghĩa thông tin hiển thị của file
export function getFileVisualInfo(filename?: string, mimeType?: string) {
  const ext = getFileExtension(filename);

  if (['pdf'].includes(ext) || mimeType?.includes('pdf')) {
    return {
      icon: <FileText className="text-rose-500" size={20} />,
      color: 'rose',
      label: 'PDF',
      bgColor: 'bg-rose-50 border-rose-200',
    };
  }

  if (['doc', 'docx'].includes(ext) || mimeType?.includes('word')) {
    return {
      icon: <FileText className="text-blue-500" size={20} />,
      color: 'blue',
      label: 'Word',
      bgColor: 'bg-blue-50 border-blue-200',
    };
  }

  if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
    return {
      icon: <FileSpreadsheet className="text-emerald-600" size={20} />,
      color: 'emerald',
      label: 'Excel',
      bgColor: 'bg-emerald-50 border-emerald-200',
    };
  }

  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext) || mimeType?.startsWith('image/')) {
    return {
      icon: <FileImage className="text-indigo-500" size={20} />,
      color: 'indigo',
      label: 'Image',
      bgColor: 'bg-indigo-50 border-indigo-200',
    };
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType?.includes('zip')) {
    return {
      icon: <FileArchive className="text-amber-500" size={20} />,
      color: 'amber',
      label: 'Archive',
      bgColor: 'bg-amber-50 border-amber-200',
    };
  }

  if (['js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'py'].includes(ext)) {
    return {
      icon: <FileCode className="text-purple-500" size={20} />,
      color: 'purple',
      label: 'Code',
      bgColor: 'bg-purple-50 border-purple-200',
    };
  }

  return {
    icon: <File className="text-slate-500" size={20} />,
    color: 'slate',
    label: ext ? ext.toUpperCase() : 'File',
    bgColor: 'bg-slate-50 border-slate-200',
  };
}

// Icon tùy theo loại file
export function DriveFileIcon({
  filename,
  mimeType,
  size = 18,
}: {
  filename?: string;
  mimeType?: string;
  size?: number;
}) {
  const ext = getFileExtension(filename);

  // 1. PDF - Red document icon with folded corner
  if (['pdf'].includes(ext) || mimeType?.includes('pdf')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#EA4335" />
        <path d="M14 2v6h6" fill="#F89D96" />
        <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  // 2. Word / Docs - Blue document icon
  if (['doc', 'docx'].includes(ext) || mimeType?.includes('word')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#4285F4" />
        <path d="M14 2v6h6" fill="#A1C2FA" />
        <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  // 3. Excel / Sheets - Green spreadsheet icon
  if (
    ['xls', 'xlsx', 'csv'].includes(ext) ||
    mimeType?.includes('excel') ||
    mimeType?.includes('spreadsheet')
  ) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#0F9D58" />
        <path d="M14 2v6h6" fill="#87CEAB" />
        <rect x="7.5" y="12" width="9" height="6.5" rx="0.5" fill="none" stroke="white" strokeWidth="1.3" />
        <line x1="12" y1="12" x2="12" y2="18.5" stroke="white" strokeWidth="1.3" />
        <line x1="7.5" y1="15.2" x2="16.5" y2="15.2" stroke="white" strokeWidth="1.3" />
      </svg>
    );
  }

  // 4. PowerPoint / Slides - Orange presentation icon
  if (['ppt', 'pptx'].includes(ext) || mimeType?.includes('presentation')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#F4B400" />
        <path d="M14 2v6h6" fill="#FCDA7F" />
        <rect x="8" y="12.5" width="8" height="5.5" rx="0.5" fill="none" stroke="white" strokeWidth="1.3" />
      </svg>
    );
  }

  // 5. Video - Red video player icon
  if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext) || mimeType?.startsWith('video/')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="#EA4335" />
        <polygon points="10,8.5 16,12 10,15.5" fill="white" />
      </svg>
    );
  }

  // 6. Image - Purple image icon
  if (
    ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext) ||
    mimeType?.startsWith('image/')
  ) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <rect x="2.5" y="3.5" width="19" height="17" rx="3" fill="#AB47BC" />
        <circle cx="8" cy="8.5" r="1.8" fill="white" />
        <path
          d="M20 16l-5-5-8 7.5"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // 7. Archive / Zip - Amber icon
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType?.includes('zip')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#E37400" />
        <path d="M14 2v6h6" fill="#F5BA80" />
        <path d="M10 11h2M10 13h2M10 15h2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }

  // 8. Generic file - Slate document
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#5F6368" />
      <path d="M14 2v6h6" fill="#BDC1C6" />
      <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// DriveFileBadge alias to DriveFileIcon
export const DriveFileBadge = DriveFileIcon;

// Kiểm tra nhân sự có đủ thẩm quyền phê duyệt hay không (CHỈ LOAD ROLE ADMIN HOẶC HR)
export const isApproverEligible = (emp: any): boolean => {
  if (!emp) return false;

  const roles: { code?: string; name?: string }[] = [];
  if (Array.isArray(emp.roles)) {
    emp.roles.forEach((r: any) => {
      if (typeof r === 'string') roles.push({ code: r, name: r });
      else if (r && typeof r === 'object') roles.push({ code: r.code, name: r.name });
    });
  }
  if (typeof emp.role === 'string') roles.push({ code: emp.role, name: emp.role });
  else if (emp.role && typeof emp.role === 'object') roles.push({ code: emp.role.code, name: emp.role.name });

  if (roles.length === 0) return false;

  return roles.some(({ code, name }) => {
    const c = (code || '').toLowerCase().trim();
    const n = (name || '').toLowerCase().trim();

    // 1. Role code khớp admin / hr / super
    const validCodes = ['admin', 'hr', 'super', 'supper', 'super_admin', 'supper_admin', 'admin_hr'];
    if (validCodes.includes(c)) return true;

    // 2. Role name tiếng Việt: 'quản trị', 'quản trị viên', 'nhân sự' (tuyệt đối không chấp nhận 'nhân viên' hay 'kinh doanh')
    if (n === 'admin' || n === 'hr' || n === 'quản trị' || n === 'quản trị viên' || n === 'nhân sự') {
      return true;
    }
    if (c.includes('admin') || n.includes('admin') || n.includes('quản trị')) {
      return true;
    }
    if ((c.includes('hr') || n.includes('nhân sự')) && !n.includes('nhân viên') && !c.includes('employee')) {
      return true;
    }

    return false;
  });
};

// Lấy badge chức vụ / vai trò của người duyệt
export const getApproverRoleBadge = (emp: any): string => {
  if (Array.isArray(emp?.roles) && emp.roles.length > 0) {
    const names = emp.roles
      .map((r: any) => (typeof r === 'string' ? r : r.name || r.code))
      .filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  if (typeof emp?.role === 'string') return emp.role;
  if (emp?.role && typeof emp.role === 'object') return emp.role.name || emp.role.code || '';
  return 'Cán bộ duyệt';
};



