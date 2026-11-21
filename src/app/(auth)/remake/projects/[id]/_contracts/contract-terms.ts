import type { ContractTerms } from '@/types';

const LEGACY_TERM_KEYS = ['mechanism', 'clauses', 'policy'] as const;

const stripTags = (html: string): string => html.replace(/<[^>]*>/g, '').trim();

// Đọc nội dung điều khoản; dữ liệu cũ (3 phần) được gộp theo thứ tự Cơ chế, Điều khoản, Chính sách
export function readTermsContent(terms?: ContractTerms | null): string {
  if (!terms) return '';
  if (typeof terms.content === 'string') return terms.content;

  return LEGACY_TERM_KEYS.map((key) => String(terms[key] ?? ''))
    .filter((html) => stripTags(html) !== '')
    .join('');
}

export const hasTermsContent = (terms?: ContractTerms | null): boolean => stripTags(readTermsContent(terms)) !== '';

// Ghi nội dung mới, giữ các khóa hệ thống (thay thế, hủy...) và bỏ các khóa cũ đã gộp
export function withTermsContent(terms: ContractTerms, content: string): ContractTerms {
  const kept = Object.entries(terms).filter(([key]) => !(LEGACY_TERM_KEYS as readonly string[]).includes(key));
  return { ...Object.fromEntries(kept), content };
}
