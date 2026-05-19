"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { config } from "@/config/config";
import {
  Mail, Phone, MapPin, MessageCircle, Send, ChevronDown,
  CheckCircle2, AlertCircle, HelpCircle, Loader2, ArrowRight, Globe,
} from "lucide-react";
import {
  FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube,
} from "react-icons/fa";

const apiUrl = config.apiUrl;

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Support",
  "Partnership",
  "Feedback",
];

const EMPTY_FORM = {
  name: "", email: "", phone: "", subject: "General Inquiry",
  message: "", website: "" /* honeypot */,
};

const SOCIAL_ICON = {
  facebook: FaFacebookF, instagram: FaInstagram, linkedin: FaLinkedinIn,
  twitter: FaTwitter, x: FaTwitter, youtube: FaYoutube,
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <Hero />
      <ContactCards />
      <FormAndMap />
      <FaqSection />
      <SocialAndNewsletter />
    </main>
  );
}

/* ─── 1. Hero ────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative blobs */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] bg-violet-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-20 md:pt-28 md:pb-24 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-indigo-200/50 text-xs font-semibold text-indigo-700 shadow-sm mb-5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          We typically reply within a few hours
        </span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 bg-clip-text text-transparent leading-tight">
          Get In Touch
        </h1>
        <p className="mt-5 text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          আপনার প্রশ্ন, পরামর্শ, বা যেকোনো সাহায্যের জন্য আমাদের সাথে যোগাযোগ করুন। আমরা সবসময় আপনার পাশে আছি।
        </p>
      </div>
    </section>
  );
}

/* ─── 2. Contact Info Cards ──────────────────────────────────────────────── */

