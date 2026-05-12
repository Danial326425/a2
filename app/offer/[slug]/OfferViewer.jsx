"use client";

import { useEffect, useState, useCallback } from 'react';
import CheckoutModal from '@/components/Landing/CheckoutModal';
import CheckoutSection from '@/components/Landing/CheckoutSection';

export default function OfferViewer({ html, css, name, slug, checkoutType = 'scroll' }) {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Toggle modal
  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // Setup click handlers for popup mode
  useEffect(() => {
    if (!mounted) return;

    const handleClick = (e) => {
      const button = e.target.closest('button, a');
      if (!button) return;

      const href = button.getAttribute('href') || '';
      const className = (button.className || '').toString().toLowerCase();
      const text = (button.textContent || '').toString().toLowerCase();
      const dataCta = button.getAttribute('data-cta') || '';

      const isCheckout =
        href.includes('#order') ||
        className.includes('cta') ||
        className.includes('order') ||
        className.includes('buy') ||
        className.includes('checkout') ||
        text.includes('অর্ডার') ||
        text.includes('order') ||
        text.includes('buy') ||
        dataCta === 'popup';

      if (isCheckout) {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [mounted, openModal]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white rounded-xl shadow-lg text-gray-600">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      <style>{css}</style>

      {/* Scroll mode styles */}
      {checkoutType === 'scroll' && (
        <style>{`
          html { scroll-behavior: smooth; }
          #order { scroll-margin-top: 80px; }
        `}</style>
      )}

      {/* Landing page content */}
      <div dangerouslySetInnerHTML={{ __html: html }} style={{ width: '100%', minHeight: '100vh' }} />

      {/* Scroll mode: Checkout Section at bottom */}
      {checkoutType === 'scroll' && (
        <div id="order">
          <CheckoutSection />
        </div>
      )}

      {/* Popup mode: Checkout Modal with same page */}
      {checkoutType === 'popup' && (
        <CheckoutModal open={showModal} onClose={closeModal} slug={slug} />
      )}
    </div>
  );
}