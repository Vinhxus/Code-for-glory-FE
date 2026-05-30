import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Homepage from './route/Homepage';
import Survey from './route/Survey';
import Placeholder from './route/Placeholder';
import OnboardingQuiz from './route/OnboardingQuiz';
import OnboardingAssessment from './route/OnboardingAssessment';
import OnboardingSummary from './route/OnboardingSummary';
import Practice from './route/Practice';
import LearningPath from './route/LearningPath';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/onboarding/quiz" element={<OnboardingQuiz />} />
        <Route path="/onboarding/assessment" element={<OnboardingAssessment />} />
        <Route path="/onboarding/summary" element={<OnboardingSummary />} />
        <Route path="/battle" element={<Placeholder title="Battle" />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/history" element={<Placeholder title="History" />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
