import { useState } from 'react';

export type RoadmapKey = 'frontend' | 'backend';
type NodeVariant = 'recommended' | 'alternative' | 'optional';
type BranchNode = { id: string; label: string; variant?: NodeVariant; };
type MainStep = { id: string; title: string; rightCols?: BranchNode[][]; leftNodes?: BranchNode[]; };

/* ─── DATA (unchanged) ─── */
const FRONTEND: MainStep[] = [
  { id: 'internet', title: 'Internet', leftNodes: [{ id: 'il1', label: 'Prerequisite', variant: 'optional' }, { id: 'il2', label: 'Networking Basics', variant: 'optional' }], rightCols: [[{ id: 'i1', label: 'How does the Internet work?' }, { id: 'i2', label: 'What is HTTP / HTTPS?' }, { id: 'i3', label: 'What is a Domain Name?' }, { id: 'i4', label: 'What is Web Hosting?' }, { id: 'i5', label: 'DNS and how it works' }, { id: 'i6', label: 'Browsers and how they work' }]] },
  { id: 'html', title: 'HTML', leftNodes: [{ id: 'hl1', label: 'MDN Web Docs', variant: 'recommended' }, { id: 'hl2', label: 'W3Schools', variant: 'alternative' }], rightCols: [[{ id: 'h1', label: 'Semantic HTML', variant: 'recommended' }, { id: 'h2', label: 'Forms & Validations' }, { id: 'h3', label: 'SEO Basics', variant: 'recommended' }, { id: 'h4', label: 'Accessibility', variant: 'optional' }]] },
  { id: 'css', title: 'CSS', leftNodes: [{ id: 'cl1', label: 'CSS Tricks', variant: 'recommended' }, { id: 'cl2', label: 'Sass / SCSS', variant: 'optional' }], rightCols: [[{ id: 'c1', label: 'Box Model' }, { id: 'c2', label: 'Flexbox & Grid', variant: 'recommended' }, { id: 'c3', label: 'Responsive Design' }, { id: 'c4', label: 'Animations & Transitions', variant: 'optional' }]] },
  { id: 'js', title: 'JavaScript', leftNodes: [{ id: 'jl1', label: 'javascript.info', variant: 'recommended' }, { id: 'jl2', label: 'TypeScript', variant: 'recommended' }, { id: 'jl3', label: 'Node.js basics', variant: 'optional' }], rightCols: [[{ id: 'j1', label: 'ES6+ Syntax', variant: 'recommended' }, { id: 'j2', label: 'DOM Manipulation' }, { id: 'j3', label: 'Fetch / REST APIs' }, { id: 'j4', label: 'Async / Await', variant: 'recommended' }, { id: 'j5', label: 'Modules & Bundling' }]] },
  { id: 'vcs', title: 'Version Control — Git', leftNodes: [{ id: 'vl1', label: 'GitHub', variant: 'recommended' }, { id: 'vl2', label: 'GitLab', variant: 'alternative' }, { id: 'vl3', label: 'Bitbucket', variant: 'optional' }], rightCols: [[{ id: 'vr1', label: 'Branching Workflows' }, { id: 'vr2', label: 'Pull Requests & Code Review' }]] },
  { id: 'pkg', title: 'Package Managers', leftNodes: [{ id: 'pl1', label: 'package.json', variant: 'recommended' }, { id: 'pl2', label: 'Semantic Versioning', variant: 'optional' }], rightCols: [[{ id: 'p1', label: 'npm', variant: 'recommended' }, { id: 'p2', label: 'yarn', variant: 'alternative' }], [{ id: 'p3', label: 'pnpm', variant: 'alternative' }, { id: 'p4', label: 'bun', variant: 'optional' }]] },
  { id: 'framework', title: 'Pick a Framework', leftNodes: [{ id: 'fwl1', label: 'React Docs', variant: 'recommended' }, { id: 'fwl2', label: 'State Management', variant: 'recommended' }, { id: 'fwl3', label: 'SSR / SSG', variant: 'optional' }], rightCols: [[{ id: 'fw1', label: 'React', variant: 'recommended' }, { id: 'fw2', label: 'Vue.js', variant: 'alternative' }, { id: 'fw3', label: 'Angular', variant: 'alternative' }, { id: 'fw4', label: 'Svelte', variant: 'optional' }]] },
  { id: 'cssfw', title: 'CSS Frameworks', leftNodes: [{ id: 'cfl1', label: 'Design Systems', variant: 'optional' }, { id: 'cfl2', label: 'shadcn/ui', variant: 'recommended' }], rightCols: [[{ id: 'cf1', label: 'Tailwind CSS', variant: 'recommended' }, { id: 'cf2', label: 'Bootstrap', variant: 'alternative' }, { id: 'cf3', label: 'Component Libraries', variant: 'optional' }]] },
  { id: 'tooling', title: 'Build Tools & Linting', leftNodes: [{ id: 'tl1', label: 'Webpack (legacy)', variant: 'optional' }, { id: 'tl2', label: 'Rollup', variant: 'optional' }], rightCols: [[{ id: 't1', label: 'Vite', variant: 'recommended' }, { id: 't2', label: 'ESLint + Prettier', variant: 'recommended' }, { id: 't3', label: 'TypeScript', variant: 'recommended' }]] },
  { id: 'testing', title: 'Testing', leftNodes: [{ id: 'tel1', label: 'TDD Approach', variant: 'optional' }, { id: 'tel2', label: 'Testing Library', variant: 'recommended' }], rightCols: [[{ id: 'te1', label: 'Vitest / Jest', variant: 'recommended' }, { id: 'te2', label: 'Playwright / Cypress', variant: 'alternative' }]] },
  { id: 'deploy', title: 'Deployment', leftNodes: [{ id: 'del1', label: 'Docker', variant: 'optional' }, { id: 'del2', label: 'GitHub Actions', variant: 'recommended' }], rightCols: [[{ id: 'de1', label: 'Vercel', variant: 'recommended' }, { id: 'de2', label: 'Netlify', variant: 'alternative' }, { id: 'de3', label: 'CI / CD Basics' }]] },
];

