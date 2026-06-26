export const siteUrl = "https://vidyapeeth.in"; // Replace with actual production domain

export function getSeoMeta(title: string, description: string, path: string) {
  const url = `${siteUrl}${path}`;
  return [
    { title: `${title} | Vidyapeeth` },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Vidyapeeth" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "robots", content: "index, follow" },
  ];
}

export function getCanonicalLink(path: string) {
  return { rel: "canonical", href: `${siteUrl}${path}` };
}
