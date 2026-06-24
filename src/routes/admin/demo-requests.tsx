import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Check, X as XIcon, MessageCircle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/demo-requests")({
  head: () => ({ meta: [{ title: "Demo Requests — Admin Portal" }] }),
  component: AdminDemoRequests,
});

function AdminDemoRequests() {
  const [demos, setDemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Confirm actions
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "delete" | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "demoRegistrations"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDemos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load demo requests");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const confirmApprove = (id: string) => {
    setSelectedId(id);
    setActionType("approve");
    setIsConfirmOpen(true);
  };

  const openRejectModal = (id: string) => {
    setSelectedId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleAction = async () => {
    if (!selectedId || !actionType) return;
    setIsActionLoading(true);
    try {
      if (actionType === "approve") {
        await updateDoc(doc(db, "demoRegistrations", selectedId), { status: "approved" });
        toast.success("Demo request approved");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setIsActionLoading(false);
      setIsConfirmOpen(false);
      setSelectedId(null);
      setActionType(null);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setIsActionLoading(true);
    try {
      await updateDoc(doc(db, "demoRegistrations", selectedId), { 
        status: "rejected", 
        rejectReason 
      });
      toast.success("Demo request rejected");
      setIsRejectModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject demo request");
    } finally {
      setIsActionLoading(false);
      setSelectedId(null);
    }
  };

  const handleContact = (phone: string) => {
    if (!phone) {
      toast.error("No phone number provided");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/91${cleanPhone}`, '_blank');
  };

  let filteredDemos = demos.filter(d => {
    const name = d.studentName || d.name || "";
    const email = d.email || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (statusFilter !== "all") {
    filteredDemos = filteredDemos.filter(d => (d.status || "pending") === statusFilter);
  }

  const columns = [
    { key: "name", label: "Student Details", render: (row: any) => (
      <div>
        <p className="font-semibold text-navy">{row.studentName || row.name || "Unknown"}</p>
        <p className="text-xs text-gray-500">{row.email || "No email"}</p>
      </div>
    )},
    { key: "phone", label: "Parent Phone", render: (row: any) => row.phone || row.parentPhone || "N/A" },
    { key: "classLevel", label: "Class", render: (row: any) => `Class ${row.classLevel || row.class || "Unknown"}` },
    { key: "status", label: "Status", render: (row: any) => {
      const status = row.status || "pending";
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
          status === 'approved' ? 'bg-green-100 text-green-700' : 
          status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {status}
        </span>
      );
    }},
    { key: "createdAt", label: "Date", render: (row: any) => (
      <span className="text-gray-500 text-xs">
        {row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : 'Unknown'}
      </span>
    )},
    { key: "actions", label: "Actions", render: (row: any) => (
      <div className="flex items-center gap-2">
        {(row.status === "pending" || !row.status) && (
          <>
            <button onClick={() => confirmApprove(row.id)} title="Approve" className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"><Check size={16} /></button>
            <button onClick={() => openRejectModal(row.id)} title="Reject" className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><XIcon size={16} /></button>
          </>
        )}
        <button onClick={() => handleContact(row.phone || row.parentPhone)} title="WhatsApp" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><MessageCircle size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy font-display">Demo Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve free demo class requests.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="flex-1"></div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-saffron bg-white shadow-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredDemos} 
        loading={loading}
        searchPlaceholder="Search by student name or email..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title={actionType === "approve" ? "Approve Demo Request" : "Confirm Action"}
        description={actionType === "approve" ? "This will mark the demo request as approved." : "Are you sure?"}
        confirmText={actionType === "approve" ? "Approve" : "Confirm"}
        isDestructive={false}
        isLoading={isActionLoading}
        onConfirm={handleAction}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsRejectModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy font-display">Reject Request</h2>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form id="rejectForm" onSubmit={handleReject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-navy">Reason for Rejection</label>
                  <textarea 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                    rows={3} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm resize-y" 
                    placeholder="Provide a reason..." 
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="rejectForm" disabled={isActionLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-70">
                {isActionLoading && <Loader2 size={16} className="animate-spin" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
