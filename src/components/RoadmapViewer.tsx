import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT';

export type RoadmapKey = 'frontend' | 'backend';
type NodeVariant = 'recommended' | 'alternative' | 'optional';
type BranchNode = { id: string; label: string; variant?: NodeVariant; };
type MainStep = { id: string; title: string; rightCols?: BranchNode[][]; leftNodes?: BranchNode[]; };

/* ─── DATA (unchanged) ─── */
const FRONTEND: MainStep[] = [
  // Beginner
  { id: 'f1', title: 'Web & Internet Basics' },
  { id: 'f2', title: 'Basic HTML Structure' },
  { id: 'f3', title: 'HTML Forms & Tables' },
  { id: 'f4', title: 'Project: Personal Profile', rightCols: [[{ id: 'fp1', label: 'HTML Project', variant: 'recommended' }]] },
  { id: 'f5', title: 'Intro to CSS & Selectors' },
  { id: 'f6', title: 'CSS Box Model & Colors' },
  { id: 'f7', title: 'Project: Registration Form', rightCols: [[{ id: 'fp2', label: 'CSS Layout', variant: 'recommended' }]] },
  { id: 'f8', title: 'CSS Flexbox' },
  { id: 'f9', title: 'CSS Grid Basics' },
  { id: 'f10', title: 'Project: Responsive Landing Page', rightCols: [[{ id: 'fp3', label: 'Capstone 1', variant: 'recommended' }]] },
  
  // Intermediate
  { id: 'f11', title: 'JavaScript Basics & Variables' },
  { id: 'f12', title: 'Control Flow & Functions' },
  { id: 'f13', title: 'Project: Calculator App', rightCols: [[{ id: 'fp4', label: 'Logic', variant: 'recommended' }]] },
  { id: 'f14', title: 'DOM Manipulation & Events' },
  { id: 'f15', title: 'Asynchronous JS & Promises' },
  { id: 'f16', title: 'Project: Weather App', rightCols: [[{ id: 'fp5', label: 'Fetch API', variant: 'recommended' }]] },
  { id: 'f17', title: 'Version Control (Git)' },
  { id: 'f18', title: 'Introduction to React' },
  { id: 'f19', title: 'React State & Props' },
  { id: 'f20', title: 'Project: Todo App in React', rightCols: [[{ id: 'fp6', label: 'Capstone 2', variant: 'recommended' }]] },

  // Advanced
  { id: 'f21', title: 'React Router & Navigation' },
  { id: 'f22', title: 'Advanced State (Redux/Zustand)' },
  { id: 'f23', title: 'Project: E-commerce Cart', rightCols: [[{ id: 'fp7', label: 'Complex UI', variant: 'recommended' }]] },
  { id: 'f24', title: 'CSS Frameworks (Tailwind)' },
  { id: 'f25', title: 'Next.js & SSR' },
  { id: 'f26', title: 'Project: Fullstack Blog', rightCols: [[{ id: 'fp8', label: 'Fullstack', variant: 'recommended' }]] },
  { id: 'f27', title: 'Automated Testing' },
  { id: 'f28', title: 'Performance Optimization' },
  { id: 'f29', title: 'Web Security Basics' },
  { id: 'f30', title: 'Project: Final Deployment', rightCols: [[{ id: 'fp9', label: 'Capstone 3', variant: 'recommended' }]] },
];

