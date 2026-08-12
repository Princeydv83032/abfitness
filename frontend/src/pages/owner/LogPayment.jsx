import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { usePrices } from "../../hooks/usePrices";

function LogPayment() {
  const navigate = useNavigate();
  const { prices: planPrices } = usePrices();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [plan, setPlan] = useState("monthly");
  const [method, setMethod] = useState("cash");
  const [upiRef, setUpiRef] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("members")
      .select("id, name, member_id, plan, expires_at, email") // ← email add karo
      .order("name");
    if (data) setMembers(data);
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_id.includes(search),
  );

  const getNewExpiry = () => {
    const base = new Date();
    const expiry = new Date(base);
    if (plan === "monthly") expiry.setMonth(expiry.getMonth() + 1);
    if (plan === "quarterly") expiry.setMonth(expiry.getMonth() + 3);
    if (plan === "yearly") expiry.setFullYear(expiry.getFullYear() + 1);
    return {
      isoDate: expiry.toISOString().split("T")[0],
      formatted: expiry.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  };

  const handleConfirm = async () => {
    if (!selectedMember) return;
    setLoading(true);

    try {
      const newExpiry = getNewExpiry();

      // Payment save karo + ID lo
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          member_id: selectedMember.id,
          amount: planPrices[plan],
          method: method,
          upi_ref: upiRef || null,
          plan: plan,
          paid_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Member expiry update karo
      const { error: memberError } = await supabase
        .from("members")
        .update({
          expires_at: newExpiry.isoDate,
          plan: plan,
          status: "active",
        })
        .eq("id", selectedMember.id);

      if (memberError) throw memberError;

      // Email bhejo — background mein
      console.log("Selected member email:", selectedMember.email);
      console.log("Payment data:", paymentData);
      if (selectedMember.email && paymentData?.id) {
        try {
          await fetch(
            `${import.meta.env.VITE_API_URL}/api/notifications/send-invoice`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                memberId: selectedMember.id,
                paymentId: paymentData.id,
              }),
            },
          );
          console.log("Sending invoice email...");
          console.log("Member:", selectedMember.id);
          console.log("Payment:", paymentData?.id);
          console.log("API URL:", import.meta.env.VITE_API_URL);
          console.log("Invoice email sent ✅");
        } catch (err) {
          console.log("Email error:", err);
          // Email fail hone pe payment block nahi hona chahiye
        }
      }

      alert(`✅ Payment logged!\nNew expiry: ${newExpiry.formatted}`);
      navigate("/owner/payments");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-10">
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
                  <p className="text-slate-400 text-xs">{m.member_id}</p>
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
            <p className="text-slate-400 text-xs">{selectedMember.member_id}</p>
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
              ₹{(planPrices[p] || 0).toLocaleString("en-IN")}
            </div>
          </button>
        ))}
      </div>

      {/* Step 3 — Method */}
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

      {method === "upi" && (
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            UPI Reference
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

      {selectedMember && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4">
          <p className="text-green-400 text-xs font-bold">📅 New Expiry Date</p>
          <p className="text-white font-black text-lg mt-1">
            {getNewExpiry().formatted}
          </p>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!selectedMember || loading}
        className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
      >
        {loading
          ? "⏳ Saving..."
          : `✅ Confirm — ₹${(planPrices[plan] || 0).toLocaleString("en-IN")}`}
      </button>
    </div>
  );
}

export default LogPayment;
