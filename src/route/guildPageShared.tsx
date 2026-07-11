/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../services/apiClient';
import { getGuildDetail, type GuildDetail } from '../services/guildsApi';
import { TYPE_ICONS, fmtMembers, rankLabel } from './guildData';
import { useSettingsStore } from '../store/settings';

export type GuildTab = 'overview' | 'quests' | 'members' | 'activity' | 'settings';

export function guildHref(slug: string, tab: GuildTab) {
  if (tab === 'overview') return `/guilds/hall/${slug}`;
  return `/guilds/hall/${slug}/${tab}`;
}

export function useGuildDetailResource(slug?: string) {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';
  const locale = isVi ? 'vi-VN' : 'en-US';
  const [guild, setGuild] = useState<GuildDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGuild = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const data = await getGuildDetail(slug);
      setGuild(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : isVi
            ? 'Không tải được guild.'
            : 'Unable to load guild.'
      );
    } finally {
      setLoading(false);
    }
  }, [isVi, slug]);

  useEffect(() => {
    void loadGuild();
  }, [loadGuild]);

  return {
    guild,
    setGuild,
    loading,
    error,
    setError,
    refreshGuild: loadGuild,
    isVi,
    locale,
  };
}

export function formatGuildDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function GuildTabs({
  slug,
  isVi,
  activeTab,
  isOwner,
}: {
  slug: string;
  isVi: boolean;
  activeTab: GuildTab;
  isOwner: boolean;
}) {
  const tabs = useMemo(
    () =>
      [
        { key: 'overview', label: isVi ? 'Tổng quan' : 'Overview' },
        { key: 'quests', label: isVi ? 'Quest' : 'Quests' },
        { key: 'members', label: isVi ? 'Thành viên' : 'Members' },
        { key: 'activity', label: isVi ? 'Hoạt động' : 'Activity' },
        ...(isOwner
          ? [{ key: 'settings', label: isVi ? 'Cài đặt' : 'Settings' }]
          : []),
      ] as Array<{ key: GuildTab; label: string }>,
    [isOwner, isVi]
  );

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Link
            key={tab.key}
            to={guildHref(slug, tab.key)}
            className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all"
            style={{
              background: active ? 'rgba(167,139,250,0.16)' : 'rgba(255,255,255,0.04)',
              border: active
                ? '1px solid rgba(167,139,250,0.4)'
                : '1px solid rgba(255,255,255,0.08)',
              color: active ? '#c4b5fd' : 'var(--cg-text-muted)',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

export function GuildPageShell({
  guild,
  loading,
  error,
  isVi,
  locale,
  activeTab,
  children,
}: {
  guild: GuildDetail | null;
  loading: boolean;
  error: string | null;
  isVi: boolean;
  locale: string;
  activeTab: GuildTab;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div className="glass-card px-6 py-5 text-[color:var(--cg-text-muted)]">
        {isVi ? 'Đang tải guild...' : 'Loading guild...'}
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="glass-card px-6 py-5 text-[color:var(--cg-text-muted)]">
        {error || (isVi ? 'Không tìm thấy guild.' : 'Guild not found.')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[12px] text-[color:var(--cg-text-muted)]">
        <Link to="/guilds" className="hover:text-[color:var(--cg-text)]">
          {isVi ? 'Bang hội' : 'Guilds'}
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link
          to={guildHref(guild.slug, 'overview')}
          className="hover:text-[color:var(--cg-text)]"
        >
          {guild.name}
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span style={{ color: guild.color }}>
          {activeTab === 'overview'
            ? isVi
              ? 'Tổng quan'
              : 'Overview'
            : activeTab === 'quests'
              ? isVi
                ? 'Quest'
                : 'Quests'
              : activeTab === 'members'
                ? isVi
                  ? 'Thành viên'
                  : 'Members'
                : activeTab === 'activity'
                  ? isVi
                    ? 'Hoạt động'
                    : 'Activity'
                  : isVi
                    ? 'Cài đặt'
                    : 'Settings'}
        </span>
      </div>

      <section
        className="rounded-[28px] p-6 md:p-8"
        style={{
          background: `linear-gradient(135deg, ${guild.color}18 0%, rgba(255,255,255,0.02) 70%)`,
          border: `1px solid ${guild.color}35`,
          boxShadow: `0 16px 60px ${guild.color}12`,
        }}
      >
        <div className="flex flex-col xl:flex-row xl:items-center gap-6">
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
              {guild.isOwner && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.12)] text-[#fbbf24]">
                  {isVi ? 'Owner' : 'Owner'}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-4xl md:text-5xl font-black font-['Lexend'] leading-tight">
              {guild.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm md:text-[15px] leading-7 text-[color:var(--cg-text-muted)]">
              {guild.mission || guild.description}
            </p>

            <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: isVi ? 'Thành viên' : 'Members',
                  value: fmtMembers(guild.members.length),
                },
                { label: 'Win rate', value: `${guild.winRate}%` },
                {
                  label: isVi ? 'XP tuần' : 'Weekly XP',
                  value: guild.weeklyXP.toLocaleString(),
                },
                {
                  label: isVi ? 'Cập nhật' : 'Updated',
                  value: formatGuildDate(guild.activityFeed[0]?.createdAt || new Date().toISOString(), locale),
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
          </div>

          <div className="xl:w-[280px] space-y-4">
            <div className="flex flex-wrap gap-2">
              {guild.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                  style={{
                    background: `${guild.color}12`,
                    border: `1px solid ${guild.color}28`,
                    color: guild.color,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-sm text-[color:var(--cg-text-muted)]">
              {isVi ? 'Trụ sở' : 'HQ'}: {guild.headquarters || 'Remote'}
              <br />
              {isVi ? 'Ngôn ngữ' : 'Language'}: {guild.language || 'Mixed stack'}
            </div>
          </div>
        </div>
      </section>

      <GuildTabs
        slug={guild.slug}
        isVi={isVi}
        activeTab={activeTab}
        isOwner={guild.isOwner}
      />

      {error && (
        <div className="glass-card px-4 py-3 text-sm text-[#fda4af] border border-[rgba(244,114,182,0.24)]">
          {error}
        </div>
      )}

      {children}
    </div>
  );
}
