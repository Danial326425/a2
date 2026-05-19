"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { config } from "@/config/config";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";

const apiUrl = config.apiUrl;

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!login.trim() || !password) {
      setError("Email/phone and password are required");
      return;
    }
    setBusy(true);
    try {
      const res = await axios.post(`${apiUrl}/login`, { login: login.trim(), password });
      const { token, remember_token, user, type } = res.data;
      if (type !== "admin" && type !== "moderator") {
        setError("Access denied. This login is for staff only.");
        setBusy(false);
        return;
      }
      const authToken = token || remember_token;
      const store = remember ? localStorage : sessionStorage;
      store.setItem("authToken", authToken);
      store.setItem("token", authToken);
      if (user?.name)  store.setItem("user", user.name);
      if (user?.phone) store.setItem("phone", user.phone);
      if (type)        store.setItem("type", type);
      router.push("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      const firstErr = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
      setError(firstErr || data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 backdrop-blur border border-indigo-500/30 mb-3">
            <FaShieldAlt className="text-indigo-300 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-sm text-slate-400 mt-1">Staff access only</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email or Phone
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="admin@example.com or 01XXXXXXXXX"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                  autoComplete="current-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Remember me</span>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {busy ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Customer accounts are not required. For shopping, browse the store directly.
        </p>
      </div>
    </div>
  );
}
