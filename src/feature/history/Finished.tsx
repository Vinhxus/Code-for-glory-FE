import { useState, useEffect, useCallback, type FC } from 'react';
import './Finished.css';
import HButton from '../../components/history/HButton';
export interface Lesson {
  id: number;
  title: string;
  status: 'MASTERED' | 'IN_PROGRESS' | 'SAVED';
  completedAt: string;
  score: number;
  icon: string;
  isLatest?: boolean;
  isNew?: boolean;
}

interface BarChartProps {
  data: number[];
  color?: string;
}

interface LessonCardProps {
  lesson: Lesson;
  index: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_COMPLETED: Lesson[] = [
  {
    id: 1,
    title: 'Quantum Algorithm Efficiency',
    status: 'MASTERED',
    completedAt: 'Oct 24, 2024',
    score: 98,
    icon: '⚛',
    isLatest: true,
  },
  {
    id: 2,
    title: 'Neural Firewall Architectures',
    status: 'MASTERED',
    completedAt: 'Oct 21, 2024',
    score: 85,
    icon: '🛡',
    isLatest: false,
  },
  {
    id: 3,
    title: 'Swarm Intelligence Protocols',
    status: 'MASTERED',
    completedAt: 'Oct 10, 2024',
    score: 88,
    icon: '🔬',
    isLatest: false,
  },
  {
    id: 4,
    title: 'Recursive Thought Encryption',
    status: 'MASTERED',
    completedAt: 'Oct 05, 2024',
    score: 82,
    icon: '🔐',
    isLatest: false,
  },
  {
    id: 5,
    title: 'Neural Nexus Convergence',
    status: 'MASTERED',
    completedAt: 'Sep 30, 2024',
    score: 91,
    icon: '🧠',
    isLatest: false,
  },
];

// ─── Fetch data từ API ────────────────────────────────────────────────────────
async function fetchCompletedLessons(): Promise<Lesson[]> {
  // Thay bằng endpoint thật:
  // const res = await fetch("/api/lessons/completed");
  // return res.json();
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_COMPLETED), 600)
  );
}

// ─── Hook nhận card mới từ BE ─────────────────────────────────────────────────
function useRealtimeLessons(onNewLesson: (lesson: Lesson) => void): void {
  useEffect(() => {
    // ── OPTION A: WebSocket ──────────────────────────────────────────────────
    // const ws = new WebSocket("wss://your-api.com/ws/lessons");
    // ws.onmessage = (event: MessageEvent) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === "LESSON_COMPLETED") onNewLesson(data.lesson);
    // };
    // return () => ws.close();

    // ── OPTION B: Polling mỗi 15 giây ───────────────────────────────────────
    // let lastId: number | null = null;
    // const interval = setInterval(async () => {
    //   const res = await fetch("/api/lessons/latest");
    //   const lesson: Lesson = await res.json();
    //   if (lesson.id !== lastId) { lastId = lesson.id; onNewLesson(lesson); }
    // }, 15000);
    // return () => clearInterval(interval);

    // ── DEMO: Giả lập BE push card sau 5 giây ────────────────────────────────
    const timer = setTimeout(() => {
      onNewLesson({
        id: Date.now(),
        title: 'Distributed Neural Networks',
        status: 'MASTERED',
        completedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        score: 95,
        icon: '🌐',
        isLatest: true,
        isNew: true,
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, [onNewLesson]);
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
const BarChart: FC<BarChartProps> = ({ data, color = '#d4a83a' }) => {
  const max = Math.max(...data);
  return (
    <div className="bar-chart">
      {data.map((v, i) => (
        <div
          key={i}
          className="bar-chart__bar"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === data.length - 2 ? color : '#2e3058',
          }}
        />
      ))}
    </div>
  );
};

// ─── Lesson Card ──────────────────────────────────────────────────────────────
const LessonCard: FC<LessonCardProps> = ({ lesson, index }) => {
  const isLatest = index === 0;
  const [visible, setVisible] = useState<boolean>(!lesson.isNew);

  useEffect(() => {
    if (lesson.isNew) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [lesson.isNew]);

  const cardClasses = [
    'lesson-card',
    lesson.isNew ? 'lesson-card--new' : '',
    visible ? 'lesson-card--visible' : 'lesson-card--hidden',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses}>
      <div className="lesson-icon">{lesson.icon}</div>

      <div className="lesson-content">
        <p className="lesson-title">{lesson.title}</p>
        <p className="lesson-meta">
          <span className="lesson-status">{lesson.status}</span>
          Completed {lesson.completedAt}
        </p>
      </div>

      <div className="lesson-score">
        {lesson.score}
        <span className="lesson-score-unit">/100</span>
      </div>

      <HButton
        className={`btn-review ${isLatest ? 'btn-review--latest' : 'btn-review--default'}`}
      >
        Review
      </HButton>
    </div>
  );
};

// Main Component
const Finished: FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const onNewLesson = useCallback((lesson: Lesson) => {
    setLessons((prev) => {
      const updated = prev.map((l) => ({ ...l, isLatest: false }));
      return [{ ...lesson, isLatest: true }, ...updated];
    });
  }, []);

  useEffect(() => {
    fetchCompletedLessons().then((data) => {
      setLessons(data);
      setLoading(false);
    });
  }, []);

  useRealtimeLessons(onNewLesson);

  return (
    <div className="archives-root">
      {/* Header */}
      <div className="archives-header">
        <h1 className="archives-title">Archives of Mastery</h1>
        <p className="archives-subtitle">
          Traversing the digital ether. Review your path of enlightenment and
          plan your next cosmic breakthrough.
        </p>
      </div>

      {/* Recent Chronicles */}
      <section className="archives-section">
        <h2 className="section-heading">↻ Recent Chronicles</h2>

        {loading ? (
          <div className="loading-text">Data loading...</div>
        ) : (
          <div className="lessons-list">
            {lessons.map((lesson, i) => (
              <LessonCard key={lesson.id} lesson={lesson} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="temporal-section">
        <h2 className="temporal-title">Temporal Progression</h2>
        <p className="temporal-desc">
          Analytical visualization of your solving efficiency and output volume.
        </p>

        <div className="charts-row">
          <div className="chart-col">
            <p className="chart-col-label">Lessons Volume</p>
            <BarChart
              data={[2, 3, 4, 3, 5, lessons.length, lessons.length + 1]}
            />
            <div className="bar-chart__labels">
              {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'Now'].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>

          <div className="chart-col">
            <p className="chart-col-label">Avg Solving Time</p>
            <BarChart data={[45, 38, 52, 31, 28, 35, 29]} color="#6366a0" />
            <div className="bar-chart__labels">
              {['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'Now'].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="insight-box">
          <span>💡</span>
          <span>
            Insight: Your solving speed has improved by 24% over the last cycle
            while maintaining a 91% accuracy rate.
          </span>
        </div>
      </section>
    </div>
  );
};

export default Finished;
