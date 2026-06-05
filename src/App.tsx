import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Homepage from './route/Homepage';
import Survey from './route/Survey';
import Placeholder from './route/Placeholder';

import OnboardingQuiz from './route/OnboardingQuiz';
import OnboardingAssessment from './route/OnboardingAssessment';
import OnboardingSummary from './route/OnboardingSummary';
import Practice from './route/Practice';
import LearningPath from './route/LearningPath';

import { ProtectedRoute } from './feature/auth/protectedRoute';
import ForgotPasswordPage from './feature/auth/forgotPasswordPage';
import RegisterPage from './feature/auth/registerPage';
import LoginPage from './feature/auth/loginPage';
import Tracking from './feature/history/Tracking';
import TabComponent from './feature/history';
import { useAuth } from './feature/auth/useAuth';
import BattleRoutes from './feature/battle/BattleRoutes';

// App.tsx
function App() {
  const { isAuthenticated } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route index element={<Navigate to="/login" replace />} />{' '}
        {/* redirect root là login page */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />{' '}
        {/* login rồi thì không vào lại login */}
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/survey" element={<Survey />} />

          <Route path="/learning-path" element={<LearningPath />} />
          <Route path="/onboarding/quiz" element={<OnboardingQuiz />} />
          <Route
            path="/onboarding/assessment"
            element={<OnboardingAssessment />}
          />
          <Route path="/onboarding/summary" element={<OnboardingSummary />} />

          <Route path="/battle/*" element={<BattleRoutes />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/history" element={<TabComponent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