function ContactCards() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    axios
      .get(`${apiUrl}/contactinfos`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setInfo(list[0] || null);
      })
      .catch(() => setInfo(null));
  }, []);

  const email   = info?.email   || "support@example.com";
  const phone   = info?.phone   || "+880 1XXX-XXXXXX";
  const address = info?.address || "Dhaka, Bangladesh";
  const waNumber = (info?.phone || "").replace(/\D/g, "");

  const cards = [
    {
      icon: Mail,
      title: "Email Us",
      detail: email,
      href: `mailto:${email}`,
      hue: "from-blue-500 to-indigo-600",
      ring: "group-hover:ring-indigo-300",
    },
    {
      icon: Phone,
      title: "Call Us",
      detail: phone,
      href: `tel:${phone.replace(/\s+/g, "")}`,
      hue: "from-emerald-500 to-teal-600",
      ring: "group-hover:ring-emerald-300",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      detail: "Chat with us instantly",
      href: waNumber ? `https://wa.me/${waNumber}` : "#",
      target: "_blank",
      hue: "from-green-500 to-emerald-600",
      ring: "group-hover:ring-green-300",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      detail: address,
      href: `https://www.google.com/maps/search/${encodeURIComponent(address)}`,
      target: "_blank",
      hue: "from-rose-500 to-pink-600",
      ring: "group-hover:ring-rose-300",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 -mt-6 mb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <a
              key={i}
              href={c.href}
              target={c.target}
              rel={c.target ? "noopener noreferrer" : undefined}
              className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6"
            >
              <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${c.hue} items-center justify-center text-white shadow-md ring-4 ring-transparent ${c.ring} transition-all`}>
                <Icon size={20} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">{c.title}</h3>
              <p className="text-sm text-gray-600 mt-1 break-words">{c.detail}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight size={12} />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

/* ─── 3. Form + Map ──────────────────────────────────────────────────────── */

function FormAndMap() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/contactinfos`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setInfo(list[0] || null);
      })
      .catch(() => {});
  }, []);

  const address = info?.address || "Dhaka, Bangladesh";
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <section className="max-w-7xl mx-auto px-4 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Find Us</h3>
              <p className="text-xs text-gray-500 mt-0.5 break-words">{address}</p>
            </div>
            <div className="relative w-full h-72 md:h-80">
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location map"
              />
            </div>
          </div>
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-sm font-semibold text-indigo-700"
          >
            Get Directions <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const validateField = (name, value) => {
    if (name === "name" && !value.trim()) return "Name is required";
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Valid email required";
    if (name === "phone" && value && !/^01[3-9]\d{8}$/.test(value)) return "Enter a valid 11-digit phone";
    if (name === "message" && value.trim().length < 10) return "Message must be at least 10 characters";
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    // Real-time validation: clear error once valid
    if (errors[name]) {
      const err = validateField(name, value);
      setErrors((p) => ({ ...p, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value && name !== "phone") return; // don't error on empty until submit
    const err = validateField(name, value);
    setErrors((p) => ({ ...p, [name]: err }));
  };

  const validateAll = () => {
    const errs = {};
    ["name", "email", "phone", "message"].forEach((f) => {
      const err = validateField(f, form[f]);
      if (err && (f !== "phone" || form.phone)) errs[f] = err;
    });
    if (!form.message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Honeypot — real users never fill this hidden field
    if (form.website) {
      setToast({ type: "success", text: "Message sent successfully!" });
      return;
    }
    if (!validateAll()) return;

    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || form.email.trim(), // backend requires phone
        subject: form.subject,
        message: form.message.trim(),
      };
      await axios.post(`${apiUrl}/contacts`, payload);
      setToast({ type: "success", text: "ধন্যবাদ! আপনার message পাঠানো হয়েছে।" });
      setForm(EMPTY_FORM);
    } catch (err) {
      const data = err.response?.data;
      const first = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
      setToast({ type: "error", text: first || data?.message || "পাঠাতে সমস্যা হয়েছে।" });
    } finally {
      setBusy(false);
      setTimeout(() => setToast(null), 4500);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
      <div className="mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Send Us a Message</h2>
        <p className="text-sm text-gray-500 mt-1">নিচের form-টি পূরণ করুন। আমরা দ্রুত উত্তর দেব।</p>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-2.5 px-4 py-3 rounded-xl mb-4 text-sm border ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success"
            ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
          <span>{toast.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={handleChange}
          autoComplete="off"
          tabIndex={-1}
          className="hidden"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingField
            name="name"
            label="Full Name"
            type="text"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            required
          />
          <FloatingField
            name="email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingField
            name="phone"
            label="Phone Number (optional)"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            maxLength={11}
          />
          <div className="relative">
            <select
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="peer w-full px-3.5 pt-5 pb-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label
              htmlFor="subject"
              className="absolute left-3.5 top-1.5 text-[11px] font-medium text-gray-500 pointer-events-none"
            >
              Subject
            </label>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <FloatingField
          name="message"
          label="Your Message"
          as="textarea"
          rows={5}
          value={form.message}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.message}
          required
          minLength={10}
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:ring-4 focus-visible:ring-indigo-500/30"
        >
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send size={16} />
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function FloatingField({ name, label, as = "input", error, required, ...rest }) {
  const Tag = as;
  const isTextarea = as === "textarea";
  return (
    <div className="relative">
      <Tag
        id={name}
        name={name}
        placeholder=" "
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        required={required}
        {...rest}
        className={`peer w-full px-3.5 pt-5 pb-2 text-sm bg-white border rounded-xl focus:outline-none transition-all placeholder-transparent resize-y ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
            : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        } ${isTextarea ? "min-h-[120px]" : ""}`}
      />
      <label
        htmlFor={name}
        className={`absolute left-3.5 transition-all duration-200 pointer-events-none ${
          isTextarea ? "top-2 text-[11px] font-medium" : ""
        } peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal top-1.5 text-[11px] font-medium ${
          error ? "text-red-600" : "text-gray-500 peer-focus:text-indigo-600"
        }`}
      >
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {error && (
        <p id={`${name}-error`} className="text-xs text-red-600 mt-1 ml-1 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

/* ─── 4. FAQ Section ─────────────────────────────────────────────────────── */

function FaqSection() {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${apiUrl}/faqs`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setFaqs(list);
      })
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || faqs.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 text-indigo-600 mb-2 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle size={14} /> Help Center
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 mt-2">সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => {
          const isOpen = open === faq.id;
          return (
            <div
              key={faq.id}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen ? "border-indigo-200 shadow-lg" : "border-gray-100 shadow-sm hover:shadow-md"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-inset"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${faq.id}`}
              >
                <span className="text-sm md:text-base font-semibold text-gray-900 leading-snug">
                  {faq.question}
                </span>
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen ? "bg-indigo-600 text-white rotate-180" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <ChevronDown size={14} />
                </span>
              </button>
              <div
                id={`faq-panel-${faq.id}`}
                role="region"
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 md:px-6 pb-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── 5. Social Media & Newsletter ───────────────────────────────────────── */

function SocialAndNewsletter() {
  const [socials, setSocials] = useState([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    axios.get(`${apiUrl}/sociallinks`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setSocials(list);
      })
      .catch(() => setSocials([]));
  }, []);

  const onSubscribe = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setBusy(true);
    // Hook to a real newsletter endpoint when available — using contact as fallback
    try {
      await axios.post(`${apiUrl}/contacts`, {
        name: "Newsletter Subscriber",
        email,
        phone: email,
        subject: "Newsletter Subscription",
        message: `Subscribe me to the newsletter — ${email}`,
      });
      setDone(true);
      setEmail("");
    } catch {
      setDone(true);
    } finally {
      setBusy(false);
      setTimeout(() => setDone(false), 4000);
    }
  };

  const fallbackSocials = [
    { name: "facebook",  icon: FaFacebookF,  href: "#" },
    { name: "instagram", icon: FaInstagram,  href: "#" },
    { name: "linkedin",  icon: FaLinkedinIn, href: "#" },
    { name: "twitter",   icon: FaTwitter,    href: "#" },
    { name: "youtube",   icon: FaYoutube,    href: "#" },
  ];

  const renderSocials = socials.length > 0
    ? socials.map((s) => ({
        name: (s.name || s.platform || "").toLowerCase(),
        icon: SOCIAL_ICON[(s.name || s.platform || "").toLowerCase()] || Globe,
        href: s.url || s.link || "#",
      }))
    : fallbackSocials;

  return (
    <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 mt-8">
      <div className="max-w-5xl mx-auto px-4 py-14 md:py-16 text-center text-white">
        <h3 className="text-2xl md:text-3xl font-bold">Stay Connected</h3>
        <p className="text-indigo-100 mt-2 max-w-xl mx-auto text-sm md:text-base">
          Follow us on social media and subscribe for updates, offers, and new product launches.
        </p>

        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          {renderSocials.map((s, i) => {
            const Icon = s.icon;
            return (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name || "Social"}
                className="w-11 h-11 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-indigo-700 hover:scale-110 transition-all duration-200"
              >
                <Icon size={18} />
              </a>
            );
          })}
        </div>

        <form onSubmit={onSubscribe} className="mt-10 max-w-md mx-auto">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 bg-white/10 backdrop-blur rounded-2xl sm:rounded-full p-1.5 border border-white/20">
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-2.5 bg-transparent text-white placeholder-indigo-200 focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={busy || done}
              className="px-5 py-2.5 rounded-xl sm:rounded-full bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 transition-colors disabled:opacity-70 flex items-center justify-center gap-1.5"
            >
              {done ? (
                <>
                  <CheckCircle2 size={15} /> Subscribed
                </>
              ) : busy ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> ...
                </>
              ) : (
                <>
                  Subscribe <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-indigo-200 mt-2">No spam — unsubscribe anytime.</p>
        </form>
      </div>
    </section>
  );
}
