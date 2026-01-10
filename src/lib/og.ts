// src/lib/og.ts
export type OgOptions = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  theme?: string;
};

export function buildOpenGraphUrl({ title, description, image, siteName, theme }: OgOptions) {
  const base = (process.env.NEXT_PUBLIC_URL || '').replace(/\/$/, '');
  const params = new URLSearchParams();

  if (title) params.set('title', title);
  if (description) params.set('description', description);
  if (image) params.set('image', image);
  if (siteName) params.set('siteName', siteName);
  if (theme) params.set('theme', theme);

  return `${base}/api/og?${params.toString()}`;
}