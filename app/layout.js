import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import OrderProvider from './context/OrderContext';
import HeaderProvider from "./context/HeaderContext";
import ProductProvider from "./context/ProductsContext";
import ClientLayout from "./components/ClientLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import TopProgressBar from "./components/TopProgressBar";
import { buildSEO } from "./lib/seo";
import { getGlobalSeo } from "./lib/seo/getGlobalSeo";
import { getHomepageData } from "./lib/getHomepageData";
import { config } from "@/config/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Storage URL helper — the SeoSetting rows hold relative storage paths
 *  (e.g. "seo/favicon.ico"); the public CDN URL is `${backendUrl}/storage/{path}`. */
const storageUrl = (p) => (p ? `${config.backendUrl}/storage/${p}` : null);

/**
 * Build the Next.js `metadata.icons` object from the dashboard's icon fields.
 * Field keys come straight from FaviconTab: `favicon`, `favicon_png`,
 * `apple_touch_icon`, `android_chrome_192`, `android_chrome_512`.
 *
 * We declare each icon with its own MIME type and explicit `sizes` so the
 * browser picks the right one for the tab/title bar instead of falling back
 * to the URL filename (which is what causes the ".ico" path to leak into
 * the browser tab when the icon link is malformed).
 */
function buildIcons(seo) {
  const iconLinks = [];

  if (seo.favicon) {
    iconLinks.push({
      url: storageUrl(seo.favicon),
      type: 'image/x-icon',
      sizes: 'any',
    });
  }
  if (seo.favicon_png) {
    iconLinks.push({
      url: storageUrl(seo.favicon_png),
      type: 'image/png',
      sizes: '32x32',
    });
  }
  if (seo.android_chrome_192) {
    iconLinks.push({
      url: storageUrl(seo.android_chrome_192),
      type: 'image/png',
      sizes: '192x192',
    });
  }
  if (seo.android_chrome_512) {
    iconLinks.push({
      url: storageUrl(seo.android_chrome_512),
      type: 'image/png',
      sizes: '512x512',
    });
  }

  return {
    icon: iconLinks.length ? iconLinks : undefined,
    ...(seo.apple_touch_icon
      ? { apple: { url: storageUrl(seo.apple_touch_icon), sizes: '180x180' } }
      : {}),
    // `shortcut` is the legacy IE / old-Chrome alias for `icon` — Next still
    // emits it as `<link rel="shortcut icon">`. Point at the highest-quality
    // PNG when available so old browsers also get a sharp icon.
    ...(seo.favicon_png || seo.favicon
      ? { shortcut: storageUrl(seo.favicon_png || seo.favicon) }
      : {}),
  };
}

/** Translate the dashboard's split `robots_index` / `robots_follow` toggles
 *  into Next.js's structured `robots` field. */
function buildRobots(seo) {
  // Defaults: index=true, follow=true. Falsy ("0", "false", false) → opt out.
  const index  = seo.robots_index  === '0' || seo.robots_index  === 0 || seo.robots_index  === false ? false : true;
  const follow = seo.robots_follow === '0' || seo.robots_follow === 0 || seo.robots_follow === false ? false : true;
  return { index, follow };
}

/**
 * Root metadata. Pulls every value from the dashboard's SEO Settings row
 * (page_key='global'), with brand-level fallbacks for anything blank.
 * Per-page `metadata` / `generateMetadata` exports continue to override
 * title/description fields they care about via the `template` below.
 */
