import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { CustomCursor } from "../components/shared/CustomCursor";
import { WhatsAppFloat } from "../components/shared/WhatsAppFloat";
import { Toaster } from "../components/ui/sonner";
import { AuthProvider } from "../hooks/use-auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vidyapeeth — Education Matters" },
      {
        name: "description",
        content:
          "India's most patient online school for Class 6–10. Live mentor classes, doubt rooms, weekly tests, and parents who finally relax.",
      },
      { name: "author", content: "Vidyapeeth" },
      { name: "theme-color", content: "#1B2A4A" },
      { property: "og:site_name", content: "Vidyapeeth" },
      { property: "og:title", content: "Vidyapeeth — Education Matters" },
      {
        property: "og:description",
        content:
          "Live mentor-led learning for Class 6–10 across India. VSAT scholarships, doubt rooms, weekly reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@vidyapeeth" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800;900&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "Vidyapeeth",
          slogan: "Education Matters",
          description:
            "Live, mentor-led online learning platform for Class 6–10 students across India.",
          areaServed: "IN",
          sameAs: [],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  pendingComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="w-8 h-8 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteShell>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </SiteShell>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function SiteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/auth");
  const isLearnRoute = pathname.startsWith("/learn");
  const hideChrome = isAdminRoute || isAuthRoute || isLearnRoute;

  return (
    <>
      {!hideChrome && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-cream"
        >
          Skip to main content
        </a>
      )}
      {!hideChrome && <Navbar />}
      <main id="main-content" className={hideChrome ? "" : "min-h-dvh"}>{children}</main>
      {!hideChrome && <Footer />}
      {!hideChrome && <WhatsAppFloat />}
      <CustomCursor />
      <Toaster />
    </>
  );
}
