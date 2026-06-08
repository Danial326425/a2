'use client';

import { useEffect, useState } from 'react';
import { X, Eye, EyeOff, Save, KeyRound, Loader2 } from 'lucide-react';
import { fetchAdsSettings, saveAdsSettings } from '../useMetaAds';

const EMPTY = {
  ad_account_id: '', access_token: '', app_id: '', app_secret: '',
  api_version: 'v21.0', usd_to_bdt_rate: 1, use_mock: false,
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function AdsSettingsModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState(null);
  const [showSecret, setShowSecret] = useState({ token: false, secret: false });

  useEffect(() => {
    if (!open) return;
    setError(null); setOkMsg(null);
    setLoading(true);
    fetchAdsSettings()
      .then((s) => setForm({ ...EMPTY, ...s }))
      .catch((e) => setError(e?.response?.data?.message || 'সেটিংস লোড করা যায়নি'))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null); setOkMsg(null);
    try {
      const res = await saveAdsSettings(form);
      if (!res?.success) throw new Error(res?.message || 'সংরক্ষণ ব্যর্থ');
      setOkMsg(res.message || 'সংরক্ষিত হয়েছে');
      onSaved?.();
      setTimeout(() => onClose?.(), 700);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-blue-500 transition';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <KeyRound size={17} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Meta API সেটিংস</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mr-2" size={18} /> লোড হচ্ছে…
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
            {okMsg && <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">{okMsg}</div>}

            <Field label="Ad Account ID" hint="format: act_XXXXXXXXX (act_ না দিলেও চলবে)">
              <input className={input} value={form.ad_account_id || ''} onChange={(e) => set('ad_account_id', e.target.value)} placeholder="act_1234567890" />
            </Field>

            <Field label="Access Token (long-lived)" hint="Meta থেকে নেওয়া long-lived token">
              <div className="relative">
                <input
                  className={input + ' pr-10'}
                  type={showSecret.token ? 'text' : 'password'}
                  value={form.access_token || ''}
                  onChange={(e) => set('access_token', e.target.value)}
                  placeholder="EAAG..."
                  autoComplete="off"
                />
                <button type="button" onClick={() => setShowSecret((s) => ({ ...s, token: !s.token }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showSecret.token ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="App ID">
                <input className={input} value={form.app_id || ''} onChange={(e) => set('app_id', e.target.value)} placeholder="123456789012345" />
              </Field>
              <Field label="App Secret">
                <div className="relative">
                  <input
                    className={input + ' pr-10'}
                    type={showSecret.secret ? 'text' : 'password'}
                    value={form.app_secret || ''}
                    onChange={(e) => set('app_secret', e.target.value)}
                    placeholder="••••••••"
                    autoComplete="off"
                  />
                  <button type="button" onClick={() => setShowSecret((s) => ({ ...s, secret: !s.secret }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                    {showSecret.secret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="API Version">
                <input className={input} value={form.api_version || ''} onChange={(e) => set('api_version', e.target.value)} placeholder="v21.0" />
              </Field>
              <Field label="USD → BDT Rate" hint="অ্যাকাউন্ট BDT হলে 1 রাখুন">
                <input className={input} type="number" step="0.01" min="0" value={form.usd_to_bdt_rate ?? 1} onChange={(e) => set('usd_to_bdt_rate', e.target.value)} />
              </Field>
            </div>

            <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-gray-800">Mock / Demo data ব্যবহার করুন</p>
                <p className="text-[11px] text-gray-400">credential ছাড়া UI টেস্টের জন্য</p>
              </div>
              <input type="checkbox" checked={!!form.use_mock} onChange={(e) => set('use_mock', e.target.checked)}
                className="w-5 h-5 accent-blue-600" />
            </label>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100">বাতিল</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
