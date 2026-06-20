import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Menu, X, BookOpen, LogOut, LayoutDashboard } from "lucide-react";
import { navLinks } from "@/data/home";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut();
    setDropdownOpen(false);
    navigate({ to: "/" });
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const isCourseDetailPage = pathname.startsWith('/courses/') && pathname !== '/courses' && pathname !== '/courses/';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || isCourseDetailPage
          ? "border-b border-navy/10 bg-cream/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:py-5"
      >
        <Link to="/" className="group flex items-center gap-2.5" aria-label="Vidyapeeth home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-cream transition-transform group-hover:-rotate-6">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M4 6 L12 3 L20 6 L12 9 Z" fill="#F4700B" stroke="#F4700B" />
              <path d="M6 10 V16 L12 19 L18 16 V10" />
            </svg>
          </span>
          <span className="font-display text-[22px] font-black tracking-tight text-navy">
            Vidyapeeth
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          <li>
            <Link
              to="/"
              className="relative rounded-full px-4 py-2 text-sm font-medium text-navy/80 transition-colors hover:text-navy"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-navy" }}
            >
              Home
            </Link>
          </li>
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="relative rounded-full px-4 py-2 text-sm font-medium text-navy/80 transition-colors hover:text-navy"
                activeProps={{ className: "text-navy" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-cream transition-transform hover:scale-105 hover:bg-saffron focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-offset-2 focus:ring-offset-cream"
              >
                {getInitials(user.fullName)}
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-navy/10 bg-white p-2 shadow-xl">
                  <div className="px-3 pb-2 pt-1">
                    <p className="truncate text-sm font-bold text-navy">{user.fullName}</p>
                    <p className="truncate text-xs text-ink/70">{user.email}</p>
                  </div>
                  <div className="my-1 h-px bg-navy/5" />
                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy/80 hover:bg-navy/5 hover:text-navy"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link
                    to="/dashboard/progress"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy/80 hover:bg-navy/5 hover:text-navy"
                  >
                    <BookOpen size={16} /> My Courses
                  </Link>
                  <div className="my-1 h-px bg-navy/5" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-sm font-semibold text-navy/80 transition-colors hover:text-saffron px-2"
              >
                Login / Sign Up
              </Link>
              <Link
                to="/demo-class"
                data-cursor="lift"
                className="group ml-2 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream shadow-[0_8px_24px_-12px_rgba(27,42,74,0.6)] transition-all hover:bg-saffron hover:shadow-[0_12px_30px_-12px_rgba(244,112,11,0.6)]"
              >
                Book Free Demo
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </>
          )}
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy lg:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-navy/10 bg-cream lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            <li>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-navy/85 hover:bg-navy/5"
              >
                Home
              </Link>
            </li>
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-navy/85 hover:bg-navy/5"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {!user && (
              <li>
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-navy/85 hover:bg-navy/5"
                >
                  Login / Sign Up
                </Link>
              </li>
            )}
            {user && (
              <li>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-navy/85 hover:bg-navy/5"
                >
                  Dashboard
                </Link>
              </li>
            )}
            <li className="mt-2">
              <Link
                to="/demo-class"
                onClick={() => setOpen(false)}
                className="block rounded-full bg-navy px-5 py-3 text-center text-sm font-semibold text-cream"
              >
                Book Free Demo
              </Link>
            </li>
            {user && (
              <li className="mt-2">
                <button
                  onClick={() => {
                    handleSignOut();
                    setOpen(false);
                  }}
                  className="block w-full rounded-full border border-navy/20 px-5 py-3 text-center text-sm font-semibold text-navy hover:bg-navy/5"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}