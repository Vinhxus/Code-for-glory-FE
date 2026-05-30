import { Link } from 'react-router-dom';
import LearningPathMap from '../components/LearningPathMap';
import QuickSettings from '../components/QuickSettings';
import SideNav from '../components/SideNav';

function LearningPath() {
  const logoSrc = '/component_2_2x.png';

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--cg-container-a30),transparent_55%),radial-gradient(circle_at_78%_22%,var(--cg-coral-a18),transparent_58%),radial-gradient(circle_at_30%_88%,var(--cg-amber-a14),transparent_58%)]" />
        <div className="absolute -top-56 left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--cg-container-a30),transparent_62%)] blur-2xl" />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <header className="px-8 py-6 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="CodeForGlory"
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-['Lexend'] text-lg font-bold tracking-tight text-[color:var(--cg-text)]">
                CodeForGlory
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <QuickSettings />
              <Link
                to="/"
                className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2 text-xs font-semibold text-[color:var(--cg-text)] transition hover:bg-[color:var(--cg-container-a22)]"
              >
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

