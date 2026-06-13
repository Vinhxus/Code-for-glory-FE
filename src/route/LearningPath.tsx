import { Link } from 'react-router-dom';
import LearningPathMap from '../components/LearningPathMap';
import SideNav from '../components/SideNav';

function LearningPath() {
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
                Back to Map
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-8 py-12">
          <LearningPathMap />
        </main>
      </div>
    </div>
  );
}

export default LearningPath;
