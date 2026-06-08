'use client';

import { Stethoscope, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';
import { diagnoseRow, verdictStyle } from '@/app/lib/adsDiagnosis';

/**
 * Account-level overall verdict + recommendations, computed from the summary.
 * Shown as a prominent banner so the operator immediately knows the state.
 */
export default function OverallResult({ summary, isLoading }) {
  if (isLoading && !summary) {
    return <div className="h-28 rounded-2xl animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />;
  }
  if (!summary) return null;

  const d = diagnoseRow(summary);
  const vs = verdictStyle(d.verdict);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
        <Stethoscope size={17} className="text-indigo-600" />
        <h3 className="text-sm font-bold text-gray-800">সামগ্রিক রায় (Overall Diagnosis)</h3>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold border whitespace-nowrap ${vs.cls}`}>
            {vs.emoji} {vs.label}
          </span>
          <p className="text-sm font-semibold text-gray-800 leading-snug">{d.headline}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-green-50/60 border border-green-100 p-3">
            <p className="font-bold text-green-700 mb-1.5 flex items-center gap-1"><CheckCircle2 size={13} /> ভালো দিক</p>
            {d.goods.length ? (
              <ul className="space-y-1 text-gray-600">{d.goods.map((g, i) => <li key={i}>• {g}</li>)}</ul>
            ) : <p className="text-gray-400">—</p>}
          </div>
          <div className="rounded-xl bg-red-50/60 border border-red-100 p-3">
            <p className="font-bold text-red-600 mb-1.5 flex items-center gap-1"><AlertCircle size={13} /> সমস্যা</p>
            {d.problems.length ? (
              <ul className="space-y-1 text-gray-600">{d.problems.map((p, i) => <li key={i}>• {p}</li>)}</ul>
            ) : <p className="text-gray-400">কোনো বড় সমস্যা নেই</p>}
          </div>
          <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3">
            <p className="font-bold text-blue-600 mb-1.5 flex items-center gap-1"><Wrench size={13} /> যা করবেন</p>
            {d.actions.length ? (
              <ul className="space-y-1 text-gray-700">{d.actions.map((a, i) => <li key={i}>✔ {a}</li>)}</ul>
            ) : <p className="text-gray-400">এখন কিছু পরিবর্তন দরকার নেই — চালিয়ে যান।</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
