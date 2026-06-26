import { createFileRoute } from "@tanstack/react-router";
import { getSeoMeta, getCanonicalLink } from "@/lib/seo";
import { VsatPage } from "@/components/vsat/VsatPage";

export const Route = createFileRoute("/vsat")({
  head: () => ({
    meta: getSeoMeta(
      "VSAT 2026 — Vidyapeeth Scholarship Test",
      "Win up to ₹25 lakh in scholarships through the Vidyapeeth Scholastic Aptitude Test. Free to apply.",
      "/vsat"
    ),
    links: [getCanonicalLink("/vsat")],
  }),
  component: () => (
    <VsatPage />
  ),
});