"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Palette, Type, Layout, Monitor, Tablet, Smartphone, RotateCcw } from 'lucide-react';

// Font families
const FONT_FAMILIES = [
  { label: 'Nunito', value: "'Nunito', sans-serif" },
  { label: 'Baloo 2', value: "'Baloo 2', cursive" },
  { label: 'Hind Siliguri', value: "'Hind Siliguri', sans-serif" },
  { label: 'Noto Sans Bengali', value: "'Noto Sans Bengali', sans-serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Roboto', value: "'Roboto', sans-serif" },
  { label: 'Open Sans', value: "'Open Sans', sans-serif" },
];

// Color presets
const COLOR_PRESETS = {
  primary: [
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
  ],
  neutral: [
    { name: 'White', value: '#ffffff' },
    { name: 'Gray 50', value: '#f8fafc' },
    { name: 'Gray 100', value: '#f1f5f9' },
    { name: 'Gray 200', value: '#e2e8f0' },
    { name: 'Gray 300', value: '#cbd5e1' },
    { name: 'Gray 500', value: '#64748b' },
    { name: 'Gray 700', value: '#334155' },
    { name: 'Gray 900', value: '#0f172a' },
    { name: 'Black', value: '#000000' },
  ],
};

// Container widths
const CONTAINER_WIDTHS = [
  { label: 'Full Width', value: '100%' },
  { label: '1200px', value: '1200px' },
  { label: '1024px', value: '1024px' },
  { label: '768px', value: '768px' },
];

/**
 * GlobalStylePanel - Global style settings for landing pages
 */
export default function GlobalStylePanel({ editor }) {
  const [activeSection, setActiveSection] = useState('typography');
  const [activePreview, setActivePreview] = useState('desktop');
  const [styles, setStyles] = useState({
    fontFamily: "'Nunito', sans-serif",
    headingFont: "'Baloo 2', cursive",
    primaryColor: '#f43f5e',
    backgroundColor: '#fffdfb',
    containerWidth: '100%',
    borderRadius: '16px',
  });

  const sections = [
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
  ];

  // Update CSS on editor
  const updateCSS = useCallback((css) => {
    if (!editor) return;
    const currentCss = editor.getCss();
    // Append or update CSS rules
    const newCss = currentCss + '\n' + css;
    editor.setStyle(newCss);
  }, [editor]);

  // Apply font family
  const applyFontFamily = useCallback((font) => {
    setStyles(prev => ({ ...prev, fontFamily: font }));
    updateCSS(`body { font-family: ${font}; }`);
  }, [updateCSS]);

  // Apply primary color
  const applyPrimaryColor = useCallback((color) => {
    setStyles(prev => ({ ...prev, primaryColor: color }));
    updateCSS(`
      .baby-conversion-cta, .btn-order-nav, .bg-rose-500, .text-rose-500 {
        background-color: ${color} !important;
        border-color: ${color} !important;
      }
      .text-rose-600 { color: ${color} !important; }
    `);
  }, [updateCSS]);

  // Apply background color
  const applyBackgroundColor = useCallback((color) => {
    setStyles(prev => ({ ...prev, backgroundColor: color }));
    updateCSS(`body, .baby-shell:not(.baby-order-section) { background-color: ${color} !important; }`);
  }, [updateCSS]);

  // Reset to defaults
  const resetStyles = useCallback(() => {
    setStyles({
      fontFamily: "'Nunito', sans-serif",
      headingFont: "'Baloo 2', cursive",
      primaryColor: '#f43f5e',
      backgroundColor: '#fffdfb',
      containerWidth: '100%',
      borderRadius: '16px',
    });
    // Remove custom styles
    if (editor) {
      const defaultCss = editor.getCss().split('\n')
        .filter(line => !line.includes('--custom-'))
        .join('\n');
      editor.setStyle(defaultCss);
    }
  }, [editor]);

  return (
    <div className="flex flex-col h-full">
      {/* Section Tabs */}
      <div className="flex border-b border-gray-200">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium
              transition-colors border-b-2
              ${activeSection === section.id
                ? 'text-rose-600 border-rose-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
              }
            `}
          >
            <section.icon size={14} />
            {section.label}
          </button>
        ))}
      </div>

      {/* Preview Device Selector */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs text-gray-500">Preview</span>
        <div className="flex items-center gap-1">
          {[
            { id: 'desktop', icon: Monitor, label: 'Desktop' },
            { id: 'tablet', icon: Tablet, label: 'Tablet' },
            { id: 'mobile', icon: Smartphone, label: 'Mobile' },
          ].map((device) => (
            <button
              key={device.id}
              onClick={() => setActivePreview(device.id)}
              title={device.label}
              className={`
                p-1.5 rounded transition-colors
                ${activePreview === device.id
                  ? 'bg-rose-100 text-rose-600'
                  : 'text-gray-400 hover:bg-gray-200'
                }
              `}
            >
              <device.icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Typography Section */}
        {activeSection === 'typography' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Body Font</label>
              <select
                value={styles.fontFamily}
                onChange={(e) => applyFontFamily(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Heading Font</label>
              <select
                value={styles.headingFont}
                onChange={(e) => {
                  setStyles(prev => ({ ...prev, headingFont: e.target.value }));
                  updateCSS(`.baby-heading, h1, h2, h3 { font-family: ${e.target.value} !important; }`);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Base Font Size</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="12"
                  max="20"
                  value="16"
                  onChange={(e) => updateCSS(`body { font-size: ${e.target.value}px; }`)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-10">16px</span>
              </div>
            </div>
          </div>
        )}

        {/* Colors Section */}
        {activeSection === 'colors' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Primary Color</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={styles.primaryColor}
                  onChange={(e) => applyPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={styles.primaryColor}
                  onChange={(e) => applyPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.primary.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => applyPrimaryColor(color.value)}
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Background Color</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={styles.backgroundColor}
                  onChange={(e) => applyBackgroundColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <input
                  type="text"
                  value={styles.backgroundColor}
                  onChange={(e) => applyBackgroundColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.neutral.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => applyBackgroundColor(color.value)}
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Text Colors</label>
              <div className="grid grid-cols-4 gap-2">
                {['#172033', '#48566a', '#64748b', '#ffffff'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateCSS(`.baby-heading, h1, h2, h3, p { color: ${color}; }`)}
                    className="w-full aspect-square rounded-lg border border-gray-200 shadow-sm hover:ring-2 hover:ring-rose-400"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Layout Section */}
        {activeSection === 'layout' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Container Width</label>
              <div className="grid grid-cols-2 gap-2">
                {CONTAINER_WIDTHS.map((width) => (
                  <button
                    key={width.value}
                    onClick={() => {
                      setStyles(prev => ({ ...prev, containerWidth: width.value }));
                      updateCSS(`.max-w-7xl, .baby-hero-stage { max-width: ${width.value} !important; }`);
                    }}
                    className={`
                      px-3 py-2 text-sm rounded-lg border transition-all
                      ${styles.containerWidth === width.value
                        ? 'border-rose-500 bg-rose-50 text-rose-600'
                        : 'border-gray-200 hover:border-rose-300'
                      }
                    `}
                  >
                    {width.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Border Radius</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={16}
                  onChange={(e) => {
                    const radius = `${e.target.value}px`;
                    updateCSS(`
                      .baby-card, .baby-hero-crop-box, .baby-btn, .baby-conversion-cta {
                        border-radius: ${radius} !important;
                      }
                    `);
                  }}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">16px</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Spacing Scale</label>
              <div className="grid grid-cols-4 gap-2">
                {['tight', 'normal', 'relaxed', 'loose'].map((spacing) => (
                  <button
                    key={spacing}
                    onClick={() => {
                      const spacingMap = { tight: '8px', normal: '16px', relaxed: '24px', loose: '32px' };
                      updateCSS(`.baby-shell { padding: ${spacingMap[spacing]}; }`);
                    }}
                    className="px-2 py-1.5 text-xs rounded border border-gray-200 hover:border-rose-300 capitalize"
                  >
                    {spacing}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Shadow Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'None', value: 'none' },
                  { label: 'Soft', value: '0 4px 12px rgba(0,0,0,0.1)' },
                  { label: 'Medium', value: '0 8px 24px rgba(0,0,0,0.15)' },
                  { label: 'Strong', value: '0 16px 48px rgba(0,0,0,0.2)' },
                ].map((shadow) => (
                  <button
                    key={shadow.value}
                    onClick={() => updateCSS(`.baby-card { box-shadow: ${shadow.value}; }`)}
                    className="px-2 py-1.5 text-xs rounded border border-gray-200 hover:border-rose-300 capitalize"
                    style={{ boxShadow: shadow.value === 'none' ? 'none' : shadow.value }}
                  >
                    {shadow.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={resetStyles}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <RotateCcw size={14} />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}