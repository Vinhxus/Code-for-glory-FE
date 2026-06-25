import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { useT } from '../i18n/useT';
import { useSettingsStore } from '../store/settings';

type TrackKey = 'frontend' | 'backend';
type NodeKind = 'main' | 'sub' | 'badge' | 'panel';
type NodeLevel = 'beginner' | 'intermediate' | 'advanced';

type RoadmapNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  kind: NodeKind;
  level?: NodeLevel;
  /** Internal navigation path, e.g. `/career-path/frontend/html` */
  href?: string;
};

type RoadmapEdge = {
  from: string;
  to: string;
  kind: 'solid' | 'dotted';
};

type RoadmapSpec = {
  width: number;
  height: number;
  title: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const STYLES: Record<
  NodeKind,
  { fill: string; stroke: string; text: string; shadow?: string }
> = {
  main: {
    fill: '#FDE047',
    stroke: '#111827',
    text: '#111827',
    shadow: 'drop-shadow(0 10px 25px rgba(0,0,0,0.25))',
  },
  sub: {
    fill: '#FFE7A3',
    stroke: '#111827',
    text: '#111827',
    shadow: 'drop-shadow(0 10px 22px rgba(0,0,0,0.22))',
  },
  badge: {
    fill: '#4F46E5',
    stroke: '#1F1BA8',
    text: '#ffffff',
    shadow: 'drop-shadow(0 14px 30px rgba(79,70,229,0.25))',
  },
  panel: {
    fill: 'rgba(15,18,38,0.55)',
    stroke: 'rgba(255,255,255,0.10)',
    text: 'rgba(255,255,255,0.86)',
  },
};

const LEVEL_STYLES: Record<
  NodeLevel,
  {
    bubbleFill: string;
    bubbleStroke: string;
    bubbleText: string;
    accent: string;
    label: string;
  }
> = {
  beginner: {
    bubbleFill: '#4ade80',
    bubbleStroke: '#14532d',
    bubbleText: '#052e16',
    accent: 'rgba(74,222,128,0.58)',
    label: 'Beginner',
  },
  intermediate: {
    bubbleFill: '#60a5fa',
    bubbleStroke: '#1e3a8a',
    bubbleText: '#0f172a',
    accent: 'rgba(96,165,250,0.58)',
    label: 'Medium',
  },
  advanced: {
    bubbleFill: '#a78bfa',
    bubbleStroke: '#4c1d95',
    bubbleText: '#1f1147',
    accent: 'rgba(167,139,250,0.62)',
    label: 'Advanced',
  },
};

function isExternalLink(href?: string) {
  return Boolean(href && /^https?:\/\//i.test(href));
}

function wrapText(label: string, maxCharsPerLine: number) {
  const lines: string[] = [];
  for (const paragraph of label.split('\n')) {
    const words = paragraph.split(' ');
    let current = '';
    for (const w of words) {
      const next = current ? `${current} ${w}` : w;
      if (next.length > maxCharsPerLine && current) {
        lines.push(current);
        current = w;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
  }
  return lines.slice(0, 4);
}

function NodeBox({ node }: { node: RoadmapNode }) {
  const s = STYLES[node.kind];
  const rx = node.kind === 'badge' ? 14 : 12;
  const lines = wrapText(node.label, Math.max(12, Math.floor(node.w / 10)));
  const fontSize = node.kind === 'badge' ? 14 : node.kind === 'panel' ? 12 : 13;
  const fontWeight =
    node.kind === 'main' ? 800 : node.kind === 'badge' ? 700 : 700;

  const interactive = Boolean(node.href) && node.kind !== 'panel';
  const levelStyle = node.level ? LEVEL_STYLES[node.level] : null;
  const isExternal = isExternalLink(node.href);
  const bubble =
    node.kind === 'panel' || !levelStyle
      ? null
      : node.kind === 'main'
        ? {
            fill: levelStyle.bubbleFill,
            stroke: levelStyle.bubbleStroke,
            text:
              node.level === 'beginner'
                ? 'B'
                : node.level === 'intermediate'
                  ? 'M'
                  : 'A',
            textColor: levelStyle.bubbleText,
            width: 28,
            height: 22,
            pill: true,
          }
        : {
            fill: levelStyle.bubbleFill,
            stroke: levelStyle.bubbleStroke,
            text:
              node.level === 'beginner'
                ? 'B'
                : node.level === 'intermediate'
                  ? 'M'
                  : 'A',
            textColor: levelStyle.bubbleText,
            pill: false,
          };
  const accentStroke =
    interactive && levelStyle && node.kind !== 'panel'
      ? levelStyle.accent
      : s.stroke;
  const labelOffsetX = bubble && bubble.pill ? 18 : 0;
  const labelOffsetY = bubble && bubble.pill ? 8 : 0;
  const isLargePanel = node.kind === 'panel' && node.h >= 72;
  const panelLines = isLargePanel ? node.label.split('\n') : [];
  const panelTitle = panelLines[0] ?? '';
  const panelSubtitleLines = isLargePanel
    ? wrapText(
        panelLines.slice(1).join(' '),
        Math.max(20, Math.floor((node.w - 72) / 12))
      ).slice(0, 2)
    : [];
  const panelDividerY =
    node.y + 74 + Math.max(0, panelSubtitleLines.length - 1) * 12;

  const content = (
    <g
      style={
        interactive
          ? {
              cursor: 'pointer' as const,
              filter: s.shadow,
              transition: 'transform 180ms ease, filter 180ms ease',
              transformOrigin: `${node.x + node.w / 2}px ${node.y + node.h / 2}px`,
            }
          : {
              cursor: 'default' as const,
              filter: s.shadow,
            }
      }
    >
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={rx}
        fill={s.fill}
        stroke={accentStroke}
        strokeWidth={node.kind === 'panel' ? 1 : 2}
      />
      {isLargePanel && (
        <>
          <text
            x={node.x + node.w / 2}
            y={node.y + 26}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.95)"
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              fontFamily: 'Lexend, ui-sans-serif, system-ui',
            }}
          >
            {panelTitle}
          </text>
          {panelSubtitleLines.map((ln, index) => (
            <text
              key={`${node.id}-panel-${ln}`}
              x={node.x + node.w / 2}
              y={node.y + 46 + index * 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.52)"
              style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: 'ui-sans-serif, system-ui',
              }}
            >
              {ln}
            </text>
          ))}
          <line
            x1={node.x + 24}
            y1={panelDividerY}
            x2={node.x + node.w - 24}
            y2={panelDividerY}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        </>
      )}

      {bubble && (
        <>
          {bubble.pill ? (
            <>
              {(() => {
                const pillWidth = bubble.width ?? 76;
                const pillHeight = bubble.height ?? 22;
                return (
                  <>
                    <rect
                      x={node.x + 12}
                      y={node.y + 10}
                      width={pillWidth}
                      height={pillHeight}
                      rx={pillHeight / 2}
                      fill={bubble.fill}
                      stroke={bubble.stroke}
                      strokeWidth={1.2}
                    />
                    <text
                      x={node.x + 12 + pillWidth / 2}
                      y={node.y + 10 + pillHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={bubble.textColor}
                      style={{
                        fontSize: 9,
                        fontWeight: 900,
                        letterSpacing: '0.04em',
                        fontFamily: 'Lexend, ui-sans-serif, system-ui',
                      }}
                    >
                      {bubble.text}
                    </text>
                  </>
                );
              })()}
            </>
          ) : (
            <>
              <circle
                cx={node.x + 14}
                cy={node.y + 14}
                r={9}
                fill={bubble.fill}
                stroke={bubble.stroke}
                strokeWidth={1.2}
              />
              <text
                x={node.x + 14}
                y={node.y + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={bubble.textColor}
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  fontFamily: 'Lexend, ui-sans-serif, system-ui',
                }}
              >
                {bubble.text}
              </text>
            </>
          )}
        </>
      )}

      {!isLargePanel && (
        <text
          x={node.x + node.w / 2 + labelOffsetX}
          y={node.y + node.h / 2 + labelOffsetY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={s.text}
          style={{
            fontSize,
            fontWeight,
            fontFamily:
              node.kind === 'badge'
                ? 'Lexend, ui-sans-serif, system-ui'
                : 'ui-sans-serif, system-ui',
          }}
        >
          {lines.map((ln, i) => (
            <tspan
              key={`${node.id}-${ln}`}
              x={node.x + node.w / 2 + labelOffsetX}
              dy={
                i === 0
                  ? -(lines.length - 1) * (fontSize * 0.55)
                  : fontSize * 1.1
              }
            >
              {ln}
            </tspan>
          ))}
        </text>
      )}
      {interactive && isExternal && node.kind !== 'panel' && (
        <text
          x={node.x + node.w - 16}
          y={node.y + node.h - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(15,23,42,0.76)"
          style={{
            fontSize: 10,
            fontWeight: 800,
            fontFamily: 'Lexend, ui-sans-serif, system-ui',
          }}
        >
          ↗
        </text>
      )}
    </g>
  );

  if (!interactive || !node.href) return content;
  return (
    <a
      href={node.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
      aria-label={`${node.label} - open resource`}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      {content}
    </a>
  );
}

function RoadmapCanvas({ spec }: { spec: RoadmapSpec }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const autoFittedRef = useRef(false);
  const [zoom, setZoom] = useState(0.9);
  const [containerWidth, setContainerWidth] = useState(0);

  const clampZoom = (z: number) => Math.max(0.45, Math.min(1.8, z));
  const fitZoom = useMemo(() => {
    if (!containerWidth) return 1;
    return clampZoom((containerWidth - 56) / spec.width);
  }, [containerWidth, spec.width]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setContainerWidth(el.clientWidth));
    obs.observe(el);
    setContainerWidth(el.clientWidth);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!containerWidth) return;
    if (autoFittedRef.current) return;
    autoFittedRef.current = true;
    setTimeout(() => setZoom(fitZoom), 0);
  }, [containerWidth, fitZoom]);

  const nodesById = useMemo(() => {
    const m = new Map<string, RoadmapNode>();
    for (const n of spec.nodes) m.set(n.id, n);
    return m;
  }, [spec.nodes]);

  const edges = useMemo(() => {
    return spec.edges
      .map((e) => {
        const a = nodesById.get(e.from);
        const b = nodesById.get(e.to);
        if (!a || !b) return null;
        const ax = a.x + a.w / 2;
        const ay = a.y + a.h / 2;
        const bx = b.x + b.w / 2;
        const by = b.y + b.h / 2;
        const isMostlyVertical = Math.abs(ay - by) > Math.abs(ax - bx);
        const start = isMostlyVertical
          ? { x: ax, y: ay < by ? a.y + a.h : a.y }
          : { x: ax < bx ? a.x + a.w : a.x, y: ay };
        const end = isMostlyVertical
          ? { x: bx, y: ay < by ? b.y : b.y + b.h }
          : { x: ax < bx ? b.x : b.x + b.w, y: by };
        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);
        const horizontalFirst = dx > dy;
        const midX = Math.round((start.x + end.x) / 2);
        const midY = Math.round((start.y + end.y) / 2);
        const d = horizontalFirst
          ? `M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`
          : `M ${start.x} ${start.y} V ${midY} H ${end.x} V ${end.y}`;
        return { ...e, d };
      })
      .filter(Boolean) as Array<
      RoadmapEdge & {
        d: string;
      }
    >;
  }, [nodesById, spec.edges]);

  return (
    <section className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-bold tracking-widest text-[color:var(--cg-text-muted)] uppercase">
            {spec.title}
          </div>
          <div className="mt-1 text-sm text-[color:var(--cg-text-muted)]">
            Khám phá lộ trình học phù hợp với bạn, mở từng chủ đề để xem tài
            liệu và đi từng bước chắc hơn.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-3 pr-2 md:flex">
            {[
              { label: 'Beginner', color: '#4ade80' },
              { label: 'Medium', color: '#60a5fa' },
              { label: 'Advanced', color: '#a78bfa' },
            ].map((x) => (
              <div
                key={x.label}
                className="flex items-center gap-2 rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-1 text-[11px] font-semibold text-[color:var(--cg-text-muted)]"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: x.color }}
                />
                {x.label}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setZoom((z) => clampZoom(z - 0.1))}
            className="h-9 px-3 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-xs font-semibold transition hover:bg-[color:var(--cg-container-a22)]"
            title="Zoom out"
          >
            −
          </button>
          <div className="h-9 px-3 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[color:var(--cg-text-muted)]">
              zoom_in
            </span>
            {Math.round(zoom * 100)}%
          </div>
          <button
            type="button"
            onClick={() => setZoom((z) => clampZoom(z + 0.1))}
            className="h-9 px-3 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-xs font-semibold transition hover:bg-[color:var(--cg-container-a22)]"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom(fitZoom)}
            className="h-9 px-3 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-xs font-semibold transition hover:bg-[color:var(--cg-container-a22)]"
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="h-9 px-3 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-xs font-semibold transition hover:bg-[color:var(--cg-container-a22)]"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-auto"
        style={{ maxHeight: 'calc(100vh - 260px)' }}
      >
        {/* grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(167,139,250,1) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div
          className="relative p-6"
          style={{
            width: Math.round(spec.width * zoom) + 48,
            height: Math.round(spec.height * zoom) + 48,
          }}
        >
          <svg
            width={Math.round(spec.width * zoom)}
            height={Math.round(spec.height * zoom)}
            viewBox={`0 0 ${spec.width} ${spec.height}`}
            className="select-none"
          >
            {/* edges */}
            {edges.map((e) => (
              <path
                key={`${e.from}-${e.to}-${e.kind}`}
                d={e.d}
                stroke={e.kind === 'solid' ? '#3b82f6' : '#60a5fa'}
                strokeWidth={e.kind === 'solid' ? 3 : 2}
                strokeDasharray={e.kind === 'dotted' ? '3 8' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={e.kind === 'solid' ? 0.95 : 0.9}
              />
            ))}

            {/* nodes */}
            {spec.nodes.map((n) => (
              <NodeBox key={n.id} node={n} />
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}

function buildFrontendSpec(): RoadmapSpec {
  const width = 1660;
  const height = 2860;

  const nodes: RoadmapNode[] = [
    // Left lesson topics
    {
      id: 'lessonTopics',
      x: 60,
      y: 78,
      w: 340,
      h: 230,
      label:
        'Lesson Topics\nCác chủ đề nền tảng nên học sớm để đi roadmap mượt hơn',
      kind: 'panel',
    },
    {
      id: 'topicHtml',
      x: 86,
      y: 164,
      w: 124,
      h: 36,
      label: 'HTML Basics',
      kind: 'sub',
      level: 'beginner',
      href: 'https://roadmap.sh/html',
    },
    {
      id: 'topicCss',
      x: 224,
      y: 164,
      w: 150,
      h: 36,
      label: 'CSS Layout',
      kind: 'sub',
      level: 'beginner',
      href: 'https://roadmap.sh/css',
    },
    {
      id: 'topicJs',
      x: 86,
      y: 210,
      w: 138,
      h: 36,
      label: 'JavaScript',
      kind: 'sub',
      level: 'beginner',
      href: 'https://roadmap.sh/javascript',
    },
    {
      id: 'topicGit',
      x: 238,
      y: 210,
      w: 136,
      h: 36,
      label: 'Git & GitHub',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://roadmap.sh/git-github',
    },
    {
      id: 'topicDevtools',
      x: 86,
      y: 256,
      w: 138,
      h: 36,
      label: 'DevTools',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://developer.chrome.com/docs/devtools',
    },
    {
      id: 'topicResponsive',
      x: 238,
      y: 256,
      w: 136,
      h: 36,
      label: 'Responsive UI',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://web.dev/learn/design',
    },
    {
      id: 'practiceTopics',
      x: 60,
      y: 336,
      w: 340,
      h: 214,
      label: 'Practice Topics\nCác chủ đề nên luyện song song để hiểu sâu hơn',
      kind: 'panel',
    },
    {
      id: 'topicDom',
      x: 84,
      y: 422,
      w: 132,
      h: 36,
      label: 'DOM Events',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events',
    },
    {
      id: 'topicAsync',
      x: 228,
      y: 422,
      w: 148,
      h: 36,
      label: 'Async JavaScript',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS',
    },
    {
      id: 'topicForms',
      x: 84,
      y: 468,
      w: 132,
      h: 36,
      label: 'Forms & Validation',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms',
    },
    {
      id: 'topicAccessibility',
      x: 228,
      y: 468,
      w: 148,
      h: 36,
      label: 'Accessibility',
      kind: 'sub',
      level: 'advanced',
      href: 'https://web.dev/learn/accessibility',
    },
    // Center spine (roadmap.sh-like)
    {
      id: 'title',
      x: 635,
      y: 74,
      w: 210,
      h: 42,
      label: 'Front-end',
      kind: 'panel',
    },
    {
      id: 'internet',
      x: 640,
      y: 190,
      w: 200,
      h: 48,
      label: 'Internet',
      kind: 'main',
      level: 'beginner',
      href: 'https://roadmap.sh/frontend',
    },
    {
      id: 'html',
      x: 670,
      y: 312,
      w: 140,
      h: 44,
      label: 'HTML',
      kind: 'main',
      level: 'beginner',
      href: 'https://roadmap.sh/html',
    },
    {
      id: 'css',
      x: 670,
      y: 384,
      w: 140,
      h: 44,
      label: 'CSS',
      kind: 'main',
      level: 'beginner',
      href: 'https://roadmap.sh/css',
    },
    {
      id: 'js',
      x: 640,
      y: 456,
      w: 200,
      h: 48,
      label: 'JavaScript',
      kind: 'main',
      level: 'beginner',
      href: 'https://roadmap.sh/javascript',
    },
    {
      id: 'vcontrol',
      x: 640,
      y: 618,
      w: 200,
      h: 48,
      label: 'Version Control',
      kind: 'main',
      level: 'intermediate',
      href: 'https://roadmap.sh/git-github',
    },
    {
      id: 'vcshost',
      x: 640,
      y: 692,
      w: 200,
      h: 48,
      label: 'VCS Hosting',
      kind: 'main',
      level: 'intermediate',
      href: 'https://roadmap.sh/git-github',
    },
    {
      id: 'framework',
      x: 640,
      y: 900,
      w: 200,
      h: 48,
      label: 'Learn a Framework',
      kind: 'main',
      level: 'intermediate',
      href: 'https://roadmap.sh/frontend',
    },
    {
      id: 'package',
      x: 1075,
      y: 566,
      w: 260,
      h: 48,
      label: 'Package Managers',
      kind: 'main',
      level: 'intermediate',
      href: 'https://roadmap.sh/frontend',
    },
    {
      id: 'cssfw',
      x: 1075,
      y: 742,
      w: 260,
      h: 48,
      label: 'CSS Frameworks',
      kind: 'main',
      level: 'intermediate',
      href: 'https://roadmap.sh/frontend',
    },
    {
      id: 'tailwind',
      x: 1100,
      y: 816,
      w: 180,
      h: 40,
      label: 'Tailwind',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://roadmap.sh/tailwindcss',
    },
    {
      id: 'sass',
      x: 1100,
      y: 868,
      w: 180,
      h: 40,
      label: 'Sass',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://sass-lang.com/guide/',
    },
    {
      id: 'cssModules',
      x: 1100,
      y: 920,
      w: 180,
      h: 40,
      label: 'CSS Modules',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://github.com/css-modules/css-modules',
    },

    // Left frameworks
    {
      id: 'react',
      x: 170,
      y: 862,
      w: 190,
      h: 42,
      label: 'React',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://roadmap.sh/react',
    },
    {
      id: 'vue',
      x: 170,
      y: 916,
      w: 190,
      h: 42,
      label: 'Vue.js',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://vuejs.org/guide/introduction.html',
    },
    {
      id: 'angular',
      x: 170,
      y: 970,
      w: 190,
      h: 42,
      label: 'Angular',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://angular.dev/tutorials/learn-angular',
    },
    {
      id: 'svelte',
      x: 170,
      y: 1024,
      w: 190,
      h: 42,
      label: 'Svelte',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://svelte.dev/docs/svelte/overview',
    },

    // Right internet questions
    {
      id: 'q1',
      x: 1180,
      y: 194,
      w: 320,
      h: 40,
      label: 'How does the internet work?',
      kind: 'sub',
      level: 'beginner',
      href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work',
    },
    {
      id: 'q2',
      x: 1180,
      y: 244,
      w: 320,
      h: 40,
      label: 'What is HTTP?',
      kind: 'sub',
      level: 'beginner',
      href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
    },
    {
      id: 'q3',
      x: 1180,
      y: 294,
      w: 320,
      h: 40,
      label: 'What is Domain Name?',
      kind: 'sub',
      level: 'beginner',
      href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_domain_name',
    },
    {
      id: 'q4',
      x: 1180,
      y: 344,
      w: 320,
      h: 40,
      label: 'What is hosting?',
      kind: 'sub',
      level: 'beginner',
      href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_web_server',
    },
    {
      id: 'q5',
      x: 1180,
      y: 394,
      w: 320,
      h: 40,
      label: 'DNS and how it works?',
      kind: 'sub',
      level: 'beginner',
      href: 'https://www.cloudflare.com/learning/dns/what-is-dns/',
    },

    // Package manager chips
    {
      id: 'npm',
      x: 1094,
      y: 632,
      w: 110,
      h: 36,
      label: 'npm',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://docs.npmjs.com/about-npm',
    },
    {
      id: 'yarn',
      x: 1220,
      y: 632,
      w: 110,
      h: 36,
      label: 'Yarn',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://yarnpkg.com/getting-started',
    },
    {
      id: 'pnpm',
      x: 1094,
      y: 678,
      w: 110,
      h: 36,
      label: 'pnpm',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://pnpm.io/installation',
    },
    {
      id: 'bun',
      x: 1220,
      y: 678,
      w: 110,
      h: 36,
      label: 'Bun',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://bun.sh/docs',
    },
    {
      id: 'typescript',
      x: 1175,
      y: 972,
      w: 260,
      h: 48,
      label: 'TypeScript',
      kind: 'main',
      level: 'intermediate',
      href: 'https://roadmap.sh/typescript',
    },
    {
      id: 'nextjs',
      x: 1188,
      y: 1042,
      w: 180,
      h: 40,
      label: 'Next.js',
      kind: 'sub',
      level: 'advanced',
      href: 'https://nextjs.org/learn',
    },
    {
      id: 'astro',
      x: 1188,
      y: 1094,
      w: 180,
      h: 40,
      label: 'Astro',
      kind: 'sub',
      level: 'advanced',
      href: 'https://docs.astro.build/en/tutorial/0-introduction/',
    },
    {
      id: 'tsconfig',
      x: 1382,
      y: 1042,
      w: 140,
      h: 40,
      label: 'TSConfig',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://www.typescriptlang.org/tsconfig',
    },
    {
      id: 'generics',
      x: 1382,
      y: 1094,
      w: 140,
      h: 40,
      label: 'Generics',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://www.typescriptlang.org/docs/handbook/2/generics.html',
    },
    {
      id: 'narrowing',
      x: 1382,
      y: 1146,
      w: 140,
      h: 40,
      label: 'Narrowing',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
    },
    {
      id: 'bundlers',
      x: 640,
      y: 1128,
      w: 200,
      h: 48,
      label: 'Build Tools',
      kind: 'main',
      level: 'advanced',
      href: 'https://roadmap.sh/frontend',
    },
    {
      id: 'vite',
      x: 420,
      y: 1104,
      w: 170,
      h: 40,
      label: 'Vite',
      kind: 'sub',
      level: 'advanced',
      href: 'https://vite.dev/guide/',
    },
    {
      id: 'webpack',
      x: 420,
      y: 1156,
      w: 170,
      h: 40,
      label: 'Webpack',
      kind: 'sub',
      level: 'advanced',
      href: 'https://webpack.js.org/concepts/',
    },
    {
      id: 'parcel',
      x: 420,
      y: 1208,
      w: 170,
      h: 40,
      label: 'Parcel',
      kind: 'sub',
      level: 'advanced',
      href: 'https://parceljs.org/getting-started/webapp/',
    },
    {
      id: 'solid',
      x: 170,
      y: 1078,
      w: 190,
      h: 42,
      label: 'SolidJS',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://docs.solidjs.com/guides/getting-started',
    },
    {
      id: 'qwik',
      x: 170,
      y: 1132,
      w: 190,
      h: 42,
      label: 'Qwik',
      kind: 'sub',
      level: 'advanced',
      href: 'https://qwik.dev/docs/',
    },
    {
      id: 'linters',
      x: 1175,
      y: 1128,
      w: 260,
      h: 48,
      label: 'Linters & Formatters',
      kind: 'main',
      level: 'advanced',
      href: 'https://roadmap.sh/frontend',
    },
    {
      id: 'eslint',
      x: 1202,
      y: 1200,
      w: 200,
      h: 40,
      label: 'ESLint',
      kind: 'sub',
      level: 'advanced',
      href: 'https://eslint.org/docs/latest/use/getting-started',
    },
    {
      id: 'prettier',
      x: 1202,
      y: 1252,
      w: 200,
      h: 40,
      label: 'Prettier',
      kind: 'sub',
      level: 'advanced',
      href: 'https://prettier.io/docs/en/',
    },
    {
      id: 'stylelint',
      x: 1202,
      y: 1304,
      w: 200,
      h: 40,
      label: 'Stylelint',
      kind: 'sub',
      level: 'advanced',
      href: 'https://stylelint.io/user-guide/get-started',
    },
    {
      id: 'webapi',
      x: 640,
      y: 1366,
      w: 200,
      h: 48,
      label: 'Web APIs',
      kind: 'main',
      level: 'advanced',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API',
    },
    {
      id: 'fetchApi',
      x: 1200,
      y: 1336,
      w: 180,
      h: 40,
      label: 'Fetch API',
      kind: 'sub',
      level: 'advanced',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API',
    },
    {
      id: 'storageApi',
      x: 1200,
      y: 1388,
      w: 180,
      h: 40,
      label: 'Storage API',
      kind: 'sub',
      level: 'advanced',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/Storage',
    },
    {
      id: 'websocketApi',
      x: 1200,
      y: 1440,
      w: 180,
      h: 40,
      label: 'WebSockets',
      kind: 'sub',
      level: 'advanced',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API',
    },
    {
      id: 'serviceWorker',
      x: 1200,
      y: 1492,
      w: 180,
      h: 40,
      label: 'Service Worker',
      kind: 'sub',
      level: 'advanced',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API',
    },
    {
      id: 'indexedDb',
      x: 1200,
      y: 1544,
      w: 180,
      h: 40,
      label: 'IndexedDB',
      kind: 'sub',
      level: 'advanced',
      href: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API',
    },
    {
      id: 'testing',
      x: 640,
      y: 1698,
      w: 200,
      h: 48,
      label: 'Testing',
      kind: 'main',
      level: 'advanced',
      href: 'https://roadmap.sh/frontend',
    },
    {
      id: 'unitTesting',
      x: 420,
      y: 1672,
      w: 170,
      h: 40,
      label: 'Unit Tests',
      kind: 'sub',
      level: 'advanced',
      href: 'https://vitest.dev/guide/',
    },
    {
      id: 'integrationTesting',
      x: 420,
      y: 1724,
      w: 170,
      h: 40,
      label: 'Integration',
      kind: 'sub',
      level: 'advanced',
      href: 'https://testing-library.com/docs/',
    },
    {
      id: 'e2eTesting',
      x: 420,
      y: 1776,
      w: 170,
      h: 40,
      label: 'E2E',
      kind: 'sub',
      level: 'advanced',
      href: 'https://playwright.dev/docs/intro',
    },
    {
      id: 'storybook',
      x: 420,
      y: 1828,
      w: 170,
      h: 40,
      label: 'Storybook',
      kind: 'sub',
      level: 'advanced',
      href: 'https://storybook.js.org/docs',
    },
    {
      id: 'security',
      x: 640,
      y: 1988,
      w: 200,
      h: 48,
      label: 'Web Security',
      kind: 'main',
      level: 'advanced',
      href: 'https://roadmap.sh/api-security-best-practices',
    },
    {
      id: 'a11y',
      x: 640,
      y: 2190,
      w: 200,
      h: 48,
      label: 'Accessibility',
      kind: 'main',
      level: 'advanced',
      href: 'https://web.dev/learn/accessibility',
    },
    {
      id: 'cors',
      x: 1200,
      y: 1962,
      w: 180,
      h: 40,
      label: 'CORS',
      kind: 'sub',
      level: 'advanced',
      href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
    },
    {
      id: 'csp',
      x: 1200,
      y: 2014,
      w: 180,
      h: 40,
      label: 'CSP',
      kind: 'sub',
      level: 'advanced',
      href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
    },
    {
      id: 'authFlows',
      x: 1200,
      y: 2066,
      w: 180,
      h: 40,
      label: 'Auth Flows',
      kind: 'sub',
      level: 'advanced',
      href: 'https://roadmap.sh/frontend',
    },
    {
      id: 'seo',
      x: 1200,
      y: 2164,
      w: 180,
      h: 40,
      label: 'SEO',
      kind: 'sub',
      level: 'advanced',
      href: 'https://web.dev/learn/seo',
    },
    {
      id: 'webVitals',
      x: 1200,
      y: 2216,
      w: 180,
      h: 40,
      label: 'Web Vitals',
      kind: 'sub',
      level: 'advanced',
      href: 'https://web.dev/vitals/',
    },
    {
      id: 'continue',
      x: 330,
      y: 2460,
      w: 980,
      h: 148,
      label:
        'Continue Learning\nNode.js · GraphQL · React Native · Full Stack · Design Systems · Backend',
      kind: 'panel',
    },
    {
      id: 'nodejs',
      x: 382,
      y: 2538,
      w: 118,
      h: 34,
      label: 'Node.js',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/nodejs',
    },
    {
      id: 'graphqlMain',
      x: 520,
      y: 2538,
      w: 118,
      h: 34,
      label: 'GraphQL',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/graphql',
    },
    {
      id: 'reactNative',
      x: 658,
      y: 2538,
      w: 140,
      h: 34,
      label: 'React Native',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/react-native',
    },
    {
      id: 'fullstack',
      x: 812,
      y: 2538,
      w: 118,
      h: 34,
      label: 'Full Stack',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/backend',
    },
    {
      id: 'designSystems',
      x: 944,
      y: 2538,
      w: 150,
      h: 34,
      label: 'Design Systems',
      kind: 'badge',
      level: 'advanced',
      href: 'https://storybook.js.org/docs',
    },
    {
      id: 'backendTrack',
      x: 1108,
      y: 2538,
      w: 118,
      h: 34,
      label: 'Backend',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/backend',
    },
  ];

  const edges: RoadmapEdge[] = [
    { from: 'topicHtml', to: 'html', kind: 'dotted' },
    { from: 'topicCss', to: 'css', kind: 'dotted' },
    { from: 'topicJs', to: 'js', kind: 'dotted' },
    { from: 'topicGit', to: 'vcontrol', kind: 'dotted' },
    { from: 'topicResponsive', to: 'cssfw', kind: 'dotted' },
    { from: 'topicDom', to: 'framework', kind: 'dotted' },
    { from: 'topicAsync', to: 'webapi', kind: 'dotted' },
    { from: 'topicAccessibility', to: 'a11y', kind: 'dotted' },
    { from: 'internet', to: 'html', kind: 'solid' },
    { from: 'html', to: 'css', kind: 'solid' },
    { from: 'css', to: 'js', kind: 'solid' },
    { from: 'js', to: 'vcontrol', kind: 'solid' },
    { from: 'vcontrol', to: 'vcshost', kind: 'solid' },
    { from: 'vcshost', to: 'framework', kind: 'solid' },

    { from: 'internet', to: 'q1', kind: 'dotted' },
    { from: 'internet', to: 'q2', kind: 'dotted' },
    { from: 'internet', to: 'q3', kind: 'dotted' },
    { from: 'internet', to: 'q4', kind: 'dotted' },
    { from: 'internet', to: 'q5', kind: 'dotted' },

    { from: 'js', to: 'package', kind: 'solid' },
    { from: 'package', to: 'npm', kind: 'dotted' },
    { from: 'package', to: 'yarn', kind: 'dotted' },
    { from: 'package', to: 'pnpm', kind: 'dotted' },
    { from: 'package', to: 'bun', kind: 'dotted' },
    { from: 'package', to: 'cssfw', kind: 'solid' },
    { from: 'cssfw', to: 'tailwind', kind: 'dotted' },
    { from: 'cssfw', to: 'sass', kind: 'dotted' },
    { from: 'cssfw', to: 'cssModules', kind: 'dotted' },

    { from: 'framework', to: 'react', kind: 'dotted' },
    { from: 'framework', to: 'vue', kind: 'dotted' },
    { from: 'framework', to: 'angular', kind: 'dotted' },
    { from: 'framework', to: 'svelte', kind: 'dotted' },
    { from: 'framework', to: 'solid', kind: 'dotted' },
    { from: 'framework', to: 'qwik', kind: 'dotted' },
    { from: 'framework', to: 'typescript', kind: 'solid' },
    { from: 'typescript', to: 'nextjs', kind: 'dotted' },
    { from: 'typescript', to: 'astro', kind: 'dotted' },
    { from: 'typescript', to: 'tsconfig', kind: 'dotted' },
    { from: 'typescript', to: 'generics', kind: 'dotted' },
    { from: 'typescript', to: 'narrowing', kind: 'dotted' },

    { from: 'framework', to: 'bundlers', kind: 'solid' },
    { from: 'bundlers', to: 'vite', kind: 'dotted' },
    { from: 'bundlers', to: 'webpack', kind: 'dotted' },
    { from: 'bundlers', to: 'parcel', kind: 'dotted' },
    { from: 'bundlers', to: 'linters', kind: 'solid' },
    { from: 'linters', to: 'eslint', kind: 'dotted' },
    { from: 'linters', to: 'prettier', kind: 'dotted' },
    { from: 'linters', to: 'stylelint', kind: 'dotted' },

    { from: 'bundlers', to: 'webapi', kind: 'solid' },
    { from: 'webapi', to: 'fetchApi', kind: 'dotted' },
    { from: 'webapi', to: 'storageApi', kind: 'dotted' },
    { from: 'webapi', to: 'websocketApi', kind: 'dotted' },
    { from: 'webapi', to: 'serviceWorker', kind: 'dotted' },
    { from: 'webapi', to: 'indexedDb', kind: 'dotted' },
    { from: 'webapi', to: 'testing', kind: 'solid' },
    { from: 'testing', to: 'unitTesting', kind: 'dotted' },
    { from: 'testing', to: 'integrationTesting', kind: 'dotted' },
    { from: 'testing', to: 'e2eTesting', kind: 'dotted' },
    { from: 'testing', to: 'storybook', kind: 'dotted' },
    { from: 'testing', to: 'security', kind: 'solid' },
    { from: 'security', to: 'cors', kind: 'dotted' },
    { from: 'security', to: 'csp', kind: 'dotted' },
    { from: 'security', to: 'authFlows', kind: 'dotted' },
    { from: 'security', to: 'a11y', kind: 'solid' },
    { from: 'a11y', to: 'seo', kind: 'dotted' },
    { from: 'a11y', to: 'webVitals', kind: 'dotted' },

    { from: 'a11y', to: 'continue', kind: 'dotted' },
    { from: 'continue', to: 'nodejs', kind: 'dotted' },
    { from: 'continue', to: 'graphqlMain', kind: 'dotted' },
    { from: 'continue', to: 'reactNative', kind: 'dotted' },
    { from: 'continue', to: 'fullstack', kind: 'dotted' },
    { from: 'continue', to: 'designSystems', kind: 'dotted' },
    { from: 'continue', to: 'backendTrack', kind: 'dotted' },
  ];

  // Increase vertical spacing between nodes by applying a spacing multiplier.
  // Adjust SPACING_FACTOR to tune gaps; 1.0 = original spacing.
  const SPACING_FACTOR = 1.18;
  const spacedNodes = nodes.map((n) => ({
    ...n,
    y: Math.round(n.y * SPACING_FACTOR),
  }));

  return {
    width,
    height: Math.round(height * SPACING_FACTOR),
    title: 'Frontend Roadmap',
    nodes: spacedNodes,
    edges,
  };
}

function buildBackendSpec(): RoadmapSpec {
  const width = 1660;
  const height = 2740;

  const nodes: RoadmapNode[] = [
    {
      id: 'title',
      x: 645,
      y: 74,
      w: 190,
      h: 42,
      label: 'Backend',
      kind: 'panel',
    },

    // Left language pick
    {
      id: 'langPanel',
      x: 70,
      y: 168,
      w: 340,
      h: 266,
      label:
        'Pick a Backend Language\nJavaScript · Python · Java · Go · C# · Rust',
      kind: 'panel',
    },
    {
      id: 'jsL',
      x: 102,
      y: 248,
      w: 126,
      h: 40,
      label: 'JavaScript',
      kind: 'sub',
      level: 'beginner',
      href: 'https://roadmap.sh/nodejs',
    },
    {
      id: 'pyL',
      x: 246,
      y: 248,
      w: 126,
      h: 40,
      label: 'Python',
      kind: 'sub',
      level: 'beginner',
      href: 'https://roadmap.sh/python',
    },
    {
      id: 'javaL',
      x: 102,
      y: 300,
      w: 126,
      h: 40,
      label: 'Java',
      kind: 'sub',
      level: 'beginner',
      href: 'https://roadmap.sh/java',
    },
    {
      id: 'goL',
      x: 246,
      y: 300,
      w: 126,
      h: 40,
      label: 'Go',
      kind: 'sub',
      level: 'beginner',
      href: 'https://roadmap.sh/golang',
    },
    {
      id: 'csharpL',
      x: 102,
      y: 352,
      w: 126,
      h: 40,
      label: 'C#',
      kind: 'sub',
      level: 'beginner',
      href: 'https://roadmap.sh/aspnet-core',
    },
    {
      id: 'rustL',
      x: 246,
      y: 352,
      w: 126,
      h: 40,
      label: 'Rust',
      kind: 'sub',
      level: 'beginner',
      href: 'https://roadmap.sh/rust',
    },

    // Center spine
    {
      id: 'intro',
      x: 640,
      y: 192,
      w: 210,
      h: 48,
      label: 'Introduction',
      kind: 'main',
      level: 'beginner',
      href: 'https://roadmap.sh/backend',
    },
    {
      id: 'frontendBasics',
      x: 640,
      y: 270,
      w: 210,
      h: 48,
      label: 'Frontend Basics',
      kind: 'main',
      level: 'beginner',
      href: 'https://roadmap.sh/frontend',
    },
    {
      id: 'vcs',
      x: 640,
      y: 402,
      w: 210,
      h: 48,
      label: 'Version Control Systems',
      kind: 'main',
      level: 'beginner',
      href: 'https://roadmap.sh/git-github',
    },
    {
      id: 'repo',
      x: 640,
      y: 478,
      w: 210,
      h: 48,
      label: 'Repo Hosting Services',
      kind: 'main',
      level: 'beginner',
      href: 'https://roadmap.sh/git-github',
    },
    {
      id: 'db',
      x: 640,
      y: 642,
      w: 210,
      h: 48,
      label: 'Relational Databases',
      kind: 'main',
      level: 'intermediate',
      href: 'https://roadmap.sh/sql',
    },
    {
      id: 'postgres',
      x: 420,
      y: 614,
      w: 170,
      h: 40,
      label: 'PostgreSQL',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://www.postgresql.org/docs/current/tutorial-start.html',
    },
    {
      id: 'mysql',
      x: 420,
      y: 666,
      w: 170,
      h: 40,
      label: 'MySQL',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://dev.mysql.com/doc/',
    },
    {
      id: 'mongo',
      x: 420,
      y: 718,
      w: 170,
      h: 40,
      label: 'MongoDB',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://www.mongodb.com/docs/manual/introduction/',
    },
    {
      id: 'prisma',
      x: 1060,
      y: 614,
      w: 170,
      h: 40,
      label: 'Prisma',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://www.prisma.io/docs/getting-started',
    },
    {
      id: 'typeorm',
      x: 1060,
      y: 666,
      w: 170,
      h: 40,
      label: 'TypeORM',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://typeorm.io/docs/getting-started',
    },
    {
      id: 'migrations',
      x: 1060,
      y: 718,
      w: 170,
      h: 40,
      label: 'Migrations',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/overview',
    },
    {
      id: 'api',
      x: 640,
      y: 826,
      w: 210,
      h: 48,
      label: 'Learn about APIs',
      kind: 'main',
      level: 'intermediate',
      href: 'https://roadmap.sh/api-design',
    },
    {
      id: 'authSpine',
      x: 640,
      y: 1020,
      w: 210,
      h: 48,
      label: 'Authentication',
      kind: 'main',
      level: 'intermediate',
      href: 'https://roadmap.sh/backend',
    },
    {
      id: 'caching',
      x: 640,
      y: 1214,
      w: 210,
      h: 48,
      label: 'Caching',
      kind: 'main',
      level: 'intermediate',
      href: 'https://roadmap.sh/redis',
    },
    {
      id: 'cdn',
      x: 420,
      y: 1296,
      w: 170,
      h: 40,
      label: 'CDN',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/',
    },
    {
      id: 'testing',
      x: 640,
      y: 1408,
      w: 210,
      h: 48,
      label: 'Testing',
      kind: 'main',
      level: 'advanced',
      href: 'https://roadmap.sh/backend',
    },
    {
      id: 'contractTests',
      x: 420,
      y: 1538,
      w: 170,
      h: 40,
      label: 'Contract Tests',
      kind: 'sub',
      level: 'advanced',
      href: 'https://docs.pact.io/',
    },

    // Right fundamentals panel (roadmap style)
    {
      id: 'rightQuestions',
      x: 1160,
      y: 176,
      w: 340,
      h: 230,
      label: 'Basics\nInternet · HTTP · DNS · Hosting',
      kind: 'panel',
    },
    {
      id: 'q0',
      x: 1196,
      y: 268,
      w: 270,
      h: 40,
      label: 'How internet works?',
      kind: 'sub',
      level: 'beginner',
      href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work',
    },
    {
      id: 'q1',
      x: 1196,
      y: 320,
      w: 270,
      h: 40,
      label: 'What is HTTP?',
      kind: 'sub',
      level: 'beginner',
      href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
    },
    {
      id: 'q2',
      x: 1196,
      y: 372,
      w: 270,
      h: 40,
      label: 'DNS and how it works?',
      kind: 'sub',
      level: 'beginner',
      href: 'https://www.cloudflare.com/learning/dns/what-is-dns/',
    },

    // API styles panel
    {
      id: 'apiStyles',
      x: 1140,
      y: 782,
      w: 380,
      h: 224,
      label: 'API Styles\nREST · JSON API · gRPC · GraphQL',
      kind: 'panel',
    },
    {
      id: 'rest',
      x: 1176,
      y: 856,
      w: 120,
      h: 38,
      label: 'REST',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://roadmap.sh/api-design',
    },
    {
      id: 'grpc',
      x: 1310,
      y: 856,
      w: 120,
      h: 38,
      label: 'gRPC',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://grpc.io/docs/what-is-grpc/introduction/',
    },
    {
      id: 'graphql',
      x: 1176,
      y: 906,
      w: 254,
      h: 38,
      label: 'GraphQL',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://roadmap.sh/graphql',
    },
    {
      id: 'jsonApi',
      x: 1176,
      y: 956,
      w: 254,
      h: 38,
      label: 'JSON API',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://jsonapi.org/',
    },

    // Auth
    {
      id: 'auth',
      x: 1140,
      y: 1028,
      w: 380,
      h: 48,
      label: 'Auth Strategies',
      kind: 'main',
      level: 'intermediate',
      href: 'https://roadmap.sh/backend',
    },
    {
      id: 'jwt',
      x: 1176,
      y: 1108,
      w: 120,
      h: 40,
      label: 'JWT',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://jwt.io/introduction',
    },
    {
      id: 'oauth',
      x: 1310,
      y: 1108,
      w: 120,
      h: 40,
      label: 'OAuth',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://oauth.net/2/',
    },
    {
      id: 'sessionAuth',
      x: 1176,
      y: 1160,
      w: 254,
      h: 40,
      label: 'Session / Cookies',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies',
    },
    {
      id: 'rbac',
      x: 1176,
      y: 1212,
      w: 254,
      h: 40,
      label: 'RBAC / Permissions',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://auth0.com/docs/manage-users/access-control/rbac',
    },

    // Server / caching options
    {
      id: 'redis',
      x: 430,
      y: 1192,
      w: 170,
      h: 40,
      label: 'Redis',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://roadmap.sh/redis',
    },
    {
      id: 'httpCache',
      x: 430,
      y: 1244,
      w: 170,
      h: 40,
      label: 'HTTP Caching',
      kind: 'sub',
      level: 'intermediate',
      href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching',
    },
    {
      id: 'unitTests',
      x: 430,
      y: 1382,
      w: 170,
      h: 40,
      label: 'Unit Tests',
      kind: 'sub',
      level: 'advanced',
      href: 'https://jestjs.io/docs/getting-started',
    },
    {
      id: 'integrationTests',
      x: 430,
      y: 1434,
      w: 170,
      h: 40,
      label: 'Integration',
      kind: 'sub',
      level: 'advanced',
      href: 'https://testcontainers.com/guides/getting-started-with-testcontainers-for-nodejs/',
    },
    {
      id: 'apiTesting',
      x: 430,
      y: 1486,
      w: 170,
      h: 40,
      label: 'API Testing',
      kind: 'sub',
      level: 'advanced',
      href: 'https://learning.postman.com/docs/getting-started/introduction/overview/',
    },

    // Containers + brokers (condensed)
    {
      id: 'containers',
      x: 640,
      y: 1602,
      w: 210,
      h: 48,
      label: 'Containers',
      kind: 'main',
      level: 'advanced',
      href: 'https://roadmap.sh/docker',
    },
    {
      id: 'docker',
      x: 458,
      y: 1582,
      w: 140,
      h: 36,
      label: 'Docker',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/docker',
    },
    {
      id: 'k8s',
      x: 458,
      y: 1630,
      w: 140,
      h: 36,
      label: 'Kubernetes',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/kubernetes',
    },
    {
      id: 'cicd',
      x: 1180,
      y: 1602,
      w: 340,
      h: 48,
      label: 'CI/CD',
      kind: 'main',
      level: 'advanced',
      href: 'https://docs.github.com/en/actions',
    },
    {
      id: 'githubActions',
      x: 1216,
      y: 1676,
      w: 130,
      h: 40,
      label: 'GitHub Actions',
      kind: 'sub',
      level: 'advanced',
      href: 'https://docs.github.com/en/actions',
    },
    {
      id: 'dockerCompose',
      x: 1358,
      y: 1676,
      w: 130,
      h: 40,
      label: 'Compose',
      kind: 'sub',
      level: 'advanced',
      href: 'https://docs.docker.com/compose/',
    },
    {
      id: 'brokers',
      x: 1180,
      y: 1818,
      w: 340,
      h: 48,
      label: 'Message Brokers',
      kind: 'main',
      level: 'advanced',
      href: 'https://roadmap.sh/backend',
    },
    {
      id: 'kafka',
      x: 1216,
      y: 1892,
      w: 120,
      h: 40,
      label: 'Kafka',
      kind: 'sub',
      level: 'advanced',
      href: 'https://kafka.apache.org/quickstart',
    },
    {
      id: 'rabbit',
      x: 1350,
      y: 1892,
      w: 120,
      h: 40,
      label: 'RabbitMQ',
      kind: 'sub',
      level: 'advanced',
      href: 'https://www.rabbitmq.com/tutorials',
    },
    {
      id: 'nats',
      x: 1216,
      y: 1944,
      w: 254,
      h: 40,
      label: 'NATS',
      kind: 'sub',
      level: 'advanced',
      href: 'https://docs.nats.io/nats-concepts/what-is-nats',
    },
    {
      id: 'observability',
      x: 640,
      y: 2050,
      w: 210,
      h: 48,
      label: 'Observability',
      kind: 'main',
      level: 'advanced',
      href: 'https://opentelemetry.io/docs/what-is-opentelemetry/',
    },
    {
      id: 'logs',
      x: 1180,
      y: 2026,
      w: 140,
      h: 40,
      label: 'Logs',
      kind: 'sub',
      level: 'advanced',
      href: 'https://grafana.com/docs/loki/latest/',
    },
    {
      id: 'metrics',
      x: 1334,
      y: 2026,
      w: 140,
      h: 40,
      label: 'Metrics',
      kind: 'sub',
      level: 'advanced',
      href: 'https://prometheus.io/docs/introduction/overview/',
    },
    {
      id: 'tracing',
      x: 1256,
      y: 2078,
      w: 140,
      h: 40,
      label: 'Tracing',
      kind: 'sub',
      level: 'advanced',
      href: 'https://opentelemetry.io/docs/concepts/signals/traces/',
    },

    // Continue learning
    {
      id: 'continue',
      x: 360,
      y: 2340,
      w: 920,
      h: 146,
      label:
        'Have a look at relevant tracks\nDevOps · System Design · Full Stack · Cloud · Data Engineering',
      kind: 'panel',
    },
    {
      id: 'devops',
      x: 440,
      y: 2418,
      w: 126,
      h: 34,
      label: 'DevOps',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/devops',
    },
    {
      id: 'sys',
      x: 582,
      y: 2418,
      w: 156,
      h: 34,
      label: 'System Design',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/system-design',
    },
    {
      id: 'fs',
      x: 754,
      y: 2418,
      w: 138,
      h: 34,
      label: 'Full Stack',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/backend',
    },
    {
      id: 'cloud',
      x: 908,
      y: 2418,
      w: 118,
      h: 34,
      label: 'Cloud',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/backend',
    },
    {
      id: 'dataEng',
      x: 1042,
      y: 2418,
      w: 170,
      h: 34,
      label: 'Data Engineering',
      kind: 'badge',
      level: 'advanced',
      href: 'https://roadmap.sh/backend',
    },
  ];

  const edges: RoadmapEdge[] = [
    { from: 'intro', to: 'frontendBasics', kind: 'solid' },
    { from: 'frontendBasics', to: 'vcs', kind: 'solid' },
    { from: 'vcs', to: 'repo', kind: 'solid' },
    { from: 'repo', to: 'db', kind: 'solid' },
    { from: 'db', to: 'api', kind: 'solid' },
    { from: 'api', to: 'authSpine', kind: 'solid' },
    { from: 'authSpine', to: 'caching', kind: 'solid' },
    { from: 'caching', to: 'testing', kind: 'solid' },

    { from: 'intro', to: 'q0', kind: 'dotted' },
    { from: 'intro', to: 'q1', kind: 'dotted' },
    { from: 'intro', to: 'q2', kind: 'dotted' },

    { from: 'db', to: 'postgres', kind: 'dotted' },
    { from: 'db', to: 'mysql', kind: 'dotted' },
    { from: 'db', to: 'mongo', kind: 'dotted' },
    { from: 'db', to: 'prisma', kind: 'dotted' },
    { from: 'db', to: 'typeorm', kind: 'dotted' },
    { from: 'db', to: 'migrations', kind: 'dotted' },

    { from: 'api', to: 'apiStyles', kind: 'solid' },
    { from: 'api', to: 'rest', kind: 'dotted' },
    { from: 'api', to: 'grpc', kind: 'dotted' },
    { from: 'api', to: 'graphql', kind: 'dotted' },
    { from: 'api', to: 'jsonApi', kind: 'dotted' },

    { from: 'authSpine', to: 'auth', kind: 'solid' },
    { from: 'auth', to: 'jwt', kind: 'dotted' },
    { from: 'auth', to: 'oauth', kind: 'dotted' },
    { from: 'auth', to: 'sessionAuth', kind: 'dotted' },
    { from: 'auth', to: 'rbac', kind: 'dotted' },

    { from: 'caching', to: 'redis', kind: 'dotted' },
    { from: 'caching', to: 'httpCache', kind: 'dotted' },
    { from: 'caching', to: 'cdn', kind: 'dotted' },
    { from: 'testing', to: 'unitTests', kind: 'dotted' },
    { from: 'testing', to: 'integrationTests', kind: 'dotted' },
    { from: 'testing', to: 'apiTesting', kind: 'dotted' },
    { from: 'testing', to: 'contractTests', kind: 'dotted' },

    { from: 'testing', to: 'containers', kind: 'solid' },
    { from: 'containers', to: 'docker', kind: 'dotted' },
    { from: 'containers', to: 'k8s', kind: 'dotted' },
    { from: 'containers', to: 'cicd', kind: 'solid' },
    { from: 'cicd', to: 'githubActions', kind: 'dotted' },
    { from: 'cicd', to: 'dockerCompose', kind: 'dotted' },
    { from: 'cicd', to: 'brokers', kind: 'solid' },
    { from: 'brokers', to: 'kafka', kind: 'dotted' },
    { from: 'brokers', to: 'rabbit', kind: 'dotted' },
    { from: 'brokers', to: 'nats', kind: 'dotted' },
    { from: 'brokers', to: 'observability', kind: 'solid' },
    { from: 'observability', to: 'logs', kind: 'dotted' },
    { from: 'observability', to: 'metrics', kind: 'dotted' },
    { from: 'observability', to: 'tracing', kind: 'dotted' },

    { from: 'observability', to: 'continue', kind: 'dotted' },
    { from: 'continue', to: 'devops', kind: 'dotted' },
    { from: 'continue', to: 'sys', kind: 'dotted' },
    { from: 'continue', to: 'fs', kind: 'dotted' },
    { from: 'continue', to: 'cloud', kind: 'dotted' },
    { from: 'continue', to: 'dataEng', kind: 'dotted' },
  ];

  // Apply the same spacing multiplier as frontend for consistent vertical gaps
  const SPACING_FACTOR = 1.18;
  const spacedNodes = nodes.map((n) => ({
    ...n,
    y: Math.round(n.y * SPACING_FACTOR),
  }));
  return {
    width,
    height: Math.round(height * SPACING_FACTOR),
    title: 'Backend Roadmap',
    nodes: spacedNodes,
    edges,
  };
}

function CareerPath() {
  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const [track, setTrack] = useState<TrackKey>('frontend');

  const tabs = useMemo(
    () =>
      [
        {
          key: 'frontend' as const,
          label: 'Frontend',
          icon: '🧩',
          color: '#ff7e5f',
          glow: 'rgba(255,126,95,0.3)',
        },
        {
          key: 'backend' as const,
          label: 'Backend',
          icon: '⚙️',
          color: '#fbbf24',
          glow: 'rgba(251,191,36,0.3)',
        },
      ] as const,
    []
  );

  const spec = useMemo(
    () => (track === 'frontend' ? buildFrontendSpec() : buildBackendSpec()),
    [track]
  );

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 20% 10%,var(--cg-container-a30),transparent 55%),radial-gradient(circle at 78% 22%,var(--cg-coral-a18),transparent 58%),radial-gradient(circle at 30% 88%,var(--cg-amber-a14),transparent 58%)',
          }}
        />
        <div
          className="absolute -top-56 left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle at center,var(--cg-container-a30),transparent 62%)',
          }}
        />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <header className="sticky top-0 z-40 px-8 py-4 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-[#ff7e5f]/20 blur-md group-hover:bg-[#ff7e5f]/35 transition-all" />
                <img
                  src="/component_2_2x.png"
                  alt="CodeForGlory"
                  className="relative h-8 w-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span className="font-['Lexend'] text-lg font-bold tracking-tight">
                <span className="text-[#ff7e5f]">Code</span>ForGlory
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2 text-xs font-semibold transition hover:bg-[color:var(--cg-container-a22)] hover:border-[#ff7e5f]/30"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ff7e5f]">
                  arrow_back
                </span>
                {t('common.back')}
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-8 py-10 space-y-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-2">
              <div className="badge-coral w-fit">
                <span className="material-symbols-outlined text-[13px]">
                  route
                </span>
                {language === 'vi' ? 'LỘ TRÌNH NGHỀ NGHIỆP' : 'CAREER PATH'}
              </div>
              <h1 className="font-['Lexend'] text-4xl font-bold tracking-tight">
                {language === 'vi' ? (
                  'Lộ trình nghề nghiệp'
                ) : (
                  <>
                    Career <span className="gradient-text">Path</span>
                  </>
                )}
              </h1>
              <p className="text-sm leading-6 text-[color:var(--cg-text-muted)] max-w-xl">
                Lộ trình học này giúp bạn biết nên học gì tiếp theo, bám sát kỹ
                năng quan trọng và tìm tài liệu phù hợp với trình độ hiện tại.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div
                className="flex items-center gap-1 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-1 backdrop-blur"
                role="tablist"
              >
                {tabs.map((tab) => {
                  const active = track === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTrack(tab.key)}
                      className={cx(
                        'relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-250',
                        active
                          ? 'text-[#0f0b3c] shadow-md'
                          : 'text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] hover:bg-[color:var(--cg-bg-a55)]'
                      )}
                      style={
                        active
                          ? {
                              background: `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)`,
                              boxShadow: `0 4px 20px ${tab.glow}`,
                            }
                          : {}
                      }
                    >
                      <span className="text-base leading-none">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-[11px] text-[color:var(--cg-text-muted)]">
                Chọn từng nhánh để khám phá chủ đề phù hợp với mục tiêu học của
                bạn.
              </div>
            </div>
          </div>

          <div
            className="h-px w-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--cg-border), transparent)',
            }}
          />

          <RoadmapCanvas spec={spec} />
        </main>
      </div>
    </div>
  );
}

export default CareerPath;
