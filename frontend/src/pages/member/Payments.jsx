import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";

function Payments() {
  const user = useAuthStore((state) => state.user);
  const [payments, setPayments] = useState([]);
  const [member, setMember] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    const { data: memberData } = await supabase
      .from("members")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*")
      .eq("member_id", user.id)
      .order("paid_at", { ascending: false });

    const { data: owner } = await supabase
      .from("owner")
      .select("upi_qr_url, upi_id, gym_name")
      .single();

    if (memberData) setMember(memberData);
    if (paymentsData) setPayments(paymentsData);
    if (owner) setOwnerData(owner);
    setLoading(false);
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleRazorpayPayment = async (plan, amount) => {
    try {
      // Step 1 — Order create karo
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, memberId: user.id, plan }),
        }
      );
      const order = await res.json();

      if (!order.success) {
        alert("Payment failed. Try again.");
        return;
      }

      // Step 2 — Razorpay checkout open karo
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: "BS Fitness",
        description: `${plan} Membership`,
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
                memberId: user.id,
                plan,
                amount,
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
          }
        },

        modal: {
          ondismiss: () => {
            console.log("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log("Payment error:", err);
      alert("Something went wrong!");
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
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
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
      <div className="space-y-2 mb-4">
        {[
          { plan: "monthly", label: "Monthly", amount: 1500, duration: "30 days" },
          { plan: "quarterly", label: "Quarterly", amount: 4000, duration: "90 days" },
          { plan: "yearly", label: "Yearly", amount: 15000, duration: "365 days" },
        ].map((p) => (
          <button
            key={p.plan}
            onClick={() => handleRazorpayPayment(p.plan, p.amount)}
            className="w-full bg-[#1a1a2e] border border-white/7 rounded-xl p-4 flex justify-between items-center"
          >
            <div className="text-left">
              <p className="text-white font-black text-sm">{p.label}</p>
              <p className="text-slate-400 text-xs">{p.duration}</p>
            </div>
            <div className="text-right">
              <p className="text-purple-400 font-black">
                ₹{p.amount.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-500">Pay Now →</p>
            </div>
          </button>
        ))}
      </div>

      {/* QR Code */}
      {ownerData?.upi_qr_url && (
        <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-4 mb-4 text-center">
          <p className="text-white font-black text-sm mb-1">💳 Pay via UPI</p>
          <p className="text-slate-400 text-xs mb-3">
            Scan QR to renew your membership
          </p>
          <img
            src={ownerData.upi_qr_url}
            alt="UPI QR"
            className="w-48 h-48 object-contain bg-white rounded-xl p-2 mx-auto"
          />
          {ownerData.upi_id && (
            <div className="mt-3 bg-[#0d0d14] rounded-xl px-4 py-2 inline-block">
              <p className="text-slate-400 text-xs">UPI ID</p>
              <p className="text-white font-bold text-sm">{ownerData.upi_id}</p>
            </div>
          )}
          <p className="text-slate-500 text-xs mt-3">
            After payment — share transaction ID with gym owner
          </p>
        </div>
      )}

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
