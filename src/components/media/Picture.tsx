import { getImageProps, type ImageLoader } from 'next/image';
import { img, pickWidth } from '@/lib/media';

type Props = {
  k: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Absolutely fill the parent (parent must be positioned). */
  fill?: boolean;
  style?: React.CSSProperties;
  /** Show the blurred placeholder while loading (default true). */
  blur?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
};

/**
 * next/image backed by the pre-generated AVIF + WebP variants, rendered as
 * <picture> so AVIF-capable browsers get AVIF and everyone else gets WebP.
 */
export function Picture({ k, alt, sizes = '100vw', priority, className, fill, style, blur = true, fetchPriority }: Props) {
  const e = img(k);
  const loader =
    (fmt: 'avif' | 'webp'): ImageLoader =>
    ({ width }) =>
      `${e.src}-${pickWidth(e.widths, width)}.${fmt}`;
  const common = {
    alt,
    sizes,
    src: e.src,
    priority,
    fetchPriority,
    ...(fill ? { fill: true as const } : { width: e.width, height: e.height }),
    ...(blur ? { placeholder: 'blur' as const, blurDataURL: e.blurDataURL } : {}),
  };
  const avif = getImageProps({ ...common, loader: loader('avif') }).props;
  const { props } = getImageProps({ ...common, loader: loader('webp') });
  return (
    <picture className={fill ? 'contents' : undefined}>
      <source type="image/avif" srcSet={dedupe(avif.srcSet)} sizes={sizes} />
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...props} srcSet={dedupe(props.srcSet)} className={className} style={{ ...props.style, ...style }} />
    </picture>
  );
}

/** next/image lists every device size; collapse entries that resolve to the same file. */
function dedupe(srcSet?: string) {
  if (!srcSet) return srcSet;
  const seen = new Map<string, string>();
  for (const part of srcSet.split(', ')) {
    const [url, w] = part.split(' ');
    if (!seen.has(url)) seen.set(url, w);
  }
  // Use the real file width as the descriptor so the browser picks correctly.
  return [...seen.keys()].map((url) => `${url} ${url.match(/-(\d+)\.(avif|webp)$/)?.[1]}w`).join(', ');
}
