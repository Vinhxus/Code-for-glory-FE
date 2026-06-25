import { useState, useEffect } from 'react';
import './Tracking.css';
import HButton from '../../components/history/HButton';

interface ErrorItem {
  id: string;
  icon: string;
  title: string;
  context: string;
}

interface AdviceData {
  weakness: string;
  suggestedTitle: string;
  suggestedNodeId: string | null;
}

interface TrackingResponse {
  totalActive: number;
  errorChronology: ErrorItem[];
  advice: AdviceData | null;
}

function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1); // Tránh chia cho 0
  return (
    <div className="bar-chart">
      {data.map((v, i) => (
        <div
          key={i}
          className="bar-chart-bar"
          style={{
            height: `${(v / max) * 100}%`,
            background:
              i === data.length - 1
                ? 'var(--cg-amber)'
                : 'rgba(255,165,0,0.35)',
          }}
        />
      ))}
    </div>
  );
}

function ErrorRow({ item }: { item: ErrorItem }) {
  return (
    <div className="error-row">
      <div className="error-row-left">
        <div className="error-icon-wrap">
          <span className="material-symbols-outlined">{item.icon}</span>
        </div>
        <div>
          <p className="error-title">{item.title}</p>
          <p className="error-context">Context: {item.context}</p>
        </div>
      </div>
      <HButton>VIEW FIX</HButton>
    </div>
  );
}

export default function Tracking() {
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [totalActive, setTotalActive] = useState<number>(0);
  const [advice, setAdvice] = useState<AdviceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Giả lập hoặc tính toán dữ liệu chart dựa trên số lượng lỗi
  const barData = [1, 3, errors.length];

  useEffect(() => {
    fetch('/api/history/tracking')
      .then((res) => res.json())
      .then((data: TrackingResponse) => {
        setErrors(data.errorChronology);
        setTotalActive(data.totalActive);
        setAdvice(data.advice);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch tracking data:', err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div
        className="tracking-wrapper"
        style={{ padding: '24px', color: 'var(--cg-text-muted)' }}
      >
        Data loading...
      </div>
    );

  return (
    <div className="tracking-wrapper">
      {/* ── Hero Banner ── */}
      <div className="hero-banner">
        <div className="hero-grid-overlay" />
        <div className="hero-inner">
          <div className="hero-text">
            <h1 className="hero-title">DIAGNOSTIC SANCTORUM</h1>
            <p className="hero-subtitle">Analyze your bugs and errors.</p>
          </div>
          <div className="hero-chart">
            <BarChart data={barData} />
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="main-content">
        <div className="error-chronology">
          <div className="section-header">
            <h2 className="section-title">Error Chronology</h2>
            <span className="active-badge">{totalActive} Active Anomaly</span>
          </div>

          <div className="error-list">
            {errors.map((item) => (
              <ErrorRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="right-sidebar">
          {advice && (
            <div className="card">
              <div className="advice-header">
                <span className="material-symbols-outlined">lightbulb</span>
                <h2 className="card-title" style={{ margin: 0 }}>
                  Advice
                </h2>
              </div>

              <p className="advice-label advice-label-coral">
                CURRENT WEAKNESS
              </p>
              <p className="advice-body">{advice.weakness}</p>

              <p className="advice-label advice-label-muted">Suggested Title</p>
              <p className="advice-lesson-title">{advice.suggestedTitle}</p>

              <button className="enter-lesson-btn">ENTER LESSON</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
