// Server component — checkout pages MUST be noindex (we don't want them
// surfaced in Google) and have minimal metadata. UI lives in CheckoutClient.

import CheckoutClient from './CheckoutClient';
import { buildSEO } from '@/app/lib/seo';

export const metadata = buildSEO({
  title:       'Checkout',
  description: 'Complete your order — cash on delivery available.',
  path:        '/checkout',
  noindex:     true,
});

export default function Page() {
  return <CheckoutClient />;
}
