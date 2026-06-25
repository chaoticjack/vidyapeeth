import { createFileRoute, useNavigate, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { COURSES_DATA } from "@/data/courses";
import { useAuth } from "@/hooks/use-auth";
import { enrollCourse, checkIsEnrolled } from "@/lib/firestore";
import { logActivity } from "@/lib/activity-logger";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, ChevronRight, Home, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/enroll/$courseId")({
  loader: ({ params }) => {
    const course = COURSES_DATA[params.courseId];
    if (!course) {
      throw notFound();
    }
    return { course, courseId: params.courseId };
  },
  component: EnrollCoursePage,
});

function EnrollCoursePage() {
  const { course, courseId } = Route.useLoaderData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [batchTiming, setBatchTiming] = useState<"morning" | "evening">("evening");
  const [studentName, setStudentName] = useState(user?.fullName || "");
  const [classLevel, setClassLevel] = useState(user?.classLevel || "");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Form submission opens payment modal
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPaymentModal(true);
  };

  // Dynamically load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentAndEnroll = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      // 0. Check if already enrolled
      const isEnrolled = await checkIsEnrolled(user.id, courseId);
      if (isEnrolled) {
        toast.error("You are already enrolled in this course.");
        setIsProcessing(false);
        setShowPaymentModal(false);
        return;
      }

      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Failed to load Razorpay SDK. Are you online?");
        setIsProcessing(false);
        return;
      }

      // Parse amount from string like "₹24,999" or "Free"
      let numericAmount = 0;
      if (course.price.toLowerCase() !== "free") {
         numericAmount = Number(course.price.replace(/[^0-9.-]+/g, ""));
      }

      // 1. Create order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          courseName: course.title,
          amount: numericAmount,
          userId: user.id
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Vidyapeeth",
        description: `Enrollment for ${course.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
                userId: user.id,
                studentName,
                classLevel,
                batchTiming,
                notes
              })
            });

            const verifyData = await verifyRes.json();
            
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            toast.success("Enrollment successful. Course added to your dashboard.");
            
            await logActivity({
              userId: user.id,
              type: "enrollment",
              title: `Enrolled in ${course.title}`,
              description: `You have successfully enrolled in ${course.title}.`,
              courseId: courseId,
              metadata: { batchTiming, amount: numericAmount }
            });

            setShowPaymentModal(false);
            navigate({ to: "/dashboard" }); // Or wherever the dashboard is
          } catch (err: any) {
            toast.error(err.message || "Enrollment failed after payment.");
            setShowPaymentModal(false);
          }
        },
        prefill: {
          name: studentName || user.fullName,
          email: user.email,
        },
        theme: {
          color: "#0a192f" // navy
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed. Please try again.");
        setIsProcessing(false);
        setShowPaymentModal(false);
      });
      
      paymentObject.open();
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize payment. Please try again.");
      setShowPaymentModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24 md:pt-36">
      <div className="mx-auto max-w-4xl px-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-ink/50">
          <Link to="/" className="hover:text-navy transition-colors"><Home size={14} /></Link>
          <ChevronRight size={14} className="opacity-50" />
          <Link to="/courses" className="hover:text-navy transition-colors">Courses</Link>
          <ChevronRight size={14} className="opacity-50" />
          <span className="text-navy">Enroll</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-5">
          
          {/* Enrollment Form Area */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h1 className="font-display text-4xl font-black text-navy md:text-5xl">Complete Enrollment</h1>
              <p className="mt-2 text-ink/70">You are just one step away from joining {course.title}.</p>
            </div>

            <form onSubmit={handleProceedToPayment} className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-navy">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-navy">Class Level</label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  required
                  className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                >
                  <option value="" disabled>Select Class</option>
                  {[6, 7, 8, 9, 10, 11, 12].map((level) => (
                    <option key={level} value={level.toString()}>Class {level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-navy">Preferred Batch Timing</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-center transition-colors ${batchTiming === 'morning' ? 'border-saffron bg-saffron/5 text-saffron' : 'border-navy/10 hover:bg-navy/5 text-navy'}`}>
                    <input type="radio" name="batch" className="hidden" checked={batchTiming === 'morning'} onChange={() => setBatchTiming('morning')} />
                    <span className="text-sm font-bold">Morning Batch</span>
                    <span className="block text-xs opacity-70">8:00 AM - 11:00 AM</span>
                  </label>
                  <label className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-center transition-colors ${batchTiming === 'evening' ? 'border-saffron bg-saffron/5 text-saffron' : 'border-navy/10 hover:bg-navy/5 text-navy'}`}>
                    <input type="radio" name="batch" className="hidden" checked={batchTiming === 'evening'} onChange={() => setBatchTiming('evening')} />
                    <span className="text-sm font-bold">Evening Batch</span>
                    <span className="block text-xs opacity-70">5:00 PM - 8:00 PM</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-navy">Additional Notes / Questions (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific focus areas or questions for the mentor?"
                  className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-saffron focus:ring-1 focus:ring-saffron min-h-[100px]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-saffron py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-1 hover:shadow-lg mt-4"
              >
                Proceed to Payment
              </button>
            </form>
          </div>

          {/* Course Summary Sidebar */}
          <div className="md:col-span-2">
            <div className="sticky top-24 rounded-3xl border border-navy/10 bg-navy p-6 text-cream shadow-xl">
              <h3 className="font-display text-xl font-bold mb-4">Course Summary</h3>
              
              <div className="mb-6 rounded-2xl bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-saffron mb-1">{course.grade}</p>
                <p className="font-display text-lg font-bold leading-tight mb-2">{course.title}</p>
                <div className="flex items-center gap-1.5 text-xs opacity-80">
                  <BookOpen size={14} />
                  <span>{course.syllabus.length} Core Subjects</span>
                </div>
              </div>

              <div className="space-y-3 border-b border-cream/10 pb-6 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Duration</span>
                  <span className="font-semibold">{course.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Batch Size</span>
                  <span className="font-semibold">{course.batchSize}</span>
                </div>
              </div>

              <div className="flex items-end justify-between mb-2">
                <span className="text-sm opacity-70">Total Fee</span>
                <div className="text-right">
                  <p className="text-xs line-through opacity-50">{course.original}</p>
                  <p className="font-display text-2xl font-black text-saffron">{course.price}</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400">
                <CheckCircle2 size={16} /> 30-day money-back guarantee
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-saffron/10 text-saffron mx-auto">
              <CreditCard size={32} />
            </div>
            <h3 className="text-center font-display text-2xl font-bold text-navy mb-2">Secure Checkout</h3>
            <p className="text-center text-sm text-ink/70 mb-6">You are paying for {course.title}</p>
            
            <div className="rounded-xl bg-navy/5 p-4 mb-6">
              <div className="flex justify-between items-center text-navy font-bold text-lg">
                <span>Total Amount:</span>
                <span>{course.price}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePaymentAndEnroll}
                disabled={isProcessing}
                className="w-full rounded-xl bg-navy py-3.5 text-sm font-bold text-white transition-colors hover:bg-navy/90 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isProcessing ? (
                  <>Processing Payment...</>
                ) : (
                  <>Pay {course.price} & Enroll</>
                )}
              </button>
              <button
                onClick={() => !isProcessing && setShowPaymentModal(false)}
                disabled={isProcessing}
                className="w-full rounded-xl border border-navy/20 py-3.5 text-sm font-bold text-navy transition-colors hover:bg-navy/5 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
