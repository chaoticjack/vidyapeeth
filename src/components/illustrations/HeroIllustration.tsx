export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 520"
      className={className}
      fill="none"
      stroke="#1B2A4A"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M120 360 C 60 270, 130 140, 250 130 C 400 118, 470 230, 440 340 C 420 430, 280 470, 200 440 C 150 422, 140 400, 120 360 Z"
        fill="#F4700B"
        stroke="none"
        opacity="0.92"
      />
      <rect x="170" y="170" width="220" height="270" rx="14" fill="#FFF8F0" />
      <line x1="200" y1="220" x2="370" y2="220" />
      <line x1="200" y1="250" x2="340" y2="250" />
      <line x1="200" y1="280" x2="360" y2="280" />
      <line x1="200" y1="310" x2="320" y2="310" />
      <line x1="200" y1="340" x2="350" y2="340" />
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={i} cx={170} cy={195 + i * 28} r={5} fill="#1B2A4A" />
      ))}
      <g transform="rotate(-22 380 200)">
        <rect x="350" y="80" width="60" height="220" rx="6" fill="#FFF8F0" />
        <rect x="350" y="80" width="60" height="40" rx="6" fill="#F4700B" stroke="#1B2A4A" />
        <polygon points="350,300 380,360 410,300" fill="#FFF8F0" />
        <polygon points="370,330 380,360 390,330" fill="#1B2A4A" stroke="none" />
      </g>
      <path d="M90 130 l8 22 22 8 -22 8 -8 22 -8 -22 -22 -8 22 -8 z" fill="#F4700B" stroke="#1B2A4A" />
      <path d="M450 110 l5 14 14 5 -14 5 -5 14 -5 -14 -14 -5 14 -5 z" fill="#FFF8F0" />
      <circle cx="80" cy="430" r="14" fill="#FFF8F0" />
      <path d="M470 430 q -20 -30 -50 -20" />
    </svg>
  );
}