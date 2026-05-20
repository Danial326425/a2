// Server component — exports SEO metadata + JSON-LD for the storefront
// homepage. All interactive UI lives in HomeClient (a sibling client comp).

import HomeClient from './HomeClient';
import JsonLd from './components/seo/JsonLd';
import { buildSEO } from './lib/seo';
import { getGlobalSeo } from './lib/seo/getGlobalSeo';
import { config } from '@/config/config';

export async function generateMetadata() {
  const seo = await getGlobalSeo();
  // Dashboard field keys: `site_title` (brand), `title` (meta title),
  // `description`, `keywords` — match exactly what BasicSeoTab persists.
  return buildSEO({
    title:       seo.title       || seo.site_title || `${config.siteName} — Cash on Delivery Shopping in Bangladesh`,
    description: seo.description || `Browse ${config.siteName}'s catalog of clothing, accessories, and lifestyle products. Fast cash-on-delivery shipping across Bangladesh.`,
    keywords:    seo.keywords ? String(seo.keywords).split(',').map(k => k.trim()).filter(Boolean) : undefined,
    image:       seo.og_image,
    path:        '/',
    type:        'website',
  });
}

export default async function Page() {
  const seo = await getGlobalSeo();
  const orgName = seo.site_title || config.siteName;
  const orgLogo = seo.og_image
    ? `${config.backendUrl}/storage/${seo.og_image}`
    : `${config.siteUrl}/og-default.png`;

  // Organization schema — populates Google's brand panel.
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: orgName,
    url: config.siteUrl,
    logo: orgLogo,
    ...(seo.twitter_username || seo.facebook_app_id
      ? {
          sameAs: [
            seo.twitter_username && `https://twitter.com/${String(seo.twitter_username).replace('@', '')}`,
            seo.facebook_app_id && `https://facebook.com/${seo.facebook_app_id}`,
          ].filter(Boolean),
        }
      : {}),
  };

  // WebSite schema with SearchAction — enables the sitelinks search box in
  // Google results.
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: orgName,
    url: config.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.siteUrl}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      <HomeClient />
    </>
  );
}
