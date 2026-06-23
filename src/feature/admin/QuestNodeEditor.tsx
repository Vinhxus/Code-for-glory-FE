import { useState } from 'react';
import Header from '../../components/layout/Header';
import SideNav from '../../components/SideNav';
import { useNavigate } from 'react-router-dom';

type NodeState = 'completed' | 'current' | 'locked';

interface MapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state: NodeState;
  icon: string;
}

interface MapEdge {
  from: string;
  to: string;
  dashed?: boolean;
}

const NODES: MapNode[] = [
  {
    id: 'html',
    label: 'HTML Layouts',
    x: 520,
    y: 60,
    state: 'completed',
    icon: 'inventory_2',
  },
  {
    id: 'js',
    label: 'JS Basics',
    x: 430,
    y: 150,
    state: 'completed',
    icon: 'inventory_2',
  },
  {
    id: 'async',
    label: 'Async Mastery',
    x: 525,
    y: 235,
    state: 'current',
    icon: 'bolt',
  },
  {
    id: 'addnode',
    label: 'Add Node',
    x: 760,
    y: 180,
    state: 'locked',
    icon: 'add',
  },
  {
    id: 'backend',
    label: 'Node Backend',
    x: 605,
    y: 315,
    state: 'locked',
    icon: 'lock',
  },
];

const EDGES: MapEdge[] = [
  { from: 'js', to: 'html' },
  { from: 'js', to: 'async' },
  { from: 'async', to: 'addnode', dashed: true },
  { from: 'addnode', to: 'backend', dashed: true },
];

const SIDEBAR_ITEMS: { icon: string; label: string; active?: boolean }[] = [
  { icon: 'map', label: 'Map', active: true },
  { icon: 'swords', label: 'Battle' },
  { icon: 'fitness_center', label: 'Practice' },
  { icon: 'history', label: 'History' },
];

const DIFFICULTY_MAX = 5;
const CATEGORIES = ['JavaScript', 'HTML', 'CSS', 'Node.js', 'Python'];

function NodeMarker({
  node,
  onClick,
}: {
  node: MapNode;
  onClick?: () => void;
}) {
  const isCurrent = node.state === 'current';
  const isCompleted = node.state === 'completed';

  return (
    <div
      // Kích hoạt hàm onClick khi user bấm vào Node
      onClick={onClick}
      className="flex flex-col items-center gap-2 select-none animate-node cursor-pointer"
    >
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-full border-2"
        style={{
          background: isCurrent ? 'var(--cg-coral)' : 'var(--cg-sidebar)',
          borderColor: isCompleted
            ? 'var(--cg-green)'
            : isCurrent
              ? 'var(--cg-coral)'
              : 'var(--cg-border)',
        }}
      >
        {isCurrent && (
          <span className="absolute inset-0 rounded-full animate-pulse-glow" />
        )}
        <span
          className="material-symbols-outlined relative z-10"
          style={{
            color: isCurrent
              ? '#fff'
              : node.state === 'locked'
                ? 'var(--cg-text-muted)'
                : 'var(--cg-green)',
            fontSize: 26,
          }}
        >
          {node.icon}
        </span>
      </div>
      <span
        className="rounded-md px-2 py-0.5 text-xs font-semibold"
        style={{
          color: isCurrent
            ? 'var(--cg-coral)'
            : node.state === 'locked'
              ? 'var(--cg-text-muted)'
              : 'var(--cg-text)',
          background: isCurrent ? 'var(--cg-bg-a72)' : 'transparent',
          border: isCurrent ? '1px solid var(--cg-coral)' : 'none',
        }}
      >
        {node.label}
      </span>
    </div>
  );
}

