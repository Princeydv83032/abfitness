import { useState } from "react";
import { useNavigate } from "react-router-dom";

const allMembers = [
  { id: 1, name: "Amit Kumar", memberId: "GYM-0001", plan: "Monthly" },
  { id: 2, name: "Priya Singh", memberId: "GYM-0002", plan: "Monthly" },
  { id: 3, name: "Suresh Rao", memberId: "GYM-0003", plan: "Quarterly" },
  { id: 4, name: "Rohit Kapoor", memberId: "GYM-0004", plan: "Yearly" },
  { id: 5, name: "Meena Verma", memberId: "GYM-0005", plan: "Monthly" },
];

const planPrices = {
  monthly: 1500,
  quarterly: 4000,
  yearly: 15000,
};

function LogPayment() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [plan, setPlan] = useState("monthly");
  const [method, setMethod] = useState("cash");
  const [upiRef, setUpiRef] = useState("");

  const filtered = allMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.includes(search),
  );

  // Calculate new expiry
  const getNewExpiry = () => {
    const date = new Date();
    if (plan === "monthly") date.setMonth(date.getMonth() + 1);
    if (plan === "quarterly") date.setMonth(date.getMonth() + 3);
    if (plan === "yearly") date.setFullYear(date.getFullYear() + 1);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleConfirm = () => {
    if (!selectedMember) return;
    alert(
      `Payment of ₹${planPrices[plan].toLocaleString("en-IN")} logged for ${selectedMember.name}!`,
    );
    navigate("/owner/payments");
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
        >
          ←
        </button>
        <h1 className="text-xl font-black text-white">Log Payment</h1>
      </div>

      {/* Step 1 — Select Member */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Step 1 — Select Member
      </p>

      {!selectedMember ? (
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 mb-3">
            <span>🔍</span>
            <input
              placeholder="Search member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
          <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5">
            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-white/5"
              >
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {m.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{m.name}</p>
                  <p className="text-slate-400 text-xs">{m.memberId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-3 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black flex-shrink-0">
            {selectedMember.name[0]}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">
              {selectedMember.name}
            </p>
            <p className="text-slate-400 text-xs">{selectedMember.memberId}</p>
          </div>
          <button
            onClick={() => setSelectedMember(null)}
            className="text-slate-400 text-xs"
          >
            Change
          </button>
        </div>
      )}

      {/* Step 2 — Plan */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Step 2 — Select Plan
      </p>
      <div className="flex gap-2 mb-4">
        {["monthly", "quarterly", "yearly"].map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            className={`flex-1 rounded-xl p-2.5 text-center border transition-all
              ${
                plan === p
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-[#1a1a2e] border-white/10 text-slate-400"
              }`}
          >
            <div className="text-xs font-bold capitalize">{p}</div>
            <div className="text-sm font-black mt-0.5">
              ₹{planPrices[p].toLocaleString("en-IN")}
            </div>
          </button>
        ))}
      </div>

      {/* Step 3 — Payment Method */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Step 3 — Payment Method
      </p>
      <div className="flex gap-2 mb-4">
        {[
          { key: "cash", icon: "💵", label: "Cash" },
          { key: "upi", icon: "📱", label: "UPI" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMethod(m.key)}
            className={`flex-1 rounded-xl p-3 text-center border transition-all
              ${
                method === m.key
                  ? "bg-green-500/20 border-green-500 text-green-400"
                  : "bg-[#1a1a2e] border-white/10 text-slate-400"
              }`}
          >
            <div className="text-xl mb-0.5">{m.icon}</div>
            <div className="text-xs font-bold">{m.label}</div>
          </button>
        ))}
      </div>

      {/* UPI Ref */}
      {method === "upi" && (
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            UPI Reference Number
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span>🔗</span>
            <input
              placeholder="Transaction ID"
              value={upiRef}
              onChange={(e) => setUpiRef(e.target.value)}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>
      )}

      {/* New Expiry */}
      {selectedMember && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4">
          <p className="text-green-400 text-xs font-bold">📅 New Expiry Date</p>
          <p className="text-white font-black text-lg mt-1">{getNewExpiry()}</p>
        </div>
      )}

      {/* Confirm */}
      <button
        onClick={handleConfirm}
        disabled={!selectedMember}
        className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
      >
        ✅ Confirm Payment — ₹{planPrices[plan].toLocaleString("en-IN")}
      </button>
    </div>
  );
}

export default LogPayment;
