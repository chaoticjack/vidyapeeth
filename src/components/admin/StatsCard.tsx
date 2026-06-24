import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
}

export function StatsCard({ title, value, icon, trend, loading }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink/70">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-4">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
        ) : (
          <h3 className="font-display text-3xl font-black text-navy">{value}</h3>
        )}
        
        {trend && !loading && (
          <span className={`inline-flex items-center gap-1 text-sm font-semibold ${trend.isPositive ? "text-emerald-600" : "text-rose-600"}`}>
            {trend.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
