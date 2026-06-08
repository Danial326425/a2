// Ad performance "doctor" — judges each metric against Bangladesh COD
// benchmarks, then runs a funnel diagnosis (Hook → CTR → Landing → Purchase)
// to produce an overall verdict + concrete recommendations.
//
// Benchmarks are deliberately conservative/tunable. Money values are in BDT
// (the backend already converts), counts are raw.

export const BENCHMARKS = {
  ctr:       { good: 1.5, ok: 0.8 },   // %  (higher better)
  hook_rate: { good: 25, ok: 15 },     // %  (higher better, video only)
  roas:      { good: 3, ok: 1.5 },     // x  (higher better)
  frequency: { good: 2.0, ok: 3.5 },   //    (lower better)
  cpm:       { good: 120, ok: 250 },   // ৳  (lower better)
  cpc:       { good: 6, ok: 15 },      // ৳  (lower better)
  lp_view_rate: { good: 80, ok: 60 },  // %  (higher better) — clicks → LP view
};

// Below this spend we don't have enough data to judge fairly.
export const LEARNING_MIN_SPEND = 300;   // ৳
export const KILL_SPEND = 1000;          // ৳ spent with 0 purchase ⇒ stop/fix

// An ad must run at least this many days before we judge/kill it — Facebook's
// learning phase. Younger than this ⇒ never recommend turning off.
export const LEARNING_MIN_DAYS = 3;