export async function generateMetadata() {
  const seo = await getGlobalSeo();

  // Field key map (dashboard → metadata):
  //   site_title → brand name used in template + title.default
  //   title      → default meta title (search results)
  //   description, keywords  → straight pass-through
  //   author_name, theme_color, language
  //   robots_index + robots_follow → robots
  //   favicon / favicon_png / apple_touch_icon / android_chrome_* → icons
  //   og_*, twitter_*, facebook_app_id, *_verification → social/tracking
  const brand        = seo.site_title || config.siteName;
  const defaultTitle = seo.title || seo.site_title || brand;
  // title_template lets admin fully control the title pattern.
  // Uses %s as placeholder — e.g. "%s | My Shop", "%s – BD Store", or just "%s".
  // Falls back to "Page | Brand" if not set.
  const rawTemplate   = (seo.title_template || '').trim();
  // Normalize: if admin typed "Online Shop" or "| Online Shop" (no %s),
  // auto-build "%s | Online Shop" so the page title always comes first.
  const titleTemplate = rawTemplate
    ? (rawTemplate.includes('%s')
        ? rawTemplate
        : `%s | ${rawTemplate.replace(/^\s*[|–-]+\s*/, '')}`)
    : `%s | ${brand}`;

  const base = buildSEO({
    title:       defaultTitle,
    description: seo.description,
    keywords:    seo.keywords ? String(seo.keywords).split(',').map(k => k.trim()).filter(Boolean) : undefined,
    image:       seo.og_image,
    path:        '/',
    type:        seo.og_type || 'website',
    siteUrl:     seo.site_url, // dashboard-set canonical base (fixes localhost og:image)
  });

  return {
    ...base,
    // Override the title field with `default + template` so child pages
    // produce the configured pattern automatically.
    title: {
      default: defaultTitle,
      template: titleTemplate,
    },
    ...(seo.author_name ? { authors: [{ name: seo.author_name }] } : {}),
    ...(seo.theme_color ? { themeColor: seo.theme_color } : {}),
    robots: buildRobots(seo),

    icons: buildIcons(seo),

    // NOTE: facebook-domain-verification is emitted directly in the <head> in
    // RootLayout (the metadata.verification.other API is unreliable here).
    ...((seo.google_verification || seo.bing_verification)
      ? {
          verification: {
            ...(seo.google_verification ? { google: seo.google_verification } : {}),
            ...(seo.bing_verification ? { other: { 'msvalidate.01': seo.bing_verification } } : {}),
          },
        }
      : {}),

    openGraph: {
      ...base.openGraph,
      title: seo.og_title || defaultTitle,
      description: seo.og_description || base.openGraph.description,
    },

    twitter: {
      ...base.twitter,
      // Dashboard saves `twitter_card`, `twitter_handle`, `twitter_creator` —
      // do NOT rename these to camelCase, they're DB field_keys.
      card: seo.twitter_card || base.twitter.card,
      title: seo.twitter_title || defaultTitle,
      description: seo.twitter_description || base.twitter.description,
      ...(seo.twitter_image ? { images: [storageUrl(seo.twitter_image)] } : {}),
      ...(seo.twitter_handle ? { site: seo.twitter_handle } : {}),
      ...(seo.twitter_creator ? { creator: seo.twitter_creator } : {}),
    },

    ...(seo.facebook_app_id
      ? { other: { 'fb:app_id': seo.facebook_app_id } }
      : {}),
  };
}

export default async function RootLayout({ children }) {
  const [seo, homepageData] = await Promise.all([
    getGlobalSeo(),
    getHomepageData(),
  ]);
  const lang = seo.language || 'en';

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect to the backend image origin — product/category images load
            from here via next/image, so opening the connection early shaves LCP. */}
        <link rel="preconnect" href={config.backendUrl} />
        <link rel="dns-prefetch" href={config.backendUrl} />

        {/* Facebook/Meta domain verification — rendered directly in <head> so
            it's in the static server HTML (Meta rejects JS-injected tags). Set
            from Dashboard → SEO Settings → Verification. The Next.js metadata
            `verification.other` API is unreliable in this build, so we emit the
            tag here instead. */}
        {seo.facebook_domain_verification && (
          <meta name="facebook-domain-verification" content={seo.facebook_domain_verification} />
        )}

        {/* JSON-LD structured data from dashboard (advanced SEO field).
            Kept as a raw <script type="application/ld+json"> tag so search
            engines parse it; not executed JS so XSS-safe by content-type. */}
        {seo.json_ld && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: seo.json_ld }}
          />
        )}

        {/* Admin-defined custom header scripts (raw HTML allowed — trusted
            input, gated behind admin auth in the dashboard). Loaded after
            interactive so pixels can fire on first paint. */}
        {seo.header_scripts && (
          <Script
            id="custom-header-scripts"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: seo.header_scripts }}
          />
        )}

        {/* Google Analytics 4 — dashboard stores `ga4_id` + an `ga4_active`
            kill-switch so admin can disable without deleting the ID. */}
        {seo.ga4_id && seo.ga4_active !== '0' && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${seo.ga4_id}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${seo.ga4_id}');
            `}</Script>
          </>
        )}

        {/* Google Tag Manager (head snippet). */}
        {seo.gtm_id && seo.gtm_active !== '0' && (
          <Script id="gtm-script" strategy="afterInteractive">{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${seo.gtm_id}');
          `}</Script>
        )}

        {/* Facebook Pixel init + PageView are handled entirely by
            PixelPageView (client component inside ClientLayout).
            It reads pixel IDs from ProductContext (/homepage-data → pixels table),
            initialises fbq once, and fires PageView on every route change
            including the initial mount — no duplicate, no miss. */}
      </head>

      <body className="min-h-full flex flex-col">
        {/* Instant navigation feedback on every internal tap (mobile-friendly). */}
        <TopProgressBar />

        {/* GTM noscript fallback (required by GTM spec). */}
        {seo.gtm_id && seo.gtm_active !== '0' && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${seo.gtm_id}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        <ErrorBoundary>
          <CartProvider>
            <ProductProvider seed={homepageData}>
              <HeaderProvider>
                <OrderProvider>
                  <ClientLayout>
                    {children}
                  </ClientLayout>
                </OrderProvider>
              </HeaderProvider>
            </ProductProvider>
          </CartProvider>
        </ErrorBoundary>

        {/* Admin-defined custom footer scripts (e.g. third-party chat
            widgets). Lazy-loaded so they never block initial paint. */}
        {seo.footer_scripts && (
          <Script
            id="custom-footer-scripts"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{ __html: seo.footer_scripts }}
          />
        )}
      </body>
    </html>
  );
}
