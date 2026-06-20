import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Vidyapeeth" },
      { name: "description", content: "The terms that govern your use of Vidyapeeth." },
      { property: "og:title", content: "Terms of Use — Vidyapeeth" },
      { property: "og:description", content: "The terms that govern your use of Vidyapeeth." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="grain bg-cream pt-32 pb-24 md:pt-40">
      <article className="mx-auto max-w-3xl px-6">
        <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
          Legal
        </span>
        <h1 className="mt-4 font-display text-5xl font-black text-navy md:text-6xl">
          Terms of Use
        </h1>
        <p className="mt-4 text-sm text-ink/70">Last updated: 1 January 2026</p>

        <div className="prose prose-headings:font-display prose-headings:text-navy prose-p:text-ink prose-li:text-ink mt-10 max-w-none">
          <p>
            These Terms of Use ("Terms") govern your access to and use of Vidyapeeth's website,
            mobile app and learning services. By creating an account or enrolling in a course,
            you agree to these Terms.
          </p>

          <h2>1. Eligibility</h2>
          <p>
            Vidyapeeth services are intended for students of Class 6–12. Students under 18 must
            use the platform with a parent or guardian's consent.
          </p>

          <h2>2. Account responsibility</h2>
          <p>
            You are responsible for keeping your login credentials confidential. Do not share
            your account, and notify us immediately of any unauthorised access.
          </p>

          <h2>3. Payments and refunds</h2>
          <ul>
            <li>Course fees are billed once at enrolment unless an instalment plan is chosen.</li>
            <li>
              You may request a full refund within 7 days of enrolment if you've attended fewer
              than 3 live classes.
            </li>
            <li>VSAT registrations are free and non-refundable beyond the registration window.</li>
          </ul>

          <h2>4. Acceptable use</h2>
          <p>
            You agree not to: (i) record or redistribute class content; (ii) harass mentors or
            other students; (iii) attempt to reverse-engineer the platform; or (iv) use
            Vidyapeeth for any unlawful purpose.
          </p>

          <h2>5. Intellectual property</h2>
          <p>
            All course content, recorded lessons, study material and trademarks remain the
            property of Vidyapeeth. You receive a personal, non-transferable licence to use them
            for your own learning.
          </p>

          <h2>6. Service availability</h2>
          <p>
            We aim for 99.5% uptime but do not guarantee uninterrupted access. Scheduled
            maintenance is announced in advance whenever possible.
          </p>

          <h2>7. Limitation of liability</h2>
          <p>
            To the extent permitted by law, Vidyapeeth is not liable for indirect or
            consequential damages arising from your use of the service.
          </p>

          <h2>8. Governing law</h2>
          <p>
            These Terms are governed by the laws of India and disputes are subject to the
            exclusive jurisdiction of the courts of Delhi.
          </p>

          <h2>9. Contact</h2>
          <p>
            Questions about these Terms? Write to{" "}
            <a className="text-saffron-deep underline" href="mailto:legal@vidyapeeth.org.in">
              legal@vidyapeeth.org.in
            </a>
            .
          </p>
        </div>
      </article>
    </div>
  );
}
