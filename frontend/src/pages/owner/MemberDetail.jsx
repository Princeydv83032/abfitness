import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoCashOutline,
  IoFlagOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
} from "react-icons/io5";
import {
  FiArrowLeft,
  FiSmartphone,
  FiEdit2,
  FiTrash2,
  FiX,
  FiMail,
  FiPhone,
  FiTag,
  FiCalendar,
} from "react-icons/fi";
import { apiFetch } from "../../lib/api";
import { toast } from "../../lib/toast";

function MemberDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-5 w-32 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="h-24 bg-white/5 rounded-2xl animate-pulse mb-4" />
      <div className="flex gap-2 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-40 bg-white/5 rounded-xl animate-pulse mb-4" />
      <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
    </div>
  );
}

function MemberDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const fetchMember = async () => {
    setLoading(true);
    const month = new Date().toISOString().slice(0, 7);

    const memberRes = await apiFetch(`/api/members/${id}`);
    const memberData = memberRes.success ? memberRes.member : null;

    // payments table RLS-locked hai - owner-verified backend route se
    const paymentsRes = await apiFetch(`/api/payment/member/${id}`);
    const paymentsData = paymentsRes.success ? paymentsRes.payments : [];

    // attendance table RLS-locked hai - owner-verified backend route se
    const attendanceRes = await apiFetch(
      `/api/attendance/count?memberId=${id}&from=${month}-01`,
    );
    const attendanceCount = attendanceRes.success ? attendanceRes.count : 0;

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
    const res = await apiFetch(`/api/members/${id}`, { method: "DELETE" });
    if (res.success) {
      toast.success("Member deleted!");
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
    return <MemberDetailSkeleton />;
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <p className="text-white">Member not found</p>
      </div>
    );
  }

  const infoRows = [
    { icon: FiMail, label: "Email", value: member.email || "--" },
    { icon: FiPhone, label: "Phone", value: member.phone },
    {
      icon: FiTag,
      label: "Plan",
      value: member.plan?.charAt(0).toUpperCase() + member.plan?.slice(1),
    },
    { icon: IoFlagOutline, label: "Goal", value: member.goal || "--" },
    {
      icon: FiCalendar,
      label: "Joined",
      value: new Date(member.joined_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    },
    {
      icon: IoTimeOutline,
      label: "Expires",
      value: new Date(member.expires_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    },
    { icon: IoCheckmarkCircle, label: "Status", value: member.status },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
          >
            <FiArrowLeft size={15} />
          </button>
          <h1 className="text-lg font-extrabold text-white">Member Profile</h1>
        </div>
      </div>

      {/* Profile Hero — horizontal layout, compact. Text left, photo right */}
      <div className="rounded-2xl p-4 mb-4 bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 border border-violet-400/20 flex items-center gap-3.5">
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-extrabold text-lg truncate">
            {member.name}
          </h2>
          <p className="text-white/60 text-xs mt-0.5">{member.member_id}</p>
          {member.goal && (
            <p className="text-white/80 text-xs mt-1 flex items-center gap-1">
              <IoFlagOutline size={12} /> {member.goal}
            </p>
          )}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-flex items-center gap-1
            ${
              member.status === "pending"
                ? "bg-yellow-500/20 text-yellow-300"
                : daysLeft > 0
                  ? daysLeft <= 7
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-emerald-500/20 text-emerald-300"
                  : "bg-red-500/20 text-red-300"
            }`}
          >
            {member.status === "pending" ? (
              <>
                <IoTimeOutline size={11} /> Pending
              </>
            ) : daysLeft > 0 ? (
              `Active — ${daysLeft} days left`
            ) : (
              "Expired"
            )}
          </span>
        </div>

        {/* Avatar — tap to preview */}
        <button
          onClick={() => member.profile_photo && setShowPreview(true)}
          className="flex-shrink-0"
        >
          {member.profile_photo ? (
            <img
              src={member.profile_photo}
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-white text-2xl font-extrabold border-2 border-white/20">
              {member.name[0]}
            </div>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Attendance
          </p>
          <p className="text-violet-400 text-2xl font-extrabold mt-1">
            {attendance}
          </p>
          <p className="text-slate-500 text-xs">this month</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Total Paid
          </p>
          <p className="text-emerald-400 text-xl font-extrabold mt-1">
            ₹{totalPaid.toLocaleString("en-IN")}
          </p>
          <p className="text-slate-500 text-xs">all time</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Payments
          </p>
          <p className="text-blue-400 text-2xl font-extrabold mt-1">
            {payments.length}
          </p>
          <p className="text-slate-500 text-xs">total</p>
        </div>
      </div>

      {/* Info */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Membership Info
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl mb-4">
        {infoRows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 px-3.5 py-2.5
              ${i !== infoRows.length - 1 ? "border-b border-white/5" : ""}`}
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
              <row.icon size={13} />
            </div>
            <span className="text-slate-400 text-xs flex-1">{row.label}</span>
            <span
              className={`text-xs font-semibold capitalize text-right truncate max-w-[55%]
              ${
                row.label === "Status"
                  ? member.status === "active"
                    ? "text-emerald-400"
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
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${p.method === "upi" ? "bg-violet-600/20 text-violet-400" : "bg-emerald-500/20 text-emerald-400"}`}
                >
                  {p.method === "upi" ? <FiSmartphone size={13} /> : <IoCashOutline size={15} />}
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
                <p className="text-emerald-400 font-extrabold text-sm">
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
          onClick={() => navigate("/owner/payments/log", { state: { member } })}
          className="flex-1 bg-violet-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <IoCashOutline size={16} /> Log Payment
        </button>
        <button
          onClick={() => navigate(`/owner/members/edit/${member.id}`)}
          className="flex-1 bg-[#1a1a2e] border border-white/10 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <FiEdit2 size={14} /> Edit
        </button>
      </div>

      <button
        onClick={handleDelete}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
      >
        <FiTrash2 size={14} /> Delete Member
      </button>

      {/* Full-size profile preview */}
      {showPreview && member.profile_photo && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-6"
          onClick={() => setShowPreview(false)}
        >
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <FiX size={18} />
          </button>
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <img
              src={member.profile_photo}
              alt={member.name}
              className="w-full rounded-2xl object-contain max-h-[65vh]"
            />
            <div className="mt-3 flex items-center gap-2">
              <p className="text-white font-extrabold text-lg">{member.name}</p>
              {member.status === "active" && (
                <IoCheckmarkCircle size={16} className="text-emerald-400" />
              )}
            </div>
            <p className="text-slate-400 text-sm">{member.member_id}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDetail;
