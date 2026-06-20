export function CtaArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 120"
      className={className}
      fill="none"
      stroke="#F4700B"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 40 C 60 10, 120 90, 200 60" strokeDasharray="2 8" />
      <path d="M186 48 l18 14 l-22 12" />
    </svg>
  );
}