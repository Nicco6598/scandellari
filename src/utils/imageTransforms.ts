import { ImmagineInfo } from '../types/supabaseTypes';

type ResizeMode = 'cover' | 'contain' | 'fill';

type SupabaseImageOptions = {
  format?: 'origin' | 'webp';
  quality?: number;
  resize?: ResizeMode;
  width?: number;
};

type ResponsiveImageOptions = SupabaseImageOptions & {
  sizes: string;
  widths: number[];
};

const STORAGE_OBJECT_PATH_PATTERN = /\/storage\/v1\/object\/public\/images\/(.+?)(?:\?.*)?$/i;
const SUPABASE_IMAGE_TRANSFORMS_ENABLED = false;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

function normalizeWidths(widths: number[]) {
  return Array.from(new Set(widths.filter((width) => Number.isFinite(width) && width > 0))).sort((left, right) => left - right);
}

function resolveImagePath(image?: Partial<ImmagineInfo> | null) {
  if (!image) return null;
  if (image.path) return image.path;

  if (!image.url) return null;

  const matches = image.url.match(STORAGE_OBJECT_PATH_PATTERN);
  return matches?.[1] ? decodeURIComponent(matches[1]) : null;
}

function buildPublicStorageUrl(path: string) {
  if (!supabaseUrl) return '';
  const normalizedBaseUrl = supabaseUrl.replace(/\/+$/, '');
  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${normalizedBaseUrl}/storage/v1/object/public/images/${encodedPath}`;
}

function buildTransformUrl(path: string, options: SupabaseImageOptions) {
  const publicUrl = buildPublicStorageUrl(path);
  if (!publicUrl) return '';

  const hasTransforms = Boolean(
    options.width ||
    options.quality ||
    options.resize ||
    (options.format && options.format !== 'origin')
  );

  if (!hasTransforms || !SUPABASE_IMAGE_TRANSFORMS_ENABLED) return publicUrl;

  const renderUrl = publicUrl.replace('/object/public/', '/render/image/public/');
  const url = new URL(renderUrl);

  if (options.width) url.searchParams.set('width', String(options.width));
  if (options.quality) url.searchParams.set('quality', String(options.quality));
  if (options.resize) url.searchParams.set('resize', options.resize);
  if (options.format && options.format !== 'origin') url.searchParams.set('format', options.format);

  return url.toString();
}

export function getOptimizedImageUrl(image?: Partial<ImmagineInfo> | null, options: SupabaseImageOptions = {}) {
  const path = resolveImagePath(image);
  if (!path) return image?.url ?? '';

  const transformedUrl = buildTransformUrl(path, {
    format: 'webp',
    quality: 72,
    resize: 'cover',
    ...options,
  });

  return transformedUrl || image?.url || '';
}

export function getResponsiveImageProps(image?: Partial<ImmagineInfo> | null, options?: ResponsiveImageOptions) {
  const fallbackSrc = image?.url ?? '';
  const canGenerateResponsiveVariants = SUPABASE_IMAGE_TRANSFORMS_ENABLED && Boolean(resolveImagePath(image));

  if (!options) {
    return {
      sizes: undefined,
      src: fallbackSrc,
      srcSet: undefined,
    };
  }

  const widths = normalizeWidths(options.widths);
  if (widths.length === 0 || !canGenerateResponsiveVariants) {
    return {
      sizes: options.sizes,
      src: getOptimizedImageUrl(image, options),
      srcSet: undefined,
    };
  }

  const src = getOptimizedImageUrl(image, {
    ...options,
    width: widths[widths.length - 1],
  });

  const srcSet = widths
    .map((width) => `${getOptimizedImageUrl(image, { ...options, width })} ${width}w`)
    .join(', ');

  return {
    sizes: options.sizes,
    src,
    srcSet,
  };
}
