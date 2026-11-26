import { NEWS_CATEGORY_OPTIONS } from '@/config';

export const FETCH_ALL_LIMIT = 999;
export const PAGE_LIMIT = 12;
export const MAX_FEATURED_SLIDES = 5;
export const FEATURED_SLIDE_INTERVAL_MS = 10000;
export const VALID_CATEGORIES = new Set<string>(NEWS_CATEGORY_OPTIONS.map((item) => item.value));
