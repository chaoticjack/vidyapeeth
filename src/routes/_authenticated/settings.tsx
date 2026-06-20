import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, KeyRound, User, Bell, LifeBuoy, LogOut, Camera, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings — Vidyapeeth" },
    ],
  }),
  component: SettingsPage,
});

type Tab = "profile" | "security" | "notifications" | "help";

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile State
  const [profileName, setProfileName] = useState(user?.fullName || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Notification State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [testReminders, setTestReminders] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(false);

  if (!user) return null;

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setLoadingPassword(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error("Failed to update password.");
    } finally {
      setLoadingPassword(false);
    }
  }

  const handleLogout = () => {
    signOut();
    navigate({ to: "/" });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "security", label: "Security", icon: <KeyRound size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "help", label: "Help & Support", icon: <LifeBuoy size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-cream grain pt-32 pb-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-black text-navy md:text-4xl">Account Settings</h1>
          <p className="mt-2 text-ink/70">Manage your profile, security, and preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar Menu */}
          <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 gap-2 hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-navy text-cream shadow-md"
                      : "text-navy/70 hover:bg-navy/5 hover:text-navy"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={16} className="ml-auto hidden lg:block opacity-50" />}
                </button>
              ))}
              
              <div className="hidden lg:block h-px w-full bg-navy/10 my-2" />
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all whitespace-nowrap"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 w-full">
            {/* Profile Section */}
            {activeTab === "profile" && (
              <section className="rounded-3xl border border-navy/10 bg-card p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-navy/5">
                  <div className="h-10 w-10 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron">
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-navy">Profile Settings</h2>
                    <p className="text-sm text-ink/60">Update your personal information.</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative h-20 w-20 rounded-full bg-saffron/20 flex items-center justify-center text-saffron font-display text-3xl font-black overflow-hidden group cursor-pointer">
                      {user.fullName.charAt(0).toUpperCase()}
                      <div className="absolute inset-0 bg-navy/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-navy">Profile Picture</p>
                      <p className="text-ink/60 mt-0.5">Click to upload a new avatar.</p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full Name">
                      <input required value={profileName} onChange={e => setProfileName(e.target.value)} className="vp-input" />
                    </Field>
                    <Field label="Phone Number">
                      <input required value={profilePhone} onChange={e => setProfilePhone(e.target.value)} className="vp-input" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Email Address">
                        <input type="email" required value={profileEmail} onChange={e => setProfileEmail(e.target.value)} className="vp-input" />
                      </Field>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-8 py-3 text-sm font-semibold text-cream transition-all hover:bg-saffron disabled:opacity-50"
                    >
                      {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Security Section */}
            {activeTab === "security" && (
              <section className="rounded-3xl border border-navy/10 bg-card p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-navy/5">
                  <div className="h-10 w-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-navy">Security</h2>
                    <p className="text-sm text-ink/60">Keep your account secure.</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <Field label="Current Password">
                    <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="vp-input" placeholder="••••••••" />
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="New Password">
                      <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="vp-input" placeholder="Minimum 6 characters" />
                    </Field>
                    <Field label="Confirm New Password">
                      <input type="password" required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="vp-input" placeholder="Confirm new password" />
                    </Field>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loadingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-8 py-3 text-sm font-semibold text-cream transition-all hover:bg-saffron disabled:opacity-50"
                    >
                      {loadingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                      Update Password
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Notifications Section */}
            {activeTab === "notifications" && (
              <section className="rounded-3xl border border-navy/10 bg-card p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-navy/5">
                  <div className="h-10 w-10 rounded-xl bg-saffron/10 flex items-center justify-center text-saffron">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-navy">Notifications</h2>
                    <p className="text-sm text-ink/60">Manage how we contact you.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <ToggleRow label="Email Notifications" description="Receive general announcements and updates." checked={emailNotifs} onChange={setEmailNotifs} />
                  <div className="h-px w-full bg-navy/5" />
                  <ToggleRow label="Test Reminders" description="Get notified 24 hours before a scheduled test." checked={testReminders} onChange={setTestReminders} />
                  <div className="h-px w-full bg-navy/5" />
                  <ToggleRow label="Course Updates" description="Notifications about new chapters and assignments." checked={courseUpdates} onChange={setCourseUpdates} />
                </div>
              </section>
            )}

            {/* Help & Support Section */}
            {activeTab === "help" && (
              <section className="rounded-3xl border border-navy/10 bg-card p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-navy/5">
                  <div className="h-10 w-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy">
                    <LifeBuoy size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-navy">Help & Support</h2>
                    <p className="text-sm text-ink/60">Need assistance? We're here to help.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 rounded-2xl border border-navy/20 p-6 text-left transition-colors hover:border-navy hover:bg-navy/5">
                    <h4 className="font-bold text-navy mb-1">Contact Support</h4>
                    <p className="text-sm text-ink/70">Get in touch with our student success team.</p>
                  </button>
                  <button className="flex-1 rounded-2xl border border-navy/20 p-6 text-left transition-colors hover:border-navy hover:bg-navy/5">
                    <h4 className="font-bold text-navy mb-1">View FAQ</h4>
                    <p className="text-sm text-ink/70">Find quick answers to common questions.</p>
                  </button>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
      <style>{`
        .vp-input { width: 100%; border-radius: 12px; border: 1px solid rgba(27,42,74,0.16); background: #FFF8F0; padding: 10px 14px; font-size: 14px; color: #1B2A4A; outline: none; transition: border-color 160ms ease, box-shadow 160ms ease; }
        .vp-input:focus { border-color: #F4700B; box-shadow: 0 0 0 4px rgba(244,112,11,0.15); }
        .vp-toggle-bg { transition: background-color 0.2s ease; }
        .vp-toggle-dot { transition: transform 0.2s ease; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-semibold text-navy/90">{label}</span>
      {children}
    </label>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="font-semibold text-navy">{label}</p>
        <p className="text-sm text-ink/60">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`vp-toggle-bg relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent ${checked ? "bg-saffron" : "bg-navy/20"}`}
      >
        <span className={`vp-toggle-dot inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
