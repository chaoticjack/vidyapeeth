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
import { collection, getCountFromServer, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StatsCard } from "@/components/admin/StatsCard";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Vidyapeeth" }] }),
  component: AdminDashboard,
});

const mockGrowthData = [
  { name: "Jan", students: 400 },
  { name: "Feb", students: 600 },
  { name: "Mar", students: 1100 },
  { name: "Apr", students: 1400 },
  { name: "May", students: 2200 },
  { name: "Jun", students: 3400 },
];

const mockCourseData = [
  { name: "Math 10", enrollments: 850 },
  { name: "Sci 10", enrollments: 720 },
  { name: "Math 9", enrollments: 650 },
  { name: "Eng 10", enrollments: 400 },
];

function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    teachers: 0,
    demoRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentDemos, setRecentDemos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch aggregates
        const studentsSnap = await getCountFromServer(collection(db, "users"));
        const approvedDemosSnap = await getCountFromServer(query(collection(db, "demoRegistrations"), where("status", "==", "approved")));
        const coursesSnap = await getCountFromServer(collection(db, "courses"));
        const teachersSnap = await getCountFromServer(collection(db, "teachers"));
        const demosSnap = await getCountFromServer(query(collection(db, "demoRegistrations"), where("status", "==", "pending")));

        setStats({
          students: studentsSnap.data().count + approvedDemosSnap.data().count,
          courses: coursesSnap.data().count,
          teachers: teachersSnap.data().count,
          demoRequests: demosSnap.data().count,
        });

        // Fetch recent demo requests
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
        <StatsCard loading={loading} icon={<Users />} title="Total Students" value={stats.students} trend={{ value: 12, isPositive: true }} />
        <StatsCard loading={loading} icon={<BookOpen />} title="Active Courses" value={stats.courses} trend={{ value: 3, isPositive: true }} />
        <StatsCard loading={loading} icon={<GraduationCap />} title="Total Teachers" value={stats.teachers} trend={{ value: 5, isPositive: true }} />
        <StatsCard loading={loading} icon={<CalendarCheck2 />} title="Pending Demos" value={stats.demoRequests} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-navy mb-4 font-display">Student Growth (2026)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="students" stroke="#1B2A4A" strokeWidth={3} dot={{ r: 4, fill: '#1B2A4A' }} activeDot={{ r: 6, fill: '#F4700B' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-1 rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-navy mb-4 font-display">Popular Courses</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCourseData} layout="vertical" margin={{ left: 10 }}>
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
            <ActivityItem icon={<BookOpen size={16} />} title="New Course Published" time="1 hour ago" desc="'Advanced Geometry' is now live." />
            <ActivityItem icon={<FileText size={16} />} title="Blog Post Created" time="3 hours ago" desc="Article 'Top Tips for Board Exams' drafted." />
            <ActivityItem icon={<Users size={16} />} title="Batch Enrollment" time="5 hours ago" desc="50 students enrolled in VSAT Prep." />
            <ActivityItem icon={<CalendarCheck2 size={16} />} title="Demo Class Completed" time="Yesterday" desc="Rahul's science demo marked as successful." />
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
