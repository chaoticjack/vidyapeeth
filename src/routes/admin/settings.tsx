import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Trash2, Plus, Save, Loader2, UserPlus, Building } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin Portal" }] }),
  component: AdminSettings,
});

function AdminSettings() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  
  // App Settings State
  const [appSettings, setAppSettings] = useState({
    siteName: "Vidyapeeth",
    supportEmail: "support@vidyapeeth.com",
    whatsappNumber: "+91",
    address: ""
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Add Admin State
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Confirm Remove Admin
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Fetch Admins
    const unsubscribeAdmins = onSnapshot(collection(db, "admins"), (snapshot) => {
      setAdmins(snapshot.docs.map(doc => ({ id: doc.id, email: doc.id, ...doc.data() })));
      setLoadingAdmins(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load admins");
      setLoadingAdmins(false);
    });

    // Fetch App Settings
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "global"));
        if (docSnap.exists()) {
          setAppSettings(docSnap.data() as any);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();

    return () => unsubscribeAdmins();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "global"), {
        ...appSettings,
        updatedAt: serverTimestamp(),
      });
      toast.success("Settings saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) return;

    if (admins.find(a => a.id === email)) {
      return toast.error("User is already an admin");
    }

    setIsAddingAdmin(true);
    try {
      await setDoc(doc(db, "admins", email), {
        role: "admin",
        permissions: ["all"],
        createdAt: serverTimestamp(),
        addedBy: user?.email || "system"
      });
      toast.success("Admin added successfully");
      setNewAdminEmail("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add admin");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const confirmRemove = (email: string) => {
    if (email === user?.email) {
      return toast.error("You cannot remove your own admin access.");
    }
    setRemovingEmail(email);
    setIsConfirmOpen(true);
  };

  const handleRemoveAdmin = async () => {
    if (!removingEmail) return;
    setIsRemoving(true);
    try {
      await deleteDoc(doc(db, "admins", removingEmail));
      toast.success("Admin access removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove admin");
    } finally {
      setIsRemoving(false);
      setIsConfirmOpen(false);
      setRemovingEmail(null);
    }
  };

  const adminColumns = [
    { key: "email", label: "Email Address", render: (row: any) => (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-navy">{row.email}</span>
        {row.email === user?.email && <span className="px-2 py-0.5 rounded-full bg-saffron/10 text-saffron text-[10px] font-bold uppercase">You</span>}
      </div>
    )},
    { key: "role", label: "Role", render: (row: any) => (
      <span className="capitalize text-gray-600">{row.role || "Admin"}</span>
    )},
    { key: "addedBy", label: "Added By", render: (row: any) => (
      <span className="text-gray-500 text-xs">{row.addedBy || "System"}</span>
    )},
    { key: "actions", label: "Actions", render: (row: any) => (
      <button 
        onClick={() => confirmRemove(row.email)} 
        disabled={row.email === user?.email}
        title="Remove Admin" 
        className="p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
      >
        <Trash2 size={16} />
      </button>
    )},
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-navy font-display">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage global app configuration and admin access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: App Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-navy/5 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Building size={20} /></div>
              <h2 className="text-lg font-bold text-navy font-display">Global Configuration</h2>
            </div>
            
            <div className="p-6">
              {loadingSettings ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="animate-spin text-saffron h-8 w-8" />
                </div>
              ) : (
                <form onSubmit={handleSaveSettings} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-navy">Site Name</label>
                      <input 
                        value={appSettings.siteName}
                        onChange={(e) => setAppSettings(prev => ({ ...prev, siteName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-navy">Support Email</label>
                      <input 
                        type="email"
                        value={appSettings.supportEmail}
                        onChange={(e) => setAppSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-navy">WhatsApp / Phone Number</label>
                      <input 
                        value={appSettings.whatsappNumber}
                        onChange={(e) => setAppSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Office Address</label>
                    <textarea 
                      value={appSettings.address}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, address: e.target.value }))}
                      rows={3} 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm resize-y" 
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isSavingSettings} 
                      className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70"
                    >
                      {isSavingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Configuration
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Admin Management */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-navy/5 flex items-center gap-3">
              <div className="p-2 bg-saffron/10 text-saffron rounded-lg"><UserPlus size={20} /></div>
              <h2 className="text-lg font-bold text-navy font-display">Access Control</h2>
            </div>
            
            <div className="p-6 border-b border-navy/5 bg-gray-50/50">
              <form onSubmit={handleAddAdmin} className="space-y-3">
                <label className="text-sm font-semibold text-navy">Grant Admin Access</label>
                <div className="flex gap-2">
                  <input 
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@vidyapeeth.com"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" 
                  />
                  <button 
                    type="submit"
                    disabled={isAddingAdmin}
                    className="flex shrink-0 items-center justify-center h-10 w-10 text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70"
                  >
                    {isAddingAdmin ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">Users added here will immediately have full read/write access to the admin dashboard.</p>
              </form>
            </div>

            <div className="p-0">
              <AdminTable 
                columns={adminColumns} 
                data={admins} 
                loading={loadingAdmins}
                emptyState="No administrators found."
              />
            </div>
          </div>
        </div>

      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Revoke Admin Access"
        description={`Are you sure you want to remove ${removingEmail}? They will immediately lose access to the admin portal.`}
        confirmText="Revoke Access"
        isDestructive={true}
        isLoading={isRemoving}
        onConfirm={handleRemoveAdmin}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
