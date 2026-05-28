import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Homepage from './route/Homepage';
import Survey from './route/Survey';
import Placeholder from './route/Placeholder';
import { ProtectedRoute } from './feature/auth/protectedRoute';
import ForgotPasswordPage from './feature/auth/forgotPasswordPage';
import RegisterPage from './feature/auth/registerPage';
import LoginPage from './feature/auth/loginPage';

// App.tsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/home"            element={<Navigate to="/" replace />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/"         element={<Homepage />} />
          <Route path="/survey"   element={<Survey />} />
          <Route path="/battle"   element={<Placeholder title="Battle" />} />
          <Route path="/practice" element={<Placeholder title="Practice" />} />
          <Route path="/history"  element={<Placeholder title="History" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