const BACKEND: MainStep[] = [
  // Beginner
  { id: 'b1', title: 'How the Internet Works & HTTP' },
  { id: 'b2', title: 'Intro to Backend Languages' },
  { id: 'b3', title: 'Basic Syntax & Functions' },
  { id: 'b4', title: 'Project: CLI To-do List', rightCols: [[{ id: 'bp1', label: 'Basic Logic', variant: 'recommended' }]] },
  { id: 'b5', title: 'Relational Databases & SQL' },
  { id: 'b6', title: 'Basic CRUD in SQL' },
  { id: 'b7', title: 'Project: Student DB', rightCols: [[{ id: 'bp2', label: 'Database', variant: 'recommended' }]] },
  { id: 'b8', title: 'Version Control (Git)' },
  { id: 'b9', title: 'Asynchronous Programming' },
  { id: 'b10', title: 'Project: Basic Web Server', rightCols: [[{ id: 'bp3', label: 'Capstone 1', variant: 'recommended' }]] },

  // Intermediate
  { id: 'b11', title: 'RESTful API Principles' },
  { id: 'b12', title: 'Building Endpoints' },
  { id: 'b13', title: 'Project: Note-taking API', rightCols: [[{ id: 'bp4', label: 'API Design', variant: 'recommended' }]] },
  { id: 'b14', title: 'Advanced SQL & Indexing' },
  { id: 'b15', title: 'ORMs (Prisma/SQLAlchemy)' },
  { id: 'b16', title: 'Project: E-commerce API', rightCols: [[{ id: 'bp5', label: 'DB Relations', variant: 'recommended' }]] },
  { id: 'b17', title: 'Auth Basics (Sessions)' },
  { id: 'b18', title: 'JWT & OAuth' },
  { id: 'b19', title: 'Input Validation & Errors' },
  { id: 'b20', title: 'Project: Secure Login System', rightCols: [[{ id: 'bp6', label: 'Capstone 2', variant: 'recommended' }]] },

  // Advanced
  { id: 'b21', title: 'Caching Strategies (Redis)' },
  { id: 'b22', title: 'Message Brokers (RabbitMQ)' },
  { id: 'b23', title: 'Project: Order Queue', rightCols: [[{ id: 'bp7', label: 'Async Queue', variant: 'recommended' }]] },
  { id: 'b24', title: 'Architecture & Microservices' },
  { id: 'b25', title: 'Containerization (Docker)' },
  { id: 'b26', title: 'Project: Dockerized App', rightCols: [[{ id: 'bp8', label: 'DevOps', variant: 'recommended' }]] },
  { id: 'b27', title: 'Unit & Integration Testing' },
  { id: 'b28', title: 'CI/CD Pipelines' },
  { id: 'b29', title: 'Cloud Deployment' },
  { id: 'b30', title: 'Project: Final Deployment', rightCols: [[{ id: 'bp9', label: 'Capstone 3', variant: 'recommended' }]] },
];

/* ─── STYLES ─── */
const cx = (...cls: Array<string | false | null | undefined>) => cls.filter(Boolean).join(' ');

const VARIANT_CONFIG: Record<NodeVariant, { cls: string; dot: string; leftBar: string }> = {
  recommended: {
    cls: 'border-[#FF7E5F]/60 bg-[#FF7E5F]/10 text-[#FF7E5F] hover:bg-[#FF7E5F]/18 hover:border-[#FF7E5F]/90 hover:shadow-[0_0_14px_rgba(255,126,95,0.25)]',
    dot: 'bg-[#FF7E5F]',
    leftBar: 'bg-[#FF7E5F]',
  },
  alternative: {
    cls: 'border-indigo-400/50 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/18 hover:border-indigo-400/80 hover:shadow-[0_0_14px_rgba(99,102,241,0.20)]',
    dot: 'bg-indigo-400',
    leftBar: 'bg-indigo-400',
  },
  optional: {
    cls: 'border-[color:var(--cg-border)] bg-transparent text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a16)] hover:border-white/20',
    dot: 'bg-slate-500',
    leftBar: 'bg-slate-500',
  },
};
const DEFAULT_CONFIG = {
  cls: 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text)] hover:bg-[color:var(--cg-container-a22)] hover:border-white/20',
  dot: 'bg-slate-400',
  leftBar: 'bg-slate-400',
};

