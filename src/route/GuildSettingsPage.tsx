/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { ApiError } from '../services/apiClient';
import {
  updateGuild,
  type GuildType,
  type UpdateGuildPayload,
} from '../services/guildsApi';
import { TYPE_COLORS, TYPE_ICONS } from './guildData';
import { GuildPageShell, useGuildDetailResource } from './guildPageShared';

const GUILD_TYPES: GuildType[] = [
  'Backend',
  'Frontend',
  'Data Science',
  'DevOps',
  'Security',
  'Mobile',
];

export default function GuildSettingsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { guild, setGuild, loading, error, setError, isVi, locale } =
    useGuildDetailResource(slug);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [form, setForm] = useState<UpdateGuildPayload>({
    name: '',
    type: 'Frontend',
    description: '',
    mission: '',
    recruitmentPitch: '',
    language: '',
    headquarters: '',
    openToJoin: true,
    maxMembers: 120,
    tags: [],
  });

  useEffect(() => {
    if (!guild) return;
    setForm({
      name: guild.name,
      type: guild.type,
      description: guild.description,
      mission: guild.mission || '',
      recruitmentPitch: guild.recruitmentPitch || '',
      language: guild.language || '',
      headquarters: guild.headquarters || '',
      openToJoin: guild.openToJoin,
      maxMembers: guild.maxMembers,
      tags: guild.tags,
    });
  }, [guild]);

  const addTag = () => {
    const next = tagInput.trim();
    if (!next) return;
    setForm((prev) => ({
      ...prev,
      tags: [...new Set([...(prev.tags ?? []), next])].slice(0, 6),
    }));
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: (prev.tags ?? []).filter((item) => item !== tag),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!guild?.isOwner) return;

    try {
      setSaving(true);
      const next = await updateGuild(guild.slug, {
        ...form,
        name: form.name?.trim(),
        description: form.description?.trim(),
        mission: form.mission?.trim(),
        recruitmentPitch: form.recruitmentPitch?.trim(),
        language: form.language?.trim(),
        headquarters: form.headquarters?.trim(),
        tags: form.tags?.map((tag) => tag.trim()).filter(Boolean),
      });
      setGuild(next);
      setError(null);
      if (next.slug !== guild.slug) {
        navigate(`/guilds/hall/${next.slug}/settings`, { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể cập nhật guild.'
            : 'Unable to update guild.'
      );
    } finally {
      setSaving(false);
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
            activeTab="settings"
          >
            {guild && (
              <>
                {!guild.isOwner ? (
                  <div className="glass-card px-6 py-10 text-center text-[color:var(--cg-text-muted)]">
                    {isVi
                      ? 'Chỉ owner mới có quyền chỉnh guild.'
                      : 'Only the owner can edit this guild.'}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8">
                    <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold mb-2">
                            {isVi ? 'Tên guild' : 'Guild name'}
                          </label>
                          <input
                            value={form.name ?? ''}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold mb-2">
                            {isVi ? 'Mô tả ngắn' : 'Short description'}
                          </label>
                          <textarea
                            rows={4}
                            value={form.description ?? ''}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                description: event.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold mb-2">
                            {isVi ? 'Mission' : 'Mission'}
                          </label>
                          <textarea
                            rows={4}
                            value={form.mission ?? ''}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                mission: event.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold mb-2">
                            {isVi ? 'Recruitment pitch' : 'Recruitment pitch'}
                          </label>
                          <textarea
                            rows={4}
                            value={form.recruitmentPitch ?? ''}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                recruitmentPitch: event.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none resize-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold mb-2">
                            {isVi ? 'Chuyên môn guild' : 'Guild specialization'}
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {GUILD_TYPES.map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setForm((prev) => ({ ...prev, type }))}
                                className="rounded-2xl px-4 py-4 text-left border transition-all"
                                style={{
                                  background:
                                    form.type === type
                                      ? `${TYPE_COLORS[type]}18`
                                      : 'rgba(255,255,255,0.03)',
                                  borderColor:
                                    form.type === type
                                      ? `${TYPE_COLORS[type]}40`
                                      : 'rgba(255,255,255,0.08)',
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="material-symbols-outlined"
                                    style={{ color: TYPE_COLORS[type] }}
                                  >
                                    {TYPE_ICONS[type]}
                                  </span>
                                  <span className="font-bold">{type}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold mb-2">
                              {isVi ? 'Ngôn ngữ / stack' : 'Language / stack'}
                            </label>
                            <input
                              value={form.language ?? ''}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  language: event.target.value,
                                }))
                              }
                              className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-2">
                              {isVi ? 'Trụ sở' : 'Headquarters'}
                            </label>
                            <input
                              value={form.headquarters ?? ''}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  headquarters: event.target.value,
                                }))
                              }
                              className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold mb-2">
                              {isVi ? 'Sức chứa tối đa' : 'Max members'}
                            </label>
                            <input
                              type="number"
                              min={20}
                              max={500}
                              value={form.maxMembers ?? 120}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  maxMembers: Number(event.target.value),
                                }))
                              }
                              className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold mb-2">
                              {isVi ? 'Trạng thái tuyển' : 'Recruitment'}
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  openToJoin: !(prev.openToJoin ?? true),
                                }))
                              }
                              className="w-full px-4 py-3 rounded-2xl text-left font-semibold border"
                              style={{
                                background: (form.openToJoin ?? true)
                                  ? 'rgba(74,222,128,0.12)'
                                  : 'rgba(255,255,255,0.04)',
                                borderColor: (form.openToJoin ?? true)
                                  ? 'rgba(74,222,128,0.24)'
                                  : 'rgba(255,255,255,0.08)',
                                color: (form.openToJoin ?? true)
                                  ? '#4ade80'
                                  : 'var(--cg-text-muted)',
                              }}
                            >
                              {(form.openToJoin ?? true)
                                ? isVi
                                  ? 'Đang mở tuyển'
                                  : 'Open to join'
                                : isVi
                                  ? 'Tạm đóng tuyển'
                                  : 'Closed for now'}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold mb-2">
                            {isVi ? 'Tags chuyên môn' : 'Guild tags'}
                          </label>
                          <div className="flex gap-2">
                            <input
                              value={tagInput}
                              onChange={(event) => setTagInput(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  addTag();
                                }
                              }}
                              className="flex-1 px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                            />
                            <button
                              type="button"
                              onClick={addTag}
                              className="px-4 py-3 rounded-2xl font-bold"
                              style={{
                                background: TYPE_COLORS[form.type ?? 'Frontend'],
                                color: '#0f0b3c',
                              }}
                            >
                              {isVi ? 'Thêm' : 'Add'}
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(form.tags ?? []).map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="px-3 py-1.5 rounded-full text-[12px] font-semibold"
                                style={{
                                  background: `${TYPE_COLORS[form.type ?? 'Frontend']}14`,
                                  border: `1px solid ${TYPE_COLORS[form.type ?? 'Frontend']}32`,
                                  color: TYPE_COLORS[form.type ?? 'Frontend'],
                                }}
                              >
                                {tag} ×
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 rounded-xl font-bold"
                        style={{
                          background: TYPE_COLORS[form.type ?? 'Frontend'],
                          color: '#0f0b3c',
                        }}
                      >
                        {saving
                          ? isVi
                            ? 'Đang lưu...'
                            : 'Saving...'
                          : isVi
                            ? 'Lưu thay đổi'
                            : 'Save changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/guilds/hall/${guild.slug}`)}
                        className="px-6 py-3 rounded-xl font-bold border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)]"
                      >
                        {isVi ? 'Quay lại guild' : 'Back to guild'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </GuildPageShell>
        </main>
      </div>
    </div>
  );
}
