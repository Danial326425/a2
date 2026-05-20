import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * On-demand revalidation endpoint. The Laravel admin dashboard calls this
 * after any SEO / product / category save so Next.js purges its data cache
 * without waiting for the per-tag TTL.
 *
 * Authentication: shared-secret header. Set REVALIDATE_SECRET in BOTH the
 * Next environment and the Laravel `.env` (REVALIDATE_SECRET). Laravel
 * sends:   X-Revalidate-Secret: {secret}
 *
 * Body shape (POST JSON):
 *   { "tag":  "seo-global" }              // by cache tag
 *   { "path": "/some-product" }           // by path
 *   { "tags": ["seo-global", "products"] }// multiple
 *
 * GET is supported for quick browser testing (with ?secret=... query arg).
 */

const SECRET = process.env.REVALIDATE_SECRET || '';

function checkSecret(req) {
  if (!SECRET) return false; // never accept if not configured — fail-closed
  const headerSecret = req.headers.get('x-revalidate-secret');
  const url = new URL(req.url);
  const querySecret = url.searchParams.get('secret');
  return headerSecret === SECRET || querySecret === SECRET;
}

async function performRevalidation({ tag, tags, path }) {
  const purged = { tags: [], paths: [] };
  const all = Array.isArray(tags) ? tags : (tag ? [tag] : []);
  for (const t of all) {
    if (typeof t === 'string' && t.length) {
      revalidateTag(t);
      purged.tags.push(t);
    }
  }
  if (typeof path === 'string' && path.length) {
    revalidatePath(path);
    purged.paths.push(path);
  }
  return purged;
}

export async function POST(request) {
  if (!checkSecret(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  let body = {};
  try { body = await request.json(); } catch { /* allow empty body — purges nothing */ }
  const purged = await performRevalidation(body);
  return NextResponse.json({ ok: true, ...purged, now: Date.now() });
}

export async function GET(request) {
  if (!checkSecret(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(request.url);
  const purged = await performRevalidation({
    tag:  url.searchParams.get('tag'),
    path: url.searchParams.get('path'),
  });
  return NextResponse.json({ ok: true, ...purged, now: Date.now() });
}
