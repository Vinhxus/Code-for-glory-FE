import { useState, useEffect, useMemo } from 'react';
import RoadmapViewer, { type RoadmapKey } from './RoadmapViewer';
import { useT } from '../i18n/useT';

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

const TABS: { key: RoadmapKey; label: string; icon: string; sub: string; color: string; glow: string }[] = [
  { key: 'frontend', label: 'Frontend', icon: '🧩', sub: 'UI · Web · React', color: '#ff7e5f', glow: 'rgba(255,126,95,0.3)' },
  { key: 'backend',  label: 'Backend',  icon: '⚙️', sub: 'API · DB · Auth',  color: '#fbbf24', glow: 'rgba(251,191,36,0.3)' },
];

const STATS = [
  { labelKey: 'roadmap.topics',    value: '30', icon: 'library_books', color: '#ff7e5f' },
  { labelKey: 'roadmap.completed', value: '0',  icon: 'check_circle',  color: '#4ade80' },
  { labelKey: 'roadmap.inProgress', value: '1', icon: 'pending',      color: '#fbbf24' },
];

const STORAGE_KEY = 'cg_survey_v2';

function LearningPathMap() {
  const t = useT();
  const [selected, setSelected] = useState<RoadmapKey>('frontend');
  
  const [surveyData, setSurveyData] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSurveyData(parsed);
        if (parsed.careerPath === 'backend') {
          setSelected('backend');
        } else if (parsed.careerPath === 'frontend') {
          setSelected('frontend');
        }
      }
    } catch {}
  }, []);

  const totalLessonHours = 120; // Default mockup for total hours
  
  const estimatedMonths = useMemo(() => {
    if (!surveyData?.hoursPerDay) return 6;
    const days = totalLessonHours / surveyData.hoursPerDay;
    const months = Math.max(1, Math.ceil(days / 30));
    return months;
  }, [surveyData]);

  const levelText = surveyData?.testScore === 5 ? 'Senior' : surveyData?.testScore >= 3 ? 'Mid-level' : 'Junior';
  
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
            Learning <span className="gradient-text">Path</span>
          </h1>
          <p className="text-sm leading-6 text-[color:var(--cg-text-muted)] max-w-md">
            {surveyData 
              ? (t('common.profile') === 'HỒ SƠ' ? `Chúc mừng bạn đã bắt đầu Roadmap ${selected === 'frontend' ? 'Frontend' : 'Backend'} ${levelText} trong ${estimatedMonths} tháng!` : `Congratulations on starting your ${selected === 'frontend' ? 'Frontend' : 'Backend'} ${levelText} Roadmap for ${estimatedMonths} months!`)
              : t('roadmap.welcome.empty')}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-1 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-1 backdrop-blur" role="tablist">
            {TABS.map((tab) => {
              const active = selected === tab.key;
              return (
                <button key={tab.key} type="button" role="tab" aria-selected={active}
                  onClick={() => setSelected(tab.key)}
                  className={cx(
                    'relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-250',
                    active
                      ? 'text-[#0f0b3c] shadow-md'
                      : 'text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] hover:bg-[color:var(--cg-bg-a55)]'
                  )}
                  style={active ? {
                    background: `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)`,
                    boxShadow: `0 4px 20px ${tab.glow}`,
                  } : {}}>
                  <span className="text-base leading-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {active && (
                    <span className="ml-1 hidden text-[11px] font-normal opacity-80 md:inline">{tab.sub}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3">
            {STATS.map((s) => (
              <div key={s.labelKey} className="flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-2">
                <span className="material-symbols-outlined text-[16px]" style={{ color: s.color }}>{s.icon}</span>
                <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[10px] text-[color:var(--cg-text-muted)] font-medium">{t(s.labelKey as any)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 mb-8 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--cg-border), transparent)' }} />

      {/* Roadmap */}
      <RoadmapViewer key={selected} selected={selected} surveyData={surveyData} />
    </div>
  );
}

export default LearningPathMap;
