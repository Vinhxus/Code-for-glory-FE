import { Link, useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { useT } from '../i18n/useT';
import { getCareerPathNodeMeta, type CareerTrack } from './careerPathData';
import { useSettingsStore } from '../store/settings';

function CareerPathNode() {
  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const params = useParams();
  const track = (params.track as CareerTrack) || 'frontend';
  const nodeId = params.nodeId || '';

  const meta = getCareerPathNodeMeta(track, nodeId);
  const text =
    language === 'vi'
      ? {
          topicFallback: 'Chủ đề',
          description:
            'Trang này là điểm điều hướng cho node. Mình sẽ nối vào Courses / Practice thật khi bạn có danh sách lesson hoặc tài nguyên cụ thể.',
          links: 'Liên kết',
          noLinks: 'Chưa có link cho node này.',
        }
      : {
          topicFallback: 'Topic',
          description:
            'This page is the landing point for a roadmap node. We can connect it to real Courses / Practice content once the lesson or resource list is available.',
          links: 'Links',
          noLinks: 'No links are available for this node yet.',
        };

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
                to="/career-path"
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

        <main className="max-w-4xl mx-auto px-8 py-10 space-y-6">
          <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md p-7">
            <div className="text-xs font-bold tracking-widest text-[color:var(--cg-text-muted)] uppercase">
              {track.toUpperCase()}
            </div>
            <h1 className="mt-2 font-['Lexend'] text-3xl font-bold tracking-tight">
              {meta?.title ?? text.topicFallback}
            </h1>
            <p className="mt-2 text-sm text-[color:var(--cg-text-muted)]">
              {text.description}
            </p>
          </div>

          <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md p-7">
            <div className="text-sm font-semibold mb-4">{text.links}</div>
            {meta?.links?.length ? (
              <div className="space-y-3">
                {meta.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] px-4 py-3 text-sm font-semibold transition hover:border-[#ff7e5f]/40 hover:bg-[color:var(--cg-container-a22)]"
                  >
                    <span className="truncate">{l.label}</span>
                    <span className="material-symbols-outlined text-[18px] text-[#ff7e5f]">
                      open_in_new
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[color:var(--cg-text-muted)]">
                {text.noLinks}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CareerPathNode;

