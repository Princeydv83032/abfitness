import { useState } from "react";
import { useNavigate } from "react-router-dom";

const payments = [
  {
    id: 1,
    name: "Rahul Sharma",
    memberId: "GYM-0042",
    type: "UPI",
    amount: 1500,
    date: "18 Jul 2026",
    ref: "TXN8821047",
    plan: "Monthly",
  },
  {
    id: 2,
    name: "Sanjay Mehta",
    memberId: "GYM-0011",
    type: "Cash",
    amount: 1500,
    date: "17 Jul 2026",
    ref: null,
    plan: "Monthly",
  },
  {
    id: 3,
    name: "Kavita Nair",
    memberId: "GYM-0023",
    type: "UPI",
    amount: 4000,
    date: "17 Jul 2026",
    ref: "TXN7654321",
    plan: "Quarterly",
  },
  {
    id: 4,
    name: "Deepak Joshi",
    memberId: "GYM-0034",
    type: "Cash",
    amount: 1500,
    date: "16 Jul 2026",
    ref: null,
    plan: "Monthly",
  },
  {
    id: 5,
    name: "Anita Roy",
    memberId: "GYM-0056",
    type: "UPI",
    amount: 15000,
    date: "16 Jul 2026",
    ref: "TXN6543210",
    plan: "Yearly",
  },
  {
    id: 6,
    name: "Vikram Shah",
    memberId: "GYM-0006",
    type: "Cash",
    amount: 1500,
    date: "15 Jul 2026",
    ref: null,
    plan: "Monthly",
  },
];

function OwnerPayments() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const filtered = payments.filter((p) =>
    filter === "all" ? true : p.type.toLowerCase() === filter,
  );

  const total = filtered.reduce((sum, p) => sum + p.amount, 0);
  const cash = payments
    .filter((p) => p.type === "Cash")
    .reduce((s, p) => s + p.amount, 0);
  const upi = payments
    .filter((p) => p.type === "UPI")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black text-white">Payments</h1>
        <button
          onClick={() => navigate("/owner/payments/log")}
          className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
        >
          + Log Payment
        </button>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          July 2026 Total
        </p>
        <p className="text-white font-black text-3xl mt-1 tracking-tight">
          ₹{(cash + upi).toLocaleString("en-IN")}
        </p>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/15 rounded-xl p-2">
            <p className="text-purple-200 text-[9px] font-bold uppercase">
              💵 Cash
            </p>
            <p className="text-white font-black text-sm mt-0.5">
              ₹{cash.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-2">
            <p className="text-purple-200 text-[9px] font-bold uppercase">
              📱 UPI
            </p>
            <p className="text-white font-black text-sm mt-0.5">
              ₹{upi.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {["all", "cash", "upi"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border uppercase
              ${
                filter === f
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-[#1a1a2e] border-white/10 text-slate-400"
              }`}
          >
            {f === "all" ? `All (${payments.length})` : f}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Transactions
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0
              ${p.type === "UPI" ? "bg-purple-600/20" : "bg-green-500/20"}`}
            >
              {p.type === "UPI" ? "📱" : "💵"}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-bold">{p.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {p.date} · {p.plan}
                {p.ref && ` · ${p.ref}`}
              </p>
            </div>
            <p className="text-green-400 font-black text-sm">
              ₹{p.amount.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OwnerPayments;
