import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import useAuthStore from "./store/authStore";

// Member Pages
import Splash from "./pages/member/Splash";
import Login from "./pages/member/Login";
import Register from "./pages/member/Register";
import PendingApproval from "./pages/member/PendingApproval";
import Home from "./pages/member/Home";
import Workout from "./pages/member/Workout";
import Attendance from "./pages/member/Attendance";
import Payments from "./pages/member/Payments";
import Profile from "./pages/member/Profile";
import Diet from "./pages/member/Diet";
import DietOverall from "./pages/member/DietOverall";
import Progress from "./pages/member/Progress";

// Owner Pages
import OwnerLogin from "./pages/owner/OwnerLogin";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import MembersList from "./pages/owner/MembersList";
import AddMember from "./pages/owner/AddMember";
import MemberDetail from "./pages/owner/MemberDetail";
import EditMember from "./pages/owner/EditMember";
import LogPayment from "./pages/owner/LogPayment";
import OwnerPayments from "./pages/owner/OwnerPayments";
import OwnerAttendance from "./pages/owner/OwnerAttendance";
import Videos from "./pages/owner/Videos";
import UploadVideo from "./pages/owner/UploadVideo";
import Reports from "./pages/owner/Reports";
import Settings from "./pages/owner/Settings";

// Components
import BottomNav from "./components/BottomNav";
import OwnerBottomNav from "./components/OwnerBottomNav";

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
  const { isLoggedIn, role, user } = useAuthStore();
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
      <BackButtonHandler />

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
          path="/diet/overall"
          element={
            <MemberRoute>
              <DietOverall />
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

      {/* Bottom Navigation */}
      {isLoggedIn && role === "member" && user?.status !== "pending" && (
        <BottomNav />
      )}
      {isLoggedIn && role === "owner" && <OwnerBottomNav />}
    </BrowserRouter>
  );
}

export default App;
