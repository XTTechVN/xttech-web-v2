'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Eye,
  Heart,
  Mail,
  MessageSquare,
  Newspaper,
  Send,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Avatar, Badge, Button, Skeleton } from '@/components';
import {
  isNewsArticleLiked,
  NEWS_CATEGORY_BADGE_MAP,
  NEWS_CATEGORY_MAP,
  PUBLIC_NEWS_QUERY_KEYS,
  setNewsArticleLiked,
} from '@/config';
import { getPublicNewsBySlug, getPublicNewsList, togglePublicNewsLike } from '@/actions';
import { getFileUrl, sanitizeNewsHtml, showErrorToast, showSuccessToast } from '@/utils';
import queryClient from '@/utils/query';
import type { NewsArticle } from '@/types';
import { NewsCommentsSection } from './news-comments-section';
import { NewsRelatedArticles } from './news-related-articles';

export interface NewsPublicDetailProps {
  slug: string;
}

const ARTICLE_HTML_CLASS = `text-slate-800 text-base leading-[1.85] space-y-4
  [&_p]:my-3.5 [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3
  [&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2.5
  [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-slate-900 [&_h4]:mt-5 [&_h4]:mb-2
  [&_ul]:my-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:my-4 [&_ol]:pl-6 [&_ol]:list-decimal
  [&_li]:my-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5
  [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-slate-700
  [&_figure]:my-6 [&_figure]:mx-auto [&_figcaption]:text-xs [&_figcaption]:sm:text-sm [&_figcaption]:text-slate-500
  [&_figcaption]:italic [&_figcaption]:text-center [&_figcaption]:mt-2
  [&_img]:max-w-full [&_img]:rounded-xl [&_img]:mx-auto [&_img]:shadow-xs
  [&_video]:max-w-full [&_video]:rounded-xl [&_video]:mx-auto [&_video]:shadow-xs
  [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:mx-auto [&_iframe]:border-0 [&_iframe]:shadow-sm
  [&_a]:text-primary [&_a]:font-medium [&_a]:underline hover:[&_a]:text-primary/80
  [&_hr]:my-6 [&_hr]:border-slate-200 [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded-xs
  [&_s]:line-through [&_del]:line-through`;