const BACKEND: MainStep[] = [
  { id: 'internet', title: 'Internet', leftNodes: [{ id: 'il1', label: 'OSI Model', variant: 'optional' }, { id: 'il2', label: 'TCP / IP Basics', variant: 'optional' }], rightCols: [[{ id: 'i1', label: 'HTTP / HTTPS Protocol' }, { id: 'i2', label: 'DNS & Hosting' }, { id: 'i3', label: 'Client-Server Model' }]] },
  { id: 'lang', title: 'Pick a Language', leftNodes: [{ id: 'll1', label: 'OOP Concepts', variant: 'recommended' }, { id: 'll2', label: 'Data Structures', variant: 'recommended' }, { id: 'll3', label: 'Algorithms', variant: 'optional' }], rightCols: [[{ id: 'l1', label: 'Node.js / JavaScript', variant: 'recommended' }, { id: 'l2', label: 'Python', variant: 'alternative' }, { id: 'l3', label: 'Java', variant: 'alternative' }, { id: 'l4', label: 'Go', variant: 'alternative' }, { id: 'l5', label: 'C# / .NET', variant: 'optional' }]] },
  { id: 'vcs', title: 'Version Control — Git', leftNodes: [{ id: 'vl1', label: 'GitHub', variant: 'recommended' }, { id: 'vl2', label: 'GitLab', variant: 'alternative' }, { id: 'vl3', label: 'Bitbucket', variant: 'optional' }], rightCols: [[{ id: 'vr1', label: 'Git Flow Strategy' }, { id: 'vr2', label: 'Code Review Best Practices' }]] },
  { id: 'db', title: 'Databases', leftNodes: [{ id: 'dbl1', label: 'SQL Basics', variant: 'recommended' }, { id: 'dbl2', label: 'ACID Properties', variant: 'recommended' }, { id: 'dbl3', label: 'ORMs (Prisma)', variant: 'optional' }], rightCols: [[{ id: 'db1', label: 'PostgreSQL / MySQL', variant: 'recommended' }, { id: 'db2', label: 'Normalization & Indexing' }, { id: 'db3', label: 'MongoDB (NoSQL)', variant: 'alternative' }, { id: 'db4', label: 'Redis (cache)', variant: 'optional' }]] },
  { id: 'apis', title: 'Learn about APIs', leftNodes: [{ id: 'al1', label: 'Postman / Insomnia', variant: 'recommended' }, { id: 'al2', label: 'API Design Principles', variant: 'recommended' }], rightCols: [[{ id: 'a1', label: 'REST APIs', variant: 'recommended' }, { id: 'a2', label: 'JSON & OpenAPI Spec' }, { id: 'a3', label: 'GraphQL', variant: 'optional' }, { id: 'a4', label: 'gRPC', variant: 'optional' }]] },
  { id: 'auth', title: 'Authentication', leftNodes: [{ id: 'aul1', label: 'Bcrypt / Hashing', variant: 'recommended' }, { id: 'aul2', label: 'HTTPS / TLS', variant: 'recommended' }, { id: 'aul3', label: 'CORS Policy', variant: 'optional' }], rightCols: [[{ id: 'au1', label: 'Sessions / Cookies' }, { id: 'au2', label: 'JWT', variant: 'recommended' }, { id: 'au3', label: 'OAuth 2.0', variant: 'alternative' }]] },
  { id: 'cache', title: 'Caching', leftNodes: [{ id: 'cal1', label: 'CDN Basics', variant: 'optional' }, { id: 'cal2', label: 'Cache Invalidation', variant: 'recommended' }], rightCols: [[{ id: 'ca1', label: 'HTTP Caching' }, { id: 'ca2', label: 'Redis / Memcached', variant: 'optional' }]] },
  { id: 'testing', title: 'Testing', leftNodes: [{ id: 'tel1', label: 'Jest / Mocha', variant: 'recommended' }, { id: 'tel2', label: 'Supertest', variant: 'optional' }], rightCols: [[{ id: 'te1', label: 'Unit Tests', variant: 'recommended' }, { id: 'te2', label: 'Integration Tests' }, { id: 'te3', label: 'API Testing Tools' }]] },
  { id: 'devops', title: 'DevOps Basics', leftNodes: [{ id: 'dol1', label: 'Linux CLI', variant: 'recommended' }, { id: 'dol2', label: 'SSH & Servers', variant: 'recommended' }, { id: 'dol3', label: 'Kubernetes', variant: 'optional' }], rightCols: [[{ id: 'do1', label: 'Docker', variant: 'recommended' }, { id: 'do2', label: 'CI / CD Pipelines', variant: 'recommended' }, { id: 'do3', label: 'Nginx (overview)', variant: 'optional' }]] },
  { id: 'scale', title: 'Design & Scalability', leftNodes: [{ id: 'scl1', label: 'System Design', variant: 'recommended' }, { id: 'scl2', label: 'Load Balancing', variant: 'optional' }], rightCols: [[{ id: 'sc1', label: 'Monolith vs Microservices' }, { id: 'sc2', label: 'Message Brokers', variant: 'optional' }, { id: 'sc3', label: 'Observability & Logging', variant: 'optional' }]] },
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
      {/* Colored left accent */}
      <span className={cx('absolute left-0 top-0 bottom-0 w-[2.5px] rounded-l-lg opacity-70', cfg.leftBar)} />
      <span className="pl-1">{node.label}</span>
    </div>
  );
}

