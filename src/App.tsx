import { Navigate, Route, Routes } from 'react-router-dom';
import Homepage from './route/Homepage';
import LearningPath from './route/LearningPath';
import Survey from './route/Survey';
import Placeholder from './route/Placeholder';
import OnboardingQuiz from './route/OnboardingQuiz';
import OnboardingAssessment from './route/OnboardingAssessment';
import OnboardingSummary from './route/OnboardingSummary';
import Practice from './route/Practice';
import CareerPath from './route/CareerPath';
import CareerPathNode from './route/CareerPathNode';
import Courses from './route/Courses';
import Arena from './route/Arena';
import Pricing from './route/Pricing';
import Events from './route/Events';
import Guilds from './route/Guilds';
import Terms from './route/Terms';
import Privacy from './route/Privacy';
import Support from './route/Support';
import Network from './route/Network';
import Forum from './route/Forum';
import Mobile from './route/Mobile';
import Shop from './route/Shop';
import { profileRoutes } from './route/profileRoot';
import TabComponent from './feature/history';
import { Streak } from './route/Streak';

// Authentication Pages
import LoginPage from './feature/auth/loginPage';
import RegisterPage from './feature/auth/registerPage';
import ForgotPasswordPage from './feature/auth/forgotPasswordPage';

// Route Guards (Bảo mật)
import { ProtectedRoute } from './feature/auth/protectedRoute'; // Đảm bảo đúng path tới file protectedRoute của bạn
import RequireAdmin from './feature/auth/RequireAdmin';
import QuestNodeEditor from './feature/admin/QuestNodeEditor';
import NodeDetail from './feature/admin/NodeDetail';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/*ROUTES BẮT BUỘC ĐĂNG NHẬP (PROTECTED)*/}
      {/* Nếu chưa đăng nhập, ProtectedRoute tự động đưa user về trang /login */}
      <Route element={<ProtectedRoute />}>
        {profileRoutes()}
        <Route path="/" element={<Homepage />} />
        <Route path="/survey" element={<Survey />} />
        <Route
          path="/career-path/:track/:nodeId"
          element={<CareerPathNode />}
        />
        <Route path="/career-path" element={<CareerPath />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/onboarding/quiz" element={<OnboardingQuiz />} />
        <Route
          path="/onboarding/assessment"
          element={<OnboardingAssessment />}
        />
        <Route path="/onboarding/summary" element={<OnboardingSummary />} />
        <Route path="/battle" element={<Placeholder title="Battle" />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/history" element={<TabComponent />} />

        {/* Các đường dẫn từ SideNav */}
        <Route path="/streak" element={<Streak />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/events" element={<Events />} />
        <Route path="/guilds" element={<Guilds />} />
        <Route path="/support" element={<Support />} />
        <Route path="/network" element={<Network />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/mobile" element={<Mobile />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
      </Route>

      {/* Admin*/}
      <Route path="/admin/quest-node">
        <Route index element={<QuestNodeEditor />} />
        <Route path=":nodeId" element={<NodeDetail />} />
      </Route>

      {/* Điều hướng tất cả các link không tồn tại về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
