import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/courses")({
  head: () => ({ meta: [{ title: "Course Management — Admin" }] }),
  component: CoursesPage,
});

const mockCourses = [
  { id: "C-01", name: "Mathematics Foundation", class: "10", enrollments: 850, status: "Published" },
  { id: "C-02", name: "Science Explorer", class: "9", enrollments: 650, status: "Published" },
  { id: "C-03", name: "Advanced Physics", class: "10", enrollments: 0, status: "Draft" },
];

function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-navy font-display">Course Management</h1>
        <button className="flex items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-saffron">
          <Plus size={16} /> Create Course
        </button>
      </div>
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Course Name</th>
              <th className="px-6 py-3 font-medium">Class Target</th>
              <th className="px-6 py-3 font-medium">Enrollments</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockCourses.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 font-semibold text-navy">{c.name}</td>
                <td className="px-6 py-4">Class {c.class}</td>
                <td className="px-6 py-4">{c.enrollments}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${c.status === "Published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
