const PLATFORM_LABEL: Record<string, string> = { android: 'Android', ios: 'iOS' };
export const platformOf = (p: string) => PLATFORM_LABEL[p] ?? p;
export const dateOf = (s?: string | null) => (s ? new Date(s).toLocaleDateString('vi-VN') : '–');