/* ─── SUB-COMPONENTS ─── */
function BranchBox({ node }: { node: BranchNode }) {
  const cfg = node.variant ? VARIANT_CONFIG[node.variant] : DEFAULT_CONFIG;
  return (
    <div className={cx(
      'relative overflow-hidden rounded-lg border px-3 py-1.5 text-[11px] font-medium leading-tight whitespace-nowrap',
      'transition-all duration-200 cursor-default select-none group/box',
      cfg.cls,
    )}>
      <span className={cx('absolute left-0 top-0 bottom-0 w-[2.5px] rounded-l-lg opacity-70', cfg.leftBar)} />
      <span className="pl-1">{node.label}</span>
    </div>
  );
}

function DashedLine({ isMilestone = false }: { isMilestone?: boolean }) {
  return (
    <div
      className={cx("h-px shrink-0", isMilestone ? "w-16" : "w-10")}
      style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(251,191,36,0.5) 0px, rgba(251,191,36,0.5) 5px, transparent 5px, transparent 10px)' }}
    />
  );
}

function VertConnector({ visible, isCompleted = false }: { visible: boolean; isCompleted?: boolean }) {
  return (
    <div
      className="mx-auto w-0.5 transition-all"
      style={{
        height: 28,
        background: visible
          ? isCompleted ? 'linear-gradient(to bottom, #4ade80, #4ade80)' : 'linear-gradient(to bottom, rgba(251,191,36,0.6), rgba(251,191,36,0.6))'
          : 'transparent',
      }}
    />
  );
}

type NodeStatus = 'locked' | 'current' | 'completed' | 'skipped';

function MainNode({ title, index, status, deadline, onClick }: { title: string; index: number; status: NodeStatus; deadline: string; onClick: () => void }) {
  const getStyles = () => {
    switch (status) {
      case 'completed':
        return 'border-[#4ade80]/70 bg-gradient-to-br from-[#4ade80]/20 to-[#4ade80]/5 text-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.12)] cursor-pointer hover:border-[#4ade80]';
      case 'skipped':
        return 'border-purple-400/50 bg-gradient-to-br from-purple-400/10 to-transparent text-purple-300 opacity-80 shadow-none cursor-pointer';
      case 'current':
        return 'border-[#3b82f6]/80 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/10 text-[#60a5fa] shadow-[0_0_24px_rgba(59,130,246,0.4)] animate-pulse cursor-pointer hover:border-[#3b82f6]';
      case 'locked':
      default:
        return 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] shadow-none opacity-60 cursor-not-allowed grayscale';
    }
  };

  return (
    <div onClick={onClick} className={cx(
      'relative w-64 rounded-xl border-2 px-5 py-3.5 flex flex-col',
      'transition-all duration-250 select-none group',
      getStyles(),
    )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono opacity-70">Milestone {String(index + 1).padStart(2, '0')}</span>
        {status === 'completed' && <span className="material-symbols-outlined text-[14px]">check_circle</span>}
        {status === 'skipped' && <span className="text-[10px] uppercase font-bold tracking-wider">Skipped</span>}
        {status === 'current' && <span className="badge-purple text-[9px] py-0 px-1.5 h-4">IN PROGRESS</span>}
        {status === 'locked' && <span className="material-symbols-outlined text-[14px]">lock</span>}
      </div>
      <div className="text-sm font-bold truncate">{title}</div>
      
      {/* Deadline display */}
      {status !== 'skipped' && status !== 'completed' && (
        <div className="mt-2 text-[10px] font-medium opacity-70 flex items-center gap-1 border-t border-white/10 pt-2">
          <span className="material-symbols-outlined text-[12px]">calendar_today</span>
          <span className="roadmap-deadline-label" /> {deadline}
        </div>
      )}
      
      {/* Hover tooltip for locked */}
      {status === 'locked' && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg bg-black/90 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-white/10 roadmap-tooltip-locked">
        </div>
      )}
    </div>
  );
}

