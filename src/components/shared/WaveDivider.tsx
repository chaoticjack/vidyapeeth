type Props = {
  fill?: string;
  flip?: boolean;
  className?: string;
};

export function WaveDivider({ fill = "#FFF8F0", flip = false, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block w-full ${flip ? "rotate-180" : ""} ${className}`}
      style={{ height: 80 }}
    >
      <path
        d="M0,40 C220,90 380,0 720,30 C1060,60 1240,10 1440,50 L1440,80 L0,80 Z"
        fill={fill}
      />
    </svg>
  );
}