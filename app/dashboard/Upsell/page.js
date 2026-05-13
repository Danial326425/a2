"use client";

import React, { useState } from "react";
import PrivateRoute from "../PrivateRoute";
import ViewUpsellProducts from "./ViewUpsellProducts";
import CreateUpsellProduct from "./CreateUpsellProduct";
import UpsellSettings from "./UpsellSettings";

const TABS = [
  { id: "products", label: "আপসেল পণ্য" },
  { id: "settings", label: "পেজ সেটিংস" },
];

export default function UpsellDashboard() {
  const [tab, setTab]       = useState("products");
  const [creating, setCreating] = useState(false);

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900">আপসেল ফানেল</h1>
            <p className="text-gray-500 text-sm mt-1">অর্ডার করার পর কাস্টমারকে বিশেষ অফার দেখান</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit shadow-sm">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setCreating(false); }}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                  tab === t.id
                    ? "bg-red-500 text-white shadow"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            {tab === "products" && !creating && (
              <ViewUpsellProducts onCreateNew={() => setCreating(true)} />
            )}
            {tab === "products" && creating && (
              <CreateUpsellProduct
                onCreated={() => { setCreating(false); }}
                onCancel={() => setCreating(false)}
              />
            )}
            {tab === "settings" && (
              <UpsellSettings />
            )}
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}
