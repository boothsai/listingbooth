import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Protect agent CRM, admin hub, API routes, and OAuth callbacks from crawlers
        disallow: [
          '/api/',
          '/agent',
          '/admin',
          '/auth/callback',
        ],
      },
      {
        // Allow OpenAI to index public listings for visibility, but block API cost routes
        userAgent: 'GPTBot',
        disallow: ['/api/', '/agent', '/admin'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
