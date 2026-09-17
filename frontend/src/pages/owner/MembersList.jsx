import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline, IoPeopleOutline } from "react-icons/io5";
import { FiPlus, FiChevronRight } from "react-icons/fi";
import { apiFetch } from "../../lib/api";

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-500/15 text-emerald-400" },
  expiring: { label: "Expiring", color: "bg-amber-500/15 text-amber-400" },
  expired: { label: "Expired", color: "bg-red-500/15 text-red-400" },
  paused: { label: "Paused", color: "bg-amber-500/15 text-amber-400" },
  pending: { label: "Pending", color: "bg-yellow-500/15 text-yellow-400" },
};

function MembersListSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="h-6 w-28 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-3 w-20 bg-white/5 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="w-9 h-9 bg-white/5 rounded-xl animate-pulse" />
      </div>
      <div className="h-11 bg-white/5 rounded-xl animate-pulse mb-3" />
      <div className="flex gap-2 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-8 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl divide-y divide-white/5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3.5 w-28 bg-white/5 rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-white/5 rounded animate-pulse mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MembersList() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchMembers = async () => {
    setLoading(true);
    const res = await apiFetch("/api/members/list");
    if (res.success) setMembers(res.members);
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(fetchMembers);
  }, []);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    // "GYM-" prefix hata kar match karo - warna "m" ya "y" jaisi query
    // har member ko match kar deti thi kyunki har ID "GYM-" se shuru
    // hoti hai, naam se koi lena dena nahi
    const idDigits = m.member_id.toLowerCase().replace(/^gym-/, "");
    const matchSearch = m.name.toLowerCase().includes(q) || idDigits.includes(q);
    const matchFilter = filter === "all" || m.status === filter;
    return matchSearch && matchFilter;
  });

  const tabs = [
    { key: "all", label: "All", count: members.length },
    { key: "active", label: "Active", count: members.filter((m) => m.status === "active").length },
    { key: "pending", label: "Pending", count: members.filter((m) => m.status === "pending").length },
    { key: "expired", label: "Expired", count: members.filter((m) => m.status === "expired").length },
  ];

  if (loading) {
    return <MembersListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
            <IoPeopleOutline size={18} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Members
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {members.length} total
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/owner/members/add")}
          className="bg-violet-600 text-white text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 flex-shrink-0"
        >
          <FiPlus size={15} />
          Add Member
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 mb-3">
        <IoSearchOutline size={15} className="text-slate-500" />
        <input
          placeholder="Search by name or member ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors
              ${
                filter === f.key
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "bg-[#1a1a2e] border-white/10 text-slate-400"
              }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Members List */}
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl divide-y divide-white/5">
        {filtered.map((m) => (
          <div
            key={m.id}
            onClick={() => navigate(`/owner/members/${m.id}`)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-white/5"
          >
            {/* Avatar */}
            {m.profile_photo ? (
              <img
                src={m.profile_photo}
                alt={m.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-violet-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                {m.name[0]}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{m.name}</p>
              <p className="text-slate-400 text-xs mt-0.5 truncate">
                {m.member_id} · {m.plan}
              </p>
            </div>

            <span
              className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                statusConfig[m.status]?.color ||
                "bg-gray-500/15 text-gray-400"
              }`}
            >
              {statusConfig[m.status]?.label || m.status}
            </span>

            <FiChevronRight size={14} className="text-slate-600 flex-shrink-0" />
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 text-slate-500">
              <IoPeopleOutline size={22} />
            </div>
            <p className="text-slate-400 text-sm">No members found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MembersList;
