import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { apiFetch } from "../../lib/api";

function MemberDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMember = async () => {
    setLoading(true);
    const month = new Date().toISOString().slice(0, 7);

    const { data: memberData } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single();

    // payments table RLS-locked hai - owner-verified backend route se
    const paymentsRes = await apiFetch(`/api/payment/member/${id}`);
    const paymentsData = paymentsRes.success ? paymentsRes.payments : [];

    const { count: attendanceCount } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("member_id", id)
      .gte("date", `${month}-01`);

    if (memberData) setMember(memberData);
    if (paymentsData) setPayments(paymentsData);
    setAttendance(attendanceCount || 0);
    setLoading(false);
  };

  useEffect(() => {
    if (id) queueMicrotask(fetchMember);
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Delete ${member?.name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (!error) {
      alert("Member deleted!");
      navigate("/owner/members");
    }
  };

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const daysLeft = member
    ? Math.ceil(
        (new Date(member.expires_at) - new Date()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <p className="text-white">Member not found</p>
      </div>
    );
  }

  const infoRows = [
    { label: "Phone", value: member.phone },
    {
      label: "Plan",
      value: member.plan?.charAt(0).toUpperCase() + member.plan?.slice(1),
    },
    { label: "Goal", value: member.goal || "--" },
    {
      label: "Joined",
      value: new Date(member.joined_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    },
    {
      label: "Expires",
      value: new Date(member.expires_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    },
    { label: "Status", value: member.status },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
          >
            ←
          </button>
          <h1 className="text-lg font-black text-white">Member Profile</h1>
        </div>
      </div>

      {/* Profile Hero */}
      <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-4 flex items-center gap-4 mb-4">
        {/* Avatar */}
        {member.profile_photo ? (
          <img
            src={member.profile_photo}
            alt={member.name}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-4 border-purple-500"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
            {member.name[0]}
          </div>
        )}

        <div>
          <h2 className="text-white font-black text-lg">{member.name}</h2>
          <p className="text-slate-400 text-xs mt-0.5">{member.member_id}</p>
          {member.goal && (
            <p className="text-purple-400 text-xs mt-0.5">🎯 {member.goal}</p>
          )}
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block
            ${
              member.status === "pending"
                ? "bg-yellow-500/20 text-yellow-400"
                : daysLeft > 0
                  ? daysLeft <= 7
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
            }`}
          >
            {member.status === "pending"
              ? "⏳ Pending"
              : daysLeft > 0
                ? `Active — ${daysLeft} days left`
                : "Expired"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Attendance
          </p>
          <p className="text-purple-400 text-2xl font-black mt-1">
            {attendance}
          </p>
          <p className="text-slate-500 text-xs">this month</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Total Paid
          </p>
          <p className="text-green-400 text-xl font-black mt-1">
            ₹{totalPaid.toLocaleString("en-IN")}
          </p>
          <p className="text-slate-500 text-xs">all time</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Payments
          </p>
          <p className="text-blue-400 text-2xl font-black mt-1">
            {payments.length}
          </p>
          <p className="text-slate-500 text-xs">total</p>
        </div>
      </div>

      {/* Info */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Membership Info
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-4">
        {infoRows.map((row, i) => (
          <div
            key={i}
            className={`flex justify-between items-center px-4 py-3
              ${i !== infoRows.length - 1 ? "border-b border-white/5" : ""}`}
          >
            <span className="text-slate-400 text-sm">{row.label}</span>
            <span
              className={`text-sm font-semibold capitalize
              ${
                row.label === "Status"
                  ? member.status === "active"
                    ? "text-green-400"
                    : member.status === "pending"
                      ? "text-yellow-400"
                      : "text-red-400"
                  : "text-white"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            Payment History
          </p>
          <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5 mb-4">
            {payments.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0
                  ${p.method === "upi" ? "bg-purple-600/20" : "bg-green-500/20"}`}
                >
                  {p.method === "upi" ? "📱" : "💵"}
                </div>
                <div className="flex-1">
                  <p className="text-white text-xs font-bold capitalize">
                    {p.method} · {p.plan}
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    {new Date(p.paid_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-green-400 font-black text-sm">
                  ₹{p.amount.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => navigate("/owner/payments/log")}
          className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl text-sm"
        >
          💰 Log Payment
        </button>
        <button
          onClick={() => navigate(`/owner/members/edit/${member.id}`)}
          className="flex-1 bg-[#1a1a2e] border border-white/10 text-white font-bold py-3 rounded-xl text-sm"
        >
          ✏️ Edit
        </button>
      </div>

      <button
        onClick={handleDelete}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-3 rounded-xl text-sm"
      >
        🗑️ Delete Member
      </button>
    </div>
  );
}

export default MemberDetail;
