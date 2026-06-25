import { createFileRoute, Outlet, redirect, useNavigate, useRouter, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/auth",
        search: { mode: "signin", redirect: location.pathname },
      });
    } else if (!loading && user && !user.onboarded && !user.onboardingCompleted && location.pathname !== "/onboarding") {
      navigate({ to: "/onboarding" });
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-saffron" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <Outlet />;
}