'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, AlertCircle, CheckCircle2, Wrench } from 'lucide-react';
import { useChildren } from '../useMetaAds';
import { formatBDT, fmtInt, roasBadgeClass, statusBadge } from '@/app/lib/adsUtils';
import {
  metricVerdict, levelTextClass, diagnoseRow, verdictStyle, COLUMN_HINTS, ageInfo, learningBadge,
} from '@/app/lib/adsDiagnosis';

const TOTAL_COLS = 16; // Name + 14 metrics + Result

// Background "heatmap" tint per verdict level — replaces the old text labels.
const LEVEL_CELL = {
  good: 'bg-green-50 text-green-700 font-semibold',
  ok:   'bg-amber-50 text-amber-700 font-semibold',
  bad:  'bg-red-50 text-red-700 font-semibold',
  na:   '',
};

// ─── One metric cell: value with a colour overlay by verdict ────────────────────
function MCell({ vkey, raw, display, strong }) {
  const { level } = metricVerdict(vkey, raw);
  const tint = LEVEL_CELL[level] || '';
  const base = tint || (strong ? 'font-semibold text-gray-800' : 'text-gray-600');
  return (
    <td className={`px-3 py-3 text-right whitespace-nowrap ${base}`} title={level !== 'na' ? { good: 'ভালো', ok: 'মোটামুটি', bad: 'দুর্বল' }[level] : undefined}>
      {display}
    </td>
  );
}

function MetricCells({ row }) {
  return (
    <>
      <MCell vkey="spend" raw={row.spend} display={formatBDT(row.spend)} strong />
      <MCell vkey="impressions" raw={row.impressions} display={fmtInt(row.impressions)} />
      <MCell vkey="clicks" raw={row.clicks} display={fmtInt(row.clicks)} />
      <MCell vkey="link_clicks" raw={row.link_clicks} display={fmtInt(row.link_clicks)} />
      <td className="px-3 py-3 text-right whitespace-nowrap">
        <div className="text-gray-600">{fmtInt(row.landing_page_views)}</div>
        {row.lp_view_rate != null && (
          <div className={`text-[10px] mt-0.5 ${levelTextClass(metricVerdict('lp_view_rate', row.lp_view_rate).level)}`}>
            {Number(row.lp_view_rate || 0)}% লিংক ক্লিকে
          </div>
        )}
      </td>
      <MCell vkey="ctr" raw={row.ctr} display={`${Number(row.ctr || 0)}%`} />
      <MCell vkey="hook_rate" raw={row.hook_rate} display={row.hook_rate != null ? `${Number(row.hook_rate)}%` : '—'} />
      <MCell vkey="cpc" raw={row.cpc} display={formatBDT(row.cpc)} />
      <MCell vkey="cpm" raw={row.cpm} display={formatBDT(row.cpm)} />
      <MCell vkey="reach" raw={row.reach} display={fmtInt(row.reach)} />
      <MCell vkey="frequency" raw={row.frequency} display={Number(row.frequency || 0).toFixed(2)} />
      <MCell vkey="purchases" raw={row.purchases} display={fmtInt(row.purchases)} strong />
      <MCell vkey="cpa" raw={row.cpa} display={formatBDT(row.cpa)} />
      <td className={`px-3 py-3 text-right whitespace-nowrap ${LEVEL_CELL[metricVerdict('roas', row.roas).level] || ''}`}>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${roasBadgeClass(row.roas)}`}>
          {Number(row.roas || 0).toFixed(2)}x
        </span>
      </td>
    </>
  );
}

function ResultCell({ row, open, onToggle }) {
  const d = diagnoseRow(row);
  const vs = verdictStyle(d.verdict);
  return (
    <td className="px-3 py-2.5 whitespace-nowrap text-center align-top">
      <button
        onClick={onToggle}
        title="বিস্তারিত diagnosis দেখুন"
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border ${vs.cls} hover:opacity-80 transition`}
      >
        <span>{vs.emoji}</span>{vs.label}
        <ChevronDown size={11} className={open ? 'rotate-180' : ''} />
      </button>
    </td>
  );
}

