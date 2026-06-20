import { Quote } from "lucide-react";
import { testimonials } from "@/data/home";
import { useMemo } from "react";

export function TestimonialsGrid() {
  // Split testimonials into 3 columns
  const col1 = useMemo(() => testimonials.filter((_, i) => i % 3 === 0), []);
  const col2 = useMemo(() => testimonials.filter((_, i) => i % 3 === 1), []);
  const col3 = useMemo(() => testimonials.filter((_, i) => i % 3 === 2), []);

  return (
    <section className="grain relative bg-cream py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Header */}
          <div className="lg:col-span-5 max-w-xl">
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
              Stories, not slogans
            </span>
            <h2 className="mt-3 font-display text-4xl font-black leading-[1.05] text-navy md:text-5xl lg:text-6xl">
              What students{" "}
              <span className="italic font-light text-navy/65">
                actually say.
              </span>
            </h2>
            <p className="mt-6 text-lg text-ink">
              We don't pay for testimonials. We don't airbrush them either. These
              are real notes from the people we teach. See why thousands of students trust Vidyapeeth.
            </p>
          </div>

          {/* Right Side: Animated Wall */}
          <div 
            className="lg:col-span-7 h-[380px] sm:h-[420px] relative flex gap-4 sm:gap-5 group/wall overflow-hidden"
            style={{ maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)" }}
          >
            {/* Column 1 (Scroll Up) */}
            <MarqueeColumn items={col1} direction="up" speed="45s" />
            
            {/* Column 2 (Scroll Down) */}
            <MarqueeColumn items={col2} direction="down" speed="55s" className="hidden sm:flex mt-8" />
            
            {/* Column 3 (Scroll Up) */}
            <MarqueeColumn items={col3} direction="up" speed="50s" className="hidden md:flex mt-16" />
            
          </div>
        </div>
      </div>
      
      <style>{`
        .marquee-col {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-w: 0;
        }
        
        /* The container animating */
        .animate-marquee-up {
          animation: marquee-up var(--duration) linear infinite;
        }
        .animate-marquee-down {
          animation: marquee-down var(--duration) linear infinite;
        }
        
        /* Gap is 1rem (16px). Math: -50% - 0.5rem perfectly loops uneven heights */
        @keyframes marquee-up {
          from { transform: translateY(0); }
          to { transform: translateY(calc(-50% - 0.5rem)); }
        }
        @keyframes marquee-down {
          from { transform: translateY(calc(-50% - 0.5rem)); }
          to { transform: translateY(0); }
        }
        
        /* Pause only the hovered column */
        .marquee-col:hover .animate-marquee-up,
        .marquee-col:hover .animate-marquee-down {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

function MarqueeColumn({ items, direction, speed, className = "" }: { items: typeof testimonials, direction: "up" | "down", speed: string, className?: string }) {
  // Duplicate items to ensure continuous scrolling
  const doubleItems = [...items, ...items];
  
  return (
    <div className={`marquee-col ${className}`}>
      <div 
        className={`flex flex-col gap-4 ${direction === 'up' ? 'animate-marquee-up' : 'animate-marquee-down'}`}
        style={{ '--duration': speed } as React.CSSProperties}
      >
        {doubleItems.map((t, i) => (
          <article 
            key={`${t.name}-${i}`} 
            className="flex flex-col justify-between rounded-2xl border border-navy/10 bg-card p-5 shadow-sm transition-all hover:border-navy/30 hover:shadow-md shrink-0 cursor-default"
          >
            <Quote size={18} className="text-saffron/40 mb-3" />
            <p className="text-sm sm:text-base leading-snug text-navy">"{t.quote}"</p>
            <div className="mt-4 border-t border-navy/10 pt-3 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-saffron/10 font-display text-xs font-black text-saffron">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="font-display text-xs font-bold text-navy">
                  {t.name}
                </p>
                <p className="text-[10px] text-ink/75">{t.classLevel}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}