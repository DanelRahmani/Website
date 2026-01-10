// src/components/Share.tsx
import React from 'react';
import { XIcon } from './icons/XIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { MailIcon } from './icons/MailIcon';
import { LinkIcon } from './icons/LinkIcon';
import { RedditIcon } from './icons/RedditIcon';

type Platform = 'x' | 'linkedin' | 'facebook' | 'reddit' | 'email';

const getShareUrl = (platform: Platform, title: string, url: string, text?: string, image?: string) => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const txt = encodeURIComponent(text ?? title);
  const img = image ? encodeURIComponent(image) : '';

  switch (platform) {
    case 'x':
      return `https://x.com/intent/tweet?text=${txt}%0A%0A${img}&url=${u}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}&summary=${txt}${img ? `&source=${img}` : ''}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}${img ? `&picture=${img}` : ''}`;
    case 'reddit':
      return `https://www.reddit.com/submit?url=${u}&title=${t}${img ? `&sr=${img}` : ''}`;
    case 'email':
      return `mailto:?subject=${t}&body=${txt}%0A%0A${u}`;
  }
};

export function openShare(platform: Platform, title: string, url: string, text?: string, image?: string) {
  const shareData = { title, text: text ?? title, url };

  const isMobile =
    typeof navigator !== 'undefined' &&
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

  // Use native share on mobile where available
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function' && isMobile) {
    navigator.share(shareData).catch(() => {
      // fallback: open in new tab if possible, final fallback to same tab
      const shareUrl = getShareUrl(platform, title, url, text, image);
      const opened = window.open(shareUrl, '_blank', 'noopener,noreferrer');
      if (!opened) window.location.href = shareUrl;
    });
    return;
  }

  // Desktop behavior: open in new tab (mailto is handled by link markup)
  const shareUrl = getShareUrl(platform, title, url, text, image);
  const opened = window.open(shareUrl, '_blank', 'noopener,noreferrer');
  if (opened && typeof opened.focus === 'function') {
    try { opened.focus(); } catch {}
    return;
  }

  // Popup blocked -> navigate current tab as last resort
  window.location.href = shareUrl;
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M15 3h2.5V.5h-2.5C13.01.5 11 1.98 11 4.52V7H8v3h3v9h3v-9h2.32l.38-3H14V4.67C14 4.1 14.32 3.5 15 3z" />
    </svg>
  );
}

const IconMap: Record<Platform, React.ElementType> = {
  x: XIcon,
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
  reddit: RedditIcon,
  email: MailIcon,
};

export default function Share({ title, url, image, className = '' }: { title: string; url: string; image?: string; className?: string }) {
  const platforms: Platform[] = ['x', 'linkedin', 'facebook', 'reddit', 'email'];
  const [copied, setCopied] = React.useState(false);
  const [isMobileClient, setIsMobileClient] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    setIsMobileClient(/Mobi|Android|iPhone|iPad|iPod/i.test(ua));
  }, []);

  const copyLink = async (copyUrl: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(copyUrl);
      } else {
        const el = document.createElement('textarea');
        el.value = copyUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const shareButtonClasses =
    'group inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium no-underline text-zinc-800 dark:text-zinc-200 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {platforms.map((p) => {
        const Icon = IconMap[p];
        const shareUrl = getShareUrl(p, title, url, undefined, image);

        // Email: always render as mailto link (same-tab / mail client)
        if (p === 'email') {
          return (
            <a
              key={p}
              href={shareUrl}
              aria-label="Share via email"
              className={shareButtonClasses}
              onClick={(e) => e.stopPropagation()}
            >
              <Icon className="h-5 w-5 flex-none fill-zinc-500 transition group-hover:fill-primary dark:fill-zinc-400" />
              <span className="hidden md:inline">Email</span>
            </a>
          );
        }

        // If we are on mobile and the Web Share API exists, use a button to invoke it
        if (isMobileClient && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
          return (
            <button
              key={p}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openShare(p, title, url, undefined, image);
              }}
              aria-label={`Share on ${p}`}
              className={shareButtonClasses}
            >
              <Icon className="h-5 w-5 flex-none fill-zinc-500 transition group-hover:fill-primary dark:fill-zinc-400" />
              <span className="hidden md:inline">{p[0].toUpperCase() + p.slice(1)}</span>
            </button>
          );
        }

        // Desktop: use an anchor which opens in a new tab (prevents navigation of current tab)
        return (
          <a
            key={p}
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${p}`}
            className={shareButtonClasses}
            onClick={(e) => e.stopPropagation()}
          >
            <Icon className="h-5 w-5 flex-none fill-zinc-500 transition group-hover:fill-primary dark:fill-zinc-400" />
            <span className="hidden md:inline">{p[0].toUpperCase() + p.slice(1)}</span>
          </a>
        );
      })}

      {/* Copy link button */}
      <button
        type="button"
        onClick={(e) => copyLink(url, e)}
        aria-label="Copy link"
        className={shareButtonClasses}
      >
        <LinkIcon className="h-5 w-5 flex-none fill-zinc-500 transition group-hover:fill-primary dark:fill-zinc-400" />
        <span className="hidden md:inline">{copied ? 'Copied!' : 'Copy link'}</span>
      </button>
    </div>
  );
}