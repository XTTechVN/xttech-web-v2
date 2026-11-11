import { cache } from 'react';
import type { Metadata } from 'next';
import type { NewsArticle } from '@/types';
import { BASE_API_URL, BASE_MINIO_URL, BASE_SITE_URL } from './app';
import { NEWS_CATEGORY_MAP } from './news';

export const SEO_CONFIG = {
  siteName: 'XTTECH',
  legalName: 'Công ty Cổ phần Công nghệ XTTECH',
  brandTitle: 'XTTECH — Phần mềm ERP Quản trị Sản xuất Nhôm Kính & Xây dựng',
  defaultTitle: 'XTTECH — Phần mềm ERP Sản xuất Nhôm Kính & Xây dựng',
  titleTemplate: '%s | XTTECH',
  defaultDescription:
    'Hệ sinh thái ERP đám mây chuyên sâu cho doanh nghiệp sản xuất nhôm kính, cơ khí và thi công công trình: Thiết kế cửa CAD 2D/3D, bóc tách BOM, báo giá & chấm công GPS.',
  locale: 'vi_VN',
  language: 'vi-VN',
  themeColor: '#045863',
  defaultOgImage: '/opengraph-image',
  defaultOgImageWidth: 1200,
  defaultOgImageHeight: 630,
  logoPath: '/favicon/android-chrome-512x512.png',
  contactEmail: 'contact@xttech.vn',
  contactPhone: '0776 710 766',
  addressCountry: 'VN',
} as const;

export const SEO_KEYWORDS: string[] = [
  'XTTECH',
  'XTTECH ERP',
  'phần mềm ERP nhôm kính',
  'phần mềm sản xuất cửa nhôm kính',
  'thiết kế cửa nhôm CAD 2D 3D',
  'bóc tách vật tư BOM cửa nhôm',
  'phần mềm tính giá cửa nhôm kính',
  'quản lý thi công công trình xây dựng',
  'chấm công GPS công trình',
  'bảo hành điện tử QR cửa nhôm',
  'XMS Fab',
  'XMS Build',
  'XMS Biz',
];

export const PAGE_SEO_META = {
  home: {
    title: 'XTTECH — Phần mềm ERP Sản xuất Nhôm Kính & Xây dựng',
    description:
      'Giải pháp ERP chuyên sâu cho xưởng nhôm kính & nhà thầu xây dựng: Thiết kế cửa CAD 2D/3D, bóc tách vật tư BOM chính xác, báo giá nhanh và chấm công GPS.',
    path: '/',
    useAbsoluteTitle: true,
  },
  pricing: {
    title: 'Bảng Giá Phần Mềm ERP Nhôm Kính & Xây Dựng',
    description:
      'Bảng giá minh bạch các gói XMS Fab, XMS Build và XMS Biz. Hỗ trợ gói dùng thử miễn phí trọn đời cho xưởng mới, đào tạo tận nơi và hoàn tiền 100% trong 7 ngày.',
    path: '/pricing',
  },
  news: {
    title: 'Tin Tức & Kiến Thức Quản Trị Sản Xuất Nhôm Kính',
    description:
      'Cập nhật kiến thức kỹ thuật cửa nhôm kính, giải pháp bóc tách BOM CAD 2D/3D, kinh nghiệm quản lý xưởng sản xuất, thi công công trình và tin tức mới từ XTTECH.',
    path: '/news',
  },
  privacy: {
    title: 'Chính Sách Bảo Mật Dữ Liệu Doanh Nghiệp',
    description:
      'Cam kết bảo mật bản vẽ kỹ thuật CAD 2D/3D, định mức bóc tách vật tư BOM, bảng báo giá, dữ liệu GPS chấm công công trình và hồ sơ khách hàng trên XTTECH ERP.',
    path: '/privacy-policy',
  },
  terms: {
    title: 'Điều Khoản Sử Dụng Dịch Vụ Nền Tảng XTTECH',
    description:
      'Quy định sử dụng hệ sinh thái XMS Fab, XMS Build, XMS Biz, cơ chế hạn mức gói cước, quyền sở hữu dữ liệu doanh nghiệp và cam kết chất lượng SLA 99.9% từ XTTECH.',
    path: '/terms-of-service',
  },
  refund: {
    title: 'Chính Sách Hoàn Tiền & Bảo Hành Dịch Vụ',
    description:
      'Chính sách dùng thử miễn phí trọn đời, cam kết hoàn tiền 100% trong 7 ngày đầu, hoàn phí theo tỷ lệ Pro-rata cho gói năm và bảo hành đào tạo tận xưởng XTTECH.',
    path: '/refund-policy',
  },
} as const;

