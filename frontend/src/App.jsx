import { useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import useAuthStore from "./store/authStore";
import { apiFetch } from "./lib/api";
import { ToastContainer } from "react-toastify";
import { toast } from "./lib/toast";
import "react-toastify/dist/ReactToastify.css";

// Har page ab apna alag chunk hai - pehle sab 27 pages ek hi bade JS
// bundle mein aate the, chahe user Login pe ho ya Home pe. lazy() se
// sirf jo route actually visit ho raha hai uska code download hota hai,
// baaki baad mein (ya kabhi nahi, agar member ne Owner ke pages kabhi
// visit hi na kiye)

// Bottom-nav wale tabs ke import functions alag rakhe hain taaki inhe
// prefetch bhi kiya ja sake (neeche RoutePrefetcher dekho) - lazy() ko
// wahi function dobara dena safe hai, bundler ise ek hi baar load karta
// hai aur baad mein cached promise wapas kar deta hai
const importHome = () => import("./pages/member/Home");
const importWorkout = () => import("./pages/member/Workout");
const importDiet = () => import("./pages/member/Diet");
const importAttendance = () => import("./pages/member/Attendance");
const importProfile = () => import("./pages/member/Profile");

const importOwnerDashboard = () => import("./pages/owner/OwnerDashboard");
const importMembersList = () => import("./pages/owner/MembersList");
const importOwnerPayments = () => import("./pages/owner/OwnerPayments");
const importVideos = () => import("./pages/owner/Videos");
const importSettings = () => import("./pages/owner/Settings");

// Member Pages
const Splash = lazy(() => import("./pages/member/Splash"));
const Login = lazy(() => import("./pages/member/Login"));
const Register = lazy(() => import("./pages/member/Register"));
const PendingApproval = lazy(() => import("./pages/member/PendingApproval"));
const Home = lazy(importHome);
const Workout = lazy(importWorkout);
const Attendance = lazy(importAttendance);
const Payments = lazy(() => import("./pages/member/Payments"));
const Profile = lazy(importProfile);
const Diet = lazy(importDiet);
const Progress = lazy(() => import("./pages/member/Progress"));
const CalorieCounter = lazy(() => import("./pages/member/CalorieCounter"));

// Owner Pages
const OwnerLogin = lazy(() => import("./pages/owner/OwnerLogin"));
const OwnerDashboard = lazy(importOwnerDashboard);
const MembersList = lazy(importMembersList);
const AddMember = lazy(() => import("./pages/owner/AddMember"));
const MemberDetail = lazy(() => import("./pages/owner/MemberDetail"));
const EditMember = lazy(() => import("./pages/owner/EditMember"));
const LogPayment = lazy(() => import("./pages/owner/LogPayment"));
const OwnerPayments = lazy(importOwnerPayments);
const OwnerAttendance = lazy(() => import("./pages/owner/OwnerAttendance"));
const Videos = lazy(importVideos);
const UploadVideo = lazy(() => import("./pages/owner/UploadVideo"));
const Reports = lazy(() => import("./pages/owner/Reports"));
const Settings = lazy(importSettings);

// Components — chhote, hamesha-zaroori UI chrome hain, inhe lazy karne
// ka koi fayda nahi (Suspense flicker add karega bina kisi bundle-size
// fayde ke)
import BottomNav from "./components/BottomNav";
import OwnerBottomNav from "./components/OwnerBottomNav";

// Route chunk download hote waqt ye dikhta hai - zyadatar bahut jaldi
// (ya cache se turant) hoga, isliye simple spinner hi kaafi hai
function RouteLoader() {
  return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-violet-500 rounded-full animate-spin"></div>
    </div>
  );
}

// ── Route Prefetcher ────────────────────────────────────
// Login ke baad, jab browser idle ho, saare bottom-nav tabs ka JS chunk
// chup-chaap pehle hi download kar lo. Isse tab switch karte waqt
// network ka wait hi nahi hota - chunk already memory mein hota hai,
// page turant render ho jaata hai (RouteLoader spinner dikhta hi nahi)
function RoutePrefetcher() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    if (!isLoggedIn) return;

    const tabs =
      role === "owner"
        ? [
            importOwnerDashboard,
            importMembersList,
            importOwnerPayments,
            importVideos,
            importSettings,
          ]
        : [
            importHome,
            importWorkout,
            importDiet,
            importAttendance,
            importProfile,
          ];

    // requestIdleCallback har browser mein nahi hai (Safari), isliye
    // fallback - dono case mein ye kaam current render ko block nahi karta
    const runWhenIdle =
      window.requestIdleCallback || ((cb) => setTimeout(cb, 300));
    const cancelIdle = window.cancelIdleCallback || clearTimeout;

    const handle = runWhenIdle(() => {
      tabs.forEach((load) => {
        load().catch(() => {
          // Prefetch fail hona koi badi baat nahi - jab user actually us
          // tab pe jaayega tab lazy() khud dobara try karega
        });
      });
    });

    return () => cancelIdle(handle);
  }, [isLoggedIn, role]);

  return null;
}

