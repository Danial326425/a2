'use client';

/**
 * Floating "social proof" review toasts for the product page. Cycles through
 * approved reviews — one slides in (bottom-left), stays a few seconds, slides
 * out, pauses, then the next appears. Auto-stops once the on-page Review
 * section (#reviews) scrolls into view so it doesn't compete with the real list.
 */

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const SHOW_MS = 5500;   // how long each toast stays
const GAP_MS = 5000;    // pause between toasts (next review after 5s)
const FIRST_DELAY_MS = 3000; // start within 3s of page load

// Elements that should hide the toast while they're on screen.
const BLOCK_IDS = ['reviews', 'confirm-order-btn'];

function inViewport(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false; // hidden / not laid out
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
}

// True while the user is actively filling a form field (input/textarea/select
// or a contenteditable). We suppress the toast then so it never lands on top of
// the order form while someone is typing.
function isFormFocused() {
  if (typeof document === 'undefined') return false;
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

function isBlocked() {
  if (typeof document === 'undefined') return false;
  if (isFormFocused()) return true;
  return BLOCK_IDS.some(id => inViewport(document.getElementById(id)));
}

function maskPhone(phone) {
  if (!phone) return '';
  const d = String(phone).replace(/\D/g, '');
  if (d.length <= 7) return d;
  return d.slice(0, 5) + '*'.repeat(d.length - 7) + d.slice(-2);
}

function timeAgo(dateStr) {
  if (!dateStr) return 'সম্প্রতি';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (Number.isNaN(diff) || diff < 0) return 'সম্প্রতি';
  const d = Math.floor(diff / 86400);
  if (d >= 1) return `${d} দিন আগে`;
  const h = Math.floor(diff / 3600);
  if (h >= 1) return `${h} ঘণ্টা আগে`;
  const m = Math.floor(diff / 60);
  if (m >= 1) return `${m} মিনিট আগে`;
  return 'এইমাত্র';
}

const Star = ({ filled }) => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill={filled ? '#FBBF24' : '#E5E7EB'}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const AVATAR_COLORS = [
  'from-rose-500 to-pink-600', 'from-emerald-500 to-green-600',
  'from-indigo-500 to-violet-600', 'from-amber-500 to-orange-600',
  'from-sky-500 to-blue-600', 'from-fuchsia-500 to-purple-600',
];

export default function ReviewNotifications({ productId, apiUrl }) {
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(null); // the review object being shown (or null)
  const idxRef = useRef(0);
  const timersRef = useRef([]);

  // Fetch approved reviews once.
  useEffect(() => {
    if (!productId) return;
    let alive = true;
    axios.get(`${apiUrl}/products/${productId}/reviews`)
      .then(r => { if (alive) setReviews((r.data.reviews || []).filter(x => x.review)); })
      .catch(() => {});
    return () => { alive = false; };
  }, [productId, apiUrl]);

  // Hide the toast whenever the Review section OR the order-confirm button is
  // on screen — checked live (the button is conditionally rendered, so a static
  // IntersectionObserver can't reliably track it).
  useEffect(() => {
    const onScroll = () => { if (isBlocked()) setCurrent(null); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // focusin → hide instantly the moment a form field gains focus.
    document.addEventListener('focusin', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('focusin', onScroll);
    };
  }, []);

  // The show/hide cycle.
  useEffect(() => {
    if (!reviews.length) return;
    const clearAll = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

    const showNext = () => {
      if (isBlocked()) {
        // Reviews section / order button on screen — skip, retry later.
        timersRef.current.push(setTimeout(showNext, GAP_MS));
        return;
      }
      const r = reviews[idxRef.current % reviews.length];
      idxRef.current += 1;
      setCurrent(r);
      timersRef.current.push(setTimeout(() => {
        setCurrent(null);
        timersRef.current.push(setTimeout(showNext, GAP_MS));
      }, SHOW_MS));
    };

    timersRef.current.push(setTimeout(showNext, FIRST_DELAY_MS));
    return clearAll;
  }, [reviews]);

  const r = current;

  return (
    <div className="fixed bottom-20 left-3 z-40 pointer-events-none sm:bottom-6 sm:left-4 max-w-[88vw] w-[330px]">
      <AnimatePresence>
        {r && (
          <motion.div
            key={r.id ?? idxRef.current}
            initial={{ opacity: 0, x: -40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="pointer-events-none relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-3.5 overflow-hidden"
          >
            <button
              onClick={() => setCurrent(null)}
              aria-label="বন্ধ করুন"
              className="pointer-events-auto absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg leading-none p-1 -m-1"
            >×</button>

            <div className="flex items-center gap-1 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ✓ যাচাইকৃত রিভিউ
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[(r.id || 0) % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow`}>
                {(r.reviewer_name || '?').trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-900 truncate">{r.reviewer_name}</span>
                </div>
                {r.reviewer_phone && (
                  <span className="text-[11px] text-gray-400 tracking-wide">{r.reviewer_phone}</span>
                )}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} filled={i <= (r.rating || 0)} />)}
                </div>
                {r.review && (
                  <p className="text-xs text-gray-600 leading-snug mt-1 line-clamp-2">“{r.review}”</p>
                )}
              </div>
            </div>

            {/* progress bar */}
            <motion.div
              key={`bar-${r.id ?? idxRef.current}`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: SHOW_MS / 1000, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
