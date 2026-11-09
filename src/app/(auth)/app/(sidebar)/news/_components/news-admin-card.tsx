'use client';

import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import {
  Edit3,
  ExternalLink,
  Eye,
  Heart,
  MessageSquare,
  Newspaper,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Badge, ITableColumn, Switch } from '@/components';
import {
  NEWS_CATEGORY_BADGE_MAP,
  NEWS_CATEGORY_MAP,
  NEWS_STATUS_BADGE_MAP,
} from '@/config';
import { getFileUrl } from '@/utils';
import type { NewsArticle } from '@/types';

export interface NewsAdminCardProps {
  article: NewsArticle;
  onPreviewClick: (article: NewsArticle) => void;
  onEditClick: (article: NewsArticle) => void;
  onDeleteClick: (article: NewsArticle) => void;
}

export function NewsAdminCard({
  article,
  onPreviewClick,
  onEditClick,
  onDeleteClick,
}: NewsAdminCardProps) {
  const categoryBadge = NEWS_CATEGORY_BADGE_MAP[article.category];
  const statusBadge = NEWS_STATUS_BADGE_MAP[article.status];

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={statusBadge.variant} size="sm">{statusBadge.label}</Badge>
          <Badge variant={categoryBadge.variant} size="sm">{categoryBadge.label}</Badge>
        </div>
        <span className="text-[11px] font-mono tabular-nums text-slate-400">
          {article.createdAt ? dayjs(article.createdAt).format('DD/MM/YYYY') : '--'}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onPreviewClick(article)}
        className="text-sm font-bold text-slate-900 text-left line-clamp-2"
      >
        {article.title}
      </button>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-3 font-mono tabular-nums text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {article.viewCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500" /> {article.likeCount}
          </span>
          <span className="inline-flex items-center gap-1 text-primary">
            <MessageSquare className="w-3.5 h-3.5" /> {article.commentCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onEditClick(article)} className="text-primary font-semibold">
            Sửa
          </button>
          <button type="button" onClick={() => onDeleteClick(article)} className="text-rose-600 font-semibold">
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

export interface BuildNewsAdminColumnsParams {
  updatingId: number | null;
  onToggleStatus: (row: NewsArticle) => void;
  onToggleFeatured: (row: NewsArticle) => void;
  onPreviewClick: (row: NewsArticle) => void;
  onEditClick: (row: NewsArticle) => void;
  onDeleteClick: (row: NewsArticle) => void;
}

export function buildNewsAdminColumns({
  updatingId,
  onToggleStatus,
  onToggleFeatured,
  onPreviewClick,
  onEditClick,
  onDeleteClick,
}: BuildNewsAdminColumnsParams): ITableColumn<NewsArticle>[] {
  return [
    {
      key: 'article',
      label: 'Bài viết',
      minWidth: '300px',
      cell: (row: NewsArticle) => {
        const thumb = getFileUrl(row.thumbnailUrl);
        return (
          <div className="flex items-start gap-3 py-1">
            <div className="w-16 h-11 rounded-lg bg-primary/5 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
              {thumb ? (
                <img src={thumb} alt={row.title} className="w-full h-full object-cover" />
              ) : (
                <Newspaper className="w-4 h-4 text-primary/40" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onPreviewClick(row)}
                className="text-sm font-bold text-slate-900 hover:text-primary transition-colors text-left line-clamp-1 cursor-pointer"
              >
                {row.title}
              </button>
              <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">/{row.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      label: 'Chuyên mục',
      minWidth: '160px',
      cell: (row: NewsArticle) => {
        const badge = NEWS_CATEGORY_BADGE_MAP[row.category] || {
          label: NEWS_CATEGORY_MAP[row.category] || row.category,
          variant: 'primary' as const,
        };
        return <Badge variant={badge.variant} size="sm">{badge.label}</Badge>;
      },
    },
    {
      key: 'status',
      label: 'Xuất bản & Tiêu điểm',
      minWidth: '180px',
      cell: (row: NewsArticle) => {
        const statusBadge = NEWS_STATUS_BADGE_MAP[row.status];
        return (
          <div className="flex items-center gap-2.5">
            <Switch
              checked={row.status === 'published'}
              disabled={updatingId === row.id}
              onChange={() => onToggleStatus(row)}
            />
            <Badge variant={statusBadge.variant} size="sm">{statusBadge.label}</Badge>
            <button
              type="button"
              onClick={() => onToggleFeatured(row)}
              disabled={updatingId === row.id}
              title={row.isFeatured ? 'Bỏ ghim tiêu điểm' : 'Ghim làm bài tiêu điểm'}
              className={`p-1 rounded-md border transition-colors cursor-pointer ${
                row.isFeatured
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-primary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
    {
      key: 'metrics',
      label: 'Chỉ số tương tác',
      minWidth: '160px',
      cell: (row: NewsArticle) => (
        <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-700">
          <span className="inline-flex items-center gap-1" title="Lượt xem">
            <Eye className="w-3.5 h-3.5 text-slate-400" /> {row.viewCount}
          </span>
          <span className="inline-flex items-center gap-1" title="Lượt thả tim">
            <Heart className="w-3.5 h-3.5 text-rose-500" /> {row.likeCount}
          </span>
          <button
            type="button"
            onClick={() => onPreviewClick(row)}
            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline cursor-pointer"
            title="Xem & quản trị bình luận"
          >
            <MessageSquare className="w-3.5 h-3.5" /> {row.commentCount}
          </button>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Tác giả & Ngày tạo',
      minWidth: '160px',
      cell: (row: NewsArticle) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-slate-800 truncate max-w-[150px]">
            {row.author?.fullName || row.author?.username || 'Quản trị viên'}
          </span>
          <span className="text-slate-500 font-mono tabular-nums">
            {row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY HH:mm') : '--'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '130px',
      cell: (row: NewsArticle) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPreviewClick(row)}
            title="Xem trước & Quản lý bình luận"
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEditClick(row)}
            title="Chỉnh sửa bài viết"
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          {row.status === 'published' && (
            <Link
              href={`/news/${encodeURIComponent(row.slug)}`}
              target="_blank"
              title="Mở trang công khai"
              className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => onDeleteClick(row)}
            title="Xóa cứng bài viết"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
}