export const NO_INDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export function isProductionIndexingAllowed(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true') return true;
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'false') return false;
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') return false;
  return BASE_SITE_URL === 'https://xttech.vn' || BASE_SITE_URL === 'https://www.xttech.vn';
}

export function buildCanonicalUrl(path = '/'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return cleanPath === '/' ? BASE_SITE_URL : `${BASE_SITE_URL}${cleanPath}`;
}

export function resolveSeoImageUrl(rawUrl?: string | null): string {
  if (!rawUrl || !rawUrl.trim()) {
    return `${BASE_SITE_URL}${SEO_CONFIG.defaultOgImage}`;
  }
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/favicon/') || trimmed === '/opengraph-image' || trimmed.startsWith('/images/')) {
    return `${BASE_SITE_URL}${trimmed}`;
  }
  const cleanMinio = BASE_MINIO_URL.replace(/\/+$/, '');
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cleanMinio}${normalizedPath}`;
}

export function stripHtmlToPlainText(html?: string | null, maxLength = 160): string {
  if (!html) return '';
  const plain = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildPageMetadata(params: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
  noIndex?: boolean;
  useAbsoluteTitle?: boolean;
}): Metadata {
  const canonicalUrl = buildCanonicalUrl(params.path);
  const ogImageUrl = resolveSeoImageUrl(params.image);
  const isDefaultOg = !params.image || !params.image.trim();
  const fullShareTitle = params.title.includes(SEO_CONFIG.siteName)
    ? params.title
    : `${params.title} | ${SEO_CONFIG.siteName}`;

  return {
    title: params.useAbsoluteTitle ? { absolute: params.title } : params.title,
    description: params.description,
    keywords: params.keywords ?? SEO_KEYWORDS,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: params.type ?? 'website',
      locale: SEO_CONFIG.locale,
      siteName: SEO_CONFIG.siteName,
      url: canonicalUrl,
      title: fullShareTitle,
      description: params.description,
      images: [
        isDefaultOg
          ? {
              url: ogImageUrl,
              width: SEO_CONFIG.defaultOgImageWidth,
              height: SEO_CONFIG.defaultOgImageHeight,
              alt: params.title,
            }
          : {
              url: ogImageUrl,
              alt: params.title,
            },
      ],
      ...(params.type === 'article'
        ? {
            publishedTime: params.publishedTime,
            modifiedTime: params.modifiedTime,
            authors: params.authors,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullShareTitle,
      description: params.description,
      images: [ogImageUrl],
    },
    ...(params.noIndex ? NO_INDEX_METADATA : {}),
  };
}

export function buildHomeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_SITE_URL}/#organization`,
        name: SEO_CONFIG.siteName,
        legalName: SEO_CONFIG.legalName,
        url: BASE_SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_SITE_URL}${SEO_CONFIG.logoPath}`,
          width: 512,
          height: 512,
        },
        description: SEO_CONFIG.defaultDescription,
        address: {
          '@type': 'PostalAddress',
          addressCountry: SEO_CONFIG.addressCountry,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_SITE_URL}/#website`,
        url: BASE_SITE_URL,
        name: SEO_CONFIG.brandTitle,
        inLanguage: SEO_CONFIG.language,
        publisher: {
          '@id': `${BASE_SITE_URL}/#organization`,
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${BASE_SITE_URL}/#software`,
        name: 'XTTECH ERP (XMS Fab • XMS Build • XMS Biz)',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, iOS, Android',
        url: BASE_SITE_URL,
        description: PAGE_SEO_META.home.description,
        publisher: {
          '@id': `${BASE_SITE_URL}/#organization`,
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'VND',
          description: 'Gói Khởi Nghiệp miễn phí trọn đời cho xưởng mới (tối đa 3 nhân sự)',
          url: buildCanonicalUrl('/pricing'),
        },
        featureList: [
          'Thiết kế cửa nhôm kính CAD 2D & mô phỏng 3D trực quan',
          'Bóc tách định mức vật tư (BOM) thanh nhôm, kính, phụ kiện chính xác',
          'Lập báo giá, hợp đồng và ký số điện tử trực tuyến',
          'Quản lý kho vật tư, lệnh sản xuất và tem QR bảo hành điện tử',
          'Chấm công GPS công trình và quản trị nhân sự tiền lương',
        ],
      },
    ],
  };
}

