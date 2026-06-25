import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdminAnalytics, DateRange } from "@/hooks/use-admin-analytics";
import { Users, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const { data, loading, error } = useAdminAnalytics(dateRange);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-navy font-display">Reports & Analytics</h1>
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <Filter size={16} className="text-gray-400 ml-2" />
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="bg-transparent border-none text-sm font-medium text-navy focus:ring-0 cursor-pointer outline-none py-1.5 pr-8 pl-2"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          Failed to load analytics: {error}
        </div>
      )}

      {/* Funnel */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-bold text-navy mb-6 font-display">Acquisition Funnel</h2>
        {loading ? (
          <div className="h-24 animate-pulse bg-gray-100 rounded-xl" />
        ) : (
          <div className="flex items-center justify-between min-w-[600px]">
            <FunnelStep title="Demo Bookings" value={data?.funnel.demos} color="bg-blue-50 text-blue-600" />
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <FunnelStep title="Enrollments" value={data?.funnel.enrollments} color="bg-indigo-50 text-indigo-600" />
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <FunnelStep title="Active Students" value={data?.funnel.activeStudents} color="bg-purple-50 text-purple-600" />
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <FunnelStep title="Completed Courses" value={data?.funnel.completedCourses} color="bg-green-50 text-green-600" />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. User Registrations */}
        <ChartCard title="User Registrations" loading={loading} data={data?.charts.userRegistrations}>
          <AreaChart data={data?.charts.userRegistrations || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dx={-10} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#EFF6FF" strokeWidth={3} />
          </AreaChart>
        </ChartCard>

        {/* 2. Enrollment Trend */}
        <ChartCard title="Enrollment Trend" loading={loading} data={data?.charts.enrollmentTrend}>
          <LineChart data={data?.charts.enrollmentTrend || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dx={-10} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} />
          </LineChart>
        </ChartCard>

        {/* 3. Demo Booking Trend */}
        <ChartCard title="Demo Booking Trend" loading={loading} data={data?.charts.demoBookingTrend}>
          <LineChart data={data?.charts.demoBookingTrend || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dx={-10} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Line type="monotone" dataKey="value" stroke="#F43F5E" strokeWidth={3} dot={{ r: 4, fill: '#F43F5E' }} />
          </LineChart>
        </ChartCard>

        {/* 4. VSAT Registrations Trend */}
        <ChartCard title="VSAT Registrations Trend" loading={loading} data={data?.charts.vsatTrend}>
          <LineChart data={data?.charts.vsatTrend || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dx={-10} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6' }} />
          </LineChart>
        </ChartCard>

        {/* 5. Course Popularity */}
        <ChartCard title="Course Popularity (Enrollments)" loading={loading} data={data?.charts.coursePopularity}>
          <BarChart data={data?.charts.coursePopularity || []} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} width={100} />
            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="enrollments" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ChartCard>

        {/* 6. Course Completion */}
        <ChartCard title="Course Completion (%)" loading={loading} data={data?.charts.courseCompletion}>
          <BarChart data={data?.charts.courseCompletion || []} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} width={100} />
            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="completion" fill="#14B8A6" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ChartCard>

        {/* 7. Student Activity Volume */}
        <ChartCard title="Student Activity Volume" loading={loading} data={data?.charts.studentActivity}>
          <BarChart data={data?.charts.studentActivity || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dx={-10} />
            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        {/* 8. Blog Publishing Trend */}
        <ChartCard title="Blog Publishing Trend" loading={loading} data={data?.charts.blogTrend}>
          <BarChart data={data?.charts.blogTrend || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dx={-10} />
            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="value" fill="#EC4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

    </div>
  );
}

function FunnelStep({ title, value, color }: { title: string, value?: number, color: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ${color}`}>
        <Users size={24} />
      </div>
      <p className="text-2xl font-bold text-navy">{value !== undefined ? value.toLocaleString() : '-'}</p>
      <p className="text-sm font-medium text-gray-500 text-center">{title}</p>
    </div>
  );
}

function ChartCard({ title, loading, data, children }: { title: string, loading: boolean, data?: any[], children: React.ReactElement }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-navy mb-4 font-display">{title}</h2>
      <div className="h-[300px] w-full">
        {loading ? (
          <div className="w-full h-full bg-gray-50 animate-pulse rounded-xl" />
        ) : !data || data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No data for selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
