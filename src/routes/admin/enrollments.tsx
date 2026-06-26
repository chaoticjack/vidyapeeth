import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { subscribeToEnrollments, Enrollment, fetchPublishedCourses } from "@/lib/firestore";
import { AdminTable } from "@/components/admin/AdminTable";
import { Eye, X } from "lucide-react";

export const Route = createFileRoute("/admin/enrollments")({
  head: () => ({ meta: [{ title: "Enrollments — Admin Portal" }] }),
  component: AdminEnrollments,
});

function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseMap, setCourseMap] = useState<Record<string, string>>({});
  
  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToEnrollments((data) => {
      setEnrollments(data);
      setLoading(false);
    });

    async function loadCourses() {
      const courses = await fetchPublishedCourses();
      const map: Record<string, string> = {};
      courses.forEach(c => {
        map[c.id] = c.name;
        if (c.slug) map[c.slug] = c.name;
      });
      setCourseMap(map);
    }
    loadCourses();

    return () => unsubscribe();
  }, []);

  const openViewModal = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsViewModalOpen(true);
  };

  const filteredEnrollments = enrollments.filter(e => 
    e.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.courseId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "studentName", label: "Student Name", render: (row: Enrollment) => (
      <div>
        <p className="font-semibold text-navy">{row.studentName || "Unknown"}</p>
        <p className="text-xs text-gray-500">Class {row.classLevel || "N/A"}</p>
      </div>
    )},
    { key: "courseId", label: "Course", render: (row: Enrollment) => {
      const title = courseMap[row.courseId];
      return title || row.courseId;
    }},
    { key: "batchTiming", label: "Batch", render: (row: Enrollment) => (
      <span className="capitalize">{row.batchTiming}</span>
    )},
    { key: "status", label: "Status", render: (row: Enrollment) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        row.status === 'active' ? 'bg-green-100 text-green-700' :
        row.status === 'completed' ? 'bg-blue-100 text-blue-700' :
        'bg-red-100 text-red-700'
      }`}>
        {row.status}
      </span>
    )},
    { key: "enrolledAt", label: "Date", render: (row: Enrollment) => (
      <span className="text-gray-500 text-xs">
        {row.enrolledAt?.toDate ? row.enrolledAt.toDate().toLocaleDateString() : 'Unknown'}
      </span>
    )},
    { key: "actions", label: "Actions", render: (row: Enrollment) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openViewModal(row)} className="p-1.5 text-navy hover:bg-navy/5 rounded-md transition-colors"><Eye size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy font-display">Enrollments</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all student course enrollments.</p>
        </div>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredEnrollments} 
        loading={loading}
        searchPlaceholder="Search by student name or course..."
        onSearch={setSearchTerm}
      />

      {/* View Details Modal */}
      {isViewModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy font-display">Enrollment Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-saffron text-white flex items-center justify-center text-2xl font-bold">
                  {selectedEnrollment.studentName?.substring(0,2).toUpperCase() || "ST"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy">{selectedEnrollment.studentName || "No Name"}</h3>
                  <p className="text-sm text-gray-500">Class {selectedEnrollment.classLevel || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Course</p>
                  <p className="text-sm font-medium text-navy">{courseMap[selectedEnrollment.courseId] || selectedEnrollment.courseId}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Batch Timing</p>
                  <p className="text-sm font-medium text-navy capitalize">{selectedEnrollment.batchTiming}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm font-medium text-navy capitalize">{selectedEnrollment.status}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Payment ID</p>
                  <p className="text-sm font-medium text-navy">{selectedEnrollment.paymentId || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date Enrolled</p>
                  <p className="text-sm font-medium text-navy">
                    {selectedEnrollment.enrolledAt?.toDate ? selectedEnrollment.enrolledAt.toDate().toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                {selectedEnrollment.notes && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Additional Notes</p>
                    <p className="text-sm font-medium text-navy">{selectedEnrollment.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button onClick={() => setIsViewModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
