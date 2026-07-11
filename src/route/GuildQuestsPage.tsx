/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { ApiError } from '../services/apiClient';
import {
  claimGuildQuest,
  createGuildQuest,
  deleteGuildQuest,
  type CreateGuildQuestPayload,
} from '../services/guildsApi';
import {
  GuildPageShell,
  useGuildDetailResource,
} from './guildPageShared';

const INITIAL_FORM: CreateGuildQuestPayload = {
  title: '',
  description: '',
  category: 'Delivery',
  difficulty: 'Medium',
  total: 5,
  rewardXp: 1500,
  rewardCoins: 120,
  dueInDays: 7,
};

export default function GuildQuestsPage() {
  const { slug } = useParams();
  const { guild, setGuild, loading, error, setError, refreshGuild, isVi, locale } =
    useGuildDetailResource(slug);

  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingQuestId, setDeletingQuestId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateGuildQuestPayload>(INITIAL_FORM);

  useEffect(() => {
    setForm(INITIAL_FORM);
  }, [guild?.slug]);

  const summary = useMemo(() => {
    if (!guild) return { completed: 0, claimable: 0 };
    const completed = guild.quests.filter((quest) => quest.completed).length;
    const claimable = guild.quests.filter(
      (quest) => quest.completed && !quest.claimed
    ).length;
    return { completed, claimable };
  }, [guild]);

  const handleClaim = async (questId: string) => {
    if (!guild) return;
    try {
      setClaimingQuestId(questId);
      await claimGuildQuest(guild.slug, questId);
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

  const handleCreateQuest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!guild?.isOwner) return;
    try {
      setCreating(true);
      const next = await createGuildQuest(guild.slug, {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        difficulty: form.difficulty.trim(),
      });
      setGuild(next);
      setForm(INITIAL_FORM);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể tạo quest.'
            : 'Unable to create quest.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    if (!guild?.isOwner) return;
    const confirmed = window.confirm(
      isVi ? 'Xoá quest này khỏi guild?' : 'Delete this quest from the guild?'
    );
    if (!confirmed) return;

    try {
      setDeletingQuestId(questId);
      const next = await deleteGuildQuest(guild.slug, questId);
      setGuild(next);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể xoá quest.'
            : 'Unable to delete quest.'
      );
    } finally {
      setDeletingQuestId(null);
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
            activeTab="quests"
          >
            {guild && (
              <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6">
                <section className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      {
                        label: isVi ? 'Tổng quest' : 'Total quests',
                        value: guild.quests.length,
                      },
                      {
                        label: isVi ? 'Đã hoàn thành' : 'Completed',
                        value: summary.completed,
                      },
                      {
                        label: isVi ? 'Có thể claim' : 'Claimable',
                        value: summary.claimable,
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

                  <div className="space-y-4">
                    {guild.quests.map((quest) => {
                      const pct = Math.round((quest.progress / quest.total) * 100);
                      const claimable =
                        guild.isMember && quest.completed && !quest.claimed;

                      return (
                        <article key={quest.questId} className="glass-card p-5">
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

                              <h2 className="mt-3 text-xl font-black">{quest.title}</h2>
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
                                  background: claimable
                                    ? guild.color
                                    : 'rgba(255,255,255,0.06)',
                                  color: claimable
                                    ? '#0f0b3c'
                                    : 'var(--cg-text-muted)',
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

                              {guild.isOwner && (
                                <button
                                  onClick={() => void handleDeleteQuest(quest.questId)}
                                  disabled={deletingQuestId === quest.questId}
                                  className="mt-2 w-full py-2.5 rounded-xl font-bold border border-[rgba(244,114,182,0.28)] bg-[rgba(244,114,182,0.1)] text-[#fda4af]"
                                >
                                  {deletingQuestId === quest.questId
                                    ? isVi
                                      ? 'Đang xoá...'
                                      : 'Deleting...'
                                    : isVi
                                      ? 'Xoá quest'
                                      : 'Delete quest'}
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <aside className="space-y-6">
                  {guild.isOwner && (
                    <form onSubmit={handleCreateQuest} className="glass-card p-6">
                      <h2 className="text-xl font-black font-['Lexend']">
                        {isVi ? 'Tạo quest mới' : 'Create new quest'}
                      </h2>
                      <div className="mt-5 space-y-4">
                        <input
                          value={form.title}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, title: event.target.value }))
                          }
                          placeholder={isVi ? 'Tên quest' : 'Quest title'}
                          className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                        />
                        <textarea
                          value={form.description}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              description: event.target.value,
                            }))
                          }
                          rows={4}
                          placeholder={isVi ? 'Mô tả quest' : 'Quest description'}
                          className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none resize-none"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={form.category}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                category: event.target.value,
                              }))
                            }
                            placeholder={isVi ? 'Category' : 'Category'}
                            className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                          />
                          <input
                            value={form.difficulty}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                difficulty: event.target.value,
                              }))
                            }
                            placeholder={isVi ? 'Độ khó' : 'Difficulty'}
                            className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            ['total', form.total],
                            ['rewardXp', form.rewardXp],
                            ['rewardCoins', form.rewardCoins],
                            ['dueInDays', form.dueInDays ?? 7],
                          ].map(([key, value]) => (
                            <input
                              key={key}
                              type="number"
                              min={1}
                              value={value}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  [key]: Number(event.target.value),
                                }))
                              }
                              placeholder={String(key)}
                              className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={creating}
                        className="mt-5 w-full py-3 rounded-xl font-bold"
                        style={{ background: guild.color, color: '#0f0b3c' }}
                      >
                        {creating
                          ? isVi
                            ? 'Đang tạo quest...'
                            : 'Creating quest...'
                          : isVi
                            ? 'Tạo quest'
                            : 'Create quest'}
                      </button>
                    </form>
                  )}

                  <div className="glass-card p-6">
                    <h2 className="text-xl font-black font-['Lexend']">
                      {isVi ? 'Quest tips' : 'Quest tips'}
                    </h2>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                      <p>
                        {isVi
                          ? 'Quest nên có mục tiêu rõ, total vừa đủ và reward đủ hấp dẫn để member muốn theo.'
                          : 'Keep quest goals explicit, totals realistic, and rewards meaningful enough to motivate members.'}
                      </p>
                      <p>
                        {isVi
                          ? 'Activity feed sẽ tự log khi owner thêm quest hoặc member claim thưởng.'
                          : 'The activity feed automatically logs quest creation and reward claims.'}
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </GuildPageShell>
        </main>
      </div>
    </div>
  );
}
