import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import SideNav from '../../components/SideNav';

interface TrialCondition {
  id: number;
  input: string;
  output: string;
  isHidden: boolean;
}

const API_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api') + '/admin/configs';

export default function CreateBattleProblem() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States thông tin cơ bản
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Novice(Level 1-5)');
  const [questType, setQuestType] = useState('Algorithm Battle');
  const [tags, setTags] = useState<string[]>(['Recursion', 'Data Structures']);
  const [newTag, setNewTag] = useState('');
  const [narrative, setNarrative] = useState('');

  // States Code Editor (Cột phải)
  const [masterSolution, setMasterSolution] = useState(
    `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nconst twoSum = function(nums, target) {\n  // Code của bạn tại đây\n};`
  );
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '// Master solution is empty. Ready for deployment testing.',
  ]);

  // States quản lý Test Cases (Trial Conditions)
  const [trials, setTrials] = useState<TrialCondition[]>([
    {
      id: 1,
      input: 'nums = [2, 7, 11, 15], target = 9',
      output: '[0, 1]',
      isHidden: false,
    },
    {
      id: 2,
      input: 'nums = [3, 2, 4], target = 6',
      output: '[1, 2]',
      isHidden: true,
    },
  ]);

  // Xử lý Tags
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Xử lý Thêm/Xóa/Đổi trạng thái Trial
  const handleAddTrial = () => {
    const newId =
      trials.length > 0 ? Math.max(...trials.map((t) => t.id)) + 1 : 1;
    setTrials([
      ...trials,
      { id: newId, input: '', output: '', isHidden: false },
    ]);
  };
  const handleUpdateTrial = (id: number, fields: Partial<TrialCondition>) => {
    setTrials(trials.map((t) => (t.id === id ? { ...t, ...fields } : t)));
  };

  const handleUpdateTrialByIndex = (
    index: number,
    fields: Partial<TrialCondition>
  ) => {
    setTrials((curTrials) =>
      curTrials.map((trial, i) =>
        i === index ? { ...trial, ...fields } : trial
      )
    );
  };

  // Giả lập chạy thử Master Solution (Run Master Solution)
  const handleRunSolution = () => {
    setConsoleLogs([
      `[${new Date().toLocaleTimeString()}] Running master solution against ${trials.length} trial conditions...`,
      '✔ Trial #1: PASSED (12ms)',
      '✔ Trial #2: PASSED (9ms)',
      '// Master solution is valid and efficient. Ready for deployment.',
    ]);
  };

  // Gửi Dữ liệu thật lên Backend theo đúng cấu trúc Schema AdminConfig
  const handlePublishChallenge = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên thử thách (Challenge Title)!');
      return;
    }

    setIsSubmitting(true);
    // Sinh key duy nhất từ Title
    const generatedKey = `challenge_${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;

    const payload = {
      scope: 'battle',
      key: generatedKey,
      description: `Forge Mode: ${questType} - ${title}`,
      value: {
        title: title,
        difficulty: difficulty.split('(')[0], // Lấy chữ 'Novice', 'Legendary'...
        questType: questType,
        tags: tags,
        narrative: narrative,
        masterSolution: masterSolution,
        trials: trials.map(({ input, output, isHidden }) => ({
          input,
          output,
          isHidden,
        })),
        timesPlayed: '0',
        successRate: 100,
        iconType:
          questType === 'Algorithm Battle' ? 'green_flash' : 'orange_box',
      },
    };

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Đã xuất bản thử thách thành công lên đấu trường!');
        navigate('/admin/battle'); // Điều hướng quay lại danh sách quản lý
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Lỗi xuất bản: ${errData.message || res.statusText}`);
      }
    } catch (err) {
      console.error('Lỗi khi kết nối BE:', err);
      alert('Lỗi kết nối đến server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a2e] text-white font-sans select-none">
      <Header />
      <SideNav />

      <div className="ml-16 mt-12 p-6 flex flex-col gap-4 max-w-[1600px]">
        {/* TOP BAR: Hủy và Xuất bản */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/battle')}
              className="cursor-pointer material-symbols-outlined hover:text-white/70"
            >
              close
            </button>
            <div>
              <p className="text-[10px] font-bold text-orange-500 tracking-wider uppercase">
                Forge Mode
              </p>
              <h2 className="text-sm font-bold -mt-0.5">
                New Battle Challenge
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/battle')}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-white/10"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublishChallenge}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl px-5 py-2 text-xs shadow-lg cursor-pointer hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Challenge'}
            </button>
          </div>
        </div>

        {/* HAI CỘT CHÍNH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: THÔNG TIN (40%) */}
          <div className="lg:col-span-5 flex flex-col gap-5 max-h-[calc(100vh-160px)] overflow-y-auto pr-1">
            {/* 1. Basic Information */}
            <div className="glass-card rounded-2xl p-4 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white/60 tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">info</span>{' '}
                Basic Information
              </h3>

              <div>
                <label className="text-[10px] font-bold text-white/40 block mb-1 uppercase">
                  Challenge Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Serpent's Labyrinth"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#161646] border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/40 block mb-1 uppercase">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-[#161646] border border-white/10 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
                  >
                    <option>Novice(Level 1-5)</option>
                    <option>Competent(Level 6-10)</option>
                    <option>Expert(Level 11+)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 block mb-1 uppercase">
                    Quest Type
                  </label>
                  <select
                    value={questType}
                    onChange={(e) => setQuestType(e.target.value)}
                    className="w-full bg-[#161646] border border-white/10 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
                  >
                    <option>Algorithm Battle</option>
                    <option>Logic Puzzle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 block mb-1 uppercase">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#161646] border border-white/10 rounded-xl">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/10 text-white/80 rounded-lg px-2 py-0.5 text-[10px] flex items-center gap-1"
                    >
                      {tag}
                      <span
                        onClick={() => handleRemoveTag(tag)}
                        className="material-symbols-outlined text-[10px] cursor-pointer hover:text-red-400"
                      >
                        close
                      </span>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="bg-transparent border-none text-xs outline-none flex-1 min-w-[60px]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Quest Narrative */}
            <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white/60 tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    description
                  </span>{' '}
                  Quest Narrative
                </h3>
                <div className="flex gap-2 opacity-40 text-sm">
                  <span className="material-symbols-outlined cursor-pointer">
                    format_bold
                  </span>
                  <span className="material-symbols-outlined cursor-pointer">
                    format_italic
                  </span>
                  <span className="material-symbols-outlined cursor-pointer">
                    link
                  </span>
                </div>
              </div>
              <textarea
                rows={5}
                placeholder="Deep within the Indigo forest lies a maze built of ancient logic... Describe the lore here."
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                className="w-full bg-[#161646] border border-white/10 rounded-xl p-3 text-xs leading-relaxed outline-none resize-none"
              />
            </div>

            {/* 3. Trial Conditions */}
            <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white/60 tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    science
                  </span>{' '}
                  Trial Conditions
                </h3>
                <button
                  onClick={handleAddTrial}
                  className="text-[10px] font-bold text-orange-400 flex items-center gap-0.5 cursor-pointer hover:opacity-80"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    add
                  </span>{' '}
                  Add Trial
                </button>
              </div>

              {trials.map((trial, index) => (
                <div
                  key={trial.id || index}
                  className="border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] rounded-xl p-3 relative flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[color:var(--cg-text-muted)]">
                      TRIAL #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateTrialByIndex(index, {
                          isHidden: !trial.isHidden,
                        })
                      }
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        trial.isHidden
                          ? 'bg-purple-950/40 text-purple-400 border border-purple-800/40'
                          : 'bg-green-950/40 text-[color:var(--cg-green)] border border-[color:var(--cg-border)]'
                      }`}
                    >
                      {trial.isHidden
                        ? 'Hidden (Stress Test)'
                        : 'Visible to User'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-bold text-[color:var(--cg-text-muted)] block uppercase mb-0.5">
                        Input Parameter
                      </label>
                      <input
                        type="text"
                        value={trial.input}
                        onChange={(e) =>
                          handleUpdateTrialByIndex(index, {
                            input: e.target.value,
                          })
                        }
                        className="w-full bg-[color:var(--cg-bg-a72)] border border-[color:var(--cg-border)] text-[color:var(--cg-text)] rounded-lg px-2 py-1 text-[11px] font-mono outline-none focus:border-[color:var(--cg-coral)]"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-[color:var(--cg-text-muted)] block uppercase mb-0.5">
                        Expected Output
                      </label>
                      <input
                        type="text"
                        value={trial.output}
                        onChange={(e) =>
                          handleUpdateTrialByIndex(index, {
                            output: e.target.value,
                          })
                        }
                        className="w-full bg-[color:var(--cg-bg-a72)] border border-[color:var(--cg-border)] text-[color:var(--cg-text)] rounded-lg px-2 py-1 text-[11px] font-mono outline-none focus:border-[color:var(--cg-coral)]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: CODE EDITOR & CONSOLE (60%) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-160px)]">
              <div className="bg-[#11113a] px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs">
                <span className="font-bold text-white/60 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    terminal
                  </span>{' '}
                  Master Solution
                </span>
                <span className="text-[10px] text-white/40 font-mono">
                  JS - JavaScript
                </span>
              </div>

              {/* Code Textarea Area */}
              <textarea
                value={masterSolution}
                onChange={(e) => setMasterSolution(e.target.value)}
                spellCheck={false}
                className="flex-1 bg-[#05051e] p-4 text-xs font-mono leading-relaxed outline-none border-none resize-none text-green-400"
              />

              {/* Console Logs Panel */}
              <div className="bg-[#05051a] border-t border-white/10 p-4 h-48 flex flex-col gap-2 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/5 pb-1 text-[10px]">
                  <span className="font-bold text-white/40">
                    Console Output
                  </span>
                  <button
                    onClick={handleRunSolution}
                    className="text-green-400 font-bold flex items-center gap-1 cursor-pointer hover:opacity-80"
                  >
                    <span className="material-symbols-outlined text-xs">
                      play_arrow
                    </span>{' '}
                    Run Master Solution
                  </button>
                </div>
                <div className="font-mono text-[11px] space-y-1">
                  {consoleLogs.map((log, index) => (
                    <p
                      key={index}
                      className={
                        log.startsWith('✔')
                          ? 'text-green-400'
                          : log.startsWith('[')
                            ? 'text-amber-500'
                            : 'text-white/40'
                      }
                    >
                      {log}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
