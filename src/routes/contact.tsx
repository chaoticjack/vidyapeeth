import { createFileRoute, Link } from "@tanstack/react-router";
import { getSeoMeta, getCanonicalLink } from "@/lib/seo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Mail, Phone, Clock, Loader2, ArrowUpRight } from "lucide-react";
import { sendContactNotification } from "@/lib/server-actions";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "10-digit mobile"),
  email: z.string().email("Valid email please"),
  message: z.string().min(10, "Tell us a little more"),
});
type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: getSeoMeta(
      "Contact Us",
      "Reach the Vidyapeeth team. We're open 24×7 for student and parent queries. Office in Vikaspuri, Delhi.",
      "/contact"
    ),
    links: [getCanonicalLink("/contact")],
  }),
  component: ContactPage,
});

function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Form>({ resolver: zodResolver(schema), mode: "onBlur" });

  async function onSubmit(values: Form) {
    try {
      await addDoc(collection(db, "contactMessages"), {
        ...values,
        createdAt: serverTimestamp(),
      });

      sendContactNotification({ data: values }).catch(console.error);

      toast.success("Message received. We'll reply within 4 working hours.");
      reset();
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message. Please try again later.");
    }
  }

  return (
    <div className="grain bg-cream">
      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
            Contact
          </span>
          <h1 className="mt-4 font-display text-5xl font-black leading-[1.05] text-navy md:text-7xl">
            We're <span className="italic font-light text-navy/65">24×7 open</span> for you.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink">
            Make learning and teaching more effective with active participation and student
            collaboration. Drop us a note any time.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-5">
          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-3xl border border-navy/10 bg-card p-7 shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)] md:col-span-3 md:p-9"
          >
            <h2 className="font-display text-2xl font-black text-navy">Send a message</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Name" error={errors.name?.message}>
                <input {...register("name")} className="vp-input" placeholder="Your full name" />
              </Field>
              <Field label="Phone number" error={errors.phone?.message}>
                <input
                  {...register("phone")}
                  inputMode="numeric"
                  className="vp-input"
                  placeholder="98xxxxxxxx"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Email" error={errors.email?.message}>
                  <input
                    {...register("email")}
                    type="email"
                    className="vp-input"
                    placeholder="you@example.com"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Message" error={errors.message?.message}>
                  <textarea
                    {...register("message")}
                    rows={5}
                    className="vp-input resize-none"
                    placeholder="How can we help?"
                  />
                </Field>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              data-cursor="lift"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-7 py-4 text-sm font-semibold text-cream transition-all hover:bg-saffron disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Sending…" : "Submit"}
            </button>
          </form>

          {/* Info */}
          <aside className="space-y-5 md:col-span-2">
            <InfoCard
              Icon={MapPin}
              title="Office address"
              body={<>Vikaspuri,<br />New Delhi, India</>}
            />
            <InfoCard
              Icon={Mail}
              title="Email"
              body={<a className="hover:text-saffron" href="mailto:hello@vidyapeeth.org.in">hello@vidyapeeth.org.in</a>}
            />
            <InfoCard
              Icon={Phone}
              title="Phone"
              body={<a className="hover:text-saffron" href="tel:+919999999999">+91 99999 99999</a>}
            />
            <InfoCard Icon={Clock} title="Hours" body="Open 24×7 — replies within 4 working hours." />
          </aside>
        </div>
      </section>

      {/* Cross-links */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <Link
              to="/courses"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(27,42,74,0.25)]"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Explore</span>
                <h3 className="mt-1 font-display text-base font-bold text-navy">Looking for courses?</h3>
                <p className="mt-1 text-sm text-ink/70">Class 6–10, live mentor-led.</p>
              </div>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-cream transition-colors group-hover:bg-saffron">
                <ArrowUpRight size={16} />
              </span>
            </Link>
            <Link
              to="/demo-class"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(27,42,74,0.25)]"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Try us</span>
                <h3 className="mt-1 font-display text-base font-bold text-navy">Try a free demo</h3>
                <p className="mt-1 text-sm text-ink/70">60 min live class, no card.</p>
              </div>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-cream transition-colors group-hover:bg-saffron">
                <ArrowUpRight size={16} />
              </span>
            </Link>
            <Link
              to="/blog"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(27,42,74,0.25)]"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Read</span>
                <h3 className="mt-1 font-display text-base font-bold text-navy">Read our blog</h3>
                <p className="mt-1 text-sm text-ink/70">Tips, guides, exam strategy.</p>
              </div>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-cream transition-colors group-hover:bg-saffron">
                <ArrowUpRight size={16} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .vp-input{width:100%;border-radius:12px;border:1px solid rgba(27,42,74,0.16);background:#FFF8F0;padding:12px 14px;font-size:14px;color:#1B2A4A;outline:none;transition:border-color 160ms ease, box-shadow 160ms ease;}
        .vp-input:focus{border-color:#F4700B;box-shadow:0 0 0 4px rgba(244,112,11,0.15);}
      `}</style>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-navy/80">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-saffron">{error}</span>}
    </label>
  );
}

function InfoCard({
  Icon,
  title,
  body,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-card p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-saffron/15 text-saffron">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-navy">{title}</h3>
      <div className="mt-1 text-sm text-ink">{body}</div>
    </div>
  );
}
