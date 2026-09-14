import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";

const statusConfig = {
  active: { label: "Active", color: "bg-green-500/20 text-green-400" },
  expiring: { label: "Expiring", color: "bg-red-500/20   text-red-400" },
  expired: { label: "Expired", color: "bg-red-500/20   text-red-400" },
  paused: { label: "Paused", color: "bg-amber-500/20 text-amber-400" },
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400" },
};

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
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_id.includes(search);
    const matchFilter = filter === "all" || m.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
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
          { key: "all", label: `All (${members.length})` },
          { key: "active", label: "Active" },
          { key: "pending", label: "Pending" },
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

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading members...</p>
        </div>
      )}

      {/* Members List */}
      {!loading && (
        <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5">
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
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-purple-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {m.name[0]}
                </div>
              )}

              <div className="flex-1">
                <p className="text-white text-sm font-bold">{m.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {m.member_id} · {m.plan}
                </p>
              </div>

              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  statusConfig[m.status]?.color ||
                  "bg-gray-500/20 text-gray-400"
                }`}
              >
                {statusConfig[m.status]?.label || m.status}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No members found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MembersList;
