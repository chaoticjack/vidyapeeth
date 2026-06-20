import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Student Management — Admin" }] }),
  component: StudentsPage,
});

const mockStudents = [
  { id: "STU-001", name: "Aanya Sharma", class: "Class 10", email: "aanya@example.com", phone: "+91 9876543210", progress: 85, status: "Active" },
  { id: "STU-002", name: "Rahul Verma", class: "Class 9", email: "rahul@example.com", phone: "+91 9876543211", progress: 60, status: "Active" },
  { id: "STU-003", name: "Priya Singh", class: "Class 10", email: "priya@example.com", phone: "+91 9876543212", progress: 30, status: "Inactive" },
  { id: "STU-004", name: "Kabir Das", class: "Class 8", email: "kabir@example.com", phone: "+91 9876543213", progress: 95, status: "Active" },
  { id: "STU-005", name: "Ananya Patel", class: "Class 7", email: "ananya@example.com", phone: "+91 9876543214", progress: 45, status: "Pending" },
];

function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-navy font-display">Student Management</h1>
        <button className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-saffron transition-colors shadow-sm w-fit">
          Add New Student
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or ID..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all bg-white"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-navy hover:bg-gray-50 transition-colors w-full sm:w-auto">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Class</th>
                <th className="px-6 py-4 font-semibold">Contact Details</th>
                <th className="px-6 py-4 font-semibold">Learning Progress</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockStudents.map((student) => (
                <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-navy">{student.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{student.id}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{student.class}</td>
                  <td className="px-6 py-4">
                    <div className="text-navy">{student.email}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-saffron rounded-full" 
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-navy">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      student.status === "Active" ? "bg-green-100 text-green-700" : 
                      student.status === "Pending" ? "bg-yellow-100 text-yellow-700" : 
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"><Eye size={18} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-navy transition-colors rounded-md hover:bg-gray-100"><Edit size={18} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div>Showing 1 to 5 of 3,400 entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 rounded border border-navy bg-navy text-white">1</button>
            <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">2</button>
            <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">3</button>
            <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
