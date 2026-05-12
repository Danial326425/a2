import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import axios from 'axios';
import { config } from '../../../config';
import imageCompression from 'browser-image-compression';

// Default hero images
const DEFAULT_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519340333755-c1aa5571fd46?auto=format&fit=crop&w=900&q=80',
];

// Helper functions
const splitHeroImages = (value) =>
  String(value || '')
    .split(/[\n,]+/)
    .map((src) => src.trim())
    .filter(Boolean);

const escapeAttribute = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const heroSliderMarkup = ({ images, alt, className = 'w-full h-[320px] md:h-[520px] object-cover rounded-[26px]' }) => {
  const heroImages = splitHeroImages(images).length ? splitHeroImages(images) : [DEFAULT_HERO_IMAGES[0]];
  if (className.includes('baby-hero-image')) {
    return `<div class="baby-hero-crop-box"><img src="${escapeAttribute(heroImages[0])}" alt="${escapeAttribute(alt)}" class="${className}" /></div>`;
  }
  return `<img src="${escapeAttribute(heroImages[0])}" alt="${escapeAttribute(alt)}" class="${className}" />`;
};

// Baby Template Styles
const BABY_TEMPLATE_STYLES = `
  html { scroll-behavior: smooth; }
  body { font-family: 'Nunito', sans-serif; background: #fffdfb; color: #253041; }
  .baby-heading { font-family: 'Baloo 2', cursive; letter-spacing: -0.02em; }
  .baby-pill { display: inline-flex; align-items: center; justify-content: center; border-radius: 9999px; padding: 8px 16px; font-size: 14px; font-weight: 800; }
  .baby-btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 9999px; padding: 14px 28px; font-weight: 800; text-decoration: none; transition: all .25s ease; }
  .baby-btn:hover { transform: translateY(-2px); }
  .baby-order-btn { padding: 16px 34px; min-width: 132px; font-size: 16px; box-shadow: 0 14px 28px rgba(15, 23, 42, .22); }
  .baby-conversion-cta { position: relative; isolation: isolate; overflow: hidden; padding: 18px 38px; min-width: 190px; color: #fff !important; background: linear-gradient(135deg, #f43f5e 0%, #ec4899 45%, #f97316 100%) !important; border: 2px solid rgba(255,255,255,.75); box-shadow: 0 18px 38px rgba(236, 72, 153, .38), 0 0 0 6px rgba(244, 63, 94, .12); font-size: 18px; letter-spacing: .01em; animation: babyCtaShake 2s ease-in-out infinite; }
  .baby-conversion-cta::after { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.42) 45%, transparent 70%); transform: translateX(-120%); animation: babyCtaShine 2s ease-in-out infinite; }
  .baby-conversion-cta:hover { box-shadow: 0 22px 48px rgba(236, 72, 153, .5), 0 0 0 8px rgba(249, 115, 22, .16); }
  @keyframes babyCtaShake { 0%, 100% { transform: translateX(0) scale(1); } 5% { transform: translateX(-5px) rotate(-1deg) scale(1.04); } 10% { transform: translateX(5px) rotate(1deg) scale(1.04); } 15% { transform: translateX(-4px) rotate(-1deg) scale(1.04); } 20% { transform: translateX(4px) rotate(1deg) scale(1.04); } 25% { transform: translateX(0) rotate(0) scale(1); } }
  @keyframes babyCtaShine { 0%, 25% { transform: translateX(-120%); } 55%, 100% { transform: translateX(120%); } }
  .baby-card { background: rgba(255,255,255,.9); border: 1px solid rgba(255,255,255,.7); box-shadow: 0 20px 45px rgba(148, 163, 184, .14); backdrop-filter: blur(10px); }
  .baby-shell { position: relative; overflow: hidden; }
  .baby-shell:not(.baby-order-section) { background: linear-gradient(135deg, #fff7fb 0%, #fff 46%, #e8f7ff 100%) !important; }
  .baby-orb { position: absolute; border-radius: 9999px; filter: blur(60px); opacity: .35; pointer-events: none; }
  .baby-hero-slider { position: relative; overflow: hidden; width: 100%; max-width: 100%; min-width: 0; }
  .baby-hero-slider-track { position: relative; width: 100%; height: 100%; }
  .baby-hero-slider img, .baby-hero-slide { display: block; width: 100%; height: 100%; object-fit: cover; }
  .baby-hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity .7s ease; }
  .baby-hero-slide.is-active { position: relative; opacity: 1; }
  .baby-hero-slider-dots { position: absolute; left: 50%; bottom: 16px; z-index: 2; display: flex; gap: 8px; transform: translateX(-50%); }
  .baby-hero-slider-dot { width: 9px; height: 9px; border: 0; border-radius: 9999px; background: rgba(255,255,255,.55); box-shadow: 0 2px 8px rgba(15,23,42,.2); cursor: pointer; padding: 0; }
  .baby-hero-slider-dot.is-active { width: 24px; background: #fff; }
  .baby-hero-stage { width: 100%; max-width: 1320px !important; margin-left: auto; margin-right: auto; padding: 72px 32px 82px; display: grid; grid-template-columns: minmax(440px, 560px) minmax(520px, 620px) !important; justify-content: center; gap: 28px 46px; align-items: center; }
  .baby-hero-copy { max-width: 650px; }
  .baby-hero-copy .baby-pill { padding: 9px 18px; border: 1px solid rgba(244, 114, 182, .18); background: rgba(255,255,255,.9) !important; color: #db2777 !important; box-shadow: 0 10px 24px rgba(236, 72, 153, .09); font-size: 13px; letter-spacing: .02em; }
  .baby-hero-copy .baby-heading { max-width: 680px; font-family: 'Nunito', sans-serif; font-size: clamp(42px, 4.3vw, 66px); line-height: 1.02; letter-spacing: -0.045em; font-weight: 900; color: #172033; }
  .baby-hero-copy p { max-width: 590px; color: #48566a; line-height: 1.55; }
  .baby-hero-image-frame { display: flex; justify-content: flex-start; min-width: 0; width: 100%; overflow: visible; grid-column: 2; grid-row: 1 / span 2; }
  .baby-hero-actions { grid-column: 1; grid-row: 2; max-width: 650px; margin-top: 4px; }
  .baby-hero-actions .baby-btn { min-height: 58px; border-radius: 18px; padding: 0 30px; font-size: 16px; }
  .baby-hero-actions .baby-conversion-cta { min-width: 190px; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 52%, #fb6b2a 100%) !important; box-shadow: 0 16px 34px rgba(236, 72, 153, .28); animation: none; }
  .baby-hero-actions .baby-conversion-cta::after { animation: none; opacity: .25; }
  .baby-hero-crop-box { width: min(100%, 620px); max-width: none; height: 420px; overflow: hidden; border: 8px solid rgba(255,255,255,.85); border-radius: 28px; background: #fff; box-shadow: 0 24px 60px rgba(15, 23, 42, .14), 0 1px 0 rgba(255,255,255,.9) inset; }
  .baby-hero-image { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center center; }
  @media (max-width: 1023px) { .baby-hero-stage { grid-template-columns: 1fr !important; gap: 40px; padding: 64px 24px; text-align: center; } .baby-hero-image-frame, .baby-hero-actions { grid-column: auto; grid-row: auto; } .baby-hero-copy { max-width: 760px; margin-left: auto; margin-right: auto; } .baby-hero-copy .baby-pill { margin-left: auto; margin-right: auto; } }
  @media (max-width: 767px) { .baby-hero-stage { padding: 48px 16px; gap: 28px; } .baby-hero-copy .baby-heading { font-size: clamp(34px, 10vw, 46px); line-height: 1.04; letter-spacing: -0.035em; } .baby-hero-copy { order: 1; } .baby-hero-image-frame { order: 2; } .baby-hero-actions { order: 3; width: 100%; max-width: 100%; } .baby-hero-crop-box { height: min(78vw, 340px); max-width: 100%; border-width: 5px; border-radius: 22px; } .baby-hero-actions .baby-btn { min-height: 54px; border-radius: 16px; } }
  .baby-shell, .baby-shell * { box-sizing: border-box; }
  @media (max-width: 767px) { .baby-shell { width: 100%; max-width: 100vw; overflow-x: hidden; } .baby-shell img { display: block; width: 100% !important; max-width: 100% !important; min-width: 0 !important; } .baby-shell .baby-btn { width: 100%; max-width: 100%; min-width: 0; padding-left: 18px; padding-right: 18px; } }
  .text-slate-300 { color: #cbd5e1; } .text-slate-500 { color: #64748b; } .text-slate-600 { color: #475569; } .text-slate-700 { color: #334155; } .text-slate-800 { color: #1e293b; } .text-slate-900 { color: #0f172a; }
  .bg-slate-50 { background-color: #f8fafc; } .bg-slate-800 { background-color: #1e293b; } .bg-slate-900 { background-color: #0f172a; }
  .border-slate-100 { border-color: #f1f5f9; } .border-slate-200 { border-color: #e2e8f0; }
  .bg-white\\/5 { background-color: rgba(255,255,255,.05); } .bg-white\\/10 { background-color: rgba(255,255,255,.10); }
  .text-white\\/80 { color: rgba(255,255,255,.80); } .text-white\\/90 { color: rgba(255,255,255,.90); }
  .border-white\\/10 { border-color: rgba(255,255,255,.10); } .border-white\\/20 { border-color: rgba(255,255,255,.20); }
  .rounded-\\[24px\\] { border-radius: 24px; } .rounded-\\[26px\\] { border-radius: 26px; } .rounded-\\[28px\\] { border-radius: 28px; }
  .rounded-\\[30px\\] { border-radius: 30px; } .rounded-\\[32px\\] { border-radius: 32px; } .rounded-\\[36px\\] { border-radius: 36px; }
  .h-\\[320px\\] { height: 320px; } .h-\\[340px\\] { height: 340px; }
  @media (min-width: 768px) { .md\\:h-\\[500px\\] { height: 500px; } .md\\:h-\\[520px\\] { height: 520px; } }
  @media (min-width: 1024px) { .lg\\:grid-cols-\\[1fr_1\\.05fr\\] { grid-template-columns: 1fr 1.05fr; } .lg\\:grid-cols-\\[0\\.9fr_1\\.1fr\\] { grid-template-columns: .9fr 1.1fr; } .lg\\:row-start-1 { grid-row-start: 1; } .lg\\:row-span-2 { grid-row: span 2 / span 2; } }
  /* Premium Template Styles */
  .premium-announce { background: linear-gradient(90deg,#e11d48,#f43f72,#e11d48); background-size:200% 100%; animation:premiumAnnounce 4s linear infinite; color:#fff; text-align:center; padding:10px 16px; font-size:13px; font-weight:700; letter-spacing:0.01em; }
  @keyframes premiumAnnounce { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }
  .btn-order-nav { display:inline-flex;align-items:center;gap:8px; padding:10px 20px;border-radius:9999px; background:linear-gradient(135deg,#f43f72,#e11d48); color:#fff;font-size:14px;font-weight:800;text-decoration:none; box-shadow:0 4px 16px rgba(244,63,114,.3);transition:all .2s; border:none;cursor:pointer; }
  .btn-order-nav:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(244,63,114,.4);color:#fff;}
  .product-img-main { width:100%;height:clamp(260px,44vw,440px);border-radius:28px;overflow:hidden; background:linear-gradient(135deg,#fff0f8 0%,#f0f9ff 100%); border:1px solid rgba(244,63,114,.1); box-shadow:0 16px 48px rgba(0,0,0,.07),0 4px 12px rgba(244,63,114,.06);position:relative; }
  .product-img-main img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;}
  .product-thumb { width:80px;height:80px;border-radius:14px;overflow:hidden; border:2.5px solid #e2e8f0;cursor:pointer;transition:all .2s;flex-shrink:0; }
  .product-thumb:hover,.product-thumb.active{ border-color:#f43f72;box-shadow:0 0 0 3px rgba(244,63,114,.2); }
  .product-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
  .color-swatch { width:36px;height:36px;border-radius:9999px;border:2.5px solid transparent; cursor:pointer;transition:all .2s;display:inline-block; }
  .color-swatch:hover,.color-swatch.selected{ border-color:#f43f72;transform:scale(1.2);box-shadow:0 0 0 3px rgba(244,63,114,.2); }
  .size-btn { padding:10px 18px;border-radius:12px;border:2px solid #e2e8f0; font-size:14px;font-weight:700;cursor:pointer;transition:all .2s; background:#fff;color:#475569;font-family:'Nunito',sans-serif; }
  .size-btn:hover,.size-btn.selected{border-color:#f43f72;background:#fff0f4;color:#f43f72;}
  .qty-btn { width:38px;height:38px;border-radius:10px;border:2px solid #e2e8f0; background:#fff;font-size:20px;font-weight:700;cursor:pointer; display:inline-flex;align-items:center;justify-content:center; transition:all .2s;color:#475569;line-height:1; }
  .qty-btn:hover{border-color:#f43f72;background:#fff0f4;color:#f43f72;}
  .btn-order-main { display:flex;align-items:center;justify-content:center;gap:8px; width:100%;padding:13px 28px;border-radius:14px; background:linear-gradient(135deg,#f43f72 0%,#e11d48 100%); color:#fff;font-size:15px;font-weight:800;letter-spacing:-.01em; text-decoration:none;transition:all .25s; box-shadow:0 6px 18px rgba(244,63,114,.32),0 2px 6px rgba(244,63,114,.18); border:none;cursor:pointer;font-family:'Baloo 2',cursive; }
  .btn-order-main:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(244,63,114,.4);color:#fff;}
  .btn-order-main.inline{display:inline-flex;width:auto;}
  .cod-strip { background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%); border:1.5px solid #86efac;border-radius:16px;padding:14px 18px; display:flex;align-items:center;gap:12px; }
  .section-title-main { font-family:'Baloo 2',cursive; font-size:clamp(26px,5vw,44px);font-weight:800;color:#0f172a; letter-spacing:-.03em;line-height:1.15; }
  .trust-feature-card { display:flex;align-items:center;gap:12px;padding:16px;background:#fff; border-radius:18px;border:1px solid rgba(244,63,114,.08); box-shadow:0 2px 12px rgba(0,0,0,.04);transition:all .2s; }
  .trust-feature-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.08);}
  .trust-icon{font-size:28px;flex-shrink:0;line-height:1;}
  .trust-pill-mini { display:flex;align-items:center;gap:8px;padding:10px 14px; background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0; font-size:12px;font-weight:700;color:#475569; }
  .feature-card { padding:28px;background:#fff;border-radius:24px; border:1px solid #f1f5f9;box-shadow:0 4px 20px rgba(0,0,0,.05);transition:all .3s; }
  .feature-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(244,63,114,.1);border-color:#fecdd3;}
  .feature-icon-wrap{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;}
  .review-card-premium { background:#fff;border-radius:24px;padding:24px; box-shadow:0 4px 24px rgba(0,0,0,.06);border:1.5px solid #f1f5f9;transition:all .3s; }
  .review-card-premium:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.1);border-color:#fecdd3;}
  .stat-card{text-align:center;}
  .stat-number{ font-family:'Baloo 2',cursive;font-size:clamp(28px,4vw,42px); font-weight:800;color:#f9a8d4;letter-spacing:-.03em;line-height:1.1; }
  .stat-label{font-size:13px;color:rgba(255,255,255,.7);font-weight:600;margin-top:4px;}
  .faq-item{ border-radius:18px;border:1.5px solid #e2e8f0;background:#fff; overflow:hidden;transition:all .2s; }
  .faq-item:hover{border-color:#fda4af;box-shadow:0 4px 16px rgba(244,63,114,.08);}
  .faq-q{ padding:20px 22px;font-weight:700;font-size:15px;color:#1e293b; cursor:pointer;display:flex;justify-content:space-between;align-items:center; gap:12px;background:#fff;font-family:'Nunito',sans-serif; }
  .faq-a{ padding:16px 22px 20px;font-size:14px;color:#64748b; line-height:1.75;border-top:1px solid #f1f5f9; }
  .btn-cta-final { display:inline-flex;align-items:center;justify-content:center;gap:10px; padding:20px 48px;border-radius:20px;background:#fff;color:#e11d48; font-size:20px;font-weight:800;text-decoration:none;transition:all .25s; box-shadow:0 8px 32px rgba(0,0,0,.2);font-family:'Baloo 2',cursive;letter-spacing:-.02em; }
  .btn-cta-final:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 16px 48px rgba(0,0,0,.25);background:#fff0f4;}
  .badge-premium{ display:inline-flex;align-items:center;gap:4px;padding:5px 12px; border-radius:9999px;font-size:11px;font-weight:800;letter-spacing:.02em; font-family:'Nunito',sans-serif; }
  @keyframes shimmer{ 0%{background-position:-200% center}100%{background-position:200% center} }
  .shimmer-text{ background:linear-gradient(90deg,#f43f72,#fb7185,#f43f72); background-size:200% auto;-webkit-background-clip:text; -webkit-text-fill-color:transparent;background-clip:text; animation:shimmer 2.5s linear infinite; }
  .premium-hero-section{background:linear-gradient(180deg,#fff9fb 0%,#ffffff 100%);}
  .prd-card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06),0 1px 4px rgba(0,0,0,.04);border:1px solid #f1f5f9;display:flex;flex-direction:column;transition:transform .3s cubic-bezier(.25,.8,.25,1),box-shadow .3s;height:100%;}
  .prd-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,.1),0 4px 12px rgba(0,0,0,.06);}
  .prd-img-wrap{overflow:hidden;aspect-ratio:4/5;flex-shrink:0;background:#f8fafc;}
  .prd-img-wrap img{width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform .5s ease;display:block;}
  .prd-card:hover .prd-img-wrap img{transform:scale(1.07);}
  .prd-body{padding:14px 16px 18px;display:flex;flex-direction:column;flex:1;}
  .prd-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:9999px;font-size:10px;font-weight:700;background:#fff1f2;color:#e11d48;margin-bottom:7px;width:fit-content;border:1px solid #fecdd3;}
  .prd-name{font-weight:800;color:#0f172a;font-size:15px;line-height:1.3;font-family:'Baloo 2',cursive;}
  .prd-desc{font-size:12px;color:#64748b;margin-top:5px;line-height:1.55;flex:1;}
  .prd-price-row{display:flex;align-items:center;justify-content:space-between;margin-top:14px;gap:8px;border-top:1px solid #f8fafc;padding-top:12px;}
  .prd-price-wrap{display:flex;flex-direction:column;}
  .prd-price{font-size:20px;font-weight:900;color:#e11d48;font-family:'Baloo 2',cursive;line-height:1;}
  .prd-price-old{font-size:11px;color:#94a3b8;text-decoration:line-through;font-weight:600;margin-top:2px;}
  .prd-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:9px 14px;border-radius:11px;background:linear-gradient(135deg,#f43f72,#e11d48);color:#fff;font-size:12px;font-weight:800;text-decoration:none;transition:all .25s;white-space:nowrap;font-family:'Baloo 2',cursive;box-shadow:0 4px 12px rgba(244,63,114,.28);flex-shrink:0;}
  .prd-btn:hover{background:linear-gradient(135deg,#e11d48,#be185d);box-shadow:0 6px 18px rgba(244,63,114,.4);color:#fff;transform:translateY(-1px);}
  .prd-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
  @media(min-width:1024px){.prd-grid{grid-template-columns:repeat(4,1fr);gap:20px;}}
  .gal-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
  @media(min-width:640px){.gal-grid{gap:10px;}}
  @media(min-width:768px){.gal-grid{gap:12px;}}
  @media(min-width:1024px){.gal-grid{gap:14px;}}
  .gal-item{position:relative;overflow:hidden;border-radius:14px;background:#f1f5f9;cursor:pointer;display:block;text-decoration:none;}
  .gal-item-inner{aspect-ratio:1/1;overflow:hidden;display:block;}
  .gal-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease;}
  .gal-item:hover img{transform:scale(1.08);}
  .gal-overlay{position:absolute;inset:0;background:rgba(15,23,42,0);display:flex;align-items:center;justify-content:center;transition:background .3s;}
  .gal-item:hover .gal-overlay{background:rgba(15,23,42,.42);}
  .gal-eye{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;opacity:0;transform:scale(.6);transition:all .3s;}
  .gal-item:hover .gal-eye{opacity:1;transform:scale(1);}
  @keyframes arrowBounce{0%,100%{transform:translateY(0);}50%{transform:translateY(6px);}}
  @keyframes guidePulse{0%,100%{box-shadow:0 0 0 0 rgba(244,63,114,.25);}70%{box-shadow:0 0 0 8px rgba(244,63,114,0);}}
  .order-guide-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#e11d48;animation:guidePulse 2s ease-out infinite;}
  @media(max-width:767px){ .btn-order-main{font-size:14px;padding:11px 20px;} .btn-cta-final{font-size:17px;padding:16px 32px;} .product-thumb{width:64px;height:64px;} .product-img-main{border-radius:20px;height:clamp(220px,75vw,320px);} }
`;

