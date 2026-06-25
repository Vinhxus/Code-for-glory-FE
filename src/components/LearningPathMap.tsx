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
import { useSettingsStore } from '../store/settings';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

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

const STORAGE_KEY = 'cg_survey_v2';

function LearningPathMap() {
  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';
  const [selected, setSelected] = useState<RoadmapKey>('frontend');
  const [surveyData, setSurveyData] = useState<{
    careerPath?: string;
    hoursPerDay?: number;
    testScore?: number;
  } | null>(null);
  const [apiNodes, setApiNodes] = useState<LearningPathNodeDto[]>([]);
  const [apiProgress, setApiProgress] = useState<ProgressDto[]>([]);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      // Defer setState to avoid synchronously setting state inside effect body
      // which can trigger cascading renders. Using a microtask via setTimeout 0.
      setTimeout(() => {
        setSurveyData(parsed);
        if (parsed.careerPath === 'backend') {
          setSelected('backend');
        } else if (parsed.careerPath === 'frontend') {
          setSelected('frontend');
        }
      }, 0);
    } catch {
      // ignore parse errors
    }
  }, []);

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

  const totalLessonHours = 120; // Default mockup for total hours

  const estimatedMonths = useMemo(() => {
    if (!surveyData?.hoursPerDay) return 6;
    const days = totalLessonHours / surveyData.hoursPerDay;
    const months = Math.max(1, Math.ceil(days / 30));
    return months;
  }, [surveyData]);

  const testScore = surveyData?.testScore ?? 0;
  const levelText =
    testScore === 5
      ? isVi
        ? 'Senior'
        : 'Senior'
      : testScore >= 3
        ? isVi
          ? 'Trung cấp'
          : 'Mid-level'
        : isVi
          ? 'Junior'
          : 'Junior';
  const selectedLabel = isVi
    ? selected === 'frontend'
      ? 'Frontend'
      : 'Backend'
    : selected === 'frontend'
      ? 'Frontend'
      : 'Backend';
  const headerTitle = isVi ? 'Lộ trình học' : 'Learning Path';
  const introText = surveyData
    ? isVi
      ? `Chúc mừng bạn đã bắt đầu roadmap ${selectedLabel} ${levelText} trong ${estimatedMonths} tháng!`
      : `Congratulations on starting your ${selectedLabel} ${levelText} roadmap for ${estimatedMonths} months!`
    : t('roadmap.welcome.empty');

  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="badge-coral w-fit">
            <span className="material-symbols-outlined text-[13px]">route</span>
            {t('home.path.title').toUpperCase()}
          </div>
          <h1 className="font-['Lexend'] text-4xl font-bold tracking-tight">
            {headerTitle}
          </h1>
          <p className="text-sm leading-6 text-[color:var(--cg-text-muted)] max-w-md">
            {introText}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex flex-col items-end gap-4">
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
                  {s.value}
                </span>
                <span className="text-[10px] text-[color:var(--cg-text-muted)] font-medium">
                  {t(s.labelKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mt-8 mb-8 h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--cg-border), transparent)',
        }}
      />

      {/* Roadmap */}
      <RoadmapViewer
        selected={selected}
        surveyData={surveyData}
        apiNodes={apiNodes}
        apiProgress={apiProgress}
        loading={loadingRoadmap}
        error={roadmapError}
      />
    </div>
  );
}

export default LearningPathMap;
