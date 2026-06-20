import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="grain border-t border-navy/10 bg-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-cream">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M4 6 L12 3 L20 6 L12 9 Z" fill="#F4700B" stroke="#F4700B" />
                <path d="M6 10 V16 L12 19 L18 16 V10" />
              </svg>
            </span>
            <span className="font-display text-xl font-black text-navy">Vidyapeeth</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink">
            Education matters. Live, mentor-led learning for Class 6–10 students across India.
          </p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Youtube, Linkedin, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-navy/15 text-navy/70 transition-colors hover:border-saffron hover:text-saffron"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          heading="Learn"
          items={[
            { to: "/courses", label: "All courses" },
            { to: "/vsat", label: "VSAT scholarship" },
            { to: "/demo-class", label: "Book a demo" },
            { to: "/blog", label: "Blog & study tips" },
          ]}
        />
        <FooterCol
          heading="Company"
          items={[
            { to: "/about", label: "About us" },
            { to: "/contact", label: "Contact" },
            { to: "/blog", label: "Press" },
            { to: "/about", label: "Careers" },
          ]}
        />
        <FooterCol
          heading="Help"
          items={[
            { to: "/contact", label: "Support" },
            { to: "/privacy-policy", label: "Privacy policy" },
            { to: "/terms", label: "Terms of use" },
            { to: "/contact", label: "Refunds" },
          ]}
        />
      </div>
      <div className="border-t border-navy/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-6 text-xs text-ink md:flex-row md:items-center">
          <p>© {year} Vidyapeeth Learning Pvt. Ltd. Made in India.</p>
          <p className="font-display font-semibold tracking-wide text-navy">
            Learning keeps you in the lead.
          </p>
        </div>
      </div>
    </footer>
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
      <h4 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-navy/60">
        {heading}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {items.map((i) => (
          <li key={i.label}>
            <Link
              to={i.to}
              className="text-sm text-navy/85 transition-colors hover:text-saffron"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}