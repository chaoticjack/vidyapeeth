const common = "h-full w-full";

export function Step1({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className ?? common} fill="none" stroke="#1B2A4A" strokeWidth="2.4" aria-hidden>
      <circle cx="100" cy="100" r="78" fill="#FFF8F0" />
      <rect x="62" y="68" width="76" height="68" rx="6" fill="#F4700B" />
      <line x1="78" y1="86" x2="122" y2="86" stroke="#FFF8F0" />
      <line x1="78" y1="104" x2="116" y2="104" stroke="#FFF8F0" />
      <line x1="78" y1="122" x2="108" y2="122" stroke="#FFF8F0" />
      <circle cx="140" cy="64" r="14" fill="#FFF8F0" />
      <path d="M134 64 l4 4 8 -8" />
    </svg>
  );
}
export function Step2({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className ?? common} fill="none" stroke="#1B2A4A" strokeWidth="2.4" aria-hidden>
      <circle cx="100" cy="100" r="78" fill="#FFF8F0" />
      <path d="M50 130 l28 -28 22 22 38 -52" />
      <circle cx="78" cy="102" r="4" fill="#F4700B" stroke="none" />
      <circle cx="100" cy="124" r="4" fill="#F4700B" stroke="none" />
      <circle cx="138" cy="72" r="4" fill="#F4700B" stroke="none" />
      <line x1="42" y1="148" x2="158" y2="148" />
    </svg>
  );
}
export function Step3({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className ?? common} fill="none" stroke="#1B2A4A" strokeWidth="2.4" aria-hidden>
      <circle cx="100" cy="100" r="78" fill="#FFF8F0" />
      <path d="M70 130 l0 -40 l30 -20 l30 20 l0 40 z" fill="#F4700B" />
      <path d="M70 130 l30 -20 l30 20" />
      <path d="M100 110 l0 20" />
      <path d="M86 60 l14 -18 l14 18" />
    </svg>
  );
}