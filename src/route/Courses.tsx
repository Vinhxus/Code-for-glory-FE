import { useEffect, useMemo, useState } from 'react';
import SideNav from '../components/SideNav';
import {
  COURSES_CATALOG,
  type CourseCatalogItem,
  type CourseLevel,
  type CourseTrack,
} from '../data/coursesCatalog';
import { useSettingsStore } from '../store/settings';

type SortMode = 'recommended' | 'xp' | 'title';
type TrackFilter = 'All' | CourseTrack;
type LevelFilter = 'All' | CourseLevel;
type ProgressMap = Record<string, number>;

const PROGRESS_STORAGE_KEY = 'cg.courses.progress.v1';
const BOOKMARKS_STORAGE_KEY = 'cg.courses.bookmarks.v1';
const TRACKS: TrackFilter[] = [
  'All',
  'Frontend',
  'Backend',
  'Fullstack',
  'DevOps',
  'Database',
];
const LEVELS: LevelFilter[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function readProgressStorage(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, number] =>
          typeof entry[0] === 'string' &&
          typeof entry[1] === 'number' &&
          Number.isFinite(entry[1])
      )
    );
  } catch {
    return {};
  }
}

function readBookmarksStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function levelLabel(
  level: CourseLevel,
  isVi: boolean
): { text: string; accent: string } {
  if (level === 'Beginner') {
    return {
      text: isVi ? 'Cơ bản' : 'Beginner',
      accent: '#4ade80',
    };
  }

  if (level === 'Intermediate') {
    return {
      text: isVi ? 'Trung cấp' : 'Intermediate',
      accent: '#a78bfa',
    };
  }

  return {
    text: isVi ? 'Nâng cao' : 'Advanced',
    accent: '#f97316',
  };
}

function trackLabel(track: CourseTrack, isVi: boolean) {
  if (!isVi) return track;

  if (track === 'Frontend') return 'Frontend';
  if (track === 'Backend') return 'Backend';
  if (track === 'Fullstack') return 'Fullstack';
  if (track === 'DevOps') return 'DevOps';
  return 'Database';
}

function formatXp(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}

