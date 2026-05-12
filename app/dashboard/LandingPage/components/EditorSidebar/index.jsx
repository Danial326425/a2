"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { X, Layout, Palette, Box, ChevronDown, ChevronRight, Search, GripVertical } from 'lucide-react';
import BlocksPanel from './BlocksPanel';
import GlobalStylePanel from './GlobalStylePanel';

/**
 * EditorSidebar - Professional right-side editor panel
 * Provides blocks library, global styles, and component settings
 */
export default function EditorSidebar({ editor, onClose }) {
  const [activeTab, setActiveTab] = useState('blocks'); // 'blocks' | 'styles' | 'settings'
  const [editorInstance, setEditorInstance] = useState(editor);

  // Update editor when prop changes
  useEffect(() => {
    if (editor) setEditorInstance(editor);
  }, [editor]);

  // Also check window for editor
  useEffect(() => {
    const checkEditor = () => {
      if (window.__landingPageEditor && !editorInstance) {
        setEditorInstance(window.__landingPageEditor);
      }
    };
    checkEditor();
    const interval = setInterval(checkEditor, 500);
    return () => clearInterval(interval);
  }, [editorInstance]);

  // Get selected component info
  const selectedComponent = useMemo(() => {
    if (!editorInstance) return null;
    const selected = editorInstance.getSelected();
    if (!selected) return null;
    return {
      component: selected,
      name: selected.getName(),
      tagName: selected.get('tagName'),
      classes: selected.getClasses(),
      attributes: selected.getAttributes(),
    };
  }, [editorInstance]);

  // Tab configuration
  const tabs = [
    { id: 'blocks', label: 'Blocks', icon: Box },
    { id: 'styles', label: 'Styles', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Layout, disabled: !selectedComponent },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-800">Editor Panel</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium
              transition-colors border-b-2
              ${activeTab === tab.id
                ? 'text-rose-600 border-rose-600 bg-rose-50/50'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'blocks' && (
          <BlocksPanel editor={editorInstance} />
        )}
        {activeTab === 'styles' && (
          <GlobalStylePanel editor={editorInstance} />
        )}
        {activeTab === 'settings' && selectedComponent && (
          <ComponentSettingsPanel editor={editorInstance} component={selectedComponent} />
        )}
      </div>
    </div>
  );
}

// Component Settings Panel (for selected components)
function ComponentSettingsPanel({ editor, component }) {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateAttribute = (key, value) => {
    if (component.component) {
      component.component.addAttributes({ [key]: value });
    }
  };

  const sections = [
    {
      id: 'general',
      label: 'General',
      content: (
        <div className="space-y-3 p-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Component ID</label>
            <input
              type="text"
              value={component.attributes?.id || ''}
              onChange={(e) => updateAttribute('id', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="unique-id"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Custom Class</label>
            <input
              type="text"
              value={component.classes?.filter(c => !c.startsWith('gjs-')).join(' ') || ''}
              onChange={(e) => {
                const newClasses = e.target.value.split(' ').filter(Boolean);
                component.component.setClass(newClasses.join(' '));
              }}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="custom-class"
            />
          </div>
        </div>
      )
    },
    {
      id: 'attributes',
      label: 'Data Attributes',
      content: (
        <div className="space-y-3 p-3">
          <p className="text-xs text-gray-500">Add custom data attributes for JavaScript functionality</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
            <input
              type="text"
              value={component.attributes?.['data-product-name'] || ''}
              onChange={(e) => updateAttribute('data-product-name', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md"
              placeholder="Product Name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Price</label>
            <input
              type="number"
              value={component.attributes?.['data-product-price'] || ''}
              onChange={(e) => updateAttribute('data-product-price', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CTA Type</label>
            <select
              value={component.attributes?.['data-cta'] || 'scroll'}
              onChange={(e) => updateAttribute('data-cta', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md"
            >
              <option value="scroll">Scroll to Checkout</option>
              <option value="popup">Open Popup</option>
            </select>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="overflow-y-auto h-full pb-20">
      {/* Component Info */}
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded">
            {component.tagName?.toUpperCase()}
          </span>
          <span className="text-sm font-medium text-gray-800 capitalize">
            {component.name || component.tagName}
          </span>
        </div>
      </div>

      {/* Settings Sections */}
      {sections.map((section) => (
        <div key={section.id} className="border-b border-gray-100">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">{section.label}</span>
            {expandedSections[section.id] ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </button>
          {expandedSections[section.id] && section.content}
        </div>
      ))}
    </div>
  );
}