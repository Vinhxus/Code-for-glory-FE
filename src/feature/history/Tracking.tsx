import './Tracking.css';
import HButton from '../../components/history/HButton';

interface ErrorItem {
  id: number;
  icon: string;
  title: string;
  context: string;
}

const ERRORS: ErrorItem[] = [
  {
    id: 1,
    icon: 'memory',
    title: 'Memory Leak Sigil',
    context: 'kernel/allocation.arc',
  },
  {
    id: 2,
    icon: 'autorenew',
    title: 'Recursion Loop Abyss',
    context: 'logic/gate.handler.arc',
  },
];

const BAR_DATA = [1, 3, 4];

function BarChart() {
  const max = Math.max(...BAR_DATA);
  return (
    <div className="bar-chart">
      {BAR_DATA.map((v, i) => (
        <div
          key={i}
          className="bar-chart-bar"
          style={{
            height: `${(v / max) * 100}%`,
            background:
              i === BAR_DATA.length - 4
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
  return (
    <>
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
              <BarChart />
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="main-content">
          <div className="error-chronology">
            <div className="section-header">
              <h2 className="section-title">Error Chronology</h2>
              <span className="active-badge">7 Active Anomaly</span>
            </div>

            <div className="error-list">
              {ERRORS.map((item) => (
                <ErrorRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="right-sidebar">
            {/* Advice card */}
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
              <p className="advice-body">
                Your logic gate seals are brittle. The flow of recursive-energy
                is uncontained, leading to structural instability.
              </p>

              <p className="advice-label advice-label-muted">Suggested Title</p>
              <p className="advice-lesson-title">
                Mastering Recursive Sigils II
              </p>

              <button className="enter-lesson-btn">ENTER LESSON</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
