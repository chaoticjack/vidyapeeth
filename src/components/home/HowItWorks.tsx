import { ArrowRight } from "lucide-react";
import { howSteps } from "@/data/home";
import { Step1, Step2, Step3 } from "@/components/illustrations/HowSteps";

const icons = [Step1, Step2, Step3];

const cardStyles = [
  {
    bg: "bg-card border-navy/10 shadow-sm",
    hover: "hover:-translate-y-2 hover:border-saffron/50 hover:shadow-xl hover:shadow-saffron/10",
    badge: "border-navy/15 bg-cream text-navy",
    title: "text-navy group-hover:text-saffron",
    body: "text-ink/80",
  },
  {
    bg: "bg-navy border-transparent shadow-md",
    hover: "hover:-translate-y-2 hover:bg-[#0F1B33] hover:shadow-xl hover:shadow-navy/20",
    badge: "border-white/20 bg-[#0F1B33] text-cream",
    title: "text-cream group-hover:text-[#FFB266]",
    body: "text-cream/80",
  },
  {
    bg: "bg-saffron/10 border-saffron/20 shadow-sm",
    hover: "hover:-translate-y-2 hover:border-saffron/50 hover:bg-saffron/15 hover:shadow-xl hover:shadow-saffron/10",
    badge: "border-saffron/30 bg-white text-[#B85608]",
    title: "text-navy group-hover:text-[#B85608]",
    body: "text-ink/80",
  }
];

export function HowItWorks() {
  return (
    <section className="relative bg-cream py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
            How Vidyapeeth works
          </span>
          <h2 className="mt-3 font-display text-4xl font-black leading-[1.05] text-navy md:text-6xl">
            Three honest steps.
          </h2>
        </div>

        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-6">
          {howSteps.map((s, i) => {
            const Ill = icons[i];
            const style = cardStyles[i];
            
            return (
              <div key={s.n} className="flex flex-col md:flex-row items-center w-full md:w-auto">
                {/* Card */}
                <article
                  className={`group relative flex flex-col items-center text-center p-8 lg:p-10 rounded-3xl border transition-all duration-500 w-full max-w-sm md:w-[300px] lg:w-[340px] h-[380px] ${style.bg} ${style.hover}`}
                >
                  <div className="mx-auto h-24 w-24 sm:h-28 sm:w-28 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    <Ill />
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-[10px] font-bold tracking-[0.18em] shadow-sm ${style.badge}`}>
                    STEP {s.n}
                  </div>
                  <h3 className={`mt-5 font-display text-2xl font-black transition-colors duration-300 ${style.title}`}>
                    {s.title}
                  </h3>
                  <p className={`mx-auto mt-3 max-w-[280px] text-sm leading-relaxed ${style.body}`}>
                    {s.body}
                  </p>
                </article>

                {/* Desktop Arrow */}
                {i < howSteps.length - 1 && (
                  <div className="hidden md:flex mx-2 lg:mx-4 xl:mx-8 text-navy/20 transition-all duration-300 hover:text-saffron">
                    <ArrowRight size={40} strokeWidth={1.5} className="transition-transform duration-500 hover:translate-x-3 hover:scale-110" />
                  </div>
                )}
                
                {/* Mobile Arrow */}
                {i < howSteps.length - 1 && (
                  <div className="md:hidden my-6 text-navy/20 transition-colors hover:text-saffron">
                    <ArrowRight size={32} strokeWidth={1.5} className="rotate-90 transition-transform duration-500 hover:translate-y-2 hover:scale-110" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}