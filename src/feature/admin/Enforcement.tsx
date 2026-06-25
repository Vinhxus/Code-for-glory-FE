import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import SideNav from '../../components/SideNav';

type Severity = 'CRITICAL' | 'HIGH' | 'WARNING';
type AnomalyStatus = 'Cooldown Applied' | 'Monitoring' | 'Resolved';
type AnomalyTone = 'coral' | 'amber' | 'green';

interface TopStat {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  progress?: number;
  progressColor?: string;
}

interface SkillBottleneck {
  id: string;
  label: string;
  failures: number;
  percent: number;
  gradient: string;
}

interface ErrorCluster {
  id: string;
  signature: string;
  code: string;
  severity: Severity;
  frequency: number;
  impactCount: number;
}

interface Anomaly {
  id: string;
  icon: string;
  tone: AnomalyTone;
  title: string;
  description: string;
  time: string;
  status: AnomalyStatus;
}

interface AdminConfigResponse {
  _id: string;
  scope: string;
  key: string;
  value: Record<string, unknown>;
}

// Lấy URL từ biến môi trường hoặc chạy mặc định ở localhost
const API_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/admin/configs';

// ─────────────────────────────────────────────────────────────────────────
// Dữ liệu mặc định (Fallback) — dùng khi chưa có dữ liệu từ Backend
// ─────────────────────────────────────────────────────────────────────────
const DEFAULT_STATS: TopStat[] = [
  {
    label: 'Total Errors Triggered',
    value: '14,208',
    sub: '+12% from last epoch',
    subColor: 'var(--cg-coral)',
  },
  {
    label: 'Community Success Rate',
    value: '78.4%',
    progress: 78,
    progressColor: 'var(--cg-green)',
  },
  {
    label: 'Avg. Quota Consumption',
    value: '42/100',
    progress: 42,
    progressColor: 'var(--cg-amber)',
  },
  {
    label: 'Active Penalties',
    value: '152',
    sub: 'Currently restricted users',
    subColor: 'var(--cg-text-muted)',
  },
];

const DEFAULT_BOTTLENECKS: SkillBottleneck[] = [
  {
    id: 'recursion',
    label: 'Recursion Logic',
    failures: 4821,
    percent: 86,
    gradient: 'linear-gradient(90deg, #ff7e5f, #f97316)',
  },
  {
    id: 'async',
    label: 'Async/Await Patterns',
    failures: 3105,
    percent: 65,
    gradient: 'linear-gradient(90deg, #facc15, #fde68a)',
  },
  {
    id: 'memory',
    label: 'Memory Management',
    failures: 1890,
    percent: 45,
    gradient: 'linear-gradient(90deg, #4ade80, #2dd4bf)',
  },
  {
    id: 'dom',
    label: 'DOM Manipulation',
    failures: 942,
    percent: 28,
    gradient: 'linear-gradient(90deg, #4ade80, #2dd4bf)',
  },
];

const DEFAULT_CLUSTERS: ErrorCluster[] = [
  {
    id: 'c1',
    signature: 'Maximum call stack size exceeded',
    code: 'ERR_RECURSION_DEPTH',
    severity: 'CRITICAL',
    frequency: 2410,
    impactCount: 54,
  },
  {
    id: 'c2',
    signature: "Cannot read property 'then' of undefined",
    code: 'ERR_ASYNC_UNCLEAN',
    severity: 'HIGH',
    frequency: 1855,
    impactCount: 31,
  },
  {
    id: 'c3',
    signature: 'Memory leak detected in persistent listener',
    code: 'ERR_MEM_LEAK',
    severity: 'WARNING',
    frequency: 642,
    impactCount: 12,
  },
];

