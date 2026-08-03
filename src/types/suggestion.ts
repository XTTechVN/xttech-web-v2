import { User } from './user';

export enum SuggestionType {
  PROCESS = 'process',
  PRODUCT = 'product',
  TECHNOLOGY = 'technology',
  COST = 'cost',
  QUALITY = 'quality',
  SAFETY = 'safety',
  WORKPLACE = 'workplace',
  WELFARE = 'welfare',
  TRAINING = 'training',
  CUSTOMER = 'customer',
  COMPLAINT = 'complaint',
  OTHER = 'other',
}

export interface SuggestionAttachment {
  id: number;
  suggestionId: number;
  path: string;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  title: string;
  content: string;
  anonymous: boolean;
  userId: string;
  status: 'pending' | 'approve' | 'reject';
  type?: string;
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
  isUploading?: boolean;
  uploadProgress?: number;
}

export interface SuggestionQueryParams {
  userId?: string;
  status?: 'pending' | 'approve' | 'reject';
  offset?: number;
  limit?: number;
  search?: string;
  type?: string | null;
}

export interface SuggestionCreate {
  title: string;
  content: string;
  anonymous: boolean;
  type?: SuggestionType;
}

export interface SuggestionReviewSchema {
  review: string;
  status: 'approve' | 'reject' | 'pending';
}

export interface SuggestionUpdate {
  title?: string;
  content?: string;
  anonymous?: boolean;
  type?: SuggestionType;
}
