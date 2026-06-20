import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Vidyapeeth" },
      { name: "description", content: "How Vidyapeeth collects, uses and protects your data." },
      { property: "og:title", content: "Privacy Policy — Vidyapeeth" },
      { property: "og:description", content: "How Vidyapeeth collects, uses and protects your data." },
      { property: "og:url", content: "/privacy-policy" },
    ],
    links: [{ rel: "canonical", href: "/privacy-policy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="grain bg-cream pt-32 pb-24 md:pt-40">
      <article className="mx-auto max-w-3xl px-6">
        <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
          Legal
        </span>
        <h1 className="mt-4 font-display text-5xl font-black text-navy md:text-6xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-ink/70">Last updated: 1 January 2026</p>

        <div className="prose prose-headings:font-display prose-headings:text-navy prose-p:text-ink prose-li:text-ink mt-10 max-w-none">
          <p>
            Vidyapeeth ("we", "us", "our") is committed to protecting the privacy of every
            student, parent and visitor who uses our platform. This policy explains what
            information we collect, how we use it, and the choices you have.
          </p>

          <h2>1. Information we collect</h2>
          <ul>
            <li>
              <strong>Account details</strong> — student name, parent name, email, phone, class,
              city and school.
            </li>
            <li>
              <strong>Learning activity</strong> — classes attended, doubts asked, test scores
              and assignment submissions.
            </li>
            <li>
              <strong>Device data</strong> — browser type, IP address and cookies used to keep
              you signed in and improve the product.
            </li>
          </ul>

          <h2>2. How we use your information</h2>
          <p>
            We use the data above to deliver classes, personalise your learning plan, send
            progress reports to parents, run the VSAT scholarship test, and improve our
            services. We never sell your data to advertisers.
          </p>

          <h2>3. Sharing</h2>
          <p>
            We share data only with trusted service providers (hosting, payments, email) bound
            by confidentiality contracts, and with regulators if required by law.
          </p>

          <h2>4. Children's privacy</h2>
          <p>
            Students under 18 use Vidyapeeth with a parent or guardian's consent. Parents can
            review, update or delete their child's data at any time by writing to us.
          </p>

          <h2>5. Your rights</h2>
          <p>
            You can request access, correction or deletion of your data, or withdraw consent
            for marketing communication. Email{" "}
            <a className="text-saffron" href="mailto:privacy@vidyapeeth.org.in">
              privacy@vidyapeeth.org.in
            </a>{" "}
            and we'll respond within 7 working days.
          </p>

          <h2>6. Security</h2>
          <p>
            All data is encrypted in transit and at rest. We run quarterly security reviews and
            restrict access to need-to-know team members.
          </p>

          <h2>7. Changes</h2>
          <p>
            We may update this policy as our services evolve. Material changes are notified by
            email and posted on this page with a revised "last updated" date.
          </p>
        </div>
      </article>
    </div>
  );
}
