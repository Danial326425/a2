import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingCart, Shield, Truck, Check } from 'lucide-react';
import CheckoutSection from './CheckoutSection';

const ModalHeader = ({ onClose }) => (
  <div className="sticky top-0 z-10 flex items-center justify-between
                  bg-gradient-to-r from-emerald-600 to-green-600 text-white
                  px-4 py-3 flex-shrink-0 shadow-lg">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
        <ShoppingCart size={16} className="text-white" />
      </div>
      <p className="font-bold text-base">নিরাপদ অর্ডার করুন</p>
    </div>
    <button
      onClick={onClose}
      aria-label="Close"
      className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center
                 hover:bg-white/30 active:scale-90 transition-all"
    >
      <X size={18} className="text-white" />
    </button>
  </div>
);

const CheckoutModal = ({ open, onClose }) => {
  const savedScrollY = useRef(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    savedScrollY.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY.current}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, savedScrollY.current);
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
      />

      {/* ── Mobile: Full Screen Bottom Sheet ─────────────────────────── */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="fixed inset-x-0 bottom-0 z-[101] md:hidden rounded-t-3xl"
        style={{ height: '95dvh', maxHeight: '95dvh' }}
      >
        <div className="h-full flex flex-col bg-white rounded-t-3xl overflow-hidden shadow-2xl">
          <ModalHeader onClose={onClose} />

          {/* Mobile Trust Badges */}
          <div className="bg-emerald-50 px-4 py-2 flex items-center justify-center gap-4 text-xs text-emerald-700 border-b border-emerald-100">
            <span className="flex items-center gap-1"><Shield size={12} />নিরাপদ পেমেন্ট</span>
            <span className="flex items-center gap-1"><Truck size={12} />দ্রুত ডেলিভারি</span>
            <span className="flex items-center gap-1"><Check size={12} />সহজ রিটার্ন</span>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-safe">
            <CheckoutSection isModal onClose={onClose} />
          </div>
        </div>
      </motion.div>

      {/* ── Desktop: Centered Card ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClose}
        className="hidden md:flex fixed inset-0 z-[101] items-center justify-center p-4"
      >
        <div
          className="relative bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '92dvh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Desktop Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">অর্ডার ফর্ম</p>
                <p className="text-xs text-emerald-100">পণ্য হাতে পেয়ে পেমেন্ট করুন</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield size={14} />
                <span>নিরাপদ</span>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <CheckoutSection isModal onClose={onClose} />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default CheckoutModal;