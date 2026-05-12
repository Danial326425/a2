"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, Layout, Image, Star, Ruler, HelpCircle, Timer, MousePointer, Tag, DollarSign, Table, CheckCircle, Play, Shield, Truck, ShoppingCart, MapPin } from 'lucide-react';

// Block definitions with categories
const BLOCK_CATEGORIES = [
  {
    id: 'hero',
    label: 'Hero & Header',
    icon: Layout,
    blocks: [
      {
        id: 'announcement-bar',
        label: 'Announcement Bar',
        icon: Tag,
        preview: '📢',
        defaultHtml: `<div class="premium-announce">🚚 সারাদেশে ফ্রি ডেলিভারি • ক্যাশ অন ডেলিভারি (COD) • ⭐ ১০,০০০+ সন্তুষ্ট পরিবার • ✅ ৭ দিন রিটার্ন পলিসি</div>`,
      },
      {
        id: 'hero-product',
        label: 'Hero Product',
        icon: Layout,
        preview: '🛍️',
        defaultHtml: `<section class="premium-hero-section">
  <div class="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
      <div class="product-img-main">
        <span class="badge-premium absolute top-4 left-4">⭐ বেস্ট সেলার</span>
        <span class="badge-premium absolute top-4 right-4">✨ নতুন কালেকশন</span>
        <span class="badge-premium absolute bottom-4 right-4 bg-rose-500">৩১% ছাড়</span>
        <img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80" alt="Product" />
      </div>
      <div class="space-y-4">
        <span class="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-500 rounded-full text-sm font-bold">
          🔥 সীমিত সময়ের অফার
        </span>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900">Premium Baby Product</h1>
        <p class="text-gray-600 text-lg">আপনার দৈনন্দিন প্রয়োজনের জন্য সেরা মানের পণ্য। দীর্ঘমেয়াদী ব্যবহারে টেকসই এবং আরামদায়ক।</p>
        <div class="flex items-baseline gap-3">
          <span class="text-3xl font-bold text-rose-600">৳১,২৯৯</span>
          <span class="text-lg text-gray-400 line-through">৳১,৮৯৯</span>
          <span class="px-2 py-1 bg-rose-100 text-rose-600 rounded text-sm font-bold">৩১% ছাড়</span>
        </div>
        <div class="flex flex-wrap gap-2 text-sm text-gray-600">
          <span>✅ বিনামূল্যে ডেলিভারি</span>
          <span>✅ ৭ দিনে রিটার্ন</span>
          <span>✅ নিরাপদ পেমেন্ট</span>
        </div>
        <a href="#order" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all">
          এখনই অর্ডার করুন 🛒
        </a>
      </div>
    </div>
  </div>
</section>`,
      },
      {
        id: 'header-nav',
        label: 'Header Navigation',
        icon: Layout,
        preview: '📋',
        defaultHtml: `<header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="text-2xl">🛍️</span>
      <span class="font-bold text-xl text-gray-900">MyStore</span>
    </div>
    <nav class="hidden md:flex items-center gap-6">
      <a href="#" class="text-gray-600 hover:text-rose-500 font-medium">Home</a>
      <a href="#" class="text-gray-600 hover:text-rose-500 font-medium">Products</a>
      <a href="#" class="text-gray-600 hover:text-rose-500 font-medium">About</a>
      <a href="#" class="text-gray-600 hover:text-rose-500 font-medium">Contact</a>
    </nav>
    <a href="#order" class="btn-order-nav">Order Now 🛒</a>
  </div>
</header>`,
      },
    ],
  },
  {
    id: 'product',
    label: 'Product Sections',
    icon: ShoppingCart,
    blocks: [
      {
        id: 'product-features',
        label: 'Product Features',
        icon: CheckCircle,
        preview: '✨',
        defaultHtml: `<section class="py-12 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4">
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Why Choose This Product?</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">🌟</div>
        <h3 class="font-bold text-lg text-gray-900 mb-2">Premium Quality</h3>
        <p class="text-gray-600">উন্নত মানের উপকরণ দিয়ে তৈরি, দীর্ঘদিন ব্যবহারযোগ্য</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">🔄</div>
        <h3 class="font-bold text-lg text-gray-900 mb-2">Easy Return</h3>
        <p class="text-gray-600">৭ দিনের মধ্যে ফ্রি রিটার্ন সুবিধা</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">🚚</div>
        <h3 class="font-bold text-lg text-gray-900 mb-2">Fast Delivery</h3>
        <p class="text-gray-600">সারাদেশে ২-৪ দিনের মধ্যে ডেলিভারি</p>
      </div>
    </div>
  </div>
</section>`,
      },
      {
        id: 'product-gallery',
        label: 'Product Gallery',
        icon: Image,
        preview: '🖼️',
        defaultHtml: `<section class="py-12">
  <div class="max-w-6xl mx-auto px-4">
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Product Gallery</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80" alt="Product 1" class="w-full h-full object-cover" />
      </div>
      <div class="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <img src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80" alt="Product 2" class="w-full h-full object-cover" />
      </div>
      <div class="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <img src="https://images.unsplash.com/photo-1519340333755-c1aa5571fd46?w=400&q=80" alt="Product 3" class="w-full h-full object-cover" />
      </div>
      <div class="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80" alt="Product 4" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</section>`,
      },
      {
        id: 'size-guide',
        label: 'Size Guide',
        icon: Ruler,
        preview: '📏',
        defaultHtml: `<section class="py-12 bg-gray-50">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Size Guide</h2>
    <div class="bg-white rounded-2xl shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-rose-50">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-bold text-gray-700">Size</th>
            <th class="px-6 py-3 text-left text-sm font-bold text-gray-700">Chest (in)</th>
            <th class="px-6 py-3 text-left text-sm font-bold text-gray-700">Length (in)</th>
            <th class="px-6 py-3 text-left text-sm font-bold text-gray-700">Recommended For</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr class="hover:bg-gray-50"><td class="px-6 py-3 font-medium">S</td><td class="px-6 py-3">36</td><td class="px-6 py-3">26</td><td class="px-6 py-3">Up to 55kg</td></tr>
          <tr class="hover:bg-gray-50"><td class="px-6 py-3 font-medium">M</td><td class="px-6 py-3">38</td><td class="px-6 py-3">27</td><td class="px-6 py-3">55-65kg</td></tr>
          <tr class="hover:bg-gray-50"><td class="px-6 py-3 font-medium">L</td><td class="px-6 py-3">40</td><td class="px-6 py-3">28</td><td class="px-6 py-3">65-75kg</td></tr>
          <tr class="hover:bg-gray-50"><td class="px-6 py-3 font-medium">XL</td><td class="px-6 py-3">42</td><td class="px-6 py-3">29</td><td class="px-6 py-3">75-85kg</td></tr>
        </tbody>
      </table>
    </div>
    <p class="text-center text-sm text-gray-500 mt-4">এখনও সমস্যা? আমাদের WhatsApp-এ যোগাযোগ করুন 📱</p>
  </div>
</section>`,
      },
    ],
  },
  {
    id: 'social',
    label: 'Reviews & Trust',
    icon: Star,
    blocks: [
      {
        id: 'testimonials',
        label: 'Customer Reviews',
        icon: Star,
        preview: '⭐',
        defaultHtml: `<section class="py-12">
  <div class="max-w-6xl mx-auto px-4">
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Customer Reviews</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center gap-1 text-yellow-400 mb-3">★★★★★</div>
        <p class="text-gray-600 mb-4">"অসাধারণ মানের পণ্য! ডেলিভারি খুব দ্রুত পেয়েছি। সত্যিই সন্তুষ্ট।"</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-lg">👩</div>
          <div>
            <p class="font-medium text-gray-900">রাহেলা বেগম</p>
            <p class="text-sm text-gray-500">ঢাকা</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center gap-1 text-yellow-400 mb-3">★★★★★</div>
        <p class="text-gray-600 mb-4">"অনেক দোকানে খুঁজেছি, এত সস্তায় এত ভালো পণ্য পাইনি।"</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">👨</div>
          <div>
            <p class="font-medium text-gray-900">করিম সাহেব</p>
            <p class="text-sm text-gray-500">চট্টগ্রাম</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center gap-1 text-yellow-400 mb-3">★★★★☆</div>
        <p class="text-gray-600 mb-4">"সাইজ একটু ছোট এসেছে, তবে মান খুবই ভালো।"</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg">👩</div>
          <div>
            <p class="font-medium text-gray-900">সালমা আক্তার</p>
            <p class="text-sm text-gray-500">সিলেট</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
      },
      {
        id: 'trust-badges',
        label: 'Trust Badges',
        icon: Shield,
        preview: '🛡️',
        defaultHtml: `<section class="py-8 bg-gray-50">
  <div class="max-w-4xl mx-auto px-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="flex flex-col items-center text-center p-4">
        <div class="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-3xl mb-3">🚚</div>
        <h4 class="font-bold text-gray-900">Free Shipping</h4>
        <p class="text-sm text-gray-500">All Bangladesh</p>
      </div>
      <div class="flex flex-col items-center text-center p-4">
        <div class="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-3xl mb-3">🔄</div>
        <h4 class="font-bold text-gray-900">Easy Returns</h4>
        <p class="text-sm text-gray-500">7 Days Return</p>
      </div>
      <div class="flex flex-col items-center text-center p-4">
        <div class="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-3xl mb-3">💳</div>
        <h4 class="font-bold text-gray-900">Secure Payment</h4>
        <p class="text-sm text-gray-500">COD Available</p>
      </div>
      <div class="flex flex-col items-center text-center p-4">
        <div class="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-3xl mb-3">📞</div>
        <h4 class="font-bold text-gray-900">24/7 Support</h4>
        <p class="text-sm text-gray-500">WhatsApp</p>
      </div>
    </div>
  </div>
</section>`,
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & Offers',
    icon: Tag,
    blocks: [
      {
        id: 'countdown-timer',
        label: 'Countdown Timer',
        icon: Timer,
        preview: '⏰',
        defaultHtml: `<section class="py-8 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">🔥 Limited Time Offer!</h2>
    <p class="text-white/90 mb-6">অফার শেষ হওয়ার আগেই অর্ডার করুন</p>
    <div class="flex justify-center gap-4" data-countdown="2024-12-31T23:59:59">
      <div class="bg-white rounded-xl px-4 py-3 min-w-[70px]">
        <div class="text-3xl font-bold text-rose-600" data-days>03</div>
        <div class="text-xs text-gray-500">Days</div>
      </div>
      <div class="bg-white rounded-xl px-4 py-3 min-w-[70px]">
        <div class="text-3xl font-bold text-rose-600" data-hours>12</div>
        <div class="text-xs text-gray-500">Hours</div>
      </div>
      <div class="bg-white rounded-xl px-4 py-3 min-w-[70px]">
        <div class="text-3xl font-bold text-rose-600" data-minutes>45</div>
        <div class="text-xs text-gray-500">Minutes</div>
      </div>
      <div class="bg-white rounded-xl px-4 py-3 min-w-[70px]">
        <div class="text-3xl font-bold text-rose-600" data-seconds>30</div>
        <div class="text-xs text-gray-500">Seconds</div>
      </div>
    </div>
  </div>
</section>`,
      },
      {
        id: 'offer-banner',
        label: 'Offer Banner',
        icon: Tag,
        preview: '🎉',
        defaultHtml: `<section class="py-8 bg-gradient-to-r from-yellow-400 via-orange-400 to-rose-400">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <span class="inline-block px-4 py-1 bg-white rounded-full text-sm font-bold text-rose-600 mb-4">🎊 SPECIAL OFFER</span>
    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Get 50% OFF Today!</h2>
    <p class="text-white/90 text-lg mb-6">Use code: <strong class="bg-white text-rose-600 px-2 py-1 rounded">FIRST50</strong></p>
    <a href="#order" class="inline-block px-8 py-3 bg-white text-rose-600 font-bold rounded-full hover:bg-gray-100 transition-colors">
      Claim Offer Now →
    </a>
  </div>
</section>`,
      },
      {
        id: 'pricing-section',
        label: 'Pricing Section',
        icon: DollarSign,
        preview: '💰',
        defaultHtml: `<section class="py-12">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Choose Your Package</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl shadow-md p-6 border-2 border-gray-100">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Basic</h3>
        <div class="text-3xl font-bold text-gray-900 mb-4">৳৯৯৯</div>
        <ul class="space-y-2 mb-6">
          <li class="flex items-center gap-2 text-gray-600"><span class="text-green-500">✓</span> 1 Product</li>
          <li class="flex items-center gap-2 text-gray-600"><span class="text-green-500">✓</span> Free Delivery</li>
          <li class="flex items-center gap-2 text-gray-400"><span>✗</span> Priority Support</li>
        </ul>
        <button class="w-full py-2 border-2 border-gray-300 rounded-full font-bold hover:border-rose-500 hover:text-rose-500 transition-colors">Select</button>
      </div>
      <div class="bg-rose-500 rounded-2xl shadow-lg p-6 text-white relative">
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-rose-600 text-xs font-bold rounded-full">POPULAR</span>
        <h3 class="text-lg font-bold mb-2">Premium</h3>
        <div class="text-3xl font-bold mb-4">৳১,২৯৯</div>
        <ul class="space-y-2 mb-6">
          <li class="flex items-center gap-2"><span class="text-yellow-300">✓</span> 1 Premium Product</li>
          <li class="flex items-center gap-2"><span class="text-yellow-300">✓</span> Free Delivery</li>
          <li class="flex items-center gap-2"><span class="text-yellow-300">✓</span> Priority Support</li>
          <li class="flex items-center gap-2"><span class="text-yellow-300">✓</span> Extra Bonus Item</li>
        </ul>
        <button class="w-full py-2 bg-white text-rose-500 font-bold rounded-full hover:bg-gray-100 transition-colors">Select</button>
      </div>
      <div class="bg-white rounded-2xl shadow-md p-6 border-2 border-gray-100">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Bundle</h3>
        <div class="text-3xl font-bold text-gray-900 mb-4">৳১,৯৯৯</div>
        <ul class="space-y-2 mb-6">
          <li class="flex items-center gap-2 text-gray-600"><span class="text-green-500">✓</span> 3 Products</li>
          <li class="flex items-center gap-2 text-gray-600"><span class="text-green-500">✓</span> Free Delivery</li>
          <li class="flex items-center gap-2 text-gray-600"><span class="text-green-500">✓</span> Priority Support</li>
        </ul>
        <button class="w-full py-2 border-2 border-gray-300 rounded-full font-bold hover:border-rose-500 hover:text-rose-500 transition-colors">Select</button>
      </div>
    </div>
  </div>
</section>`,
      },
      {
        id: 'comparison-section',
        label: 'Comparison Table',
        icon: Table,
        preview: '📊',
        defaultHtml: `<section class="py-12 bg-gray-50">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Why Choose Us?</h2>
    <div class="bg-white rounded-2xl shadow-md overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-rose-50">
            <th class="px-6 py-4 text-left font-bold text-gray-700">Features</th>
            <th class="px-6 py-4 text-center font-bold text-gray-700">Others</th>
            <th class="px-6 py-4 text-center font-bold text-rose-600 bg-rose-50">Our Store</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr><td class="px-6 py-3 text-gray-700">Quality</td><td class="px-6 py-3 text-center text-gray-400">Average</td><td class="px-6 py-3 text-center bg-rose-50"><span class="text-green-500 font-bold">Premium ⭐</span></td></tr>
          <tr><td class="px-6 py-3 text-gray-700">Price</td><td class="px-6 py-3 text-center text-gray-400">High</td><td class="px-6 py-3 text-center bg-rose-50"><span class="text-green-500 font-bold">Affordable 💰</span></td></tr>
          <tr><td class="px-6 py-3 text-gray-700">Delivery</td><td class="px-6 py-3 text-center text-gray-400">5-7 Days</td><td class="px-6 py-3 text-center bg-rose-50"><span class="text-green-500 font-bold">2-4 Days 🚚</span></td></tr>
          <tr><td class="px-6 py-3 text-gray-700">Return</td><td class="px-6 py-3 text-center text-gray-400">No Return</td><td class="px-6 py-3 text-center bg-rose-50"><span class="text-green-500 font-bold">7 Days ✅</span></td></tr>
          <tr><td class="px-6 py-3 text-gray-700">Support</td><td class="px-6 py-3 text-center text-gray-400">Email Only</td><td class="px-6 py-3 text-center bg-rose-50"><span class="text-green-500 font-bold">24/7 WhatsApp 📱</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>`,
      },
    ],
  },
  {
    id: 'conversion',
    label: 'Conversion Elements',
    icon: MousePointer,
    blocks: [
      {
        id: 'cta-section',
        label: 'CTA Section',
        icon: MousePointer,
        preview: '🖱️',
        defaultHtml: `<section class="py-16 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500">
  <div class="max-w-4xl mx-auto px-4 text-center">
    <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Order?</h2>
    <p class="text-white/90 text-lg mb-8">Join 10,000+ happy customers who trust us</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#order" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-rose-600 font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all">
        🛒 Order Now
      </a>
      <a href="https://wa.me/8801XXXXXXXXX" target="_blank" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all">
        💬 WhatsApp
      </a>
    </div>
  </div>
</section>`,
      },
      {
        id: 'benefits-list',
        label: 'Benefits List',
        icon: CheckCircle,
        preview: '✅',
        defaultHtml: `<section class="py-12">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Why You'll Love This</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex items-start gap-3 p-4 bg-rose-50 rounded-xl">
        <span class="text-2xl">✅</span>
        <div>
          <h4 class="font-bold text-gray-900">100% Original Product</h4>
          <p class="text-sm text-gray-600">নকল পণ্য নয়, ১০০% অরিজিনাল</p>
        </div>
      </div>
      <div class="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
        <span class="text-2xl">✅</span>
        <div>
          <h4 class="font-bold text-gray-900">Cash on Delivery</h4>
          <p class="text-sm text-gray-600">পণ্য হাতে পেয়ে টাকা দিন</p>
        </div>
      </div>
      <div class="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
        <span class="text-2xl">✅</span>
        <div>
          <h4 class="font-bold text-gray-900">Fast Delivery</h4>
          <p class="text-sm text-gray-600">ঢাকায় ১-২ দিন, ঢাকার বাইরে ২-৪ দিন</p>
        </div>
      </div>
      <div class="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl">
        <span class="text-2xl">✅</span>
        <div>
          <h4 class="font-bold text-gray-900">7 Days Return</h4>
          <p class="text-sm text-gray-600">পণ্যে সমস্যা থাকলে ফ্রি রিটার্ন</p>
        </div>
      </div>
    </div>
  </div>
</section>`,
      },
      {
        id: 'faq-section',
        label: 'FAQ Section',
        icon: HelpCircle,
        preview: '❓',
        defaultHtml: `<section class="py-12 bg-gray-50">
  <div class="max-w-3xl mx-auto px-4">
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
    <div class="space-y-3">
      <div class="bg-white rounded-xl shadow-sm p-4" data-faq-item>
        <button class="w-full flex items-center justify-between text-left font-bold text-gray-900" data-faq-toggle>
          <span>ডেলিভারি কতদিনে পাবো?</span>
          <span class="text-rose-500">+</span>
        </button>
        <div class="hidden mt-3 text-gray-600" data-faq-content>
          ঢাকার ভেতরে ১-২ দিন এবং ঢাকার বাইরে ২-৪ দিনের মধ্যে ডেলিভারি পাবেন।
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4" data-faq-item>
        <button class="w-full flex items-center justify-between text-left font-bold text-gray-900" data-faq-toggle>
          <span>পণ্যে সমস্যা থাকলে কি করবো?</span>
          <span class="text-rose-500">+</span>
        </button>
        <div class="hidden mt-3 text-gray-600" data-faq-content>
          পণ্যে কোনো সমস্যা থাকলে ৭ দিনের মধ্যে আমাদের WhatsApp-এ জানান, ফ্রি রিটার্ন/এক্সচেঞ্জ করা হবে।
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4" data-faq-item>
        <button class="w-full flex items-center justify-between text-left font-bold text-gray-900" data-faq-toggle>
          <span>পেমেন্ট কিভাবে করবো?</span>
          <span class="text-rose-500">+</span>
        </button>
        <div class="hidden mt-3 text-gray-600" data-faq-content>
          Cash on Delivery (COD) সুবিধা আছে। পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন। বিকাশ/নগদেও পেমেন্ট করা যায়।
        </div>
      </div>
    </div>
  </div>
</section>`,
      },
      {
        id: 'video-section',
        label: 'Video Section',
        icon: Play,
        preview: '🎬',
        defaultHtml: `<section class="py-12">
  <div class="max-w-4xl mx-auto px-4">
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">See It In Action</h2>
    <div class="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer group" data-video-container>
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play size={32} className="text-rose-600 ml-1" />
        </div>
      </div>
      <img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1200&q=80" alt="Video Thumbnail" class="w-full h-full object-cover opacity-80" />
    </div>
    <p class="text-center text-sm text-gray-500 mt-4">ভিডিওতে দেখুন কিভাবে কাজ করে 📺</p>
  </div>
</section>`,
      },
    ],
  },
  {
    id: 'checkout',
    label: 'Checkout & Footer',
    icon: ShoppingCart,
    blocks: [
      {
        id: 'checkout-section',
        label: 'Checkout Section',
        icon: ShoppingCart,
        preview: '🛒',
        isSpecial: true,
        defaultHtml: `<section id="order" class="py-12 bg-gradient-to-b from-gray-50 to-white">
  <div class="max-w-2xl mx-auto px-4">
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-2">Order Now</h2>
    <p class="text-center text-gray-500 mb-8">Fill in your details below to place order</p>
    <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <form class="space-y-4" id="checkout-form">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
          <input type="text" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="মোহাম্মদ রহিম" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
          <input type="tel" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="01XXXXXXXXX" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">District *</label>
          <select required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent">
            <option value="">Select District</option>
            <option> Dhaka</option><option>Chittagong</option><option>Sylhet</option><option>Khulna</option><option>Rajshahi</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
          <textarea required rows="2" class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="বাড়ি নং, রোড, এলাকা"></textarea>
        </div>
        <button type="submit" class="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
          Confirm Order 🛒
        </button>
        <p class="text-center text-sm text-gray-500">💳 Cash on Delivery • 🚚 Free Return</p>
      </form>
    </div>
  </div>
</section>`,
      },
      {
        id: 'footer',
        label: 'Footer',
        icon: MapPin,
        preview: '📍',
        defaultHtml: `<footer class="bg-gray-900 text-gray-300 py-8">
  <div class="max-w-6xl mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">🛍️</span>
          <span class="font-bold text-xl text-white">MyStore</span>
        </div>
        <p class="text-sm text-gray-400">আপনার বিশ্বস্ত অনলাইন শপিং পার্টনার।</p>
      </div>
      <div>
        <h4 class="font-bold text-white mb-4">Contact Us</h4>
        <ul class="space-y-2 text-sm">
          <li>📱 WhatsApp: 01XXXXXXXXX</li>
          <li>📧 Email: info@mystore.com</li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold text-white mb-4">Policy</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="#" class="hover:text-white">Privacy Policy</a></li>
          <li><a href="#" class="hover:text-white">Return Policy</a></li>
          <li><a href="#" class="hover:text-white">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-gray-700 pt-6 text-center text-sm">
      <p>&copy; 2024 MyStore. All rights reserved.</p>
    </div>
  </div>
</footer>`,
      },
    ],
  },
];

/**
 * BlocksPanel - Draggable blocks library
 */
export default function BlocksPanel({ editor }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(
    BLOCK_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
  );

  // Filter blocks based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return BLOCK_CATEGORIES;
    const query = searchQuery.toLowerCase();
    return BLOCK_CATEGORIES
      .map(cat => ({
        ...cat,
        blocks: cat.blocks.filter(b =>
          b.label.toLowerCase().includes(query) ||
          b.id.toLowerCase().includes(query)
        )
      }))
      .filter(cat => cat.blocks.length > 0);
  }, [searchQuery]);

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Add block to canvas
  const addBlock = useCallback((block) => {
    if (!block.defaultHtml) return;

    // Try to get editor from window first, then prop
    const ed = window.__landingPageEditor || editor;
    if (ed) {
      ed.addComponents(block.defaultHtml);
    } else {
      console.warn('Editor not available');
    }
  }, [editor]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blocks..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Blocks List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.map((category) => (
          <div key={category.id} className="mb-2">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <category.icon size={16} className="text-rose-500" />
                <span className="text-sm font-semibold text-gray-700">{category.label}</span>
                <span className="text-xs text-gray-400">({category.blocks.length})</span>
              </div>
              {expandedCategories[category.id] ? (
                <ChevronDown size={14} className="text-gray-400" />
              ) : (
                <ChevronRight size={14} className="text-gray-400" />
              )}
            </button>

            {/* Category Blocks */}
            {expandedCategories[category.id] && (
              <div className="grid grid-cols-2 gap-2 p-2">
                {category.blocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => addBlock(block)}
                    className={`
                      flex flex-col items-center p-3 rounded-xl border border-gray-200
                      hover:border-rose-300 hover:bg-rose-50/50 transition-all
                      ${block.isSpecial ? 'ring-2 ring-rose-400 ring-offset-1' : ''}
                    `}
                  >
                    <span className="text-2xl mb-2">{block.preview}</span>
                    <span className="text-xs font-medium text-gray-700 text-center">{block.label}</span>
                    {block.isSpecial && (
                      <span className="mt-1 px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[10px] rounded">Required</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Click on a block to add it to your page
        </p>
      </div>
    </div>
  );
}