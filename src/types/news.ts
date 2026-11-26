export type NewsStatus = 'draft' | 'published';

export type NewsCategory =
  | 'company_news'
  | 'industry_knowledge'
  | 'project_showcase'
  | 'technology_solution'
  | 'user_guide'
  | 'recruitment_culture'
  | 'promotion_event';

export type NewsLikeAction = 'like' | 'unlike';

export interface NewsAuthor {
  id: string;
  fullName: string | null;
  username: string;
  avatar: string | null;
}

export interface NewsLikeRequest {
  action: NewsLikeAction;
}

export interface NewsLikeResponse {
  id: number;
  likeCount: number;
}

export interface NewsCommentCreate {
  authorName: string;
  content: string;
}

export interface NewsComment {
  id: number;
  articleId: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  thumbnailUrl: string | null;
  category: NewsCategory;
  status: NewsStatus;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  authorId: string | null;
  author: NewsAuthor | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticleCreate {
  title: string;
  slug?: string | null;
  summary?: string | null;
  content: string;
  thumbnailUrl?: string | null;
  category: NewsCategory;
  status?: NewsStatus;
  isFeatured?: boolean;
  mediaTempIds?: string[];
}

export interface NewsArticleUpdate {
  title?: string;
  slug?: string | null;
  summary?: string | null;
  content?: string;
  thumbnailUrl?: string | null;
  category?: NewsCategory;
  status?: NewsStatus;
  isFeatured?: boolean;
  mediaTempIds?: string[];
}

export interface NewsArticleStatusUpdate {
  status?: NewsStatus;
  isFeatured?: boolean;
}

export interface NewsQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: NewsCategory;
  status?: NewsStatus;
  isFeatured?: boolean;
  authorId?: string;
  popular?: boolean;
  hot?: boolean;
}

export interface PublicNewsQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: NewsCategory;
  isFeatured?: boolean;
  popular?: boolean;
  hot?: boolean;
}

export interface NewsCommentQueryParams {
  limit?: number;
  offset?: number;
}
