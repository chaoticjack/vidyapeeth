
# Vidyapeeth — Homepage + Brand System

Scope: brand foundation + 11-section homepage. Other routes are stubs. Stack is TanStack Start (React 19 + Vite) — every Next.js construct in the brief is mapped to its TanStack equivalent below.

## Stack mapping (brief → reality)

| Brief | This build |
|---|---|
| Next.js App Router | TanStack Router file routes under `src/routes/` |
| `app/layout.tsx` | `src/routes/__root.tsx` |
| `generateMetadata`, `sitemap.ts`, `robots.ts` | Per-route `head()`, `src/routes/sitemap[.]xml.ts`, `public/robots.txt` |
| `app/api/*/route.ts` | `createServerFn` for app RPC, `src/routes/api/public/*` for Razorpay webhook |
| Clerk | Lovable Cloud (Supabase) — deferred (not in v1 scope) |
| Drizzle | Supabase clients (browser / `requireSupabaseAuth` / admin) |
| `next/font` Syne + Plus Jakarta | Google Fonts `<link>` in `__root.tsx` + `@theme` tokens in `src/styles.css` |
| Razorpay | Deferred — not in v1 scope (homepage-only) |
| Resend | Deferred |
| ISR / edge middleware | TanStack SSR defaults; no edge middleware needed |

Scope cut: v1 is **brand system + homepage only**. Courses/VSAT/demo/dashboard/payments/auth are explicitly out of this turn — they get stubs (route file + placeholder `head()`) so navbar links don't 404. Razorpay, Resend, Supabase schema, and Clerk replacement land in follow-up turns.

## Brand system (foundation)

`src/styles.css`:
- `@theme` tokens: `--color-navy: #1B2A4A`, `--color-saffron: #F4700B`, `--color-cream: #FFF8F0`, `--color-ink: #374151`, `--color-mist: #F3F4F6`, `--color-fog: #9CA3AF`.
- `@theme inline` mapping to shadcn semantic tokens (`--background` → cream, `--primary` → navy, `--accent` → saffron, `--foreground` → ink) so shadcn primitives inherit the palette without per-component overrides.
- `--font-display: "Syne"`, `--font-body: "Plus Jakarta Sans"`.
- `@utility grain` — fixed-position `::after` with SVG fractal-noise data-URI at low opacity, applied to cream sections only.
- `@utility wave-divider-*` helpers for SVG mask shapes.
- `prefers-reduced-motion` block neutralizing transforms/opacity transitions.

`__root.tsx` head: Google Fonts preconnect + stylesheet for Syne (400/700/900) + Plus Jakarta Sans (300/400/600), sitewide `og:site_name`, `EducationalOrganization` JSON-LD, favicon, viewport. Body wraps `<Outlet />` in `<main>` plus the `<CustomCursor />` and `<Navbar />` / `<Footer />` shell.

## Routes (v1)

```text
src/routes/
  __root.tsx                # shell, fonts, navbar, footer, cursor, JSON-LD
  index.tsx                 # full homepage (11 sections)
  courses.tsx               # stub: <h1> + head()
  courses.$slug.tsx         # stub
  vsat.tsx                  # stub
  demo-class.tsx            # stub
  about.tsx                 # stub
  blog.tsx                  # stub
  contact.tsx               # stub
  privacy-policy.tsx        # stub
  terms.tsx                 # stub
  sitemap[.]xml.ts          # lists the 10 public routes
public/robots.txt           # Allow: /
```

Each stub gets its own `head()` with route-specific title + description so nav links are SEO-valid placeholders, not duplicates of home.

## Homepage section architecture

`src/routes/index.tsx` composes 11 components from `src/components/home/` in order. All section components are **client components** (animations, refs, hooks); the index route itself is SSR-rendered.

```text
1.  Navbar              (layout)  — sticky, IntersectionObserver scroll-state, blur on scroll
2.  HeroSection         60/40 split; Syne 900 H1, inline hand-drawn SVG illustration right
3.  StatsBar            navy band; 4 GSAP ScrollTrigger counters, Lucide icons
4.  CourseShowcase      masonry on md+ via CSS grid w/ varied row-spans; horizontal scroll on mobile
5.  VSATBlock           navy bg; left benefits list, right tilted "admit card" SVG (Framer Motion tilt on hover)
6.  DemoBookingSection  split; React Hook Form + Zod schema, countdown timer above form (no submit wiring in v1)
7.  HowItWorks          3 SVG illustrations + GSAP drawSVG-style dashed connector animated on scroll
8.  TestimonialsGrid    newspaper layout: 1 featured (col-span-2) + 2 stacked; static, no carousel
9.  SuccessMarquee      pure CSS @keyframes, two rows scrolling opposite directions
10. CTABanner           cream bg, grain overlay, hand-drawn SVG arrow → sign-up CTA (link to /demo-class stub)
11. Footer              4-column light footer
```

`src/components/shared/`: `CustomCursor.tsx` (desktop-only, `matchMedia('(pointer: fine)')` gate + reduced-motion gate), `CounterAnimation.tsx`, `ScrollReveal.tsx`, `WaveDivider.tsx`, `OrganicShape.tsx`.

All copy + testimonials + course showcase data live in `src/data/home.ts` (typed arrays) — no DB in v1 scope. This means the homepage is fully SSR-deterministic and renders correctly during prerender.

## Server vs client components & hydration

TanStack Start renders every route component server-side by default. There are no React Server Components — the "server vs client" distinction is "what's safe during SSR" rather than RSC boundaries.

