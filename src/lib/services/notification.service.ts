import { getAdminDb } from "@/lib/firebase-admin";
import { sendEmail } from "./email.service";
import { emailTemplates } from "./template.service";

/**
 * Creates an in-app notification for the Admin.
 */
export async function notifyAdmin(title: string, message: string, type: "demo" | "vsat" | "contact" | "newsletter" | "blog" | "enrollment", relatedId?: string) {
  try {
    const adminDb = getAdminDb();
    await adminDb.collection("adminNotifications").add({
      title,
      message,
      type,
      relatedId,
      read: false,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Failed to create admin notification:", err);
  }
}

/**
 * Dispatches a Demo Booking Notification
 */
export async function dispatchDemoBooking(data: any) {
  // 1. Notify User via Email
  const userHtml = emailTemplates.demoBookingUser(data.studentName);
  // We use Promise.allSettled so this doesn't strictly block execution if one fails
  Promise.allSettled([
    sendEmail({
      to: data.email,
      subject: "Your Demo Class is Booked! — Vidyapeeth",
      html: userHtml,
      tags: [{ name: "type", value: "demo-user" }]
    }),
    
    // 2. Notify Admin via Email
    sendEmail({
      to: "hello@vidyapeeth.in", // Send to your primary admin inbox
      subject: `New Demo Booking: ${data.studentName}`,
      html: emailTemplates.demoBookingAdmin(data),
      tags: [{ name: "type", value: "demo-admin" }]
    }),

    // 3. Notify Admin in-app
    notifyAdmin(
      "New Demo Booking",
      `${data.studentName} (${data.classLevel}) has booked a demo.`,
      "demo"
    )
  ]).catch(console.error);
}

/**
 * Dispatches Contact Auto Reply
 */
export async function dispatchContactMessage(data: any) {
  Promise.allSettled([
    sendEmail({
      to: data.email,
      subject: "We received your message — Vidyapeeth",
      html: emailTemplates.contactAutoReply(data.name),
      tags: [{ name: "type", value: "contact-auto-reply" }]
    }),
    notifyAdmin(
      "New Contact Message",
      `Message from ${data.name}: ${data.subject || 'General Inquiry'}`,
      "contact"
    )
  ]).catch(console.error);
}

/**
 * Dispatches VSAT Registration
 */
export async function dispatchVsatRegistration(data: any) {
  Promise.allSettled([
    // Notify admin
    sendEmail({
      to: "hello@vidyapeeth.in",
      subject: `New VSAT Registration: ${data.studentName}`,
      html: emailTemplates.vsatRegistrationAdmin(data),
      tags: [{ name: "type", value: "vsat-admin" }]
    }),
    notifyAdmin(
      "New VSAT Registration",
      `${data.studentName} (${data.classLevel}) registered for VSAT.`,
      "vsat"
    )
  ]).catch(console.error);
}

/**
 * Dispatches Newsletter Welcome
 */
export async function dispatchNewsletterWelcome(email: string) {
  Promise.allSettled([
    sendEmail({
      to: email,
      subject: "Welcome to Vidyapeeth!",
      html: emailTemplates.newsletterWelcome(),
      tags: [{ name: "type", value: "newsletter-welcome" }]
    }),
    notifyAdmin(
      "New Newsletter Subscriber",
      `${email} subscribed to the newsletter.`,
      "newsletter"
    )
  ]).catch(console.error);
}

/**
 * Dispatches Blog Published Email (to subscribers)
 * This acts as our "Queue" simulator by fetching subscribers and mapping them.
 */
export async function dispatchBlogPublished(blogId: string, title: string, excerpt: string, slug: string, imageUrl?: string) {
  try {
    const adminDb = getAdminDb();
    const snap = await adminDb.collection("newsletterSubscribers").where("status", "==", "active").get();
    
    if (snap.empty) return;
    
    const html = emailTemplates.blogPublished(title, excerpt, slug, imageUrl);
    
    // In a real message queue (RabbitMQ/SQS), we would push to the queue.
    // For Vercel Serverless, we process in a lightweight Promise.all
    // Resend supports bulk emails, but their standard SDK uses loops for individual tracking.
    const emails = snap.docs.map(doc => doc.data().email);
    
    for (const email of emails) {
      // Fire and forget individual emails
      sendEmail({
        to: email,
        subject: `New Post: ${title}`,
        html,
        tags: [{ name: "type", value: "blog-publish" }]
      }).catch(console.error);
    }
    
    await notifyAdmin(
      "Blog Newsletter Sent",
      `Sent to ${emails.length} subscribers for "${title}".`,
      "blog",
      blogId
    );
  } catch (err) {
    console.error("Failed to dispatch blog published notification", err);
  }
}
