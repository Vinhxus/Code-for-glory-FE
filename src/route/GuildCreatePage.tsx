import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';
import { ApiError } from '../services/apiClient';
import {
  createGuild,
  type CreateGuildPayload,
  type GuildType,
} from '../services/guildsApi';
import { TYPE_COLORS, TYPE_DESCRIPTIONS, TYPE_ICONS } from './guildData';

const GUILD_TYPES: GuildType[] = [
  'Backend',
  'Frontend',
  'Data Science',
  'DevOps',
  'Security',
  'Mobile',
];

export default function GuildCreatePage() {
  const navigate = useNavigate();
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const [form, setForm] = useState<CreateGuildPayload>({
    name: '',
    type: 'Frontend',
    description: '',
    recruitmentPitch: '',
    language: '',
    headquarters: '',
    openToJoin: true,
    maxMembers: 120,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeMeta = useMemo(() => TYPE_DESCRIPTIONS[form.type], [form.type]);
  const accent = TYPE_COLORS[form.type];

  const updateForm = <K extends keyof CreateGuildPayload>(
    key: K,
    value: CreateGuildPayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    const next = tagInput.trim();
    if (!next) return;
    if ((form.tags ?? []).includes(next)) {
      setTagInput('');
      return;
    }
    updateForm('tags', [...(form.tags ?? []), next].slice(0, 6));
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    updateForm(
      'tags',
      (form.tags ?? []).filter((item) => item !== tag)
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const guild = await createGuild({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        recruitmentPitch: form.recruitmentPitch?.trim(),
        language: form.language?.trim(),
        headquarters: form.headquarters?.trim(),
        tags: form.tags?.filter(Boolean),
      });
      navigate(`/guilds/hall/${guild.slug}`);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể tạo guild.'
            : 'Unable to create guild.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] overflow-x-hidden">
      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-6xl mx-auto px-6 md:px-8 py-12 space-y-8 animate-fade-in-up">
          <div className="flex items-center gap-2 text-[12px] text-[color:var(--cg-text-muted)]">
            <Link to="/guilds" className="hover:text-[color:var(--cg-text)]">
              {isVi ? 'Bang hội' : 'Guilds'}
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span style={{ color: accent }}>
              {isVi ? 'Tạo guild mới' : 'Create guild'}
            </span>
          </div>

          <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-6">
            <section
              className="rounded-[28px] p-6 md:p-8"
              style={{
                background: `linear-gradient(135deg, ${accent}18 0%, rgba(255,255,255,0.02) 70%)`,
                border: `1px solid ${accent}35`,
              }}
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black font-['Lexend']">
                    {isVi ? 'Create your guild' : 'Create your guild'}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--cg-text-muted)]">
                    {isVi
                      ? 'Tạo một guild chuyên nghiệp với bản sắc rõ ràng, tiêu chí tuyển thành viên và quest board đủ hấp dẫn để kéo team đi xa.'
                      : 'Launch a professional guild with a strong identity, clear recruitment rules, and a quest board that actually motivates people to join.'}
                  </p>
                </div>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${accent}18`,
                    border: `1px solid ${accent}35`,
                    color: accent,
                  }}
                >
                  <span className="material-symbols-outlined text-[30px]">add</span>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-3 gap-3">
                {[
                  {
                    label: isVi ? 'Founder flow' : 'Founder flow',
                    value: isVi ? 'Bạn sẽ là owner đầu tiên' : 'You become the first owner',
                  },
                  {
                    label: isVi ? 'Quest board' : 'Quest board',
                    value: isVi
                      ? 'Tự tạo hành trình mở đầu cho guild'
                      : 'Starter quests are generated automatically',
                  },
                  {
                    label: isVi ? 'Tuyển thành viên' : 'Recruitment',
                    value: isVi
                      ? 'Có thể mở hoặc đóng tuyển ngay từ đầu'
                      : 'Start open or private from day one',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl px-4 py-4 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]"
                  >
                    <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--cg-text-muted)]">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm leading-6">{item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="glass-card p-6">
              <h2 className="text-xl font-black font-['Lexend']">
                {isVi ? 'Preset theo chuyên môn' : 'Specialization preset'}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {GUILD_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateForm('type', type)}
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
                    <p className="mt-2 text-[12px] leading-5 text-[color:var(--cg-text-muted)]">
                      {isVi ? TYPE_DESCRIPTIONS[type].vi : TYPE_DESCRIPTIONS[type].en}
                    </p>
                  </button>
                ))}
              </div>
            </aside>
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8">
            <div className="grid xl:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    {isVi ? 'Tên guild' : 'Guild name'}
                  </label>
                  <input
                    value={form.name}
                    onChange={(event) => updateForm('name', event.target.value)}
                    placeholder={isVi ? 'Ví dụ: Pixel Pioneers VN' : 'Ex: Pixel Pioneers VN'}
                    className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    {isVi ? 'Mô tả ngắn' : 'Short description'}
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm('description', event.target.value)
                    }
                    rows={5}
                    placeholder={
                      isVi
                        ? 'Guild này mạnh ở đâu, phù hợp với ai, vibe ra sao?'
                        : 'What is this guild best at, who is it for, and what is the overall vibe?'
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    {isVi ? 'Recruitment pitch' : 'Recruitment pitch'}
                  </label>
                  <textarea
                    value={form.recruitmentPitch}
                    onChange={(event) =>
                      updateForm('recruitmentPitch', event.target.value)
                    }
                    rows={4}
                    placeholder={
                      isVi
                        ? 'Viết một đoạn ngắn đủ cuốn để người khác muốn tham gia.'
                        : 'Write a short, convincing pitch that makes the right people want to join.'
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none resize-none"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      {isVi ? 'Ngôn ngữ / stack' : 'Language / stack'}
                    </label>
                    <input
                      value={form.language}
                      onChange={(event) =>
                        updateForm('language', event.target.value)
                      }
                      placeholder="TypeScript / React"
                      className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      {isVi ? 'Headquarters' : 'Headquarters'}
                    </label>
                    <input
                      value={form.headquarters}
                      onChange={(event) =>
                        updateForm('headquarters', event.target.value)
                      }
                      placeholder={isVi ? 'Ho Chi Minh City' : 'Ho Chi Minh City'}
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
                        updateForm('maxMembers', Number(event.target.value))
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      {isVi ? 'Trạng thái tuyển' : 'Recruitment status'}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateForm('openToJoin', !(form.openToJoin ?? true))
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
                      placeholder={
                        isVi ? 'React, CSS, Design System...' : 'React, CSS, Design System...'
                      }
                      className="flex-1 px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-3 rounded-2xl font-bold"
                      style={{ background: accent, color: '#0f0b3c' }}
                    >
                      {isVi ? 'Thêm' : 'Add'}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(form.tags ?? []).map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => removeTag(tag)}
                        className="px-3 py-1.5 rounded-full text-[12px] font-semibold"
                        style={{
                          background: `${accent}14`,
                          border: `1px solid ${accent}32`,
                          color: accent,
                        }}
                      >
                        {tag} ×
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: `${accent}10`,
                    border: `1px solid ${accent}28`,
                  }}
                >
                  <div className="text-[11px] uppercase tracking-[0.16em] font-bold">
                    {isVi ? 'Preview specialization' : 'Specialization preview'}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span
                      className="material-symbols-outlined"
                      style={{ color: accent }}
                    >
                      {TYPE_ICONS[form.type]}
                    </span>
                    <div>
                      <div className="font-bold">{form.type}</div>
                      <div className="text-sm text-[color:var(--cg-text-muted)]">
                        {isVi ? typeMeta.vi : typeMeta.en}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl px-4 py-3 text-sm text-[#fda4af] border border-[rgba(244,114,182,0.24)] bg-[rgba(244,114,182,0.08)]">
                {error}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl font-bold"
                style={{ background: accent, color: '#0f0b3c' }}
              >
                {submitting
                  ? isVi
                    ? 'Đang tạo guild...'
                    : 'Creating guild...'
                  : isVi
                    ? 'Tạo guild'
                    : 'Create guild'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/guilds')}
                className="px-6 py-3 rounded-xl font-bold border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)]"
              >
                {isVi ? 'Huỷ' : 'Cancel'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