| Component | Runs on | Notes |
|---|---|---|
| `__root.tsx` shell | SSR + client | Pure JSX, no browser APIs |
| `index.tsx` route component | SSR + client | Composes sections; static data only |
| `HeroSection`, all section components | SSR + client | Render markup on server; animations attach in `useEffect` |
| `Navbar` | SSR + client | Scroll state in `useEffect` — initial SSR renders the unscrolled state |
| `CustomCursor` | client-only render | Wrap in `<ClientOnly>` from `@tanstack/react-router` to skip SSR entirely (uses `window`, pointer events, `matchMedia`) |
| `SuccessMarquee` | SSR + client | Pure CSS; no JS — zero hydration risk |
| `StatsBar` counters | SSR + client | Render final number as SSR fallback, animate from 0 in `useEffect` so SSR HTML matches initial client render |
| GSAP ScrollTrigger setup | client-only | All `gsap.registerPlugin` + ScrollTrigger creation inside `useEffect` |

**Hydration risk areas flagged:**
1. `CustomCursor` — must be `<ClientOnly>` or it crashes SSR on `window`.
2. `Navbar` scroll-blur state — never read `window.scrollY` during render; initialize state to `false` and update in `useEffect`, otherwise SSR HTML mismatches.
3. `StatsBar` counters — render the target value as initial state in SSR, kick off counter from 0 inside `useEffect` (does not affect SSR HTML; only the post-mount animation differs).
4. Framer Motion `initial`/`animate` — fine as long as initial state is deterministic. Avoid `Math.random()` stagger seeds; use fixed delay arrays.
5. Date-based countdown in `DemoBookingSection` — compute target on client only (`useEffect`); SSR shows static "Starts soon" fallback to avoid time-zone mismatch.
6. `prefers-reduced-motion` checks must happen in `useEffect`, never during render.

## Shared state dependencies

v1 homepage has **no cross-component shared state** — every section is self-contained with local `useState`/`useRef`. Zustand stores are deferred:
- `authStore` → needed when auth lands
- `cartStore` / `enrollmentStore` → needed when courses + Razorpay land

The only "global" concern is the custom cursor, which is rendered once in `__root.tsx` and reads pointer position from a top-level event listener; sections opt-in to hover effects via a `data-cursor="lift"` attribute the cursor reads — no React context needed.

## Animations

- **Framer Motion 11**: navbar transitions, course card hover lift, modal/drawer (when added).
- **GSAP 3 + ScrollTrigger**: stat counters, SVG path drawing on HowItWorks connector, section reveals (staggered, uneven delays per brief).
- **CSS-only**: marquee, grain overlay, hover tint shifts.
- All wrapped in `prefers-reduced-motion: reduce` guards.
- Hero-only animation on page load (text slides from left, illustration fade+scale from right); everything else is scroll-triggered.

Packages to add: `framer-motion`, `gsap`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`.

## SEO

- `__root.tsx`: `EducationalOrganization` JSON-LD, `og:site_name`, viewport.
- `index.tsx` `head()`: route-specific title ("Vidyapeeth — Education Matters | Class 6–10 Online Coaching"), description, `og:title`, `og:description`, `og:url: "/"`, leaf `<link rel="canonical" href="/">`. No `og:image` in v1 (placeholder previews worse than none — will generate after homepage visuals are approved).
- Each stub route gets its own route-specific `head()`.
- `sitemap[.]xml.ts` server route lists the 10 public paths.
- `public/robots.txt` allows all; no `Sitemap:` directive yet (no project URL).
- Semantic HTML throughout: `<header>`, `<nav>`, `<main>`, `<section>` per homepage block, `<article>` for testimonials, `<footer>`.

## File layout (delta to brief)

```text
src/
  routes/                  # see Routes table above
  components/
    layout/                Navbar.tsx  Footer.tsx
    home/                  HeroSection.tsx  StatsBar.tsx  CourseShowcase.tsx
                           VSATBlock.tsx  DemoBookingSection.tsx  HowItWorks.tsx
                           TestimonialsGrid.tsx  SuccessMarquee.tsx  CTABanner.tsx
    shared/                CustomCursor.tsx  CounterAnimation.tsx  ScrollReveal.tsx
                           WaveDivider.tsx  OrganicShape.tsx
    ui/                    (shadcn — already installed)
  data/home.ts             stats, courses, testimonials, success stories, nav items
  lib/utils.ts             (existing)
  styles.css               brand tokens, grain utility, font wiring
public/
  illustrations/           hero.svg, vsat-card.svg, how-it-works-{1,2,3}.svg, cta-arrow.svg
  robots.txt
```

SVG illustrations: inline hand-drawn ink-style components authored as React (`src/components/illustrations/*.tsx`) rather than static files, so stroke colors can use brand tokens and GSAP can target paths.

## Out of scope (explicit follow-up turns)

1. Supabase schema (users, courses, enrollments, demo_bookings, testimonials, blog_posts) + RLS + `user_roles` table.
2. Auth — Lovable Cloud email/password + Google, replacing the Clerk pieces of the brief.
3. Courses listing + detail pages (real data, filter, slug routes).
4. Demo booking server function + Resend email.
5. Razorpay: `/api/public/razorpay/webhook` server route + `createServerFn` for order create/verify + secrets.
6. Dashboard + protected routes under `_authenticated/`.
7. Blog SSG + `/blog/[slug]`.

Confirm and I'll build v1.
