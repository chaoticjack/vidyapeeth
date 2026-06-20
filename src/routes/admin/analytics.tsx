import { createFileRoute } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: AnalyticsPage,
});

const mockConversionData = [
  { name: "Jan", conversion: 20 },
  { name: "Feb", conversion: 25 },
  { name: "Mar", conversion: 40 },
  { name: "Apr", conversion: 65 },
  { name: "May", conversion: 75 },
];

const mockPieData = [
  { name: 'Class 10', value: 400 },
  { name: 'Class 9', value: 300 },
  { name: 'Class 8', value: 300 },
  { name: 'Class 7', value: 200 },
];
const COLORS = ['#1B2A4A', '#F4700B', '#FACC15', '#60A5FA'];

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-navy font-display">Reports & Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-navy mb-4 font-display">Demo Conversion Rate (%)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockConversionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="conversion" stroke="#F4700B" fill="#FFF3EB" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-navy mb-4 font-display">Enrollments by Class</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {mockPieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-sm text-gray-600">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
