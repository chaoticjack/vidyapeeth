import { Award } from "lucide-react";

const achievements = [
  { name: "Devansh P.", class: "9", achievement: "Sainik School Selected", category: "Entrance Exam", year: "2025" },
  { name: "Sara K.", class: "8", achievement: "Olympiad Gold Medal", category: "Competition", year: "2025" },
  { name: "Ananya G.", class: "10", achievement: "NTSE Stage 2 Cleared", category: "Scholarship", year: "2025" },
  { name: "Rohan M.", class: "10", achievement: "98% in CBSE Boards", category: "Board Exams", year: "2025" },
  { name: "Neha S.", class: "7", achievement: "State Level Debater", category: "Extracurricular", year: "2025" },
  { name: "Arjun V.", class: "6", achievement: "IMO State Rank 1", category: "Competition", year: "2025" },
];

function AchievementCard({ data }: { data: typeof achievements[0] }) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_8px_24px_-12px_rgba(27,42,74,0.12)] border border-navy/5 mx-3 transition-transform hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-cream font-bold text-lg shadow-inner">
          {data.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-navy text-base">{data.name}</h4>
          <p className="text-xs font-semibold text-gray-500">Class {data.class} • {data.year}</p>
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between rounded-lg bg-[#F4700B]/5 p-3 border border-[#F4700B]/10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-saffron">{data.category}</p>
          <p className="text-sm font-bold text-navy mt-0.5 leading-snug line-clamp-1" title={data.achievement}>{data.achievement}</p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-saffron">
          <Award size={16} />
        </div>
      </div>
    </div>
  );
}

export function SuccessMarquee() {
  // To make a seamless loop with translateX(-50%), we need exactly 2 copies
  const doubled = [...achievements, ...achievements];

  return (
    <section className="relative border-y border-navy/10 bg-cream py-16 overflow-hidden">
      <div className="mb-10 text-center px-4">
        <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
          Recent wins · 2025 batch
        </span>
        <h2 className="mt-2 font-display text-3xl font-black text-navy md:text-4xl">
          Student Achievements
        </h2>
      </div>
      
      {/* 
        We use group on the wrapper so that hovering anywhere on the carousel 
        pauses the animation for both duplicated lists.
      */}
      <div className="group relative flex overflow-hidden w-full">
        <div className="flex w-max marquee-left group-hover:[animation-play-state:paused] py-4">
          {doubled.map((item, i) => (
            <AchievementCard key={`achv-1-${i}`} data={item} />
          ))}
        </div>
      </div>
      
      {/* Soft gradient masks on edges for fade effect */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-cream to-transparent md:w-32 z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-cream to-transparent md:w-32 z-10" />
    </section>
  );
}