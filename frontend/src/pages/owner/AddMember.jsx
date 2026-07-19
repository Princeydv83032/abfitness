import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const planPrices = {
  monthly: 1500,
  quarterly: 4000,
  yearly: 15000,
};

function AddMember() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    plan: "monthly",
    paymentMethod: "cash",
    upiRef: "",
    joinDate: new Date().toISOString().split("T")[0],
  });

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // Expiry date calculate karo
  const getExpiry = (joinDate, plan) => {
    const date = new Date(joinDate);
    if (plan === "monthly") date.setMonth(date.getMonth() + 1);
    if (plan === "quarterly") date.setMonth(date.getMonth() + 3);
    if (plan === "yearly") date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split("T")[0];
  };

  // Member ID generate karo
  const getMemberId = async () => {
    const { count } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });
    return `GYM-${String((count || 0) + 1).padStart(4, "0")}`;
  };

  const handleSubmit = async () => {
    if (!form.name || form.phone.length !== 10) return;
    setLoading(true);

    try {
      // Member ID generate karo
      const memberId = await getMemberId();
      const expiresAt = getExpiry(form.joinDate, form.plan);

      // Supabase mein member save karo
      const { data: member, error: memberError } = await supabase
        .from("members")
        .insert({
          member_id: memberId,
          name: form.name,
          phone: form.phone,
          plan: form.plan,
          joined_at: form.joinDate,
          expires_at: expiresAt,
          status: "active",
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // Payment bhi save karo
      const { error: paymentError } = await supabase.from("payments").insert({
        member_id: member.id,
        amount: planPrices[form.plan],
        method: form.paymentMethod,
        upi_ref: form.upiRef || null,
        plan: form.plan,
      });

      if (paymentError) throw paymentError;

      alert(`✅ ${form.name} added successfully! Member ID: ${memberId}`);
      navigate("/owner/members");
    } catch (error) {
      console.log("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-xl font-black text-white">Add New Member</h1>
      </div>

      {/* Photo */}
      <div className="text-center mb-5">
        <div className="w-16 h-16 rounded-full bg-[#1a1a2e] border-2 border-dashed border-white/20 inline-flex items-center justify-center text-2xl cursor-pointer">
          📷
        </div>
        <p className="text-slate-500 text-xs mt-1">Tap to add photo</p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Full Name *
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span>👤</span>
            <input
              placeholder="Member's full name"
              value={form.name}
              onChange={set("name")}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Phone Number *
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span>📞</span>
            <input
              type="tel"
              placeholder="10 digit mobile number"
              maxLength={10}
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  phone: e.target.value.replace(/\D/g, ""),
                }))
              }
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Plan */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Membership Plan *
          </label>
          <div className="flex gap-2 mt-1.5">
            {["monthly", "quarterly", "yearly"].map((p) => (
              <button
                key={p}
                onClick={() => setForm((prev) => ({ ...prev, plan: p }))}
                className={`flex-1 rounded-xl p-2.5 text-center border transition-all
                  ${
                    form.plan === p
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
        </div>

        {/* Payment Method */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Payment Method *
          </label>
          <div className="flex gap-2 mt-1.5">
            {[
              { key: "cash", icon: "💵", label: "Cash" },
              { key: "upi", icon: "📱", label: "UPI" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() =>
                  setForm((prev) => ({ ...prev, paymentMethod: m.key }))
                }
                className={`flex-1 rounded-xl p-3 text-center border transition-all
                  ${
                    form.paymentMethod === m.key
                      ? "bg-green-500/20 border-green-500 text-green-400"
                      : "bg-[#1a1a2e] border-white/10 text-slate-400"
                  }`}
              >
                <div className="text-xl mb-0.5">{m.icon}</div>
                <div className="text-xs font-bold">{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* UPI Ref */}
        {form.paymentMethod === "upi" && (
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              UPI Reference Number
            </label>
            <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
              <span>🔗</span>
              <input
                placeholder="Transaction ID"
                value={form.upiRef}
                onChange={set("upiRef")}
                className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
              />
            </div>
          </div>
        )}

        {/* Join Date */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Join Date
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span>📅</span>
            <input
              type="date"
              value={form.joinDate}
              onChange={set("joinDate")}
              className="bg-transparent outline-none text-white text-sm flex-1"
            />
          </div>
        </div>

        {/* Expiry Preview */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
          <p className="text-green-400 text-xs font-bold">
            📅 Membership Valid Until
          </p>
          <p className="text-white font-black text-lg mt-1">
            {new Date(getExpiry(form.joinDate, form.plan)).toLocaleDateString(
              "en-IN",
              { day: "2-digit", month: "short", year: "numeric" },
            )}
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!form.name || form.phone.length !== 10 || loading}
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
        >
          {loading ? "⏳ Adding Member..." : "✅ Add Member"}
        </button>
      </div>
    </div>
  );
}

export default AddMember;
