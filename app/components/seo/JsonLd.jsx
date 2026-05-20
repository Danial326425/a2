/**
 * Reusable structured-data injector. Pass any plain object that follows
 * a schema.org schema; we serialize it safely (escapes `<` so the JSON
 * payload can't close the surrounding <script> tag) and inject as
 * application/ld+json — the only content-type Google parses for rich
 * results.
 *
 * Renders nothing on the page; it's an SEO-only side effect.
 *
 * Usage:
 *   <JsonLd data={{
 *     '@context': 'https://schema.org',
 *     '@type': 'Organization',
 *     name: 'Safwan',
 *     url: 'https://example.com',
 *   }} />
 *
 * For multiple schemas on one page just render multiple <JsonLd /> tags.
 */
export default function JsonLd({ data }) {
  if (!data || typeof data !== 'object') return null;
  // Replace `<` with its Unicode escape inside JSON to prevent script-tag
  // breakout if any field contains attacker-controlled HTML.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
