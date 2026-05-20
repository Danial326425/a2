// Server component — thank-you confirmation pages MUST be noindex (no order
// confirmations should leak into search results). UI in ThankYouClient.

import ThankYouClient from './ThankYouClient';
import { buildSEO } from '@/app/lib/seo';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  // Sanitize the slug for the canonical URL (admin-side IDs sometimes carry
  // curly braces from URL templates; strip them so canonical stays clean).
  const safeSlug = (slug || '').replace(/[{}]/g, '');
  return buildSEO({
    title:       'Thank You — Order Confirmed',
    description: 'Your order has been received. We will contact you shortly to confirm delivery.',
    path:        `/thankyou/${safeSlug}`,
    noindex:     true,
  });
}

export default function Page() {
  return <ThankYouClient />;
}