// Full Baby Template
const FULL_BABY_TEMPLATE = `
<div class="bg-white">

  <!-- ── ANNOUNCEMENT BAR ─────────────────────────────── -->
  <div class="premium-announce">
    🚚 সারাদেশে ডেলিভারি &nbsp;·&nbsp; 📦 ক্যাশ অন ডেলিভারি (COD) &nbsp;·&nbsp; ⭐ ১০,০০০+ সন্তুষ্ট পরিবার &nbsp;·&nbsp; ✅ ৭ দিন রিটার্ন পলিসি
  </div>

  <!-- ── HERO / PRODUCT SHOWCASE ──────────────────────── -->
  <section class="premium-hero-section">
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

        <!-- Product Gallery -->
        <div style="position:sticky;top:20px;">
          <div class="product-img-main">
            <div class="absolute" style="top:14px;left:14px;z-index:10;display:flex;flex-direction:column;gap:6px;">
              <span class="badge-premium" style="background:#fef3c7;color:#d97706;">⭐ বেস্টসেলার</span>
              <span class="badge-premium" style="background:#fce7f3;color:#be185d;">✨ নতুন কালেকশন</span>
            </div>
            <span class="badge-premium absolute" style="top:14px;right:14px;z-index:10;background:#fee2e2;color:#dc2626;">৩১% ছাড়</span>
            ${heroSliderMarkup({ images: DEFAULT_HERO_IMAGES.join('\\n'), alt: 'প্রিমিয়াম বেবি টি-শার্ট', className: 'baby-hero-image' })}
          </div>
          <!-- Thumbnails -->
          <div class="flex gap-3 mt-4 overflow-x-auto pb-1">
            <div class="product-thumb active"><img src="${DEFAULT_HERO_IMAGES[0]}" alt="v1" /></div>
            <div class="product-thumb"><img src="${DEFAULT_HERO_IMAGES[1]}" alt="v2" /></div>
            <div class="product-thumb"><img src="${DEFAULT_HERO_IMAGES[2]}" alt="v3" /></div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="space-y-5">
          <div>
            <h1 class="section-title-main">
              প্রিমিয়াম সফট বেবি টি-শার্ট<br/>
              <span class="shimmer-text">কমফোর্ট কালেকশন ২০২৫</span>
            </h1>
            <p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.6;">১০০% অর্গানিক কটন · নরম স্পর্শ · হাইপোঅ্যালার্জেনিক</p>
          </div>
          <!-- Rating -->
          <div class="flex items-center gap-3 flex-wrap" style="font-size:14px;">
            <div class="flex items-center gap-1"><span style="color:#f59e0b;">★★★★★</span><strong style="color:#1e293b;">4.9</strong></div>
            <span style="color:#e2e8f0;">|</span>
            <span style="color:#64748b;"><strong style="color:#334155;">৩৪৭টি</strong> রিভিউ</span>
          </div>
          <!-- Pricing -->
          <div style="background:linear-gradient(135deg,#fff1f2,#fff);border:1px solid #fecdd3;border-radius:16px;padding:16px 20px;">
            <div class="flex items-end gap-3 flex-wrap">
              <span style="font-size:40px;font-weight:900;color:#0f172a;font-family:'Baloo 2',cursive;line-height:1;">৳৫৯০</span>
              <div style="padding-bottom:4px;">
                <div style="font-size:18px;font-weight:700;color:#94a3b8;text-decoration:line-through;">৳৮৫০</div>
                <span style="font-size:12px;font-weight:800;color:#fff;background:#e11d48;padding:2px 10px;border-radius:9999px;">৩১% ছাড়</span>
              </div>
            </div>
          </div>
          <!-- COD Strip -->
          <div class="cod-strip">
            <span style="font-size:28px;">🚚</span>
            <div><p style="font-weight:800;color:#15803d;font-size:14px;">ক্যাশ অন ডেলিভারি উপলব্ধ</p><p style="font-size:12px;color:#166534;">পণ্য হাতে পাওয়ার পর টাকা দিন</p></div>
          </div>
          <!-- CTA -->
          <div style="padding-top:4px;">
            <a href="#order" class="btn-order-main">🛒 এখনই অর্ডার করুন — ৳৫৯০</a>
          </div>
          <!-- Mini Trust Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="trust-pill-mini"><span>🔒</span><span>নিরাপদ অর্ডার</span></div>
            <div class="trust-pill-mini"><span>↩️</span><span>৭ দিন রিটার্ন</span></div>
            <div class="trust-pill-mini"><span>✅</span><span>আসল পণ্যের গ্যারান্টি</span></div>
            <div class="trust-pill-mini"><span>📦</span><span>সারাদেশে ডেলিভারি</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── TRUST STRIP ────────────────────────────────────── -->
  <section style="padding:32px 16px;background:linear-gradient(to right,#fff1f2,#fff,#f0f9ff);border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;">
    <div class="max-w-5xl mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="trust-feature-card"><span class="trust-icon">🚚</span><div><p style="font-weight:800;color:#1e293b;font-size:14px;">সারাদেশে ডেলিভারি</p><p style="font-size:12px;color:#64748b;">সকল জেলায় পাঠানো হয়</p></div></div>
        <div class="trust-feature-card"><span class="trust-icon">💳</span><div><p style="font-weight:800;color:#1e293b;font-size:14px;">ক্যাশ অন ডেলিভারি</p><p style="font-size:12px;color:#64748b;">পণ্য পেলে পেমেন্ট করুন</p></div></div>
        <div class="trust-feature-card"><span class="trust-icon">✅</span><div><p style="font-weight:800;color:#1e293b;font-size:14px;">আসল পণ্যের নিশ্চয়তা</p><p style="font-size:12px;color:#64748b;">১০০% অরিজিনাল</p></div></div>
        <div class="trust-feature-card"><span class="trust-icon">↩️</span><div><p style="font-weight:800;color:#1e293b;font-size:14px;">৭ দিন রিটার্ন</p><p style="font-size:12px;color:#64748b;">সমস্যা হলে ফেরত দিন</p></div></div>
      </div>
    </div>
  </section>

  <!-- ── PRODUCT FEATURES ───────────────────────────────── -->
  <section class="py-14 md:py-20 px-4 md:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <span class="baby-pill" style="background:#fff1f2;color:#e11d48;border:1px solid #fecdd3;font-size:13px;">পণ্যের বিশেষত্ব</span>
        <h2 class="section-title-main mt-4">কেন আমাদের পণ্য অন্যদের চেয়ে আলাদা?</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="feature-card"><div class="feature-icon-wrap" style="background:#fdf2f8;"><span>🌿</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">১০০% অর্গানিক কটন</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">শিশুর ত্বকের জন্য সম্পূর্ণ নিরাপদ।</p></div>
        <div class="feature-card"><div class="feature-icon-wrap" style="background:#eff6ff;"><span>🧴</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">হাইপোঅ্যালার্জেনিক</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">অ্যালার্জি-মুক্ত কাপড়।</p></div>
        <div class="feature-card"><div class="feature-icon-wrap" style="background:#f0fdf4;"><span>🧺</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">মেশিনে ধোয়া যায়</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">সহজে ওয়াশ করুন।</p></div>
        <div class="feature-card"><div class="feature-icon-wrap" style="background:#fefce8;"><span>🎨</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">ভাইব্রান্ট কালার</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">উজ্জ্বল ও দীর্ঘস্থায়ী রঙ।</p></div>
        <div class="feature-card"><div class="feature-icon-wrap" style="background:#fdf4ff;"><span>✂️</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">পার্ফেক্ট ফিট</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">নড়াচড়ায় স্বাচ্ছন্দ্য।</p></div>
        <div class="feature-card"><div class="feature-icon-wrap" style="background:#fff1f2;"><span>🎁</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">গিফট-রেডি প্যাকেজিং</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">সুন্দর উপহার প্যাকেজিং সহ।</p></div>
      </div>
    </div>
  </section>

  <!-- ── PRODUCT GRID ───────────────────────────────────── -->
  <section style="padding:56px 16px 64px;background:#f8fafc;">
    <div style="max-width:1280px;margin:0 auto;">
      <div style="text-align:center;max-width:600px;margin:0 auto 40px;">
        <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:9999px;background:#fff1f2;color:#e11d48;font-size:12px;font-weight:700;border:1px solid #fecdd3;">⭐ বেস্টসেলার কালেকশন</span>
        <h2 style="font-size:clamp(24px,4vw,38px);font-weight:900;color:#0f172a;margin-top:12px;font-family:'Baloo 2',cursive;">আমাদের সেরা পণ্যগুলো</h2>
      </div>
      <div class="prd-grid">
        <div class="prd-card"><div class="prd-img-wrap"><img src="https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=600&q=80" alt="পণ্য ১" /></div><div class="prd-body"><span class="prd-tag">⭐ বেস্টসেলার</span><p class="prd-name">পণ্যের নাম ১</p><p class="prd-desc">পণ্যের বিবরণ এখানে লিখুন।</p><div class="prd-price-row"><div class="prd-price-wrap"><span class="prd-price">৳৫৯০</span><span class="prd-price-old">৳৮৫০</span></div><a href="#order" class="prd-btn">🛒 অর্ডার</a></div></div></div>
        <div class="prd-card"><div class="prd-img-wrap"><img src="https://images.unsplash.com/photo-1519340333755-c1aa5571fd46?auto=format&fit=crop&w=600&q=80" alt="পণ্য ২" /></div><div class="prd-body"><span class="prd-tag">🔥 জনপ্রিয়</span><p class="prd-name">পণ্যের নাম ২</p><p class="prd-desc">পণ্যের বিবরণ এখানে লিখুন।</p><div class="prd-price-row"><div class="prd-price-wrap"><span class="prd-price">৳৬২০</span><span class="prd-price-old">৳৯০০</span></div><a href="#order" class="prd-btn">🛒 অর্ডার</a></div></div></div>
        <div class="prd-card"><div class="prd-img-wrap"><img src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80" alt="পণ্য ৩" /></div><div class="prd-body"><span class="prd-tag">✨ নতুন</span><p class="prd-name">পণ্যের নাম ৩</p><p class="prd-desc">পণ্যের বিবরণ এখানে লিখুন।</p><div class="prd-price-row"><div class="prd-price-wrap"><span class="prd-price">৳৬৪০</span><span class="prd-price-old">৳৯৫০</span></div><a href="#order" class="prd-btn">🛒 অর্ডার</a></div></div></div>
        <div class="prd-card"><div class="prd-img-wrap"><img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80" alt="পণ্য ৪" /></div><div class="prd-body"><span class="prd-tag">🎁 গিফট-রেডি</span><p class="prd-name">পণ্যের নাম ৪</p><p class="prd-desc">পণ্যের বিবরণ এখানে লিখুন।</p><div class="prd-price-row"><div class="prd-price-wrap"><span class="prd-price">৳৬৭০</span><span class="prd-price-old">৳৯৮০</span></div><a href="#order" class="prd-btn">🛒 অর্ডার</a></div></div></div>
      </div>
    </div>
  </section>

  <!-- ── CUSTOMER REVIEWS ───────────────────────────────── -->
  <section class="py-14 md:py-20 px-4 md:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <span class="baby-pill" style="background:#fffbeb;color:#d97706;border:1px solid #fde68a;font-size:13px;">⭐ গ্রাহক রিভিউ</span>
        <h2 class="section-title-main mt-4">সন্তুষ্ট মা-বাবার কথা</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="review-card-premium">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3"><img src="https://i.pravatar.cc/48?img=47" style="width:48px;height:48px;border-radius:50%;border:2px solid #fecdd3;" alt="" /><div><p style="font-weight:700;color:#1e293b;">নুসরাত জাহান</p><p style="font-size:12px;color:#94a3b8;">ঢাকা, গুলশান</p></div></div>
            <span style="font-size:11px;background:#dcfce7;color:#16a34a;font-weight:700;padding:3px 10px;border-radius:9999px;">✓ যাচাইকৃত</span>
          </div>
          <div style="color:#f59e0b;margin-bottom:12px;">★★★★★</div>
          <p style="color:#475569;font-size:14px;line-height:1.7;">"এত নরম কাপড় আগে কখনো দেখিনি! ডেলিভারি মাত্র ২ দিনে পেয়েছি।"</p>
        </div>
        <div class="review-card-premium">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3"><img src="https://i.pravatar.cc/48?img=56" style="width:48px;height:48px;border-radius:50%;border:2px solid #bae6fd;" alt="" /><div><p style="font-weight:700;color:#1e293b;">তানভীর আহমেদ</p><p style="font-size:12px;color:#94a3b8;">চট্টগ্রাম</p></div></div>
            <span style="font-size:11px;background:#dcfce7;color:#16a34a;font-weight:700;padding:3px 10px;border-radius:9999px;">✓ যাচাইকৃত</span>
          </div>
          <div style="color:#f59e0b;margin-bottom:12px;">★★★★★</div>
          <p style="color:#475569;font-size:14px;line-height:1.7;">"প্যাকেজিং এত সুন্দর ছিল যে আলাদা র‌্যাপ করার দরকার পড়েনি।"</p>
        </div>
        <div class="review-card-premium">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3"><img src="https://i.pravatar.cc/48?img=32" style="width:48px;height:48px;border-radius:50%;border:2px solid #bbf7d0;" alt="" /><div><p style="font-weight:700;color:#1e293b;">সাবিনা আক্তার</p><p style="font-size:12px;color:#94a3b8;">রাজশাহী</p></div></div>
            <span style="font-size:11px;background:#dcfce7;color:#16a34a;font-weight:700;padding:3px 10px;border-radius:9999px;">✓ যাচাইকৃত</span>
          </div>
          <div style="color:#f59e0b;margin-bottom:12px;">★★★★★</div>
          <p style="color:#475569;font-size:14px;line-height:1.7;">"ক্যাশ অন ডেলিভারিতে অর্ডার করেছিলাম, নির্ধারিত সময়ে পেয়েছি।"</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ── ORDER COUNTER ──────────────────────────────────── -->
  <section style="padding:56px 16px;background:linear-gradient(135deg,#0f172a,#4c0519,#0f172a);">
    <div class="max-w-5xl mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="stat-card"><p class="stat-number">১০,০০০+</p><p class="stat-label">সন্তুষ্ট পরিবার</p></div>
        <div class="stat-card"><p class="stat-number">4.9/5</p><p class="stat-label">গড় রেটিং</p></div>
        <div class="stat-card"><p class="stat-number">৬৪ জেলা</p><p class="stat-label">ডেলিভারি কভারেজ</p></div>
        <div class="stat-card"><p class="stat-number">৩ বছর</p><p class="stat-label">বিশ্বস্ততার সাথে</p></div>
      </div>
    </div>
  </section>

  <!-- ── FAQ ────────────────────────────────────────────── -->
  <section class="py-14 md:py-20 px-4 md:px-8 bg-white">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="section-title-main mt-4">আপনার প্রশ্নের উত্তর</h2>
      </div>
      <div class="space-y-3">
        <div class="faq-item"><div class="faq-q"><span>পণ্যের কাপড় কতটুকু নরম?</span><span style="color:#f43f72;font-size:18px;">+</span></div><div class="faq-a">আমাদের পণ্য ১০০% অর্গানিক কমবেড কটন থেকে তৈরি যা অত্যন্ত নরম এবং টেকসই।</div></div>
        <div class="faq-item"><div class="faq-q"><span>কত দিনে ডেলিভারি পাব?</span><span style="color:#f43f72;font-size:18px;">+</span></div><div class="faq-a">ঢাকার মধ্যে ২-৩ কার্যদিবস। ঢাকার বাইরে ৩-৫ কার্যদিবসে ডেলিভারি দেওয়া হয়।</div></div>
        <div class="faq-item"><div class="faq-q"><span>কীভাবে পেমেন্ট করব?</span><span style="color:#f43f72;font-size:18px;">+</span></div><div class="faq-a">শুধুমাত্র ক্যাশ অন ডেলিভারি (COD)। পণ্য হাতে পেয়ে ডেলিভারি ম্যানকে টাকা দিন।</div></div>
      </div>
    </div>
  </section>

  <!-- ── FINAL ORDER CTA ─────────────────────────────────── -->
  <section id="order" style="padding:64px 16px;background:#fff;position:relative;overflow:hidden;border-top:1px solid #f1f5f9;">
    <div class="relative max-w-4xl mx-auto text-center">
      <span class="baby-pill" style="background:#fff1f2;color:#e11d48;border:1px solid #fecdd3;font-size:13px;margin-bottom:16px;">🎉 সীমিত সময়ের অফার</span>
      <h2 class="baby-heading" style="font-size:clamp(26px,5vw,50px);font-weight:800;color:#0f172a;margin-top:12px;line-height:1.15;">আজই অর্ডার করুন<br/><span style="color:#e11d48;">মাত্র ৳৫৯০ — ৩১% ছাড়ে</span></h2>
      <div style="margin-top:28px;">
        <a href="#order" class="btn-order-main inline" style="font-size:16px;padding:15px 36px;">🛒 এখনই অর্ডার করুন — ৳৫৯০</a>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:16px;padding:16px;text-align:center;"><p style="font-size:22px;font-weight:900;color:#e11d48;font-family:'Baloo 2',cursive;">COD</p><p style="font-size:12px;color:#64748b;margin-top:4px;">ক্যাশ অন ডেলিভারি</p></div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:16px;text-align:center;"><p style="font-size:22px;font-weight:900;color:#16a34a;font-family:'Baloo 2',cursive;">৭ দিন</p><p style="font-size:12px;color:#64748b;margin-top:4px;">রিটার্ন পলিসি</p></div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:16px;text-align:center;"><p style="font-size:22px;font-weight:900;color:#2563eb;font-family:'Baloo 2',cursive;">৬৪</p><p style="font-size:12px;color:#64748b;margin-top:4px;">জেলায় ডেলিভারি</p></div>
        <div style="background:#fefce8;border:1px solid #fef08a;border-radius:16px;padding:16px;text-align:center;"><p style="font-size:22px;font-weight:900;color:#ca8a04;font-family:'Baloo 2',cursive;">১০০%</p><p style="font-size:12px;color:#64748b;margin-top:4px;">অরিজিনাল পণ্য</p></div>
      </div>
    </div>
  </section>

</div>
`;


