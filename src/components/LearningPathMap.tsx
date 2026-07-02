import { useState, useEffect, useMemo } from 'react';
import type { I18nKey } from '../i18n/translations';
import RoadmapViewer, { type RoadmapKey } from './RoadmapViewer';
import { useT } from '../i18n/useT';
import {
  getLearningPathByField,
  getLearningPathNodes,
  getMyProgress,
  type CareerField,
  type LearningPathNodeDto,
  type ProgressDto,
} from '../services/learningPathApi';
import { getMySurvey } from '../services/surveyApi';
import { useSettingsStore } from '../store/settings';
import {
  getStartingStage,
  getPreUnlockedStages,
  stageLabelText,
  clearOnboardingData,
  type StartingStage,
} from './learningPathUtils';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

// ─── Tab definitions ──────────────────────────────────────────────
const TABS: {
  key: RoadmapKey;
  label: string;
  icon: string;
  sub: string;
  color: string;
  glow: string;
}[] = [
  {
    key: 'frontend',
    label: 'Frontend',
    icon: '🧩',
    sub: 'UI · Web · React',
    color: '#ff7e5f',
    glow: 'rgba(255,126,95,0.3)',
  },
  {
    key: 'backend',
    label: 'Backend',
    icon: '⚙️',
    sub: 'API · DB · Auth',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.3)',
  },
];

const STATS: {
  labelKey: I18nKey;
  value: string;
  icon: string;
  color: string;
}[] = [
  {
    labelKey: 'roadmap.topics',
    value: '30',
    icon: 'library_books',
    color: '#ff7e5f',
  },
  {
    labelKey: 'roadmap.completed',
    value: '0',
    icon: 'check_circle',
    color: '#4ade80',
  },
  {
    labelKey: 'roadmap.inProgress',
    value: '1',
    icon: 'pending',
    color: '#fbbf24',
  },
];

// ─── Stage badge colours ──────────────────────────────────────────
const STAGE_STYLE: Record<
  StartingStage,
  { bg: string; border: string; text: string; icon: string }
> = {
  beginner: {
    bg: 'rgba(74,222,128,0.12)',
    border: 'rgba(74,222,128,0.30)',
    text: '#4ade80',
    icon: '🌱',
  },
  intermediate: {
    bg: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.30)',
    text: '#fbbf24',
    icon: '⭐',
  },
  advanced: {
    bg: 'rgba(255,126,95,0.12)',
    border: 'rgba(255,126,95,0.30)',
    text: '#ff7e5f',
    icon: '🔥',
  },
};

function surveyEntryLevelToStage(entryLevel?: string | null): StartingStage | null {
  if (entryLevel === 'advanced') return 'advanced';
  if (entryLevel === 'intermediate') return 'intermediate';
  if (entryLevel === 'root') return 'beginner';
  return null;
}

