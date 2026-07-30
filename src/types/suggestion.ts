import { User } from './user';

export interface SuggestionAttachment {
  id: number;
  suggestionId: number;
  path: string;
  createdAt: string;
}

export interface Suggestion {
  id: number;
  title: string;
  content: string;
  anonymous: boolean;
  userId: string;
  status: 'pending' | 'approve' | 'reject';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  review: string | null;
  reviewById: string | null;
  attachments: SuggestionAttachment[];
  user: User | null;
  reviewBy: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentItem {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string | null;
}

export interface SuggestionQueryParams {
  userId?: string;
  status?: 'pending' | 'approve' | 'reject';
  offset?: number;
  limit?: number;
  search?: string;
  tab?: string;
}

export interface SuggestionCreate {
  title: string;
  content: string;
  anonymous: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export interface SuggestionReviewSchema {
  review: string;
  status: 'approve' | 'reject' | 'pending';
}

export interface SuggestionUpdate {
  title?: string;
  content?: string;
  anonymous?: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}