export function buildPricingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${buildCanonicalUrl('/pricing')}#webpage`,
        url: buildCanonicalUrl('/pricing'),
        name: `${PAGE_SEO_META.pricing.title} | ${SEO_CONFIG.siteName}`,
        description: PAGE_SEO_META.pricing.description,
        inLanguage: SEO_CONFIG.language,
        isPartOf: { '@id': `${BASE_SITE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: BASE_SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Bảng giá', item: buildCanonicalUrl('/pricing') },
        ],
      },
    ],
  };
}

export function buildNewsListingJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${buildCanonicalUrl('/news')}#collection`,
        url: buildCanonicalUrl('/news'),
        name: `${PAGE_SEO_META.news.title} | ${SEO_CONFIG.siteName}`,
        description: PAGE_SEO_META.news.description,
        inLanguage: SEO_CONFIG.language,
        isPartOf: { '@id': `${BASE_SITE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: BASE_SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Tin tức', item: buildCanonicalUrl('/news') },
        ],
      },
    ],
  };
}

export function buildNewsArticleJsonLd(article: NewsArticle) {
  const articleUrl = buildCanonicalUrl(`/news/${encodeURIComponent(article.slug)}`);
  const imageUrl = resolveSeoImageUrl(article.thumbnailUrl);
  const personName = article.author?.fullName || article.author?.username || null;
  const categoryName = NEWS_CATEGORY_MAP[article.category] || article.category;
  const description =
    article.summary?.trim() || stripHtmlToPlainText(article.content, 155) || PAGE_SEO_META.news.description;

  const authorEntity = personName
    ? {
        '@type': 'Person',
        name: personName,
      }
    : {
        '@type': 'Organization',
        name: SEO_CONFIG.siteName,
        url: BASE_SITE_URL,
      };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        '@id': `${articleUrl}#article`,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl,
        },
        headline: article.title,
        description,
        image: [imageUrl],
        articleSection: categoryName,
        inLanguage: SEO_CONFIG.language,
        datePublished: article.createdAt,
        dateModified: article.updatedAt || article.createdAt,
        author: authorEntity,
        publisher: {
          '@type': 'Organization',
          name: SEO_CONFIG.siteName,
          url: BASE_SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${BASE_SITE_URL}${SEO_CONFIG.logoPath}`,
            width: 512,
            height: 512,
          },
        },
        articleBody: stripHtmlToPlainText(article.content, 500),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: BASE_SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Tin tức', item: buildCanonicalUrl('/news') },
          { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
        ],
      },
    ],
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path),
    })),
  };
}

export const fetchPublicArticleBySlugForSeo = cache(async (slug: string): Promise<NewsArticle | null> => {
  if (!slug) return null;
  try {
    const response = await fetch(
      `${BASE_API_URL}/api/v1/news/public/${encodeURIComponent(slug)}?countView=false`,
      {
        next: { revalidate: 60 },
        headers: { Accept: 'application/json' },
      },
    );
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object') return null;
    if ('data' in payload && payload.data && typeof payload.data === 'object') {
      return payload.data as NewsArticle;
    }
    return payload as NewsArticle;
  } catch {
    return null;
  }
});

export async function fetchAllPublicArticlesForSitemap(): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = [];
  const limit = 100;
  let offset = 0;
  let hasNext = true;
  let safetyCounter = 0;
  const maxPages = 50;

  while (hasNext && safetyCounter < maxPages) {
    safetyCounter += 1;
    try {
      const response = await fetch(
        `${BASE_API_URL}/api/v1/news/public?offset=${offset}&limit=${limit}`,
        {
          next: { revalidate: 3600 },
          headers: { Accept: 'application/json' },
        },
      );
      if (!response.ok) {
        console.warn(`[sitemap] Fetch public news failed with status ${response.status} at offset=${offset}`);
        break;
      }
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== 'object') break;

      const root =
        'data' in payload && payload.data && typeof payload.data === 'object'
          ? (payload.data as { items?: unknown; meta?: { next?: boolean } })
          : (payload as { items?: unknown; meta?: { next?: boolean } });

      const pageItems = Array.isArray(root.items) ? (root.items as NewsArticle[]) : [];
      allArticles.push(...pageItems);

      hasNext = Boolean(root.meta?.next) && pageItems.length > 0;
      offset += limit;
    } catch (error) {
      console.warn('[sitemap] Error fetching public news for sitemap:', error);
      break;
    }
  }

  return allArticles;
}
