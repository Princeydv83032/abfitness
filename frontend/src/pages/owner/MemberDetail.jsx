import { useNavigate, useParams } from "react-router-dom";

const allMembers = [
  {
    id: 1,
    name: "Amit Kumar",
    memberId: "GYM-0001",
    plan: "Monthly",
    status: "expiring",
    phone: "9876543210",
    expires: "20 Jul 2026",
    joined: "20 Jan 2026",
    attendance: 22,
    totalPaid: 9000,
  },
  {
    id: 2,
    name: "Priya Singh",
    memberId: "GYM-0002",
    plan: "Monthly",
    status: "active",
    phone: "9876543211",
    expires: "21 Aug 2026",
    joined: "21 Jan 2026",
    attendance: 18,
    totalPaid: 7500,
  },
  {
    id: 3,
    name: "Suresh Rao",
    memberId: "GYM-0003",
    plan: "Quarterly",
    status: "active",
    phone: "9876543212",
    expires: "24 Oct 2026",
    joined: "24 Jan 2026",
    attendance: 25,
    totalPaid: 12000,
  },
  {
    id: 4,
    name: "Rohit Kapoor",
    memberId: "GYM-0004",
    plan: "Yearly",
    status: "paused",
    phone: "9876543213",
    expires: "18 Jan 2027",
    joined: "18 Jan 2026",
    attendance: 10,
    totalPaid: 15000,
  },
  {
    id: 5,
    name: "Meena Verma",
    memberId: "GYM-0005",
    plan: "Monthly",
    status: "expired",
    phone: "9876543214",
    expires: "10 Jul 2026",
    joined: "10 Jan 2026",
    attendance: 8,
    totalPaid: 6000,
  },
  {
    id: 6,
    name: "Vikram Shah",
    memberId: "GYM-0006",
    plan: "Monthly",
    status: "active",
    phone: "9876543215",
    expires: "25 Aug 2026",
    joined: "25 Jan 2026",
    attendance: 20,
    totalPaid: 7500,
  },
  {
    id: 7,
    name: "Neha Gupta",
    memberId: "GYM-0007",
    plan: "Quarterly",
    status: "active",
    phone: "9876543216",
    expires: "15 Sep 2026",
    joined: "15 Jan 2026",
    attendance: 28,
    totalPaid: 8000,
  },
];

const statusConfig = {
  active: { label: "Active", color: "bg-green-500/20 text-green-400" },
  expiring: { label: "Expiring", color: "bg-red-500/20   text-red-400" },
  expired: { label: "Expired", color: "bg-red-500/20   text-red-400" },
  paused: { label: "Paused", color: "bg-amber-500/20 text-amber-400" },
};

function MemberDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const member = allMembers.find((m) => m.id === parseInt(id));

  if (!member) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <p className="text-white">Member not found</p>
      </div>
    );
  }

  const infoRows = [
    { label: "Phone", value: member.phone },
    { label: "Plan", value: member.plan },
    { label: "Joined", value: member.joined },
    { label: "Expires", value: member.expires },
    { label: "Status", value: statusConfig[member.status].label },
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
        <span className="text-lg cursor-pointer">✏️</span>
      </div>

      {/* Profile Hero */}
      <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-4 flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {member.name[0]}
        </div>
        <div>
          <h2 className="text-white font-black text-lg">{member.name}</h2>
          <p className="text-slate-400 text-xs mt-0.5">{member.memberId}</p>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${statusConfig[member.status].color}`}
          >
            {statusConfig[member.status].label}
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
            {member.attendance}
          </p>
          <p className="text-slate-500 text-xs">this month</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Total Paid
          </p>
          <p className="text-green-400 text-xl font-black mt-1">
            ₹{member.totalPaid.toLocaleString("en-IN")}
          </p>
          <p className="text-slate-500 text-xs">all time</p>
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
            <span className="text-white text-sm font-semibold">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => navigate("/owner/payments")}
          className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl text-sm"
        >
          💰 Log Payment
        </button>
        <button className="flex-1 bg-[#1a1a2e] border border-white/10 text-white font-bold py-3 rounded-xl text-sm">
          ✏️ Edit Info
        </button>
      </div>

      <button className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-3 rounded-xl text-sm">
        🗑️ Delete Member
      </button>
    </div>
  );
}

export default MemberDetail;
