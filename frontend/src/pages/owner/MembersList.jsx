import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Sample data — baad mein Supabase se aayega
const allMembers = [
  {
    id: 1,
    name: "Amit Kumar",
    memberId: "GYM-0001",
    plan: "Monthly",
    status: "expiring",
    phone: "9876543210",
    expires: "20 Jul 2026",
  },
  {
    id: 2,
    name: "Priya Singh",
    memberId: "GYM-0002",
    plan: "Monthly",
    status: "active",
    phone: "9876543211",
    expires: "21 Aug 2026",
  },
  {
    id: 3,
    name: "Suresh Rao",
    memberId: "GYM-0003",
    plan: "Quarterly",
    status: "active",
    phone: "9876543212",
    expires: "24 Oct 2026",
  },
  {
    id: 4,
    name: "Rohit Kapoor",
    memberId: "GYM-0004",
    plan: "Yearly",
    status: "paused",
    phone: "9876543213",
    expires: "18 Jan 2027",
  },
  {
    id: 5,
    name: "Meena Verma",
    memberId: "GYM-0005",
    plan: "Monthly",
    status: "expired",
    phone: "9876543214",
    expires: "10 Jul 2026",
  },
  {
    id: 6,
    name: "Vikram Shah",
    memberId: "GYM-0006",
    plan: "Monthly",
    status: "active",
    phone: "9876543215",
    expires: "25 Aug 2026",
  },
  {
    id: 7,
    name: "Neha Gupta",
    memberId: "GYM-0007",
    plan: "Quarterly",
    status: "active",
    phone: "9876543216",
    expires: "15 Sep 2026",
  },
];

const statusConfig = {
  active: { label: "Active", color: "bg-green-500/20 text-green-400" },
  expiring: { label: "Expiring", color: "bg-red-500/20 text-red-400" },
  expired: { label: "Expired", color: "bg-red-500/20 text-red-400" },
  paused: { label: "Paused", color: "bg-amber-500/20 text-amber-400" },
};

function MembersList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = allMembers.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.includes(search);
    const matchFilter = filter === "all" || m.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black text-white">Members</h1>
        <button
          onClick={() => navigate("/owner/members/add")}
          className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-black"
        >
          +
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 mb-3">
        <span>🔍</span>
        <input
          placeholder="Search by name or member ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "all", label: `All (${allMembers.length})` },
          { key: "active", label: "Active" },
          { key: "expiring", label: "Expiring" },
          { key: "expired", label: "Expired" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border
              ${
                filter === f.key
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-[#1a1a2e] border-white/10 text-slate-400"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Members List */}
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5">
        {filtered.map((m) => (
          <div
            key={m.id}
            onClick={() => navigate(`/owner/members/${m.id}`)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-white/5"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {m.name[0]}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-white text-sm font-bold">{m.name}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {m.memberId} · {m.plan}
              </p>
            </div>

            {/* Status */}
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${statusConfig[m.status].color}`}
            >
              {statusConfig[m.status].label}
            </span>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No members found
          </div>
        )}
      </div>
    </div>
  );
}

export default MembersList;
