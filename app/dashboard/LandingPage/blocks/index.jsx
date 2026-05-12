"use client";

// Reusable Block Library for Landing Page Editor
// These blocks can be dragged, dropped, and customized

export const BLOCK_REGISTRY = {
  // Hero & Layout
  'announcement-bar': {
    name: 'Announcement Bar',
    category: 'hero',
    icon: '📢',
    defaultStyles: {
      backgroundColor: '#f43f5e',
      color: '#ffffff',
      fontSize: '13px',
      fontWeight: 700,
      textAlign: 'center',
      padding: '10px 16px',
    },
  },
  'hero-product': {
    name: 'Hero Product',
    category: 'hero',
    icon: '🛍️',
    defaultStyles: {
      padding: '48px 32px',
      backgroundColor: '#fffdfb',
    },
  },
  'header-nav': {
    name: 'Header Navigation',
    category: 'hero',
    icon: '📋',
    defaultStyles: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: '#ffffff',
      padding: '12px 20px',
    },
  },

  // Product Sections
  'product-features': {
    name: 'Product Features',
    category: 'product',
    icon: '✨',
    defaultStyles: {
      padding: '48px 20px',
      backgroundColor: '#f8fafc',
    },
  },
  'product-gallery': {
    name: 'Product Gallery',
    category: 'product',
    icon: '🖼️',
    defaultStyles: {
      padding: '48px 20px',
    },
  },
  'size-guide': {
    name: 'Size Guide',
    category: 'product',
    icon: '📏',
    defaultStyles: {
      padding: '48px 20px',
      backgroundColor: '#f8fafc',
    },
  },

  // Reviews & Trust
  'testimonials': {
    name: 'Customer Reviews',
    category: 'social',
    icon: '⭐',
    defaultStyles: {
      padding: '48px 20px',
    },
  },
  'trust-badges': {
    name: 'Trust Badges',
    category: 'social',
    icon: '🛡️',
    defaultStyles: {
      padding: '32px 20px',
      backgroundColor: '#f8fafc',
    },
  },

  // Marketing
  'countdown-timer': {
    name: 'Countdown Timer',
    category: 'marketing',
    icon: '⏰',
    defaultStyles: {
      padding: '32px 20px',
      background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 45%, #f97316 100%)',
    },
  },
  'offer-banner': {
    name: 'Offer Banner',
    category: 'marketing',
    icon: '🎉',
    defaultStyles: {
      padding: '32px 20px',
      background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #f43f5e 100%)',
    },
  },
  'pricing-section': {
    name: 'Pricing Section',
    category: 'marketing',
    icon: '💰',
    defaultStyles: {
      padding: '48px 20px',
    },
  },
  'comparison-section': {
    name: 'Comparison Table',
    category: 'marketing',
    icon: '📊',
    defaultStyles: {
      padding: '48px 20px',
      backgroundColor: '#f8fafc',
    },
  },

  // Conversion
  'cta-section': {
    name: 'CTA Section',
    category: 'conversion',
    icon: '🖱️',
    defaultStyles: {
      padding: '64px 20px',
      background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 45%, #f97316 100%)',
    },
  },
  'benefits-list': {
    name: 'Benefits List',
    category: 'conversion',
    icon: '✅',
    defaultStyles: {
      padding: '48px 20px',
    },
  },
  'faq-section': {
    name: 'FAQ Section',
    category: 'conversion',
    icon: '❓',
    defaultStyles: {
      padding: '48px 20px',
      backgroundColor: '#f8fafc',
    },
  },
  'video-section': {
    name: 'Video Section',
    category: 'conversion',
    icon: '🎬',
    defaultStyles: {
      padding: '48px 20px',
    },
  },

  // Checkout & Footer
  'checkout-section': {
    name: 'Checkout Section',
    category: 'checkout',
    icon: '🛒',
    isRequired: true,
    defaultStyles: {
      padding: '48px 20px',
      backgroundColor: '#f8fafc',
    },
  },
  'footer': {
    name: 'Footer',
    category: 'checkout',
    icon: '📍',
    defaultStyles: {
      padding: '32px 20px',
      backgroundColor: '#0f172a',
      color: '#d1d5db',
    },
  },
};

// Get block by type
export function getBlock(type) {
  return BLOCK_REGISTRY[type] || null;
}

// Get blocks by category
export function getBlocksByCategory(category) {
  return Object.entries(BLOCK_REGISTRY)
    .filter(([, block]) => block.category === category)
    .map(([type, block]) => ({ type, ...block }));
}

// Get all categories
export function getCategories() {
  const categories = [
    { id: 'hero', label: 'Hero & Header', icon: '📱' },
    { id: 'product', label: 'Product Sections', icon: '🛍️' },
    { id: 'social', label: 'Reviews & Trust', icon: '⭐' },
    { id: 'marketing', label: 'Marketing & Offers', icon: '🎯' },
    { id: 'conversion', label: 'Conversion Elements', icon: '🎯' },
    { id: 'checkout', label: 'Checkout & Footer', icon: '🛒' },
  ];
  return categories;
}

// Validate page has required blocks
export function validatePageStructure(html) {
  const hasCheckout = html.includes('id="order"') || html.includes('data-block="checkout-section"');
  return {
    hasCheckout,
    warnings: hasCheckout ? [] : ['Page should have a checkout section'],
  };
}