function StepRow({ step, isFirst, isLast, index, status, deadline, isMilestoneGate, onNodeClick }: { step: MainStep; isFirst: boolean; isLast: boolean; index: number; status: NodeStatus; deadline: string; isMilestoneGate: boolean; onNodeClick: () => void }) {
  const hasRight = !!step.rightCols?.length;
  const hasLeft = !!step.leftNodes?.length;

  return (
    <div className="flex items-center relative">
      {/* Left branch */}
      <div className="flex flex-1 items-center justify-end gap-2">
        {hasLeft && (
          <>
            <div className="flex flex-col items-end gap-2">
              {step.leftNodes!.map((n) => <BranchBox key={n.id} node={n} />)}
            </div>
            <DashedLine />
          </>
        )}
      </div>

      {/* Center */}
      <div className="flex w-64 flex-col items-center">
        <VertConnector visible={!isFirst} isCompleted={status === 'completed' || status === 'skipped'} />
        <MainNode title={step.title} index={index} status={status} deadline={deadline} onClick={onNodeClick} />
        <VertConnector visible={!isLast} isCompleted={status === 'completed' || status === 'skipped'} />
      </div>

      {/* Right branches */}
      <div className="flex flex-1 flex-col items-start gap-3 relative">
        {hasRight && step.rightCols!.map((col, ci) => (
          <div key={ci} className="flex items-center gap-2">
            <DashedLine />
            <div className="flex flex-wrap gap-2">
              {col.map((n) => <BranchBox key={n.id} node={n} />)}
            </div>
          </div>
        ))}

        {/* Milestone Gate Badge */}
        {isMilestoneGate && (
           <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 bg-[#fbbf24]/10 border border-[#fbbf24]/40 rounded-lg text-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.2)] animate-pulse z-10">
             <span className="material-symbols-outlined text-[16px]">swords</span>
             <span className="text-[10px] font-bold uppercase tracking-wider">Gate Challenge</span>
           </div>
        )}
      </div>
    </div>
  );
}

function Legend() {
  const items: { variant: NodeVariant; label: string }[] = [
    { variant: 'recommended', label: 'Recommended' },
    { variant: 'alternative', label: 'Alternative' },
    { variant: 'optional',    label: 'Optional' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => {
        const cfg = VARIANT_CONFIG[item.variant];
        return (
          <div key={item.label} className={cx(
            'flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold cursor-default select-none',
            cfg.cls,
          )}>
            <span className={cx('h-1.5 w-1.5 rounded-full', cfg.dot)} />
            {item.label}
          </div>
        );
      })}
    </div>
  );
}

