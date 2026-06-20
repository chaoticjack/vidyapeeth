export function VsatCard({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 340"
      className={className}
      fill="none"
      stroke="#FFF8F0"
      strokeWidth="2"
      aria-hidden="true"
    >
      <defs>
        <pattern id="vsat-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#FFF8F0" opacity="0.18" />
        </pattern>
      </defs>
      <rect x="20" y="20" width="480" height="300" rx="18" fill="#FFF8F0" stroke="#F4700B" strokeWidth="2.5" />
      <rect x="20" y="20" width="480" height="68" rx="18" fill="#1B2A4A" stroke="none" />
      <rect x="20" y="78" width="480" height="10" fill="url(#vsat-dots)" stroke="none" />
      <text x="44" y="62" fill="#FFF8F0" fontFamily="Syne, sans-serif" fontWeight="800" fontSize="22">
        VSAT 2026 — ADMIT CARD
      </text>
      <rect x="44" y="120" width="120" height="150" rx="6" fill="#F4700B" stroke="#1B2A4A" />
      <circle cx="104" cy="180" r="26" fill="#FFF8F0" stroke="#1B2A4A" />
      <path d="M70 240 q34 -32 68 0" stroke="#1B2A4A" />
      <g stroke="#1B2A4A">
        <text x="190" y="140" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="600" fontSize="14" fill="#1B2A4A" stroke="none">Candidate</text>
        <text x="190" y="164" fontFamily="Syne, sans-serif" fontWeight="800" fontSize="20" fill="#1B2A4A" stroke="none">Aanya Sharma</text>
        <line x1="190" y1="186" x2="460" y2="186" strokeDasharray="4 4" />
        <text x="190" y="212" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="12" fill="#374151" stroke="none">Class · 10</text>
        <text x="190" y="232" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="12" fill="#374151" stroke="none">Roll · VP-25-00871</text>
        <text x="190" y="252" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="12" fill="#374151" stroke="none">Centre · Pune, Maharashtra</text>
      </g>
      <g transform="translate(360 230) rotate(-14)">
        <circle cx="40" cy="40" r="40" fill="none" stroke="#F4700B" strokeWidth="2.5" />
        <text x="40" y="38" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight="800" fontSize="11" fill="#F4700B" stroke="none">ELIGIBLE</text>
        <text x="40" y="54" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="9" fill="#F4700B" stroke="none">₹25L PRIZES</text>
      </g>
    </svg>
  );
}