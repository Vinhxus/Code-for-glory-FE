import SideNav from '../components/SideNav';
import { useT } from '../i18n/useT';

type PlaceholderProps = {
  title: string;
};

function Placeholder({ title }: PlaceholderProps) {
  const t = useT();
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--cg-container-a30),transparent_55%),radial-gradient(circle_at_78%_22%,var(--cg-coral-a18),transparent_58%),radial-gradient(circle_at_30%_88%,var(--cg-amber-a14),transparent_58%)]" />
      </div>
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <div className="mx-auto flex max-w-6xl flex-col px-6 py-20">
          <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-10 shadow-[0_40px_160px_rgba(0,0,0,0.36)] backdrop-blur">
            <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
              {t('common.comingSoon')}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--cg-text-muted)]">
              {t('common.notImplemented')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Placeholder;
