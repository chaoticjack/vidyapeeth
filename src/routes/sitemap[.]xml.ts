import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getAdminDb } from "../lib/firebase-admin";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "yearly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/courses", changefreq: "weekly", priority: "0.9" },
          { path: "/vsat", changefreq: "monthly", priority: "0.9" },
          { path: "/demo-class", changefreq: "monthly", priority: "0.8" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          { path: "/contact", changefreq: "monthly", priority: "0.5" },
          { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
        ];
        try {
          const adminDb = getAdminDb();
          
          // Fetch Published Blogs
          const blogsSnap = await adminDb
            .collection("blogs")
            .where("published", "==", true)
            .select("slug", "updatedAt", "createdAt")
            .get();
          blogsSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            const slug = data.slug;
            if (slug) {
              entries.push({ 
                path: `/blog/${slug}`, 
                changefreq: "monthly", 
                priority: "0.8",
              });
            }
          });

          // Fetch Active Courses
          const coursesSnap = await adminDb
            .collection("courses")
            .where("status", "==", "active")
            .select("slug", "updatedAt", "createdAt")
            .get();
          coursesSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            const slug = data.slug;
            if (slug) {
              entries.push({ 
                path: `/courses/${slug}`, 
                changefreq: "weekly", 
                priority: "0.9" 
              });
            }
          });

          // Fetch Categories
          const categoriesSnap = await adminDb
            .collection("categories")
            .select("slug")
            .get();
          categoriesSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            const slug = data.slug;
            if (slug) {
              entries.push({ 
                path: `/courses/category/${slug}`, 
                changefreq: "monthly", 
                priority: "0.7" 
              });
            }
          });

        } catch (error) {
          console.error("Failed to generate dynamic sitemap entries:", error);
        }
        const urls = entries
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});