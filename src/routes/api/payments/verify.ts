import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";
import { getAdminDb } from "../../../lib/firebase-admin";

export const Route = createFileRoute("/api/payments/verify")({
  server: {
    handlers: {
      POST: async ({ request }: any) => {
        try {
          const body = await request.json();
          const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            courseId,
            userId,
            studentName,
            classLevel,
            batchTiming,
            notes
          } = body;

          if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId || !userId) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const secret = process.env.RAZORPAY_KEY_SECRET;
          if (!secret) {
            return new Response(JSON.stringify({ error: "Server configuration error" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Verify the signature
          const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

          if (generated_signature !== razorpay_signature) {
            return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const db = getAdminDb();
          const batch = db.batch();

          // 1. Update Order status
          const orderRef = db.collection("orders").doc(razorpay_order_id);
          batch.update(orderRef, {
            status: "paid",
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            paidAt: new Date(),
          });

          // 2. Create Enrollment
          // Check for duplicate first (though the frontend should check, backend must enforce)
          const existingEnrollments = await db.collection("enrollments")
            .where("userId", "==", userId)
            .where("courseId", "==", courseId)
            .where("status", "==", "active")
            .get();

          if (!existingEnrollments.empty) {
            return new Response(JSON.stringify({ error: "Already enrolled in this course" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const enrollmentRef = db.collection("enrollments").doc();
          batch.set(enrollmentRef, {
            userId,
            courseId,
            studentName: studentName || "Unknown",
            classLevel: classLevel || "",
            batchTiming: batchTiming || "morning",
            notes: notes || "",
            status: "active",
            enrolledAt: new Date(),
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
          });

          // 3. Create Activity Log
          const activityRef = db.collection("activities").doc();
          batch.set(activityRef, {
            userId,
            type: "enrollment",
            text: "Enrolled in course",
            courseId,
            timestamp: new Date(),
          });

          await batch.commit();

          return new Response(JSON.stringify({ success: true, enrollmentId: enrollmentRef.id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error("Error verifying payment:", error);
          return new Response(
            JSON.stringify({ error: error.message || "Failed to verify payment" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
    }
  }
});
