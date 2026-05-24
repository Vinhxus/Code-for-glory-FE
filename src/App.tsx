import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Homepage from './route/Homepage';
import Survey from './route/Survey';
import Placeholder from './route/Placeholder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/battle" element={<Placeholder title="Battle" />} />
        <Route path="/practice" element={<Placeholder title="Practice" />} />
        <Route path="/history" element={<Placeholder title="History" />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
