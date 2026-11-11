import type { MetadataRoute } from 'next';
import { BASE_SITE_URL, isProductionIndexingAllowed } from '@/config';

const DISALLOWED_INTERNAL_PATHS = ['/app/', '/api/', '/qr/', '/sign/'];

const AI_SEARCH_USER_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'Google-Extended',
  'PerplexityBot',
  'ClaudeBot',
  'Claude-SearchBot',
  'Applebot-Extended',
];

export default function robots(): MetadataRoute.Robots {
  if (!isProductionIndexingAllowed()) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llms.txt'],
        disallow: DISALLOWED_INTERNAL_PATHS,
      },
      ...AI_SEARCH_USER_AGENTS.map((agent) => ({
        userAgent: agent,
        allow: ['/', '/llms.txt', '/pricing', '/news'],
        disallow: DISALLOWED_INTERNAL_PATHS,
      })),
    ],
    sitemap: `${BASE_SITE_URL}/sitemap.xml`,
  };
}
