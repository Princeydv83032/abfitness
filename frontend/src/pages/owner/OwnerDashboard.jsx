import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoNotificationsOutline,
  IoCashOutline,
  IoWarningOutline,
  IoSparklesOutline,
  IoCalendarOutline,
  IoBarChartOutline,
  IoPersonAddOutline,
} from "react-icons/io5";
import {
  FiAward,
  FiCheck,
  FiX,
  FiUsers,
  FiSmartphone,
  FiChevronRight,
} from "react-icons/fi";
import { apiFetch } from "../../lib/api";
import { getCache, setCache, hasCache } from "../../lib/pageCache";
import useAuthStore from "../../store/authStore";
import { toast } from "../../lib/toast";

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="h-3 w-20 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-6 w-36 bg-white/5 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />
      </div>
      <div className="h-32 bg-white/5 rounded-2xl animate-pulse mb-4" />
      <div className="flex gap-2 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-4 w-32 bg-white/5 rounded-lg animate-pulse mb-2" />
      <div className="h-16 bg-white/5 rounded-xl animate-pulse mb-4" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function BottomSheet({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[75vh] bg-[#1a1a2e] border-t border-white/10 rounded-t-3xl p-4 pb-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-extrabold text-base">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400"
          >
            <FiX size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MemberRow({ photo, name, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl active:bg-white/5 text-left"
    >
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-extrabold flex-shrink-0">
          {name?.[0] || "?"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold truncate">{name}</p>
        {subtitle && (
          <p className="text-slate-500 text-xs mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      <FiChevronRight size={14} className="text-slate-600 flex-shrink-0" />
    </button>
  );
}

function OwnerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  // Dashboard 5 API calls karta hai - cache ke bina har baar wapas aane
  // par poora skeleton aur poora wait. Ab cached data turant dikhta hai
  // aur fresh data background mein aakar update karta hai
  const cached = getCache("ownerDashboard");
  const [stats, setStats] = useState(cached?.stats ?? null);
  const [expiring, setExpiring] = useState(cached?.expiring ?? []);
  const [pending, setPending] = useState(cached?.pending ?? []);
  const [memberList, setMemberList] = useState(cached?.memberList ?? []);
  const [todayAttendance, setTodayAttendance] = useState(
    cached?.todayAttendance ?? [],
  );
  const [statModal, setStatModal] = useState(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [loading, setLoading] = useState(!cached);

  const fetchDashboard = async () => {
    // Cache hai to skeleton mat dikhao - silently refresh karo
    if (!hasCache("ownerDashboard")) setLoading(true);

    const today = new Date().toISOString().split("T")[0];
    const month = new Date().toISOString().slice(0, 7);

    // Active + new-this-month counts, expiring list, pending list —
    // members table RLS-locked hai, owner-verified backend routes se
    const memberStatsRes = await apiFetch(`/api/members/stats?month=${month}`);
    const activeCount = memberStatsRes.success ? memberStatsRes.active : 0;
    const newCount = memberStatsRes.success ? memberStatsRes.newThisMonth : 0;

    const expiringRes = await apiFetch("/api/members/expiring?days=7");
    const expiringData = expiringRes.success ? expiringRes.members : [];

    // Today check-ins — attendance table RLS-locked hai, owner-verified
    // backend route se
    const todayCIRes = await apiFetch(`/api/attendance/count?date=${today}`);
    const todayCI = todayCIRes.success ? todayCIRes.count : 0;

    // Monthly payments — payments table RLS-locked hai, owner-verified
    // backend route se
    const paymentsRes = await apiFetch(
      `/api/payment/all?from=${month}-01`,
    );
    const paymentsData = paymentsRes.success ? paymentsRes.payments : [];

    const revenue = paymentsData?.reduce((s, p) => s + p.amount, 0) || 0;
    const cash =
      paymentsData
        ?.filter((p) => p.method === "cash")
        .reduce((s, p) => s + p.amount, 0) || 0;
    const upi =
      paymentsData
        ?.filter((p) => p.method === "upi")
        .reduce((s, p) => s + p.amount, 0) || 0;

    // Pending members
    const pendingRes = await apiFetch("/api/members/pending");
    const pendingData = pendingRes.success ? pendingRes.members : [];

    // Full member list + today's check-in list — stat tiles ke preview
    // modal ke liye (sirf count nahi, actual member data chahiye)
    const listRes = await apiFetch("/api/members/list");
    const memberListData = listRes.success ? listRes.members : [];
    setMemberList(memberListData);

    const todayAttRes = await apiFetch("/api/attendance/today");
    const todayAttData = todayAttRes.success ? todayAttRes.attendance : [];
    setTodayAttendance(todayAttData);

    const nextStats = {
      activeMembers: activeCount || 0,
      expiring: expiringData?.length || 0,
      newThisMonth: newCount || 0,
      todayCheckIns: todayCI || 0,
      revenue,
      cash,
      upi,
    };
    setStats(nextStats);

    const nextExpiring =
      expiringData?.map((m) => ({
        ...m,
        daysLeft: Math.ceil(
          (new Date(m.expires_at) - new Date()) / (1000 * 60 * 60 * 24),
        ),
        expiresFormatted: new Date(m.expires_at).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      })) || [];
    setExpiring(nextExpiring);

    setPending(pendingData || []);

    setCache("ownerDashboard", {
      stats: nextStats,
      expiring: nextExpiring,
      pending: pendingData || [],
      memberList: memberListData,
      todayAttendance: todayAttData,
    });
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(fetchDashboard);
  }, []);

  const handleApprove = async (member) => {
    // members table RLS-locked hai - backend hi status active karta hai
    // + expiry plan ke hisaab se calculate karta hai. Isme "row actually
    // update hui ya nahi" wala check bhi built-in hai (pehle ek bug tha
    // jahan 0-row update bhi "success" maan liya jaata tha)
    const res = await apiFetch(`/api/members/${member.id}/approve`, {
      method: "POST",
    });

    if (!res.success) {
      toast.error("Approve failed: " + (res.message || res.error));
      return;
    }

    // Welcome push notification + email — non-blocking, approval ko iski
    // wajah se rokna nahi hai agar ye fail ho jaye
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/send-welcome`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: member.id }),
        },
      );
      console.log("Welcome notification sent");
    } catch (err) {
      console.log("Notification error:", err);
    }

    toast.success(`${member.name} approved!`);
    fetchDashboard();
  };

  const handleReject = async (id) => {
    if (!confirm("Reject this member request?")) return;

    const res = await apiFetch(`/api/members/${id}`, { method: "DELETE" });

    if (res.success) {
      toast.success("Member request rejected.");
      fetchDashboard();
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7);

  const openStatModal = (type) => {
    if (type === "active") {
      setStatModal({
        title: "Active Members",
        items: memberList
          .filter((m) => m.status === "active")
          .map((m) => ({
            id: m.id,
            name: m.name,
            photo: m.profile_photo,
            subtitle: m.plan ? `${m.plan} plan` : m.phone,
          })),
      });
    } else if (type === "expiring") {
      setStatModal({
        title: "Expiring This Week",
        items: expiring.map((m) => ({
          id: m.id,
          name: m.name,
          photo: m.profile_photo,
          subtitle: `Expires ${m.expiresFormatted} · ${m.daysLeft}d left`,
        })),
      });
    } else if (type === "new") {
      setStatModal({
        title: "New This Month",
        items: memberList
          .filter((m) => m.joined_at?.slice(0, 7) === currentMonth)
          .map((m) => ({
            id: m.id,
            name: m.name,
            photo: m.profile_photo,
            subtitle: m.phone,
          })),
      });
    } else if (type === "today") {
      setStatModal({
        title: "Today's Check-ins",
        items: todayAttendance.map((a) => ({
          id: a.member_id,
          name: a.members?.name || "Member",
          photo: a.members?.profile_photo,
          subtitle: a.checked_in_at
            ? new Date(a.checked_in_at).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        })),
      });
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const statTiles = [
    { key: "active", label: "Active", value: stats?.activeMembers, icon: FiUsers, color: "text-emerald-400", bg: "bg-emerald-500/15" },
    { key: "expiring", label: "Expiring", value: stats?.expiring, icon: IoWarningOutline, color: "text-amber-400", bg: "bg-amber-500/15" },
    { key: "new", label: "New", value: stats?.newThisMonth, icon: IoSparklesOutline, color: "text-violet-400", bg: "bg-violet-500/15" },
    { key: "today", label: "Today", value: stats?.todayCheckIns, icon: IoCalendarOutline, color: "text-blue-400", bg: "bg-blue-500/15" },
  ];

  const quickActions = [
    { icon: IoPersonAddOutline, label: "Add Member", path: "/owner/members/add", color: "text-violet-400", bg: "bg-violet-500/15" },
    { icon: IoCashOutline, label: "Log Payment", path: "/owner/payments/log", color: "text-emerald-400", bg: "bg-emerald-500/15" },
    { icon: IoCalendarOutline, label: "Attendance", path: "/owner/attendance", color: "text-blue-400", bg: "bg-blue-500/15" },
    { icon: IoBarChartOutline, label: "Reports", path: "/owner/reports", color: "text-amber-400", bg: "bg-amber-500/15" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <FiAward size={12} className="text-violet-400" />
            Owner Panel
          </p>
          <h1 className="text-xl font-extrabold text-white mt-0.5">
            {user?.gymName || "AB Fitness"}
          </h1>
        </div>
        <button
          onClick={() => setShowNotifPanel(true)}
          className="relative"
        >
          <div className="w-10 h-10 bg-[#1a1a2e] border border-white/10 rounded-full flex items-center justify-center text-slate-300">
            <IoNotificationsOutline size={18} />
          </div>
          {(stats?.expiring > 0 || pending.length > 0) && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold">
              {stats.expiring + pending.length}
            </div>
          )}
        </button>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 rounded-2xl p-4 mb-4 border border-violet-500/30">
        <p className="text-violet-200 text-xs font-bold uppercase tracking-wider">
          Revenue —{" "}
          {new Date().toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="text-white font-extrabold text-3xl mt-1 tracking-tight">
          ₹{stats?.revenue.toLocaleString("en-IN")}
        </p>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/15 rounded-xl p-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white flex-shrink-0">
              <IoCashOutline size={13} />
            </div>
            <div>
              <p className="text-violet-200 text-[9px] font-bold uppercase">Cash</p>
              <p className="text-white font-extrabold text-sm">
                ₹{stats?.cash.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white flex-shrink-0">
              <FiSmartphone size={12} />
            </div>
            <div>
              <p className="text-violet-200 text-[9px] font-bold uppercase">UPI</p>
              <p className="text-white font-extrabold text-sm">
                ₹{stats?.upi.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-2 mb-5">
        {statTiles.map((s) => (
          <button
            key={s.label}
            onClick={() => openStatModal(s.key)}
            className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-2xl p-2.5 text-left active:bg-white/5 transition-colors"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1.5 ${s.bg} ${s.color}`}>
              <s.icon size={12} />
            </div>
            <p className={`font-extrabold text-lg leading-none ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1">
              {s.label}
            </p>
          </button>
        ))}
      </div>

      {/* Pending Members */}
      {pending.length > 0 && (
        <>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <IoSparklesOutline size={13} className="text-violet-400" />
            Pending Approval ({pending.length})
          </p>
          <div className="space-y-2 mb-5">
            {pending.map((m) => (
              <div
                key={m.id}
                className="bg-[#1a1a2e] border border-violet-500/20 rounded-2xl p-3"
              >
                <div className="flex items-center gap-3">
                  {m.profile_photo ? (
                    <img
                      src={m.profile_photo}
                      alt={m.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-extrabold flex-shrink-0">
                      {m.name[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold">{m.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {m.phone} · {m.plan} · {m.goal || "General"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApprove(m)}
                    className="flex-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <FiCheck size={13} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(m.id)}
                    className="flex-1 bg-red-500/15 border border-red-500/30 text-red-400 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <FiX size={13} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Expiry Alerts */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <IoWarningOutline size={13} className="text-amber-400" />
        Expiring This Week
      </p>

      {expiring.length === 0 ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center mb-5">
          <p className="text-emerald-400 font-bold text-sm">
            No expirations this week!
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-5">
          {expiring.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(`/owner/members/${m.id}`)}
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                {m.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-bold">{m.name}</p>
                <p className="text-red-400 text-xs mt-0.5">
                  Expires {m.expiresFormatted}
                </p>
              </div>
              <div className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-lg">
                {m.daysLeft}d
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="bg-[#1a1a2e] border border-white/7 rounded-xl p-3 text-left"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${a.bg} ${a.color}`}>
              <a.icon size={16} />
            </div>
            <div className="text-white text-xs font-bold">{a.label}</div>
          </button>
        ))}
      </div>

      {/* Stat tile preview — Active / Expiring / New / Today */}
      {statModal && (
        <BottomSheet
          title={statModal.title}
          onClose={() => setStatModal(null)}
        >
          {statModal.items.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              No members here yet.
            </p>
          ) : (
            <div className="space-y-1">
              {statModal.items.map((it, i) => (
                <MemberRow
                  key={it.id || i}
                  photo={it.photo}
                  name={it.name}
                  subtitle={it.subtitle}
                  onClick={() => {
                    setStatModal(null);
                    if (it.id) navigate(`/owner/members/${it.id}`);
                  }}
                />
              ))}
            </div>
          )}
        </BottomSheet>
      )}

      {/* Notifications — pending approvals + expiring, one place */}
      {showNotifPanel && (
        <BottomSheet
          title="Notifications"
          onClose={() => setShowNotifPanel(false)}
        >
          {pending.length === 0 && expiring.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              You're all caught up!
            </p>
          ) : (
            <div className="space-y-4">
              {pending.length > 0 && (
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5 px-1">
                    Pending Approval ({pending.length})
                  </p>
                  <div className="space-y-1">
                    {pending.map((m) => (
                      <MemberRow
                        key={m.id}
                        photo={m.profile_photo}
                        name={m.name}
                        subtitle={`${m.phone} · ${m.plan}`}
                        onClick={() => {
                          setShowNotifPanel(false);
                          navigate(`/owner/members/${m.id}`);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {expiring.length > 0 && (
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5 px-1">
                    Expiring This Week ({expiring.length})
                  </p>
                  <div className="space-y-1">
                    {expiring.map((m) => (
                      <MemberRow
                        key={m.id}
                        photo={m.profile_photo}
                        name={m.name}
                        subtitle={`Expires ${m.expiresFormatted} · ${m.daysLeft}d left`}
                        onClick={() => {
                          setShowNotifPanel(false);
                          navigate(`/owner/members/${m.id}`);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </BottomSheet>
      )}
    </div>
  );
}

export default OwnerDashboard;
