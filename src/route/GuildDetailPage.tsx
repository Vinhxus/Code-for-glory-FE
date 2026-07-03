import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { ApiError } from '../services/apiClient';
import {
  claimGuildQuest,
  joinGuild,
  leaveGuild,
} from '../services/guildsApi';
import { TYPE_ICONS, fmtMembers, rankLabel } from './guildData';
import {
  GuildTabs,
  formatGuildDate,
  useGuildDetailResource,
} from './guildPageShared';

export default function GuildDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { guild, setGuild, loading, error, setError, refreshGuild, isVi, locale } =
    useGuildDetailResource(slug);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);

  const questSummary = useMemo(() => {
    if (!guild) return { completed: 0, claimable: 0 };
    const completed = guild.quests.filter((quest) => quest.completed).length;
    const claimable = guild.quests.filter(
      (quest) => quest.completed && !quest.claimed
    ).length;
    return { completed, claimable };
  }, [guild]);

  const handleJoin = async () => {
    if (!slug || !guild?.canJoin) return;
    try {
      setJoining(true);
      const next = await joinGuild(slug);
      setGuild(next);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể tham gia guild.'
            : 'Unable to join guild.'
      );
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!slug || !guild?.isMember || guild.isOwner) return;
    try {
      setLeaving(true);
      await leaveGuild(slug);
      navigate('/guilds');
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể rời guild.'
            : 'Unable to leave guild.'
      );
    } finally {
      setLeaving(false);
    }
  };

  const handleClaim = async (questId: string) => {
    if (!slug) return;
    try {
      setClaimingQuestId(questId);
      await claimGuildQuest(slug, questId);
      await refreshGuild();
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể claim quest.'
            : 'Unable to claim quest.'
      );
    } finally {
      setClaimingQuestId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
        <SideNav />
        <div className="md:pl-[96px] min-h-screen flex items-center justify-center">
          <div className="glass-card px-6 py-5 text-[color:var(--cg-text-muted)]">
            {isVi ? 'Đang tải guild...' : 'Loading guild...'}
          </div>
        </div>
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
        <SideNav />
        <div className="md:pl-[96px] min-h-screen flex items-center justify-center">
          <div className="glass-card px-6 py-5 text-[color:var(--cg-text-muted)]">
            {error || (isVi ? 'Không tìm thấy guild.' : 'Guild not found.')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(${guild.color} 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-12 space-y-8 animate-fade-in-up">
          <div className="flex items-center gap-2 text-[12px] text-[color:var(--cg-text-muted)]">
            <Link to="/guilds" className="hover:text-[color:var(--cg-text)]">
              {isVi ? 'Bang hội' : 'Guilds'}
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span style={{ color: guild.color }}>{guild.name}</span>
          </div>

          <section
            className="rounded-[28px] p-6 md:p-8"
            style={{
              background: `linear-gradient(135deg, ${guild.color}18 0%, rgba(255,255,255,0.02) 70%)`,
              border: `1px solid ${guild.color}35`,
              boxShadow: `0 16px 60px ${guild.color}12`,
            }}
          >
            <div className="flex flex-col xl:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold"
                    style={{
                      background: `${guild.color}18`,
                      border: `1px solid ${guild.color}35`,
                      color: guild.color,
                    }}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {TYPE_ICONS[guild.type]}
                    </span>
                    {guild.type}
                  </span>
                  <span className="text-[13px] font-bold">{rankLabel(guild.rank)}</span>
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] text-[color:var(--cg-text-muted)]">
                    {isVi ? 'Trụ sở' : 'HQ'}: {guild.headquarters || 'Remote'}
                  </span>
                </div>

                <div className="mt-4 flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <h1 className="text-4xl md:text-5xl font-black font-['Lexend'] leading-tight">
                      {guild.name}
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm md:text-[15px] leading-7 text-[color:var(--cg-text-muted)]">
                      {guild.mission || guild.description}
                    </p>
                  </div>
                  <div
                    className="w-24 h-24 rounded-[28px] flex flex-col items-center justify-center flex-shrink-0"
                    style={{
                      background: `${guild.color}16`,
                      border: `1px solid ${guild.color}35`,
                      color: guild.color,
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-[0.22em] opacity-70">
                      lv
                    </span>
                    <span className="text-4xl font-black leading-none">
                      {guild.level}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      label: isVi ? 'Thành viên' : 'Members',
                      value: fmtMembers(guild.members.length),
                    },
                    {
                      label: 'Win rate',
                      value: `${guild.winRate}%`,
                    },
                    {
                      label: isVi ? 'XP tuần' : 'Weekly XP',
                      value: guild.weeklyXP.toLocaleString(),
                    },
                    {
                      label: isVi ? 'Quest claimable' : 'Claimable quests',
                      value: questSummary.claimable,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl px-4 py-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]"
                    >
                      <div className="text-2xl font-black">{item.value}</div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/guilds')}
                    className="px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] font-bold"
                  >
                    {isVi ? 'Quay lại danh sách' : 'Back to guilds'}
                  </button>
                  {!guild.isMember && (
                    <button
                      onClick={handleJoin}
                      disabled={!guild.canJoin || joining}
                      className="px-5 py-3 rounded-xl font-bold"
                      style={{
                        background: guild.canJoin ? guild.color : 'rgba(255,255,255,0.06)',
                        color: guild.canJoin ? '#0f0b3c' : 'var(--cg-text-muted)',
                        cursor: guild.canJoin ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {joining
                        ? isVi
                          ? 'Đang tham gia...'
                          : 'Joining...'
                        : guild.canJoin
                          ? isVi
                            ? 'Tham gia guild'
                            : 'Join guild'
                          : isVi
                            ? 'Hiện chưa thể tham gia'
                            : 'Unavailable'}
                    </button>
                  )}
                  {guild.isMember && !guild.isOwner && (
                    <button
                      onClick={handleLeave}
                      disabled={leaving}
                      className="px-5 py-3 rounded-xl font-bold border border-[rgba(244,114,182,0.28)] bg-[rgba(244,114,182,0.1)] text-[#fda4af]"
                    >
                      {leaving
                        ? isVi
                          ? 'Đang rời guild...'
                          : 'Leaving...'
                        : isVi
                          ? 'Rời guild'
                          : 'Leave guild'}
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/guilds/create')}
                    className="px-5 py-3 rounded-xl font-bold border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)]"
                  >
                    {isVi ? 'Tạo guild mới' : 'Create new guild'}
                  </button>
                  <button
                    onClick={() => navigate(`/guilds/hall/${guild.slug}/quests`)}
                    className="px-5 py-3 rounded-xl font-bold border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)]"
                  >
                    {isVi ? 'Mở quest hub' : 'Open quest hub'}
                  </button>
                  <button
                    onClick={() => navigate(`/guilds/hall/${guild.slug}/members`)}
                    className="px-5 py-3 rounded-xl font-bold border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)]"
                  >
                    {isVi ? 'Xem member hub' : 'Open member hub'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <GuildTabs
            slug={guild.slug}
            isVi={isVi}
            activeTab="overview"
            isOwner={guild.isOwner}
          />

          {error && (
            <div className="glass-card px-4 py-3 text-sm text-[#fda4af] border border-[rgba(244,114,182,0.24)]">
              {error}
            </div>
          )}

          <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <section className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black font-['Lexend']">
                      {isVi ? 'Guild profile' : 'Guild profile'}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                      {guild.recruitmentPitch || guild.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--cg-text-muted)]">
                      {isVi ? 'Yêu cầu' : 'Requirements'}
                    </h3>
                    <div className="mt-3 space-y-3">
                      {guild.requirements.map((item) => (
                        <div
                          key={`${item.label}-${item.value}`}
                          className="rounded-2xl px-4 py-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
                        >
                          <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                            {item.label}
                          </div>
                          <div className="mt-1 text-sm leading-6">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--cg-text-muted)]">
                      {isVi ? 'Perks' : 'Perks'}
                    </h3>
                    <div className="mt-3 space-y-3">
                      {guild.perks.map((perk) => (
                        <div
                          key={perk}
                          className="rounded-2xl px-4 py-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-sm leading-6"
                        >
                          {perk}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black font-['Lexend']">
                      {isVi ? 'Quest board' : 'Quest board'}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                      {isVi
                        ? `Hoàn thành ${questSummary.completed}/${guild.quests.length} quest.`
                        : `Completed ${questSummary.completed}/${guild.quests.length} quests.`}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {guild.quests.map((quest) => {
                    const pct = Math.round((quest.progress / quest.total) * 100);
                    const claimable = quest.completed && !quest.claimed && guild.isMember;

                    return (
                      <div
                        key={quest.questId}
                        className="rounded-2xl px-5 py-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em]"
                                style={{
                                  background: `${guild.color}14`,
                                  border: `1px solid ${guild.color}28`,
                                  color: guild.color,
                                }}
                              >
                                {quest.category}
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold border border-[rgba(255,255,255,0.08)] text-[color:var(--cg-text-muted)]">
                                {quest.difficulty}
                              </span>
                              {quest.claimed && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.1)] text-[#4ade80]">
                                  {isVi ? 'Đã claim' : 'Claimed'}
                                </span>
                              )}
                            </div>
                            <h3 className="mt-3 text-lg font-black">{quest.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                              {quest.description}
                            </p>
                            <div className="mt-4 h-2 rounded-full bg-[rgba(255,255,255,0.06)]">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, background: guild.color }}
                              />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[12px] text-[color:var(--cg-text-muted)]">
                              <span>
                                {quest.progress}/{quest.total}
                              </span>
                              <span>{pct}%</span>
                            </div>
                          </div>

                          <div className="lg:w-[220px] rounded-2xl px-4 py-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
                            <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                              {isVi ? 'Phần thưởng' : 'Rewards'}
                            </div>
                            <div className="mt-3 text-2xl font-black">
                              +{quest.rewardXp.toLocaleString()} XP
                            </div>
                            <div className="mt-1 text-sm text-[color:var(--cg-text-muted)]">
                              +{quest.rewardCoins} coins
                            </div>
                            <div className="mt-3 text-[12px] text-[color:var(--cg-text-muted)]">
                              {isVi ? 'Hạn còn' : 'Due in'} {quest.dueInDays}{' '}
                              {isVi ? 'ngày' : 'days'}
                            </div>
                            <button
                              onClick={() => void handleClaim(quest.questId)}
                              disabled={!claimable || claimingQuestId === quest.questId}
                              className="mt-4 w-full py-2.5 rounded-xl font-bold"
                              style={{
                                background: claimable ? guild.color : 'rgba(255,255,255,0.06)',
                                color: claimable ? '#0f0b3c' : 'var(--cg-text-muted)',
                                cursor: claimable ? 'pointer' : 'not-allowed',
                              }}
                            >
                              {claimingQuestId === quest.questId
                                ? isVi
                                  ? 'Đang claim...'
                                  : 'Claiming...'
                                : claimable
                                  ? isVi
                                    ? 'Claim thưởng'
                                    : 'Claim reward'
                                  : quest.claimed
                                    ? isVi
                                      ? 'Đã claim'
                                      : 'Claimed'
                                    : isVi
                                      ? 'Chưa đủ điều kiện'
                                      : 'Not ready'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="glass-card p-6">
                <h2 className="text-xl font-black font-['Lexend']">
                  {isVi ? 'Core members' : 'Core members'}
                </h2>
                <div className="mt-5 space-y-4">
                  {guild.members.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-2xl px-4 py-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] flex items-center gap-3"
                    >
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.username}
                          className="w-12 h-12 rounded-2xl object-cover border border-[rgba(255,255,255,0.08)]"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black"
                          style={{
                            background: `${guild.color}15`,
                            border: `1px solid ${guild.color}30`,
                            color: guild.color,
                          }}
                        >
                          {member.initials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold truncate">{member.username}</h3>
                          {member.isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.1)] text-[#4ade80]">
                              {isVi ? 'Bạn' : 'You'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[color:var(--cg-text-muted)]">
                          {member.title || member.roleLabel || 'Member'}
                        </p>
                        <div className="mt-1 text-[12px] text-[color:var(--cg-text-muted)]">
                          {member.contributionXp.toLocaleString()} XP ·{' '}
                          {formatGuildDate(member.joinedAt, locale)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h2 className="text-xl font-black font-['Lexend']">
                  {isVi ? 'Activity feed' : 'Activity feed'}
                </h2>
                <div className="mt-5 space-y-4">
                  {guild.activityFeed.map((item) => (
                    <div
                      key={`${item.title}-${item.createdAt}`}
                      className="rounded-2xl px-4 py-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                        {formatGuildDate(item.createdAt, locale)}
                      </div>
                      <h3 className="mt-2 font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