function Connector({ from, to, dashed }: MapEdge) {
  const nodeA = NODES.find((n) => n.id === from);
  const nodeB = NODES.find((n) => n.id === to);

  if (!nodeA || !nodeB) return null;

  // +32 = bán kính node (h-16 w-16 = 64px) để lấy đúng tâm
  const x1 = nodeA.x + 32;
  const y1 = nodeA.y + 32;
  const x2 = nodeB.x + 32;
  const y2 = nodeB.y + 32;

  const active = nodeA.state !== 'locked' && nodeB.state !== 'locked';

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={active ? 'var(--cg-green)' : 'var(--cg-border)'}
      strokeWidth={2}
      strokeDasharray={dashed ? '6 6' : undefined}
      opacity={active ? 0.85 : 0.6}
      style={
        dashed ? { animation: 'dash-march 1.2s linear infinite' } : undefined
      }
    />
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div
      className="flex h-[42px] items-center gap-1 rounded-xl px-3"
      style={{
        background: 'var(--cg-container-a16)',
        border: '1px solid var(--cg-border)',
      }}
    >
      {Array.from({ length: DIFFICULTY_MAX }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          aria-label={`Set difficulty to ${i + 1}`}
          className="leading-none"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 18,
              color: i < value ? 'var(--cg-amber)' : 'var(--cg-text-muted)',
              fontVariationSettings:
                i < value
                  ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                  : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
            }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────
export default function QuestNodeEditor() {
  const navigate = useNavigate(); // Khởi tạo hàm điều hướng

  // ... các state cũ của bạn (title, category, zoom, position...)
  // zoom
  // 1. Thêm các state quản lý tọa độ dịch chuyển và trạng thái kéo
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 1.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.6));
  // Reset zoom đồng thời đưa bản đồ về tâm vị trí cũ (0, 0)
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // 2. Xử lý khi bắt đầu nhấn chuột xuống để kéo
  const handleMouseDown = (e: React.MouseEvent) => {
    // Chỉ kéo khi nhấn chuột trái
    if (e.button !== 0) return;
    setIsDragging(true);
    // Lưu vị trí chuột hiện tại trừ đi vị trí hiện tại của bản đồ
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // 3. Xử lý khi đang di chuột để dịch chuyển bản đồ
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  // 4. Dừng kéo khi thả chuột ra
  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState(3);
  const [prereqs, setPrereqs] = useState<string[]>([
    'Promises 101',
    'ES6 Syntax',
  ]);
  const [theory, setTheory] = useState('');
  const [practice, setPractice] = useState(
    `// Complete the function to fetch user data\nasync function getUser(id) {\n  try {\n    // Your code here\n  } catch(err) { ... }\n}`
  );
  const [newPrereq, setNewPrereq] = useState('');
  const [addingPrereq, setAddingPrereq] = useState(false);

  const removePrereq = (p: string) =>
    setPrereqs((cur) => cur.filter((x) => x !== p));

  const addPrereq = () => {
    const val = newPrereq.trim();
    if (val && !prereqs.includes(val)) setPrereqs((cur) => [...cur, val]);
    setNewPrereq('');
    setAddingPrereq(false);
  };

  return (
    <div
      className="flex h-[800px] w-full flex-col overflow-hidden rounded-2xl"
      style={{
        background: 'var(--cg-bg)',
        color: 'var(--cg-text)',
        border: '1px solid var(--cg-border)',
      }}
    >
      <Header />
      <SideNav />

      <div className="flex flex-1 overflow-hidden ml-16 mt-12">
        {/* Icon rail */}
        {/* Config panel */}
        <section
          className="w-[320px] shrink-0 overflow-y-auto p-5"
          style={{
            background: 'var(--cg-container-a16)',
            borderRight: '1px solid var(--cg-border)',
          }}
        >
          <h2 className="text-base font-bold">Configure Quest Node</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--cg-text-muted)' }}>
            Define the parameters for this learning island on the map.
          </p>

          {/* Title */}
          <div className="mt-5">
            <label
              className="mb-1.5 block text-xs font-semibold"
              style={{ color: 'var(--cg-text-muted)' }}
            >
              Node Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Async/Await Mastery"
              className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              style={{
                background: 'var(--cg-container-a22)',
                border: '1px solid var(--cg-border)',
                color: 'var(--cg-text)',
              }}
            />
          </div>

          {/* Category + Difficulty */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold"
                style={{ color: 'var(--cg-text-muted)' }}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--cg-container-a22)',
                  border: '1px solid var(--cg-border)',
                  color: 'var(--cg-text)',
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold"
                style={{ color: 'var(--cg-text-muted)' }}
              >
                Difficulty
              </label>
              <StarRating value={difficulty} onChange={setDifficulty} />
            </div>
          </div>

          {/* Prerequisites */}
          <div className="mt-4">
            <label
              className="mb-1.5 block text-xs font-semibold"
              style={{ color: 'var(--cg-text-muted)' }}
            >
              Prerequisites
            </label>
            <div className="flex flex-wrap gap-2">
              {prereqs.map((p) => (
                <span key={p} className="badge-green">
                  {p}
                  <button
                    onClick={() => removePrereq(p)}
                    aria-label={`Remove ${p}`}
                    className="flex items-center"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 14 }}
                    >
                      close
                    </span>
                  </button>
                </span>
              ))}
            </div>

            {addingPrereq ? (
              <div className="mt-2 flex gap-2">
                <input
                  autoFocus
                  value={newPrereq}
                  onChange={(e) => setNewPrereq(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPrereq()}
                  placeholder="Prerequisite name"
                  className="flex-1 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  style={{
                    background: 'var(--cg-container-a22)',
                    border: '1px solid var(--cg-border)',
                    color: 'var(--cg-text)',
                  }}
                />
                <button onClick={addPrereq} className="neon-btn px-3 text-xs">
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingPrereq(true)}
                className="mt-2 flex items-center gap-1 text-xs font-semibold"
                style={{ color: 'var(--cg-text-muted)' }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 14 }}
                >
                  add
                </span>
                Add Connection
              </button>
            )}
          </div>

          {/* Theory content */}
          <div className="mt-4">
            <label
              className="mb-1.5 block text-xs font-semibold"
              style={{ color: 'var(--cg-text-muted)' }}
            >
              Theory Content
            </label>
            <textarea
              value={theory}
              onChange={(e) => setTheory(e.target.value)}
              placeholder="Describe the core concepts of this quest..."
              rows={4}
              className="w-full resize-none rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: 'var(--cg-container-a22)',
                border: '1px solid var(--cg-border)',
                color: 'var(--cg-text)',
              }}
            />
          </div>

          {/* Practice task */}
          <div className="mt-4">
            <label
              className="mb-1.5 block text-xs font-bold"
              style={{ color: 'var(--cg-coral)' }}
            >
              Practice Task (Code Challenge)
            </label>
            <textarea
              value={practice}
              onChange={(e) => setPractice(e.target.value)}
              rows={7}
              spellCheck={false}
              className="w-full resize-none rounded-xl px-3 py-2 text-[12px] leading-relaxed outline-none"
              style={{
                background: 'var(--cg-bg-a72)',
                border: '1px solid var(--cg-border)',
                color: 'var(--cg-green)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>

          <button className="neon-btn mt-5 w-full py-2.5 text-sm">Enter</button>
        </section>

        {/* Map canvas */}
        <main
          className="relative flex-1 overflow-hidden bg-[#0a0a2e] select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }} // Đổi icon chuột khi hover/drag bản đồ
        >
          {/* Thẻ div bọc ngoài: Kết hợp cả dịch chuyển vị trí (translate) và phóng to (scale) */}
          <div
            className="absolute inset-0 origin-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              // Tắt transition khi đang kéo để giao diện mượt mà, không bị khựng delay theo chuột
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            <svg
              viewBox="0 0 800 420"
              className="absolute inset-0 h-full w-full"
            >
              {EDGES.map((e, i) => (
                <Connector key={i} {...e} />
              ))}
            </svg>

            <div className="absolute inset-0">
              {NODES.map((n) => (
                <div
                  key={n.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: n.x + 32, top: n.y + 32 }}
                  // Chặn nổi bọt chuột xuống để không bị hiểu nhầm là hành động Drag bản đồ
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <NodeMarker
                    node={n}
                    onClick={() => {
                      // Thực hiện nhảy URL sang trang detail của node tương ứng
                      navigate(`/admin/quest-node/${n.id}`);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Zoom controls */}
          <div
            className="absolute right-4 top-4 flex flex-col gap-1 rounded-xl p-1.5 glass-card z-20"
            style={{ cursor: 'default' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleZoomIn}
              className="rounded-lg p-2 cursor-pointer hover:bg-white/10 transition-colors"
              style={{ color: 'var(--cg-text)' }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                zoom_in
              </span>
            </button>
            <button
              onClick={handleZoomOut}
              className="rounded-lg p-2 cursor-pointer hover:bg-white/10 transition-colors"
              style={{ color: 'var(--cg-text)' }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                zoom_out
              </span>
            </button>
            <button
              onClick={handleResetZoom}
              className="rounded-lg p-2 cursor-pointer hover:bg-white/10 transition-colors"
              style={{ color: 'var(--cg-text)' }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                layers
              </span>
            </button>
          </div>

          {/* Legend */}
          <div
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-5 rounded-xl px-4 py-2 text-xs glass-card z-20"
            style={{ color: 'var(--cg-text)', cursor: 'default' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: 'var(--cg-coral)' }}
              />
              Current Editor Node
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: 'var(--cg-green)' }}
              />
              Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: 'var(--cg-text-muted)' }}
              />
              Locked
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
