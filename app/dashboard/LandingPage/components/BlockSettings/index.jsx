"use client";

// Block settings components
// This folder contains individual block setting panels

export const blockSettingsRegistry = {
  // Map of block types to their settings component
  'announcement-bar': null,
  'hero-product': null,
  'product-features': null,
  'product-gallery': null,
  'testimonials': null,
  'size-guide': null,
  'countdown-timer': null,
  'offer-banner': null,
  'pricing-section': null,
  'faq-section': null,
  'cta-section': null,
  'checkout-section': null,
  'footer': null,
};

// Get settings for a block
export function getBlockSettings(blockType) {
  return blockSettingsRegistry[blockType] || null;
}

// Register a custom settings component
export function registerBlockSettings(blockType, component) {
  blockSettingsRegistry[blockType] = component;
}