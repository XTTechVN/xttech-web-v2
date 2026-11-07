import type { NewsCategory, NewsStatus } from '@/types';

export type NewsBadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export const NEWS_STATUS_MAP: Record<NewsStatus, string> = {
  draft: 'Bản nháp',
  published: 'Đã xuất bản',
};

export const NEWS_STATUS_OPTIONS: Array<{ value: NewsStatus; label: string }> = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Đã xuất bản' },
];

export const NEWS_STATUS_BADGE_MAP: Record<
  NewsStatus,
  { label: string; variant: NewsBadgeVariant; className: string }
> = {
  draft: {
    label: 'Bản nháp',
    variant: 'warning',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  published: {
    label: 'Đã xuất bản',
    variant: 'success',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export const NEWS_CATEGORY_MAP: Record<NewsCategory, string> = {
  company_news: 'Tin tức công ty',
  industry_knowledge: 'Kiến thức nhôm kính',
  project_showcase: 'Công trình tiêu biểu',
  technology_solution: 'Công nghệ & Giải pháp',
  recruitment_culture: 'Tuyển dụng & Văn hóa',
  promotion_event: 'Khuyến mãi & Sự kiện',
};

export const NEWS_CATEGORY_OPTIONS: Array<{ value: NewsCategory; label: string }> = [
  { value: 'company_news', label: 'Tin tức công ty' },
  { value: 'industry_knowledge', label: 'Kiến thức nhôm kính' },
  { value: 'project_showcase', label: 'Công trình tiêu biểu' },
  { value: 'technology_solution', label: 'Công nghệ & Giải pháp' },
  { value: 'recruitment_culture', label: 'Tuyển dụng & Văn hóa' },
  { value: 'promotion_event', label: 'Khuyến mãi & Sự kiện' },
];

export const NEWS_CATEGORY_BADGE_MAP: Record<
  NewsCategory,
  { label: string; variant: NewsBadgeVariant; className: string }
> = {
  company_news: {
    label: 'Tin tức công ty',
    variant: 'primary',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  industry_knowledge: {
    label: 'Kiến thức nhôm kính',
    variant: 'info',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  project_showcase: {
    label: 'Công trình tiêu biểu',
    variant: 'success',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  technology_solution: {
    label: 'Công nghệ & Giải pháp',
    variant: 'primary',
    className: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  recruitment_culture: {
    label: 'Tuyển dụng & Văn hóa',
    variant: 'warning',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  promotion_event: {
    label: 'Khuyến mãi & Sự kiện',
    variant: 'danger',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export function slugifyVietnamese(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const LIKED_NEWS_STORAGE_KEY = 'xttech_liked_news_ids';

function readLikedNewsIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LIKED_NEWS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === 'number' && Number.isFinite(id));
  } catch {
    return [];
  }
}

export function isNewsArticleLiked(articleId: number): boolean {
  if (!articleId) return false;
  return readLikedNewsIds().includes(articleId);
}

export function setNewsArticleLiked(articleId: number, liked: boolean): void {
  if (typeof window === 'undefined' || !articleId) return;
  try {
    const current = new Set(readLikedNewsIds());
    if (liked) {
      current.add(articleId);
    } else {
      current.delete(articleId);
    }
    window.localStorage.setItem(LIKED_NEWS_STORAGE_KEY, JSON.stringify(Array.from(current)));
  } catch {
    // Bỏ qua lỗi quota hoặc private mode của trình duyệt
  }
}