function DiagnosisRow({ row, depth }) {
  const d = diagnoseRow(row);
  const vs = verdictStyle(d.verdict);
  return (
    <tr className="bg-slate-50">
      <td colSpan={TOTAL_COLS} className="px-4 py-3">
        <div style={{ marginLeft: depth * 18 }} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${vs.cls}`}>
              {vs.emoji} {vs.label}
            </span>
            <p className="text-sm font-semibold text-gray-800 leading-snug">{d.headline}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="font-bold text-green-700 mb-1.5 flex items-center gap-1"><CheckCircle2 size={13} /> ভালো দিক</p>
              {d.goods.length ? (
                <ul className="space-y-1 text-gray-600">{d.goods.map((g, i) => <li key={i}>• {g}</li>)}</ul>
              ) : <p className="text-gray-400">—</p>}
            </div>
            <div>
              <p className="font-bold text-red-600 mb-1.5 flex items-center gap-1"><AlertCircle size={13} /> সমস্যা</p>
              {d.problems.length ? (
                <ul className="space-y-1 text-gray-600">{d.problems.map((p, i) => <li key={i}>• {p}</li>)}</ul>
              ) : <p className="text-gray-400">কোনো বড় সমস্যা নেই</p>}
            </div>
            <div>
              <p className="font-bold text-blue-600 mb-1.5 flex items-center gap-1"><Wrench size={13} /> যা করবেন</p>
              {d.actions.length ? (
                <ul className="space-y-1 text-gray-700">{d.actions.map((a, i) => <li key={i}>✔ {a}</li>)}</ul>
              ) : <p className="text-gray-400">এখন কিছু পরিবর্তন দরকার নেই — চালিয়ে যান।</p>}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

function NameCell({ row, depth, expandable, expanded, onToggle }) {
  const badge = statusBadge(row.effective_status || row.status);
  return (
    <td className="px-3 py-2.5 min-w-[230px] align-top">
      <div className="flex items-center gap-2" style={{ paddingLeft: depth * 18 }}>
        {expandable ? (
          <button onClick={onToggle} className="text-gray-400 hover:text-gray-700 shrink-0">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : <span className="w-4 shrink-0" />}
        <span className="text-sm">{badge.dot}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate max-w-[230px]" title={row.name}>{row.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
            {(() => {
              const a = ageInfo(row.created_time);
              if (a.days === null) return null;
              return (
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${a.young ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  🗓️ {a.label}
                </span>
              );
            })()}
            {(() => {
              const lb = learningBadge(row.learning_status);
              if (!lb) return null;
              return (
                <span
                  className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-semibold ${lb.cls}`}
                  title="Facebook learning phase"
                >
                  {lb.emoji} {lb.label}
                </span>
              );
            })()}
          </div>
        </div>
      </div>
    </td>
  );
}

const ChildLoadingRow = ({ depth }) => (
  <tr><td colSpan={TOTAL_COLS} className="px-3 py-3">
    <div className="h-4 rounded animate-pulse bg-gray-100" style={{ marginLeft: depth * 18 }} />
  </td></tr>
);
const ChildErrorRow = ({ depth, message }) => (
  <tr><td colSpan={TOTAL_COLS} className="px-3 py-3">
    <div className="flex items-center gap-2 text-xs text-red-600" style={{ marginLeft: depth * 18 }}>
      <AlertCircle size={13} /> {message}
    </div>
  </td></tr>
);
const ChildEmptyRow = ({ depth, label }) => (
  <tr><td colSpan={TOTAL_COLS} className="px-3 py-2.5 text-xs text-gray-400" style={{ paddingLeft: depth * 18 + 28 }}>{label}</td></tr>
);

// ─── Ad row (leaf — only the diagnosis expands) ─────────────────────────────────
function AdRow({ ad, depth }) {
  const [diag, setDiag] = useState(false);
  return (
    <>
      <tr className="bg-gray-50/40 hover:bg-gray-50">
        <NameCell row={ad} depth={depth} expandable={false} />
        <MetricCells row={ad} />
        <ResultCell row={ad} open={diag} onToggle={() => setDiag((o) => !o)} />
      </tr>
      {diag && <DiagnosisRow row={ad} depth={depth} />}
    </>
  );
}

// ─── Ad Set row ─────────────────────────────────────────────────────────────────
function AdSetRow({ adset, datePreset, depth }) {
  const [open, setOpen] = useState(false);
  const [diag, setDiag] = useState(false);
  const { rows, isLoading, error } = useChildren('ads', adset.id, datePreset, open);
  return (
    <>
      <tr className="bg-gray-50/60 hover:bg-gray-100/60">
        <NameCell row={adset} depth={depth} expandable expanded={open} onToggle={() => setOpen((o) => !o)} />
        <MetricCells row={adset} />
        <ResultCell row={adset} open={diag} onToggle={() => setDiag((o) => !o)} />
      </tr>
      {diag && <DiagnosisRow row={adset} depth={depth} />}
      {open && isLoading && <ChildLoadingRow depth={depth + 1} />}
      {open && error && <ChildErrorRow depth={depth + 1} message={error} />}
      {open && !isLoading && !error && rows.length === 0 && <ChildEmptyRow depth={depth + 1} label="কোনো Ad নেই" />}
      {open && rows.map((ad) => <AdRow key={ad.id} ad={ad} depth={depth + 1} />)}
    </>
  );
}

