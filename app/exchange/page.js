// Server component — SEO metadata for /exchange, renders the client form.

import ExchangeClient from './ExchangeClient';
import { buildSEO } from '@/app/lib/seo';
import { config } from '@/config/config';

export const metadata = buildSEO({
  title:       'Exchange Request',
  description: `${config.siteName} — অর্ডার করা পণ্য এক্সচেঞ্জ করতে অনুরোধ পাঠান।`,
  path:        '/exchange',
  type:        'website',
});

export default function Page() {
  return <ExchangeClient />;
}
