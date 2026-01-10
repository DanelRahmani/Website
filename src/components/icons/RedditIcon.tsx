// src/components/icons/RedditIcon.tsx
export function RedditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9.2" cy="11.2" r="1.05" />
      <circle cx="14.8" cy="11.2" r="1.05" />
      <path d="M8.5 15c1 .8 2.2 1.2 3.5 1.2 1.3 0 2.5-.4 3.5-1.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M15.6 6.1l1.6-1.6M17.2 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}