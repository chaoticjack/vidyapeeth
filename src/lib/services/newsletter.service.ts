import { getAdminDb } from "@/lib/firebase-admin";
import { dispatchNewsletterWelcome } from "./notification.service";

export interface NewsletterSubscriber {
  email: string;
  name?: string;
  status: "pending" | "active" | "unsubscribed" | "bounced";
  source: "homepage" | "blog" | "footer" | "popup" | "manual";
  tags: string[];
  subscribedAt: Date;
  lastEmailSent?: Date;
  id?: string;
}

/**
 * Service to handle Newsletter and Subscription Logic
 */
export async function subscribeToNewsletter(
  email: string, 
  source: NewsletterSubscriber["source"] = "homepage", 
  tags: string[] = []
): Promise<{ success: boolean; message: string }> {
  try {
    const adminDb = getAdminDb();
    
    // Check for existing
    const existingSnap = await adminDb.collection("newsletterSubscribers").where("email", "==", email).get();
    
    if (!existingSnap.empty) {
      const existingDoc = existingSnap.docs[0];
      const data = existingDoc.data() as NewsletterSubscriber;
      
      if (data.status === "active") {
        return { success: false, message: "You are already subscribed!" };
      } else {
        // Re-subscribe
        await existingDoc.ref.update({
          status: "active",
          source,
          tags: Array.from(new Set([...(data.tags || []), ...tags])),
          subscribedAt: new Date()
        });
        
        await dispatchNewsletterWelcome(email);
        return { success: true, message: "Welcome back! You have been re-subscribed." };
      }
    }
    
    // New Subscription
    const newSub: NewsletterSubscriber = {
      email,
      status: "active", // In a double-opt-in setup, this would be 'pending'
      source,
      tags,
      subscribedAt: new Date(),
    };
    
    await adminDb.collection("newsletterSubscribers").add(newSub);
    
    // Send Welcome Email asynchronously
    dispatchNewsletterWelcome(email).catch(console.error);
    
    return { success: true, message: "Successfully subscribed to the newsletter!" };
  } catch (err: any) {
    console.error("Newsletter Subscription Error:", err);
    return { success: false, message: "An error occurred. Please try again later." };
  }
}

/**
 * Unsubscribe user
 */
export async function unsubscribeFromNewsletter(email: string): Promise<{ success: boolean }> {
  try {
    const adminDb = getAdminDb();
    const existingSnap = await adminDb.collection("newsletterSubscribers").where("email", "==", email).get();
    
    if (!existingSnap.empty) {
      await existingSnap.docs[0].ref.update({
        status: "unsubscribed",
        unsubscribedAt: new Date()
      });
    }
    return { success: true };
  } catch (err) {
    console.error("Unsubscribe Error:", err);
    return { success: false };
  }
}
