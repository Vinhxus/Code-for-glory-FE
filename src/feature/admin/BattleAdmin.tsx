import { useState, useEffect, useCallback } from 'react';
import Header from '../../components/layout/Header';
import SideNav from '../../components/SideNav';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────
// Kiểu dữ liệu (Interfaces) theo đúng cấu trúc Schema NestJS
// ─────────────────────────────────────────────────────────────────────────
type ChallengeDifficulty = 'Legendary' | 'Elite' | 'Standard';

interface BattleProblem {
  id: string;
  title: string;
  difficulty: ChallengeDifficulty;
  tags: string[];
  timesPlayed: string;
  successRate: number;
  iconType: 'orange_box' | 'green_flash';
}

interface AdminConfigResponse {
  _id: string;
  scope: string;
  key: string;
  value: {
    title: string;
    difficulty: ChallengeDifficulty;
    tags: string[];
    timesPlayed: string;
    successRate: number;
    iconType: 'orange_box' | 'green_flash';
  };
  description?: string;
  version: number;
}

// Lấy URL từ biến môi trường hoặc chạy mặc định ở localhost
const API_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/admin/configs';

// ─────────────────────────────────────────────────────────────────────────
// Sub-components hiển thị giao diện
// ─────────────────────────────────────────────────────────────────────────
function BattleProblemCard({
  problem,
  onEdit,
  onDelete,
}: {
  problem: BattleProblem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const diffColors: Record<ChallengeDifficulty, string> = {
    Legendary: 'var(--cg-amber)',
    Elite: '#a855f7',
    Standard: '#3b82f6',
  };

  return (
    <div className="glass-card flex flex-col justify-between rounded-2xl p-5 relative overflow-hidden group">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: diffColors[problem.difficulty] }}
            >
              {problem.difficulty} CHALLENGE
            </span>
            <h4 className="mt-1 text-sm font-bold truncate max-w-[180px]">
              {problem.title}
            </h4>
          </div>

          <span
            className="material-symbols-outlined rounded-lg p-1 text-sm"
            style={{
              background: 'var(--cg-container-a22)',
              color:
                problem.iconType === 'green_flash'
                  ? 'var(--cg-green)'
                  : 'var(--cg-coral)',
            }}
          >
            {problem.iconType === 'green_flash' ? 'bolt' : 'inventory_2'}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider"
              style={{
                background: 'var(--cg-container-a16)',
                color: 'var(--cg-text-muted)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-dashed border-white/10 pt-4">
          <div>
            <p
              className="text-[10px] font-semibold tracking-wide"
              style={{ color: 'var(--cg-text-muted)' }}
            >
              TIMES PLAYED
            </p>
            <p className="text-sm font-bold mt-0.5">{problem.timesPlayed}</p>
          </div>
          <div>
            <p
              className="text-[10px] font-semibold tracking-wide"
              style={{ color: 'var(--cg-text-muted)' }}
            >
              SUCCESS RATE
            </p>
            <p
              className="text-sm font-bold mt-0.5"
              style={{
                color:
                  problem.successRate > 50
                    ? 'var(--cg-green)'
                    : 'var(--cg-coral)',
              }}
            >
              {problem.successRate}%
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onEdit}
          className="cursor-pointer p-1 text-white/40 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-base">edit</span>
        </button>
        <button
          onClick={onDelete}
          className="cursor-pointer p-1 text-white/40 hover:text-white/80 transition-colors"
        >
          <span className="material-symbols-outlined text-base">delete</span>
        </button>
      </div>
    </div>
  );
}

function DesignScenarioCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-white/20 transition-all text-center min-h-[190px]"
      style={{ background: 'var(--cg-container-a04)' }}
    >
      <span
        className="material-symbols-outlined text-xl"
        style={{ color: 'var(--cg-coral)' }}
      >
        add_circle
      </span>
      <h4 className="mt-3 text-xs font-bold">Design New Battle Scenario</h4>
      <p
        className="text-[11px] mt-1 max-w-[160px]"
        style={{ color: 'var(--cg-text-muted)' }}
      >
        Deploy new algorithmic challenges to the arena
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Component chính (Main Component)
// ─────────────────────────────────────────────────────────────────────────
export default function BattleAdmin() {
  const [configs, setConfigs] = useState<AdminConfigResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Hàm tải dữ liệu từ Backend
  useEffect(() => {
    // Định nghĩa hàm async ngay bên trong effect
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_URL}/scope/battle`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Cannot loading battle lists!');
        const data = await res.json();
        setConfigs(data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu từ BE:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Kích hoạt gọi hàm
    fetchData();
  }, []); // Mảng dependency rỗng giúp chạy duy nhất 1 lần khi trang được nạp

  // Hàm xử lý xóa bài tập (Delete)
  const handleDelete = async (scope: string, key: string) => {
    if (!window.confirm('Do you want to delete it?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/scope/${scope}/key/${key}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setConfigs((prev) => prev.filter((item) => item.key !== key));
      } else {
        alert('Xóa thất bại từ phía server.');
      }
    } catch (err) {
      console.error('Lỗi khi xóa cấu hình:', err);
    }
  };

  const handleEdit = (key: string) => {
    console.log('Edit challenge với key:', key);
    // Bạn có thể dùng navigate(`/admin/battle/edit/${key}`) tại đây
  };

  const handleCreateNew = () => {
    navigate('/admin/battle/create'); // Chuyển sang trang tạo bài tập
  };

  // Lọc danh sách Client-side theo ô tìm kiếm
  const filteredConfigs = configs.filter((config) =>
    config.value.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#0a0a2e] text-white font-sans select-none">
      <Header />
      <SideNav />

      <div className="ml-16 mt-12 p-6 flex flex-col gap-6 max-w-[1600px]">
        {/* TOP BAR: Tìm kiếm và nút bấm chức năng */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search battle problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#161646] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <button className="flex items-center gap-1.5 bg-[#161646] border border-white/10 rounded-xl px-4 py-2 text-sm cursor-pointer hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-sm">tune</span>
              Filters
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#7fff00] font-bold rounded-xl px-5 py-2 text-sm shadow-lg hover:opacity-95 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create New Problem
          </button>
        </div>

        {/* BỘ LỌC ĐANG HOẠT ĐỘNG (FILTER TAGS) */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-white/5 border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 text-white/60">
            Mode: All
            <span className="material-symbols-outlined text-xs cursor-pointer hover:text-white">
              close
            </span>
          </span>
          <span className="border border-white/5 bg-white/5 opacity-50 rounded-full px-3 py-1 text-white/40">
            Difficulty: Legendary
          </span>
          <span className="border border-white/5 bg-white/5 opacity-50 rounded-full px-3 py-1 text-white/40">
            Tag: Recursion
          </span>
          <span className="border border-white/5 bg-white/5 opacity-50 rounded-full px-3 py-1 text-white/40">
            Tag: Big O
          </span>
        </div>

        {/* GRID DANH SÁCH BÀI TẬP BATTLE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {isLoading ? (
            <p className="col-span-3 text-center text-sm text-white/50 py-10">
              Đang tải dữ liệu từ server...
            </p>
          ) : filteredConfigs.length === 0 ? (
            <p className="col-span-3 text-center text-sm text-white/40 py-10">
              Do not find suitable match.
            </p>
          ) : (
            filteredConfigs.map((config) => (
              <BattleProblemCard
                key={config._id}
                problem={{
                  id: config._id,
                  title: config.value.title,
                  difficulty: config.value.difficulty,
                  tags: config.value.tags,
                  timesPlayed: config.value.timesPlayed,
                  successRate: config.value.successRate,
                  iconType: config.value.iconType,
                }}
                onEdit={() => handleEdit(config.key)}
                onDelete={() => handleDelete(config.scope, config.key)}
              />
            ))
          )}
          <DesignScenarioCard onClick={handleCreateNew} />
        </div>

        {/* SECTION BOTTOM: THỐNG KÊ DASHBOARD BATTLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
          {/* Card Arena Health */}
          <div className="glass-card rounded-2xl p-5 md:col-span-1">
            <h4 className="text-xs font-bold tracking-wide">Arena Health</h4>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: 'var(--cg-text-muted)' }}
            >
              Your challenges are currently engaging 1,240 active battlers per
              hour.
            </p>
            {/* Biểu đồ cột mini */}
            <div className="flex items-end gap-2 h-20 mt-6 px-2">
              <div className="bg-white/10 w-full h-[25%] rounded"></div>
              <div className="bg-white/10 w-full h-[40%] rounded"></div>
              <div className="bg-[#b45309] w-full h-[65%] rounded"></div>
              <div className="bg-[#f97316] w-full h-[95%] rounded"></div>
              <div className="bg-white/10 w-full h-[50%] rounded"></div>
              <div className="bg-[#b45309] w-full h-[80%] rounded"></div>
            </div>
          </div>

          {/* Card Số bài tập Top Tier */}
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-center items-center text-center min-h-[150px]">
            <span className="material-symbols-outlined text-amber-400 text-lg">
              stars
            </span>
            <p className="text-2xl font-extrabold mt-2">12</p>
            <p
              className="text-[10px] font-bold tracking-wider mt-0.5"
              style={{ color: 'var(--cg-text-muted)' }}
            >
              TOP TIER PROBLEMS
            </p>
          </div>

          {/* Card Tỷ lệ tăng trưởng tuần */}
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-center items-center text-center min-h-[150px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none" />
            <span className="material-symbols-outlined text-green-400 text-lg">
              trending_up
            </span>
            <p className="text-2xl font-extrabold mt-2 text-[#7fff00]">+14%</p>
            <p
              className="text-[10px] font-bold tracking-wider mt-0.5"
              style={{ color: 'var(--cg-text-muted)' }}
            >
              WEEKLY SUCCESS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
