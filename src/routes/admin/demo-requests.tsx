import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/demo-requests")({
  head: () => ({ meta: [{ title: "Demo Requests — Admin" }] }),
  component: DemoRequestsPage,
});

const mockRequests = [
  { id: "REQ-01", student: "Aanya Sharma", parent: "+91 9876543210", class: "10", date: "June 18, 2026", status: "Pending" },
  { id: "REQ-02", student: "Rohan Das", parent: "+91 9998887776", class: "8", date: "June 17, 2026", status: "Approved" },
];

function DemoRequestsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-navy font-display">Demo Class Requests</h1>
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Student Name</th>
              <th className="px-6 py-3 font-medium">Parent Contact</th>
              <th className="px-6 py-3 font-medium">Class</th>
              <th className="px-6 py-3 font-medium">Date Requested</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockRequests.map(req => (
              <tr key={req.id}>
                <td className="px-6 py-4 font-semibold text-navy">{req.student}</td>
                <td className="px-6 py-4">{req.parent}</td>
                <td className="px-6 py-4">{req.class}</td>
                <td className="px-6 py-4">{req.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${req.status === "Approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 text-navy" title="Contact"><MessageSquare size={16} /></button>
                  <button className="p-1.5 bg-green-50 rounded-md hover:bg-green-100 text-green-600" title="Approve"><CheckCircle2 size={16} /></button>
                  <button className="p-1.5 bg-red-50 rounded-md hover:bg-red-100 text-red-600" title="Reject"><XCircle size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
