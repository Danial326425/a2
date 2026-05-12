import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import CheckoutSection from './CheckoutSection';

const ModalHeader = ({ onClose }) => (
  <div className="sticky top-0 z-10 flex items-center justify-between
                  bg-white/95 backdrop-blur-sm border-b border-gray-100
                  px-4 py-2.5 flex-shrink-0">
    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
      🛒 অর্ডার করুন
    </p>
    <button
      onClick={onClose}
      aria-label="Close"
      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center
                 hover:bg-gray-200 active:scale-90 transition-all"
    >
      <X size={16} className="text-gray-600" />
    </button>
  </div>
);

const CheckoutModal = ({ open, onClose }) => {
  const savedScrollY = useRef(0);

  // ESC key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Body scroll lock — position:fixed trick works on iOS Safari too
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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* ── Mobile: bottom sheet ─────────────────────────── */}
          <motion.div
            key="modal-mobile"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-[101] md:hidden"
            style={{ maxHeight: '92dvh' }}
          >
            <div
              className="bg-white rounded-t-3xl flex flex-col overflow-hidden"
              style={{ maxHeight: '92dvh' }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </div>
              <ModalHeader onClose={onClose} />
              {/* Scrollable body */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch', height: 'calc(92dvh - 120px)' }}
              >
                <CheckoutSection isModal noVariants onClose={onClose} />
              </div>
            </div>
          </motion.div>

          {/* ── Desktop: centered card ───────────────────────── */}
          <motion.div
            key="modal-desktop"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="hidden md:flex fixed inset-0 z-[101] items-center justify-center p-4"
          >
            <div
              className="relative bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: '90dvh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader onClose={onClose} />
              {/* Scrollable body */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch', height: 'calc(90dvh - 60px)' }}
              >
                <CheckoutSection isModal noVariants onClose={onClose} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
