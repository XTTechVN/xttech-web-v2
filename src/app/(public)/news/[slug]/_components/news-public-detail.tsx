'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  ChevronRight,
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
import { Button, Skeleton } from '@/components';
import {
  isNewsArticleLiked,
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
  initialArticle?: NewsArticle | null;
}

const VIETNAMESE_WEEKDAYS = [
  'Chủ nhật',
  'Thứ hai',
  'Thứ ba',
  'Thứ tư',
  'Thứ năm',
  'Thứ sáu',
  'Thứ bảy',
];

function formatVietnameseArticleDate(dateStr?: string | null): string {
  if (!dateStr) return '--';
  const d = dayjs(dateStr);
  if (!d.isValid()) return '--';
  const weekday = VIETNAMESE_WEEKDAYS[d.day()];
  return `${weekday}, ${d.format('D/M/YYYY HH:mm')} (GMT+7)`;
}

const ARTICLE_HTML_CLASS = `text-slate-800 text-base sm:text-[17px] leading-[1.8] space-y-4
  [&_p]:my-4 [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3
  [&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2.5
  [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-slate-900 [&_h4]:mt-5 [&_h4]:mb-2
  [&_ul]:my-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:my-4 [&_ol]:pl-6 [&_ol]:list-decimal
  [&_li]:my-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5
  [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-slate-700
  [&_figure]:my-6 [&_figure]:mx-auto [&_figcaption]:text-xs [&_figcaption]:text-slate-500
  [&_figcaption]:mt-2
  [&_img]:w-full [&_img]:h-auto [&_img]:object-contain [&_img]:bg-slate-50 [&_img]:mx-auto
  [&_video]:w-full [&_video]:h-auto [&_video]:rounded-lg [&_video]:mx-auto
  [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:mx-auto [&_iframe]:border-0
  [&_a]:text-primary [&_a]:font-medium [&_a]:underline hover:[&_a]:text-primary/80
  [&_hr]:my-6 [&_hr]:border-slate-200 [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded-xs
  [&_s]:line-through [&_del]:line-through`;

export function NewsPublicDetail({ slug, initialArticle }: NewsPublicDetailProps) {
  const [optimisticLike, setOptimisticLike] = useState<{
    articleId: number;
    liked: boolean;
    likeCount: number;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const countedSlugRef = useRef<string | null>(null);

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
    initialData: initialArticle ?? undefined,
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Khi trang đã được SSR với countView=false, kích hoạt đúng 1 lần trên Client để ghi nhận lượt xem thực của người đọc
  useEffect(() => {
    if (!slug || !initialArticle || countedSlugRef.current === slug) return;
    countedSlugRef.current = slug;
    getPublicNewsBySlug(slug)
      .then((freshArticle) => {
        queryClient.setQueryData<NewsArticle>(PUBLIC_NEWS_QUERY_KEYS.detail(slug), freshArticle);
        queryClient.setQueriesData<{ items?: NewsArticle[]; meta?: unknown }>(
          { queryKey: PUBLIC_NEWS_QUERY_KEYS.list },
          (old) => {
            if (!old?.items) return old;
            return {
              ...old,
              items: old.items.map((item) =>
                item.id === freshArticle.id ? { ...item, ...freshArticle } : item,
              ),
            };
          },
        );
      })
      .catch(() => {
        // Bỏ qua nếu lỗi mạng tạm thời trên client vì đã có dữ liệu SSR
      });
  }, [slug, initialArticle]);

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-5">
        <Skeleton className="h-4 w-44 rounded" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-4 w-64 rounded" />
        <Skeleton className="h-16 w-full rounded" />
        <Skeleton className="h-80 w-full rounded-lg" />
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

  const categoryLabel = NEWS_CATEGORY_MAP[article.category] || article.category;
  const authorDisplayName =
    article.author?.fullName || article.author?.username || 'Ban biên tập XTTECH';
  const thumbnailSrc = getFileUrl(article.thumbnailUrl);

  return (
    <div className="bg-white min-h-screen pb-16">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Dòng điều hướng Chuyên mục kiểu báo chí (giống mẫu Ảnh 2: TIN TỨC > CHUYÊN MỤC) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium uppercase tracking-wide text-slate-400">
            <Link href="/news" className="hover:text-primary transition-colors">
              Tin tức
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link
              href={`/news?category=${encodeURIComponent(article.category)}`}
              className="text-slate-500 hover:text-primary transition-colors"
            >
              {categoryLabel}
            </Link>
          </nav>

          {article.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
              <Sparkles className="w-3 h-3" /> Tiêu điểm
            </span>
          )}
        </div>

        <div className="mt-3">
          {/* Tiêu đề lớn */}
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-slate-900 tracking-tight leading-[1.25]">
            {article.title}
          </h1>

          {/* Dòng Tác giả • Thứ, ngày giờ (GMT+7) & thông số tương tác */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-[13px] text-slate-500">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-900">{authorDisplayName}</span>
              <span className="text-slate-300">•</span>
              <span>{formatVietnameseArticleDate(article.createdAt)}</span>
            </div>

            <div className="flex items-center gap-3.5 text-xs text-slate-500 font-mono tabular-nums">
              <span className="inline-flex items-center gap-1" title="Lượt xem">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> {article.viewCount}
              </span>
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={likeMutation.isPending}
                title={isLiked ? 'Bỏ thả tim' : 'Thả tim bài viết'}
                className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${
                  isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-transform ${
                    isLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-rose-500'
                  }`}
                />{' '}
                {currentLikeCount}
              </button>
              <a
                href="#comments"
                className="inline-flex items-center gap-1 hover:text-primary"
                title="Bình luận"
              >
                <MessageSquare className="w-3.5 h-3.5 text-primary" /> {article.commentCount}
              </a>
            </div>
          </div>

          {/* Sapo / Tóm tắt in đậm (chuẩn phong cách báo chí ở Ảnh 2) */}
          {article.summary && (
            <p className="mt-5 text-base sm:text-[17px] font-bold text-slate-800 leading-relaxed">
              {article.summary}
            </p>
          )}

          {/* Ảnh đại diện tự co giãn đúng tỉ lệ theo trang + chú thích ảnh bên dưới */}
          {thumbnailSrc && (
            <figure className="mt-6 space-y-2">
              <div className="w-full overflow-hidden bg-slate-50">
                <img
                  src={thumbnailSrc}
                  alt={article.title}
                  className="w-full h-auto block object-contain mx-auto"
                />
              </div>
              <figcaption className="text-xs text-slate-500 leading-relaxed">
                {article.title}. Ảnh: <em className="italic">XTTECH</em>.
              </figcaption>
            </figure>
          )}

          <div
            className={`mt-6 ${ARTICLE_HTML_CLASS}`}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            suppressHydrationWarning
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