export function NewsPublicDetail({ slug }: NewsPublicDetailProps) {
  const [optimisticLike, setOptimisticLike] = useState<{
    articleId: number;
    liked: boolean;
    likeCount: number;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: PUBLIC_NEWS_QUERY_KEYS.detail(slug),
    queryFn: async () => {
      const data = await getPublicNewsBySlug(slug);
      // Đồng bộ ngay viewCount/likeCount/commentCount mới nhất vào cache danh sách tin tức
      queryClient.setQueriesData<{ items?: NewsArticle[]; meta?: unknown }>(
        { queryKey: PUBLIC_NEWS_QUERY_KEYS.list },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((item) => (item.id === data.id ? { ...item, ...data } : item)),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: PUBLIC_NEWS_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      return data;
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Dùng chung đúng queryKey PUBLIC_NEWS_QUERY_KEYS.list với trang danh sách để tận dụng cache sẵn có
  const { data: listData } = useQuery({
    queryKey: PUBLIC_NEWS_QUERY_KEYS.list,
    queryFn: () => getPublicNewsList({ offset: 0, limit: 999 }),
  });

  const relatedArticles = useMemo(() => {
    if (!listData?.items || !article) return [];
    return listData.items
      .filter((item) => item.category === article.category && item.id !== article.id)
      .slice(0, 3);
  }, [listData, article]);

  const popularArticles = useMemo(() => {
    if (!listData?.items || !article) return [];
    const relatedIds = new Set(relatedArticles.map((r) => r.id));
    return [...listData.items]
      .filter((item) => item.id !== article.id && !relatedIds.has(item.id))
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 3);
  }, [listData, article, relatedArticles]);

  const sanitizedContent = useMemo(
    () => sanitizeNewsHtml(article?.content || ''),
    [article?.content],
  );

  const isLiked = article
    ? optimisticLike?.articleId === article.id
      ? optimisticLike.liked
      : isNewsArticleLiked(article.id)
    : false;

  const currentLikeCount = article
    ? optimisticLike?.articleId === article.id
      ? optimisticLike.likeCount
      : article.likeCount
    : 0;

  const likeMutation = useMutation({
    mutationFn: (nextLiked: boolean) =>
      togglePublicNewsLike(slug, { action: nextLiked ? 'like' : 'unlike' }),
    onMutate: (nextLiked) => {
      if (!article) return undefined;
      const prevCount = currentLikeCount;
      const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));
      setOptimisticLike({ articleId: article.id, liked: nextLiked, likeCount: nextCount });
      setNewsArticleLiked(article.id, nextLiked);
      return { articleId: article.id, prevLiked: !nextLiked, prevCount };
    },
    onSuccess: (res, nextLiked) => {
      if (!article) return;
      setOptimisticLike({ articleId: article.id, liked: nextLiked, likeCount: res.likeCount });
      queryClient.setQueryData<NewsArticle>(PUBLIC_NEWS_QUERY_KEYS.detail(slug), (old) =>
        old ? { ...old, likeCount: res.likeCount } : old,
      );
      queryClient.setQueriesData<{ items?: NewsArticle[]; meta?: unknown }>(
        { queryKey: PUBLIC_NEWS_QUERY_KEYS.list },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === article.id ? { ...item, likeCount: res.likeCount } : item,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: PUBLIC_NEWS_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['admin-news-detail', article.id] });
    },
    onError: (err, _nextLiked, context) => {
      if (context) {
        setOptimisticLike({
          articleId: context.articleId,
          liked: context.prevLiked,
          likeCount: context.prevCount,
        });
        setNewsArticleLiked(context.articleId, context.prevLiked);
      }
      showErrorToast(err, 'Không thể cập nhật lượt yêu thích.');
    },
  });

  const handleToggleLike = () => {
    if (!article || likeMutation.isPending) return;
    likeMutation.mutate(!isLiked);
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showSuccessToast('Đã sao chép liên kết bài viết!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const openSharePopup = (shareUrl: string) => {
    if (typeof window === 'undefined') return;
    const width = 620;
    const height = 540;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);
    window.open(
      shareUrl,
      '_blank',
      `noopener,noreferrer,width=${width},height=${height},left=${left},top=${top}`,
    );
  };

  const handleShareChannel = (
    channel: 'zalo' | 'facebook' | 'messenger' | 'instagram' | 'gmail' | 'telegram',
  ) => {
    if (typeof window === 'undefined' || !article) return;
    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);
    const titleText = article.title;
    const summaryText = article.summary ? `${article.title} — ${article.summary}` : article.title;

    switch (channel) {
      case 'facebook': {
        openSharePopup(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(titleText)}`,
        );
        break;
      }
      case 'zalo': {
        navigator.clipboard.writeText(currentUrl);
        showSuccessToast('Đã sao chép liên kết! Bạn có thể dán gửi ngay trên Zalo.');
        openSharePopup(
          `https://sp.zalo.me/share_inline?d=${btoa(encodeURIComponent(JSON.stringify({ url: currentUrl })))}`,
        );
        break;
      }
      case 'messenger': {
        navigator.clipboard.writeText(currentUrl);
        showSuccessToast('Đã sao chép liên kết bài viết để gửi qua Messenger!');
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = `fb-messenger://share/?link=${encodedUrl}`;
        } else {
          openSharePopup('https://www.messenger.com/');
        }
        break;
      }
      case 'instagram': {
        navigator.clipboard.writeText(currentUrl);
        showSuccessToast('Đã sao chép liên kết bài viết! Hãy dán vào tin nhắn hoặc bio Instagram.');
        openSharePopup('https://www.instagram.com/');
        break;
      }
      case 'gmail': {
        const subject = encodeURIComponent(`[XTTECH News] ${titleText}`);
        const body = encodeURIComponent(
          `${summaryText}\n\nXem chi tiết bài viết tại:\n${currentUrl}`,
        );
        openSharePopup(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`);
        break;
      }
      case 'telegram': {
        openSharePopup(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(titleText)}`,
        );
        break;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-8 lg:px-32 py-10 space-y-5">
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <Newspaper className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Không tìm thấy bài viết</h1>
        <p className="text-sm text-slate-500 mt-2">
          Bài viết này không tồn tại hoặc đã bị gỡ khỏi hệ thống.
        </p>
        <Link href="/news" className="inline-block mt-5">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Quay lại trang Tin tức
          </Button>
        </Link>
      </div>
    );
  }

  const categoryBadge = NEWS_CATEGORY_BADGE_MAP[article.category] || {
    label: NEWS_CATEGORY_MAP[article.category] || article.category,
    variant: 'primary' as const,
  };
  const authorDisplayName =
    article.author?.fullName || article.author?.username || 'Ban biên tập XTTECH';
  const authorAvatarSrc = getFileUrl(article.author?.avatar) || undefined;
  const thumbnailSrc = getFileUrl(article.thumbnailUrl);

  return (
    <div className="bg-white min-h-screen pb-16">
      <article className="w-full px-4 sm:px-8 lg:px-32 pt-8 sm:pt-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tất cả tin tức</span>
          </Link>
          <div className="flex items-center gap-2">
            {article.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
                <Sparkles className="w-3 h-3" /> Tiêu điểm
              </span>
            )}
            <Link href={`/news?category=${encodeURIComponent(article.category)}`}>
              <Badge variant={categoryBadge.variant} size="md" pill>
                {categoryBadge.label}
              </Badge>
            </Link>
          </div>
        </div>

        <div className="bg-white">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {article.title}
          </h1>

          <div className="mt-5 pb-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar src={authorAvatarSrc} name={authorDisplayName} size="md" />
              <div>
                <p className="text-sm font-bold text-slate-900">{authorDisplayName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono tabular-nums">
                    {article.createdAt ? dayjs(article.createdAt).format('DD/MM/YYYY HH:mm') : '--'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 font-mono tabular-nums">
              <span className="inline-flex items-center gap-1.5" title="Lượt xem">
                <Eye className="w-4 h-4 text-slate-400" /> {article.viewCount}
              </span>
              <span className="inline-flex items-center gap-1.5" title="Lượt yêu thích">
                <Heart
                  className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-rose-500'}`}
                />{' '}
                {currentLikeCount}
              </span>
              <a
                href="#comments"
                className="inline-flex items-center gap-1.5 hover:text-primary"
                title="Bình luận"
              >
                <MessageSquare className="w-4 h-4 text-primary" /> {article.commentCount}
              </a>
            </div>
          </div>

          {article.summary && (
            <div className="mt-6 p-4 sm:p-5 rounded-xl bg-primary/5 border-l-4 border-primary text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
              {article.summary}
            </div>
          )}

          {thumbnailSrc && (
            <div className="mt-6 rounded-xl overflow-hidden bg-slate-50">
              <img
                src={thumbnailSrc}
                alt={article.title}
                className="w-full h-auto object-contain mx-auto"
              />
            </div>
          )}

          <div
            className={`mt-7 ${ARTICLE_HTML_CLASS}`}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={likeMutation.isPending}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer border w-fit ${
                isLiked
                  ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:text-rose-600'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                }`}
              />
              <span>{isLiked ? 'Đã yêu thích' : 'Thả tim bài viết'}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono tabular-nums bg-slate-100 text-slate-800">
                {currentLikeCount}
              </span>
            </button>

            {/* Cụm nút Chia sẻ đa kênh */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 mr-1">
                <Share2 className="w-4 h-4 text-primary" />
                <span>Chia sẻ:</span>
              </span>

              <button
                type="button"
                onClick={() => handleShareChannel('zalo')}
                title="Chia sẻ qua Zalo"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#0068FF] text-white text-xs font-bold shadow-2xs hover:opacity-90 hover:scale-105 transition-all cursor-pointer"
              >
                <span className="font-extrabold tracking-tight text-[11px] bg-white text-[#0068FF] px-1.5 py-0.2 rounded-full leading-tight">
                  Zalo
                </span>
                <span className="hidden md:inline">Zalo</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareChannel('facebook')}
                title="Chia sẻ lên Facebook"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full bg-[#1877F2] text-white text-xs font-bold shadow-2xs hover:opacity-90 hover:scale-105 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="hidden md:inline">Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareChannel('messenger')}
                title="Gửi qua Messenger"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full bg-linear-to-r from-[#00B2FF] to-[#006AFF] text-white text-xs font-bold shadow-2xs hover:opacity-90 hover:scale-105 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.13.26.35.27.57l.05 1.78c.02.63.67 1.04 1.24.76l1.98-.87c.17-.08.36-.1.55-.05.88.24 1.81.36 2.77.36 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm6 7.46-2.93 4.67c-.47.73-1.47.92-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.93-4.67c.47-.73 1.47-.92 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63z" />
                </svg>
                <span className="hidden md:inline">Messenger</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareChannel('instagram')}
                title="Chia sẻ qua Instagram"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full bg-linear-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white text-xs font-bold shadow-2xs hover:opacity-90 hover:scale-105 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span className="hidden md:inline">Instagram</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareChannel('gmail')}
                title="Chia sẻ qua Gmail"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full bg-[#EA4335] text-white text-xs font-bold shadow-2xs hover:opacity-90 hover:scale-105 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Gmail</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareChannel('telegram')}
                title="Chia sẻ qua Telegram"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full bg-[#26A5E4] text-white text-xs font-bold shadow-2xs hover:opacity-90 hover:scale-105 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Telegram</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                title="Sao chép liên kết bài viết"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-bold text-primary bg-primary/8 hover:bg-primary/15 border border-primary/20 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Đã chép link' : 'Sao chép link'}</span>
              </button>
            </div>
          </div>

          <NewsCommentsSection
            slug={article.slug}
            articleId={article.id}
            commentCount={article.commentCount}
          />
        </div>

        <NewsRelatedArticles
          articles={relatedArticles}
          popularArticles={popularArticles}
          category={article.category}
        />
      </article>
    </div>
  );
}
