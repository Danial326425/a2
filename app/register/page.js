"use client";

import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { config } from "@/config/config";
import {
  User as UserIcon, Phone, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight,
} from "lucide-react";

const apiUrl = config.apiUrl;

const EMPTY = { name: "", phone: "", email: "", password: "", password_confirmation: "" };

export default function RegisterPage() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: null }));
  };

  const clientValidate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "নাম দিতে হবে";
    if (!/^01[3-9]\d{8}$/.test(form.phone)) errs.phone = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "সঠিক ইমেইল দিন";
    if (form.password.length < 6) errs.password = "Password কমপক্ষে ৬ অক্ষর";
    if (form.password !== form.password_confirmation) {
      errs.password_confirmation = "Password match করেনি";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!clientValidate()) return;
    setBusy(true);
    try {
      await axios.post(`${apiUrl}/register`, form);
      setDone(true);
      setForm(EMPTY);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const mapped = {};
        Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(mapped);
      }
      setServerError(data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            আপনার একাউন্ট তৈরি হয়েছে। Admin আপনার একাউন্ট approve করলে আপনি login করতে পারবেন।
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Back to Home <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 pt-8 pb-2">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Create Account</h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            রেজিস্ট্রেশনের পর Admin approval এর জন্য অপেক্ষা করতে হবে
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <Field
            name="name"
            label="Full Name"
            icon={<UserIcon size={14} />}
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="আপনার নাম"
            required
            autoComplete="name"
          />

          <Field
            name="phone"
            label="Phone Number"
            type="tel"
            icon={<Phone size={14} />}
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="01XXXXXXXXX"
            required
            maxLength={11}
            autoComplete="tel"
          />

          <Field
            name="email"
            label="Email Address"
            type="email"
            icon={<Mail size={14} />}
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="example@email.com"
            required
            autoComplete="email"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="কমপক্ষে ৬ অক্ষর"
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.password
                    ? "border-red-300 focus:ring-red-500/30 focus:border-red-400"
                    : "border-gray-200 focus:ring-indigo-500/30 focus:border-indigo-400"
                }`}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <Field
            name="password_confirmation"
            label="Confirm Password"
            type={showPwd ? "text" : "password"}
            icon={<Lock size={14} />}
            value={form.password_confirmation}
            onChange={handleChange}
            error={errors.password_confirmation}
            placeholder="Password আবার দিন"
            required
            minLength={6}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:from-indigo-700 hover:to-violet-700 transition-colors disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Registering...
              </>
            ) : (
              <>Register</>
            )}
          </button>
        </form>

        <div className="px-8 pb-8 text-center">
          <p className="text-sm text-gray-600">
            আগে থেকেই একাউন্ট আছে?{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ name, label, type = "text", icon, value, onChange, error, placeholder, ...extra }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            error
              ? "border-red-300 focus:ring-red-500/30 focus:border-red-400"
              : "border-gray-200 focus:ring-indigo-500/30 focus:border-indigo-400"
          }`}
          {...extra}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
