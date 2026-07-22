import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";

// Member Pages
import Splash from "./pages/member/Splash";
import Login from "./pages/member/Login";
import Home from "./pages/member/Home";
import Workout from "./pages/member/Workout";
import Attendance from "./pages/member/Attendance";
import Payments from "./pages/member/Payments";
import Profile from "./pages/member/Profile";

// Owner Pages
import OwnerLogin from "./pages/owner/OwnerLogin";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import MembersList from "./pages/owner/MembersList";
import AddMember from "./pages/owner/AddMember";
import MemberDetail from "./pages/owner/MemberDetail";
import LogPayment from "./pages/owner/LogPayment";
import OwnerPayments from "./pages/owner/OwnerPayments";
import OwnerAttendance from "./pages/owner/OwnerAttendance";
import Videos from "./pages/owner/Videos";
import UploadVideo from "./pages/owner/UploadVideo";
import Settings from "./pages/owner/Settings";
import Reports from './pages/owner/Reports'
// Components
import BottomNav from "./components/BottomNav";
import OwnerBottomNav from "./components/OwnerBottomNav";

// Member Protected Route
function MemberRoute({ children }) {
  const { isLoggedIn, role } = useAuthStore();
  if (!isLoggedIn) return <Navigate to="/login" />;
  if (role !== "member") return <Navigate to="/owner/dashboard" />;
  return children;
}

// Owner Protected Route
function OwnerRoute({ children }) {
  const { isLoggedIn, role } = useAuthStore();
  if (!isLoggedIn) return <Navigate to="/owner/login" />;
  if (role !== "owner") return <Navigate to="/home" />;
  return children;
}

function App() {
  const { isLoggedIn, role } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/owner/login" element={<OwnerLogin />} />

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
          path="/owner/payments/log"
          element={
            <OwnerRoute>
              <LogPayment />
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
          path="/owner/settings"
          element={
            <OwnerRoute>
              <Settings />
            </OwnerRoute>
          }
        />
        <Route path="/owner/reports" element={<OwnerRoute><Reports /></OwnerRoute>} />
      </Routes>

      {/* Member Bottom Nav */}
      {isLoggedIn && role === "member" && <BottomNav />}

      {/* Owner Bottom Nav */}
      {isLoggedIn && role === "owner" && <OwnerBottomNav />}
    </BrowserRouter>
  );
}

export default App;