// ─── Campaign row ───────────────────────────────────────────────────────────────
function CampaignRow({ campaign, datePreset }) {
  const [open, setOpen] = useState(false);
  const [diag, setDiag] = useState(false);
  const { rows, isLoading, error } = useChildren('adsets', campaign.id, datePreset, open);
  return (
    <>
      <tr className="hover:bg-blue-50/40 border-t border-gray-100">
        <NameCell row={campaign} depth={0} expandable expanded={open} onToggle={() => setOpen((o) => !o)} />
        <MetricCells row={campaign} />
        <ResultCell row={campaign} open={diag} onToggle={() => setDiag((o) => !o)} />
      </tr>
      {diag && <DiagnosisRow row={campaign} depth={0} />}
      {open && isLoading && <ChildLoadingRow depth={1} />}
      {open && error && <ChildErrorRow depth={1} message={error} />}
      {open && !isLoading && !error && rows.length === 0 && <ChildEmptyRow depth={1} label="কোনো Ad Set নেই" />}
      {open && rows.map((as) => <AdSetRow key={as.id} adset={as} datePreset={datePreset} depth={1} />)}
    </>
  );
}

// ─── Table ──────────────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'name', label: 'Name', sortable: false, align: 'left' },
  { key: 'spend', label: 'Spend', sortable: true },
  { key: 'impressions', label: 'Impr.', sortable: true },
  { key: 'clicks', label: 'Clicks', sortable: true },
  { key: 'link_clicks', label: 'Link Clicks', sortable: true },
  { key: 'landing_page_views', label: 'LP View', sortable: true },
  { key: 'ctr', label: 'CTR', sortable: true },
  { key: 'hook_rate', label: 'Hook', sortable: true },
  { key: 'cpc', label: 'CPC', sortable: true },
  { key: 'cpm', label: 'CPM', sortable: true },
  { key: 'reach', label: 'Reach', sortable: true },
  { key: 'frequency', label: 'Freq.', sortable: true },
  { key: 'purchases', label: 'Purch.', sortable: true },
  { key: 'cpa', label: 'CPA', sortable: true },
  { key: 'roas', label: 'ROAS', sortable: true },
  { key: 'result', label: 'Result', sortable: false, align: 'center' },
];

export default function CampaignsTable({ campaigns, datePreset, isLoading, error, onRetry }) {
  const [sortKey, setSortKey] = useState('spend');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = useMemo(() => {
    const list = [...(campaigns || [])];
    list.sort((a, b) => {
      const av = Number(a[sortKey] || 0);
      const bv = Number(b[sortKey] || 0);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return list;
  }, [campaigns, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-bold text-gray-800">Campaigns</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 border border-green-300" /> ভালো</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200 border border-amber-300" /> মোটামুটি</span>
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 border border-red-300" /> দুর্বল</span>
          </div>
          <span className="text-xs text-gray-400 hidden sm:inline">· <strong>Result</strong>-এ ক্লিক করলে সমাধান দেখাবে</span>
        </div>
      </div>

      {error ? (
        <div className="p-8 text-center">
          <AlertCircle size={28} className="text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600 mb-3">{error}</p>
          {onRetry && (
            <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">আবার চেষ্টা করুন</button>
          )}
        </div>
      ) : isLoading && (!campaigns || !campaigns.length) ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 rounded-lg animate-pulse bg-gray-100" />)}
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
        <div className="p-10 text-center text-sm text-gray-400">এই সময়ের জন্য কোনো Campaign পাওয়া যায়নি।</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => c.sortable && toggleSort(c.key)}
                    className={`px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap align-top ${
                      c.align === 'left' ? 'text-left' : c.align === 'center' ? 'text-center' : 'text-right'
                    } ${c.sortable ? 'cursor-pointer select-none hover:text-gray-800' : ''}`}
                  >
                    <div>{c.label}{c.sortable && sortKey === c.key && <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>}</div>
                    {COLUMN_HINTS[c.key] && (
                      <div className="text-[9px] font-normal normal-case text-gray-400 mt-0.5">{COLUMN_HINTS[c.key]}</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((c) => <CampaignRow key={c.id} campaign={c} datePreset={datePreset} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
