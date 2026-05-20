import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import CheckoutSection from './CheckoutSection';
import CheckoutModal from './CheckoutModal';
import Footer from '../../components/Footer';

// Prevent horizontal overflow on the landing page.
// NOTE: rendered BEFORE the page CSS so template rules can override these.
const globalFix = `
  html, body, #root { max-width:100%; overflow-x:hidden; }
  .lp-html-wrap { overflow-x:hidden; }
  .lp-html-wrap * { box-sizing:border-box; }
  img, video { max-width:100%; }
  .lp-html-wrap img { display:block; max-width:100%; }
  .baby-hero-slider { position:relative; overflow:hidden; width:100%; }
  .baby-hero-slider-track { position:relative; width:100%; height:100%; }
  .baby-hero-slider img, .baby-hero-slide { display:block; width:100%; height:100%; object-fit:cover; object-position:center top; }
  .baby-hero-slide { position:absolute; inset:0; opacity:0; transition:opacity .7s ease; }
  .baby-hero-slide.is-active { position:relative; opacity:1; }
  .baby-hero-slider-dots { position:absolute; left:50%; bottom:16px; z-index:2; display:flex; gap:8px; transform:translateX(-50%); }
  .baby-hero-slider-dot { width:9px; height:9px; border:0; border-radius:9999px; background:rgba(255,255,255,.55); cursor:pointer; padding:0; }
  .baby-hero-slider-dot.is-active { width:24px; background:#fff; }
  .baby-shell:not(.baby-order-section) { background:linear-gradient(135deg,#fff7fb 0%,#fff 46%,#e8f7ff 100%) !important; }
  .baby-hero-stage { width:100%; max-width:1320px !important; margin-left:auto; margin-right:auto; padding:72px 32px 82px; display:grid; grid-template-columns:minmax(440px,560px) minmax(520px,620px) !important; justify-content:center; gap:28px 46px; align-items:center; }
  @media (max-width:1023px) { .baby-hero-stage { grid-template-columns:1fr !important; gap:40px; padding:64px 24px; text-align:center; } .baby-hero-image-frame, .baby-hero-actions { grid-column:auto; grid-row:auto; } }
  @media (max-width:767px) { .baby-hero-stage { padding:48px 16px; gap:28px; } .baby-hero-crop-box { height:min(78vw,340px); max-width:100%; border-width:5px; border-radius:22px; } }
`;

// Skeleton card component
const SkeletonBlock = ({ h = 'h-6', w = 'w-full', rounded = 'rounded-lg' }) => (
  <div className={`${h} ${w} ${rounded} bg-gray-200 animate-pulse`} />
);

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Hero skeleton */}
    <div className="bg-white px-4 pt-8 pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2 space-y-4">
          <SkeletonBlock h="h-5" w="w-24" rounded="rounded-full" />
          <SkeletonBlock h="h-10" />
          <SkeletonBlock h="h-10" w="w-3/4" />
          <SkeletonBlock h="h-5" w="w-full" />
          <SkeletonBlock h="h-5" w="w-4/5" />
          <div className="flex gap-3 pt-2">
            <SkeletonBlock h="h-12" w="w-36" rounded="rounded-xl" />
            <SkeletonBlock h="h-12" w="w-36" rounded="rounded-xl" />
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <SkeletonBlock h="h-72" rounded="rounded-2xl" />
        </div>
      </div>
    </div>
    {/* Trust badges skeleton */}
    <div className="py-8 px-4 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <SkeletonBlock key={i} h="h-20" rounded="rounded-xl" />)}
    </div>
    {/* Content blocks */}
    <div className="px-4 pb-10 max-w-4xl mx-auto space-y-4">
      {[1,2,3,4,5].map(i => <SkeletonBlock key={i} h="h-5" w={i % 2 === 0 ? 'w-5/6' : 'w-full'} />)}
    </div>
  </div>
);

const LandingPage = () => {
  const { slug } = useParams();

  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [loading, setLoading] = useState(true);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [checkoutDisplayMode, setCheckoutDisplayMode] = useState('scroll');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/landing-pages/offer/${slug}`);
        if (cancelled) return;
        const d = res.data.data;
        setHtml(d.html || '');
        setCss(d.css || '');
        setCheckoutDisplayMode(d.checkout_display_mode || 'scroll');
      } catch {
        // silently fail — CheckoutSection still renders
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

// Show sticky CTA after user scrolls 300px
  useEffect(() => {
    const onScroll = () => setShowStickyCTA(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCTA = useCallback(() => {
    if (checkoutDisplayMode === 'popup') {
      setModalOpen(true);
    } else {
      const el = document.getElementById('order');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [checkoutDisplayMode]);

  // Intercept all href="#order" clicks inside the GrapesJS HTML when in popup mode
  useEffect(() => {
    if (checkoutDisplayMode !== 'popup') return;
    const handler = (e) => {
      const link = e.target.closest('a[href="#order"]');
      if (link) {
        e.preventDefault();
        setModalOpen(true);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [checkoutDisplayMode]);

  if (loading) return <LoadingSkeleton />;

  return (
    <>
      <style>{globalFix}</style>
      <style>{css}</style>

      {/* Backend-rendered HTML content */}
      {html && (
        <div className="lp-html-wrap" dangerouslySetInnerHTML={{ __html: html }} />
      )}

      {/* Checkout / Order section — only in scroll mode */}
      {checkoutDisplayMode === 'scroll' && <CheckoutSection noVariants />}

      <Footer />

      {/* Modal — only in popup mode */}
      {checkoutDisplayMode === 'popup' && (
        <CheckoutModal open={modalOpen} onClose={() => setModalOpen(false)} />
      )}

      {/* Sticky mobile CTA — only visible on small screens after scroll */}
      {showStickyCTA && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
          <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-3 shadow-2xl">
            <button
              onClick={handleCTA}
              className="w-full py-3.5 rounded-xl font-bold text-white text-base
                         bg-gradient-to-r from-emerald-500 to-green-600
                         shadow-lg active:scale-95 transition-transform"
            >
              🛒 এখনই অর্ডার করুন — ক্যাশ অন ডেলিভারি
            </button>
          </div>
        </div>
      )}

      {/* Spacer so sticky CTA doesn't cover footer content on mobile */}
      <div className="h-20 lg:hidden" />
    </>
  );
};

export default LandingPage;
