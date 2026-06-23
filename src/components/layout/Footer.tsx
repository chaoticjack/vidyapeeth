import { Link } from "@tanstack/react-router";
import { 
  Instagram, Youtube, Linkedin, Twitter, 
  Mail, Phone, MapPin
} from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="relative border-t border-cream/10 bg-navy">
      <footer className="text-cream pt-8 pb-0 relative z-10">
        
        {/* 1. Horizontal Newsletter Bar */}
        <div className="mx-auto max-w-7xl px-6 border-b border-cream/10 pb-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-display text-lg font-bold text-cream">Get Weekly Study Tips</h3>
              <p className="text-cream/70 text-xs">Exam strategies and scholarship updates directly in your inbox.</p>
            </div>
            <form className="flex w-full max-w-sm gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full rounded-full bg-cream/10 border border-cream/20 px-4 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron transition-colors"
                required
              />
              <button 
                type="submit" 
                className="flex items-center justify-center shrink-0 rounded-full bg-saffron px-5 py-2 text-sm font-semibold text-cream hover:bg-[#E66100] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* 2. Main Footer Content */}
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-y-8 gap-x-6 pb-10">
          
          {/* Column 1: Brand */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream text-navy">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M4 6 L12 3 L20 6 L12 9 Z" fill="#F4700B" stroke="#F4700B" />
                  <path d="M6 10 V16 L12 19 L18 16 V10" />
                </svg>
              </span>
              <span className="font-display text-lg font-black text-cream">Vidyapeeth</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-cream/70 max-w-xs">
              Live, mentor-led learning for Class 6–10 students across India. Making concepts crystal clear.
            </p>
            <div className="mt-4 flex gap-2">
              {[Instagram, Youtube, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-cream/20 text-cream/70 transition-all hover:border-cream hover:text-cream hover:-translate-y-0.5"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Courses */}
          <div className="lg:col-span-2 lg:ml-4">
            <FooterCol
              heading="Courses"
              items={[
                { to: "/courses", label: "Class 6" },
                { to: "/courses", label: "Class 7" },
                { to: "/courses", label: "Class 8" },
                { to: "/courses", label: "Class 9" },
                { to: "/courses", label: "Class 10" },
              ]}
            />
          </div>

          {/* Column 3: Resources */}
          <div className="lg:col-span-2">
            <FooterCol
              heading="Resources"
              items={[
                { to: "/blog", label: "Blog" },
                { to: "/blog", label: "Study Tips" },
                { to: "/vsat", label: "VSAT Scholarship" },
                { to: "/demo-class", label: "Book Free Demo" },
              ]}
            />
          </div>

          {/* Column 4: Company */}
          <div className="lg:col-span-2">
            <FooterCol
              heading="Company"
              items={[
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
                { to: "/about", label: "Careers" },
                { to: "/privacy-policy", label: "Privacy Policy" },
              ]}
            />
          </div>

          {/* Column 5: Contact */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cream/50 mb-3">
              Contact
            </h4>
            <ul className="space-y-3 text-xs text-cream/80">
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-saffron shrink-0" />
                <span>hello@vidyapeeth.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-saffron shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin size={14} className="text-saffron shrink-0" />
                <span>Sector 62, Noida, UP, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className="border-t border-cream/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 text-[11px] text-cream/60 sm:flex-row">
            <p>© {year} Vidyapeeth</p>
            <div className="flex items-center gap-5">
              <Link to="/privacy-policy" className="hover:text-cream transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-cream transition-colors">Terms & Conditions</Link>
              <Link to="/contact" className="hover:text-cream transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>

      </footer>
    </div>
  );
}

function FooterCol({
  heading,
  items,
}: {
  heading: string;
  items: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cream/50 mb-3">
        {heading}
      </h4>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.label}>
            <Link
              to={i.to}
              className="text-xs text-cream/80 transition-all hover:text-white hover:translate-x-0.5 inline-block"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}