/* ─── MAIN EXPORT ─── */
function RoadmapViewer({ selected, surveyData }: { selected: RoadmapKey, surveyData: any }) {
  const t = useT();
  const navigate = useNavigate();
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const steps = selected === 'frontend' ? FRONTEND : BACKEND;
  const isFE = selected === 'frontend';

  // State calculations
  const totalHours = 120; // Example total
  const hoursPerDay = surveyData?.hoursPerDay || 2;
  const testScore = surveyData?.testScore || 0;

  // If score > 80% (>= 4), jump to Advanced. If >= 3, jump to Intermediate.
  // Advanced = start at index 20, Intermediate = start at index 10, Beginner = start at 0
  const startingGlobalIndex = testScore === 5 ? 20 : testScore >= 3 ? 10 : 0;
  
  const currentIndex = startingGlobalIndex; // Using this to mock progress

  // Generate deadlines
  const calculateDeadline = (index: number) => {
    const today = new Date();
    const hoursPerNode = totalHours / 30; // 30 steps total
    const daysToAdd = Math.ceil((index * hoursPerNode) / hoursPerDay);
    today.setDate(today.getDate() + daysToAdd);
    return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleNodeClick = (index: number, status: NodeStatus) => {
    if (status === 'locked') return;
    if (status === 'current') navigate('/practice');
    if (status === 'completed' || status === 'skipped') navigate('/history');
  };

  const renderStage = (title: string, colorClass: string, items: MainStep[], globalOffset: number) => {
    const isStageLocked = currentIndex < globalOffset;
    
    return (
      <div className={cx('flex flex-col items-center mb-16', isStageLocked ? 'opacity-40 grayscale' : '')}>
        <div className={cx('px-6 py-2 rounded-full border border-white/20 text-sm font-bold shadow-lg mb-8 backdrop-blur-md', colorClass)}>
          {title}
        </div>
        <div className="flex flex-col items-center min-w-[640px]">
          {items.map((step, i) => {
            const globalIndex = globalOffset + i;
            const status: NodeStatus = globalIndex < currentIndex ? 'completed' : globalIndex === currentIndex ? 'current' : 'locked';
            const deadline = calculateDeadline(globalIndex + 1);
            // Every 10th node is the final capstone for that stage
            const isMilestoneGate = (i + 1) % 10 === 0;

            return (
              <div key={step.id} onMouseEnter={() => setHoveredStep(step.id)}
                className={cx('transition-opacity duration-200', hoveredStep && hoveredStep !== step.id ? 'opacity-50' : 'opacity-100')}>
                <StepRow 
                  step={step} 
                  isFirst={i === 0} 
                  isLast={i === items.length - 1} 
                  index={globalIndex} 
                  status={status}
                  deadline={deadline}
                  isMilestoneGate={isMilestoneGate}
                  onNodeClick={() => handleNodeClick(globalIndex, status)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full animate-fade-in">
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <Legend />
        <div className="text-[11px] text-[color:var(--cg-text-muted)] font-medium flex items-center gap-4">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#4ade80]" /> {t('roadmap.completed')}</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" /> {t('roadmap.current')}</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-500" /> {t('roadmap.locked')}</div>
        </div>
      </div>

      {/* Flow chart container */}
      <div className={cx(
        'overflow-x-auto rounded-2xl border border-[color:var(--cg-border)]',
        'bg-gradient-to-br from-[color:var(--cg-container-a16)] to-[color:var(--cg-bg-a55)] p-8 backdrop-blur',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
      )}>
        {/* Title badge */}
        <div className="mb-8 flex justify-center">
          <div className={cx(
            'rounded-full border px-6 py-2 text-base font-bold',
            isFE
              ? 'border-[#FF7E5F]/40 bg-[#FF7E5F]/10 text-[#FF7E5F] shadow-[0_0_24px_rgba(255,126,95,0.15)]'
              : 'border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.15)]',
          )}>
            {isFE ? `🧩 ${t('roadmap.frontend')}` : `⚙️ ${t('roadmap.backend')}`}
          </div>
        </div>

        {/* Entry arrow */}
        <div className="flex justify-center mb-0">
          <div className="w-0.5" style={{ height: 20, background: 'linear-gradient(to bottom, transparent, #4ade80)' }} />
        </div>

        {/* Render Stages */}
        <div className="flex flex-col w-full items-center" onMouseLeave={() => setHoveredStep(null)}>
          {/* Note: I injected a tiny effect up top or we can just pass translations into MainNode, but I'll use CSS trick or just string replace for now. Actually, let's just pass t down if we want to, but to avoid prop drilling we can render translations in a portal or style block */}
          <style>{`
            .roadmap-deadline-label::before { content: "${t('roadmap.estCompletion')}"; }
            .roadmap-tooltip-locked::before { content: "${t('roadmap.tooltip.locked')}"; }
          `}</style>
          {renderStage(t('roadmap.stage.beginner'), 'bg-green-500/10 text-green-400 border-green-500/30', steps.slice(0, 10), 0)}
          {renderStage(t('roadmap.stage.intermediate'), 'bg-blue-500/10 text-blue-400 border-blue-500/30', steps.slice(10, 20), 10)}
          {renderStage(t('roadmap.stage.advanced'), 'bg-purple-500/10 text-purple-400 border-purple-500/30', steps.slice(20, 30), 20)}
        </div>
      </div>
    </div>
  );
}

export default RoadmapViewer;
