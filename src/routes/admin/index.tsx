import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CalendarCheck2, 
  TrendingUp, 
  FileText 
} from "lucide-react";
import {
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
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StatsCard } from "@/components/admin/StatsCard";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Vidyapeeth" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: analytics, loading: analyticsLoading } = useAdminAnalytics('year');
  const [recentDemos, setRecentDemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const demosQuery = query(collection(db, "demoRegistrations"), orderBy("createdAt", "desc"), limit(5));
        const demosList = await getDocs(demosQuery);
        setRecentDemos(demosList.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const isLoading = loading || analyticsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-navy font-display">Overview Dashboard</h1>
        <button className="rounded-md bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-navy hover:bg-gray-50 flex items-center gap-2 shadow-sm">
          <TrendingUp size={16} /> Download Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard loading={isLoading} icon={<Users />} title="Total Students" value={analytics?.kpis.totalUsers.value || 0} trend={{ value: Math.abs(analytics?.kpis.totalUsers.growth || 0), isPositive: (analytics?.kpis.totalUsers.growth || 0) >= 0 }} />
        <StatsCard loading={isLoading} icon={<BookOpen />} title="Active Courses" value={analytics?.kpis.coursesPublished.value || 0} trend={{ value: Math.abs(analytics?.kpis.coursesPublished.growth || 0), isPositive: (analytics?.kpis.coursesPublished.growth || 0) >= 0 }} />
        <StatsCard loading={isLoading} icon={<GraduationCap />} title="Active Enrollments" value={analytics?.kpis.totalEnrollments.value || 0} trend={{ value: Math.abs(analytics?.kpis.totalEnrollments.growth || 0), isPositive: (analytics?.kpis.totalEnrollments.growth || 0) >= 0 }} />
        <StatsCard loading={isLoading} icon={<CalendarCheck2 />} title="Pending Demos" value={analytics?.kpis.pendingDemoRequests.value || 0} trend={{ value: Math.abs(analytics?.kpis.pendingDemoRequests.growth || 0), isPositive: (analytics?.kpis.pendingDemoRequests.growth || 0) >= 0 }} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-navy mb-4 font-display">Student Growth (2026)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.charts.userRegistrations || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="value" stroke="#1B2A4A" strokeWidth={3} dot={{ r: 4, fill: '#1B2A4A' }} activeDot={{ r: 6, fill: '#F4700B' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-1 rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-navy mb-4 font-display">Popular Courses</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topCourses.slice(0, 4) || []} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="enrollments" fill="#F4700B" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-navy font-display">Recent Demos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Class</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentDemos.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      {loading ? "Loading..." : "No recent demos"}
                    </td>
                  </tr>
                )}
                {recentDemos.map((demo) => (
                  <tr key={demo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-navy">{demo.studentName || demo.name || "Unknown"}</td>
                    <td className="px-6 py-4 text-gray-600">{demo.classLevel || demo.class}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${
                        demo.status === "approved" ? "bg-green-100 text-green-700" : 
                        demo.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {demo.status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-navy font-display">System Activity</h2>
          </div>
          <div className="space-y-5">
            {isLoading ? (
              <p className="text-gray-500 text-sm">Loading activity...</p>
            ) : !analytics?.recentActivity || analytics.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity.</p>
            ) : (
              analytics?.recentActivity.slice(0, 5).map((act, idx) => (
                <ActivityItem 
                  key={act.id || idx}
                  icon={
                    act.type === 'enrollment' ? <Users size={16} /> :
                    act.type === 'course_completed' ? <GraduationCap size={16} /> :
                    act.type === 'demo_booked' ? <CalendarCheck2 size={16} /> :
                    <FileText size={16} />
                  } 
                  title={act.title || "System Activity"} 
                  time={act.time || (act.timestamp?.toDate ? act.timestamp.toDate().toLocaleDateString() : 'Recently')} 
                  desc={act.description || act.text || "An event occurred."} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, time, desc }: any) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-navy">{title}</p>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
