import { useState } from 'react';
import Header from '../../components/layout/Header';
import SideNav from '../../components/SideNav';
import { useNavigate } from 'react-router-dom';

type LessonType = 'video' | 'puzzle' | 'lab';

interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  meta: string;
  xp: number;
}

const LESSON_ICON: Record<LessonType, string> = {
  video: 'smart_display',
  puzzle: 'extension',
  lab: 'science',
};

const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  video: 'Video Tutorial',
  puzzle: 'Interactive Puzzle',
  lab: 'Advanced Lab',
};

const DIFFICULTY_LEVELS = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];

const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'Intro to Substitution Ciphers',
    type: 'video',
    meta: '4 mins',
    xp: 50,
  },
  {
    id: 'l2',
    title: 'The Caesar Challenge',
    type: 'puzzle',
    meta: '12 mins',
    xp: 120,
  },
  {
    id: 'l3',
    title: 'Frequency Map Analysis',
    type: 'lab',
    meta: '25 mins',
    xp: 300,
  },
];

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
      style={{ background: checked ? 'var(--cg-coral)' : 'var(--cg-border)' }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

function SectionCard({
  icon,
  title,
  action,
  children,
}: {
  icon: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18, color: 'var(--cg-text-muted)' }}
          >
            {icon}
          </span>
          <h3 className="text-sm font-bold">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// 🛠️ CẬP NHẬT: Thêm onChangeTitle vào định nghĩa Props của LessonRow
function LessonRow({
  lesson,
  onDelete,
  onChangeTitle,
}: {
  lesson: Lesson;
  onDelete: (id: string) => void;
  onChangeTitle: (newTitle: string) => void; // Khai báo prop mới ở đây
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl p-3"
      style={{
        background: 'var(--cg-container-a16)',
        border: '1px solid var(--cg-border)',
      }}
    >
      <span
        className="material-symbols-outlined flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: 'var(--cg-container-a22)',
          color: 'var(--cg-coral)',
          fontSize: 18,
        }}
      >
        {LESSON_ICON[lesson.type]}
      </span>

      <div className="min-w-0 flex-1">
        {/* 🛠️ THAY ĐỔI CỐT LÕI: Biến thẻ <p> thành thẻ <input> để cho phép gõ chữ sửa tên bài học */}
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="w-full bg-transparent border-none text-sm font-semibold outline-none focus:text-[color:var(--cg-coral)]"
          style={{ color: 'var(--cg-text)' }}
        />
        <p className="text-xs mt-0.5" style={{ color: 'var(--cg-text-muted)' }}>
          {LESSON_TYPE_LABEL[lesson.type]} • {lesson.meta}
        </p>
      </div>

      <span
        className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold"
        style={{
          background: 'var(--cg-container-a22)',
          color: 'var(--cg-amber)',
        }}
      >
        {lesson.xp} XP
      </span>

      <button
        onClick={() => onDelete(lesson.id)}
        aria-label={`Xóa ${lesson.title}`}
        className="shrink-0 p-1 cursor-pointer hover:text-red-400 transition-colors"
        style={{ color: 'var(--cg-text-muted)' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          delete
        </span>
      </button>
    </div>
  );
}

export default function NodeDetail() {
  const navigate = useNavigate();

  const [nodeName, setNodeName] = useState('Ancient Cipher Decryption');
  const [description, setDescription] = useState(
    'Master the fundamentals of symmetric encryption and frequency analysis by breaking a series of ancient digital monoliths. Learners will apply cryptanalysis techniques to uncover hidden lore fragments.'
  );
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [difficulty, setDifficulty] = useState(4); // index 0-4, 4 = Expert
  const [tags, setTags] = useState<string[]>([
    'Cryptography',
    'Data Analysis',
    'Logic',
  ]);
  const [newTag, setNewTag] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [publicAccess, setPublicAccess] = useState(true);
  const [coverUrl] = useState(
    'https://images.unsplash.com/photo-1639825988283-39a18db90c1d?q=80&w=800&auto=format&fit=crop'
  );

  const removeLesson = (id: string) =>
    setLessons((cur) => cur.filter((l) => l.id !== id));

  const removeTag = (t: string) => setTags((cur) => cur.filter((x) => x !== t));

  const addTag = () => {
    const val = newTag.trim();
    if (val && !tags.includes(val)) setTags((cur) => [...cur, val]);
    setNewTag('');
    setAddingTag(false);
  };

  const handleUpdateLessonByIndex = (
    index: number,
    updatedFields: Partial<Lesson>
  ) => {
    setLessons((curLessons) =>
      curLessons.map((lesson, i) =>
        i === index ? { ...lesson, ...updatedFields } : lesson
      )
    );
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'var(--cg-bg)', color: 'var(--cg-text)' }}
    >
      <Header />
      <SideNav />

      <div className="ml-16 mt-12 p-6">
        {/* Top bar: back, id, title, actions */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/admin/quest-node')}
              aria-label="go back"
              className="mt-1 flex h-9 w-9 items-center justify-center rounded-full cursor-pointer hover:bg-white/10 transition-colors"
              style={{
                background: 'var(--cg-container-a16)',
                border: '1px solid var(--cg-border)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
              >
                arrow_back
              </span>
            </button>
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    border: '1px solid var(--cg-green)',
                    color: 'var(--cg-green)',
                  }}
                >
                  Active Node
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--cg-text-muted)' }}
                >
                  ID: QL-4092-B
                </span>
              </div>
              <h1 className="text-2xl font-extrabold">{nodeName}</h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              className="rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{
                background: 'var(--cg-container-a16)',
                border: '1px solid var(--cg-border)',
                color: 'var(--cg-text)',
              }}
            >
              Discard Changes
            </button>
            <button className="neon-btn flex items-center gap-2 px-4 py-2.5 text-sm">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                save
              </span>
              Publish Node
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <SectionCard icon="edit_note" title="General Information">
              <div className="mb-4">
                <label
                  className="mb-1.5 block text-xs font-semibold"
                  style={{ color: 'var(--cg-text-muted)' }}
                >
                  Node Name
                </label>
                <input
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--cg-container-a22)',
                    border: '1px solid var(--cg-border)',
                    color: 'var(--cg-text)',
                  }}
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold"
                  style={{ color: 'var(--cg-text-muted)' }}
                >
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl px-3 py-2.5 text-sm leading-relaxed outline-none"
                  style={{
                    background: 'var(--cg-container-a22)',
                    border: '1px solid var(--cg-border)',
                    color: 'var(--cg-text)',
                  }}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon="account_tree"
              title="Curriculum Flow"
              action={
                <button
                  className="flex items-center gap-1 text-sm font-semibold"
                  style={{ color: 'var(--cg-coral)' }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 16 }}
                  >
                    add
                  </span>
                  Add Lesson
                </button>
              }
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-2.5">
                  {lessons.map((lesson, index) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      onDelete={removeLesson}
                      // 🛠️ THAY ĐỔI: Nếu component LessonRow của bạn có ô input sửa tên, hãy truyền prop này vào
                      onChangeTitle={(newTitle) =>
                        handleUpdateLessonByIndex(index, { title: newTitle })
                      }
                    />
                  ))}
                  {/* ... đoạn check độ dài mảng rỗng */}
                </div>
                {lessons.length === 0 && (
                  <p
                    className="py-4 text-center text-sm"
                    style={{ color: 'var(--cg-text-muted)' }}
                  >
                    Chưa có lesson nào.
                  </p>
                )}
              </div>
            </SectionCard>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <div className="glass-card relative overflow-hidden rounded-2xl">
              <img
                src={coverUrl}
                alt="Node cover"
                className="h-56 w-full object-cover"
              />
              <button
                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
                style={{
                  background: 'rgba(15,17,32,0.75)',
                  border: '1px solid var(--cg-border)',
                  color: 'var(--cg-text)',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 16 }}
                >
                  photo_camera
                </span>
                Change Cover
              </button>
            </div>

            <SectionCard icon="tune" title="Node Metrics">
              {/* Difficulty */}
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--cg-text-muted)' }}
                  >
                    Difficulty Level
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: 'var(--cg-amber)' }}
                  >
                    {DIFFICULTY_LEVELS[difficulty]}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {DIFFICULTY_LEVELS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setDifficulty(i)}
                      aria-label={`Set difficulty to ${label}`}
                      className="h-1.5 flex-1 rounded-full transition-colors"
                      style={{
                        background:
                          i === difficulty
                            ? 'var(--cg-amber)'
                            : 'var(--cg-border)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Skill tags */}
              <div className="mb-5">
                <span
                  className="mb-2 block text-xs font-semibold"
                  style={{ color: 'var(--cg-text-muted)' }}
                >
                  Associated Skill Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t} className="badge-green">
                      {t}
                      <button
                        onClick={() => removeTag(t)}
                        aria-label={`Remove ${t}`}
                        className="flex items-center"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 14 }}
                        >
                          close
                        </span>
                      </button>
                    </span>
                  ))}

                  {addingTag ? (
                    <input
                      autoFocus
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      onBlur={addTag}
                      placeholder="Tag name"
                      className="w-28 rounded-full px-3 py-1 text-xs outline-none"
                      style={{
                        background: 'var(--cg-container-a22)',
                        border: '1px solid var(--cg-border)',
                        color: 'var(--cg-text)',
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setAddingTag(true)}
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        border: '1px dashed var(--cg-border)',
                        color: 'var(--cg-text-muted)',
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 14 }}
                      >
                        add
                      </span>
                      Add Tag
                    </button>
                  )}
                </div>
              </div>

              {/* Public access */}
              <div
                className="flex items-center justify-between rounded-xl p-3"
                style={{
                  background: 'var(--cg-container-a16)',
                  border: '1px solid var(--cg-border)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18, color: 'var(--cg-text-muted)' }}
                  >
                    visibility
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Public Access</p>
                    <p
                      className="text-[11px]"
                      style={{ color: 'var(--cg-text-muted)' }}
                    >
                      VISIBLE TO ALL LEARNERS
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={publicAccess}
                  onChange={setPublicAccess}
                />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
