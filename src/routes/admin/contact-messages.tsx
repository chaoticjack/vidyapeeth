import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Eye, Archive, CheckCircle2, X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/contact-messages")({
  head: () => ({ meta: [{ title: "Contact Messages — Admin Portal" }] }),
  component: AdminContactMessages,
});

function AdminContactMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  
  // Reply State
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load contact messages");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openViewModal = (msg: any) => {
    setSelectedMsg(msg);
    setReplyText("");
    setIsViewModalOpen(true);
  };

  const updateStatus = async (id: string, status: "replied" | "archived") => {
    try {
      await updateDoc(doc(db, "contactMessages", id), { status });
      toast.success(`Message marked as ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg || !replyText) return;
    
    setIsReplying(true);
    try {
      // In a real app, you would send this to a Cloud Function to dispatch the email.
      // For now, we will just save the reply and update the status.
      await updateDoc(doc(db, "contactMessages", selectedMsg.id), {
        status: "replied",
        reply: replyText,
        repliedAt: new Date().toISOString()
      });
      toast.success("Reply recorded successfully");
      setIsViewModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to record reply");
    } finally {
      setIsReplying(false);
    }
  };

  let filteredMessages = messages.filter(m => {
    const name = m.name || "";
    const email = m.email || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (statusFilter !== "all") {
    filteredMessages = filteredMessages.filter(m => (m.status || "new") === statusFilter);
  }

  const columns = [
    { key: "name", label: "From", render: (row: any) => (
      <div>
        <p className="font-semibold text-navy">{row.name}</p>
        <p className="text-xs text-gray-500">{row.email}</p>
      </div>
    )},
    { key: "subject", label: "Subject", render: (row: any) => (
      <span className="truncate max-w-[200px] inline-block font-medium">{row.subject || "No Subject"}</span>
    )},
    { key: "createdAt", label: "Date", render: (row: any) => (
      <span className="text-gray-500 text-xs">
        {row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : 'Unknown'}
      </span>
    )},
    { key: "status", label: "Status", render: (row: any) => {
      const status = row.status || "new";
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
          status === 'replied' ? 'bg-green-100 text-green-700' : 
          status === 'archived' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    }},
    { key: "actions", label: "Actions", render: (row: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openViewModal(row)} title="View & Reply" className="p-1.5 text-navy hover:bg-navy/5 rounded-md transition-colors"><Eye size={16} /></button>
        {row.status !== "replied" && (
          <button onClick={() => updateStatus(row.id, "replied")} title="Mark as Replied" className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"><CheckCircle2 size={16} /></button>
        )}
        {row.status !== "archived" && (
          <button onClick={() => updateStatus(row.id, "archived")} title="Archive" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"><Archive size={16} /></button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy font-display">Contact Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage inquiries from the contact page.</p>
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
          <option value="new">New</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredMessages} 
        loading={loading}
        searchPlaceholder="Search by name or email..."
        onSearch={setSearchTerm}
      />

      {isViewModalOpen && selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy font-display">Message Details</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">From</p>
                  <p className="text-sm font-bold text-navy mt-1">{selectedMsg.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                  <p className="text-sm font-medium text-navy mt-1">{selectedMsg.email}</p>
                </div>
                {selectedMsg.phone && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                    <p className="text-sm font-medium text-navy mt-1">{selectedMsg.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Subject</p>
                  <p className="text-sm font-medium text-navy mt-1">{selectedMsg.subject || "General Inquiry"}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Message</p>
                <p className="text-sm text-navy whitespace-pre-wrap">{selectedMsg.message}</p>
              </div>

              {selectedMsg.reply && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Your Reply (Recorded on {new Date(selectedMsg.repliedAt).toLocaleDateString()})</p>
                  <p className="text-sm text-navy whitespace-pre-wrap">{selectedMsg.reply}</p>
                </div>
              )}

              {(!selectedMsg.status || selectedMsg.status === "new") && (
                <form id="replyForm" onSubmit={handleReply} className="space-y-3 pt-4 border-t border-gray-100">
                  <label className="text-sm font-semibold text-navy flex items-center gap-2">
                    <Send size={16} className="text-saffron" /> Write a Reply
                  </label>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    rows={4} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm resize-y" 
                    placeholder="Draft your reply to the user..." 
                  />
                  <p className="text-xs text-gray-500">Note: Sending a reply will record the message and mark the inquiry as 'Replied'.</p>
                </form>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Close
              </button>
              {(!selectedMsg.status || selectedMsg.status === "new") && (
                <button type="submit" form="replyForm" disabled={isReplying} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
                  {isReplying && <Loader2 size={16} className="animate-spin" />}
                  Send Reply
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
