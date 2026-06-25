import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";
import { getAdminDb } from "../../../lib/firebase-admin";

export const Route = createFileRoute("/api/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }: any) => {
        try {
          const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
          if (!webhookSecret) {
            return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const signature = request.headers.get("x-razorpay-signature");
          if (!signature) {
            return new Response(JSON.stringify({ error: "Missing signature" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Read the raw body as text for signature verification
          const rawBody = await request.text();

          const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex");

          if (expectedSignature !== signature) {
            return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const event = JSON.parse(rawBody);
          const db = getAdminDb();

          // Handle the event
          if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;
            
            if (orderId) {
              const orderRef = db.collection("orders").doc(orderId);
              const orderSnap = await orderRef.get();
              
              if (orderSnap.exists) {
                const orderData = orderSnap.data();
                // If the frontend verify route didn't update it yet, update it here
                if (orderData?.status === "created") {
                  await orderRef.update({
                    status: "paid",
                    razorpayPaymentId: payment.id,
                    paidAt: new Date(),
                  });
                  
                  // Note: We don't create enrollment here automatically because we lack 
                  // the studentName, classLevel etc. The frontend verify route handles that.
                  // Webhook is mainly a fallback to ensure the order is marked paid.
                }
              }
            }
          } else if (event.event === "payment.failed") {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;
            
            if (orderId) {
              const orderRef = db.collection("orders").doc(orderId);
              await orderRef.update({
                status: "failed",
                errorDescription: payment.error_description || "Payment failed",
              });
            }
          } else if (event.event === "refund.processed") {
            const refund = event.payload.refund.entity;
            const paymentId = refund.payment_id;
            
            if (paymentId) {
              // Find order by payment ID
              const ordersQuery = await db.collection("orders")
                .where("razorpayPaymentId", "==", paymentId)
                .get();
                
              if (!ordersQuery.empty) {
                const orderDoc = ordersQuery.docs[0];
                await orderDoc.ref.update({
                  status: "refunded",
                  refundId: refund.id,
                  refundedAt: new Date(),
                });
              }
            }
          }

          return new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error("Webhook Error:", error);
          return new Response(
            JSON.stringify({ error: error.message || "Webhook handler failed" }),
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
