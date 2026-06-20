import { createFileRoute } from "@tanstack/react-router";
import { VsatPage } from "@/components/vsat/VsatPage";

export const Route = createFileRoute("/vsat")({
  head: () => ({
    meta: [
      { title: "VSAT 2026 — Vidyapeeth Scholarship Test" },
      {
        name: "description",
        content:
          "Win up to ₹25 lakh in scholarships through the Vidyapeeth Scholastic Aptitude Test. Free to apply.",
      },
      { property: "og:title", content: "VSAT 2026 — Vidyapeeth Scholarship Test" },
      {
        property: "og:description",
        content: "Win up to ₹25 lakh in scholarships. Free to apply.",
      },
      { property: "og:url", content: "/vsat" },
    ],
    links: [{ rel: "canonical", href: "/vsat" }],
  }),
  component: () => (
    <VsatPage />
  ),
});