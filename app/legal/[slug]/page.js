import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { config } from "@/config/config";

export const revalidate = 300;

async function getLegalPage(slug) {
  try {
    const res = await fetch(`${config.apiUrl}/legalpages/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) return { title: "Page Not Found" };
  const description = stripHtml(page.content).slice(0, 160);
  return {
    title: page.title,
    description,
    openGraph: { title: page.title, description, type: "article" },
  };
}

function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function LegalPage({ params }) {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) notFound();

  const updated = formatDate(page.updated_at || page.created_at);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      {/* Hero */}
      <section className="border-b border-gray-100 bg-white/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-3">
            <Link href="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-1.5 text-gray-300">/</span>
            <span className="text-gray-600">Legal</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight break-words">
            {page.title}
          </h1>
          {updated && (
            <p className="mt-3 text-sm text-gray-500">
              <span className="font-medium text-gray-600">Last updated:</span> {updated}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <article className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 md:py-12">
        <div
          className="legal-content text-gray-700"
          dangerouslySetInnerHTML={{ __html: page.content || "" }}
        />
      </article>

      {/* Scoped typography rules — fix paragraph spacing, headings, lists, overflow */}
      <style>{`
        .legal-content {
          font-size: 16px;
          line-height: 1.75;
          /* Container-level overflow protection */
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .legal-content * {
          max-width: 100% !important;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .legal-content > * + * { margin-top: 1rem; }
        .legal-content p { margin: 1rem 0; }
        .legal-content h1,
        .legal-content h2,
        .legal-content h3,
        .legal-content h4 {
          font-weight: 700;
          color: #111827;
          line-height: 1.3;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .legal-content h1 { font-size: 1.875rem; }
        .legal-content h2 { font-size: 1.5rem;   }
        .legal-content h3 { font-size: 1.25rem;  }
        .legal-content h4 { font-size: 1.125rem; }
        .legal-content ul,
        .legal-content ol { margin: 1rem 0; padding-left: 1.5rem; }
        .legal-content ul { list-style: disc;    }
        .legal-content ol { list-style: decimal; }
        .legal-content li { margin: 0.4rem 0; line-height: 1.7; }
        .legal-content li > ul,
        .legal-content li > ol { margin: 0.4rem 0; }
        .legal-content a {
          color: #4f46e5; text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s ease-in-out;
        }
        .legal-content a:hover { color: #4338ca; }
        .legal-content strong { color: #111827; font-weight: 600; }
        .legal-content em { font-style: italic; }
        .legal-content blockquote {
          margin: 1.25rem 0;
          padding: 0.75rem 1.25rem;
          border-left: 4px solid #c7d2fe;
          background: #eef2ff;
          color: #3730a3;
          border-radius: 0.375rem;
          font-style: italic;
        }
        .legal-content code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          background: #f3f4f6;
          color: #be185d;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        .legal-content pre {
          background: #0f172a; color: #e2e8f0;
          padding: 1rem; border-radius: 0.5rem;
          overflow-x: auto;
          max-width: 100%;
          white-space: pre;
          margin: 1rem 0;
        }
        .legal-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          word-break: normal;
          overflow-wrap: normal;
        }
        .legal-content hr {
          margin: 2rem 0;
          border: 0;
          border-top: 1px solid #e5e7eb;
        }
        .legal-content img,
        .legal-content video,
        .legal-content iframe {
          max-width: 100% !important;
          height: auto;
          display: block;
          border-radius: 0.5rem;
          margin: 1.25rem 0;
        }
        /* Wrap tables in a horizontal scroll container if too wide */
        .legal-content table {
          display: block;
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.9375rem;
          -webkit-overflow-scrolling: touch;
        }
        .legal-content thead,
        .legal-content tbody,
        .legal-content tr {
          display: table;
          width: 100%;
          table-layout: fixed;
        }
        .legal-content th,
        .legal-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem 0.75rem;
          text-align: left;
          word-break: break-word;
        }
        .legal-content th { background: #f9fafb; font-weight: 600; }
        /* Long links should wrap, not push the page */
        .legal-content a {
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        @media (max-width: 640px) {
          .legal-content { font-size: 15px; line-height: 1.7; }
          .legal-content h1 { font-size: 1.5rem;   }
          .legal-content h2 { font-size: 1.25rem;  }
          .legal-content h3 { font-size: 1.125rem; }
        }
      `}</style>
    </main>
  );
}
