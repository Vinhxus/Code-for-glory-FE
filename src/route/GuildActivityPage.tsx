import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import {
  GuildPageShell,
  formatGuildDate,
  useGuildDetailResource,
} from './guildPageShared';

export default function GuildActivityPage() {
  const { slug } = useParams();
  const { guild, loading, error, isVi, locale } = useGuildDetailResource(slug);

  const grouped = useMemo(() => {
    if (!guild) return [];
    return guild.activityFeed.map((item, index) => ({
      ...item,
      key: `${item.title}-${item.createdAt}-${index}`,
    }));
  }, [guild]);

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] overflow-x-hidden">
      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-12 animate-fade-in-up">
          <GuildPageShell
            guild={guild}
            loading={loading}
            error={error}
            isVi={isVi}
            locale={locale}
            activeTab="activity"
          >
            <div className="space-y-4">
              {grouped.map((item) => (
                <article key={item.key} className="glass-card p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--cg-text-muted)]">
                        {item.type.replaceAll('_', ' ')}
                      </div>
                      <h2 className="mt-2 text-lg font-black">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-sm text-[color:var(--cg-text-muted)]">
                      {formatGuildDate(item.createdAt, locale)}
                    </div>
                  </div>
                </article>
              ))}

              {!loading && guild && grouped.length === 0 && (
                <div className="glass-card px-6 py-10 text-center text-[color:var(--cg-text-muted)]">
                  {isVi
                    ? 'Chưa có hoạt động nào để hiển thị.'
                    : 'No guild activity to show yet.'}
                </div>
              )}
            </div>
          </GuildPageShell>
        </main>
      </div>
    </div>
  );
}
