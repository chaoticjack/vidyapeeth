import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-black text-navy font-display">Settings</h1>
      
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-navy mb-4 font-display">Admin Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-navy focus:border-navy" defaultValue="Admin User" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-navy focus:border-navy" defaultValue="admin@vidyapeeth.com" />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <h2 className="text-lg font-bold text-navy mb-4 font-display">Change Password</h2>
          <div className="grid grid-cols-1 gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-navy focus:border-navy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-navy focus:border-navy" />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <h2 className="text-lg font-bold text-navy mb-4 font-display">Notification Preferences</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-navy rounded border-gray-300 focus:ring-navy" />
              <span className="text-sm text-gray-700">Email alerts for new Demo Requests</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-navy rounded border-gray-300 focus:ring-navy" />
              <span className="text-sm text-gray-700">Weekly Analytics Report</span>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button className="flex items-center gap-2 rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-saffron transition-colors">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
