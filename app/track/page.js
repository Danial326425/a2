// Server component — SEO metadata for /track, renders the client tracker.

import TrackClient from './TrackClient';
import { buildSEO } from '@/app/lib/seo';
import { config } from '@/config/config';

export const metadata = buildSEO({
  title:       'Order Tracking',
  description: `আপনার ${config.siteName} অর্ডারের সর্বশেষ অবস্থা জানতে মোবাইল নম্বর দিন। গত ৭ দিনের অর্ডার ট্র্যাক করা যায়।`,
  path:        '/track',
  type:        'website',
});

export default function Page() {
  return <TrackClient />;
}
