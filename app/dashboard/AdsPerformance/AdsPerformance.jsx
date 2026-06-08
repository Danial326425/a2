'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, RefreshCw, Info, Settings } from 'lucide-react';
import DatePresetSelector from './components/DatePresetSelector';
import AccountSummaryCards from './components/AccountSummaryCards';
import DailyTrendChart from './components/DailyTrendChart';
import CampaignsTable from './components/CampaignsTable';
import AdsSettingsModal from './components/AdsSettingsModal';
import { useAdsOverview, useCampaigns } from './useMetaAds';
import { timeAgo } from '@/app/lib/adsUtils';

export default function AdsPerformance() {
  const [datePreset, setDatePreset] = useState('last_7d');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const overview = useAdsOverview(datePreset);
  const campaigns = useCampaigns(datePreset);

  // Manual refresh with a 60s cooldown (protects the Meta API rate limit).
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const refresh = useCallback(() => {
    if (cooldown > 0) return;
    overview.refetch();
    campaigns.refetch();
    setCooldown(60);
  }, [cooldown, overview, campaigns]);

  const isMock = overview.meta?.mock;

  return (
    <div className="space-y-5 p-1">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <BarChart3 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ads Performance</h1>
            <p className="text-xs text-gray-400">
              {overview.fetchedAt ? `সর্বশেষ আপডেট: ${timeAgo(overview.fetchedAt)}` : 'লোড হচ্ছে…'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DatePresetSelector value={datePreset} onChange={setDatePreset} disabled={overview.isLoading} />
          <button
            type="button"
            onClick={refresh}
            disabled={cooldown > 0 || overview.isLoading}
            title={cooldown > 0 ? `${cooldown}s পর আবার রিফ্রেশ করা যাবে` : 'রিফ্রেশ'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            <RefreshCw size={15} className={overview.isLoading ? 'animate-spin' : ''} />
            {cooldown > 0 ? `${cooldown}s` : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            title="Meta API সেটিংস"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-blue-400 transition"
          >
            <Settings size={15} className="text-blue-500" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      <AdsSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => { overview.refetch(); campaigns.refetch(); }}
      />

      {/* Mock-data notice */}
      {isMock && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800">
          <Info size={15} className="mt-0.5 shrink-0" />
          <span>
            <strong>Demo / Mock data</strong> দেখানো হচ্ছে — Meta API credential সেট করা নেই।
            লাইভ ডেটার জন্য উপরের <strong>Settings</strong> বাটনে ক্লিক করে
            <strong> Access Token</strong> ও <strong>Ad Account ID</strong> দিন।
            <button onClick={() => setSettingsOpen(true)} className="ml-1 underline font-semibold hover:text-amber-900">এখনই সেট করুন →</button>
          </span>
        </div>
      )}

      {/* Overview error (summary/chart) */}
      {overview.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{overview.error}</span>
          <button onClick={refresh} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700">
            Retry
          </button>
        </div>
      )}

      {/* Summary cards */}
      <AccountSummaryCards summary={overview.summary} isLoading={overview.isLoading} />

      {/* Daily trend */}
      <DailyTrendChart data={overview.daily} isLoading={overview.isLoading} />

      {/* Campaigns drilldown */}
      <CampaignsTable
        campaigns={campaigns.campaigns}
        datePreset={datePreset}
        isLoading={campaigns.isLoading}
        error={campaigns.error}
        onRetry={campaigns.refetch}
      />
    </div>
  );
}
