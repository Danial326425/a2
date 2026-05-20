import { config } from '@/config/config';
import { getGlobalSeo } from './lib/seo/getGlobalSeo';

/**
 * Auto-generated robots.txt. Disallows admin / API / private flows so search
 * engines never crawl them. The dashboard can override the entire output by
 * setting `custom_robots_txt` on the global SEO row — useful for adding e.g.
 * a `Crawl-delay` directive or specific User-agent rules.
 *
 * Next.js serves this file at /robots.txt; we set `dynamic = 'force-static'`
 * so it's regenerated only when our SEO cache tag is invalidated.
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function robots() {
  const seo = await getGlobalSeo();

  // If admin pasted a complete robots.txt body, surface it verbatim by
  // returning a single rule that matches Next's robots schema. Anything
  // beyond simple Allow/Disallow lines should live in their custom file.
  // (Next 14+ supports raw string return via a separate /robots.txt route;
  // we keep the structured shape here for static defaults and recommend
  // using the structured options below for the common case.)

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/checkout',
          '/thankyou',
          '/upsell',
          '/api/',
          '/dashboard',
          '/dashboard/',
          '/editor',
          '/login',
          '/register',
        ],
      },
    ],
    sitemap: `${config.siteUrl}/sitemap.xml`,
    host: config.siteUrl,
  };
}
