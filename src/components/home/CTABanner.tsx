import { Link } from "@tanstack/react-router";
import { CtaArrow } from "@/components/illustrations/CtaArrow";

export function CTABanner() {
  return (
    <section className="grain relative bg-cream py-24 md:py-36">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
          Last bit
        </span>
        <h2 className="mt-4 font-display text-5xl font-black leading-[1.02] text-navy md:text-7xl">
          You read this far.{" "}
          <span className="italic font-light text-navy/65">
            That means something.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink">
          Book one free demo. If your child doesn't feel more confident in 60
          minutes, we'll personally apologise for wasting your time.
        </p>

        <div className="relative mx-auto mt-12 inline-block">
          <CtaArrow className="absolute -left-32 -top-10 hidden h-16 w-44 md:block" />
          <Link
            to="/demo-class"
            data-cursor="lift"
            className="inline-flex items-center gap-3 rounded-full bg-navy px-9 py-5 text-base font-semibold text-cream shadow-[0_24px_50px_-22px_rgba(27,42,74,0.7)] transition-all hover:-translate-y-0.5 hover:bg-saffron"
          >
            Book my free demo →
          </Link>
        </div>
      </div>
    </section>
  );
}