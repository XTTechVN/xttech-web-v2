import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  LIKED_NEWS_COOKIE_KEY,
  NEWS_CATEGORY_MAP,
  NO_INDEX_METADATA,
  PAGE_SEO_META,
  SEO_KEYWORDS,
  buildNewsArticleJsonLd,
  buildPageMetadata,
  fetchPublicArticleBySlugForSeo,
  parseLikedNewsIds,
  serializeJsonLd,
  stripHtmlToPlainText,
} from '@/config';
import { NewsPublicDetail } from './_components/news-public-detail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let decodedSlug: string;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    return {
      ...NO_INDEX_METADATA,
      title: 'Không tìm thấy bài viết',
    };
  }

  const article = await fetchPublicArticleBySlugForSeo(decodedSlug);

  if (!article) {
    return {
      ...NO_INDEX_METADATA,
      title: 'Không tìm thấy bài viết',
    };
  }

  const description =
    article.summary?.trim() ||
    stripHtmlToPlainText(article.content, 155) ||
    PAGE_SEO_META.news.description;
  const categoryLabel = NEWS_CATEGORY_MAP[article.category] || article.category;
  const authorName = article.author?.fullName || article.author?.username || 'Ban biên tập XTTECH';

  return buildPageMetadata({
    title: article.title,
    description,
    path: `/news/${encodeURIComponent(article.slug)}`,
    image: article.thumbnailUrl,
    type: 'article',
    publishedTime: article.createdAt,
    modifiedTime: article.updatedAt || article.createdAt,
    authors: [authorName],
    keywords: [...SEO_KEYWORDS, categoryLabel, article.title],
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let decodedSlug: string;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    notFound();
  }

  const article = await fetchPublicArticleBySlugForSeo(decodedSlug);

  if (!article) {
    notFound();
  }

  const cookieStore = await cookies();
  const rawLikedCookie = cookieStore.get(LIKED_NEWS_COOKIE_KEY)?.value;
  const likedIds = parseLikedNewsIds(rawLikedCookie);
  const initialIsLiked = likedIds.includes(article.id);

  const jsonLd = buildNewsArticleJsonLd(article);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <NewsPublicDetail
        slug={decodedSlug}
        initialArticle={article}
        initialIsLiked={initialIsLiked}
      />
    </main>
  );
}
