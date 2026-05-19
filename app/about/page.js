import React from "react";
import Image from "next/image";
import Link from "next/link";
import { config } from "@/config/config";

export const revalidate = 300;

async function getAbout() {
  try {
    const res = await fetch(`${config.apiUrl}/about`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const a = await getAbout();
  const title = a?.hero_title || "About Us";
  const description = a?.hero_subtitle || a?.story_content?.slice(0, 160) || "Learn more about us.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

const imageUrl = (path) => path ? `${config.imageUrl}/${path}` : null;

export default async function AboutPage() {
  const about = await getAbout();
  const a = about || {};

  const stats = Array.isArray(a.stats) ? a.stats : [];
  const values = Array.isArray(a.values) ? a.values : [];

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            {a.hero_eyebrow && (
              <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">
                {a.hero_eyebrow}
              </p>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              {a.hero_title || "About Us"}
            </h1>
            {a.hero_subtitle && (
              <p className="text-base md:text-lg text-gray-600 mt-4 leading-relaxed">
                {a.hero_subtitle}
              </p>
            )}
          </div>
          {a.hero_image && (
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={imageUrl(a.hero_image)}
                alt={a.hero_title || "About"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <section className="border-y border-gray-100 bg-gray-50/50">
          <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-green-600">{s.value || "—"}</p>
                <p className="text-sm text-gray-600 mt-1.5">{s.label || ""}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Story */}
      {(a.story_title || a.story_content || a.story_image) && (
        <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {a.story_image && (
              <div className="relative w-full h-72 md:h-[26rem] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={imageUrl(a.story_image)}
                  alt={a.story_title || "Our story"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            )}
            <div className={a.story_image ? "" : "md:col-span-2 max-w-3xl mx-auto"}>
              {a.story_title && (
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {a.story_title}
                </h2>
              )}
              {a.story_content && (
                <div
                  className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: a.story_content }}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision */}
      {(a.mission_title || a.vision_title) && (
        <section className="bg-gradient-to-br from-emerald-50 to-green-50 border-y border-emerald-100">
          <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8">
            {(a.mission_title || a.mission_content) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {a.mission_title || "Our Mission"}
                </h3>
                {a.mission_content && (
                  <div
                    className="prose prose-sm prose-gray max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: a.mission_content }}
                  />
                )}
              </div>
            )}
            {(a.vision_title || a.vision_content) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {a.vision_title || "Our Vision"}
                </h3>
                {a.vision_content && (
                  <div
                    className="prose prose-sm prose-gray max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: a.vision_content }}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Values */}
      {values.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                {v.icon && (
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3 text-xl">
                    {v.icon}
                  </div>
                )}
                <h4 className="font-semibold text-gray-900 mb-1.5">{v.title || ""}</h4>
                {v.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{v.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {(a.cta_title || a.cta_button_label) && (
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            {a.cta_title && (
              <h2 className="text-2xl md:text-3xl font-bold mb-3">{a.cta_title}</h2>
            )}
            {a.cta_subtitle && (
              <p className="text-green-50 text-base md:text-lg max-w-2xl mx-auto mb-7">
                {a.cta_subtitle}
              </p>
            )}
            {a.cta_button_label && a.cta_button_url && (
              <Link
                href={a.cta_button_url}
                className="inline-block px-7 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors shadow-md"
              >
                {a.cta_button_label}
              </Link>
            )}
          </div>
        </section>
      )}

      {!about && (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">About page content is being prepared. Please check back soon.</p>
        </div>
      )}
    </main>
  );
}
