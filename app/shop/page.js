// Server component — SEO metadata for /shop, renders ShopClient for the UI.

import ShopClient from './ShopClient';
import { buildSEO } from '@/app/lib/seo';
import { config } from '@/config/config';

export const metadata = buildSEO({
  title:       'Shop All Products',
  description: `Browse the full ${config.siteName} catalog — clothing, accessories, lifestyle. Cash on delivery, doorstep shipping across Bangladesh.`,
  path:        '/shop',
  type:        'website',
});

export default function Page() {
  return <ShopClient />;
}
