import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";
import { usePrices } from "../../hooks/usePrices";

const PLAN_DAYS = { monthly: 30, quarterly: 90, yearly: 365 };
const PLAN_LABELS = { monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" };

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
        alert("Payment failed. Try again.");
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
            alert(
              `✅ Payment Successful!\nMembership valid till: ${result.expiresAt}`
            );
            window.location.reload();
          } else {
            alert("Payment verification failed!");
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
      alert("Something went wrong!");
      setPayingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      <h1 className="text-2xl font-black text-white mb-1">My Payments</h1>
      <p className="text-slate-400 text-sm mb-4">
        All transactions for your membership
      </p>

      {/* Current Plan Card */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          Current Plan
        </p>
        <p className="text-white font-black text-lg mt-1 capitalize">
          {member?.plan} Plan
        </p>
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full
            ${
              member?.status === "active"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {member?.status === "active" ? "✓ Active" : "⚠️ Expired"}
          </span>
          <span className="text-slate-300 text-xs">
            Expires:{" "}
            {new Date(member?.expires_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Renew Membership */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Renew Membership
      </p>
      <div className="space-y-2.5 mb-6">
        {pricesLoading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[92px] bg-[#1a1a2e] border border-white/7 rounded-2xl animate-pulse"
              />
            ))
          : plans.map((p) => {
              const savings =
                p.plan === "monthly"
                  ? 0
                  : Math.round((1 - p.perDay / monthlyPerDay) * 100);
              const isBestValue = p.plan === bestValuePlan && savings > 0;
              const isPaying = payingPlan === p.plan;

              return (
                <button
                  key={p.plan}
                  onClick={() => handleRazorpayPayment(p.plan)}
                  disabled={payingPlan !== null}
                  className={`w-full text-left rounded-2xl p-4 border transition-all disabled:opacity-60
                    ${
                      isBestValue
                        ? "bg-gradient-to-br from-purple-900/50 to-purple-700/20 border-purple-500/50"
                        : "bg-[#1a1a2e] border-white/7"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-black text-base">
                          {p.label}
                        </p>
                        {isBestValue && (
                          <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                            BEST VALUE
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {p.days} days access
                      </p>
                      {savings > 0 && (
                        <p className="text-green-400 text-xs font-bold mt-1">
                          Save {savings}% vs monthly
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-black text-xl tracking-tight">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        ≈ ₹{Math.round(p.perDay)}/day
                      </p>
                    </div>
                  </div>
                  <div
                    className={`mt-3 text-center font-bold text-sm py-2 rounded-xl
                    ${isPaying ? "bg-purple-800 text-purple-200" : "bg-purple-600 text-white"}`}
                  >
                    {isPaying ? "⏳ Opening checkout..." : "Pay Now →"}
                  </div>
                </button>
              );
            })}
      </div>

      {/* Total Paid */}
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl p-4 mb-4 text-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          Total Paid Since Joining
        </p>
        <p className="text-purple-400 text-3xl font-black mt-1 tracking-tight">
          ₹{totalPaid.toLocaleString("en-IN")}
        </p>
        <p className="text-slate-500 text-xs mt-1">
          {payments.length} payments · Member since{" "}
          {new Date(member?.joined_at).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Payment History */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
        Payment History
      </p>
      {payments.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No payments found
        </div>
      ) : (
        <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0
                ${p.method === "upi" ? "bg-purple-600/20" : "bg-green-500/20"}`}
              >
                {p.method === "upi" ? "📱" : "💵"}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-bold capitalize">
                  {p.method} Payment
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {new Date(p.paid_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {p.plan}
                  {p.upi_ref && ` · ${p.upi_ref}`}
                </p>
              </div>
              <p className="text-green-400 font-black text-sm">
                ₹{p.amount.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Payments;