const DEFAULT_ANOMALIES: Anomaly[] = [
  {
    id: 'a1',
    icon: 'warning',
    tone: 'coral',
    title: 'Syntax Exception',
    description:
      "User 'Adventurer_99' failed 'Shadow Crypt' validation for the 9th time.",
    time: '2s ago',
    status: 'Cooldown Applied',
  },
  {
    id: 'a2',
    icon: 'sync_problem',
    tone: 'amber',
    title: 'Rate Limit Warning',
    description:
      "Unusual activity burst detected in 'The Great Plains' region.",
    time: '15s ago',
    status: 'Monitoring',
  },
  {
    id: 'a3',
    icon: 'check_circle',
    tone: 'green',
    title: 'System Recovery',
    description: "Memory usage stabilized after 'Void Loop' incident cleanup.",
    time: '1m ago',
    status: 'Resolved',
  },
];

function TopStatCard({ stat }: { stat: TopStat }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <p className="text-[11px]" style={{ color: 'var(--cg-text-muted)' }}>
        {stat.label}
      </p>
      <p
        className="text-2xl font-extrabold mt-1.5"
        style={{ color: 'var(--cg-text)' }}
      >
        {stat.value}
      </p>

      {stat.progress !== undefined ? (
        <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${stat.progress}%`,
              background: stat.progressColor,
            }}
          />
        </div>
      ) : (
        <p
          className="text-[10px] mt-2 flex items-center gap-1"
          style={{ color: stat.subColor }}
        >
          {stat.sub?.startsWith('+') && (
            <span className="material-symbols-outlined text-[12px]">
              trending_up
            </span>
          )}
          {stat.sub}
        </p>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, { bg: string; color: string }> = {
    CRITICAL: { bg: '#ef4444', color: '#fff' },
    HIGH: { bg: '#facc15', color: '#1f1500' },
    WARNING: { bg: 'rgba(199, 201, 255, 0.16)', color: 'var(--cg-text-muted)' },
  };
  const s = styles[severity];
  return (
    <span
      className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wide"
      style={{ background: s.bg, color: s.color }}
    >
      {severity}
    </span>
  );
}

function StatusPill({ status }: { status: AnomalyStatus }) {
  const styles: Record<AnomalyStatus, { bg: string; color: string }> = {
    'Cooldown Applied': { bg: 'rgba(239, 68, 68, 0.18)', color: '#fca5a5' },
    Monitoring: { bg: 'var(--cg-amber-a14)', color: 'var(--cg-amber)' },
    Resolved: { bg: 'var(--cg-green-a14)', color: 'var(--cg-green)' },
  };
  const s = styles[status];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const toneColor: Record<AnomalyTone, string> = {
    coral: 'var(--cg-coral)',
    amber: 'var(--cg-amber)',
    green: 'var(--cg-green)',
  };
  const toneBg: Record<AnomalyTone, string> = {
    coral: 'var(--cg-coral-a18)',
    amber: 'var(--cg-amber-a14)',
    green: 'var(--cg-green-a14)',
  };
  const color = toneColor[anomaly.tone];

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col justify-between">
      <div className="flex items-start gap-3">
        <span
          className="material-symbols-outlined rounded-full p-1.5 text-base shrink-0"
          style={{ background: toneBg[anomaly.tone], color }}
        >
          {anomaly.icon}
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-bold">{anomaly.title}</h4>
          <p
            className="text-[11px] mt-0.5 leading-snug"
            style={{ color: 'var(--cg-text-muted)' }}
          >
            {anomaly.description}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px]" style={{ color: 'var(--cg-text-muted)' }}>
          {anomaly.time}
        </span>
        <StatusPill status={anomaly.status} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Component chính
// ─────────────────────────────────────────────────────────────────────────
export default function EnforcementAdmin() {
  const [stats, setStats] = useState<TopStat[]>(DEFAULT_STATS);
  const [bottlenecks, setBottlenecks] =
    useState<SkillBottleneck[]>(DEFAULT_BOTTLENECKS);
  const [clusters, setClusters] = useState<ErrorCluster[]>(DEFAULT_CLUSTERS);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(DEFAULT_ANOMALIES);
  const [bottleneckView, setBottleneckView] = useState<'weekly' | 'live'>(
    'weekly'
  );
  const [isLoading, setIsLoading] = useState(false);

  // Penalty controls (giá trị điều khiển bằng slider)
  const [submissionCooldown, setSubmissionCooldown] = useState(300); // giây
  const [dailyQuota, setDailyQuota] = useState(50);
  const [penaltyMultiplier, setPenaltyMultiplier] = useState(1.5);
  const [isSaving, setIsSaving] = useState(false);

  // Tải dữ liệu dashboard từ Backend (scope: enforcement)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_URL}/scope/enforcement`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Cannot loading enforcement dashboard!');
        const data: AdminConfigResponse[] = await res.json();

        const find = (key: string) => data.find((c) => c.key === key)?.value;

        const stat = find('top_stats') as TopStat[] | undefined;
        const bn = find('skill_bottlenecks') as SkillBottleneck[] | undefined;
        const cl = find('error_clusters') as ErrorCluster[] | undefined;
        const an = find('active_anomalies') as Anomaly[] | undefined;
        const penalty = find('penalty_controls') as
          | {
              submissionCooldown: number;
              dailyQuota: number;
              penaltyMultiplier: number;
            }
          | undefined;

        if (stat) setStats(stat);
        if (bn) setBottlenecks(bn);
        if (cl) setClusters(cl);
        if (an) setAnomalies(an);
        if (penalty) {
          setSubmissionCooldown(penalty.submissionCooldown);
          setDailyQuota(penalty.dailyQuota);
          setPenaltyMultiplier(penalty.penaltyMultiplier);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu enforcement dashboard:', err);
        // Giữ nguyên dữ liệu mặc định nếu BE chưa sẵn sàng
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCooldown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const handleDeployChanges = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(
        `${API_URL}/scope/enforcement/key/penalty_controls`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value: { submissionCooldown, dailyQuota, penaltyMultiplier },
          }),
        }
      );
      if (!res.ok) throw new Error('Deploy thất bại từ phía server.');
      alert('Đã triển khai thay đổi Penalty Controls tới toàn hệ thống.');
    } catch (err) {
      console.error('Lỗi khi deploy penalty controls:', err);
      alert('Deploy thất bại. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateProtocolZero = async () => {
    if (
      !window.confirm(
        'Bạn có chắc muốn TẠM KHÓA toàn bộ submission trên hệ thống? Hành động này ảnh hưởng tới mọi người chơi.'
      )
    )
      return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(
        `${API_URL}/scope/enforcement/key/emergency_lock`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: { active: true } }),
        }
      );
      if (!res.ok) throw new Error('Không thể kích hoạt Protocol Zero.');
      alert('Protocol Zero đã được kích hoạt. Mọi submission đã bị tạm khóa.');
    } catch (err) {
      console.error('Lỗi khi kích hoạt Protocol Zero:', err);
      alert('Kích hoạt thất bại. Vui lòng thử lại.');
    }
  };

  const handleViewCluster = (id: string) => {
    console.log('Xem chi tiết error cluster:', id);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a2e] text-white font-sans select-none">
      <Header />
      <SideNav />

      <div className="ml-16 mt-12 p-6 flex flex-col gap-6 max-w-[1600px]">
        {isLoading && (
          <p className="text-center text-sm text-white/50 py-2">
            Loading data enforcement dashboard...
          </p>
        )}

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <TopStatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* MAIN GRID: Skill Bottlenecks (left, wide) + Penalty Controls / Emergency Lock (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Skill Bottlenecks */}
          <div className="glass-card rounded-2xl p-5 lg:col-span-2">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-bold">Skill Bottlenecks</h3>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: 'var(--cg-text-muted)' }}
                >
                  Primary areas where users fail validation quests
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  onClick={() => setBottleneckView('weekly')}
                  className="cursor-pointer rounded-full px-3 py-1 font-bold transition-colors"
                  style={{
                    background:
                      bottleneckView === 'weekly'
                        ? 'var(--cg-amber-a14)'
                        : 'transparent',
                    color:
                      bottleneckView === 'weekly'
                        ? 'var(--cg-amber)'
                        : 'var(--cg-text-muted)',
                    border: '1px solid var(--cg-border)',
                  }}
                >
                  Weekly View
                </button>
                <button
                  onClick={() => setBottleneckView('live')}
                  className="cursor-pointer rounded-full px-3 py-1 font-bold transition-colors"
                  style={{
                    background:
                      bottleneckView === 'live'
                        ? 'var(--cg-container-a30)'
                        : 'transparent',
                    color:
                      bottleneckView === 'live'
                        ? 'var(--cg-text)'
                        : 'var(--cg-text-muted)',
                    border: '1px solid var(--cg-border)',
                  }}
                >
                  Live Feed
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {bottlenecks.map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{b.label}</span>
                    <span style={{ color: 'var(--cg-text-muted)' }}>
                      {b.failures.toLocaleString()} failures
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 rounded-full bg-[#0c0a30] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${b.percent}%`, background: b.gradient }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-dashed border-white/10 pt-4 text-center">
              <div>
                <p
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: 'var(--cg-text-muted)' }}
                >
                  PEAK HOUR
                </p>
                <p className="text-sm font-bold mt-1">19:00 UTC</p>
              </div>
              <div>
                <p
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: 'var(--cg-text-muted)' }}
                >
                  MOST FAILED TAG
                </p>
                <p
                  className="text-sm font-bold mt-1"
                  style={{ color: 'var(--cg-coral)' }}
                >
                  #Loops
                </p>
              </div>
              <div>
                <p
                  className="text-[10px] font-semibold tracking-wide"
                  style={{ color: 'var(--cg-text-muted)' }}
                >
                  RECOVERY RATE
                </p>
                <p
                  className="text-sm font-bold mt-1"
                  style={{ color: 'var(--cg-green)' }}
                >
                  42%
                </p>
              </div>
            </div>
          </div>

          {/* Right column: Penalty Controls + Emergency Lock */}
          <div className="flex flex-col gap-5">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <span
                  className="material-symbols-outlined text-base"
                  style={{ color: 'var(--cg-amber)' }}
                >
                  tune
                </span>
                Penalty Controls
              </h3>

              {/* Submission Cooldown */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Submission Cooldown</span>
                  <span
                    className="font-bold"
                    style={{ color: 'var(--cg-coral)' }}
                  >
                    {formatCooldown(submissionCooldown)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1800}
                  step={30}
                  value={submissionCooldown}
                  onChange={(e) =>
                    setSubmissionCooldown(Number(e.target.value))
                  }
                  className="w-full mt-2 accent-[--cg-coral]"
                  style={{ accentColor: 'var(--cg-coral)' }}
                />
                <p
                  className="text-[10px] mt-1"
                  style={{ color: 'var(--cg-text-muted)' }}
                >
                  Wait time after a failed attempt before retry.
                </p>
              </div>

              {/* Daily Submission Quota */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Daily Submission Quota</span>
                  <span
                    className="font-bold"
                    style={{ color: 'var(--cg-amber)' }}
                  >
                    {dailyQuota}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={200}
                  value={dailyQuota}
                  onChange={(e) => setDailyQuota(Number(e.target.value))}
                  className="w-full mt-2"
                  style={{ accentColor: 'var(--cg-amber)' }}
                />
                <p
                  className="text-[10px] mt-1"
                  style={{ color: 'var(--cg-text-muted)' }}
                >
                  Global limit on challenge submissions per 24h.
                </p>
              </div>

              {/* Penalty Multiplier */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Penalty Multiplier</span>
                  <span
                    className="font-bold"
                    style={{ color: 'var(--cg-green)' }}
                  >
                    {penaltyMultiplier.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.1}
                  value={penaltyMultiplier}
                  onChange={(e) => setPenaltyMultiplier(Number(e.target.value))}
                  className="w-full mt-2"
                  style={{ accentColor: 'var(--cg-green)' }}
                />
                <p
                  className="text-[10px] mt-1"
                  style={{ color: 'var(--cg-text-muted)' }}
                >
                  Escalation factor for consecutive failures.
                </p>
              </div>

              <button
                onClick={handleDeployChanges}
                disabled={isSaving}
                className="cursor-pointer mt-5 w-full rounded-xl py-2.5 text-sm font-bold transition-opacity disabled:opacity-60"
                style={{ background: 'var(--cg-coral)', color: '#1a0b06' }}
              >
                {isSaving ? 'Deploying...' : 'Deploy Changes Globally'}
              </button>
            </div>

            {/* Emergency Lock */}
            <div
              className="glass-card rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'var(--cg-amber-a14)' }}
            >
              <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-6xl opacity-10">
                lock
              </span>
              <h3
                className="text-sm font-bold"
                style={{ color: 'var(--cg-amber)' }}
              >
                Emergency Lock
              </h3>
              <p
                className="text-[11px] mt-1.5 leading-snug"
                style={{ color: 'var(--cg-text-muted)' }}
              >
                Pause all new quest submissions across the entire ecosystem.
              </p>
              <button
                onClick={handleActivateProtocolZero}
                className="cursor-pointer mt-4 rounded-lg px-4 py-2 text-xs font-bold bg-red-800 hover:bg-red-700 transition-colors"
              >
                Activate Protocol Zero
              </button>
            </div>
          </div>
        </div>

        {/* FREQUENT ERROR CLUSTERS */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-base font-bold">Frequent Error Clusters</h3>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: 'var(--cg-text-muted)' }}
          >
            Granular breakdown of specific exception triggers
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr style={{ background: 'var(--cg-bg-a55)' }}>
                  <th
                    className="py-2.5 px-3 rounded-l-lg font-semibold"
                    style={{ color: 'var(--cg-text-muted)' }}
                  >
                    Error Signature
                  </th>
                  <th
                    className="py-2.5 px-3 font-semibold"
                    style={{ color: 'var(--cg-text-muted)' }}
                  >
                    Severity
                  </th>
                  <th
                    className="py-2.5 px-3 font-semibold"
                    style={{ color: 'var(--cg-text-muted)' }}
                  >
                    Frequency
                  </th>
                  <th
                    className="py-2.5 px-3 font-semibold"
                    style={{ color: 'var(--cg-text-muted)' }}
                  >
                    User Impact
                  </th>
                  <th
                    className="py-2.5 px-3 rounded-r-lg font-semibold text-right"
                    style={{ color: 'var(--cg-text-muted)' }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {clusters.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-3 px-3">
                      <p className="font-bold">{c.signature}</p>
                      <p
                        className="text-[10px] mt-0.5 font-mono"
                        style={{ color: 'var(--cg-text-muted)' }}
                      >
                        CODE: {c.code}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={c.severity} />
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {c.frequency.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2">
                          {[0, 1].map((i) => (
                            <span
                              key={i}
                              className="w-5 h-5 rounded-full border border-[#161646]"
                              style={{ background: 'rgba(255,255,255,0.15)' }}
                            />
                          ))}
                        </div>
                        <span style={{ color: 'var(--cg-text-muted)' }}>
                          +{c.impactCount} others
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleViewCluster(c.id)}
                        className="cursor-pointer p-1.5 rounded-lg"
                        style={{
                          background: 'var(--cg-amber-a14)',
                          color: 'var(--cg-amber)',
                        }}
                      >
                        <span className="material-symbols-outlined text-sm">
                          visibility
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTIVE ANOMALIES */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base font-bold">Active Anomalies</h3>
            <span
              className="flex items-center gap-1.5 text-[11px] font-bold"
              style={{ color: 'var(--cg-green)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Real-time Stream
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {anomalies.map((a) => (
              <AnomalyCard key={a.id} anomaly={a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
