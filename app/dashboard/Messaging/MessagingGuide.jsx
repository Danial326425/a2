"use client";

import React from "react";
import { BookOpen, Check, X, Lightbulb } from "lucide-react";
import { CollapsibleSection } from "../../components/Dashboard/DashUI";

/**
 * In-dashboard guide for writing WhatsApp templates. `variant`:
 *   - "status"    → order/status (utility) messages
 *   - "marketing" → campaign / repurchase (marketing) messages
 */
const Var = ({ children }) => (
  <code className="px-1 py-0.5 rounded bg-gray-100 text-indigo-700 text-[11px] font-bold">{children}</code>
);

const Do = ({ children }) => (
  <li className="flex gap-2 text-xs text-gray-600">
    <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" /> <span>{children}</span>
  </li>
);

const Dont = ({ children }) => (
  <li className="flex gap-2 text-xs text-gray-600">
    <X size={14} className="text-red-500 shrink-0 mt-0.5" /> <span>{children}</span>
  </li>
);

const Example = ({ children }) => (
  <pre className="text-[11px] leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap text-gray-700 font-sans">
    {children}
  </pre>
);

const StatusGuide = () => (
  <>
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-1">📦 ভেরিয়েবল (অর্ডার মেসেজ)</p>
      <p className="text-xs text-gray-600">
        প্রতিটা status template-এ <strong>ঠিক ৪টা ভেরিয়েবল</strong> থাকতে হবে — এই ক্রমে:
      </p>
      <p className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
        <span><Var>{"{{1}}"}</Var> নাম</span>
        <span><Var>{"{{2}}"}</Var> অর্ডার নং</span>
        <span><Var>{"{{3}}"}</Var> পণ্য</span>
        <span><Var>{"{{4}}"}</Var> মোট টাকা</span>
      </p>
    </div>

    <ul className="space-y-1.5">
      <Do>চারটা ভেরিয়েবলই রাখুন — একটাও বাদ দিলে মেসেজ যাবে না (param mismatch)।</Do>
      <Do>Meta-তে <strong>Category = Utility</strong>, <strong>Language = Bengali (bn)</strong> দিন।</Do>
      <Do>ড্যাশবোর্ডের template-এ একই <strong>Meta template name</strong> ও <strong>Language</strong> দিন, নইলে “template does not exist”।</Do>
      <Do>ভেরিয়েবল বাক্যের মাঝে রাখুন (যেমন “প্রিয় {"{{1}}"},”)।</Do>
      <Dont>একদম শুরুতে বা শেষে একা ভেরিয়েবল রাখবেন না, দুটো ভেরিয়েবল পাশাপাশি দেবেন না।</Dont>
    </ul>

    <div>
      <p className="text-xs font-semibold text-gray-700 mb-1">উদাহরণ — Confirmed:</p>
      <Example>{`{{1}}, আপনার অর্ডারটি কনফার্ম হয়েছে ✅
🧾 অর্ডার নং: {{2}}
📦 {{3}}
💵 মোট: ৳{{4}} (ডেলিভারিতে পরিশোধযোগ্য)
ধন্যবাদ! — Safwan Galaxy`}</Example>
    </div>

    <p className="text-xs text-gray-500 flex gap-2">
      <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
      Utility template সাধারণত কয়েক মিনিটেই approve হয়। Submit করার সময় sample value দিন: {"{{1}}"}=রহিম, {"{{2}}"}=12345, {"{{3}}"}=বেবি ফ্রক, {"{{4}}"}=950।
    </p>
  </>
);

const MarketingGuide = () => (
  <>
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-1">📣 ভেরিয়েবল (marketing মেসেজ)</p>
      <ul className="text-xs text-gray-600 space-y-1 mt-1">
        <li>• <strong>Repurchase</strong> (৪৫–৬০ দিনের অটো) = <strong>২টা</strong> ভেরিয়েবল → <Var>{"{{1}}"}</Var> নাম, <Var>{"{{2}}"}</Var> বয়স/সাইজ রেঞ্জ</li>
        <li>• <strong>Campaign</strong> (নিজে পাঠানো) = <strong>১টা</strong> ভেরিয়েবল → <Var>{"{{1}}"}</Var> নাম</li>
      </ul>
    </div>

    <ul className="space-y-1.5">
      <Do>Meta-তে <strong>Category = Marketing</strong>, <strong>Language = Bengali (bn)</strong> দিন।</Do>
      <Do>ভেরিয়েবল সংখ্যা ঠিক রাখুন (repurchase ২টা, campaign ১টা) — নইলে send fail করবে।</Do>
      <Do>পরিষ্কার, সৎ ভাষা ব্যবহার করুন; চাইলে একটা Quick-reply বাটন (“অর্ডার করুন”) যোগ করুন।</Do>
      <Dont>ALL CAPS, অতিরিক্ত ইমোজি, “১০০% ফ্রি/গ্যারান্টি/জিতেছেন” দাবি, লিংক-শর্টনার এড়িয়ে চলুন।</Dont>
      <Dont>একা ভেরিয়েবল দিয়ে শুরু/শেষ করবেন না (যেমন “প্রিয় {"{{1}}"},” দিয়ে শুরু করুন)।</Dont>
    </ul>

    <div>
      <p className="text-xs font-semibold text-gray-700 mb-1">উদাহরণ — Repurchase (২ ভেরিয়েবল):</p>
      <Example>{`প্রিয় {{1}}, আপনার ছোট্ট সোনামণি দিন দিন বড় হয়ে যাচ্ছে! 🌱
এখন {{2}} বয়সের নতুন কালেকশন Safwan Galaxy-তে এসেছে।
পছন্দের পণ্য দেখতে বা অর্ডার করতে রিপ্লাই দিন 💙`}</Example>
    </div>

    <p className="text-xs text-gray-500 flex gap-2">
      <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
      নিচে ছোট করে “(আর মেসেজ পেতে না চাইলে STOP লিখুন)” যোগ করলে quality রেটিং ভালো থাকে — সিস্টেম STOP/বন্ধ পেলে অটো opt-out করে।
    </p>
  </>
);

const MessagingGuide = ({ variant = "status" }) => {
  const isMarketing = variant === "marketing";
  return (
    <CollapsibleSection
      title={isMarketing ? "কীভাবে Marketing মেসেজ লিখবেন (গাইড)" : "কীভাবে Status মেসেজ লিখবেন (গাইড)"}
      subtitle="ভেরিয়েবল, ফরম্যাট ও Meta approval টিপস"
      icon={BookOpen}
      accent={isMarketing ? "violet" : "indigo"}
    >
      {isMarketing ? <MarketingGuide /> : <StatusGuide />}
    </CollapsibleSection>
  );
};

export default MessagingGuide;
