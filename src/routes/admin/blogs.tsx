import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/blogs")({
  head: () => ({ meta: [{ title: "Blog Management — Admin" }] }),
  component: BlogsPage,
});

const mockBlogs = [
  { id: "B-01", title: "How to Ace Your Board Exams in 2026", views: 1250, status: "Published" },
  { id: "B-02", title: "Understanding the New Education Policy", views: 0, status: "Draft" },
];

function BlogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-navy font-display">Blog Management</h1>
        <button className="flex items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-saffron">
          <Plus size={16} /> Create Post
        </button>
      </div>
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Post Title</th>
              <th className="px-6 py-3 font-medium">Views</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockBlogs.map(b => (
              <tr key={b.id}>
                <td className="px-6 py-4 font-semibold text-navy">{b.title}</td>
                <td className="px-6 py-4">{b.views}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${b.status === "Published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {b.status}
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
