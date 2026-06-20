import { createFileRoute } from "@tanstack/react-router";
import { Search, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/teachers")({
  head: () => ({ meta: [{ title: "Teacher Management — Admin" }] }),
  component: TeachersPage,
});

const mockTeachers = [
  { id: "T-001", name: "Anil Kumar", subject: "Mathematics", experience: "8 Years", rating: 4.8 },
  { id: "T-002", name: "Sunita Roy", subject: "Science", experience: "5 Years", rating: 4.6 },
];

function TeachersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-navy font-display">Teacher Management</h1>
        <button className="flex items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-saffron">
          <Plus size={16} /> Add Teacher
        </button>
      </div>
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Experience</th>
              <th className="px-6 py-3 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockTeachers.map(t => (
              <tr key={t.id}>
                <td className="px-6 py-4 font-semibold text-navy">{t.name}</td>
                <td className="px-6 py-4">{t.subject}</td>
                <td className="px-6 py-4">{t.experience}</td>
                <td className="px-6 py-4 text-green-600 font-semibold">{t.rating} / 5.0</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
