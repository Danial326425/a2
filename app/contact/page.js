// Server component — SEO metadata for /contact, renders ContactClient.

import ContactClient from './ContactClient';
import { buildSEO } from '@/app/lib/seo';
import { config } from '@/config/config';

export const metadata = buildSEO({
  title:       'Contact Us',
  description: `Get in touch with ${config.siteName} — questions, support, partnerships, feedback. We typically reply within a few hours.`,
  path:        '/contact',
  type:        'website',
});

export default function Page() {
  return <ContactClient />;
}
