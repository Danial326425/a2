import { notFound } from 'next/navigation';
import OfferViewer from './OfferViewer';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${apiUrl}/landing-pages/offer/${slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return { title: 'Page Not Found' };
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      return { title: 'Page Not Found' };
    }

    const pageName = result.data.name || 'Landing Page';

    return {
      title: pageName,
      description: pageName,
    };
  } catch (error) {
    console.error('Metadata error:', error);
    return { title: 'Page Not Found' };
  }
}

export default async function OfferPage({ params }) {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  try {
    const response = await fetch(`${apiUrl}/landing-pages/offer/${slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      notFound();
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      notFound();
    }

    const page = result.data;

    // Add data-checkout-type to body if not present
    let html = page.html;
    const bodyMatch = html.match(/<body([^>]*)>/i);
    if (bodyMatch) {
      if (!bodyMatch[1].includes('data-checkout-type')) {
        const checkoutType = page.checkout_type || 'scroll';
        html = html.replace(/<body([^>]*)>/i, `<body$1 data-checkout-type="${checkoutType}">`);
      }
    }

    return (
      <OfferViewer
        html={html}
        css={page.css}
        name={page.name}
        slug={page.slug}
        checkoutType={page.checkout_type || 'scroll'}
      />
    );
  } catch (error) {
    console.error('Page load error:', error);
    notFound();
  }
}