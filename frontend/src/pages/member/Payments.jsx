import useAuthStore from "../../store/authStore";

function Payments() {
  const user = useAuthStore((state) => state.user);

  // Sample data — baad mein Supabase se aayega
  const payments = [
    {
      id: 1,
      type: "UPI",
      amount: 1500,
      date: "18 Jul 2026",
      ref: "TXN8821047",
      plan: "Monthly",
    },
    {
      id: 2,
      type: "Cash",
      amount: 1500,
      date: "18 Jun 2026",
      ref: null,
      plan: "Monthly",
    },
    {
      id: 3,
      type: "UPI",
      amount: 1500,
      date: "18 May 2026",
      ref: "TXN7654321",
      plan: "Monthly",
    },
    {
      id: 4,
      type: "Cash",
      amount: 1500,
      date: "18 Apr 2026",
      ref: null,
      plan: "Monthly",
    },
    {
      id: 5,
      type: "UPI",
      amount: 4000,
      date: "18 Jan 2026",
      ref: "TXN5432100",
      plan: "Quarterly",
    },
  ];

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <h1 className="text-2xl font-black text-white mb-1">My Payments</h1>
      <p className="text-slate-400 text-sm mb-4">
        All transactions for your membership
      </p>

      {/* Current Plan Card */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          Current Plan
        </p>
        <p className="text-white font-black text-lg mt-1">
          {user?.plan || "Monthly"} — ₹1,500
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
            ✓ Active
          </span>
          <span className="text-slate-300 text-xs">18 Jul → 18 Aug 2026</span>
        </div>
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
          {payments.length} payments · Member since Jan 2026
        </p>
      </div>

      {/* Payment History */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
        Payment History
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5">
        {payments.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3">
            {/* Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0
              ${p.type === "UPI" ? "bg-purple-600/20" : "bg-green-500/20"}`}
            >
              {p.type === "UPI" ? "📱" : "💵"}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-white text-sm font-bold">{p.type} Payment</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {p.date} · {p.plan}
                {p.ref && ` · ${p.ref}`}
              </p>
            </div>

            {/* Amount */}
            <p className="text-green-400 font-black text-sm">
              ₹{p.amount.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Payments;