function LearningPathMap() {
  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  // ── Track selection (reads from assessment on mount) ─────────────
  const [selected, setSelected] = useState<RoadmapKey>('frontend');

  // ── Starting stage derived from onboarding results ───────────────
  const [startingStage, setStartingStage] = useState<StartingStage>('beginner');
  const [serverStartingStage, setServerStartingStage] =
    useState<StartingStage | null>(null);
  const [hoursPerDay, setHoursPerDay] = useState<number | null>(null);
  const [fieldFocus, setFieldFocus] = useState<string | null>(null);

  // ── Backend data ─────────────────────────────────────────────────
  const [apiNodes, setApiNodes] = useState<LearningPathNodeDto[]>([]);
  const [apiProgress, setApiProgress] = useState<ProgressDto[]>([]);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState('');

  // ── Reset confirmation ───────────────────────────────────────────
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ── Read ALL onboarding data on mount ────────────────────────────
  // Uses the canonical storage keys from learningPathUtils, NOT cg_survey_v2.
  useEffect(() => {
    const boot = async () => {
      try {
        const assessmentRaw = localStorage.getItem('cg_skill_assessment_v1');
        const surveyRaw = localStorage.getItem('cg_survey_v1');

        let preferredTrack: RoadmapKey = 'frontend';
        if (assessmentRaw) {
          const a = JSON.parse(assessmentRaw) as {
            surveyTracks?: string[];
          };
          const tracks = a.surveyTracks ?? [];
          if (tracks.includes('backend') && !tracks.includes('frontend')) {
            preferredTrack = 'backend';
          }
        } else if (surveyRaw) {
          const s = JSON.parse(surveyRaw) as { tracks?: string[] };
          const tracks = s.tracks ?? [];
          if (tracks.includes('backend') && !tracks.includes('frontend')) {
            preferredTrack = 'backend';
          }
        }

        const survey = await getMySurvey().catch(() => null);
        const mappedStage = surveyEntryLevelToStage(survey?.computedEntryLevel);

        if (survey?.fieldFocus === 'backend') {
          preferredTrack = 'backend';
        }
        if (typeof survey?.dailyHours === 'number' && survey.dailyHours > 0) {
          setHoursPerDay(survey.dailyHours);
        } else if (surveyRaw) {
          const s = JSON.parse(surveyRaw) as { weeklyTime?: string };
          const midpoints: Record<string, number> = {
            '2-4': 3 / 7,
            '5-7': 6 / 7,
            '8-12': 10 / 7,
            '13+': 14 / 7,
          };
          if (s.weeklyTime && midpoints[s.weeklyTime]) {
            setHoursPerDay(midpoints[s.weeklyTime]);
          }
        }

        setSelected(preferredTrack);
        if (survey) {
          setFieldFocus(survey.fieldFocus);
        }
        if (mappedStage) {
          setServerStartingStage(mappedStage);
          const isFieldMatch =
            survey?.fieldFocus === 'fullstack' ||
            survey?.fieldFocus === preferredTrack;
          setStartingStage(isFieldMatch ? mappedStage : 'beginner');
          return;
        }

        setServerStartingStage(null);
        setStartingStage(getStartingStage(preferredTrack));
      } catch {
        setServerStartingStage(null);
      }
    };

    void boot();
  }, []);

  // Re-derive stage whenever the selected track changes
  useEffect(() => {
    if (serverStartingStage) {
      const isFieldMatch =
        fieldFocus === 'fullstack' ||
        fieldFocus === selected;
      if (isFieldMatch) {
        setStartingStage(serverStartingStage);
      } else {
        setStartingStage('beginner');
      }
      return;
    }
    setStartingStage(getStartingStage(selected));
  }, [selected, serverStartingStage, fieldFocus]);

  // ── Fetch roadmap nodes from backend ─────────────────────────────
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoadingRoadmap(true);
        setRoadmapError('');

        const field: CareerField =
          selected === 'frontend' ? 'frontend' : 'backend';
        const learningPath = await getLearningPathByField(field);

        if (!learningPath) {
          setApiNodes([]);
          setApiProgress([]);
          console.info(
            `Learning path "${field}" chưa có dữ liệu từ backend. Đang dùng dữ liệu mock ở FE.`
          );
          return;
        }

        const [nodes, progressData] = await Promise.all([
          getLearningPathNodes(learningPath._id),
          getMyProgress(learningPath._id),
        ]);

        setApiNodes(nodes);
        setApiProgress(progressData);
      } catch (error) {
        setApiNodes([]);
        setApiProgress([]);
        console.warn(
          'Không kết nối được backend cho learning path. Đang fallback sang dữ liệu mock ở FE.',
          error
        );
      } finally {
        setLoadingRoadmap(false);
      }
    };

    void fetchRoadmap();
  }, [selected]);

  // ── ETA calculation ───────────────────────────────────────────────
  const TOTAL_LESSON_HOURS = 120;
  const estimatedMonths = useMemo(() => {
    if (!hoursPerDay) return 6;
    const days = TOTAL_LESSON_HOURS / hoursPerDay;
    return Math.max(1, Math.ceil(days / 30));
  }, [hoursPerDay]);

  // ── Derived display values ────────────────────────────────────────
  const preUnlocked = useMemo(
    () => getPreUnlockedStages(startingStage),
    [startingStage]
  );
  const stats = useMemo(() => {
    const completed = apiProgress.filter((item) => item.status === 'completed').length;
    const inProgress = apiProgress.filter((item) =>
      ['current', 'open', 'in_progress'].includes(item.status)
    ).length;

    return {
      topics: apiNodes.length || 30,
      completed,
      inProgress:
        inProgress > 0 ? inProgress : completed < (apiNodes.length || 30) ? 1 : 0,
    };
  }, [apiNodes.length, apiProgress]);

  const stageStyle = STAGE_STYLE[startingStage];
  const stageLabel = stageLabelText(startingStage, isVi ? 'vi' : 'en');
  const selectedLabel =
    selected === 'frontend'
      ? isVi
        ? 'Frontend'
        : 'Frontend'
      : isVi
        ? 'Backend'
        : 'Backend';

  const headerTitle = isVi ? 'Lộ trình học' : 'Learning Path';

  // Build intro text dynamically based on actual starting stage
  const introText = useMemo(() => {
    if (startingStage === 'beginner') {
      return isVi
        ? `Bạn sẽ bắt đầu từ giai đoạn Cơ bản trong lộ trình ${selectedLabel} (khoảng ${estimatedMonths} tháng).`
        : `You'll start from the Beginner stage on the ${selectedLabel} roadmap (~${estimatedMonths} months).`;
    }
    if (startingStage === 'intermediate') {
      return isVi
        ? `Giai đoạn Cơ bản đã được mở khoá. Bạn sẽ bắt đầu học từ giai đoạn Trung cấp (khoảng ${estimatedMonths} tháng).`
        : `Beginner stage is pre-unlocked. You'll start from Intermediate stage (~${estimatedMonths} months).`;
    }
    return isVi
      ? `Giai đoạn Cơ bản và Trung cấp đã được mở khoá. Bạn sẽ bắt đầu từ giai đoạn Nâng cao (khoảng ${estimatedMonths} tháng).`
      : `Beginner & Intermediate stages are pre-unlocked. Starting at Advanced stage (~${estimatedMonths} months).`;
  }, [startingStage, selectedLabel, estimatedMonths, isVi]);

  // ── Reset handler ─────────────────────────────────────────────────
  function handleReset() {
    clearOnboardingData();
    setStartingStage('beginner');
    setHoursPerDay(null);
    setShowResetConfirm(false);
    // Reload the page so all components pick up the cleared state cleanly
    window.location.reload();
  }

  return (
    <div className="w-full animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="badge-coral w-fit">
            <span className="material-symbols-outlined text-[13px]">route</span>
            {t('home.path.title').toUpperCase()}
          </div>
          <h1 className="font-['Lexend'] text-4xl font-bold tracking-tight">
            {headerTitle}
          </h1>
          <p className="max-w-md text-sm leading-6 text-[color:var(--cg-text-muted)]">
            {introText}
          </p>

          {/* ── Starting stage badge ──────────────────────────── */}
          <div className="mt-1 flex items-center gap-2">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide border"
              style={{
                background: stageStyle.bg,
                borderColor: stageStyle.border,
                color: stageStyle.text,
              }}
            >
              <span>{stageStyle.icon}</span>
              <span>
                {isVi ? 'Xuất phát:' : 'Starting:'} {stageLabel}
              </span>
            </div>

            {/* Pre-unlocked stage pills */}
            {preUnlocked.length > 0 && (
              <div className="flex items-center gap-1">
                {preUnlocked.map((s) => (
                  <div
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full border border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.08)] px-2.5 py-1 text-[10px] font-medium text-[#4ade80]"
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      lock_open
                    </span>
                    {stageLabelText(s, isVi ? 'vi' : 'en')}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: tab + stats ─────────────────────── */}
        <div className="flex flex-col items-end gap-4">
          {/* Track toggle */}
          <div
            className="flex items-center gap-1 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-1 backdrop-blur"
            role="tablist"
          >
            {TABS.map((tab) => {
              const active = selected === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelected(tab.key)}
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
                  <span>
                    {isVi
                      ? tab.key === 'frontend'
                        ? 'Frontend'
                        : 'Backend'
                      : tab.label}
                  </span>
                  {active && (
                    <span className="ml-1 hidden text-[11px] font-normal opacity-80 md:inline">
                      {isVi
                        ? tab.key === 'frontend'
                          ? 'UI · Web · React'
                          : 'API · CSDL · Auth'
                        : tab.sub}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3">
            {STATS.map((s) => (
              <div
                key={s.labelKey}
                className="flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-2"
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ color: s.color }}
                >
                  {s.icon}
                </span>
                <span className="text-xs font-bold" style={{ color: s.color }}>
                  {s.labelKey === 'roadmap.topics'
                    ? String(stats.topics)
                    : s.labelKey === 'roadmap.completed'
                      ? String(stats.completed)
                      : String(stats.inProgress)}
                </span>
                <span className="text-[10px] font-medium text-[color:var(--cg-text-muted)]">
                  {t(s.labelKey)}
                </span>
              </div>
            ))}
          </div>

          {/* Reset assessment button */}
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[color:var(--cg-border)] bg-transparent px-3 py-1.5 text-[11px] font-medium text-[color:var(--cg-text-muted)] transition hover:border-[rgba(255,126,95,0.35)] hover:text-[#ff7e5f]"
            >
              <span className="material-symbols-outlined text-[13px]">
                restart_alt
              </span>
              {isVi ? 'Làm lại assessment' : 'Reset assessment'}
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-[rgba(255,126,95,0.35)] bg-[rgba(255,126,95,0.08)] px-3 py-2">
              <span className="text-[11px] text-[rgba(255,255,255,0.70)]">
                {isVi ? 'Xác nhận xoá kết quả?' : 'Confirm reset?'}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-[#ff7e5f] px-2.5 py-1 text-[11px] font-bold text-[#0f0b3c] transition hover:brightness-110"
              >
                {isVi ? 'Xoá' : 'Yes, reset'}
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg border border-[color:var(--cg-border)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--cg-text-muted)] transition hover:text-[color:var(--cg-text)]"
              >
                {isVi ? 'Huỷ' : 'Cancel'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div
        className="mb-8 mt-8 h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--cg-border), transparent)',
        }}
      />

      {/* ── Roadmap viewer ───────────────────────────────────────── */}
      {/*
        New props passed to RoadmapViewer:
          startingStage    – 'beginner' | 'intermediate' | 'advanced'
          preUnlockedStages – stages to render as auto-completed

        RoadmapViewer should:
          • Lock all nodes that belong to a stage ABOVE startingStage
          • Mark nodes in preUnlockedStages as "completed" (green check, passthrough)
          • Highlight / auto-scroll to the first node of startingStage
      */}
      <RoadmapViewer
        selected={selected}
        startingStage={startingStage}
        preUnlockedStages={preUnlocked}
        apiNodes={apiNodes}
        apiProgress={apiProgress}
        loading={loadingRoadmap}
        error={roadmapError}
      />
    </div>
  );
}

export default LearningPathMap;
