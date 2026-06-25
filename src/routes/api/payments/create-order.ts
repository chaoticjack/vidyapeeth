import { createFileRoute } from "@tanstack/react-router";
import Razorpay from "razorpay";
import { getAdminDb } from "../../../lib/firebase-admin";

export const Route = createFileRoute("/api/payments/create-order")({
  server: {
    handlers: {
      POST: async ({ request }: any) => {
        try {
          const body = await request.json();
          const { courseId, courseName, amount, userId } = body;

          if (!courseId || !amount || !userId) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return new Response(JSON.stringify({ error: "Razorpay keys not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });

          // Create Razorpay order
          const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${userId.substring(0, 5)}`,
          };

          const order = await razorpay.orders.create(options);

          // Save order to Firestore
          const db = getAdminDb();
          const orderRef = db.collection("orders").doc(order.id);
          
          await orderRef.set({
            userId,
            courseId,
            courseName: courseName || courseId,
            amount,
            currency: "INR",
            razorpayOrderId: order.id,
            razorpayPaymentId: null,
            razorpaySignature: null,
            status: "created",
            createdAt: new Date(),
            paidAt: null,
          });

          return new Response(
            JSON.stringify({
              orderId: order.id,
              amount: order.amount,
              currency: order.currency,
              key: process.env.RAZORPAY_KEY_ID,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (error: any) {
          console.error("Error creating order:", error);
          return new Response(
            JSON.stringify({ error: error.message || "Failed to create order" }),
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
