import { Route, Routes } from 'react-router-dom';
import FieldSelectPage from './pages/FieldSelectPage';
import ModeSelectPage from './pages/ModeSelectPage';
import BattleArenaPage from './pages/BattleArenaPage';
import BattleResultPage from './pages/BattleResultPage';

const BattleRoutes = () => {
  return (
    <Routes>
      <Route index element={<FieldSelectPage />} />
      <Route path="mode" element={<ModeSelectPage />} />
      <Route path="arena/:battleId" element={<BattleArenaPage />} />
      <Route path="result/:battleId" element={<BattleResultPage />} />
    </Routes>
  );
};
export default BattleRoutes;