// ── Back Button Handler ─────────────────────────────────
function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const memberTabs = [
      "/workout",
      "/diet",
      "/attendance",
      "/payments",
      "/profile",
    ];
    const ownerTabs = [
      "/owner/members",
      "/owner/payments",
      "/owner/videos",
      "/owner/settings",
    ];

    const isSubPage =
      memberTabs.includes(location.pathname) ||
      ownerTabs.includes(location.pathname);

    if (isSubPage) {
      window.history.pushState({ intercepted: true }, "");
    }

    const handleBack = () => {
      if (memberTabs.includes(location.pathname)) {
        window.history.pushState({ intercepted: true }, "");
        navigate("/home", { replace: true });
        return;
      }
      if (ownerTabs.includes(location.pathname)) {
        window.history.pushState({ intercepted: true }, "");
        navigate("/owner/dashboard", { replace: true });
        return;
      }
    };

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [location.pathname]);

  return null;
}

// ── Route Guards ────────────────────────────────────────
function MemberRoute({ children }) {
  const { isLoggedIn, role, user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Owner ne member ko delete kar diya ho (DB se seedha, ya Reject se) to
  // us member ki app kabhi bata nahi paati - wo Home/Payments/etc. pe kaam
  // karta reh sakta hai jab tak khud logout na kare. Har member route pe
  // periodically check karo ki row abhi bhi exist karti hai
  useEffect(() => {
    if (!isLoggedIn || role !== "member" || !user?.id) return;

    const checkStillExists = async () => {
      try {
        const res = await apiFetch("/api/members/me");
        // Network/token issues yahan bhi aa sakti hain - sirf specific
        // "row genuinely nahi mili" wale case mein hi logout karna hai
        if (!res.success && res.message === "No member account found for this login") {
          toast.error("Your membership account was removed by the gym owner.");
          logout();
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.log("checkStillExists error:", err);
      }
    };

    checkStillExists();
    const interval = setInterval(checkStillExists, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, role, user?.id]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role !== "member") return <Navigate to="/owner/dashboard" replace />;
  if (user?.status === "pending") return <Navigate to="/pending" replace />;
  return children;
}

function PendingRoute({ children }) {
  const { isLoggedIn, role } = useAuthStore();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role !== "member") return <Navigate to="/owner/dashboard" replace />;
  return children;
}

function OwnerRoute({ children }) {
  const { isLoggedIn, role } = useAuthStore();
  if (!isLoggedIn) return <Navigate to="/owner/login" replace />;
  if (role !== "owner") return <Navigate to="/home" replace />;
  return children;
}

// ── Main App ────────────────────────────────────────────
function App() {
  const { isLoggedIn, role, user } = useAuthStore();

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        theme="dark"
        toastClassName="!bg-[#1a1a2e] !border !border-white/10 !rounded-xl"
      />
      <BackButtonHandler />
      <RoutePrefetcher />

      <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/owner/login" element={<OwnerLogin />} />

        {/* Pending Approval */}
        <Route
          path="/pending"
          element={
            <PendingRoute>
              <PendingApproval />
            </PendingRoute>
          }
        />

        {/* Member Routes */}
        <Route
          path="/home"
          element={
            <MemberRoute>
              <Home />
            </MemberRoute>
          }
        />
        <Route
          path="/workout"
          element={
            <MemberRoute>
              <Workout />
            </MemberRoute>
          }
        />
        <Route
          path="/diet"
          element={
            <MemberRoute>
              <Diet />
            </MemberRoute>
          }
        />
        <Route
          path="/calories"
          element={
            <MemberRoute>
              <CalorieCounter />
            </MemberRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <MemberRoute>
              <Progress />
            </MemberRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <MemberRoute>
              <Attendance />
            </MemberRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <MemberRoute>
              <Payments />
            </MemberRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <MemberRoute>
              <Profile />
            </MemberRoute>
          }
        />

        {/* Owner Routes */}
        <Route
          path="/owner/dashboard"
          element={
            <OwnerRoute>
              <OwnerDashboard />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/members"
          element={
            <OwnerRoute>
              <MembersList />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/members/add"
          element={
            <OwnerRoute>
              <AddMember />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/members/:id"
          element={
            <OwnerRoute>
              <MemberDetail />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/members/edit/:id"
          element={
            <OwnerRoute>
              <EditMember />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/payments"
          element={
            <OwnerRoute>
              <OwnerPayments />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/payments/log"
          element={
            <OwnerRoute>
              <LogPayment />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/attendance"
          element={
            <OwnerRoute>
              <OwnerAttendance />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/videos"
          element={
            <OwnerRoute>
              <Videos />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/videos/upload"
          element={
            <OwnerRoute>
              <UploadVideo />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/videos/edit/:id"
          element={
            <OwnerRoute>
              <UploadVideo />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/reports"
          element={
            <OwnerRoute>
              <Reports />
            </OwnerRoute>
          }
        />
        <Route
          path="/owner/settings"
          element={
            <OwnerRoute>
              <Settings />
            </OwnerRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>

      {/* Bottom Navigation */}
      {isLoggedIn && role === "member" && user?.status !== "pending" && (
        <BottomNav />
      )}
      {isLoggedIn && role === "owner" && <OwnerBottomNav />}
    </BrowserRouter>
  );
}

export default App;