/** Whole days since a created_time (ISO/date string). null if unknown. */
export function ageInDays(createdTime) {
  if (!createdTime) return null;
  const t = new Date(createdTime).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

/** Short Bangla age label + whether it's still "young" (don't-kill window). */
export function ageInfo(createdTime) {
  const days = ageInDays(createdTime);
  if (days === null) return { days: null, young: false, label: '' };
  return { days, young: days < LEARNING_MIN_DAYS, label: `${days} দিন` };
}

const LEVEL_TEXT = {
  good: 'text-green-600',
  ok: 'text-amber-600',
  bad: 'text-red-600',
  na: 'text-gray-300',
};
export const levelTextClass = (lvl) => LEVEL_TEXT[lvl] || 'text-gray-400';

const VERDICT_STYLE = {
  scale:    { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'স্কেল করুন', emoji: '🚀' },
  healthy:  { cls: 'bg-green-100 text-green-700 border-green-200',       label: 'ভালো চলছে', emoji: '✅' },
  watch:    { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200',    label: 'নজরে রাখুন', emoji: '👀' },
  fix:      { cls: 'bg-orange-100 text-orange-700 border-orange-200',    label: 'ঠিক করুন', emoji: '🛠️' },
  kill:     { cls: 'bg-red-100 text-red-700 border-red-200',             label: 'বন্ধ/ঠিক করুন', emoji: '🛑' },
  learning: { cls: 'bg-blue-100 text-blue-700 border-blue-200',          label: 'লার্নিং', emoji: '⏳' },
  paused:   { cls: 'bg-gray-100 text-gray-500 border-gray-200',          label: 'বন্ধ', emoji: '⏸️' },
};
export const verdictStyle = (key) => VERDICT_STYLE[key] || VERDICT_STYLE.watch;

/** Badge for Meta's ad-set learning phase. null when not applicable. */
export function learningBadge(status) {
  switch ((status || '').toUpperCase()) {
    case 'LEARNING': return { label: 'Learning', cls: 'bg-blue-50 text-blue-600 border-blue-200', emoji: '📘' };
    case 'FAIL':     return { label: 'Learning Limited', cls: 'bg-orange-50 text-orange-600 border-orange-200', emoji: '⚠️' };
    case 'SUCCESS':  return { label: 'Learned', cls: 'bg-green-50 text-green-600 border-green-200', emoji: '✓' };
    default:         return null;
  }
}

/**
 * What to actually show on a row. Prefers Meta's real status; when Meta omits
 * it (ad set already exited learning, or not delivering yet) we estimate from
 * age so a freshly-launched ad still visibly shows "Learning". Returns null
 * when there's nothing meaningful to show.
 */
export function learningDisplay(row) {
  const real = learningBadge(row?.learning_status);
  if (real) return { ...real, real: true };

  const a = ageInDays(row?.created_time);
  if (a !== null && a < LEARNING_MIN_DAYS) {
    return { label: 'Learning (আনুমানিক)', cls: 'bg-blue-50 text-blue-500 border-blue-200', emoji: '📘', real: false };
  }
  return null;
}

// ─── Per-metric verdict (small label under each cell) ───────────────────────────
const higherBetter = (v, b, labels) => {
  if (v >= b.good) return { level: 'good', label: labels[0] };
  if (v >= b.ok)   return { level: 'ok',   label: labels[1] };
  return { level: 'bad', label: labels[2] };
};
const lowerBetter = (v, b, labels) => {
  if (v <= b.good) return { level: 'good', label: labels[0] };
  if (v <= b.ok)   return { level: 'ok',   label: labels[1] };
  return { level: 'bad', label: labels[2] };
};

export function metricVerdict(key, value) {
  const v = Number(value || 0);
  switch (key) {
    case 'lp_view_rate': return v <= 0 ? { level: 'na', label: '' } : higherBetter(v, BENCHMARKS.lp_view_rate, ['ভালো', 'মোটামুটি', 'কম']);
    case 'ctr':       return higherBetter(v, BENCHMARKS.ctr,  ['ভালো', 'মোটামুটি', 'কম']);
    case 'roas':      return higherBetter(v, BENCHMARKS.roas, ['লাভজনক', 'মোটামুটি', 'ক্ষতি']);
    case 'hook_rate': return v <= 0 ? { level: 'na', label: '' } : higherBetter(v, BENCHMARKS.hook_rate, ['শক্তিশালী', 'মোটামুটি', 'দুর্বল']);
    case 'frequency': return v <= 0 ? { level: 'na', label: '' } : lowerBetter(v, BENCHMARKS.frequency, ['ঠিক আছে', 'একটু বেশি', 'বেশি']);
    case 'cpm':       return lowerBetter(v, BENCHMARKS.cpm, ['কম', 'মোটামুটি', 'বেশি']);
    case 'cpc':       return lowerBetter(v, BENCHMARKS.cpc, ['কম', 'মোটামুটি', 'বেশি']);
    default:          return { level: 'na', label: '' }; // spend/impr/clicks/reach/purch/cpa — no verdict
  }
}

// Short benchmark hint under each column header.
export const COLUMN_HINTS = {
  landing_page_views: 'ক্লিকের ≥৮০%',
  ctr: 'ভালো ≥১.৫%',
  hook_rate: 'ভালো ≥২৫%',
  frequency: 'ভালো ≤২',
  cpc: 'ভালো ≤৳৬',
  cpm: 'ভালো ≤৳১২০',
  roas: 'ভালো ≥৩x',
};

// ─── Overall row diagnosis (verdict + problems + actions) ───────────────────────
export function diagnoseRow(row) {
  const spend = Number(row?.spend || 0);
  const roas  = Number(row?.roas || 0);
  const ctr   = Number(row?.ctr || 0);
  const hook  = Number(row?.hook_rate || 0);
  const freq  = Number(row?.frequency || 0);
  const cpm   = Number(row?.cpm || 0);
  const purch = Number(row?.purchases || 0);
  // EFFECTIVE status is the real delivery state — a child whose parent is
  // paused reads CAMPAIGN_PAUSED / ADSET_PAUSED here even though its own
  // `status` is still ACTIVE. Use it so paused items never show a green verdict.
  const eff = (row?.effective_status || row?.status || '').toUpperCase();
  const age = ageInDays(row?.created_time); // null when unknown (e.g. account summary)
  const learning = (row?.learning_status || '').toUpperCase(); // LEARNING/SUCCESS/FAIL (ad sets only)

  const goods = [];
  const problems = [];
  const actions = [];

  if (eff && eff !== 'ACTIVE') {
    const head =
      (eff === 'ARCHIVED' || eff === 'DELETED') ? 'এটি Archived/Deleted।' :
      eff.includes('PAUSED') ? 'এই আইটেমটি বন্ধ (Paused) — এখন চলছে না।' :
      eff === 'DISAPPROVED' ? 'অ্যাডটি Disapproved — Meta রিজেক্ট করেছে, ঠিক করে আবার সাবমিট করুন।' :
      'এটি এখন delivering নয় (review/issue/paused)।';
    return { verdict: 'paused', headline: head, goods, problems, actions, age };
  }

  // Funnel checks (always run, even for young ads, so the advice is ready) ───────
  // 1) Hook (video creative, first 3s)
  if (hook > 0 && hook < BENCHMARKS.hook_rate.ok) {
    problems.push(`Hook Rate কম (${hook}%) — ভিডিওর প্রথম ৩ সেকেন্ড মানুষকে আটকাতে পারছে না।`);
    actions.push('ভিডিওর প্রথম ৩ সেকেন্ড পাল্টান: bold দাবি, pattern-interrupt, বা সমস্যাটা সরাসরি দেখান।');
  } else if (hook >= BENCHMARKS.hook_rate.good) {
    goods.push(`Hook শক্তিশালী (${hook}%)`);
  }

  // 2) CTR (ad → click)
  if (ctr < BENCHMARKS.ctr.ok) {
    problems.push(`CTR কম (${ctr}%) — অ্যাড মানুষকে ক্লিক করাতে পারছে না।`);
    actions.push('Creative/headline/CTA বা thumbnail পরিবর্তন করুন; অফারটা আরও স্পষ্ট ও আকর্ষণীয় করুন।');
  } else if (ctr >= BENCHMARKS.ctr.good) {
    goods.push(`CTR ভালো (${ctr}%)`);
  }

  // 3) Frequency (fatigue)
  if (freq > BENCHMARKS.frequency.ok) {
    problems.push(`Frequency বেশি (${freq}) — একই মানুষ বারবার দেখছে (ad fatigue)।`);
    actions.push('নতুন creative যোগ করুন অথবা audience বড় করুন (broad / নতুন lookalike)।');
  } else if (freq > 0 && freq <= BENCHMARKS.frequency.good) {
    goods.push('Frequency স্বাস্থ্যকর');
  }

  // 4) CPM (auction cost)
  if (cpm > BENCHMARKS.cpm.ok) {
    problems.push(`CPM বেশি (৳${cpm}) — reach ব্যয়বহুল হয়ে যাচ্ছে।`);
    actions.push('Audience broad করুন, Advantage+ placements দিন, খুব সরু targeting এড়ান।');
  }

  // 4b) Learning Limited (Facebook couldn't exit learning — structural issue)
  if (learning === 'FAIL') {
    problems.push('Ad Set "Learning Limited" — সপ্তাহে ~৫০ conversion পাচ্ছে না, তাই Facebook ভালোভাবে optimize করতে পারছে না।');
    actions.push('Ad set একত্র করুন (কম ad set / CBO), audience broad করুন, বাজেট বাড়ান, অথবা উপরের ধাপের conversion event দিন (Purchase → Add to Cart)।');
  } else if (learning === 'SUCCESS') {
    goods.push('Learning শেষ (stable)');
  }

  // 5) Conversion (post-click)
  if (purch === 0) {
    problems.push('খরচ হচ্ছে কিন্তু একটিও Purchase হয়নি।');
    if (ctr >= BENCHMARKS.ctr.ok) {
      problems.push('ক্লিক আসছে কিন্তু কেনা হচ্ছে না — সমস্যা সম্ভবত Facebook-এ নয়।');
      actions.push('ল্যান্ডিং পেজ স্পিড, দাম, অফার ও চেকআউট ফর্ম যাচাই করুন; Pixel Purchase event ঠিকঠাক fire হচ্ছে কিনা দেখুন।');
    } else {
      actions.push('আগে creative ও audience ঠিক করুন (ক্লিকই কম), তারপর ল্যান্ডিং পেজ দেখুন।');
    }
  } else if (roas < BENCHMARKS.roas.ok) {
    problems.push(`ROAS কম (${roas}x) — খরচের তুলনায় বিক্রি কম।`);
    if (ctr >= BENCHMARKS.ctr.ok && (hook <= 0 || hook >= BENCHMARKS.hook_rate.ok)) {
      problems.push('Facebook মেট্রিক মোটামুটি ঠিক, তবু ROAS কম → ল্যান্ডিং পেজ/দাম/অফারে সমস্যা।');
      actions.push('অফার শক্তিশালী করুন (bundle/discount/urgency), দাম পুনর্বিবেচনা করুন, ল্যান্ডিং পেজের কনভার্সন বাড়ান।');
    } else {
      actions.push('দুর্বল creative/audience ঠিক করে আগে CTR ও hook বাড়ান।');
    }
  } else if (roas >= BENCHMARKS.roas.good) {
    goods.push(`ROAS চমৎকার (${roas}x)`);
  }

  // Verdict decision — age-aware: NEVER recommend turning off before the
  // learning window (3 days). Only after 3 days do we flag ads to kill. ────────
  const metaLearning = learning === 'LEARNING';        // Facebook-confirmed
  const young = metaLearning || (age !== null && age < LEARNING_MIN_DAYS);
  const ageTxt = age !== null ? `বয়স ${age} দিন — ` : '';
  let verdict;
  let headline;

  if (young) {
    // Learning phase → don't kill. Surface observations as things to watch.
    verdict = 'learning';
    const watchNote = problems.length ? ' লক্ষ্য রাখুন: ' + problems[0] : '';
    headline = metaLearning
      ? `${ageTxt}Facebook নিশ্চিত করেছে এটি এখনো Learning phase-এ আছে — এখন বন্ধ বা বড় এডিট করবেন না (learning reset হয়ে যাবে)।${watchNote}`
      : `${ageTxt}Facebook এখনো শিখছে (learning phase)। অন্তত ${LEARNING_MIN_DAYS} দিন চলতে দিন — এখন বন্ধ করবেন না।${watchNote}`;
  } else if (spend < LEARNING_MIN_SPEND) {
    verdict = 'learning';
    headline = `যথেষ্ট ডেটা নেই (খরচ ৳${Math.round(spend)})। সঠিক রায় দিতে অন্তত ৳${LEARNING_MIN_SPEND}+ খরচ দিন।`;
  } else if (purch === 0) {
    // Mature (≥3 days) with no sale → stop it.
    verdict = 'kill';
    headline = `${ageTxt}${LEARNING_MIN_DAYS}+ দিনে ৳${Math.round(spend)} খরচ, কিন্তু একটিও বিক্রি নেই — এই অ্যাডটি বন্ধ করুন।`;
  } else if (roas < 1) {
    verdict = 'kill';
    headline = `${ageTxt}ROAS ${roas}x — খরচের চেয়ে বিক্রি কম (লস হচ্ছে)। বন্ধ করুন অথবা বড় পরিবর্তন আনুন।`;
  } else if (roas >= BENCHMARKS.roas.good && ctr >= 1.0 && freq <= 3) {
    verdict = 'scale';
    headline = `${ageTxt}লাভজনক ও স্বাস্থ্যকর (ROAS ${roas}x) — ধীরে ধীরে বাজেট বাড়ান (২০–৩০%/দিন)।`;
  } else if (roas >= BENCHMARKS.roas.ok) {
    verdict = 'healthy';
    headline = `${ageTxt}ভালো চলছে (ROAS ${roas}x)। ছোট অপ্টিমাইজেশনে আরও ভালো করা সম্ভব।`;
  } else {
    // roas 1–1.5 : break-even-ish
    verdict = 'watch';
    headline = `${ageTxt}break-even-এর কাছাকাছি (ROAS ${roas}x)। নিচের পরিবর্তন করে উন্নতি করুন; ২–৩ দিনেও না বাড়লে বন্ধ করুন।`;
  }

  return { verdict, headline, goods, problems, actions, age, young };
}