export default function Courses() {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';
  const text = isVi
    ? {
      badge: 'Quest Library',
      titleA: 'Khoá học',
      titleB: 'thực chiến',
      subtitle:
        'Mình đã curate các khóa học thật từ nguồn uy tín để bạn học theo track rõ ràng. Có thể lọc theo frontend, backend, fullstack, DevOps hoặc database, rồi tự theo dõi tiến độ ngay trong FE.',
      search: 'Tìm theo tên khoá, provider, kỹ năng...',
      allTracks: 'Tất cả',
      allLevels: 'Mọi cấp độ',
      sortRecommended: 'Đề xuất',
      sortXp: 'XP cao nhất',
      sortTitle: 'Tên A-Z',
      official: 'Official',
      community: 'Community',
      searchLabel: 'Tìm quest',
      trackLabel: 'Track',
      levelLabel: 'Cấp độ',
      sortLabel: 'Sắp xếp',
      bookmarksOnly: 'Chỉ xem đã lưu',
      resetFilters: 'Xoá bộ lọc',
      started: 'Đã bắt đầu',
      total: 'Tổng tài nguyên',
      officialCount: 'Nguồn chính thức',
      tracksCovered: 'Track bao phủ',
      featuredTitle: 'Quest nổi bật',
      featuredSubtitle:
        'Mấy quest này hợp để bắt đầu nhanh hoặc kéo trình mạnh trong codebase hiện tại.',
      allCoursesTitle: 'Catalog khóa học',
      allCoursesSubtitle:
        'Chọn một quest để xem chi tiết, kỹ năng nhận được và mở nguồn học bên ngoài.',
      noResults: 'Không tìm thấy khóa học phù hợp.',
      noResultsHint:
        'Thử đổi track, bỏ bookmark filter hoặc tìm bằng từ khoá ngắn hơn.',
      detailsTitle: 'Chi tiết quest',
      whyPick: 'Vì sao nên học',
      youWillGet: 'Bạn sẽ nhận được',
      provider: 'Provider',
      resourceType: 'Loại tài nguyên',
      language: 'Ngôn ngữ',
      price: 'Chi phí',
      progress: 'Tiến độ cá nhân',
      startQuest: 'Bắt đầu quest',
      continueQuest: 'Tiếp tục quest',
      openSource: 'Mở nguồn học',
      saveQuest: 'Lưu quest',
      unsaveQuest: 'Bỏ lưu',
      addProgress: 'Tiến thêm 10%',
      minusProgress: 'Lùi 10%',
      resetProgress: 'Reset tiến độ',
      trackProgress: 'Theo dõi trong FE',
      emptySelection: 'Chọn một khóa học để xem panel chi tiết.',
      myBoardTitle: 'Quest board của bạn',
      myBoardSubtitle:
        'Các khóa đã bắt đầu sẽ hiện ở đây để bạn quay lại nhanh.',
      notStartedYet: 'Bạn chưa bắt đầu quest nào.',
      notStartedHint:
        'Bấm "Bắt đầu quest" trên bất kỳ card nào để lưu tiến độ local trong FE.',
      lessons: 'Lộ trình',
      pace: 'Nhịp học',
      providerType: 'Nguồn',
    }
    : {
      badge: 'Quest Library',
      titleA: 'Curated',
      titleB: 'learning quests',
      subtitle:
        'A polished catalog of real-world courses from trusted sources. Filter by frontend, backend, fullstack, DevOps, or database and track your own progress directly in the FE.',
      search: 'Search by title, provider, or skill...',
      allTracks: 'All tracks',
      allLevels: 'All levels',
      sortRecommended: 'Recommended',
      sortXp: 'Highest XP',
      sortTitle: 'Title A-Z',
      official: 'Official',
      community: 'Community',
      searchLabel: 'Search',
      trackLabel: 'Track',
      levelLabel: 'Level',
      sortLabel: 'Sort',
      bookmarksOnly: 'Bookmarks only',
      resetFilters: 'Reset filters',
      started: 'Started',
      total: 'Total resources',
      officialCount: 'Official sources',
      tracksCovered: 'Tracks covered',
      featuredTitle: 'Featured quests',
      featuredSubtitle:
        'These are strong starting points if you want better signal fast in the current codebase.',
      allCoursesTitle: 'Course catalog',
      allCoursesSubtitle:
        'Pick a quest to inspect the fit, skills, and the external learning source.',
      noResults: 'No matching courses found.',
      noResultsHint:
        'Try a broader keyword, clear bookmarks mode, or switch tracks.',
      detailsTitle: 'Quest details',
      whyPick: 'Why pick this',
      youWillGet: 'What you will gain',
      provider: 'Provider',
      resourceType: 'Resource type',
      language: 'Language',
      price: 'Price',
      progress: 'Personal progress',
      startQuest: 'Start quest',
      continueQuest: 'Continue quest',
      openSource: 'Open source',
      saveQuest: 'Save quest',
      unsaveQuest: 'Remove save',
      addProgress: 'Add 10%',
      minusProgress: 'Minus 10%',
      resetProgress: 'Reset progress',
      trackProgress: 'Track inside FE',
      emptySelection: 'Select a course to open its detail panel.',
      myBoardTitle: 'Your quest board',
      myBoardSubtitle:
        'Courses you start will stay here so you can jump back quickly.',
      notStartedYet: 'You have not started any learning quest yet.',
      notStartedHint:
        'Use the start button on any card to keep local progress inside the FE.',
      lessons: 'Path',
      pace: 'Pace',
      providerType: 'Source',
    };

  const [search, setSearch] = useState('');
  const [track, setTrack] = useState<TrackFilter>('All');
  const [level, setLevel] = useState<LevelFilter>('All');
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(COURSES_CATALOG[0]?.id ?? '');
  const [progressMap, setProgressMap] = useState<ProgressMap>(() =>
    readProgressStorage()
  );
  const [bookmarks, setBookmarks] = useState<string[]>(() =>
    readBookmarksStorage()
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressMap));
  }, [progressMap]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const stats = useMemo(() => {
    const startedCount = Object.values(progressMap).filter((value) => value > 0).length;
    const officialCount = COURSES_CATALOG.filter(
      (item) => item.providerKind === 'Official'
    ).length;
    const trackCount = new Set(COURSES_CATALOG.map((item) => item.track)).size;

    return {
      total: COURSES_CATALOG.length,
      startedCount,
      officialCount,
      trackCount,
    };
  }, [progressMap]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...COURSES_CATALOG]
      .filter((course) => {
        if (track !== 'All' && course.track !== track) return false;
        if (level !== 'All' && course.level !== level) return false;
        if (bookmarksOnly && !bookmarks.includes(course.id)) return false;
        if (!normalizedSearch) return true;

        const haystack = [
          course.title.en,
          course.title.vi,
          course.provider,
          course.track,
          course.level,
          course.summary.en,
          course.summary.vi,
          course.whyPick.en,
          course.whyPick.vi,
          ...course.tags,
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sortMode === 'xp') return right.xp - left.xp;
        if (sortMode === 'title') {
          const leftTitle = isVi ? left.title.vi : left.title.en;
          const rightTitle = isVi ? right.title.vi : right.title.en;
          return leftTitle.localeCompare(rightTitle);
        }

        if (left.featured !== right.featured) return left.featured ? -1 : 1;
        const leftProgress = progressMap[left.id] ?? 0;
        const rightProgress = progressMap[right.id] ?? 0;
        if (leftProgress !== rightProgress) return rightProgress - leftProgress;
        return right.xp - left.xp;
      });
  }, [bookmarks, bookmarksOnly, isVi, level, progressMap, search, sortMode, track]);

  const selectedCourse =
    filteredCourses.find((course) => course.id === selectedId) ??
    filteredCourses[0] ??
    null;

  const featuredCourses = filteredCourses.filter((course) => course.featured).slice(0, 3);
  const startedCourses = COURSES_CATALOG.filter((course) => (progressMap[course.id] ?? 0) > 0)
    .sort((left, right) => (progressMap[right.id] ?? 0) - (progressMap[left.id] ?? 0))
    .slice(0, 4);

  const updateProgress = (courseId: string, nextValue: number) => {
    setProgressMap((prev) => ({
      ...prev,
      [courseId]: clampProgress(nextValue),
    }));
  };

  const handleStartCourse = (course: CourseCatalogItem) => {
    const current = progressMap[course.id] ?? 0;
    updateProgress(course.id, current > 0 ? current : 8);
    if (typeof window !== 'undefined') {
      window.open(course.url, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleBookmark = (courseId: string) => {
    setBookmarks((prev) =>
      prev.includes(courseId)
        ? prev.filter((item) => item !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#a78bfa 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute -top-[20%] -left-[10%] h-[700px] w-[700px] rounded-full bg-[color:var(--cg-coral-a18)] blur-[160px]" />
        <div className="absolute top-[40%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[color:var(--cg-green-a14)] blur-[140px]" />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-12 space-y-10">
          <section className="text-center space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2 text-xs font-semibold backdrop-blur-md">
              <span className="material-symbols-outlined text-[16px] text-[#a78bfa]">
                school
              </span>
              {text.badge}
            </div>
            <h1 className="font-['Lexend'] text-5xl font-black tracking-tight md:text-6xl">
              {text.titleA} <span className="gradient-text-cool">{text.titleB}</span>
            </h1>
            <p className="mx-auto max-w-3xl text-base leading-7 text-[color:var(--cg-text-muted)]">
              {text.subtitle}
            </p>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up delay-100">
            {[
              {
                label: text.total,
                value: stats.total,
                icon: 'library_books',
                color: '#a78bfa',
              },
              {
                label: text.officialCount,
                value: stats.officialCount,
                icon: 'verified',
                color: '#60a5fa',
              },
              {
                label: text.started,
                value: stats.startedCount,
                icon: 'play_circle',
                color: '#4ade80',
              },
              {
                label: text.tracksCovered,
                value: stats.trackCount,
                icon: 'hub',
                color: '#fbbf24',
              },
            ].map((item) => (
              <div key={item.label} className="glass-card px-4 py-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}35`,
                  }}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ color: item.color }}
                  >
                    {item.icon}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--cg-text-muted)]">
                    {item.label}
                  </div>
                  <div className="text-2xl font-black">{item.value}</div>
                </div>
              </div>
            ))}
          </section>

          <section className="glass-card p-4 md:p-5 animate-fade-in-up delay-150">
            <div className="grid lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr_auto] gap-3 items-center">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[color:var(--cg-text-muted)]">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={text.search}
                  className="w-full rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] py-3.5 pl-12 pr-4 text-sm text-[color:var(--cg-text)] placeholder-[color:var(--cg-text-muted)] backdrop-blur-xl focus:border-[#a78bfa] focus:outline-none focus:ring-1 focus:ring-[#a78bfa] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                  {text.trackLabel}
                </span>
                <select
                  value={track}
                  onChange={(event) => setTrack(event.target.value as TrackFilter)}
                  className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3 text-sm outline-none"
                >
                  {TRACKS.map((item) => (
                    <option key={item} value={item} className="text-black">
                      {item === 'All' ? text.allTracks : trackLabel(item, isVi)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                  {text.levelLabel}
                </span>
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value as LevelFilter)}
                  className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3 text-sm outline-none"
                >
                  {LEVELS.map((item) => (
                    <option key={item} value={item} className="text-black">
                      {item === 'All' ? text.allLevels : levelLabel(item, isVi).text}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                  {text.sortLabel}
                </span>
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3 text-sm outline-none"
                >
                  <option value="recommended" className="text-black">
                    {text.sortRecommended}
                  </option>
                  <option value="xp" className="text-black">
                    {text.sortXp}
                  </option>
                  <option value="title" className="text-black">
                    {text.sortTitle}
                  </option>
                </select>
              </div>

              <div className="flex flex-wrap lg:flex-col gap-3 lg:items-end">
                <button
                  onClick={() => setBookmarksOnly((prev) => !prev)}
                  className="rounded-2xl border px-4 py-3 text-sm font-semibold transition-all"
                  style={{
                    background: bookmarksOnly
                      ? 'rgba(251,191,36,0.16)'
                      : 'rgba(255,255,255,0.04)',
                    borderColor: bookmarksOnly
                      ? 'rgba(251,191,36,0.36)'
                      : 'rgba(255,255,255,0.08)',
                    color: bookmarksOnly ? '#fbbf24' : 'var(--cg-text)',
                  }}
                >
                  {text.bookmarksOnly}
                </button>
                <button
                  onClick={() => {
                    setSearch('');
                    setTrack('All');
                    setLevel('All');
                    setSortMode('recommended');
                    setBookmarksOnly(false);
                  }}
                  className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm font-semibold"
                >
                  {text.resetFilters}
                </button>
              </div>
            </div>
          </section>

          {featuredCourses.length > 0 && (
            <section className="space-y-4 animate-fade-in-up delay-200">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                  <h2 className="font-['Lexend'] text-2xl font-black">{text.featuredTitle}</h2>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                    {text.featuredSubtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {featuredCourses.map((course) => {
                  const courseLevel = levelLabel(course.level, isVi);
                  const progress = progressMap[course.id] ?? 0;
                  const isSaved = bookmarks.includes(course.id);
                  const title = isVi ? course.title.vi : course.title.en;

                  return (
                    <article
                      key={course.id}
                      onClick={() => setSelectedId(course.id)}
                      className="glass-card p-6 card-hover group relative overflow-hidden cursor-pointer"
                      style={{
                        border:
                          selectedCourse?.id === course.id
                            ? `1px solid ${course.accent}55`
                            : undefined,
                      }}
                    >
                      <div
                        className="absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-45"
                        style={{ background: course.accent }}
                      />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em]"
                              style={{
                                color: courseLevel.accent,
                                border: `1px solid ${courseLevel.accent}35`,
                                background: `${courseLevel.accent}16`,
                              }}
                            >
                              {courseLevel.text}
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] text-[color:var(--cg-text-muted)]">
                              {trackLabel(course.track, isVi)}
                            </span>
                          </div>

                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleBookmark(course.id);
                            }}
                            className="w-10 h-10 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] flex items-center justify-center"
                          >
                            <span
                              className="material-symbols-outlined text-[18px]"
                              style={{
                                color: isSaved ? '#fbbf24' : 'var(--cg-text-muted)',
                                fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
                              }}
                            >
                              bookmark
                            </span>
                          </button>
                        </div>

                        <div className="mt-5 flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--cg-text-muted)]">
                              {course.provider}
                            </div>
                            <h3 className="mt-2 font-['Lexend'] text-2xl font-black leading-tight">
                              {title}
                            </h3>
                          </div>
                          <div
                            className="flex items-center gap-1.5 font-black"
                            style={{ color: course.accent }}
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              stars
                            </span>
                            {formatXp(course.xp)} XP
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                          {isVi ? course.summary.vi : course.summary.en}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-2xl p-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                              {text.lessons}
                            </div>
                            <div className="mt-1 font-bold">
                              {isVi ? course.lessonMeta.vi : course.lessonMeta.en}
                            </div>
                          </div>
                          <div className="rounded-2xl p-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                              {text.providerType}
                            </div>
                            <div className="mt-1 font-bold">
                              {course.providerKind === 'Official'
                                ? text.official
                                : text.community}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {course.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                              style={{
                                background: `${course.accent}12`,
                                border: `1px solid ${course.accent}28`,
                                color: course.accent,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-6">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[color:var(--cg-text-muted)]">
                            <span>{text.progress}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progress}%`,
                                background: course.accent,
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex gap-3">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleStartCourse(course);
                            }}
                            className="flex-1 rounded-2xl py-3 text-sm font-bold transition-all hover:scale-[1.01]"
                            style={{
                              background: `${course.accent}18`,
                              border: `1px solid ${course.accent}38`,
                              color: course.accent,
                            }}
                          >
                            {progress > 0 ? text.continueQuest : text.startQuest}
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              updateProgress(course.id, progress + 10);
                            }}
                            className="rounded-2xl px-4 py-3 text-sm font-bold border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]"
                          >
                            +10%
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <section className="glass-card p-6 animate-fade-in-up delay-250">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-['Lexend'] text-2xl font-black">{text.myBoardTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                  {text.myBoardSubtitle}
                </p>
              </div>
            </div>

            {startedCourses.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] px-6 py-10 text-center">
                <div className="text-lg font-bold">{text.notStartedYet}</div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                  {text.notStartedHint}
                </p>
              </div>
            ) : (
              <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {startedCourses.map((course) => {
                  const progress = progressMap[course.id] ?? 0;
                  return (
                    <button
                      key={course.id}
                      onClick={() => setSelectedId(course.id)}
                      className="rounded-3xl text-left px-4 py-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] transition-all hover:border-[rgba(255,255,255,0.16)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                            {course.provider}
                          </div>
                          <div className="mt-1 font-bold line-clamp-2">
                            {isVi ? course.title.vi : course.title.en}
                          </div>
                        </div>
                        <span
                          className="material-symbols-outlined"
                          style={{ color: course.accent }}
                        >
                          school
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-[color:var(--cg-text-muted)]">
                        <span>{text.progress}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${progress}%`, background: course.accent }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6 animate-fade-in-up delay-300">
            <div className="space-y-4">
              <div>
                <h2 className="font-['Lexend'] text-2xl font-black">{text.allCoursesTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                  {text.allCoursesSubtitle}
                </p>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="glass-card px-6 py-12 text-center">
                  <div className="text-lg font-bold">{text.noResults}</div>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                    {text.noResultsHint}
                  </p>
                </div>
              ) : (
                filteredCourses.map((course) => {
                  const progress = progressMap[course.id] ?? 0;
                  const courseLevel = levelLabel(course.level, isVi);
                  const isSaved = bookmarks.includes(course.id);
                  const title = isVi ? course.title.vi : course.title.en;

                  return (
                    <article
                      key={course.id}
                      onClick={() => setSelectedId(course.id)}
                      className="glass-card p-5 group relative overflow-hidden cursor-pointer"
                      style={{
                        border:
                          selectedCourse?.id === course.id
                            ? `1px solid ${course.accent}55`
                            : undefined,
                        boxShadow:
                          selectedCourse?.id === course.id
                            ? `0 0 0 1px ${course.accent}15`
                            : undefined,
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{
                          background: `linear-gradient(90deg, transparent 0%, ${course.accent} 50%, transparent 100%)`,
                        }}
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em]"
                              style={{
                                background: `${courseLevel.accent}16`,
                                border: `1px solid ${courseLevel.accent}35`,
                                color: courseLevel.accent,
                              }}
                            >
                              {courseLevel.text}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[color:var(--cg-text-muted)]">
                              {trackLabel(course.track, isVi)}
                            </span>
                            <span
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                              style={{
                                background:
                                  course.providerKind === 'Official'
                                    ? 'rgba(96,165,250,0.14)'
                                    : 'rgba(251,191,36,0.14)',
                                border:
                                  course.providerKind === 'Official'
                                    ? '1px solid rgba(96,165,250,0.25)'
                                    : '1px solid rgba(251,191,36,0.25)',
                                color:
                                  course.providerKind === 'Official'
                                    ? '#60a5fa'
                                    : '#fbbf24',
                              }}
                            >
                              {course.providerKind === 'Official'
                                ? text.official
                                : text.community}
                            </span>
                          </div>

                          <h3 className="mt-3 font-['Lexend'] text-2xl font-black leading-tight">
                            {title}
                          </h3>
                          <p className="mt-1 text-sm text-[color:var(--cg-text-muted)]">
                            {course.provider}
                          </p>
                        </div>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleBookmark(course.id);
                          }}
                          className="w-10 h-10 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] flex items-center justify-center"
                        >
                          <span
                            className="material-symbols-outlined text-[18px]"
                            style={{
                              color: isSaved ? '#fbbf24' : 'var(--cg-text-muted)',
                              fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
                            }}
                          >
                            bookmark
                          </span>
                        </button>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                        {isVi ? course.summary.vi : course.summary.en}
                      </p>

                      <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
                        <div className="rounded-2xl p-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
                          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                            {text.lessons}
                          </div>
                          <div className="mt-1 font-bold">
                            {isVi ? course.lessonMeta.vi : course.lessonMeta.en}
                          </div>
                        </div>
                        <div className="rounded-2xl p-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
                          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                            {text.pace}
                          </div>
                          <div className="mt-1 font-bold">
                            {isVi ? course.format.vi : course.format.en}
                          </div>
                        </div>
                        <div className="rounded-2xl p-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
                          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                            XP
                          </div>
                          <div className="mt-1 font-bold" style={{ color: course.accent }}>
                            {formatXp(course.xp)} XP
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {course.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                            style={{
                              background: `${course.accent}10`,
                              border: `1px solid ${course.accent}24`,
                              color: course.accent,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[color:var(--cg-text-muted)]">
                          <span>{text.progress}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, background: course.accent }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleStartCourse(course);
                          }}
                          className="rounded-2xl px-4 py-3 text-sm font-bold transition-all"
                          style={{
                            background: `${course.accent}18`,
                            border: `1px solid ${course.accent}36`,
                            color: course.accent,
                          }}
                        >
                          {progress > 0 ? text.continueQuest : text.startQuest}
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            updateProgress(course.id, progress + 10);
                          }}
                          className="rounded-2xl px-4 py-3 text-sm font-bold border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]"
                        >
                          +10%
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <aside className="glass-card p-6 sticky top-6 h-fit">
              <h2 className="font-['Lexend'] text-2xl font-black">{text.detailsTitle}</h2>

              {!selectedCourse ? (
                <div className="mt-6 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                  {text.emptySelection}
                </div>
              ) : (
                <>
                  <div className="mt-6 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--cg-text-muted)]">
                        {selectedCourse.provider}
                      </div>
                      <h3 className="mt-2 font-['Lexend'] text-3xl font-black leading-tight">
                        {isVi ? selectedCourse.title.vi : selectedCourse.title.en}
                      </h3>
                    </div>
                    <button
                      onClick={() => toggleBookmark(selectedCourse.id)}
                      className="w-11 h-11 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] flex items-center justify-center"
                    >
                      <span
                        className="material-symbols-outlined text-[19px]"
                        style={{
                          color: bookmarks.includes(selectedCourse.id)
                            ? '#fbbf24'
                            : 'var(--cg-text-muted)',
                          fontVariationSettings: bookmarks.includes(selectedCourse.id)
                            ? "'FILL' 1"
                            : "'FILL' 0",
                        }}
                      >
                        bookmark
                      </span>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span
                      className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em]"
                      style={{
                        background: `${selectedCourse.accent}16`,
                        border: `1px solid ${selectedCourse.accent}35`,
                        color: selectedCourse.accent,
                      }}
                    >
                      {trackLabel(selectedCourse.track, isVi)}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-bold border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[color:var(--cg-text-muted)]">
                      {levelLabel(selectedCourse.level, isVi).text}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-bold border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[color:var(--cg-text-muted)]">
                      {selectedCourse.providerKind === 'Official'
                        ? text.official
                        : text.community}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[color:var(--cg-text-muted)]">
                    {isVi ? selectedCourse.summary.vi : selectedCourse.summary.en}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[
                      {
                        label: text.resourceType,
                        value: isVi ? selectedCourse.format.vi : selectedCourse.format.en,
                      },
                      {
                        label: text.lessons,
                        value: isVi
                          ? selectedCourse.lessonMeta.vi
                          : selectedCourse.lessonMeta.en,
                      },
                      {
                        label: text.language,
                        value: isVi
                          ? selectedCourse.languageLabel.vi
                          : selectedCourse.languageLabel.en,
                      },
                      {
                        label: text.price,
                        value: isVi
                          ? selectedCourse.priceLabel.vi
                          : selectedCourse.priceLabel.en,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
                      >
                        <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                          {item.label}
                        </div>
                        <div className="mt-2 text-sm font-bold leading-6">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[color:var(--cg-text-muted)]">
                      <span>{text.progress}</span>
                      <span>{progressMap[selectedCourse.id] ?? 0}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressMap[selectedCourse.id] ?? 0}%`,
                          background: selectedCourse.accent,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleStartCourse(selectedCourse)}
                      className="rounded-2xl py-3 text-sm font-bold"
                      style={{
                        background: `${selectedCourse.accent}18`,
                        border: `1px solid ${selectedCourse.accent}38`,
                        color: selectedCourse.accent,
                      }}
                    >
                      {(progressMap[selectedCourse.id] ?? 0) > 0
                        ? text.continueQuest
                        : text.startQuest}
                    </button>
                    <button
                      onClick={() =>
                        updateProgress(
                          selectedCourse.id,
                          (progressMap[selectedCourse.id] ?? 0) + 10
                        )
                      }
                      className="rounded-2xl py-3 text-sm font-bold border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]"
                    >
                      {text.addProgress}
                    </button>
                    <button
                      onClick={() =>
                        updateProgress(
                          selectedCourse.id,
                          (progressMap[selectedCourse.id] ?? 0) - 10
                        )
                      }
                      className="rounded-2xl py-3 text-sm font-bold border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]"
                    >
                      {text.minusProgress}
                    </button>
                    <button
                      onClick={() => updateProgress(selectedCourse.id, 0)}
                      className="rounded-2xl py-3 text-sm font-bold border border-[rgba(244,114,182,0.24)] bg-[rgba(244,114,182,0.08)] text-[#fda4af]"
                    >
                      {text.resetProgress}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(
                          selectedCourse.url,
                          '_blank',
                          'noopener,noreferrer'
                        );
                      }
                    }}
                    className="mt-3 w-full rounded-2xl py-3 text-sm font-bold border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]"
                  >
                    {text.openSource}
                  </button>

                  <div className="mt-6 rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--cg-text-muted)]">
                      {text.whyPick}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--cg-text-muted)]">
                      {isVi ? selectedCourse.whyPick.vi : selectedCourse.whyPick.en}
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--cg-text-muted)]">
                      {text.youWillGet}
                    </div>
                    <div className="mt-3 space-y-3">
                      {selectedCourse.outcomes.map((item) => (
                        <div
                          key={item.en}
                          className="rounded-2xl px-4 py-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-sm leading-6"
                        >
                          {isVi ? item.vi : item.en}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {selectedCourse.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                        style={{
                          background: `${selectedCourse.accent}12`,
                          border: `1px solid ${selectedCourse.accent}26`,
                          color: selectedCourse.accent,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}