export default function imageLoader({ src, width, quality }) {
  if (src.startsWith('http') || src.startsWith('blob')) {
    return src;
  }
  return `${src}?w=${width}&q=${quality || 75}`;
}