const LandingPageEditor = ({ pageId }) => {
  const editorRef = useRef(null);
  const id = pageId;
  const apiUrl = config.apiUrl;
  useEffect(() => {
    if (editorRef.current) return;

    const editor = grapesjs.init({
      container: '#gjs',
      height: '100vh',
      width: '100%',
      fromElement: false,
      storageManager: false,
      noticeOnUnload: false,
      blockManager: {
        appendTo: '#blocks',
        blocks: [],
      },
      traitManager: {
        appendTo: '#traits-container',
      },
      styleManager: {
        appendTo: '#styles-container',
      },
      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px' },
          { name: 'Mobile portrait', width: '375px' },
        ],
      },
      assetManager: {
        upload: false,
        uploadFile: async (e) => {
          const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
          const imageFiles = Array.from(files || []);
          if (!imageFiles.length) return;

          try {
            const options = {
              maxSizeMB: 2,
              maxWidthOrHeight: 2560,
              useWebWorker: true,
              fileType: 'image/webp',
              initialQuality: 0.95,
            };

            const uploadedAssets = await Promise.all(
              imageFiles.map(async (file) => {
                const compressedFile = await imageCompression(file, options);
                const formData = new FormData();
                formData.append('file', compressedFile);

                const res = await axios.post(`${apiUrl}/upload-image`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });

                return { src: res.data.data.src };
              })
            );

            editor.AssetManager.add(uploadedAssets);
          } catch (err) {
            console.error('UPLOAD ERROR:', err);
          }
        },
      },
      canvas: {
        styles: [
          'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
          'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
          'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Baloo+2:wght@500;600;700;800&display=swap',
        ],
      },
    });

    const babyTemplateStyles = `
      html {
        scroll-behavior: smooth;
      }

      body {
        font-family: 'Nunito', sans-serif;
        background: #fffdfb;
        color: #253041;
      }

      .baby-heading {
        font-family: 'Baloo 2', cursive;
        letter-spacing: -0.02em;
      }

      .baby-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 800;
      }

      .baby-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        padding: 14px 28px;
        font-weight: 800;
        text-decoration: none;
        transition: all .25s ease;
      }

      .baby-order-btn {
        padding: 16px 34px;
        min-width: 132px;
        font-size: 16px;
        box-shadow: 0 14px 28px rgba(15, 23, 42, .22);
      }

      .baby-conversion-cta {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        padding: 18px 38px;
        min-width: 190px;
        color: #fff !important;
        background: linear-gradient(135deg, #f43f5e 0%, #ec4899 45%, #f97316 100%) !important;
        border: 2px solid rgba(255,255,255,.75);
        box-shadow: 0 18px 38px rgba(236, 72, 153, .38), 0 0 0 6px rgba(244, 63, 94, .12);
        font-size: 18px;
        letter-spacing: .01em;
        animation: babyCtaShake 2s ease-in-out infinite;
      }

      .baby-conversion-cta::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,.42) 45%, transparent 70%);
        transform: translateX(-120%);
        animation: babyCtaShine 2s ease-in-out infinite;
      }

      .baby-conversion-cta:hover {
        box-shadow: 0 22px 48px rgba(236, 72, 153, .5), 0 0 0 8px rgba(249, 115, 22, .16);
      }

      @keyframes babyCtaShake {
        0%, 100% { transform: translateX(0) scale(1); }
        5% { transform: translateX(-5px) rotate(-1deg) scale(1.04); }
        10% { transform: translateX(5px) rotate(1deg) scale(1.04); }
        15% { transform: translateX(-4px) rotate(-1deg) scale(1.04); }
        20% { transform: translateX(4px) rotate(1deg) scale(1.04); }
        25% { transform: translateX(0) rotate(0) scale(1); }
      }

      @keyframes babyCtaShine {
        0%, 25% { transform: translateX(-120%); }
        55%, 100% { transform: translateX(120%); }
      }

      .baby-btn:hover {
        transform: translateY(-2px);
      }

      .baby-card {
        background: rgba(255,255,255,.9);
        border: 1px solid rgba(255,255,255,.7);
        box-shadow: 0 20px 45px rgba(148, 163, 184, .14);
        backdrop-filter: blur(10px);
      }

      .baby-shell {
        position: relative;
        overflow: hidden;
      }

      .baby-shell:not(.baby-order-section) {
        background: linear-gradient(135deg, #fff7fb 0%, #fff 46%, #e8f7ff 100%) !important;
      }

      .baby-orb {
        position: absolute;
        border-radius: 9999px;
        filter: blur(60px);
        opacity: .35;
        pointer-events: none;
      }

      .baby-offer-section,
      .baby-offer-section * {
        color: #000 !important;
      }

      .baby-offer-section .baby-offer-white-btn {
        color: #fff !important;
      }

      .baby-order-section {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 48%, #831843 100%) !important;
      }

      .baby-hero-slider {
        position: relative;
        overflow: hidden;
        width: 100%;
        max-width: 100%;
        min-width: 0;
      }

      .baby-hero-slider-track {
        position: relative;
        width: 100%;
        height: 100%;
      }

      .baby-hero-slider img,
      .baby-hero-slide {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .baby-hero-slide {
        position: absolute;
        inset: 0;
        opacity: 0;
        transition: opacity .7s ease;
      }

      .baby-hero-slide.is-active {
        position: relative;
        opacity: 1;
      }

      .baby-hero-slider-dots {
        position: absolute;
        left: 50%;
        bottom: 16px;
        z-index: 2;
        display: flex;
        gap: 8px;
        transform: translateX(-50%);
      }

      .baby-hero-slider-dot {
        width: 9px;
        height: 9px;
        border: 0;
        border-radius: 9999px;
        background: rgba(255,255,255,.55);
        box-shadow: 0 2px 8px rgba(15,23,42,.2);
        cursor: pointer;
        padding: 0;
      }

      .baby-hero-slider-dot.is-active {
        width: 24px;
        background: #fff;
      }

      .baby-hero-stage {
        width: 100%;
        max-width: 1320px !important;
        margin-left: auto;
        margin-right: auto;
        padding: 72px 32px 82px;
        display: grid;
        grid-template-columns: minmax(440px, 560px) minmax(520px, 620px) !important;
        justify-content: center;
        gap: 28px 46px;
        align-items: center;
      }

      .baby-hero-copy {
        max-width: 650px;
      }

      .baby-hero-copy .baby-pill {
        padding: 9px 18px;
        border: 1px solid rgba(244, 114, 182, .18);
        background: rgba(255,255,255,.9) !important;
        color: #db2777 !important;
        box-shadow: 0 10px 24px rgba(236, 72, 153, .09);
        font-size: 13px;
        letter-spacing: .02em;
      }

      .baby-hero-copy .baby-heading {
        max-width: 680px;
        font-family: 'Nunito', sans-serif;
        font-size: clamp(42px, 4.3vw, 66px);
        line-height: 1.02;
        letter-spacing: -0.045em;
        font-weight: 900;
        color: #172033;
      }

      .baby-hero-copy p {
        max-width: 590px;
        color: #48566a;
        line-height: 1.55;
      }

      .baby-hero-image-frame {
        display: flex;
        justify-content: flex-start;
        min-width: 0;
        width: 100%;
        overflow: visible;
        grid-column: 2;
        grid-row: 1 / span 2;
      }

      .baby-hero-actions {
        grid-column: 1;
        grid-row: 2;
        max-width: 650px;
        margin-top: 4px;
      }

      .baby-hero-actions .baby-btn {
        min-height: 58px;
        border-radius: 18px;
        padding: 0 30px;
        font-size: 16px;
      }

      .baby-hero-actions .baby-conversion-cta {
        min-width: 190px;
        background: linear-gradient(135deg, #ec4899 0%, #f43f5e 52%, #fb6b2a 100%) !important;
        box-shadow: 0 16px 34px rgba(236, 72, 153, .28);
        animation: none;
      }

      .baby-hero-actions .baby-conversion-cta::after {
        animation: none;
        opacity: .25;
      }

      .baby-hero-image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
      }

      .baby-hero-crop-box {
        width: min(100%, 620px);
        max-width: none;
        height: 420px;
        overflow: hidden;
        border: 8px solid rgba(255,255,255,.85);
        border-radius: 28px;
        background: #fff;
        box-shadow: 0 24px 60px rgba(15, 23, 42, .14), 0 1px 0 rgba(255,255,255,.9) inset;
      }

      @media (max-width: 1023px) {
        .baby-hero-stage {
          grid-template-columns: 1fr !important;
          gap: 40px;
          padding: 64px 24px;
          text-align: center;
        }

        .baby-hero-image-frame,
        .baby-hero-actions {
          grid-column: auto;
          grid-row: auto;
        }

        .baby-hero-copy {
          max-width: 760px;
          margin-left: auto;
          margin-right: auto;
        }

        .baby-hero-copy .baby-pill {
          margin-left: auto;
          margin-right: auto;
        }
      }

      @media (max-width: 767px) {
        .baby-hero-stage {
          padding: 48px 16px;
          gap: 28px;
        }

        .baby-hero-copy .baby-heading {
          font-size: clamp(34px, 10vw, 46px);
          line-height: 1.04;
          letter-spacing: -0.035em;
        }

        .baby-hero-copy {
          order: 1;
        }

        .baby-hero-image-frame {
          order: 2;
        }

        .baby-hero-actions {
          order: 3;
          width: 100%;
          max-width: 100%;
        }

        .baby-hero-crop-box {
          height: min(78vw, 340px);
          max-width: 100%;
          border-width: 5px;
          border-radius: 22px;
        }

        .baby-hero-actions .baby-btn {
          min-height: 54px;
          border-radius: 16px;
        }
      }

      .baby-shell .baby-card,
      .baby-shell [class*="shadow-xl"],
      .baby-shell [class*="shadow-2xl"] {
        max-width: 100%;
      }

      .baby-shell .baby-card > img,
      .baby-shell [class*="shadow-xl"] > img,
      .baby-shell [class*="shadow-2xl"] > img {
        display: block;
        width: 100% !important;
        max-width: 100% !important;
        height: 100% !important;
        object-fit: cover;
      }

      .baby-shell .baby-hero-slider,
      .baby-shell .baby-hero-slider-track {
        height: 100%;
      }

      .baby-shell,
      .baby-shell * {
        box-sizing: border-box;
      }

      .baby-shell > .relative,
      .baby-shell .baby-card,
      .baby-shell .baby-hero-slider {
        max-width: 100%;
        min-width: 0;
      }

      @media (max-width: 767px) {
        .baby-shell {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }

        .baby-shell > .relative:not(.baby-hero-stage) {
          display: flex !important;
          flex-direction: column !important;
          gap: 24px !important;
          width: 100%;
          max-width: 100% !important;
          min-width: 0 !important;
          padding-left: 16px !important;
          padding-right: 16px !important;
          overflow: hidden;
        }

        .baby-shell > .relative > div {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
        }

        .baby-shell .baby-card {
          padding: 0 !important;
          overflow: hidden;
        }

        .baby-shell img {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
        }

        .baby-shell [class*="h-[320px]"],
        .baby-shell [class*="h-[340px]"],
        .baby-shell [class*="md:h-[500px]"],
        .baby-shell [class*="md:h-[520px]"] {
          height: min(82vw, 360px) !important;
        }

        .baby-shell .baby-hero-slider {
          width: 100% !important;
          height: min(82vw, 360px) !important;
        }

        .baby-shell .baby-hero-slider img,
        .baby-shell .baby-hero-slide {
          width: 100% !important;
          max-width: 100%;
        }

        .baby-shell h1,
        .baby-shell h2,
        .baby-shell p,
        .baby-shell span {
          max-width: 100%;
          overflow-wrap: anywhere;
        }

        .baby-shell .baby-btn {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding-left: 18px;
          padding-right: 18px;
        }
      }

      .baby-photo-gallery-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .baby-photo-gallery-card {
        overflow: hidden;
        border: 1px solid #f3dce4;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 18px 40px rgba(148, 163, 184, .16);
      }

      .baby-photo-gallery-image {
        display: block;
        width: 100% !important;
        max-width: 100% !important;
        height: 170px;
        object-fit: cover;
      }

      .baby-photo-gallery-action {
        display: flex;
        justify-content: center;
        margin-top: 32px;
      }

      @media (min-width: 640px) {
        .baby-photo-gallery-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .baby-photo-gallery-image {
          height: 260px;
        }
      }

      @media (min-width: 1024px) {
        .baby-photo-gallery-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .baby-photo-gallery-card {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .baby-photo-gallery-image {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          height: 260px;
          object-fit: cover;
        }
      }

      .text-slate-300 { color: #cbd5e1; }
      .text-slate-500 { color: #64748b; }
      .text-slate-600 { color: #475569; }
      .text-slate-700 { color: #334155; }
      .text-slate-800 { color: #1e293b; }
      .text-slate-900 { color: #0f172a; }
      .bg-slate-50 { background-color: #f8fafc; }
      .bg-slate-800 { background-color: #1e293b; }
      .bg-slate-900 { background-color: #0f172a; }
      .border-slate-100 { border-color: #f1f5f9; }
      .border-slate-200 { border-color: #e2e8f0; }
      .bg-white\\/5 { background-color: rgba(255,255,255,.05); }
      .bg-white\\/10 { background-color: rgba(255,255,255,.10); }
      .bg-white\\/15 { background-color: rgba(255,255,255,.15); }
      .bg-white\\/20 { background-color: rgba(255,255,255,.20); }
      .text-white\\/80 { color: rgba(255,255,255,.80); }
      .text-white\\/90 { color: rgba(255,255,255,.90); }
      .border-white\\/10 { border-color: rgba(255,255,255,.10); }
      .border-white\\/20 { border-color: rgba(255,255,255,.20); }
      .bg-rose-50\\/70 { background-color: rgba(255, 241, 242, .70); }
      .rounded-\\[24px\\] { border-radius: 24px; }
      .rounded-\\[26px\\] { border-radius: 26px; }
      .rounded-\\[28px\\] { border-radius: 28px; }
      .rounded-\\[30px\\] { border-radius: 30px; }
      .rounded-\\[32px\\] { border-radius: 32px; }
      .rounded-\\[36px\\] { border-radius: 36px; }
      .h-\\[320px\\] { height: 320px; }
      .h-\\[340px\\] { height: 340px; }

      @media (min-width: 768px) {
        .md\\:h-\\[500px\\] { height: 500px; }
        .md\\:h-\\[520px\\] { height: 520px; }
      }

      @media (min-width: 1024px) {
        .lg\\:grid-cols-\\[1fr_1\\.05fr\\] { grid-template-columns: 1fr 1.05fr; }
        .lg\\:grid-cols-\\[1fr_1\\.1fr\\] { grid-template-columns: 1fr 1.1fr; }
        .lg\\:grid-cols-\\[0\\.9fr_1\\.1fr\\] { grid-template-columns: .9fr 1.1fr; }
        .lg\\:grid-cols-\\[1\\.05fr_0\\.95fr\\] { grid-template-columns: 1.05fr .95fr; }
        .lg\\:grid-cols-\\[1\\.1fr_0\\.9fr\\] { grid-template-columns: 1.1fr .9fr; }
        .lg\\:row-start-1 { grid-row-start: 1; }
        .lg\\:row-start-2 { grid-row-start: 2; }
        .lg\\:col-start-1 { grid-column-start: 1; }
        .lg\\:col-start-2 { grid-column-start: 2; }
        .lg\\:row-span-2 { grid-row: span 2 / span 2; }
        .lg\\:self-start { align-self: start; }
      }

      /* ═══════════════ PREMIUM TEMPLATE STYLES ═══════════════ */
      .premium-announce {
        background: linear-gradient(90deg,#e11d48,#f43f72,#e11d48);
        background-size:200% 100%;
        animation:premiumAnnounce 4s linear infinite;
        color:#fff;
        text-align:center;
        padding:10px 16px;
        font-size:13px;
        font-weight:700;
        letter-spacing:0.01em;
      }
      @keyframes premiumAnnounce {
        0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}
      }
      .btn-order-nav {
        display:inline-flex;align-items:center;gap:8px;
        padding:10px 20px;border-radius:9999px;
        background:linear-gradient(135deg,#f43f72,#e11d48);
        color:#fff;font-size:14px;font-weight:800;text-decoration:none;
        box-shadow:0 4px 16px rgba(244,63,114,.3);transition:all .2s;
        border:none;cursor:pointer;
      }
      .btn-order-nav:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(244,63,114,.4);color:#fff;}
      .product-img-main {
        width:100%;height:clamp(260px,44vw,440px);border-radius:28px;overflow:hidden;
        background:linear-gradient(135deg,#fff0f8 0%,#f0f9ff 100%);
        border:1px solid rgba(244,63,114,.1);
        box-shadow:0 16px 48px rgba(0,0,0,.07),0 4px 12px rgba(244,63,114,.06);
        position:relative;
      }
      .product-img-main img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block;}
      .product-thumb {
        width:80px;height:80px;border-radius:14px;overflow:hidden;
        border:2.5px solid #e2e8f0;cursor:pointer;transition:all .2s;flex-shrink:0;
      }
      .product-thumb:hover,.product-thumb.active{
        border-color:#f43f72;box-shadow:0 0 0 3px rgba(244,63,114,.2);
      }
      .product-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
      .color-swatch {
        width:36px;height:36px;border-radius:9999px;border:2.5px solid transparent;
        cursor:pointer;transition:all .2s;display:inline-block;
      }
      .color-swatch:hover,.color-swatch.selected{
        border-color:#f43f72;transform:scale(1.2);box-shadow:0 0 0 3px rgba(244,63,114,.2);
      }
      .size-btn {
        padding:10px 18px;border-radius:12px;border:2px solid #e2e8f0;
        font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;
        background:#fff;color:#475569;font-family:'Nunito',sans-serif;
      }
      .size-btn:hover,.size-btn.selected{border-color:#f43f72;background:#fff0f4;color:#f43f72;}
      .qty-btn {
        width:38px;height:38px;border-radius:10px;border:2px solid #e2e8f0;
        background:#fff;font-size:20px;font-weight:700;cursor:pointer;
        display:inline-flex;align-items:center;justify-content:center;
        transition:all .2s;color:#475569;line-height:1;
      }
      .qty-btn:hover{border-color:#f43f72;background:#fff0f4;color:#f43f72;}
      .btn-order-main {
        display:flex;align-items:center;justify-content:center;gap:8px;
        width:100%;padding:13px 28px;border-radius:14px;
        background:linear-gradient(135deg,#f43f72 0%,#e11d48 100%);
        color:#fff;font-size:15px;font-weight:800;letter-spacing:-.01em;
        text-decoration:none;transition:all .25s;
        box-shadow:0 6px 18px rgba(244,63,114,.32),0 2px 6px rgba(244,63,114,.18);
        border:none;cursor:pointer;font-family:'Baloo 2',cursive;
      }
      .btn-order-main:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(244,63,114,.4);color:#fff;}
      .btn-order-main.inline{display:inline-flex;width:auto;}
      .cod-strip {
        background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);
        border:1.5px solid #86efac;border-radius:16px;padding:14px 18px;
        display:flex;align-items:center;gap:12px;
      }
      .section-title-main {
        font-family:'Baloo 2',cursive;
        font-size:clamp(26px,5vw,44px);font-weight:800;color:#0f172a;
        letter-spacing:-.03em;line-height:1.15;
      }
      .trust-feature-card {
        display:flex;align-items:center;gap:12px;padding:16px;background:#fff;
        border-radius:18px;border:1px solid rgba(244,63,114,.08);
        box-shadow:0 2px 12px rgba(0,0,0,.04);transition:all .2s;
      }
      .trust-feature-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.08);}
      .trust-icon{font-size:28px;flex-shrink:0;line-height:1;}
      .trust-pill-mini {
        display:flex;align-items:center;gap:8px;padding:10px 14px;
        background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;
        font-size:12px;font-weight:700;color:#475569;
      }
      .feature-card {
        padding:28px;background:#fff;border-radius:24px;
        border:1px solid #f1f5f9;box-shadow:0 4px 20px rgba(0,0,0,.05);transition:all .3s;
      }
      .feature-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(244,63,114,.1);border-color:#fecdd3;}
      .feature-icon-wrap{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;}
      .review-card-premium {
        background:#fff;border-radius:24px;padding:24px;
        box-shadow:0 4px 24px rgba(0,0,0,.06);border:1.5px solid #f1f5f9;transition:all .3s;
      }
      .review-card-premium:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.1);border-color:#fecdd3;}
      .stat-card{text-align:center;}
      .stat-number{
        font-family:'Baloo 2',cursive;font-size:clamp(28px,4vw,42px);
        font-weight:800;color:#f9a8d4;letter-spacing:-.03em;line-height:1.1;
      }
      .stat-label{font-size:13px;color:rgba(255,255,255,.7);font-weight:600;margin-top:4px;}
      .faq-item{
        border-radius:18px;border:1.5px solid #e2e8f0;background:#fff;
        overflow:hidden;transition:all .2s;
      }
      .faq-item:hover{border-color:#fda4af;box-shadow:0 4px 16px rgba(244,63,114,.08);}
      .faq-q{
        padding:20px 22px;font-weight:700;font-size:15px;color:#1e293b;
        cursor:pointer;display:flex;justify-content:space-between;align-items:center;
        gap:12px;background:#fff;font-family:'Nunito',sans-serif;
      }
      .faq-a{
        padding:16px 22px 20px;font-size:14px;color:#64748b;
        line-height:1.75;border-top:1px solid #f1f5f9;
      }
      .btn-cta-final {
        display:inline-flex;align-items:center;justify-content:center;gap:10px;
        padding:20px 48px;border-radius:20px;background:#fff;color:#e11d48;
        font-size:20px;font-weight:800;text-decoration:none;transition:all .25s;
        box-shadow:0 8px 32px rgba(0,0,0,.2);font-family:'Baloo 2',cursive;letter-spacing:-.02em;
      }
      .btn-cta-final:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 16px 48px rgba(0,0,0,.25);background:#fff0f4;}
      .badge-premium{
        display:inline-flex;align-items:center;gap:4px;padding:5px 12px;
        border-radius:9999px;font-size:11px;font-weight:800;letter-spacing:.02em;
        font-family:'Nunito',sans-serif;
      }
      @keyframes shimmer{
        0%{background-position:-200% center}100%{background-position:200% center}
      }
      .shimmer-text{
        background:linear-gradient(90deg,#f43f72,#fb7185,#f43f72);
        background-size:200% auto;-webkit-background-clip:text;
        -webkit-text-fill-color:transparent;background-clip:text;
        animation:shimmer 2.5s linear infinite;
      }
      .premium-hero-section{background:linear-gradient(180deg,#fff9fb 0%,#ffffff 100%);}

      /* ── Premium Product Card ─────────────────────────────────────── */
      .prd-card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06),0 1px 4px rgba(0,0,0,.04);border:1px solid #f1f5f9;display:flex;flex-direction:column;transition:transform .3s cubic-bezier(.25,.8,.25,1),box-shadow .3s;height:100%;}
      .prd-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,.1),0 4px 12px rgba(0,0,0,.06);}
      .prd-img-wrap{overflow:hidden;aspect-ratio:4/5;flex-shrink:0;background:#f8fafc;}
      .prd-img-wrap img{width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform .5s ease;display:block;}
      .prd-card:hover .prd-img-wrap img{transform:scale(1.07);}
      .prd-body{padding:14px 16px 18px;display:flex;flex-direction:column;flex:1;}
      .prd-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:9999px;font-size:10px;font-weight:700;background:#fff1f2;color:#e11d48;margin-bottom:7px;width:fit-content;border:1px solid #fecdd3;}
      .prd-name{font-weight:800;color:#0f172a;font-size:15px;line-height:1.3;font-family:'Baloo 2',cursive;}
      .prd-desc{font-size:12px;color:#64748b;margin-top:5px;line-height:1.55;flex:1;}
      .prd-price-row{display:flex;align-items:center;justify-content:space-between;margin-top:14px;gap:8px;border-top:1px solid #f8fafc;padding-top:12px;}
      .prd-price-wrap{display:flex;flex-direction:column;}
      .prd-price{font-size:20px;font-weight:900;color:#e11d48;font-family:'Baloo 2',cursive;line-height:1;}
      .prd-price-old{font-size:11px;color:#94a3b8;text-decoration:line-through;font-weight:600;margin-top:2px;}
      .prd-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:9px 14px;border-radius:11px;background:linear-gradient(135deg,#f43f72,#e11d48);color:#fff;font-size:12px;font-weight:800;text-decoration:none;transition:all .25s;white-space:nowrap;font-family:'Baloo 2',cursive;box-shadow:0 4px 12px rgba(244,63,114,.28);flex-shrink:0;}
      .prd-btn:hover{background:linear-gradient(135deg,#e11d48,#be185d);box-shadow:0 6px 18px rgba(244,63,114,.4);color:#fff;transform:translateY(-1px);}
      .prd-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
      @media(min-width:1024px){.prd-grid{grid-template-columns:repeat(4,1fr);gap:20px;}}

      /* ── Premium Gallery ──────────────────────────────────────────── */
      .gal-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
      @media(min-width:640px){.gal-grid{gap:10px;}}
      @media(min-width:768px){.gal-grid{grid-template-columns:repeat(3,1fr);gap:12px;}}
      @media(min-width:1024px){.gal-grid{grid-template-columns:repeat(4,1fr);gap:14px;}}
      .gal-item{position:relative;overflow:hidden;border-radius:14px;background:#f1f5f9;cursor:pointer;display:block;text-decoration:none;}
      .gal-item-inner{aspect-ratio:1/1;overflow:hidden;display:block;}
      .gal-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease;}
      .gal-item:hover img{transform:scale(1.08);}
      .gal-overlay{position:absolute;inset:0;background:rgba(15,23,42,0);display:flex;align-items:center;justify-content:center;transition:background .3s;}
      .gal-item:hover .gal-overlay{background:rgba(15,23,42,.42);}
      .gal-eye{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;opacity:0;transform:scale(.6);transition:all .3s;}
      .gal-item:hover .gal-eye{opacity:1;transform:scale(1);}
      .gal-lb{display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.92);align-items:center;justify-content:center;padding:16px;animation:galFadeIn .2s ease;}
      .gal-lb:target{display:flex;}
      @keyframes galFadeIn{from{opacity:0;}to{opacity:1;}}
      .gal-lb-img{max-width:min(100%,800px);max-height:88vh;border-radius:14px;object-fit:contain;box-shadow:0 24px 80px rgba(0,0,0,.5);}
      .gal-lb-close{position:absolute;top:16px;right:20px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;text-decoration:none;transition:background .2s;line-height:1;}
      .gal-lb-close:hover{background:rgba(255,255,255,.25);}

      @keyframes arrowBounce{0%,100%{transform:translateY(0);}50%{transform:translateY(6px);}}
      @keyframes guidePulse{0%,100%{box-shadow:0 0 0 0 rgba(244,63,114,.25);}70%{box-shadow:0 0 0 8px rgba(244,63,114,0);}}
      .order-guide-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#e11d48;animation:guidePulse 2s ease-out infinite;}
      @media(max-width:767px){
        .btn-order-main{font-size:14px;padding:11px 20px;}
        .btn-cta-final{font-size:17px;padding:16px 32px;}
        .product-thumb{width:64px;height:64px;}
        .product-img-main{border-radius:20px;height:clamp(220px,75vw,320px);}
      }
    `;

    editor.addStyle(BABY_TEMPLATE_STYLES);

    const wrapLooseHeroImages = () => {
      const heroImages = editor.getWrapper().find('img.baby-hero-image');

      heroImages.forEach((component) => {
        const parent = component.parent();
        const parentClasses = parent?.getClasses?.() || [];

        if (parentClasses.includes('baby-hero-crop-box')) return;

        component.replaceWith(`
          <div class="baby-hero-crop-box">
            ${component.toHTML()}
          </div>
        `);
      });
    };

    const sanitizeSavedHtml = (html) => {
      const doc = document.implementation.createHTMLDocument('');
      doc.body.innerHTML = String(html || '').replace(/^<body[^>]*>/i, '').replace(/<\/body>$/i, '');

      doc.body.querySelectorAll('.baby-shell').forEach((section) => {
        const hasRealContent = section.querySelector([
          '.baby-hero-stage',
          '.baby-photo-gallery-grid',
          '.baby-order-section',
          'form',
          'input',
          'button',
          'a',
          'img',
          'h1',
          'h2',
          'h3',
          'p',
        ].join(','));

        if (!hasRealContent && !section.textContent.trim()) {
          section.remove();
        }
      });

      doc.body.querySelectorAll('div.bg-white').forEach((wrapper) => {
        const hasRealContent = wrapper.querySelector([
          '.baby-hero-stage',
          '.baby-photo-gallery-grid',
          '#order',
          'form',
          'input',
          'button',
          'a',
          'img',
          'h1',
          'h2',
          'h3',
          'p',
        ].join(','));

        if (!hasRealContent && !wrapper.textContent.trim()) {
          wrapper.remove();
        }
      });

      return doc.body.innerHTML;
    };

    const loadFromServer = async () => {
      try {
        editor.__isLoadingFromServer = true;
        const res = await axios.get(`${apiUrl}/landing-pages/${id}`);
        const data = res.data.data;

        if (!data) return;

        if (data.components) {
          editor.setComponents(typeof data.components === 'string' ? JSON.parse(data.components) : data.components);
        } else if (data.html) {
          // Add checkout_type data attribute to body if present in stored data
          let html = data.html;
          if (data.checkout_type) {
            // Check if body already has data-checkout-type attribute
            const hasCheckoutAttr = html.includes('data-checkout-type');
            if (!hasCheckoutAttr) {
              // Add to body tag
              html = html.replace(/<body([^>]*)>/i, `<body$1 data-checkout-type="${data.checkout_type}">`);
            }
          }
          editor.setComponents(html);
        }

        if (data.styles) {
          editor.setStyle(typeof data.styles === 'string' ? JSON.parse(data.styles) : data.styles);
        } else if (data.css) {
          editor.setStyle(data.css);
        }

        editor.addStyle(BABY_TEMPLATE_STYLES);
        wrapLooseHeroImages();

        if (data.assets) {
          editor.AssetManager.add(JSON.parse(data.assets));
        }

      } catch (err) {
        console.error('Load failed', err);
      } finally {
        editor.__isLoadingFromServer = false;
      }
    };

    const saveToServer = async ({ notify = false } = {}) => {
      try {
        wrapLooseHeroImages();
        const html = sanitizeSavedHtml(editor.getHtml());

        // Extract checkout_type from body data attribute
        let checkoutType = 'scroll'; // default
        const bodyMatch = html.match(/<body([^>]*)>/i);
        if (bodyMatch) {
          const attrMatch = bodyMatch[1].match(/data-checkout-type=["']([^"']+)["']/i);
          if (attrMatch) {
            checkoutType = attrMatch[1];
          }
        }

        const payload = {
          html,
          css: editor.getCss(),
          components: null,
          styles: null,
          assets: JSON.stringify(editor.AssetManager.getAll().map((asset) => asset.toJSON())),
          checkout_type: checkoutType,
        };

        const response = await axios.post(`${apiUrl}/landing-pages/save/${id}`, payload);

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Save failed');
        }

        if (notify) {
          alert('Page saved successfully');
        }

        return response.data;
      } catch (err) {
        const message = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Save failed';
        console.error('Landing page save failed:', err?.response?.data || err);

        if (notify) {
          alert(`Page save failed: ${message}`);
        }

        return null;
      }
    };

    window.__grapesjsSave = () => saveToServer({ notify: true });

    editor.on('load', loadFromServer);

    editor.on('update', () => {
      if (editor.__isLoadingFromServer) return;

      clearTimeout(editor.__saveTimeout);
      editor.__saveTimeout = setTimeout(() => {
        saveToServer();
      }, 3000);
    });

    editor.Commands.add('save-page', {
      run() {
        saveToServer({ notify: true });
      },
    });

    editor.Commands.add('open-import-html', {
      run(instance) {
        const modal = instance.Modal;

        modal.setTitle('Import HTML Code');
        modal.setContent(`
          <div style="padding:12px">
            <textarea
              id="import-html-area"
              style="width:100%;height:250px;padding:12px;border:1px solid #d1d5db;border-radius:8px"
              placeholder="Paste your HTML code here..."
            ></textarea>
            <button
              id="import-html-btn"
              style="margin-top:12px;padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:999px;cursor:pointer;font-weight:700"
            >
              Import HTML
            </button>
          </div>
        `);

        modal.open();

        setTimeout(() => {
          const btn = document.getElementById('import-html-btn');
          const textarea = document.getElementById('import-html-area');
          if (!btn || !textarea) return;

          btn.onclick = () => {
            const html = textarea.value;
            if (!html.trim()) return alert('Please paste HTML first');
            instance.setComponents(html);
            modal.close();
          };
        }, 50);
      },
    });

    // Checkout Type Settings Command
    editor.Commands.add('set-checkout-type', {
      run() {
        const modal = editor.Modal;
        const currentHtml = editor.getHtml();
        let currentType = 'scroll';
        const bodyMatch = currentHtml.match(/<body([^>]*)>/i);
        if (bodyMatch) {
          const attrMatch = bodyMatch[1].match(/data-checkout-type=["']([^"']+)["']/i);
          if (attrMatch) currentType = attrMatch[1];
        }

        modal.setTitle('Checkout Type Settings');
        modal.setContent(`
          <div style="padding: 20px; font-family: system-ui, sans-serif;">
            <p style="margin-bottom: 16px; color: #475569; font-size: 14px;">
              Select how the checkout form should appear when customers click the Order button:
            </p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <label style="display: flex; align-items: center; gap: 12px; padding: 16px; border: 2px solid ${currentType === 'scroll' ? '#2563eb' : '#e2e8f0'}; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                <input type="radio" name="checkoutType" value="scroll" ${currentType === 'scroll' ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #2563eb;">
                <div>
                  <strong style="font-size: 16px;">📜 Scroll to Form</strong>
                  <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Customer scrolls smoothly to the checkout section on the same page</p>
                </div>
              </label>
              <label style="display: flex; align-items: center; gap: 12px; padding: 16px; border: 2px solid ${currentType === 'popup' ? '#2563eb' : '#e2e8f0'}; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                <input type="radio" name="checkoutType" value="popup" ${currentType === 'popup' ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #2563eb;">
                <div>
                  <strong style="font-size: 16px;">🔔 Popup Modal</strong>
                  <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Checkout form opens in a smooth popup modal overlay</p>
                </div>
              </label>
            </div>
            <button id="save-checkout-type-btn" style="margin-top: 20px; padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 999px; font-weight: 600; cursor: pointer; font-size: 14px;">Save Settings</button>
          </div>
        `);

        modal.open();

        setTimeout(() => {
          const btn = document.getElementById('save-checkout-type-btn');
          if (!btn) return;

          btn.onclick = () => {
            const selected = document.querySelector('input[name="checkoutType"]:checked');
            const newType = selected ? selected.value : 'scroll';

            // Update body tag with data-checkout-type attribute
            const currentHtml = editor.getHtml();
            let newHtml;

            if (currentHtml.includes('data-checkout-type')) {
              // Replace existing value
              newHtml = currentHtml.replace(/data-checkout-type=["'][^"']*["']/i, `data-checkout-type="${newType}"`);
            } else {
              // Add new attribute
              newHtml = currentHtml.replace(/<body([^>]*)>/i, `<body$1 data-checkout-type="${newType}">`);
            }

            editor.setComponents(newHtml);
            modal.close();
            alert(`Checkout type saved: ${newType === 'scroll' ? 'Scroll to Form' : 'Popup Modal'}`);
          };
        }, 100);
      },
    });


    const defaultHeroImages = [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1519340333755-c1aa5571fd46?auto=format&fit=crop&w=900&q=80',
    ];

    const splitHeroImages = (value) =>
      String(value || '')
        .split(/[\n,]+/)
        .map((src) => src.trim())
        .filter(Boolean);

    const escapeAttribute = (value) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const heroSliderMarkup = ({
      images,
      alt,
      className = 'w-full h-[320px] md:h-[520px] object-cover rounded-[26px]',
    }) => {
      const heroImages = splitHeroImages(images).length ? splitHeroImages(images) : [defaultHeroImages[0]];
      if (className.includes('baby-hero-image')) {
        return `
          <div class="baby-hero-crop-box">
            <img src="${escapeAttribute(heroImages[0])}" alt="${escapeAttribute(alt)}" class="${className}" />
          </div>
        `;
      }

      return `<img src="${escapeAttribute(heroImages[0])}" alt="${escapeAttribute(alt)}" class="${className}" />`;
    };

    const heroSliderScript = function () {
      const el = this;
      const splitImages = (value) => String(value || '')
        .split(/[\n,]+/)
        .map((src) => src.trim())
        .filter(Boolean);
      const images = splitImages(el.getAttribute('data-hero-images'));
      const alt = el.getAttribute('data-hero-alt') || 'Hero image';
      const interval = Number(el.getAttribute('data-hero-interval')) || 4500;

      if (el.__heroSliderTimer) {
        clearInterval(el.__heroSliderTimer);
      }

      if (!images.length) {
        el.innerHTML = '';
        return;
      }

      el.innerHTML = '<div class="baby-hero-slider-track"></div>';
      const track = el.querySelector('.baby-hero-slider-track');
      const slides = images.map((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.className = `baby-hero-slide${index === 0 ? ' is-active' : ''}`;
        track.appendChild(img);
        return img;
      });

      if (slides.length < 2) return;

      const dots = document.createElement('div');
      dots.className = 'baby-hero-slider-dots';
      const buttons = slides.map((_, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `baby-hero-slider-dot${index === 0 ? ' is-active' : ''}`;
        button.setAttribute('aria-label', `Show hero image ${index + 1}`);
        dots.appendChild(button);
        return button;
      });
      el.appendChild(dots);

      let activeIndex = 0;
      const setActive = (nextIndex) => {
        activeIndex = nextIndex;
        slides.forEach((slide, index) => slide.classList.toggle('is-active', index === activeIndex));
        buttons.forEach((button, index) => button.classList.toggle('is-active', index === activeIndex));
      };

      buttons.forEach((button, index) => {
        button.addEventListener('click', () => setActive(index));
      });

      el.__heroSliderTimer = setInterval(() => {
        setActive((activeIndex + 1) % slides.length);
      }, interval);
    };

    const getAssetSource = (asset) =>
      asset?.get?.('src') || asset?.getSrc?.() || asset?.attributes?.src || asset?.src || '';

    const refreshHeroSlider = (component) => {
      if (component?.view?.el) {
        heroSliderScript.call(component.view.el);
      }
    };

    const addHeroImageToSelectedSlider = (instance, asset, mode = 'add') => {
      const selected = instance.getSelected();
      if (!selected?.is?.('hero-slider')) return;

      const src = getAssetSource(asset);
      if (!src) return;

      const currentImages = splitHeroImages(selected.getAttributes()?.['data-hero-images']);
      const nextImages = mode === 'replace'
        ? [src]
        : currentImages.includes(src)
          ? currentImages
          : [...currentImages, src];

      selected.addAttributes({
        'data-hero-images': nextImages.join('\n'),
      });

      refreshHeroSlider(selected);
    };

    const clearSelectedHeroImages = (instance) => {
      const selected = instance.getSelected();
      if (!selected?.is?.('hero-slider')) return;

      selected.addAttributes({
        'data-hero-images': '',
      });

      refreshHeroSlider(selected);
    };

    editor.Commands.add('open-hero-slider-assets', {
      run(instance, sender, options = {}) {
        const commandOptions = options?.mode ? options : sender?.mode ? sender : {};
        const selected = instance.getSelected();
        if (!selected?.is?.('hero-slider')) {
          alert('Please select a hero slider first');
          return;
        }

        instance.AssetManager.open({
          select(asset, complete) {
            addHeroImageToSelectedSlider(instance, asset, commandOptions.mode);

            if (complete) {
              instance.AssetManager.close();
            }
          },
        });
      },
    });

    editor.Commands.add('clear-hero-slider-images', {
      run(instance) {
        clearSelectedHeroImages(instance);
      },
    });

    editor.Commands.add('open-baby-hero-image-assets', {
      run(instance) {
        const selected = instance.getSelected();
        const selectedEl = selected?.getEl?.();
        const imageComponent = selectedEl?.classList?.contains('baby-hero-crop-box')
          ? selected.find('img')[0]
          : selectedEl?.classList?.contains('baby-hero-image')
            ? selected
            : null;

        if (!imageComponent) {
          alert('Please select the hero image crop box first');
          return;
        }

        instance.AssetManager.open({
          select(asset, complete) {
            const src = getAssetSource(asset);
            if (!src) return;

            imageComponent.addAttributes({ src });
            imageComponent.set('src', src);

            if (complete) {
              instance.AssetManager.close();
            }
          },
        });
      },
    });

    editor.TraitManager.addType('hero-image-picker', {
      createInput() {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%';

        const makeButton = ({ icon, label, color = '#111827', border = '#d1d5db', onClick }) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.innerHTML = `<i class="fa ${icon}" style="margin-right:6px"></i>${label}`;
          button.style.cssText = [
            'padding:10px 12px',
            `border:1px solid ${border}`,
            'border-radius:8px',
            'background:#fff',
            `color:${color}`,
            'font-weight:700',
            'cursor:pointer',
          ].join(';');
          button.onclick = onClick;
          return button;
        };

        wrapper.appendChild(makeButton({
          icon: 'fa-plus',
          label: 'Add Images',
          onClick: () => editor.runCommand('open-hero-slider-assets', { mode: 'add' }),
        }));

        wrapper.appendChild(makeButton({
          icon: 'fa-refresh',
          label: 'Replace',
          onClick: () => editor.runCommand('open-hero-slider-assets', { mode: 'replace' }),
        }));

        const clearButton = makeButton({
          icon: 'fa-times',
          label: 'Clear Images',
          color: '#dc2626',
          border: '#fecaca',
          onClick: () => editor.runCommand('clear-hero-slider-images'),
        });
        clearButton.style.gridColumn = '1 / -1';
        wrapper.appendChild(clearButton);

        return wrapper;
      },
    });

    editor.DomComponents.addType('hero-slider', {
      isComponent: (el) => el?.classList?.contains('baby-hero-slider'),
      model: {
        defaults: {
          script: heroSliderScript,
          toolbar: [
            {
              attributes: { class: 'fa fa-image', title: 'Add / upload hero images' },
              command: 'open-hero-slider-assets',
            },
            {
              attributes: { class: 'fa fa-arrows', title: 'Move' },
              command: 'tlb-move',
            },
            {
              attributes: { class: 'fa fa-clone', title: 'Clone' },
              command: 'tlb-clone',
            },
            {
              attributes: { class: 'fa fa-trash-o', title: 'Delete' },
              command: 'tlb-delete',
            },
          ],
          traits: [
            {
              type: 'hero-image-picker',
              label: false,
            },
            {
              type: 'textarea',
              name: 'data-hero-images',
              label: 'Hero images',
              placeholder: 'Paste one image URL per line',
              changeProp: 0,
            },
            {
              type: 'text',
              name: 'data-hero-alt',
              label: 'Image alt text',
              changeProp: 0,
            },
            {
              type: 'number',
              name: 'data-hero-interval',
              label: 'Slide interval',
              min: 1500,
              step: 500,
              changeProp: 0,
            },
          ],
        },
      },
      view: {
        onRender() {
          const model = this.model;
          this.listenTo(model, 'change:attributes:data-hero-images change:attributes:data-hero-alt change:attributes:data-hero-interval', () => {
            const view = model.view;
            if (view?.el && typeof heroSliderScript === 'function') {
              heroSliderScript.call(view.el);
            }
          });
        },
      },
    });

    editor.DomComponents.addType('baby-hero-crop-box', {
      isComponent: (el) => el?.classList?.contains('baby-hero-crop-box'),
      model: {
        defaults: {
          droppable: false,
          resizable: {
            tl: 1,
            tc: 1,
            tr: 1,
            cl: 1,
            cr: 1,
            bl: 1,
            bc: 1,
            br: 1,
            keyWidth: 'width',
            keyHeight: 'height',
            minDim: 120,
          },
          stylable: [
            'width',
            'max-width',
            'height',
            'overflow',
            'border-radius',
            'box-shadow',
            'margin',
          ],
          traits: [
            {
              type: 'number',
              label: 'Frame width',
              name: 'data-frame-width',
              placeholder: '620',
              min: 120,
              step: 10,
              changeProp: 1,
            },
            {
              type: 'number',
              label: 'Frame height',
              name: 'data-frame-height',
              placeholder: '420',
              min: 120,
              step: 10,
              changeProp: 1,
            },
            {
              type: 'select',
              label: 'Crop position',
              name: 'data-crop-position',
              changeProp: 1,
              options: [
                { id: 'center center', name: 'Center' },
                { id: 'center top', name: 'Top' },
                { id: 'center bottom', name: 'Bottom' },
                { id: 'left center', name: 'Left' },
                { id: 'right center', name: 'Right' },
                { id: 'left top', name: 'Top Left' },
                { id: 'right top', name: 'Top Right' },
                { id: 'left bottom', name: 'Bottom Left' },
                { id: 'right bottom', name: 'Bottom Right' },
              ],
            },
            {
              type: 'select',
              label: 'Image fit',
              name: 'data-object-fit',
              changeProp: 1,
              options: [
                { id: 'cover', name: 'Cover' },
                { id: 'contain', name: 'Contain' },
                { id: 'fill', name: 'Fill' },
              ],
            },
          ],
          toolbar: [
            {
              attributes: { class: 'fa fa-image', title: 'Replace hero image' },
              command: 'open-baby-hero-image-assets',
            },
            {
              attributes: { class: 'fa fa-arrows', title: 'Move' },
              command: 'tlb-move',
            },
            {
              attributes: { class: 'fa fa-clone', title: 'Clone' },
              command: 'tlb-clone',
            },
            {
              attributes: { class: 'fa fa-trash-o', title: 'Delete' },
              command: 'tlb-delete',
            },
          ],
        },
        init() {
          const applyFrameStyles = () => {
            const imageComponent = this.find('img')[0];
            const cropPosition = this.get('data-crop-position') || this.getAttributes()?.['data-crop-position'];
            const objectFit = this.get('data-object-fit') || this.getAttributes()?.['data-object-fit'];
            const frameWidth = this.get('data-frame-width') || this.getAttributes()?.['data-frame-width'];
            const frameHeight = this.get('data-frame-height') || this.getAttributes()?.['data-frame-height'];
            const frameStyle = { ...(this.getStyle() || {}) };

            if (frameWidth) {
              frameStyle.width = `${frameWidth}px`;
              frameStyle['max-width'] = '100%';
            }

            if (frameHeight) {
              frameStyle.height = `${frameHeight}px`;
            }

            this.setStyle(frameStyle);

            if (!imageComponent) return;

            const imageStyle = { ...(imageComponent.getStyle() || {}) };

            if (cropPosition) imageStyle['object-position'] = cropPosition;
            if (objectFit) imageStyle['object-fit'] = objectFit;

            imageComponent.setStyle(imageStyle);
          };

          this.on('change:data-frame-width change:data-frame-height change:data-crop-position change:data-object-fit', applyFrameStyles);
          applyFrameStyles();
        },
      },
    });

    editor.DomComponents.addType('baby-hero-image', {
      extend: 'image',
      isComponent: (el) => el?.classList?.contains('baby-hero-image'),
      model: {
        defaults: {
          resizable: {
            tl: 0,
            tc: 0,
            tr: 0,
            cl: 0,
            cr: 1,
            bl: 0,
            bc: 1,
            br: 1,
            keyWidth: 'width',
            keyHeight: 'height',
            minDim: 120,
          },
          stylable: [
            'width',
            'max-width',
            'height',
            'object-fit',
            'object-position',
            'border-radius',
            'box-shadow',
            'margin',
          ],
          traits: [
            {
              type: 'number',
              label: 'Frame width',
              name: 'data-frame-width',
              placeholder: '620',
              min: 120,
              step: 10,
              changeProp: 1,
            },
            {
              type: 'number',
              label: 'Frame height',
              name: 'data-frame-height',
              placeholder: '420',
              min: 120,
              step: 10,
              changeProp: 1,
            },
            {
              type: 'select',
              label: 'Crop position',
              name: 'data-crop-position',
              changeProp: 1,
              options: [
                { id: 'center center', name: 'Center' },
                { id: 'center top', name: 'Top' },
                { id: 'center bottom', name: 'Bottom' },
                { id: 'left center', name: 'Left' },
                { id: 'right center', name: 'Right' },
                { id: 'left top', name: 'Top Left' },
                { id: 'right top', name: 'Top Right' },
                { id: 'left bottom', name: 'Bottom Left' },
                { id: 'right bottom', name: 'Bottom Right' },
              ],
            },
            {
              type: 'select',
              label: 'Image fit',
              name: 'data-object-fit',
              changeProp: 1,
              options: [
                { id: 'contain', name: 'Contain' },
                { id: 'cover', name: 'Cover' },
                { id: 'fill', name: 'Fill' },
              ],
            },
          ],
          toolbar: [
            {
              attributes: { class: 'fa fa-image', title: 'Replace hero image' },
              command: 'open-baby-hero-image-assets',
            },
            {
              attributes: { class: 'fa fa-arrows', title: 'Move' },
              command: 'tlb-move',
            },
            {
              attributes: { class: 'fa fa-clone', title: 'Clone' },
              command: 'tlb-clone',
            },
            {
              attributes: { class: 'fa fa-trash-o', title: 'Delete' },
              command: 'tlb-delete',
            },
          ],
        },
        init() {
          const applyCropStyles = () => {
            const cropPosition = this.get('data-crop-position') || this.getAttributes()?.['data-crop-position'];
            const objectFit = this.get('data-object-fit') || this.getAttributes()?.['data-object-fit'];
            const frameWidth = this.get('data-frame-width') || this.getAttributes()?.['data-frame-width'];
            const frameHeight = this.get('data-frame-height') || this.getAttributes()?.['data-frame-height'];
            const style = { ...(this.getStyle() || {}) };
            const parent = this.parent();
            const parentClasses = parent?.getClasses?.() || [];

            if (parentClasses.includes('baby-hero-crop-box')) {
              const frameStyle = { ...(parent.getStyle() || {}) };

              if (frameWidth) {
                frameStyle.width = `${frameWidth}px`;
                frameStyle['max-width'] = '100%';
              }

              if (frameHeight) {
                frameStyle.height = `${frameHeight}px`;
              }

              parent.setStyle(frameStyle);
            }

            if (cropPosition) style['object-position'] = cropPosition;
            if (objectFit) style['object-fit'] = objectFit;

            this.setStyle(style);
          };

          this.on('change:data-frame-width change:data-frame-height change:data-crop-position change:data-object-fit', applyCropStyles);
          applyCropStyles();
        },
      },
    });

    editor.DomComponents.addType('baby-photo-gallery-card', {
      isComponent: (el) => el?.classList?.contains('baby-photo-gallery-card'),
      model: {
        defaults: {
          droppable: false,
          resizable: {
            tl: 1,
            tc: 1,
            tr: 1,
            cl: 1,
            cr: 1,
            bl: 1,
            bc: 1,
            br: 1,
            keyWidth: 'width',
            keyHeight: 'height',
            minDim: 90,
          },
          stylable: [
            'width',
            'max-width',
            'height',
            'aspect-ratio',
            'overflow',
            'border-radius',
            'box-shadow',
            'margin',
          ],
          traits: [
            {
              type: 'number',
              label: 'Frame width',
              name: 'data-frame-width',
              placeholder: '260',
              min: 90,
              step: 10,
              changeProp: 1,
            },
            {
              type: 'number',
              label: 'Frame height',
              name: 'data-frame-height',
              placeholder: '260',
              min: 90,
              step: 10,
              changeProp: 1,
            },
            {
              type: 'select',
              label: 'Crop position',
              name: 'data-crop-position',
              changeProp: 1,
              options: [
                { id: 'center center', name: 'Center' },
                { id: 'center top', name: 'Top' },
                { id: 'center bottom', name: 'Bottom' },
                { id: 'left center', name: 'Left' },
                { id: 'right center', name: 'Right' },
                { id: 'left top', name: 'Top Left' },
                { id: 'right top', name: 'Top Right' },
                { id: 'left bottom', name: 'Bottom Left' },
                { id: 'right bottom', name: 'Bottom Right' },
              ],
            },
            {
              type: 'select',
              label: 'Image fit',
              name: 'data-object-fit',
              changeProp: 1,
              options: [
                { id: 'cover', name: 'Cover' },
                { id: 'contain', name: 'Contain' },
                { id: 'fill', name: 'Fill' },
              ],
            },
          ],
        },
        init() {
          const applyGalleryFrameStyles = () => {
            const imageComponent = this.find('img')[0];
            const cropPosition = this.get('data-crop-position') || this.getAttributes()?.['data-crop-position'];
            const objectFit = this.get('data-object-fit') || this.getAttributes()?.['data-object-fit'];
            const frameWidth = this.get('data-frame-width') || this.getAttributes()?.['data-frame-width'];
            const frameHeight = this.get('data-frame-height') || this.getAttributes()?.['data-frame-height'];
            const frameStyle = { ...(this.getStyle() || {}) };

            frameStyle.position = 'relative';

            if (frameWidth) {
              frameStyle.width = `${frameWidth}px`;
              frameStyle['max-width'] = '100%';
            }

            if (frameHeight) {
              frameStyle.height = `${frameHeight}px`;
            }

            this.setStyle(frameStyle);

            if (!imageComponent) return;

            const imageStyle = { ...(imageComponent.getStyle() || {}) };

            if (frameWidth || frameHeight) {
              imageStyle.width = '100%';
              imageStyle.height = '100%';
            }

            if (cropPosition) imageStyle['object-position'] = cropPosition;
            if (objectFit) imageStyle['object-fit'] = objectFit;

            imageComponent.setStyle(imageStyle);
          };

          this.on('change:data-frame-width change:data-frame-height change:data-crop-position change:data-object-fit', applyGalleryFrameStyles);
          applyGalleryFrameStyles();
        },
      },
    });

    editor.DomComponents.addType('baby-photo-gallery-image', {
      extend: 'image',
      isComponent: (el) => el?.classList?.contains('baby-photo-gallery-image'),
      model: {
        defaults: {
          resizable: {
            tl: 1,
            tc: 1,
            tr: 1,
            cl: 1,
            cr: 1,
            bl: 1,
            bc: 1,
            br: 1,
            keyWidth: 'width',
            keyHeight: 'height',
            minDim: 90,
          },
          stylable: [
            'width',
            'height',
            'object-fit',
            'object-position',
            'border-radius',
            'margin',
          ],
          traits: [
            {
              type: 'number',
              label: 'Frame width',
              name: 'data-frame-width',
              placeholder: '260',
              min: 90,
              step: 10,
              changeProp: 1,
            },
            {
              type: 'number',
              label: 'Frame height',
              name: 'data-frame-height',
              placeholder: '260',
              min: 90,
              step: 10,
              changeProp: 1,
            },
            {
              type: 'select',
              label: 'Crop position',
              name: 'data-crop-position',
              changeProp: 1,
              options: [
                { id: 'center center', name: 'Center' },
                { id: 'center top', name: 'Top' },
                { id: 'center bottom', name: 'Bottom' },
                { id: 'left center', name: 'Left' },
                { id: 'right center', name: 'Right' },
                { id: 'left top', name: 'Top Left' },
                { id: 'right top', name: 'Top Right' },
                { id: 'left bottom', name: 'Bottom Left' },
                { id: 'right bottom', name: 'Bottom Right' },
              ],
            },
            {
              type: 'select',
              label: 'Image fit',
              name: 'data-object-fit',
              changeProp: 1,
              options: [
                { id: 'cover', name: 'Cover' },
                { id: 'contain', name: 'Contain' },
                { id: 'fill', name: 'Fill' },
              ],
            },
          ],
        },
        init() {
          const applyGalleryImageStyles = () => {
            const cropPosition = this.get('data-crop-position') || this.getAttributes()?.['data-crop-position'];
            const objectFit = this.get('data-object-fit') || this.getAttributes()?.['data-object-fit'];
            const frameWidth = this.get('data-frame-width') || this.getAttributes()?.['data-frame-width'];
            const frameHeight = this.get('data-frame-height') || this.getAttributes()?.['data-frame-height'];
            const style = { ...(this.getStyle() || {}) };
            const parent = this.parent();
            const parentClasses = parent?.getClasses?.() || [];

            if (parentClasses.includes('baby-photo-gallery-card')) {
              const frameStyle = { ...(parent.getStyle() || {}) };
              frameStyle.position = 'relative';

              if (frameWidth) {
                frameStyle.width = `${frameWidth}px`;
                frameStyle['max-width'] = '100%';
              }

              if (frameHeight) {
                frameStyle.height = `${frameHeight}px`;
              }

              parent.setStyle(frameStyle);
            }

            if (frameWidth || frameHeight) {
              style.width = '100%';
              style.height = '100%';
            }

            if (cropPosition) style['object-position'] = cropPosition;
            if (objectFit) style['object-fit'] = objectFit;

            this.setStyle(style);
          };

          this.on('change:data-frame-width change:data-frame-height change:data-crop-position change:data-object-fit', applyGalleryImageStyles);
          applyGalleryImageStyles();
        },
      },
    });

    const fullBabyTemplate = `
      <div class="bg-white">

        <!-- ── ANNOUNCEMENT BAR ─────────────────────────────── -->
        <div class="premium-announce">
          🚚 সারাদেশে ডেলিভারি &nbsp;·&nbsp; 📦 ক্যাশ অন ডেলিভারি (COD) &nbsp;·&nbsp; ⭐ ১০,০০০+ সন্তুষ্ট পরিবার &nbsp;·&nbsp; ✅ ৭ দিন রিটার্ন পলিসি
        </div>

        <!-- ── STICKY HEADER ────────────────────────────────── -->
        <header class="w-full bg-white/95 border-b border-gray-100" style="position:sticky;top:0;z-index:50;backdrop-filter:blur(8px);">
          <div class="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
            <a href="/" class="inline-flex items-center">
              <img src="https://via.placeholder.com/160x52?text=BRAND+LOGO" alt="Brand Logo" class="h-10 w-auto object-contain" />
            </a>
            <div class="flex items-center gap-3">
              <div class="hidden md:flex items-center gap-1.5 text-sm text-gray-500 font-semibold">
                <span style="color:#22c55e;font-size:10px;">●</span>
                <span>৩২ জন এখন দেখছেন</span>
              </div>
              <a href="#order" class="btn-order-nav">🛒 অর্ডার করুন</a>
            </div>
          </div>
        </header>

        <!-- ── HERO / PRODUCT SHOWCASE ──────────────────────── -->
        <section class="premium-hero-section">
          <div class="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

              <!-- Product Gallery -->
              <div style="position:sticky;top:88px;">
                <div class="product-img-main">
                  <div class="absolute" style="top:14px;left:14px;z-index:10;display:flex;flex-direction:column;gap:6px;">
                    <span class="badge-premium" style="background:#fef3c7;color:#d97706;">⭐ বেস্টসেলার</span>
                    <span class="badge-premium" style="background:#fce7f3;color:#be185d;">✨ নতুন কালেকশন</span>
                  </div>
                  <span class="badge-premium absolute" style="top:14px;right:14px;z-index:10;background:#fee2e2;color:#dc2626;">৩১% ছাড়</span>
                  ${heroSliderMarkup({
                    images: defaultHeroImages,
                    alt: 'প্রিমিয়াম বেবি টি-শার্ট',
                    className: 'baby-hero-image',
                  })}
                </div>
                <!-- Thumbnails -->
                <div class="flex gap-3 mt-4 overflow-x-auto pb-1">
                  <div class="product-thumb active"><img src="${defaultHeroImages[0]}" alt="v1" /></div>
                  <div class="product-thumb"><img src="${defaultHeroImages[1]}" alt="v2" /></div>
                  <div class="product-thumb"><img src="${defaultHeroImages[2]}" alt="v3" /></div>
                  <div class="product-thumb"><img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=150&q=80" alt="v4" /></div>
                </div>
                <!-- Social proof under gallery -->
                <div class="mt-4 flex items-center gap-4 rounded-2xl p-4" style="background:linear-gradient(to right,#fff1f2,#fff0f9);">
                  <div class="flex flex-shrink-0" style="margin-right:4px;">
                    <img src="https://i.pravatar.cc/32?img=1" style="width:32px;height:32px;border-radius:50%;border:2px solid #fff;margin-right:-8px;" alt="" />
                    <img src="https://i.pravatar.cc/32?img=5" style="width:32px;height:32px;border-radius:50%;border:2px solid #fff;margin-right:-8px;" alt="" />
                    <img src="https://i.pravatar.cc/32?img=9" style="width:32px;height:32px;border-radius:50%;border:2px solid #fff;margin-right:-8px;" alt="" />
                    <div style="width:32px;height:32px;border-radius:50%;border:2px solid #fff;background:#fce7f3;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#be185d;">+৪৭</div>
                  </div>
                  <div>
                    <div style="color:#f59e0b;font-size:14px;">★★★★★</div>
                    <p style="font-size:12px;color:#64748b;font-weight:600;margin-top:2px;">৩৪৭ জন অভিভাবক ৫ স্টার দিয়েছেন</p>
                  </div>
                </div>
              </div>

              <!-- Product Details -->
              <div class="space-y-5">
                <!-- Breadcrumb -->
                <div class="flex items-center gap-2" style="font-size:12px;color:#94a3b8;">
                  <span>হোম</span><span>/</span><span>বেবি পোশাক</span><span>/</span>
                  <span style="color:#f43f72;font-weight:600;">টি-শার্ট</span>
                </div>
                <!-- Title -->
                <div>
                  <h1 class="section-title-main">
                    প্রিমিয়াম সফট বেবি টি-শার্ট<br/>
                    <span class="shimmer-text">কমফোর্ট কালেকশন ২০২৫</span>
                  </h1>
                  <p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.6;">
                    ১০০% অর্গানিক কটন · নরম স্পর্শ · হাইপোঅ্যালার্জেনিক · মেশিনে ওয়াশযোগ্য
                  </p>
                </div>
                <!-- Rating -->
                <div class="flex items-center gap-3 flex-wrap" style="font-size:14px;">
                  <div class="flex items-center gap-1">
                    <span style="color:#f59e0b;">★★★★★</span>
                    <strong style="color:#1e293b;">4.9</strong>
                  </div>
                  <span style="color:#e2e8f0;">|</span>
                  <span style="color:#64748b;"><strong style="color:#334155;">৩৪৭টি</strong> রিভিউ</span>
                  <span style="color:#e2e8f0;">|</span>
                  <span style="color:#16a34a;font-weight:700;">✓ ২,৪৭৮টি অর্ডার সম্পন্ন</span>
                </div>
                <!-- Pricing -->
                <div style="background:linear-gradient(135deg,#fff1f2,#fff);border:1px solid #fecdd3;border-radius:16px;padding:16px 20px;">
                  <div class="flex items-end gap-3 flex-wrap">
                    <span style="font-size:40px;font-weight:900;color:#0f172a;font-family:'Baloo 2',cursive;line-height:1;">৳৫৯০</span>
                    <div style="padding-bottom:4px;">
                      <div style="font-size:18px;font-weight:700;color:#94a3b8;text-decoration:line-through;">৳৮৫০</div>
                      <div class="flex items-center gap-2">
                        <span style="font-size:12px;font-weight:800;color:#fff;background:#e11d48;padding:2px 10px;border-radius:9999px;">৩১% ছাড়</span>
                        <span style="font-size:12px;color:#16a34a;font-weight:700;">৳২৬০ সাশ্রয়!</span>
                      </div>
                    </div>
                  </div>
                  <p style="font-size:11px;color:#94a3b8;margin-top:6px;">* ডেলিভারি চার্জ আলাদাভাবে যুক্ত হবে</p>
                </div>
                <!-- COD Strip -->
                <div class="cod-strip">
                  <span style="font-size:28px;">🚚</span>
                  <div>
                    <p style="font-weight:800;color:#15803d;font-size:14px;">ক্যাশ অন ডেলিভারি উপলব্ধ</p>
                    <p style="font-size:12px;color:#166534;">পণ্য হাতে পাওয়ার পর টাকা দিন — কোনো অগ্রিম পেমেন্ট নেই</p>
                  </div>
                </div>
                <!-- Order Guidance -->
                <div style="background:linear-gradient(135deg,#fff1f2,#fdf2f8);border:1.5px solid #fecdd3;border-radius:16px;padding:13px 16px;display:flex;align-items:center;gap:12px;">
                  <div style="width:38px;height:38px;border-radius:50%;background:#fff;border:2px solid #fecdd3;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(244,63,114,.12);">
                    <span style="font-size:17px;line-height:1;">📦</span>
                  </div>
                  <div style="flex:1;min-width:0;">
                    <p style="font-weight:800;color:#be185d;font-size:13px;line-height:1.3;">সাইজ নির্বাচন করতে</p>
                    <p style="font-size:12px;color:#64748b;margin-top:2px;">নিচের বাটনে ক্লিক করুন ও অর্ডার দিন</p>
                  </div>
                  <span style="font-size:20px;color:#e11d48;flex-shrink:0;animation:arrowBounce 1.4s ease-in-out infinite;">↓</span>
                </div>
                <!-- CTA -->
                <div style="padding-top:4px;">
                  <a href="#order" class="btn-order-main" style="font-size:16px;padding:15px 28px;border-radius:16px;box-shadow:0 10px 28px rgba(244,63,114,.38),0 2px 8px rgba(244,63,114,.2);">🛒 এখনই অর্ডার করুন — ৳৫৯০</a>
                  <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:5px;"><span class="order-guide-dot"></span> পণ্য হাতে পেয়ে পেমেন্ট · কোনো অগ্রিম নেই</p>
                </div>
                <!-- Mini Trust Grid -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="trust-pill-mini"><span>🔒</span><span>নিরাপদ অর্ডার</span></div>
                  <div class="trust-pill-mini"><span>↩️</span><span>৭ দিন রিটার্ন</span></div>
                  <div class="trust-pill-mini"><span>✅</span><span>আসল পণ্যের গ্যারান্টি</span></div>
                  <div class="trust-pill-mini"><span>📦</span><span>সারাদেশে ডেলিভারি</span></div>
                </div>
                <!-- Delivery Info -->
                <div style="background:#f8fafc;border-radius:16px;padding:16px;border:1px solid #e2e8f0;">
                  <h4 style="font-weight:700;color:#1e293b;font-size:14px;margin-bottom:10px;display:flex;align-items:center;gap:6px;">🗓 ডেলিভারি তথ্য</h4>
                  <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;color:#475569;">
                    <div style="display:flex;align-items:center;gap:10px;"><span>🏙</span><span><strong style="color:#334155;">ঢাকা:</strong> ২-৩ কার্যদিবস · ডেলিভারি চার্জ ৳৮০</span></div>
                    <div style="display:flex;align-items:center;gap:10px;"><span>🗺</span><span><strong style="color:#334155;">ঢাকার বাইরে:</strong> ৩-৫ কার্যদিবস · ডেলিভারি চার্জ ৳১২০</span></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- ── TRUST STRIP ────────────────────────────────────── -->
        <section style="padding:32px 16px;background:linear-gradient(to right,#fff1f2,#fff,#f0f9ff);border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;">
          <div class="max-w-5xl mx-auto">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="trust-feature-card"><span class="trust-icon">🚚</span><div><p style="font-weight:800;color:#1e293b;font-size:14px;">সারাদেশে ডেলিভারি</p><p style="font-size:12px;color:#64748b;">সকল জেলায় পাঠানো হয়</p></div></div>
              <div class="trust-feature-card"><span class="trust-icon">💳</span><div><p style="font-weight:800;color:#1e293b;font-size:14px;">ক্যাশ অন ডেলিভারি</p><p style="font-size:12px;color:#64748b;">পণ্য পেলে পেমেন্ট করুন</p></div></div>
              <div class="trust-feature-card"><span class="trust-icon">✅</span><div><p style="font-weight:800;color:#1e293b;font-size:14px;">আসল পণ্যের নিশ্চয়তা</p><p style="font-size:12px;color:#64748b;">১০০% অর্গানিক কটন</p></div></div>
              <div class="trust-feature-card"><span class="trust-icon">↩️</span><div><p style="font-weight:800;color:#1e293b;font-size:14px;">৭ দিন রিটার্ন</p><p style="font-size:12px;color:#64748b;">সমস্যা হলে ফেরত দিন</p></div></div>
            </div>
            <div style="text-align:center;margin-top:24px;">
              <a href="#order" class="btn-order-main inline">🛒 এখনই অর্ডার করুন — ৳৫৯০</a>
            </div>
          </div>
        </section>

        <!-- ── PRODUCT FEATURES ───────────────────────────────── -->
        <section class="py-14 md:py-20 px-4 md:px-8 bg-white">
          <div class="max-w-7xl mx-auto">
            <div class="text-center mb-12">
              <span class="baby-pill" style="background:#fff1f2;color:#e11d48;border:1px solid #fecdd3;font-size:13px;">পণ্যের বিশেষত্ব</span>
              <h2 class="section-title-main mt-4">কেন আমাদের বেবি টি-শার্ট<br/>অন্যদের চেয়ে আলাদা?</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="feature-card"><div class="feature-icon-wrap" style="background:#fdf2f8;"><span>🌿</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">১০০% অর্গানিক কটন</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">শিশুর ত্বকের জন্য সম্পূর্ণ নিরাপদ। কোনো ক্ষতিকর রাসায়নিক নেই।</p></div>
              <div class="feature-card"><div class="feature-icon-wrap" style="background:#eff6ff;"><span>🧴</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">হাইপোঅ্যালার্জেনিক</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">অ্যালার্জি-মুক্ত কাপড়। সংবেদনশীল ত্বকের শিশুদের জন্যও উপযুক্ত।</p></div>
              <div class="feature-card"><div class="feature-icon-wrap" style="background:#f0fdf4;"><span>🧺</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">মেশিনে ধোয়া যায়</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">সহজে ওয়াশ করুন। রঙ ও ফ্যাব্রিক দীর্ঘস্থায়ী থাকে।</p></div>
              <div class="feature-card"><div class="feature-icon-wrap" style="background:#fefce8;"><span>🎨</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">ভাইব্রান্ট কালার</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">উজ্জ্বল ও দীর্ঘস্থায়ী রঙ। একাধিক ওয়াশের পরেও টাটকা থাকে।</p></div>
              <div class="feature-card"><div class="feature-icon-wrap" style="background:#fdf4ff;"><span>✂️</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">পার্ফেক্ট ফিট</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">বেবি-স্পেসিফিক কাটিং। নড়াচড়ায় সম্পূর্ণ স্বাচ্ছন্দ্য।</p></div>
              <div class="feature-card"><div class="feature-icon-wrap" style="background:#fff1f2;"><span>🎁</span></div><h3 style="font-weight:800;color:#1e293b;font-size:18px;margin-top:16px;">গিফট-রেডি প্যাকেজিং</h3><p style="color:#64748b;margin-top:8px;font-size:14px;line-height:1.65;">সুন্দর উপহার প্যাকেজিং সহ। জন্মদিন বা আকিকার গিফটে পার্ফেক্ট।</p></div>
            </div>
            <div style="text-align:center;margin-top:40px;">
              <a href="#order" class="btn-order-main inline">🛒 এখনই অর্ডার করুন — ৳৫৯০</a>
            </div>
          </div>
        </section>

        <!-- ── SIZE GUIDE ─────────────────────────────────────── -->
        <section id="size-guide" style="padding:56px 16px;background:linear-gradient(135deg,#f8fafc,#eff6ff);">
          <div class="max-w-4xl mx-auto">
            <div class="text-center mb-10">
              <span class="baby-pill" style="background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;font-size:13px;">📏 সাইজ গাইড</span>
              <h2 class="section-title-main mt-4">সঠিক সাইজ বেছে নিন</h2>
              <p style="color:#64748b;margin-top:8px;">আপনার শিশুর বয়স ও ওজন অনুযায়ী সাইজ নির্বাচন করুন</p>
            </div>
            <div style="background:#fff;border-radius:24px;box-shadow:0 4px 24px rgba(0,0,0,.06);border:1px solid #e2e8f0;overflow:hidden;">
              <div style="overflow-x:auto;">
                <table style="width:100%;font-size:14px;border-collapse:collapse;">
                  <thead>
                    <tr style="background:linear-gradient(135deg,#f43f72,#e11d48);color:#fff;">
                      <th style="padding:14px 20px;text-align:left;font-weight:800;">সাইজ</th>
                      <th style="padding:14px 20px;text-align:left;font-weight:800;">বয়স</th>
                      <th style="padding:14px 20px;text-align:left;font-weight:800;">উচ্চতা</th>
                      <th style="padding:14px 20px;text-align:left;font-weight:800;">ওজন</th>
                      <th style="padding:14px 20px;text-align:left;font-weight:800;">বুকের মাপ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom:1px solid #f8fafc;"><td style="padding:13px 20px;font-weight:800;color:#e11d48;">0-3M</td><td style="padding:13px 20px;color:#475569;">নবজাতক–৩ মাস</td><td style="padding:13px 20px;color:#475569;">৫০–৬২ সেমি</td><td style="padding:13px 20px;color:#475569;">৩–৬ কেজি</td><td style="padding:13px 20px;color:#475569;">৩৮ সেমি</td></tr>
                    <tr style="border-bottom:1px solid #f8fafc;background:#fff9fb;"><td style="padding:13px 20px;font-weight:800;color:#e11d48;">3-6M</td><td style="padding:13px 20px;color:#475569;">৩–৬ মাস</td><td style="padding:13px 20px;color:#475569;">৬২–৬৮ সেমি</td><td style="padding:13px 20px;color:#475569;">৬–৮ কেজি</td><td style="padding:13px 20px;color:#475569;">৪২ সেমি</td></tr>
                    <tr style="border-bottom:1px solid #f8fafc;"><td style="padding:13px 20px;font-weight:800;color:#e11d48;">6-9M</td><td style="padding:13px 20px;color:#475569;">৬–৯ মাস</td><td style="padding:13px 20px;color:#475569;">৬৮–৭৪ সেমি</td><td style="padding:13px 20px;color:#475569;">৮–১০ কেজি</td><td style="padding:13px 20px;color:#475569;">৪৪ সেমি</td></tr>
                    <tr style="border-bottom:1px solid #f8fafc;background:#fff9fb;"><td style="padding:13px 20px;font-weight:800;color:#e11d48;">9-12M</td><td style="padding:13px 20px;color:#475569;">৯–১২ মাস</td><td style="padding:13px 20px;color:#475569;">৭৪–৮০ সেমি</td><td style="padding:13px 20px;color:#475569;">৯–১১ কেজি</td><td style="padding:13px 20px;color:#475569;">৪৭ সেমি</td></tr>
                    <tr style="border-bottom:1px solid #f8fafc;"><td style="padding:13px 20px;font-weight:800;color:#e11d48;">12-18M</td><td style="padding:13px 20px;color:#475569;">১২–১৮ মাস</td><td style="padding:13px 20px;color:#475569;">৮০–৮৬ সেমি</td><td style="padding:13px 20px;color:#475569;">১০–১২ কেজি</td><td style="padding:13px 20px;color:#475569;">৪৯ সেমি</td></tr>
                    <tr><td style="padding:13px 20px;font-weight:800;color:#e11d48;">18-24M</td><td style="padding:13px 20px;color:#475569;">১৮–২৪ মাস</td><td style="padding:13px 20px;color:#475569;">৮৬–৯২ সেমি</td><td style="padding:13px 20px;color:#475569;">১১–১৪ কেজি</td><td style="padding:13px 20px;color:#475569;">৫২ সেমি</td></tr>
                  </tbody>
                </table>
              </div>
              <div style="padding:14px 20px;background:#fffbeb;border-top:1px solid #fef3c7;">
                <p style="font-size:12px;color:#92400e;font-weight:600;">💡 <strong>টিপস:</strong> যদি আপনার শিশু দুটো সাইজের মাঝামাঝি হয়, তাহলে বড় সাইজটি নিন।</p>
              </div>
            </div>
            <div style="text-align:center;margin-top:36px;">
              <a href="#order" class="btn-order-main inline">🛒 এখনই অর্ডার করুন — ৳৫৯০</a>
            </div>
          </div>
        </section>

        <!-- ── CUSTOMER REVIEWS ───────────────────────────────── -->
        <section class="py-14 md:py-20 px-4 md:px-8 bg-white">
          <div class="max-w-7xl mx-auto">
            <div class="text-center mb-12">
              <span class="baby-pill" style="background:#fffbeb;color:#d97706;border:1px solid #fde68a;font-size:13px;">⭐ গ্রাহক রিভিউ</span>
              <h2 class="section-title-main mt-4">সন্তুষ্ট মা-বাবার কথা</h2>
              <p style="color:#64748b;margin-top:8px;">আমাদের সত্যিকারের গ্রাহকদের অভিজ্ঞতা</p>
              <!-- Rating Summary -->
              <div class="inline-flex items-center gap-6 rounded-2xl px-8 py-5 mt-6" style="background:linear-gradient(to right,#fffbeb,#fef3c7);border:1px solid #fde68a;">
                <div class="text-center">
                  <div style="font-size:52px;font-weight:900;color:#1e293b;font-family:'Baloo 2',cursive;line-height:1;">4.9</div>
                  <div style="color:#f59e0b;font-size:18px;margin-top:4px;">★★★★★</div>
                  <div style="font-size:12px;color:#64748b;margin-top:4px;">৩৪৭ রিভিউ</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;min-width:160px;">
                  <div class="flex items-center gap-2"><span style="font-size:12px;color:#64748b;width:14px;">5</span><div style="flex:1;background:#e5e7eb;border-radius:9999px;height:7px;"><div style="width:82%;background:#f59e0b;height:7px;border-radius:9999px;"></div></div><span style="font-size:12px;color:#64748b;">82%</span></div>
                  <div class="flex items-center gap-2"><span style="font-size:12px;color:#64748b;width:14px;">4</span><div style="flex:1;background:#e5e7eb;border-radius:9999px;height:7px;"><div style="width:14%;background:#f59e0b;height:7px;border-radius:9999px;"></div></div><span style="font-size:12px;color:#64748b;">14%</span></div>
                  <div class="flex items-center gap-2"><span style="font-size:12px;color:#64748b;width:14px;">3</span><div style="flex:1;background:#e5e7eb;border-radius:9999px;height:7px;"><div style="width:3%;background:#f59e0b;height:7px;border-radius:9999px;"></div></div><span style="font-size:12px;color:#64748b;">3%</span></div>
                  <div class="flex items-center gap-2"><span style="font-size:12px;color:#64748b;width:14px;">2</span><div style="flex:1;background:#e5e7eb;border-radius:9999px;height:7px;"><div style="width:1%;background:#f59e0b;height:7px;border-radius:9999px;"></div></div><span style="font-size:12px;color:#64748b;">1%</span></div>
                  <div class="flex items-center gap-2"><span style="font-size:12px;color:#64748b;width:14px;">1</span><div style="flex:1;background:#e5e7eb;border-radius:9999px;height:7px;"><div style="width:0%;background:#f59e0b;height:7px;border-radius:9999px;"></div></div><span style="font-size:12px;color:#64748b;">0%</span></div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="review-card-premium">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/48?img=47" style="width:48px;height:48px;border-radius:50%;border:2px solid #fecdd3;" alt="" />
                    <div><p style="font-weight:700;color:#1e293b;">নুসরাত জাহান</p><p style="font-size:12px;color:#94a3b8;">ঢাকা, গুলশান</p></div>
                  </div>
                  <span style="font-size:11px;background:#dcfce7;color:#16a34a;font-weight:700;padding:3px 10px;border-radius:9999px;">✓ যাচাইকৃত</span>
                </div>
                <div style="color:#f59e0b;margin-bottom:12px;">★★★★★</div>
                <p style="color:#475569;font-size:14px;line-height:1.7;">"এত নরম কাপড় আগে কখনো দেখিনি! আমার ৬ মাসের ছেলে সারাদিন পরে থাকলেও কোনো র‌্যাশ হয়নি। ডেলিভারি মাত্র ২ দিনে পেয়েছি।"</p>
                <div class="grid grid-cols-2 gap-2 mt-4">
                  <img src="${defaultHeroImages[0]}" style="width:100%;height:90px;object-fit:cover;border-radius:12px;" alt="" />
                  <img src="${defaultHeroImages[1]}" style="width:100%;height:90px;object-fit:cover;border-radius:12px;" alt="" />
                </div>
                <p style="font-size:11px;color:#94a3b8;margin-top:10px;">২ মাস আগে · সাইজ: 6-9M · রঙ: গোলাপি</p>
              </div>
              <div class="review-card-premium">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/48?img=56" style="width:48px;height:48px;border-radius:50%;border:2px solid #bae6fd;" alt="" />
                    <div><p style="font-weight:700;color:#1e293b;">তানভীর আহমেদ</p><p style="font-size:12px;color:#94a3b8;">চট্টগ্রাম</p></div>
                  </div>
                  <span style="font-size:11px;background:#dcfce7;color:#16a34a;font-weight:700;padding:3px 10px;border-radius:9999px;">✓ যাচাইকৃত</span>
                </div>
                <div style="color:#f59e0b;margin-bottom:12px;">★★★★★</div>
                <p style="color:#475569;font-size:14px;line-height:1.7;">"ছেলের জন্মদিনে গিফট হিসেবে কিনেছিলাম। প্যাকেজিং এত সুন্দর ছিল যে আলাদা র‌্যাপ করার দরকার পড়েনি। ৫টি অর্ডার করেছি এখন পর্যন্ত।"</p>
                <img src="${defaultHeroImages[2]}" style="width:100%;height:120px;object-fit:cover;border-radius:12px;margin-top:14px;" alt="" />
                <p style="font-size:11px;color:#94a3b8;margin-top:10px;">১ মাস আগে · সাইজ: 9-12M · রঙ: নীল</p>
              </div>
              <div class="review-card-premium">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/48?img=32" style="width:48px;height:48px;border-radius:50%;border:2px solid #bbf7d0;" alt="" />
                    <div><p style="font-weight:700;color:#1e293b;">সাবিনা আক্তার</p><p style="font-size:12px;color:#94a3b8;">রাজশাহী</p></div>
                  </div>
                  <span style="font-size:11px;background:#dcfce7;color:#16a34a;font-weight:700;padding:3px 10px;border-radius:9999px;">✓ যাচাইকৃত</span>
                </div>
                <div style="color:#f59e0b;margin-bottom:12px;">★★★★★</div>
                <p style="color:#475569;font-size:14px;line-height:1.7;">"ক্যাশ অন ডেলিভারিতে অর্ডার করেছিলাম, নির্ধারিত সময়ে পেয়েছি। মেয়ের গায়ে একটুও অ্যালার্জি হয়নি। আবার অর্ডার করব।"</p>
                <div class="flex gap-2 mt-3 flex-wrap">
                  <span style="font-size:11px;background:#fff1f2;color:#e11d48;font-weight:700;padding:4px 10px;border-radius:9999px;">COD</span>
                  <span style="font-size:11px;background:#f0fdf4;color:#16a34a;font-weight:700;padding:4px 10px;border-radius:9999px;">দ্রুত ডেলিভারি</span>
                  <span style="font-size:11px;background:#eff6ff;color:#2563eb;font-weight:700;padding:4px 10px;border-radius:9999px;">মানসম্পন্ন</span>
                </div>
                <p style="font-size:11px;color:#94a3b8;margin-top:10px;">৩ সপ্তাহ আগে · সাইজ: 12-18M · রঙ: সবুজ</p>
              </div>
            </div>
            <div style="text-align:center;margin-top:40px;">
              <a href="#order" class="btn-order-main inline">🛒 এখনই অর্ডার করুন — ৳৫৯০</a>
            </div>
          </div>
        </section>

        <!-- ── ORDER COUNTER ──────────────────────────────────── -->
        <section style="padding:56px 16px;background:linear-gradient(135deg,#0f172a,#4c0519,#0f172a);">
          <div class="max-w-5xl mx-auto">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div class="stat-card"><p class="stat-number">১০,০০০+</p><p class="stat-label">সন্তুষ্ট পরিবার</p></div>
              <div class="stat-card"><p class="stat-number">4.9/5</p><p class="stat-label">গড় রেটিং</p></div>
              <div class="stat-card"><p class="stat-number">৬৪ জেলা</p><p class="stat-label">ডেলিভারি কভারেজ</p></div>
              <div class="stat-card"><p class="stat-number">৩ বছর</p><p class="stat-label">বিশ্বস্ততার সাথে</p></div>
            </div>
            <div style="text-align:center;margin-top:36px;">
              <a href="#order" class="btn-order-main inline">🛒 এখনই অর্ডার করুন — ৳৫৯০</a>
            </div>
          </div>
        </section>

        <!-- ── FAQ ────────────────────────────────────────────── -->
        <section class="py-14 md:py-20 px-4 md:px-8 bg-white">
          <div class="max-w-3xl mx-auto">
            <div class="text-center mb-10">
              <span class="baby-pill" style="background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;font-size:13px;">সাধারণ প্রশ্ন</span>
              <h2 class="section-title-main mt-4">আপনার প্রশ্নের উত্তর</h2>
            </div>
            <div class="space-y-3">
              <div class="faq-item"><div class="faq-q"><span>টি-শার্টের কাপড় কতটুকু নরম?</span><span style="color:#f43f72;font-size:18px;">+</span></div><div class="faq-a">আমাদের টি-শার্ট ১০০% অর্গানিক কমবেড কটন থেকে তৈরি। ১৮০ GSM ফ্যাব্রিক ব্যবহার করা হয় যা অত্যন্ত নরম এবং টেকসই।</div></div>
              <div class="faq-item"><div class="faq-q"><span>কত দিনে ডেলিভারি পাব?</span><span style="color:#f43f72;font-size:18px;">+</span></div><div class="faq-a">ঢাকার মধ্যে ২-৩ কার্যদিবস। ঢাকার বাইরে ৩-৫ কার্যদিবসে ডেলিভারি দেওয়া হয়।</div></div>
              <div class="faq-item"><div class="faq-q"><span>ভুল সাইজ পেলে কী করব?</span><span style="color:#f43f72;font-size:18px;">+</span></div><div class="faq-a">পণ্য পাওয়ার ৭ দিনের মধ্যে যোগাযোগ করুন। আমরা বিনামূল্যে সাইজ পরিবর্তন বা সম্পূর্ণ ফেরত দেব।</div></div>
              <div class="faq-item"><div class="faq-q"><span>কীভাবে পেমেন্ট করব?</span><span style="color:#f43f72;font-size:18px;">+</span></div><div class="faq-a">শুধুমাত্র ক্যাশ অন ডেলিভারি (COD)। পণ্য হাতে পেয়ে ডেলিভারি ম্যানকে টাকা দিন। কোনো অগ্রিম পেমেন্ট নেই।</div></div>
              <div class="faq-item"><div class="faq-q"><span>ধোয়ার পরেও কি রঙ ঠিক থাকবে?</span><span style="color:#f43f72;font-size:18px;">+</span></div><div class="faq-a">হ্যাঁ। রিঅ্যাক্টিভ ডাইং পদ্ধতিতে তৈরি — ঠান্ডা পানিতে ধোয়ার পরেও রঙ অটুট থাকে।</div></div>
            </div>
            <div style="text-align:center;margin-top:40px;">
              <a href="#order" class="btn-order-main inline">🛒 এখনই অর্ডার করুন — ৳৫৯০</a>
            </div>
          </div>
        </section>

        <!-- ── FINAL ORDER CTA ─────────────────────────────────── -->
        <section id="order" style="padding:64px 16px;background:#fff;position:relative;overflow:hidden;border-top:1px solid #f1f5f9;">
          <div style="position:absolute;top:-60px;right:-60px;width:300px;height:300px;border-radius:50%;background:linear-gradient(135deg,#fff1f2,#fce7f3);pointer-events:none;opacity:.6;"></div>
          <div style="position:absolute;bottom:-60px;left:-60px;width:240px;height:240px;border-radius:50%;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);pointer-events:none;opacity:.6;"></div>
          <div class="relative max-w-4xl mx-auto text-center">
            <span class="baby-pill" style="background:#fff1f2;color:#e11d48;border:1px solid #fecdd3;font-size:13px;margin-bottom:16px;">🎉 সীমিত সময়ের অফার</span>
            <h2 class="baby-heading" style="font-size:clamp(26px,5vw,50px);font-weight:800;color:#0f172a;margin-top:12px;line-height:1.15;">
              আজই অর্ডার করুন<br/>
              <span style="color:#e11d48;">মাত্র ৳৫৯০ — ৩১% ছাড়ে</span>
            </h2>
            <p style="color:#64748b;font-size:15px;margin-top:16px;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.65;">
              ক্যাশ অন ডেলিভারি · পণ্য পেয়ে পেমেন্ট · সারাদেশে ডেলিভারি · ৭ দিন রিটার্ন পলিসি
            </p>
            <!-- Urgency -->
            <div style="display:inline-flex;align-items:center;gap:8px;background:#fff1f2;border:1px solid #fecdd3;border-radius:9999px;padding:10px 20px;margin-top:20px;font-size:14px;font-weight:700;color:#be185d;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e11d48;box-shadow:0 0 0 4px rgba(225,29,72,.2);"></span>
              মাত্র <strong style="color:#e11d48;">১৭টি</strong> স্টক বাকি আছে!
            </div>
            <div style="margin-top:28px;">
              <a href="#order" class="btn-order-main inline" style="font-size:16px;padding:15px 36px;">🛒 এখনই অর্ডার করুন — ৳৫৯০</a>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:16px;padding:16px;text-align:center;"><p style="font-size:22px;font-weight:900;color:#e11d48;font-family:'Baloo 2',cursive;">COD</p><p style="font-size:12px;color:#64748b;margin-top:4px;">ক্যাশ অন ডেলিভারি</p></div>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:16px;text-align:center;"><p style="font-size:22px;font-weight:900;color:#16a34a;font-family:'Baloo 2',cursive;">৭ দিন</p><p style="font-size:12px;color:#64748b;margin-top:4px;">রিটার্ন পলিসি</p></div>
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:16px;text-align:center;"><p style="font-size:22px;font-weight:900;color:#2563eb;font-family:'Baloo 2',cursive;">৬৪</p><p style="font-size:12px;color:#64748b;margin-top:4px;">জেলায় ডেলিভারি</p></div>
              <div style="background:#fefce8;border:1px solid #fef08a;border-radius:16px;padding:16px;text-align:center;"><p style="font-size:22px;font-weight:900;color:#ca8a04;font-family:'Baloo 2',cursive;">১০০%</p><p style="font-size:12px;color:#64748b;margin-top:4px;">অরিজিনাল পণ্য</p></div>
            </div>
          </div>
        </section>

      </div>
    `;

    editor.Commands.add('use-baby-full-template', {
      run(instance) {
        const shouldReplace = window.confirm('বর্তমান design replace করে full Baby T-shirt template বসাতে চান?');
        if (!shouldReplace) return;
        instance.setComponents(FULL_BABY_TEMPLATE);
        instance.addStyle(BABY_TEMPLATE_STYLES);
      },
    });

    editor.Commands.add('use-bold-baby-template', {
      run(instance) {
        const shouldReplace = window.confirm('বর্তমান design replace করে Bold Baby T-shirt template বসাতে চান?');
        if (!shouldReplace) return;
        instance.setComponents(BOLD_BABY_TEMPLATE);
        instance.addStyle(BABY_TEMPLATE_STYLES);
      },
    });

    const addBlock = (id, title, note, icon, category, content) => {
      editor.BlockManager.add(id, {
        label: `
          <div style="text-align:center;padding:10px">
            <div style="font-size:22px;margin-bottom:6px;color:#ec4899">
              <i class="${icon}"></i>
            </div>
            <strong style="font-size:14px;color:#1f2937">${title}</strong>
            <div style="font-size:11px;color:#6b7280">${note}</div>
          </div>
        `,
        category,
        content,
      });
    };

    addBlock(
      'baby-full-template',
      'Full Baby T-Shirt Template',
      'One click complete design',
      'fas fa-layer-group',
      'Full Templates',
      FULL_BABY_TEMPLATE
    );


    addBlock(
      'brand-logo-header',
      'Brand Logo Header',
      'Clean white centered logo',
      'fas fa-crown',
      'Header',
      `
        <header class="w-full bg-white border-b border-gray-100">
          <div class="max-w-7xl mx-auto px-6 py-4 md:py-5 flex justify-center items-center">
            <a href="/" class="inline-flex items-center justify-center">
              <img src="https://via.placeholder.com/180x60?text=LOGO" alt="Brand Logo" class="h-10 md:h-12 w-auto object-contain" />
            </a>
          </div>
        </header>
      `
    );

    addBlock(
      'baby-hero-soft-showcase',
      'Soft Showcase Hero',
      'Baby collection focus',
      'fas fa-baby',
      'Hero',
      `
        <section class="baby-shell bg-gradient-to-br from-pink-50 via-rose-50 to-sky-50">
          <div class="baby-orb w-72 h-72 bg-pink-200 -top-10 -left-10"></div>
          <div class="baby-orb w-80 h-80 bg-sky-200 -bottom-16 -right-12"></div>
          <div class="relative baby-hero-stage">
            <div class="baby-hero-copy text-center lg:text-left">
              <span class="baby-pill bg-white text-pink-500 shadow-sm">New Season Baby T-Shirt Collection</span>
              <h1 class="baby-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mt-6 leading-tight">Soft, Cute and Comfortable Baby T-Shirts for Everyday Joy</h1>
              <p class="text-lg md:text-xl text-slate-600 mt-5 max-w-2xl mx-auto lg:mx-0">Gentle fabric, playful colors, and easy everyday style designed for happy little moments.</p>
            </div>
            <div class="baby-hero-image-frame">
              ${heroSliderMarkup({
                images: [defaultHeroImages[0]],
                alt: 'Baby t-shirt collection',
                className: 'baby-hero-image',
              })}
            </div>
            <div class="baby-hero-actions flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#order" class="baby-btn baby-conversion-cta">Shop Now</a>
              <a href="#size-guide" class="baby-btn bg-white text-slate-700 border border-pink-100">View Size Guide</a>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-hero-split-offer',
      'Split Offer Hero',
      'Modern responsive layout',
      'fas fa-shirt',
      'Hero',
      `
        <section class="baby-shell bg-gradient-to-br from-pink-50 via-rose-50 to-sky-50">
          <div class="baby-orb w-72 h-72 bg-sky-200 top-0 right-0"></div>
          <div class="baby-orb w-72 h-72 bg-rose-200 bottom-0 left-0"></div>
          <div class="relative baby-hero-stage">
            <div class="baby-hero-copy text-center lg:text-left">
              <span class="baby-pill bg-white text-pink-500 shadow-sm">Best Seller for Stylish Babies</span>
              <h1 class="baby-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mt-6 leading-tight">Adorable Baby T-Shirts That Feel as Good as They Look</h1>
              <p class="text-lg md:text-xl text-slate-600 mt-5">From nap time to play time, these breathable baby tees bring comfort, softness, and everyday charm.</p>
            </div>
            <div class="baby-hero-image-frame">
              ${heroSliderMarkup({
                images: [
                  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80',
                ],
                alt: 'Baby t-shirt hero',
                className: 'baby-hero-image',
              })}
            </div>
            <div class="baby-hero-actions flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#order" class="baby-btn baby-conversion-cta">Order Baby T-Shirts</a>
              <a href="#offer" class="baby-btn bg-rose-50 text-rose-500 border border-rose-100">See Today’s Offer</a>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-featured-grid',
      'Featured Product Grid',
      'Best-selling collection',
      'fas fa-grid-2',
      'Featured Products',
      `
        <section style="padding:56px 16px 64px;background:#f8fafc;">
          <div style="max-width:1280px;margin:0 auto;">

            <div style="text-align:center;max-width:600px;margin:0 auto 40px;">
              <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:9999px;background:#fff1f2;color:#e11d48;font-size:12px;font-weight:700;border:1px solid #fecdd3;font-family:'Baloo 2',cursive;">⭐ বেস্টসেলার কালেকশন</span>
              <h2 style="font-size:clamp(24px,4vw,38px);font-weight:900;color:#0f172a;margin-top:12px;line-height:1.2;font-family:'Baloo 2',cursive;">আমাদের সেরা পণ্যগুলো</h2>
              <p style="font-size:14px;color:#64748b;margin-top:10px;line-height:1.65;">সফট ফ্যাব্রিক, সুন্দর রঙ এবং আরামদায়ক ফিট — প্রতিদিনের পরার জন্য পার্ফেক্ট।</p>
            </div>

            <div class="prd-grid">

              <div class="prd-card">
                <div class="prd-img-wrap">
                  <img src="https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=600&q=80" alt="সানি সাফারি টি" loading="lazy" />
                </div>
                <div class="prd-body">
                  <span class="prd-tag">⭐ বেস্টসেলার</span>
                  <p class="prd-name">সানি সাফারি টি</p>
                  <p class="prd-desc">প্রাণিচিত্র প্রিন্ট সহ শ্বাসযোগ্য কমফোর্ট কটন।</p>
                  <div class="prd-price-row">
                    <div class="prd-price-wrap">
                      <span class="prd-price">৳৫৯০</span>
                      <span class="prd-price-old">৳৮৫০</span>
                    </div>
                    <a href="#order" class="prd-btn">🛒 অর্ডার</a>
                  </div>
                </div>
              </div>

              <div class="prd-card">
                <div class="prd-img-wrap">
                  <img src="https://images.unsplash.com/photo-1519340333755-c1aa5571fd46?auto=format&fit=crop&w=600&q=80" alt="হ্যাপি স্টার টি" loading="lazy" />
                </div>
                <div class="prd-body">
                  <span class="prd-tag">🔥 জনপ্রিয়</span>
                  <p class="prd-name">হ্যাপি স্টার টি</p>
                  <p class="prd-desc">নরম সিম এবং বেবি-ফ্রেন্ডলি ফিট নড়াচড়ার জন্য।</p>
                  <div class="prd-price-row">
                    <div class="prd-price-wrap">
                      <span class="prd-price">৳৬২০</span>
                      <span class="prd-price-old">৳৯০০</span>
                    </div>
                    <a href="#order" class="prd-btn">🛒 অর্ডার</a>
                  </div>
                </div>
              </div>

              <div class="prd-card">
                <div class="prd-img-wrap">
                  <img src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80" alt="লিটল ক্লাউড টি" loading="lazy" />
                </div>
                <div class="prd-body">
                  <span class="prd-tag">✨ নতুন</span>
                  <p class="prd-name">লিটল ক্লাউড টি</p>
                  <p class="prd-desc">মিষ্টি প্যাস্টেল লুক আরামদায়ক প্রতিদিনের পোশাকের জন্য।</p>
                  <div class="prd-price-row">
                    <div class="prd-price-wrap">
                      <span class="prd-price">৳৬৪০</span>
                      <span class="prd-price-old">৳৯৫০</span>
                    </div>
                    <a href="#order" class="prd-btn">🛒 অর্ডার</a>
                  </div>
                </div>
              </div>

              <div class="prd-card">
                <div class="prd-img-wrap">
                  <img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80" alt="রেইনবো ড্রিম টি" loading="lazy" />
                </div>
                <div class="prd-body">
                  <span class="prd-tag">🎁 গিফট-রেডি</span>
                  <p class="prd-name">রেইনবো ড্রিম টি</p>
                  <p class="prd-desc">উজ্জ্বল রঙ ও গিফট প্যাকেজিং সহ আদর্শ উপহার।</p>
                  <div class="prd-price-row">
                    <div class="prd-price-wrap">
                      <span class="prd-price">৳৬৭০</span>
                      <span class="prd-price-old">৳৯৮০</span>
                    </div>
                    <a href="#order" class="prd-btn">🛒 অর্ডার</a>
                  </div>
                </div>
              </div>

            </div>

            <div style="text-align:center;margin-top:36px;">
              <a href="#order" class="btn-order-main inline">🛒 সব পণ্য অর্ডার করুন — COD উপলব্ধ</a>
            </div>

          </div>
        </section>
      `
    );

    addBlock(
      'baby-featured-carousel-look',
      'Best Seller Showcase',
      'Large product spotlight',
      'fas fa-store',
      'Featured Products',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-gradient-to-b from-rose-50 to-white">
          <div class="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
            <div>
              <span class="baby-pill bg-white text-rose-500 shadow-sm">Top Pick This Week</span>
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800 mt-4">Best Seller Baby Tee Collection</h2>
              <p class="text-slate-600 mt-5 text-lg">A charming mix of comfort, cute colors, and daily wearability that parents love.</p>
              <div class="space-y-4 mt-8">
                <div class="rounded-2xl bg-white p-4 shadow-sm border border-rose-100">Soft cotton feel for all-day comfort</div>
                <div class="rounded-2xl bg-white p-4 shadow-sm border border-sky-100">Easy match colors for quick outfit planning</div>
                <div class="rounded-2xl bg-white p-4 shadow-sm border border-amber-100">Great for playtime, sleep time, and gifting</div>
              </div>
            </div>
            <div class="baby-card rounded-[32px] p-4 md:p-6">
              <img src="https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=1000&q=80" alt="Best seller baby t-shirt" class="w-full h-[340px] md:h-[520px] rounded-[26px] object-cover" />
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-photo-gallery-order',
      'Product Photo Gallery',
      'Showcase 4 to 8 product photos with lightbox',
      'fas fa-images',
      'Photo Gallery',
      `
        <section style="padding:56px 16px 64px;background:#fff;">
          <div style="max-width:1200px;margin:0 auto;">

            <!-- Section header -->
            <div style="text-align:center;max-width:560px;margin:0 auto 40px;">
              <span style="display:inline-block;background:#fff0f6;color:#e11d74;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 16px;border-radius:999px;margin-bottom:14px;">📸 প্রোডাক্ট গ্যালারি</span>
              <h2 style="font-size:clamp(22px,4vw,34px);font-weight:800;color:#1e293b;line-height:1.25;margin:0 0 12px;">প্রতিটি কোণ থেকে দেখুন</h2>
              <p style="font-size:15px;color:#64748b;margin:0;line-height:1.65;">আসল পণ্যের ছবি দেখে নিশ্চিত হন — ফ্যাব্রিক, রং ও ডিজাইন সবই স্পষ্ট।</p>
            </div>

            <!-- Photo grid -->
            <div class="gal-grid">

              <!-- Photo 1 -->
              <div class="gal-item">
                <div class="gal-item-inner">
                  <img src="https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=700&q=80" alt="বেবি টি-শার্ট — সামনের ভিউ" loading="lazy" />
                  <a href="#gal-1" class="gal-overlay" aria-label="বড় করে দেখুন">
                    <span class="gal-eye">🔍</span>
                  </a>
                </div>
              </div>

              <!-- Photo 2 -->
              <div class="gal-item">
                <div class="gal-item-inner">
                  <img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80" alt="বেবি টি-শার্ট — পেছনের ভিউ" loading="lazy" />
                  <a href="#gal-2" class="gal-overlay" aria-label="বড় করে দেখুন">
                    <span class="gal-eye">🔍</span>
                  </a>
                </div>
              </div>

              <!-- Photo 3 -->
              <div class="gal-item">
                <div class="gal-item-inner">
                  <img src="https://images.unsplash.com/photo-1519340333755-c1aa5571fd46?auto=format&fit=crop&w=700&q=80" alt="বেবি টি-শার্ট — নীল রং" loading="lazy" />
                  <a href="#gal-3" class="gal-overlay" aria-label="বড় করে দেখুন">
                    <span class="gal-eye">🔍</span>
                  </a>
                </div>
              </div>

              <!-- Photo 4 -->
              <div class="gal-item">
                <div class="gal-item-inner">
                  <img src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=700&q=80" alt="বেবি টি-শার্ট — প্যাস্টেল" loading="lazy" />
                  <a href="#gal-4" class="gal-overlay" aria-label="বড় করে দেখুন">
                    <span class="gal-eye">🔍</span>
                  </a>
                </div>
              </div>

              <!-- Photo 5 -->
              <div class="gal-item">
                <div class="gal-item-inner">
                  <img src="https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=700&q=80" alt="বেবি টি-শার্ট — প্রিন্টেড" loading="lazy" />
                  <a href="#gal-5" class="gal-overlay" aria-label="বড় করে দেখুন">
                    <span class="gal-eye">🔍</span>
                  </a>
                </div>
              </div>

              <!-- Photo 6 -->
              <div class="gal-item">
                <div class="gal-item-inner">
                  <img src="https://images.unsplash.com/photo-1519340333755-c1aa5571fd46?auto=format&fit=crop&w=700&q=80" alt="বেবি টি-শার্ট — সাইড ভিউ" loading="lazy" />
                  <a href="#gal-6" class="gal-overlay" aria-label="বড় করে দেখুন">
                    <span class="gal-eye">🔍</span>
                  </a>
                </div>
              </div>

              <!-- Photo 7 -->
              <div class="gal-item">
                <div class="gal-item-inner">
                  <img src="https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=700&q=80" alt="বেবি টি-শার্ট — ক্লোজ-আপ" loading="lazy" />
                  <a href="#gal-7" class="gal-overlay" aria-label="বড় করে দেখুন">
                    <span class="gal-eye">🔍</span>
                  </a>
                </div>
              </div>

              <!-- Photo 8 -->
              <div class="gal-item">
                <div class="gal-item-inner">
                  <img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80" alt="বেবি টি-শার্ট — প্যাকেজিং" loading="lazy" />
                  <a href="#gal-8" class="gal-overlay" aria-label="বড় করে দেখুন">
                    <span class="gal-eye">🔍</span>
                  </a>
                </div>
              </div>

            </div><!-- /gal-grid -->

            <!-- CSS-only lightbox overlays -->
            <div id="gal-1" class="gal-lb"><a href="#" class="gal-lb-close" aria-label="বন্ধ করুন">✕</a><img src="https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=1200&q=90" class="gal-lb-img" alt="বেবি টি-শার্ট — সামনের ভিউ" /></div>
            <div id="gal-2" class="gal-lb"><a href="#" class="gal-lb-close" aria-label="বন্ধ করুন">✕</a><img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=90" class="gal-lb-img" alt="বেবি টি-শার্ট — পেছনের ভিউ" /></div>
            <div id="gal-3" class="gal-lb"><a href="#" class="gal-lb-close" aria-label="বন্ধ করুন">✕</a><img src="https://images.unsplash.com/photo-1519340333755-c1aa5571fd46?auto=format&fit=crop&w=1200&q=90" class="gal-lb-img" alt="বেবি টি-শার্ট — নীল রং" /></div>
            <div id="gal-4" class="gal-lb"><a href="#" class="gal-lb-close" aria-label="বন্ধ করুন">✕</a><img src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=90" class="gal-lb-img" alt="বেবি টি-শার্ট — প্যাস্টেল" /></div>
            <div id="gal-5" class="gal-lb"><a href="#" class="gal-lb-close" aria-label="বন্ধ করুন">✕</a><img src="https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=1200&q=90" class="gal-lb-img" alt="বেবি টি-শার্ট — প্রিন্টেড" /></div>
            <div id="gal-6" class="gal-lb"><a href="#" class="gal-lb-close" aria-label="বন্ধ করুন">✕</a><img src="https://images.unsplash.com/photo-1519340333755-c1aa5571fd46?auto=format&fit=crop&w=1200&q=90" class="gal-lb-img" alt="বেবি টি-শার্ট — সাইড ভিউ" /></div>
            <div id="gal-7" class="gal-lb"><a href="#" class="gal-lb-close" aria-label="বন্ধ করুন">✕</a><img src="https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=1200&q=90" class="gal-lb-img" alt="বেবি টি-শার্ট — ক্লোজ-আপ" /></div>
            <div id="gal-8" class="gal-lb"><a href="#" class="gal-lb-close" aria-label="বন্ধ করুন">✕</a><img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=90" class="gal-lb-img" alt="বেবি টি-শার্ট — প্যাকেজিং" /></div>

            <!-- Footer CTA -->
            <div style="text-align:center;margin-top:40px;">
              <a href="#order" class="btn-order-main inline">🛒 এখনই অর্ডার করুন — ক্যাশ অন ডেলিভারি</a>
            </div>

          </div>
        </section>
      `
    );

    addBlock(
      'baby-benefits-cards',
      'Comfort Benefits Cards',
      'Four core advantages',
      'fas fa-heart',
      'Product Benefits',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-white">
          <div class="max-w-7xl mx-auto">
            <div class="text-center max-w-3xl mx-auto mb-12">
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800">Product Benefits</h2>
              <p class="text-slate-600 mt-4 text-lg">Designed to feel gentle, light, and practical for real everyday parenting.</p>
            </div>
            <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <div class="baby-card rounded-[28px] p-6"><div class="w-12 h-12 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center text-xl"><i class="fas fa-feather"></i></div><h3 class="text-xl font-extrabold text-slate-800 mt-4">Ultra Soft</h3><p class="text-slate-600 mt-2">Smooth against delicate baby skin.</p></div>
              <div class="baby-card rounded-[28px] p-6"><div class="w-12 h-12 rounded-2xl bg-sky-100 text-sky-500 flex items-center justify-center text-xl"><i class="fas fa-wind"></i></div><h3 class="text-xl font-extrabold text-slate-800 mt-4">Breathable</h3><p class="text-slate-600 mt-2">Helps babies stay cool and comfy.</p></div>
              <div class="baby-card rounded-[28px] p-6"><div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center text-xl"><i class="fas fa-soap"></i></div><h3 class="text-xl font-extrabold text-slate-800 mt-4">Easy Wash</h3><p class="text-slate-600 mt-2">Stays fresh after repeat washes.</p></div>
              <div class="baby-card rounded-[28px] p-6"><div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-500 flex items-center justify-center text-xl"><i class="fas fa-child"></i></div><h3 class="text-xl font-extrabold text-slate-800 mt-4">Easy Movement</h3><p class="text-slate-600 mt-2">Perfect for crawling and play.</p></div>
            </div>
            <div class="text-center mt-10">
              <a href="#order" class="baby-btn baby-conversion-cta">Order Now - Limited Offer</a>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-benefits-split',
      'Softness Benefit Story',
      'Split layout benefits',
      'fas fa-shield-heart',
      'Product Benefits',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-gradient-to-b from-rose-50 to-white">
          <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
            <div class="baby-card rounded-[32px] p-4 md:p-6">
              <img src="https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=1000&q=80" alt="Soft baby wear" class="w-full h-[320px] md:h-[500px] rounded-[26px] object-cover" />
            </div>
            <div>
              <span class="baby-pill bg-white text-rose-500 shadow-sm">Made for Comfort</span>
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800 mt-4">Why These Baby T-Shirts Feel Better</h2>
              <div class="space-y-5 mt-8">
                <div><h3 class="text-xl font-extrabold text-slate-800">Skin-Friendly Feel</h3><p class="text-slate-600 mt-2">Gentle fabric supports comfortable wear for longer hours.</p></div>
                <div><h3 class="text-xl font-extrabold text-slate-800">Lightweight Daily Use</h3><p class="text-slate-600 mt-2">Perfect for indoors, outings, and layered baby outfits.</p></div>
                <div><h3 class="text-xl font-extrabold text-slate-800">Cute and Practical</h3><p class="text-slate-600 mt-2">Adorable style without sacrificing comfort and function.</p></div>
              </div>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-size-color-grid',
      'Size and Color Grid',
      'Quick comparison layout',
      'fas fa-ruler-combined',
      'Size and Color',
      `
        <section id="size-guide" class="py-14 md:py-20 px-5 md:px-8 bg-white">
          <div class="max-w-7xl mx-auto">
            <div class="text-center max-w-3xl mx-auto mb-12">
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800">Size and Color Options</h2>
              <p class="text-slate-600 mt-4 text-lg">Help parents choose quickly with a simple size guide and sweet pastel colors.</p>
            </div>
            <div class="grid lg:grid-cols-2 gap-8">
              <div class="baby-card rounded-[30px] p-6 md:p-8">
                <h3 class="text-2xl font-extrabold text-slate-800">Size Guide</h3>
                <div class="mt-6 space-y-4">
                  <div class="flex items-center justify-between rounded-2xl bg-rose-50 px-5 py-4"><span class="font-bold text-slate-800">0 - 6 Months</span><span class="text-slate-600">Tiny Fit</span></div>
                  <div class="flex items-center justify-between rounded-2xl bg-sky-50 px-5 py-4"><span class="font-bold text-slate-800">6 - 12 Months</span><span class="text-slate-600">Growing Fit</span></div>
                  <div class="flex items-center justify-between rounded-2xl bg-amber-50 px-5 py-4"><span class="font-bold text-slate-800">1 - 2 Years</span><span class="text-slate-600">Toddler Fit</span></div>
                  <div class="flex items-center justify-between rounded-2xl bg-emerald-50 px-5 py-4"><span class="font-bold text-slate-800">2 - 3 Years</span><span class="text-slate-600">Play Fit</span></div>
                </div>
              </div>
              <div class="baby-card rounded-[30px] p-6 md:p-8">
                <h3 class="text-2xl font-extrabold text-slate-800">Color Options</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div class="text-center"><div class="w-16 h-16 mx-auto rounded-full bg-pink-200 border-4 border-white shadow-md"></div><p class="mt-3 font-semibold text-slate-700">Blush Pink</p></div>
                  <div class="text-center"><div class="w-16 h-16 mx-auto rounded-full bg-sky-200 border-4 border-white shadow-md"></div><p class="mt-3 font-semibold text-slate-700">Baby Blue</p></div>
                  <div class="text-center"><div class="w-16 h-16 mx-auto rounded-full bg-amber-200 border-4 border-white shadow-md"></div><p class="mt-3 font-semibold text-slate-700">Warm Butter</p></div>
                  <div class="text-center"><div class="w-16 h-16 mx-auto rounded-full bg-emerald-200 border-4 border-white shadow-md"></div><p class="mt-3 font-semibold text-slate-700">Mint Green</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-size-color-showcase',
      'Fit and Shades Showcase',
      'Visual size and tone display',
      'fas fa-swatchbook',
      'Size and Color',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-gradient-to-b from-sky-50 to-white">
          <div class="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.05fr] gap-10 items-center">
            <div>
              <span class="baby-pill bg-white text-sky-500 shadow-sm">Easy to Choose</span>
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800 mt-4">Pick the Right Fit and Favorite Shade</h2>
              <p class="text-slate-600 mt-5 text-lg">A simple size flow and calm pastel palette make ordering faster for busy parents.</p>
              <div class="grid sm:grid-cols-2 gap-4 mt-8">
                <div class="rounded-2xl bg-white p-5 shadow-sm border border-sky-100"><div class="font-bold text-slate-800">Sizes</div><p class="text-slate-600 mt-2 text-sm">From newborn comfort to toddler-ready fit.</p></div>
                <div class="rounded-2xl bg-white p-5 shadow-sm border border-rose-100"><div class="font-bold text-slate-800">Colors</div><p class="text-slate-600 mt-2 text-sm">Soft tones designed to feel warm and photo-friendly.</p></div>
              </div>
            </div>
            <div class="baby-card rounded-[32px] p-6 md:p-8">
              <div class="space-y-5">
                <div class="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4"><span class="font-bold">Size XS</span><span class="text-slate-500">0 - 6 Months</span></div>
                <div class="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4"><span class="font-bold">Size S</span><span class="text-slate-500">6 - 12 Months</span></div>
                <div class="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4"><span class="font-bold">Size M</span><span class="text-slate-500">1 - 2 Years</span></div>
              </div>
              <div class="grid grid-cols-4 gap-4 mt-8">
                <div class="h-14 rounded-2xl bg-pink-200"></div>
                <div class="h-14 rounded-2xl bg-sky-200"></div>
                <div class="h-14 rounded-2xl bg-yellow-200"></div>
                <div class="h-14 rounded-2xl bg-green-200"></div>
              </div>
            </div>
          </div>
          <div class="max-w-7xl mx-auto text-center mt-10">
            <a href="#order" class="baby-btn baby-conversion-cta">Order Now - Limited Offer</a>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-offer-sale',
      'Limited Time Offer',
      'Discount driven section',
      'fas fa-tags',
      'Special Offer',
      `
        <section id="offer" class="baby-offer-section py-14 md:py-20 px-5 md:px-8 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 text-black">
          <div class="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div>
              <span class="baby-pill bg-white/20 text-white">Limited Time Offer</span>
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-black mt-4">Buy 2 Baby T-Shirts and Get 15% Off Today</h2>
              <p class="mt-5 text-lg text-white/90">Build a sweet mini wardrobe with our most-loved styles and enjoy savings on your favorite colors.</p>
              <div class="flex flex-col sm:flex-row gap-4 mt-8">
                <a href="#order" class="baby-btn bg-white text-rose-500">Claim This Offer</a>
                <div class="baby-btn bg-white/15 text-white border border-white/20">Ends Tonight</div>
              </div>
            </div>
            <div class="baby-card rounded-[32px] p-6 text-slate-800 text-center">
              <div class="text-sm font-bold uppercase tracking-[0.2em] text-rose-400">Special Bundle</div>
              <div class="mt-4 text-5xl font-extrabold text-slate-900">15% OFF</div>
              <p class="mt-3 text-slate-600">On any 2 or more baby T-shirts from the featured collection.</p>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-offer-bundle',
      'Bundle Savings Banner',
      'Offer with trust points',
      'fas fa-gift',
      'Special Offer',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-white">
          <div class="max-w-7xl mx-auto rounded-[36px] bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 p-8 md:p-12 shadow-sm border border-rose-100">
            <div class="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span class="baby-pill bg-white text-amber-500 shadow-sm">Bundle Deal</span>
                <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800 mt-4">Save More When You Shop More</h2>
                <p class="text-slate-600 mt-5 text-lg">Choose multiple baby tees in matching or mixed colors and enjoy a smart value pack.</p>
                <a href="#order" class="baby-btn bg-slate-900 text-white mt-8">Get Bundle Price</a>
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="rounded-3xl bg-white p-5 shadow-sm"><div class="text-2xl font-extrabold text-rose-500">2+</div><p class="text-slate-600 mt-2 text-sm">Enjoy better value on multi-item orders.</p></div>
                <div class="rounded-3xl bg-white p-5 shadow-sm"><div class="text-2xl font-extrabold text-sky-500">COD</div><p class="text-slate-600 mt-2 text-sm">Easy payment support for confidence.</p></div>
                <div class="rounded-3xl bg-white p-5 shadow-sm"><div class="text-2xl font-extrabold text-amber-500">Fast</div><p class="text-slate-600 mt-2 text-sm">Quick order processing and delivery.</p></div>
                <div class="rounded-3xl bg-white p-5 shadow-sm"><div class="text-2xl font-extrabold text-emerald-500">Loved</div><p class="text-slate-600 mt-2 text-sm">Popular with parents shopping repeats.</p></div>
              </div>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-reviews-cards',
      'Happy Parent Reviews',
      'Three testimonial cards',
      'fas fa-star',
      'Customer Reviews',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-rose-50/70">
          <div class="max-w-7xl mx-auto">
            <div class="text-center max-w-3xl mx-auto mb-12">
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800">Customer Reviews</h2>
              <p class="text-slate-600 mt-4 text-lg">Real feedback from happy parents who love comfort, quality, and cute design.</p>
            </div>
            <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              <div class="baby-card rounded-[28px] p-7"><div class="text-amber-400 text-lg">★★★★★</div><p class="text-slate-600 mt-4">The fabric feels so soft and the fit is adorable. My baby stayed comfortable all day.</p><div class="mt-6"><div class="font-extrabold text-slate-800">Nusrat Jahan</div><div class="text-sm text-slate-500">Mother of 8-month-old</div></div></div>
              <div class="baby-card rounded-[28px] p-7"><div class="text-amber-400 text-lg">★★★★★</div><p class="text-slate-600 mt-4">The colors are even prettier in real life, and the T-shirt still looked great after washing.</p><div class="mt-6"><div class="font-extrabold text-slate-800">Tanvir Ahmed</div><div class="text-sm text-slate-500">Parent of twin toddlers</div></div></div>
              <div class="baby-card rounded-[28px] p-7"><div class="text-amber-400 text-lg">★★★★★</div><p class="text-slate-600 mt-4">Great value and lovely quality. We ordered two more because the first set was a big hit.</p><div class="mt-6"><div class="font-extrabold text-slate-800">Sabina Akter</div><div class="text-sm text-slate-500">First-time mom</div></div></div>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-reviews-stats',
      'Trust and Rating Stats',
      'Numbers-driven proof',
      'fas fa-chart-line',
      'Customer Reviews',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-slate-900 text-white">
          <div class="max-w-6xl mx-auto text-center">
            <h2 class="baby-heading text-3xl md:text-5xl font-bold">Parents Trust Our Baby Collection</h2>
            <p class="text-slate-300 mt-4 text-lg">Strong social proof helps shoppers feel confident before placing an order.</p>
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div class="rounded-3xl bg-white/5 p-6"><div class="text-4xl font-extrabold text-pink-300">4.9/5</div><p class="text-slate-300 mt-2">Average rating</p></div>
              <div class="rounded-3xl bg-white/5 p-6"><div class="text-4xl font-extrabold text-sky-300">12k+</div><p class="text-slate-300 mt-2">Happy families</p></div>
              <div class="rounded-3xl bg-white/5 p-6"><div class="text-4xl font-extrabold text-amber-300">98%</div><p class="text-slate-300 mt-2">Repeat shoppers</p></div>
              <div class="rounded-3xl bg-white/5 p-6"><div class="text-4xl font-extrabold text-emerald-300">Fast</div><p class="text-slate-300 mt-2">Support and delivery</p></div>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-why-choose-cards',
      'Why Choose Us Cards',
      'Brand trust highlights',
      'fas fa-award',
      'Why Choose Us',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-white">
          <div class="max-w-7xl mx-auto">
            <div class="text-center max-w-3xl mx-auto mb-12">
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800">Why Choose Us</h2>
              <p class="text-slate-600 mt-4 text-lg">Build buyer confidence with quality promises and a smooth shopping experience.</p>
            </div>
            <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div class="rounded-[28px] border border-rose-100 p-6 bg-rose-50"><h3 class="text-xl font-extrabold text-slate-800">Parent-Approved Quality</h3><p class="text-slate-600 mt-3">Curated fabric and fit that feel premium and reliable.</p></div>
              <div class="rounded-[28px] border border-sky-100 p-6 bg-sky-50"><h3 class="text-xl font-extrabold text-slate-800">Cute, Gift-Ready Designs</h3><p class="text-slate-600 mt-3">Lovely colors and styles for everyday outfits and special gifting.</p></div>
              <div class="rounded-[28px] border border-amber-100 p-6 bg-amber-50"><h3 class="text-xl font-extrabold text-slate-800">Easy Ordering</h3><p class="text-slate-600 mt-3">Quick product selection, simple payment, and less buying friction.</p></div>
              <div class="rounded-[28px] border border-emerald-100 p-6 bg-emerald-50"><h3 class="text-xl font-extrabold text-slate-800">Friendly Support</h3><p class="text-slate-600 mt-3">Help with size, color, and order updates whenever needed.</p></div>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-why-choose-split',
      'Why Families Pick Us',
      'Split trust section',
      'fas fa-medal',
      'Why Choose Us',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-gradient-to-b from-white to-sky-50">
          <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
            <div class="baby-card rounded-[32px] p-6 md:p-8">
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800">Why Families Love Shopping Here</h2>
              <p class="text-slate-600 mt-5 text-lg">We combine comfort, style, and convenience to help parents shop confidently and fast.</p>
            </div>
            <div class="space-y-4">
              <div class="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100"><div class="font-extrabold text-slate-800">Comfort First</div><p class="text-slate-600 mt-2">Baby-friendly materials designed for soft all-day wear.</p></div>
              <div class="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100"><div class="font-extrabold text-slate-800">Pretty Color Stories</div><p class="text-slate-600 mt-2">Soft tones that feel modern, sweet, and easy to match.</p></div>
              <div class="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100"><div class="font-extrabold text-slate-800">Smooth Delivery Support</div><p class="text-slate-600 mt-2">Simple ordering and dependable fulfillment.</p></div>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-delivery-cards',
      'Delivery Info Cards',
      'Clear shipping details',
      'fas fa-truck',
      'Delivery Information',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-gradient-to-b from-sky-50 to-white">
          <div class="max-w-6xl mx-auto">
            <div class="text-center max-w-3xl mx-auto mb-12">
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800">Delivery Information</h2>
              <p class="text-slate-600 mt-4 text-lg">Clear shipping details help parents shop with confidence and complete orders faster.</p>
            </div>
            <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div class="baby-card rounded-[28px] p-6"><div class="text-sky-500 text-2xl"><i class="fas fa-location-dot"></i></div><h3 class="text-xl font-extrabold text-slate-800 mt-4">Nationwide Delivery</h3><p class="text-slate-600 mt-2">We deliver across the country with trusted partners.</p></div>
              <div class="baby-card rounded-[28px] p-6"><div class="text-emerald-500 text-2xl"><i class="fas fa-box-open"></i></div><h3 class="text-xl font-extrabold text-slate-800 mt-4">Careful Packaging</h3><p class="text-slate-600 mt-2">Each order is packed neatly for a clean unboxing experience.</p></div>
              <div class="baby-card rounded-[28px] p-6"><div class="text-amber-500 text-2xl"><i class="fas fa-money-bill-wave"></i></div><h3 class="text-xl font-extrabold text-slate-800 mt-4">Cash on Delivery</h3><p class="text-slate-600 mt-2">Easy payment support helps reduce hesitation.</p></div>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-delivery-timeline',
      'Shipping Timeline',
      'Step-by-step delivery flow',
      'fas fa-route',
      'Delivery Information',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-white">
          <div class="max-w-6xl mx-auto">
            <div class="text-center max-w-3xl mx-auto mb-12">
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800">How Delivery Works</h2>
              <p class="text-slate-600 mt-4 text-lg">A simple order timeline makes the process clear and trustworthy.</p>
            </div>
            <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div class="rounded-[28px] bg-rose-50 p-6 text-center"><div class="text-3xl font-extrabold text-rose-500">1</div><h3 class="font-extrabold text-slate-800 mt-3">Place Order</h3><p class="text-slate-600 mt-2 text-sm">Choose style, size, and color.</p></div>
              <div class="rounded-[28px] bg-sky-50 p-6 text-center"><div class="text-3xl font-extrabold text-sky-500">2</div><h3 class="font-extrabold text-slate-800 mt-3">Quick Processing</h3><p class="text-slate-600 mt-2 text-sm">We prepare your order carefully.</p></div>
              <div class="rounded-[28px] bg-amber-50 p-6 text-center"><div class="text-3xl font-extrabold text-amber-500">3</div><h3 class="font-extrabold text-slate-800 mt-3">Courier Dispatch</h3><p class="text-slate-600 mt-2 text-sm">Order moves safely to your address.</p></div>
              <div class="rounded-[28px] bg-emerald-50 p-6 text-center"><div class="text-3xl font-extrabold text-emerald-500">4</div><h3 class="font-extrabold text-slate-800 mt-3">Receive and Enjoy</h3><p class="text-slate-600 mt-2 text-sm">Your baby’s new outfit arrives ready.</p></div>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-faq-cards',
      'FAQ Cards',
      'Helpful order answers',
      'fas fa-circle-question',
      'FAQ',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-white">
          <div class="max-w-5xl mx-auto">
            <div class="text-center max-w-3xl mx-auto mb-12">
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800">FAQ Section</h2>
              <p class="text-slate-600 mt-4 text-lg">Answer common buying questions clearly to help parents order without confusion.</p>
            </div>
            <div class="space-y-4">
              <div class="rounded-[24px] border border-slate-200 p-6 bg-slate-50"><h3 class="text-lg md:text-xl font-extrabold text-slate-800">What fabric are the baby T-shirts made from?</h3><p class="text-slate-600 mt-3">Soft, breathable fabric designed for comfortable daily wear.</p></div>
              <div class="rounded-[24px] border border-slate-200 p-6 bg-slate-50"><h3 class="text-lg md:text-xl font-extrabold text-slate-800">How do I choose the right size?</h3><p class="text-slate-600 mt-3">Use the size guide above. If in between, choose one size up.</p></div>
              <div class="rounded-[24px] border border-slate-200 p-6 bg-slate-50"><h3 class="text-lg md:text-xl font-extrabold text-slate-800">Do the colors last after washing?</h3><p class="text-slate-600 mt-3">Yes, the colors are designed to stay fresh with normal wash care.</p></div>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-faq-split',
      'Common Questions Layout',
      'Two-column FAQ style',
      'fas fa-comments',
      'FAQ',
      `
        <section class="py-14 md:py-20 px-5 md:px-8 bg-gradient-to-b from-rose-50 to-white">
          <div class="max-w-7xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <div>
              <span class="baby-pill bg-white text-rose-500 shadow-sm">Need Help?</span>
              <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800 mt-4">Frequently Asked Questions</h2>
              <p class="text-slate-600 mt-5 text-lg">Give shoppers confidence by answering the most important concerns before checkout.</p>
            </div>
            <div class="space-y-4">
              <div class="rounded-[24px] bg-white p-6 shadow-sm border border-rose-100"><h3 class="font-extrabold text-slate-800">Is cash on delivery available?</h3><p class="text-slate-600 mt-3">Yes, cash on delivery is available in supported areas.</p></div>
              <div class="rounded-[24px] bg-white p-6 shadow-sm border border-sky-100"><h3 class="font-extrabold text-slate-800">Are these suitable for gifting?</h3><p class="text-slate-600 mt-3">Absolutely. The styles and colors are gift-friendly and parent-approved.</p></div>
              <div class="rounded-[24px] bg-white p-6 shadow-sm border border-amber-100"><h3 class="font-extrabold text-slate-800">Can I order multiple colors?</h3><p class="text-slate-600 mt-3">Yes, mix colors and sizes to build your own mini bundle.</p></div>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-cta-dark',
      'Final Order CTA',
      'Strong conversion section',
      'fas fa-bullhorn',
      'Call to Action',
      `
        <section id="order" class="baby-shell baby-order-section py-16 md:py-24 px-5 md:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-pink-900 text-white">
          <div class="baby-orb w-72 h-72 bg-pink-400 top-0 right-0"></div>
          <div class="baby-orb w-72 h-72 bg-sky-400 bottom-0 left-0"></div>
          <div class="relative max-w-5xl mx-auto text-center">
            <span class="baby-pill bg-white/10 text-white border border-white/10">Ready to Order?</span>
            <h2 class="baby-heading text-3xl md:text-5xl lg:text-6xl font-bold mt-5 leading-tight">Dress Your Little One in Comfort and Cuteness Today</h2>
            <p class="text-white/80 text-lg md:text-xl max-w-3xl mx-auto mt-5">Choose your favorite baby T-shirts now and make everyday outfits easier, softer, and sweeter.</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <a href="#shop-now" class="baby-btn bg-pink-500 text-white shadow-xl">Shop the Collection</a>
              <a href="tel:+8801000000000" class="baby-btn bg-white text-slate-900">Talk to Our Team</a>
            </div>
          </div>
        </section>
      `
    );

    addBlock(
      'baby-cta-light',
      'Soft Conversion CTA',
      'Friendly purchase prompt',
      'fas fa-cart-shopping',
      'Call to Action',
      `
        <section class="py-16 md:py-24 px-5 md:px-8 bg-gradient-to-b from-rose-50 to-white">
          <div class="max-w-5xl mx-auto text-center rounded-[36px] bg-white p-8 md:p-12 shadow-xl border border-rose-100">
            <span class="baby-pill bg-rose-50 text-rose-500">Easy and Friendly Checkout</span>
            <h2 class="baby-heading text-3xl md:text-5xl font-bold text-slate-800 mt-5">Pick Your Baby’s Favorite Tee and Order in Minutes</h2>
            <p class="text-slate-600 text-lg md:text-xl max-w-3xl mx-auto mt-5">Beautiful styles, baby-friendly softness, and a smooth order process that helps parents buy with confidence.</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <a href="#order" class="baby-btn bg-slate-900 text-white">Place Your Order</a>
              <a href="#offer" class="baby-btn bg-rose-50 text-rose-500 border border-rose-100">View Special Offer</a>
            </div>
          </div>
        </section>
      `
    );

    /* ─────────────────────────────────────────────────────────────
       BASIC ELEMENTS — generic building blocks
    ───────────────────────────────────────────────────────────── */

    // ── Container ──────────────────────────────────────────────
    editor.BlockManager.add('basic-container', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-box-open"></i></div><strong style="font-size:14px;color:#1f2937">Container</strong><div style="font-size:11px;color:#6b7280">Max-width wrapper</div></div>`,
      category: 'Basic Elements',
      content: `<div style="max-width:1200px;margin:0 auto;padding:0 16px;box-sizing:border-box;width:100%;"></div>`,
    });

    // ── Section ─────────────────────────────────────────────────
    editor.BlockManager.add('basic-section', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-layer-group"></i></div><strong style="font-size:14px;color:#1f2937">Section</strong><div style="font-size:11px;color:#6b7280">Full-width section</div></div>`,
      category: 'Basic Elements',
      content: `<section style="width:100%;padding:56px 16px;background:#ffffff;box-sizing:border-box;"></section>`,
    });

    // ── 2 Column Row ────────────────────────────────────────────
    editor.BlockManager.add('basic-row-2col', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-columns"></i></div><strong style="font-size:14px;color:#1f2937">2 Columns</strong><div style="font-size:11px;color:#6b7280">Side-by-side layout</div></div>`,
      category: 'Basic Elements',
      content: `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;width:100%;box-sizing:border-box;">
          <div style="padding:16px;background:#f8fafc;border-radius:12px;min-height:80px;"></div>
          <div style="padding:16px;background:#f8fafc;border-radius:12px;min-height:80px;"></div>
        </div>
      `,
    });

    // ── 3 Column Row ────────────────────────────────────────────
    editor.BlockManager.add('basic-row-3col', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-table-columns"></i></div><strong style="font-size:14px;color:#1f2937">3 Columns</strong><div style="font-size:11px;color:#6b7280">Three-column grid</div></div>`,
      category: 'Basic Elements',
      content: `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;width:100%;box-sizing:border-box;">
          <div style="padding:16px;background:#f8fafc;border-radius:12px;min-height:80px;"></div>
          <div style="padding:16px;background:#f8fafc;border-radius:12px;min-height:80px;"></div>
          <div style="padding:16px;background:#f8fafc;border-radius:12px;min-height:80px;"></div>
        </div>
      `,
    });

    // ── 4 Column Row ────────────────────────────────────────────
    editor.BlockManager.add('basic-row-4col', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-grip"></i></div><strong style="font-size:14px;color:#1f2937">4 Columns</strong><div style="font-size:11px;color:#6b7280">Four-column grid</div></div>`,
      category: 'Basic Elements',
      content: `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;width:100%;box-sizing:border-box;">
          <div style="padding:16px;background:#f8fafc;border-radius:12px;min-height:80px;"></div>
          <div style="padding:16px;background:#f8fafc;border-radius:12px;min-height:80px;"></div>
          <div style="padding:16px;background:#f8fafc;border-radius:12px;min-height:80px;"></div>
          <div style="padding:16px;background:#f8fafc;border-radius:12px;min-height:80px;"></div>
        </div>
      `,
    });

    // ── Heading ──────────────────────────────────────────────────
    editor.BlockManager.add('basic-heading', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-heading"></i></div><strong style="font-size:14px;color:#1f2937">Heading</strong><div style="font-size:11px;color:#6b7280">H1 / H2 / H3 title</div></div>`,
      category: 'Basic Elements',
      content: `<h2 style="font-size:clamp(24px,4vw,40px);font-weight:800;color:#1e293b;line-height:1.25;margin:0 0 16px;letter-spacing:-0.02em;">আপনার শিরোনাম এখানে লিখুন</h2>`,
    });

    // ── Paragraph Text ──────────────────────────────────────────
    editor.BlockManager.add('basic-text', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-paragraph"></i></div><strong style="font-size:14px;color:#1f2937">Text</strong><div style="font-size:11px;color:#6b7280">Paragraph block</div></div>`,
      category: 'Basic Elements',
      content: `<p style="font-size:16px;color:#475569;line-height:1.75;margin:0 0 16px;">আপনার বিবরণ এখানে লিখুন। পণ্যের বৈশিষ্ট্য, অফার বা যেকোনো তথ্য যোগ করুন।</p>`,
    });

    // ── Image ───────────────────────────────────────────────────
    editor.BlockManager.add('basic-image', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-image"></i></div><strong style="font-size:14px;color:#1f2937">Image</strong><div style="font-size:11px;color:#6b7280">Responsive photo</div></div>`,
      category: 'Basic Elements',
      content: `<img src="https://placehold.co/800x450/e2e8f0/94a3b8?text=Your+Image" alt="Image" style="display:block;width:100%;max-width:100%;height:auto;border-radius:12px;object-fit:cover;" />`,
    });

    // ── Button ──────────────────────────────────────────────────
    editor.BlockManager.add('basic-button', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-hand-pointer"></i></div><strong style="font-size:14px;color:#1f2937">Button</strong><div style="font-size:11px;color:#6b7280">CTA link button</div></div>`,
      category: 'Basic Elements',
      content: `<a href="#order" style="display:inline-flex;align-items:center;justify-content:center;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:16px;font-weight:700;border-radius:999px;text-decoration:none;cursor:pointer;box-shadow:0 8px 24px rgba(99,102,241,.35);transition:all .25s ease;">🛒 এখনই অর্ডার করুন</a>`,
    });

    // ── Order CTA Button ─────────────────────────────────────────
    editor.BlockManager.add('basic-order-cta', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#ec4899"><i class="fas fa-cart-shopping"></i></div><strong style="font-size:14px;color:#1f2937">Order CTA</strong><div style="font-size:11px;color:#6b7280">Pink COD order button</div></div>`,
      category: 'Basic Elements',
      content: `
        <div style="text-align:center;padding:24px 16px;">
          <a href="#order" class="btn-order-main inline">🛒 এখনই অর্ডার করুন — ক্যাশ অন ডেলিভারি</a>
        </div>
      `,
    });

    // ── Divider ─────────────────────────────────────────────────
    editor.BlockManager.add('basic-divider', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-minus"></i></div><strong style="font-size:14px;color:#1f2937">Divider</strong><div style="font-size:11px;color:#6b7280">Horizontal separator</div></div>`,
      category: 'Basic Elements',
      content: `<hr style="border:none;border-top:2px solid #e2e8f0;margin:24px 0;width:100%;" />`,
    });

    // ── Spacer ──────────────────────────────────────────────────
    editor.BlockManager.add('basic-spacer', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-arrows-up-down"></i></div><strong style="font-size:14px;color:#1f2937">Spacer</strong><div style="font-size:11px;color:#6b7280">Vertical gap / padding</div></div>`,
      category: 'Basic Elements',
      content: `<div style="height:48px;width:100%;display:block;"></div>`,
    });

    // ── Icon Box ─────────────────────────────────────────────────
    editor.BlockManager.add('basic-icon-box', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-star"></i></div><strong style="font-size:14px;color:#1f2937">Icon Box</strong><div style="font-size:11px;color:#6b7280">Icon + title + text</div></div>`,
      category: 'Basic Elements',
      content: `
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:28px 20px;background:#f8fafc;border-radius:16px;gap:12px;">
          <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);display:flex;align-items:center;justify-content:center;font-size:22px;color:#6366f1;">
            <i class="fas fa-star"></i>
          </div>
          <h3 style="font-size:18px;font-weight:800;color:#1e293b;margin:0;">ফিচারের নাম</h3>
          <p style="font-size:14px;color:#64748b;margin:0;line-height:1.65;">এখানে ছোট বিবরণ লিখুন।</p>
        </div>
      `,
    });

    // ── Alert / Notice Box ──────────────────────────────────────
    editor.BlockManager.add('basic-alert', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-bell"></i></div><strong style="font-size:14px;color:#1f2937">Alert Box</strong><div style="font-size:11px;color:#6b7280">Highlight notice</div></div>`,
      category: 'Basic Elements',
      content: `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:16px 20px;background:#fef3c7;border:1.5px solid #fbbf24;border-radius:12px;margin:8px 0;">
          <span style="font-size:20px;flex-shrink:0;">⚠️</span>
          <p style="font-size:14px;font-weight:600;color:#92400e;margin:0;line-height:1.6;">সীমিত স্টক! এখনই অর্ডার করুন অন্যথায় মিস হয়ে যেতে পারে।</p>
        </div>
      `,
    });

    // ── Badge / Pill ─────────────────────────────────────────────
    editor.BlockManager.add('basic-badge', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-tag"></i></div><strong style="font-size:14px;color:#1f2937">Badge</strong><div style="font-size:11px;color:#6b7280">Pill label / tag</div></div>`,
      category: 'Basic Elements',
      content: `<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:#fce7f3;color:#be185d;font-size:13px;font-weight:700;border-radius:999px;letter-spacing:.04em;text-transform:uppercase;">🔥 সেরা অফার</span>`,
    });

    // ── Video Embed ──────────────────────────────────────────────
    editor.BlockManager.add('basic-video', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-play-circle"></i></div><strong style="font-size:14px;color:#1f2937">Video</strong><div style="font-size:11px;color:#6b7280">YouTube / iframe embed</div></div>`,
      category: 'Basic Elements',
      content: `
        <div style="position:relative;width:100%;padding-bottom:56.25%;height:0;border-radius:16px;overflow:hidden;background:#0f172a;">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Video"
            frameborder="0"
            allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
            allowfullscreen
            style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
          ></iframe>
        </div>
      `,
    });

    // ── Bullet List ──────────────────────────────────────────────
    editor.BlockManager.add('basic-list', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-list-check"></i></div><strong style="font-size:14px;color:#1f2937">List</strong><div style="font-size:11px;color:#6b7280">Checkmark bullet list</div></div>`,
      category: 'Basic Elements',
      content: `
        <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;">
          <li style="display:flex;align-items:flex-start;gap:10px;font-size:15px;color:#334155;line-height:1.6;"><span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#dcfce7;display:inline-flex;align-items:center;justify-content:center;font-size:12px;color:#16a34a;margin-top:1px;">✓</span> পয়েন্ট এক — এখানে লিখুন</li>
          <li style="display:flex;align-items:flex-start;gap:10px;font-size:15px;color:#334155;line-height:1.6;"><span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#dcfce7;display:inline-flex;align-items:center;justify-content:center;font-size:12px;color:#16a34a;margin-top:1px;">✓</span> পয়েন্ট দুই — এখানে লিখুন</li>
          <li style="display:flex;align-items:flex-start;gap:10px;font-size:15px;color:#334155;line-height:1.6;"><span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#dcfce7;display:inline-flex;align-items:center;justify-content:center;font-size:12px;color:#16a34a;margin-top:1px;">✓</span> পয়েন্ট তিন — এখানে লিখুন</li>
          <li style="display:flex;align-items:flex-start;gap:10px;font-size:15px;color:#334155;line-height:1.6;"><span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#dcfce7;display:inline-flex;align-items:center;justify-content:center;font-size:12px;color:#16a34a;margin-top:1px;">✓</span> পয়েন্ট চার — এখানে লিখুন</li>
        </ul>
      `,
    });

    // ── Quote / Testimonial ──────────────────────────────────────
    editor.BlockManager.add('basic-quote', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-quote-left"></i></div><strong style="font-size:14px;color:#1f2937">Quote</strong><div style="font-size:11px;color:#6b7280">Customer testimonial</div></div>`,
      category: 'Basic Elements',
      content: `
        <blockquote style="margin:0;padding:24px 28px;background:#fff7ed;border-left:4px solid #fb923c;border-radius:0 12px 12px 0;position:relative;">
          <p style="font-size:16px;color:#431407;font-style:italic;line-height:1.75;margin:0 0 12px;">"পণ্যটি অসাধারণ! মান খুবই ভালো এবং সময়মতো ডেলিভারি পেয়েছি। অবশ্যই আবার কিনব।"</p>
          <footer style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:28px;">👩</span>
            <div>
              <strong style="font-size:14px;color:#1c1917;display:block;">রাহেলা বেগম</strong>
              <span style="font-size:12px;color:#78716c;">ঢাকা, বাংলাদেশ</span>
            </div>
          </footer>
        </blockquote>
      `,
    });

    // ── Countdown Timer ──────────────────────────────────────────
    editor.BlockManager.add('basic-countdown', {
      label: `<div style="text-align:center;padding:10px"><div style="font-size:22px;margin-bottom:6px;color:#6366f1"><i class="fas fa-clock"></i></div><strong style="font-size:14px;color:#1f2937">Countdown</strong><div style="font-size:11px;color:#6b7280">Urgency timer</div></div>`,
      category: 'Basic Elements',
      content: `
        <div style="text-align:center;padding:32px 16px;background:linear-gradient(135deg,#fff1f2,#fce7f3);border-radius:20px;border:1.5px solid #fda4af;">
          <p style="font-size:14px;font-weight:700;color:#be123c;text-transform:uppercase;letter-spacing:.08em;margin:0 0 16px;">⏰ অফার শেষ হচ্ছে</p>
          <div style="display:inline-flex;gap:12px;align-items:center;justify-content:center;">
            <div style="background:#fff;border-radius:12px;padding:12px 16px;min-width:64px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
              <div style="font-size:28px;font-weight:900;color:#be123c;line-height:1;" id="cd-hours">02</div>
              <div style="font-size:11px;color:#9ca3af;margin-top:2px;">ঘণ্টা</div>
            </div>
            <span style="font-size:24px;font-weight:900;color:#be123c;margin-bottom:16px;">:</span>
            <div style="background:#fff;border-radius:12px;padding:12px 16px;min-width:64px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
              <div style="font-size:28px;font-weight:900;color:#be123c;line-height:1;" id="cd-mins">30</div>
              <div style="font-size:11px;color:#9ca3af;margin-top:2px;">মিনিট</div>
            </div>
            <span style="font-size:24px;font-weight:900;color:#be123c;margin-bottom:16px;">:</span>
            <div style="background:#fff;border-radius:12px;padding:12px 16px;min-width:64px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
              <div style="font-size:28px;font-weight:900;color:#be123c;line-height:1;" id="cd-secs">00</div>
              <div style="font-size:11px;color:#9ca3af;margin-top:2px;">সেকেন্ড</div>
            </div>
          </div>
          <script>
            (function(){
              var target = new Date(Date.now() + 2.5*60*60*1000);
              function tick(){
                var diff = Math.max(0, target - Date.now());
                var h = Math.floor(diff/3600000);
                var m = Math.floor((diff%3600000)/60000);
                var s = Math.floor((diff%60000)/1000);
                var pad = function(n){ return String(n).padStart(2,'0'); };
                var hEl = document.getElementById('cd-hours');
                var mEl = document.getElementById('cd-mins');
                var sEl = document.getElementById('cd-secs');
                if(hEl) hEl.textContent = pad(h);
                if(mEl) mEl.textContent = pad(m);
                if(sEl) sEl.textContent = pad(s);
              }
              tick();
              setInterval(tick, 1000);
            })();
          </script>
        </div>
      `,
    });
    // Force block manager to refresh after adding
    editor.BlockManager.render();

    // Device preview configuration - use actual device names for setDevice()
    const deviceConfigs = {
      desktop: { name: 'Desktop', label: 'Desktop' },
      tablet: { name: 'Tablet', label: 'Tablet (768px)' },
      mobile: { name: 'Mobile portrait', label: 'Mobile (375px)' },
    };

    // Initial button state - set desktop as active
    const desktopBtn = document.getElementById('device-desktop');
    if (desktopBtn) {
      desktopBtn.style.background = '#fbbf24';
      desktopBtn.style.color = '#333';
    }

    // Undo button
    const undoBtn = document.getElementById('gjs-undo');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => editor.UndoManager.undo());
    }

    // Redo button
    const redoBtn = document.getElementById('gjs-redo');
    if (redoBtn) {
      redoBtn.addEventListener('click', () => editor.UndoManager.redo());
    }

    // Device switcher buttons
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const button = e.currentTarget;
        const deviceId = button.id.replace('device-', '');
        const config = deviceConfigs[deviceId];

        // Update button styles
        document.querySelectorAll('.device-btn').forEach(b => {
          b.style.background = 'white';
          b.style.color = '#333';
        });
        button.style.background = '#f43f5e';
        button.style.color = 'white';

        // Apply device styles using GrapesJS built-in device manager
        const deviceName = config.name;
        editor.setDevice(deviceName);
        editor.refresh();
      });
    });

    // Zoom control
    const zoomSelect = document.getElementById('gjs-zoom');
    if (zoomSelect) {
      zoomSelect.addEventListener('change', (e) => {
        const zoom = parseInt(e.target.value) / 100;
        editor.setZoom(zoom);
      });
    }

    // THEN set up the load event
    editor.on('load', loadFromServer);

    editorRef.current = editor;
    window.__landingPageEditor = editor; // Expose for sidebar
  }, [apiUrl, id]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          height: '50px',
          background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 45%, #f97316 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
        }}
      >
        <div style={{ color: 'white', fontWeight: 800, fontSize: '16px' }}>
          Landing Page Editor
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => window.__grapesjsSave?.()}
            style={{
              padding: '8px 16px',
              background: 'white',
              color: '#e11d48',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            Save
          </button>
          <button
            onClick={() => {
              const html = prompt('Paste your HTML code:');
              if (html && html.trim()) {
                editorRef.current?.setComponents(html);
              }
            }}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            Import HTML
          </button>
          <button
            onClick={() => {
              if (confirm('বর্তমান design replace করে full Baby T-shirt template বসাতে চান?')) {
                editorRef.current?.setComponents(FULL_BABY_TEMPLATE);
                editorRef.current?.addStyle(BABY_TEMPLATE_STYLES);
              }
            }}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            Baby Template
          </button>
          <button
            onClick={() => {
              if (confirm('বর্তমান design replace করে Bold Baby T-shirt template বসাতে চান?')) {
                editorRef.current?.setComponents(BOLD_BABY_TEMPLATE);
                editorRef.current?.addStyle(BABY_TEMPLATE_STYLES);
              }
            }}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            Bold Template
          </button>
        </div>
      </div>
      {/* Main Editor Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div
          id="blocks"
          style={{
            width: '250px',
            borderRight: '1px solid #ddd',
            padding: '10px',
            overflowY: 'auto',
            background: '#fffafc',
            flexShrink: 0,
          }}
        />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
          {/* Editor Toolbar - Rainbow Bar */}
          <div style={{
            height: '55px',
            background: 'linear-gradient(90deg, #f43f5e, #ec4899, #a855f7, #3b82f6, #14b8a6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexShrink: 0,
            padding: '0 20px',
          }}>
            <span style={{ fontSize: '13px', color: 'white', fontWeight: 'bold' }}>🛠️ Tools:</span>
            <button id="gjs-undo" title="Undo (Ctrl+Z)" style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>↶ Undo</button>
            <button id="gjs-redo" title="Redo" style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>↷ Redo</button>
            <div style={{ width: '2px', height: '30px', background: 'rgba(255,255,255,0.5)' }} />
            <span style={{ fontSize: '13px', color: 'white', fontWeight: 'bold' }}>📱 Device:</span>
            <button id="device-desktop" class="device-btn" style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: '#fbbf24', color: '#333', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>🖥️ Desktop</button>
            <button id="device-tablet" class="device-btn" style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: 'white', color: '#333', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>📱 Tablet</button>
            <button id="device-mobile" class="device-btn" style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: 'white', color: '#333', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>📲 Mobile</button>
            <div style={{ width: '2px', height: '30px', background: 'rgba(255,255,255,0.5)' }} />
            <span style={{ fontSize: '13px', color: 'white', fontWeight: 'bold' }}>🔍 Zoom:</span>
            <select id="gjs-zoom" style={{ padding: '8px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              <option value="25">25%</option>
              <option value="50">50%</option>
              <option value="75">75%</option>
              <option value="100" selected>100%</option>
              <option value="125">125%</option>
              <option value="150">150%</option>
              <option value="200">200%</option>
            </select>
          </div>

          {/* Editor Canvas Area */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div id="gjs" style={{ flex: 1, height: '100%' }} />
            <div style={{ width: '300px', flexShrink: 0, borderLeft: '1px solid #ddd', overflowY: 'auto', background: '#fff' }}>
              <div id="traits-container" style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Properties</div>
              </div>
              <div id="styles-container" style={{ padding: '10px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Styles</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageEditor;
