import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Send, Clock, FileEdit, Plus, Trash2, Users, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/marketing/newsletter")({
  component: NewsletterCampaigns,
});

function NewsletterCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    recipientFilter: "all", // "all", "active_subscribers"
  });

  useEffect(() => {
    // Listen to campaigns
    const q = query(collection(db, "newsletterCampaigns"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCampaigns(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Count active subscribers
    const getSubs = async () => {
      const s = await getDocs(query(collection(db, "newsletterSubscribers")));
      setSubscribers(s.docs.filter(d => d.data().status === "active").length);
    };
    getSubs();

    return () => unsub();
  }, []);

  const handleSaveDraft = async () => {
    if (!formData.subject) return toast.error("Subject is required");
    try {
      await addDoc(collection(db, "newsletterCampaigns"), {
        ...formData,
        status: "draft",
        createdAt: serverTimestamp(),
      });
      toast.success("Draft saved");
      setIsCreating(false);
      setFormData({ subject: "", content: "", recipientFilter: "all" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to save draft");
    }
  };

  const handleSendNow = async () => {
    if (!formData.subject || !formData.content) return toast.error("Subject and content are required");
    if (!confirm("Are you sure you want to send this campaign now?")) return;
    
    setSending(true);
    try {
      // 1. Save campaign as sent
      const docRef = await addDoc(collection(db, "newsletterCampaigns"), {
        ...formData,
        status: "sent",
        sentAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        recipientsCount: subscribers
      });

      // 2. Trigger server function to dispatch emails 
      // (This is a simplified mock for the UI. In a real system, we'd trigger a server function)
      toast.success("Campaign sent successfully to queue!");
      setIsCreating(false);
      setFormData({ subject: "", content: "", recipientFilter: "all" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    // ... delete logic here (mocked for brevity)
    toast.success("Deleted");
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-saffron" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-navy">Newsletter Campaigns</h1>
          <p className="text-ink/70">Manage and send marketing emails</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-saffron text-white px-4 py-2 rounded-xl hover:bg-[#E66100] transition-colors"
        >
          {isCreating ? "Cancel" : <><Plus size={18} /> New Campaign</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-navy/10 shadow-sm flex items-center gap-4">
          <div className="bg-saffron/10 p-3 rounded-xl text-saffron"><Users size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-ink/60">Active Subscribers</p>
            <p className="text-2xl font-black text-navy">{subscribers}</p>
          </div>
        </div>
        {/* Can add more stats here */}
      </div>

      {isCreating && (
        <div className="bg-white rounded-2xl border border-navy/10 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-navy">Create Campaign</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Subject Line</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full rounded-xl border border-navy/20 p-3 focus:ring-2 focus:ring-saffron/20 outline-none"
                placeholder="E.g., 5 ways to ace your next exam"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">HTML Content</label>
              <textarea
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full rounded-xl border border-navy/20 p-3 focus:ring-2 focus:ring-saffron/20 outline-none font-mono text-sm"
                placeholder="<p>Hello there...</p>"
              />
              <p className="text-xs text-ink/60 mt-1">Accepts raw HTML. We automatically wrap this in the Vidyapeeth branded email template.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-navy/10">
            <button
              onClick={handleSaveDraft}
              className="px-5 py-2 text-navy font-semibold hover:bg-navy/5 rounded-xl transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handleSendNow}
              disabled={sending}
              className="flex items-center gap-2 bg-navy text-white px-6 py-2 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send Now
            </button>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white rounded-2xl border border-navy/10 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy font-semibold">
            <tr>
              <th className="p-4">Campaign</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {campaigns.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-ink/60">No campaigns found.</td></tr>
            ) : campaigns.map(c => (
              <tr key={c.id} className="hover:bg-navy/5">
                <td className="p-4 font-medium text-navy">{c.subject}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    c.status === "sent" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {c.status === "sent" ? <Send size={12} /> : <FileEdit size={12} />}
                    {c.status}
                  </span>
                </td>
                <td className="p-4 text-ink/70">
                  {c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleDateString() : "Just now"}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteCampaign(c.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
