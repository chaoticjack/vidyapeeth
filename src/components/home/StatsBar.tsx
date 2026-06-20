import { Users, GraduationCap, BookOpenCheck, Trophy } from "lucide-react";
import { CounterAnimation } from "@/components/shared/CounterAnimation";
import { stats } from "@/data/home";

const iconMap = { Users, GraduationCap, BookOpenCheck, Trophy } as const;

export function StatsBar() {
  return (
    <section className="relative bg-navy text-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 py-14 md:grid-cols-4 md:gap-x-6 md:py-16">
        {stats.map((s, i) => {
          const Icon = iconMap[s.icon as keyof typeof iconMap];
          return (
            <div
              key={s.label}
              className={`relative flex flex-col gap-3 ${
                i % 2 === 0 ? "md:pr-6" : ""
              } ${i < 3 ? "md:border-r md:border-cream/15" : ""}`}
            >
              <Icon size={22} className="text-saffron" />
              <div className="font-display text-4xl font-black leading-none tracking-tight md:text-5xl">
                <CounterAnimation value={s.value} suffix={s.suffix} />
              </div>
              <p className="text-sm text-cream/70">{s.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}