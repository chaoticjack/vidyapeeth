import { createFileRoute, Outlet, redirect, useNavigate, useRouter } from "@tanstack/react-router";
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

  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/auth",
        search: { mode: "signin", redirect: window.location.pathname },
      });
    }
  }, [user, loading, navigate]);

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