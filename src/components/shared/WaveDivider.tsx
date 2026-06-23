type Props = {
  fill?: string;
  flip?: boolean;
  className?: string;
};

export function WaveDivider({ fill = "#FFF8F0", flip = false, className = "" }: Props) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={`relative block w-[calc(100%+1.3px)] h-[40px] md:h-[60px] lg:h-[90px] ${flip ? "scale-x-[-1]" : ""}`}
      >
        <path
          d="M0,80 C320,120 420,0 840,40 C1160,70 1300,20 1440,60 L1440,120 L0,120 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}