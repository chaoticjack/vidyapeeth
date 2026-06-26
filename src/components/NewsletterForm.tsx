import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { subscribeNewsletter } from "@/lib/server-actions";
import { toast } from "sonner";

interface NewsletterFormProps {
  source?: "homepage" | "blog" | "footer" | "popup";
  tags?: string[];
  className?: string;
  compact?: boolean;
}

export function NewsletterForm({ source = "homepage", tags = [], className = "", compact = false }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await subscribeNewsletter({ data: { email, source, tags } });
      if (res.success) {
        setSuccess(true);
        toast.success(res.message);
        setEmail("");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl bg-saffron/10 p-4 text-saffron ${className}`}>
        <CheckCircle2 size={20} />
        <p className="text-sm font-medium">Thanks for subscribing!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <div className="relative flex-1">
        {!compact && (
          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy/40" />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className={`w-full rounded-full border border-navy/10 bg-white shadow-sm outline-none transition-all placeholder:text-navy/40 focus:border-saffron focus:ring-4 focus:ring-saffron/10 ${
            compact ? "py-2.5 pl-4 pr-24 text-sm" : "py-4 pl-12 pr-32 text-base"
          }`}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`absolute right-1.5 top-1.5 bottom-1.5 flex items-center justify-center rounded-full bg-navy text-cream transition-colors hover:bg-saffron disabled:opacity-70 ${
          compact ? "px-4 text-xs font-semibold" : "px-6 text-sm font-bold"
        }`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
      </button>
    </form>
  );
}
