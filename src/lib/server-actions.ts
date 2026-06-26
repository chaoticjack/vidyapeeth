import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { 
  dispatchDemoBooking, 
  dispatchContactMessage, 
  dispatchVsatRegistration,
  dispatchBlogPublished
} from "./services/notification.service";
import { subscribeToNewsletter } from "./services/newsletter.service";

export const sendDemoNotification = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    // Fire and forget
    dispatchDemoBooking(data).catch(console.error);
    return { success: true };
  });

export const sendContactNotification = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    dispatchContactMessage(data).catch(console.error);
    return { success: true };
  });

export const sendVsatNotification = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    dispatchVsatRegistration(data).catch(console.error);
    return { success: true };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), source: z.any().optional(), tags: z.array(z.string()).optional() }))
  .handler(async ({ data }) => {
    return await subscribeToNewsletter(data.email, data.source || "homepage", data.tags || []);
  });

export const sendBlogPublishedNotification = createServerFn({ method: "POST" })
  .validator((data: { blogId: string, title: string, excerpt: string, slug: string, imageUrl?: string }) => data)
  .handler(async ({ data }) => {
    dispatchBlogPublished(data.blogId, data.title, data.excerpt, data.slug, data.imageUrl).catch(console.error);
    return { success: true };
  });