function DashedLine() {
  return (
    <div
      className="h-px w-10 shrink-0"
      style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(251,191,36,0.5) 0px, rgba(251,191,36,0.5) 5px, transparent 5px, transparent 10px)' }}
    />
  );
}

function VertConnector({ visible }: { visible: boolean }) {
  return (
    <div
      className="mx-auto w-0.5 transition-all"
      style={{
        height: 28,
        background: visible
          ? 'linear-gradient(to bottom, rgba(251,191,36,0.6), rgba(251,191,36,0.6))'
          : 'transparent',
      }}
    />
  );
}

function MainNode({ title, index }: { title: string; index: number }) {
  return (
    <div className={cx(
      'w-52 rounded-xl border-2 border-amber-400/70 px-5 py-3.5 animate-node',
      'bg-gradient-to-br from-amber-400/20 to-amber-600/10',
      'text-center text-sm font-bold text-amber-200',
      'shadow-[0_0_20px_rgba(251,191,36,0.12)]',
      'transition-all duration-250 cursor-default select-none',
      'hover:border-amber-400/95 hover:shadow-[0_0_32px_rgba(251,191,36,0.28)] hover:scale-[1.04] hover:from-amber-400/28',
    )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="relative">
        <span className="absolute -left-5 top-1/2 -translate-y-1/2 text-amber-400/60 text-xs font-mono">{String(index + 1).padStart(2, '0')}</span>
        {title}
      </span>
    </div>
  );
}

function StepRow({ step, isFirst, isLast, index }: { step: MainStep; isFirst: boolean; isLast: boolean; index: number }) {
  const hasRight = !!step.rightCols?.length;
  const hasLeft = !!step.leftNodes?.length;

  return (
    <div className="flex items-center">
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
      <div className="flex w-52 flex-col items-center">
        <VertConnector visible={!isFirst} />
        <MainNode title={step.title} index={index} />
        <VertConnector visible={!isLast} />
      </div>

      {/* Right branches */}
      <div className="flex flex-1 flex-col items-start gap-3">
        {hasRight && step.rightCols!.map((col, ci) => (
          <div key={ci} className="flex items-center gap-2">
            <DashedLine />
            <div className="flex flex-wrap gap-2">
              {col.map((n) => <BranchBox key={n.id} node={n} />)}
            </div>
          </div>
        ))}
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
function RoadmapViewer({ selected }: { selected: RoadmapKey }) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const steps = selected === 'frontend' ? FRONTEND : BACKEND;
  const isFE = selected === 'frontend';

  return (
    <div className="w-full animate-fade-in">
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <Legend />
        <div className="text-[11px] text-[color:var(--cg-text-muted)] font-medium">
          {steps.length} topics · hover nodes to highlight
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
            {isFE ? '🧩 Front-end Roadmap' : '⚙️ Back-end Roadmap'}
          </div>
        </div>

        {/* Entry arrow */}
        <div className="flex justify-center mb-0">
          <div className="w-0.5" style={{ height: 20, background: 'linear-gradient(to bottom, transparent, rgba(251,191,36,0.6))' }} />
        </div>

        {/* Steps */}
        <div className="min-w-[640px]" onMouseLeave={() => setHoveredStep(null)}>
          {steps.map((step, i) => (
            <div key={step.id} onMouseEnter={() => setHoveredStep(step.id)}
              className={cx('transition-opacity duration-200', hoveredStep && hoveredStep !== step.id ? 'opacity-50' : 'opacity-100')}>
              <StepRow step={step} isFirst={i === 0} isLast={i === steps.length - 1} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RoadmapViewer;
