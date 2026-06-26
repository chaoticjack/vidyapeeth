import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";

const resendApiKey = process.env.RESEND_API_KEY;
let resend: Resend | null = null;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
} else {
  console.warn("RESEND_API_KEY is not set. Emails will not be sent.");
}

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailLog {
  recipient: string | string[];
  subject: string;
  provider: string;
  status: "sent" | "failed";
  error?: string;
  createdAt: Date;
  id?: string;
}

/**
 * Abstraction layer for sending emails.
 * Supports Resend, but architected to support others like AWS SES or SendGrid.
 */
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string; id?: string }> {
  if (!resend) {
    const errorMsg = "Email provider not configured (Missing RESEND_API_KEY).";
    await logEmailToFirestore({ ...payload, status: "failed", error: errorMsg, provider: "none" });
    return { success: false, error: errorMsg };
  }

  const from = payload.from || "Vidyapeeth <hello@vidyapeeth.in>"; // Replace with verified domain

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      replyTo: payload.replyTo,
      tags: payload.tags,
    });

    if (error) {
      console.error("Resend Error:", error);
      await logEmailToFirestore({ ...payload, status: "failed", error: error.message, provider: "resend" });
      return { success: false, error: error.message };
    }

    await logEmailToFirestore({ ...payload, status: "sent", id: data?.id, provider: "resend" });
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("Failed to send email:", err);
    await logEmailToFirestore({ ...payload, status: "failed", error: err.message, provider: "resend" });
    return { success: false, error: err.message };
  }
}

/**
 * Logs email to Firestore history
 */
async function logEmailToFirestore(data: EmailPayload & { status: "sent" | "failed"; error?: string; id?: string; provider: string }) {
  try {
    const adminDb = getAdminDb();
    const log: EmailLog = {
      recipient: data.to,
      subject: data.subject,
      provider: data.provider,
      status: data.status,
      error: data.error,
      id: data.id,
      createdAt: new Date(),
    };
    await adminDb.collection("emailLogs").add(log);
  } catch (e) {
    console.error("Failed to log email to Firestore", e);
  }
}
