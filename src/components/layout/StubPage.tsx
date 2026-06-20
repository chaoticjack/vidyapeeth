import { Link } from "@tanstack/react-router";

type Props = { eyebrow: string; title: string; body: string };

export function StubPage({ eyebrow, title, body }: Props) {
  return (
    <section className="grain relative bg-cream pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
          {eyebrow}
        </span>
        <h1 className="mt-4 font-display text-4xl font-black capitalize leading-[1.05] text-navy md:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink">{body}</p>
        <Link
          to="/"
          data-cursor="lift"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-saffron"
        >
          ← Back to home
        </Link>
      </div>
    </section>
  );
}