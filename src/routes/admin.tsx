import { createFileRoute, Outlet, Link, useRouterState, Navigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ShieldAlert,
  Loader2,
  BadgeCheck,
  Library,
  ListTree,
  Video,
  Mail
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Vidyapeeth" }] }),
  component: AdminLayout,
});

const adminLinks = [
  { to: "/admin", icon: <LayoutDashboard size={18} />, label: "Dashboard", exact: true },
  { to: "/admin/students", icon: <Users size={18} />, label: "Students" },
  { to: "/admin/teachers", icon: <GraduationCap size={18} />, label: "Teachers" },
  { to: "/admin/categories", icon: <Library size={18} />, label: "Categories" },
  { to: "/admin/subjects", icon: <BookOpen size={18} />, label: "Subjects" },
  { to: "/admin/courses", icon: <BookOpen size={18} />, label: "Courses" },
  { to: "/admin/modules", icon: <ListTree size={18} />, label: "Modules" },
  { to: "/admin/lessons", icon: <Video size={18} />, label: "Lessons" },
  { to: "/admin/enrollments", icon: <BadgeCheck size={18} />, label: "Enrollments" },
  { to: "/admin/demo-requests", icon: <CalendarCheck2 size={18} />, label: "Demo Requests" },
  { to: "/admin/blogs", icon: <FileText size={18} />, label: "Blog Management" },
  { to: "/admin/analytics", icon: <BarChart3 size={18} />, label: "Reports & Analytics" },
  { to: "/admin/marketing/newsletter", icon: <Mail size={18} />, label: "Marketing & Newsletter" },
  { to: "/admin/settings", icon: <Settings size={18} />, label: "Settings" },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user || !user.isAdmin) return;
    const q = query(collection(db, 'adminNotifications'), orderBy('timestamp', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
      
      const lastChecked = localStorage.getItem('adminLastCheckedNotifs');
      if (!lastChecked) {
        setUnreadCount(notifs.length);
      } else {
        const lastCheckedTime = parseInt(lastChecked, 10);
        const unread = notifs.filter((n: any) => {
          if (n.timestamp?.toDate) {
            return n.timestamp.toDate().getTime() > lastCheckedTime;
          } else if (typeof n.timestamp === 'string') {
            return new Date(n.timestamp).getTime() > lastCheckedTime;
          }
          return false; 
        });
        setUnreadCount(unread.length);
      }
    }, (err) => {
      console.warn("Notifications error:", err);
    });
    return () => unsubscribe();
  }, [user]);

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
      localStorage.setItem('adminLastCheckedNotifs', Date.now().toString());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-saffron" />
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <Outlet />;
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-navy/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111A2C] text-cream transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron text-cream">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M4 6 L12 3 L20 6 L12 9 Z" fill="currentColor" stroke="currentColor" />
                <path d="M6 10 V16 L12 19 L18 16 V10" />
              </svg>
            </div>
            <span className="font-display font-black text-lg tracking-tight">Admin Portal</span>
          </Link>
          <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {adminLinks.map((link) => {
            const isActive = link.exact ? pathname === link.to : pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-saffron text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between bg-white px-6 border-b border-navy/5 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-navy hover:text-saffron transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 border border-gray-200">
              <Search size={16} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search students, courses..." 
                className="bg-transparent text-sm text-navy outline-none placeholder:text-gray-400 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <button 
                className="relative text-gray-500 hover:text-navy transition-colors"
                onClick={handleBellClick}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-saffron text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-navy text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">No new notifications</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <p className="text-sm font-semibold text-navy">{notif.title || 'New Activity'}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.text || notif.description}</p>
                          <p className="text-[10px] text-gray-400 mt-2">
                            {notif.timestamp?.toDate ? notif.timestamp.toDate().toLocaleString() : 'Just now'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-navy">Vidyapeeth Admin</p>
                <p className="text-xs text-gray-500">Management</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-cream">
                {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : "AD"}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
