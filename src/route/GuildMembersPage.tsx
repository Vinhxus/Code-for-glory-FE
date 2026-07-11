import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { ApiError } from '../services/apiClient';
import { removeGuildMember } from '../services/guildsApi';
import {
  GuildPageShell,
  formatGuildDate,
  useGuildDetailResource,
} from './guildPageShared';

export default function GuildMembersPage() {
  const { slug } = useParams();
  const { guild, setGuild, loading, error, setError, isVi, locale } =
    useGuildDetailResource(slug);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!guild) return { totalXp: 0, averageXp: 0 };
    const totalXp = guild.members.reduce(
      (sum, member) => sum + member.contributionXp,
      0
    );
    return {
      totalXp,
      averageXp: guild.members.length
        ? Math.round(totalXp / guild.members.length)
        : 0,
    };
  }, [guild]);

  const handleRemove = async (memberId: string, username: string) => {
    if (!guild?.isOwner) return;
    const confirmed = window.confirm(
      isVi
        ? `Loại ${username} khỏi guild?`
        : `Remove ${username} from this guild?`
    );
    if (!confirmed) return;

    try {
      setRemovingId(memberId);
      const next = await removeGuildMember(guild.slug, memberId);
      setGuild(next);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể loại thành viên.'
            : 'Unable to remove this member.'
      );
    } finally {
      setRemovingId(null);
    }
  };

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
            activeTab="members"
          >
            {guild && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: isVi ? 'Tổng thành viên' : 'Total members',
                      value: guild.members.length,
                    },
                    {
                      label: isVi ? 'Tổng XP' : 'Total XP',
                      value: stats.totalXp.toLocaleString(),
                    },
                    {
                      label: isVi ? 'XP trung bình' : 'Average XP',
                      value: stats.averageXp.toLocaleString(),
                    },
                  ].map((card) => (
                    <div key={card.label} className="glass-card p-5">
                      <div className="text-3xl font-black">{card.value}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                        {card.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-5">
                  {guild.members.map((member) => {
                    const removable = guild.isOwner && !member.isCurrentUser;
                    return (
                      <article key={member.id} className="glass-card p-5">
                        <div className="flex items-center gap-4">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.username}
                              className="w-14 h-14 rounded-2xl object-cover border border-[rgba(255,255,255,0.08)]"
                            />
                          ) : (
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black"
                              style={{
                                background: `${guild.color}16`,
                                border: `1px solid ${guild.color}32`,
                                color: guild.color,
                              }}
                            >
                              {member.initials}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-lg font-black truncate">
                                {member.username}
                              </h2>
                              {member.isCurrentUser && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.1)] text-[#4ade80]">
                                  {isVi ? 'Bạn' : 'You'}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-[color:var(--cg-text-muted)]">
                              {member.title || member.roleLabel || 'Member'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
                            <div className="text-xl font-black">
                              {member.contributionXp.toLocaleString()}
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                              XP
                            </div>
                          </div>
                          <div className="rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
                            <div className="text-sm font-bold">
                              {formatGuildDate(member.joinedAt, locale)}
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                              {isVi ? 'Tham gia' : 'Joined'}
                            </div>
                          </div>
                        </div>

                        {removable && (
                          <button
                            onClick={() =>
                              void handleRemove(member.id, member.username)
                            }
                            disabled={removingId === member.id}
                            className="mt-4 w-full py-2.5 rounded-xl font-bold border border-[rgba(244,114,182,0.28)] bg-[rgba(244,114,182,0.1)] text-[#fda4af]"
                          >
                            {removingId === member.id
                              ? isVi
                                ? 'Đang loại...'
                                : 'Removing...'
                              : isVi
                                ? 'Loại khỏi guild'
                                : 'Remove from guild'}
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </GuildPageShell>
        </main>
      </div>
    </div>
  );
}
