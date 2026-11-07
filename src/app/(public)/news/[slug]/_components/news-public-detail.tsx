'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Check, Eye, Heart, MessageSquare, Newspaper, Share2, Sparkles } from 'lucide-react';
import { Avatar, Badge, Button, Skeleton } from '@/components';
import { isNewsArticleLiked, NEWS_CATEGORY_BADGE_MAP, NEWS_CATEGORY_MAP, setNewsArticleLiked } from '@/config';
import { getPublicNewsBySlug, getPublicNewsList, togglePublicNewsLike } from '@/actions';
import { getFileUrl, sanitizeNewsHtml, showErrorToast, showSuccessToast } from '@/utils';
import queryClient from '@/utils/query';
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
  [&_a]:text-primary [&_a]:font-medium [&_a]:underline hover:[&_a]:text-primary/80`;

export function NewsPublicDetail({ slug }: NewsPublicDetailProps) {
  const [optimisticLike, setOptimisticLike] = useState<{
    articleId: number;
    liked: boolean;
    likeCount: number;
  } | null>(null);
  const [commentDelta, setCommentDelta] = useState<{ articleId: number; delta: number }>({
    articleId: 0,
    delta: 0,
  });
  const [isLiking, setIsLiking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['public-news-detail', slug],
    queryFn: () => getPublicNewsBySlug(slug),
    enabled: Boolean(slug),
  });

  const { data: relatedData } = useQuery({
    queryKey: ['public-news-related', article?.category],
    queryFn: () => getPublicNewsList({ category: article?.category, limit: 4 }),
    enabled: Boolean(article?.category),
  });

  const relatedArticles = useMemo(() => {
    if (!relatedData?.items || !article) return [];
    return relatedData.items.filter((item) => item.id !== article.id).slice(0, 3);
  }, [relatedData, article]);

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

  const currentCommentCount = article
    ? Math.max(0, article.commentCount + (commentDelta.articleId === article.id ? commentDelta.delta : 0))
    : 0;

  const handleToggleLike = async () => {
    if (!article || isLiking) return;
    const nextLiked = !isLiked;
    const nextCount = Math.max(0, currentLikeCount + (nextLiked ? 1 : -1));
    setOptimisticLike({ articleId: article.id, liked: nextLiked, likeCount: nextCount });
    setNewsArticleLiked(article.id, nextLiked);
    setIsLiking(true);

    try {
      const res = await togglePublicNewsLike(article.slug, { action: nextLiked ? 'like' : 'unlike' });
      setOptimisticLike({ articleId: article.id, liked: nextLiked, likeCount: res.likeCount });
      queryClient.invalidateQueries({ queryKey: ['public-news-list'] });
    } catch (err) {
      setOptimisticLike({ articleId: article.id, liked: !nextLiked, likeCount: currentLikeCount });
      setNewsArticleLiked(article.id, !nextLiked);
      showErrorToast(err, 'Không thể cập nhật lượt yêu thích.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showSuccessToast('Đã sao chép liên kết bài viết!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-5">
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
        <p className="text-sm text-slate-500 mt-2">Bài viết này không tồn tại hoặc đã bị gỡ khỏi hệ thống.</p>
        <Link href="/news" className="inline-block mt-5">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>Quay lại trang Tin tức</Button>
        </Link>
      </div>
    );
  }

  const categoryBadge = NEWS_CATEGORY_BADGE_MAP[article.category] || {
    label: NEWS_CATEGORY_MAP[article.category] || article.category,
    variant: 'primary' as const,
  };
  const authorDisplayName = article.author?.fullName || article.author?.username || 'Ban biên tập XTTECH';
  const authorAvatarSrc = getFileUrl(article.author?.avatar) || undefined;
  const thumbnailSrc = getFileUrl(article.thumbnailUrl);

  return (
    <div className="bg-slate-50/40 min-h-screen pb-16">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/news" className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Tất cả tin tức</span>
          </Link>
          <div className="flex items-center gap-2">
            {article.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-white">
                <Sparkles className="w-3 h-3" /> Tiêu điểm
              </span>
            )}
            <Badge variant={categoryBadge.variant} size="md" pill>{categoryBadge.label}</Badge>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-8 lg:p-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">{article.title}</h1>

          <div className="mt-5 pb-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar src={authorAvatarSrc} name={authorDisplayName} size="md" />
              <div>
                <p className="text-sm font-bold text-slate-900">{authorDisplayName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono tabular-nums">{article.createdAt ? dayjs(article.createdAt).format('DD/MM/YYYY HH:mm') : '--'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 font-mono tabular-nums">
              <span className="inline-flex items-center gap-1.5" title="Lượt xem"><Eye className="w-4 h-4 text-slate-400" /> {article.viewCount}</span>
              <span className="inline-flex items-center gap-1.5" title="Lượt yêu thích"><Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-rose-500'}`} /> {currentLikeCount}</span>
              <a href="#comments" className="inline-flex items-center gap-1.5 hover:text-primary" title="Bình luận"><MessageSquare className="w-4 h-4 text-primary" /> {currentCommentCount}</a>
            </div>
          </div>

          {article.summary && (
            <div className="mt-6 p-4 sm:p-5 rounded-xl bg-primary/5 border-l-4 border-primary text-sm sm:text-base font-medium text-slate-700 leading-relaxed">{article.summary}</div>
          )}

          {thumbnailSrc && (
            <div className="mt-6 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
              <img src={thumbnailSrc} alt={article.title} className="w-full max-h-[480px] object-cover mx-auto" />
            </div>
          )}

          <div className={`mt-7 ${ARTICLE_HTML_CLASS}`} dangerouslySetInnerHTML={{ __html: sanitizedContent }} />

          <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={isLiking}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer border ${
                isLiked ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
              <span>{isLiked ? 'Đã yêu thích' : 'Thả tim bài viết'}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono tabular-nums bg-slate-100 text-slate-800">{currentLikeCount}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Đã sao chép liên kết' : 'Chia sẻ bài viết'}</span>
            </button>
          </div>

          <NewsCommentsSection
            slug={article.slug}
            articleId={article.id}
            commentCount={currentCommentCount}
            onCommentCountDelta={(delta) =>
              setCommentDelta((prev) => ({
                articleId: article.id,
                delta: (prev.articleId === article.id ? prev.delta : 0) + delta,
              }))
            }
          />
        </div>

        <NewsRelatedArticles articles={relatedArticles} />
      </article>
    </div>
  );
}
