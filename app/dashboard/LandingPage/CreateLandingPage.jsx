"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  LinkIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { config } from '../../../config';

const CreateLandingPage = ({ onLandingPageCreated }) => {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    autoGenerateSlug: true,
    status: 'draft'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState('');

  const apiUrl = config.apiUrl;

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Handle name change
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name
    }));
    
    // Auto-generate slug if enabled
    if (formData.autoGenerateSlug) {
      const generatedSlug = generateSlug(name);
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  };

  // Handle slug change
  const handleSlugChange = (e) => {
    const slug = e.target.value;
    setFormData(prev => ({
      ...prev,
      slug,
      autoGenerateSlug: false
    }));
    setSlugAvailable(null);
  };

  // Check if slug is available
  const checkSlugAvailability = async () => {
    if (!formData.slug) {
      setSlugError('Please enter a slug');
      return;
    }

    if (formData.slug.length < 3) {
      setSlugError('Slug must be at least 3 characters');
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    setCheckingSlug(true);
    setSlugError('');

    try {
      // Check if slug exists by trying to fetch a page with this slug
      const response = await axios.get(`${apiUrl}/landing-pages/slug/${formData.slug}`);
      // If we get here, slug exists
      setSlugAvailable(false);
    } catch (error) {
      // If 404 error, slug is available
      if (error.response?.status === 404) {
        setSlugAvailable(true);
      } else {
        setSlugError('Error checking slug availability');
        setSlugAvailable(null);
      }
    } finally {
      setCheckingSlug(false);
    }
  };

  // Handle auto-generate toggle
  const handleAutoGenerateToggle = () => {
    const newAutoGenerate = !formData.autoGenerateSlug;
    setFormData(prev => ({
      ...prev,
      autoGenerateSlug: newAutoGenerate
    }));

    if (newAutoGenerate && formData.name) {
      const generatedSlug = generateSlug(formData.name);
      setFormData(prev => ({
        ...prev,
        slug: generatedSlug
      }));
      setSlugAvailable(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Please enter a page name');
      return;
    }
    
    if (formData.name.length < 3) {
      setError('Page name must be at least 3 characters');
      return;
    }
    
    if (!formData.slug) {
      setError('Please enter a slug');
      return;
    }
    
    if (formData.slug.length < 3) {
      setError('Slug must be at least 3 characters');
      return;
    }
    
    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Check slug availability before creating
      await checkSlugAvailability();
      
      if (slugAvailable === false) {
        setError('This slug is already taken. Please choose a different one.');
        setLoading(false);
        return;
      }
      
      // Create the page
      const response = await axios.post(`${apiUrl}/landing-pages`, {
        name: formData.name,
        slug: formData.slug,
        status: formData.status
      });
      
      if (response.data.success) {
        // Redirect to editor
        router.push(`/editor/${response.data.data.id}`);
      } else {
        setError(response.data.message || 'Failed to create page');
      }
    } catch (err) {
      console.error('Create page error:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to check slug when it changes (debounced)
  useEffect(() => {
    if (formData.slug && formData.slug.length >= 3 && !formData.autoGenerateSlug) {
      const timer = setTimeout(() => {
        checkSlugAvailability();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [formData.slug, formData.autoGenerateSlug]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
          disabled={loading}
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Landing Page
            </h1>
            <p className="text-gray-600">
              Fill in the details to create your landing page
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Page Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Page Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g., Summer Sale 2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                disabled={loading}
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-500">
                  {formData.name.length}/100 characters
                </div>
                {formData.name.length < 3 && formData.name.length > 0 && (
                  <div className="text-sm text-amber-600">
                    Minimum 3 characters
                  </div>
                )}
              </div>
            </div>

            {/* Slug Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Page Slug *
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleAutoGenerateToggle}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <input
                      type="checkbox"
                      checked={formData.autoGenerateSlug}
                      onChange={handleAutoGenerateToggle}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    Auto-generate from name
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="your-page-slug"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    slugAvailable === true 
                      ? 'border-green-300 bg-green-50' 
                      : slugAvailable === false 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  disabled={loading || formData.autoGenerateSlug}
                />
                
                {/* Slug Status Indicator */}
                {formData.slug && (
                  <div className="absolute right-3 top-3">
                    {checkingSlug ? (
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : slugAvailable === true ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : slugAvailable === false ? (
                      <XMarkIcon className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
              
              {/* Slug Messages */}
              <div className="mt-2 space-y-1">
                {slugError && (
                  <div className="text-sm text-red-600">{slugError}</div>
                )}
                
                {slugAvailable === true && (
                  <div className="text-sm text-green-600">✓ This slug is available</div>
                )}
                
                {slugAvailable === false && (
                  <div className="text-sm text-red-600">✗ This slug is already taken</div>
                )}
                
                <div className="text-sm text-gray-500">
                  Full URL: {window.location.origin}/preview/
                  <span className="text-gray-700 font-medium">{formData.slug || 'your-slug'}</span>
                </div>
              </div>
            </div>

            {/* Status Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Status
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
                  className={`p-4 border rounded-xl text-center transition-all duration-200 ${
                    formData.status === 'draft'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                  disabled={loading}
                >
                  <div className="font-medium">Draft</div>
                  <div className="text-sm opacity-75">Save privately</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'published' }))}
                  className={`p-4 border rounded-xl text-center transition-all duration-200 ${
                    formData.status === 'published'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                  disabled={loading}
                >
                  <div className="font-medium">Published</div>
                  <div className="text-sm opacity-75">Make public</div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center text-red-800">
                  <InformationCircleIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading || (slugAvailable === false) || !formData.name || !formData.slug}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Page...
                </>
              ) : (
                'Create Landing Page'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Page Name:</span> This is the display name for your landing page.
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Slug:</span> This will be used in your page URL. Must be unique and URL-friendly.
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Status:</span> Choose "Draft" to work privately, or "Published" to make it live immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLandingPage;