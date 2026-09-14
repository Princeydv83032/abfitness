import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";
import { usePrices } from "../../hooks/usePrices";
import { toast } from "../../lib/toast";
import {
  FiSmartphone,
  FiCreditCard,
  FiCalendar,
  FiClock,
  FiStar,
  FiChevronRight,
} from "react-icons/fi";
import {
  IoCashOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoRibbonOutline,
  IoWalletOutline,
} from "react-icons/io5";

const PLAN_DAYS = { monthly: 30, quarterly: 90, yearly: 365 };
const PLAN_LABELS = { monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };
const PLAN_ICONS = { monthly: FiCalendar, quarterly: FiClock, yearly: IoRibbonOutline };

// Data fetch hone tak asli layout ke shape ka skeleton
function PaymentsSkeleton() {
  const pulse = "bg-white/5 animate-pulse rounded-xl";
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-20">
      <div className={`h-7 w-40 mb-1.5 ${pulse}`} />
      <div className={`h-4 w-52 mb-4 ${pulse}`} />
      <div className={`h-24 mb-5 rounded-2xl ${pulse}`} />
      <div className={`h-4 w-36 mb-2 ${pulse}`} />
      <div className="space-y-2.5 mb-6">
        <div className={`h-24 rounded-2xl ${pulse}`} />
        <div className={`h-24 rounded-2xl ${pulse}`} />
        <div className={`h-24 rounded-2xl ${pulse}`} />
      </div>
      <div className={`h-24 mb-4 rounded-2xl ${pulse}`} />
      <div className={`h-40 rounded-2xl ${pulse}`} />
    </div>
  );
}

function Payments() {
  const user = useAuthStore((state) => state.user);
  const [payments, setPayments] = useState([]);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingPlan, setPayingPlan] = useState(null);
  const { prices, loading: pricesLoading } = usePrices();

  const fetchData = async () => {
    setLoading(true);

    const memberRes = await apiFetch("/api/members/me");
    const memberData = memberRes.success ? memberRes.member : null;

    // payments table RLS-locked hai (koi bhi anon key se sabka payment
    // history nahi padh sake) - backend Firebase token verify karke
    // sirf apna history deta hai
    const paymentsRes = await apiFetch("/api/payment/my-history");

    if (memberData) setMember(memberData);
    if (paymentsRes.success) setPayments(paymentsRes.payments);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) return;
    queueMicrotask(fetchData);
  }, [user]);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  // Renewal plans, sabse sasta per-day rate wala "Best Value" badge paata hai
  const plans = Object.keys(PLAN_DAYS).map((plan) => {
    const amount = prices[plan];
    const days = PLAN_DAYS[plan];
    return { plan, label: PLAN_LABELS[plan], amount, days, perDay: amount / days };
  });
  const monthlyPerDay = plans.find((p) => p.plan === "monthly")?.perDay || 0;
  const bestValuePlan = plans.reduce(
    (best, p) => (p.perDay < best.perDay ? p : best),
    plans[0],
  ).plan;

  const handleRazorpayPayment = async (plan) => {
    setPayingPlan(plan);
    try {
      // Step 1 — Order create karo — amount yahan se nahi bhejte, backend
      // khud owner ke set kiye fees se calculate karta hai. memberId bhi
      // nahi bhejte - backend Firebase token se khud verify karta hai
      const order = await apiFetch("/api/payment/create-order", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });

      if (!order.success) {
        toast.error("Payment failed. Try again.");
        setPayingPlan(null);
        return;
      }

      // Step 2 — Razorpay checkout open karo
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: "AB Fitness",
        description: `${PLAN_LABELS[plan]} Membership`,
        order_id: order.orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: "#7c3aed" },

        handler: async (response) => {
          // Step 3 — Payment verify karo
          const verifyRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/payment/verify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );
          const result = await verifyRes.json();

          if (result.success) {
            toast.success(
              `Payment successful! Membership valid till ${result.expiresAt}`,
            );
            window.location.reload();
          } else {
            toast.error("Payment verification failed!");
            setPayingPlan(null);
          }
        },

        modal: {
          ondismiss: () => {
            console.log("Payment cancelled");
            setPayingPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log("Payment error:", err);
      toast.error("Something went wrong!");
      setPayingPlan(null);
    }
  };

  if (loading) {
    return <PaymentsSkeleton />;
  }

  const isActive = member?.status === "active";

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-20">
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
        My Payments
      </h1>
      <p className="text-slate-500 text-sm mb-4">
        All transactions for your membership
      </p>

      {/* Current Plan Card */}
      <div className="rounded-2xl p-4 mb-5 bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 border border-violet-400/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <IoWalletOutline size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
              Current Plan
            </p>
            <p className="text-white font-extrabold text-lg leading-tight mt-0.5 capitalize">
              {member?.plan} Plan
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
              isActive
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {isActive ? (
              <IoCheckmarkCircle size={11} />
            ) : (
              <IoAlertCircleOutline size={11} />
            )}
            {isActive ? "Active" : "Expired"}
          </span>
          <span className="text-white/60 text-xs">
            Expires{" "}
            {member?.expires_at
              ? new Date(member.expires_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "--"}
          </span>
        </div>
      </div>

      {/* Renew Membership */}
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">
        Renew Membership
      </p>
      <div className="space-y-2.5 mb-6">
        {pricesLoading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-[#1a1a2e] border border-white/7 rounded-2xl animate-pulse"
              />
            ))
          : plans.map((p) => {
              const savings =
                p.plan === "monthly"
                  ? 0
                  : Math.round((1 - p.perDay / monthlyPerDay) * 100);
              const isBestValue = p.plan === bestValuePlan && savings > 0;
              const isPaying = payingPlan === p.plan;
              const PlanIcon = PLAN_ICONS[p.plan];

              return (
                <button
                  key={p.plan}
                  onClick={() => handleRazorpayPayment(p.plan)}
                  disabled={payingPlan !== null}
                  className={`w-full text-left rounded-2xl p-4 border transition-all disabled:opacity-60 ${
                    isBestValue
                      ? "bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 border-violet-400/30"
                      : "bg-[#1a1a2e] border-white/7"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isBestValue
                            ? "bg-white/15 text-white"
                            : "bg-violet-500/15 text-violet-400"
                        }`}
                      >
                        <PlanIcon size={19} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-white font-extrabold text-base">
                            {p.label}
                          </p>
                          {isBestValue && (
                            <span className="flex items-center gap-1 text-[9px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                              <FiStar size={9} /> BEST VALUE
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${isBestValue ? "text-white/70" : "text-slate-400"}`}
                        >
                          {p.days} days access
                        </p>
                        {savings > 0 && (
                          <p
                            className={`text-xs font-bold mt-1 ${isBestValue ? "text-emerald-300" : "text-emerald-400"}`}
                          >
                            Save {savings}% vs monthly
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-extrabold text-xl tracking-tight">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </p>
                      <p
                        className={`text-[11px] ${isBestValue ? "text-white/60" : "text-slate-500"}`}
                      >
                        ≈ ₹{Math.round(p.perDay)}/day
                      </p>
                    </div>
                  </div>
                  <div
                    className={`mt-3 flex items-center justify-center gap-1.5 font-bold text-sm py-2.5 rounded-xl transition-colors ${
                      isPaying
                        ? "bg-black/20 text-white/60"
                        : isBestValue
                          ? "bg-white text-violet-700"
                          : "bg-violet-600 text-white"
                    }`}
                  >
                    {isPaying ? (
                      "Opening checkout..."
                    ) : (
                      <>
                        Pay Now <FiChevronRight size={14} />
                      </>
                    )}
                  </div>
                </button>
              );
            })}
      </div>

      {/* Total Paid */}
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-4 mb-4 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
          <IoWalletOutline size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            Total Paid Since Joining
          </p>
          <p className="text-white text-2xl font-extrabold mt-0.5 tracking-tight">
            ₹{totalPaid.toLocaleString("en-IN")}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            {payments.length} payments · Member since{" "}
            {member?.joined_at
              ? new Date(member.joined_at).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })
              : "--"}
          </p>
        </div>
      </div>

      {/* Payment History */}
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">
        Payment History
      </p>
      {payments.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No payments found
        </div>
      ) : (
        <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl divide-y divide-white/5">
          {payments.map((p) => {
            const MethodIcon =
              p.method === "upi"
                ? FiSmartphone
                : p.method === "razorpay"
                  ? FiCreditCard
                  : IoCashOutline;
            const methodColor =
              p.method === "upi"
                ? "bg-blue-500/15 text-blue-400"
                : p.method === "razorpay"
                  ? "bg-violet-500/15 text-violet-400"
                  : "bg-emerald-500/15 text-emerald-400";

            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${methodColor}`}
                >
                  <MethodIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold capitalize">
                    {p.method} Payment
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">
                    {new Date(p.paid_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {p.plan}
                    {p.upi_ref && ` · ${p.upi_ref}`}
                  </p>
                </div>
                <p className="text-emerald-400 font-extrabold text-sm flex-shrink-0">
                  ₹{p.amount.toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Payments;
