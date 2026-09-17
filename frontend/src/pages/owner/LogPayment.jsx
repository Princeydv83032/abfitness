import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoSearchOutline,
  IoCashOutline,
  IoCheckmarkCircle,
  IoCalendarOutline,
  IoPeopleOutline,
  IoWarningOutline,
} from "react-icons/io5";
import { FiArrowLeft, FiSmartphone, FiLink } from "react-icons/fi";
import { apiFetch } from "../../lib/api";
import { usePrices } from "../../hooks/usePrices";
import { toast } from "../../lib/toast";

function MemberAvatar({ member, size = "w-9 h-9", textSize = "text-sm" }) {
  return member.profile_photo ? (
    <img
      src={member.profile_photo}
      alt={member.name}
      className={`${size} rounded-full object-cover flex-shrink-0`}
    />
  ) : (
    <div
      className={`${size} rounded-full bg-violet-600 flex items-center justify-center text-white font-extrabold ${textSize} flex-shrink-0`}
    >
      {member.name[0]}
    </div>
  );
}

function LogPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { prices: planPrices, loading: pricesLoading } = usePrices();
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(
    location.state?.member || null,
  );
  // Member profile se seedha aaye hain to "Change" ka koi matlab nahi -
  // wahi member log karna hai, flow ko simple rakhte hain
  const isPrefilled = !!location.state?.member;
  const [plan, setPlan] = useState("monthly");
  const [method, setMethod] = useState("cash");
  const [upiRef, setUpiRef] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [memberPayments, setMemberPayments] = useState([]);
  const [checkingPayments, setCheckingPayments] = useState(false);

  const fetchMembers = async () => {
    // members table RLS-locked hai, owner-verified backend route se.
    // Preselected ho ya nahi, list background mein load kar lete hain -
    // taaki "Change" dabane par bhi turant dikhe
    setMembersLoading(true);
    const res = await apiFetch("/api/payment/members-for-logging");
    if (res.success) setMembers(res.members);
    setMembersLoading(false);
  };

  useEffect(() => {
    queueMicrotask(fetchMembers);
  }, []);

  useEffect(() => {
    // 1 second ruk kar hi search apply karo - "Pri" type karte hi har
    // keystroke pe list flash na ho, aur khaali search pe pura members
    // directory bhi na dikhe
    const t = setTimeout(() => setDebouncedSearch(search), 600);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    // Selected member ke liye already-this-month payment check - taaki
    // owner ko dobara payment log karne se pehle hi pata chal jaaye
    const fetchMemberPayments = async () => {
      if (!selectedMember) {
        setMemberPayments([]);
        return;
      }
      setCheckingPayments(true);
      const res = await apiFetch(`/api/payment/member/${selectedMember.id}`);
      setMemberPayments(res.success ? res.payments : []);
      setCheckingPayments(false);
    };
    queueMicrotask(fetchMemberPayments);
  }, [selectedMember]);

  // Real "aaj" ka mahina nahi - jo date owner ne chuni hai (calendar se,
  // advance payment ke liye future month bhi ho sakta hai) uska mahina
  const targetMonth = paymentDate.slice(0, 7);
  const alreadyPaidThisMonth = memberPayments.some(
    (p) => p.paid_at?.slice(0, 7) === targetMonth,
  );
  const targetMonthLabel = new Date(`${paymentDate}T00:00:00`).toLocaleDateString(
    "en-IN",
    { month: "long", year: "numeric" },
  );

  const filtered = debouncedSearch.trim()
    ? members.filter((m) => {
        const q = debouncedSearch.toLowerCase();
        // "GYM-" prefix hata kar match karo - warna "m" ya "y" jaisi
        // query har member ko match kar deti thi kyunki har ID "GYM-"
        // se shuru hoti hai, naam se koi lena dena nahi
        const idDigits = m.member_id.toLowerCase().replace(/^gym-/, "");
        return m.name.toLowerCase().includes(q) || idDigits.includes(q);
      })
    : [];
  const isTyping = search !== debouncedSearch;

  const getNewExpiry = () => {
    // Chuni gayi payment date se shuru karo, lekin agar member abhi bhi
    // active hai aur uski expiry us date se aage hai (advance payment),
    // wahi se aage badhao - backend isi tarah calculate karta hai
    let base = new Date(`${paymentDate}T00:00:00`);
    if (selectedMember?.expires_at) {
      const currentExpiry = new Date(selectedMember.expires_at);
      if (currentExpiry > base) base = currentExpiry;
    }
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

      // payments + members dono RLS-locked hain - owner-verified backend
      // route hi insert/update karta hai (amount khud owner ke set kiye
      // fees se nikalta hai), aur invoice email bhi wahi bhej deta hai
      const res = await apiFetch("/api/payment/log", {
        method: "POST",
        body: JSON.stringify({
          memberId: selectedMember.id,
          plan,
          method,
          upiRef,
          paymentDate,
        }),
      });

      if (!res.success) throw new Error(res.message || res.error || "Failed to log payment");

      toast.success(`Payment logged! New expiry: ${newExpiry.formatted}`);
      navigate("/owner/payments");
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
        >
          <FiArrowLeft size={15} />
        </button>
        <h1 className="text-xl font-extrabold text-white">Log Payment</h1>
      </div>

      {/* Step 1 — Select Member */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Step 1 — Select Member
      </p>

      {!selectedMember ? (
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 mb-3">
            <IoSearchOutline size={15} className="text-slate-500" />
            <input
              placeholder="Type a name or member ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
            {isTyping && search && (
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-violet-400 rounded-full animate-spin flex-shrink-0" />
            )}
          </div>

          {membersLoading ? (
            <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3.5 w-28 bg-white/5 rounded animate-pulse" />
                    <div className="h-2.5 w-16 bg-white/5 rounded animate-pulse mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !debouncedSearch.trim() ? (
            <div className="text-center py-10 bg-[#1a1a2e] border border-white/7 rounded-xl">
              <IoSearchOutline size={22} className="text-slate-600 mx-auto mb-1.5" />
              <p className="text-slate-500 text-sm">
                Start typing a name or member ID to search
              </p>
            </div>
          ) : (
            <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5">
              {filtered.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMember(m)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-white/5"
                >
                  <MemberAvatar member={m} />
                  <div>
                    <p className="text-white text-sm font-bold">{m.name}</p>
                    <p className="text-slate-400 text-xs">{m.member_id}</p>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <IoPeopleOutline size={22} className="text-slate-600 mx-auto mb-1.5" />
                  <p className="text-slate-500 text-sm">No members found</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-violet-600/15 border border-violet-500/30 rounded-2xl p-3 flex items-center gap-3 mb-4">
          <MemberAvatar member={selectedMember} size="w-11 h-11" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">
              {selectedMember.name}
            </p>
            <p className="text-slate-400 text-xs">{selectedMember.member_id}</p>
          </div>
          {!isPrefilled && (
            <button
              onClick={() => setSelectedMember(null)}
              className="text-violet-300 text-xs font-bold flex-shrink-0"
            >
              Change
            </button>
          )}
        </div>
      )}

      {/* Step 2 — Payment Date */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Step 2 — Payment Date
      </p>
      <div className="mb-1.5">
        <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3">
          <IoCalendarOutline size={15} className="text-slate-500" />
          <input
            type="date"
            lang="en-GB"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="bg-transparent outline-none text-white text-sm flex-1"
          />
        </div>
      </div>
      <p className="text-slate-500 text-[11px] mb-4">
        Paying in advance for a future month? Pick that month's date here.
      </p>

      {/* Step 3 — Plan */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Step 3 — Select Plan
      </p>
      <div className="flex gap-2 mb-4">
        {["monthly", "quarterly", "yearly"].map((p) => (
          <button
            key={p}
            onClick={() => setPlan(p)}
            className={`flex-1 rounded-xl p-2.5 text-center border transition-all
              ${
                plan === p
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "bg-[#1a1a2e] border-white/10 text-slate-400"
              }`}
          >
            <div className="text-xs font-bold capitalize">{p}</div>
            {pricesLoading ? (
              <div className="h-3.5 w-10 bg-white/10 rounded animate-pulse mx-auto mt-1" />
            ) : (
              <div className="text-sm font-extrabold mt-0.5">
                ₹{(planPrices[p] || 0).toLocaleString("en-IN")}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Step 4 — Method */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Step 4 — Payment Method
      </p>
      <div className="flex gap-2 mb-4">
        {[
          { key: "cash", icon: IoCashOutline, label: "Cash" },
          { key: "upi", icon: FiSmartphone, label: "UPI" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMethod(m.key)}
            className={`flex-1 rounded-xl p-3 text-center border transition-all
              ${
                method === m.key
                  ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                  : "bg-[#1a1a2e] border-white/10 text-slate-400"
              }`}
          >
            <m.icon size={18} className="mx-auto mb-0.5" />
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
            <FiLink size={14} className="text-slate-500" />
            <input
              placeholder="Transaction ID"
              value={upiRef}
              onChange={(e) => setUpiRef(e.target.value)}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>
      )}

      {selectedMember && alreadyPaidThisMonth ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 flex items-center gap-2">
          <IoWarningOutline size={16} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-amber-400 text-xs font-bold">Already Paid</p>
            <p className="text-white text-sm mt-0.5">
              This member already has a payment logged for {targetMonthLabel}.
              Pick a different month above if this is a mistake.
            </p>
          </div>
        </div>
      ) : (
        selectedMember && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4 flex items-center gap-2">
            <IoCalendarOutline size={16} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-400 text-xs font-bold">New Expiry Date</p>
              <p className="text-white font-extrabold text-lg mt-0.5">
                {getNewExpiry().formatted}
              </p>
            </div>
          </div>
        )
      )}

      <button
        onClick={handleConfirm}
        disabled={
          !selectedMember ||
          loading ||
          pricesLoading ||
          checkingPayments ||
          alreadyPaidThisMonth
        }
        className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          "Saving..."
        ) : alreadyPaidThisMonth ? (
          "Already Paid This Month"
        ) : (
          <>
            <IoCheckmarkCircle size={16} />
            Confirm — ₹{(planPrices[plan] || 0).toLocaleString("en-IN")}
          </>
        )}
      </button>
    </div>
  );
}

export default LogPayment;
