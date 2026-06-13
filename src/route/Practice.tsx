import { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels';
import SideNav from '../components/SideNav';
import { updateNodeProgress } from '../services/learningPathApi';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const STORAGE_KEY = 'cg_survey_v2';

const MOCK_SOLUTIONS = [
  {
    id: 1,
    title: '🔥 Beats 100% | Beginner Friendly ✅ | Hash Map',
    author: 'CodeNinja',
    tags: ['Hash Table', 'JavaScript', 'C++'],
    upvotes: '11.8K',
    views: '2.2M',
  },
  {
    id: 2,
    title: '【Video】Step by Step Easy Solution',
    author: 'niits',
    tags: ['Array', 'Java'],
    upvotes: '3.8K',
    views: '321.1K',
  },
  {
    id: 3,
    title: "3 Method's || C++ || JAVA || PYTHON",
    author: 'Rahul Varma',
    tags: ['Array', 'Hash Table'],
    upvotes: '5K',
    views: '1.1M',
  },
];

const MOCK_SUBMISSIONS = [
  {
    id: 1,
    status: 'Accepted',
    date: 'Jan 24, 2026',
    language: 'JavaScript',
    runtime: '43 ms',
    memory: '14.1 MB',
  },
  {
    id: 2,
    status: 'Accepted',
    date: 'Jan 24, 2026',
    language: 'JavaScript',
    runtime: '47 ms',
    memory: '14 MB',
  },
  {
    id: 3,
    status: 'Wrong Answer',
    date: 'Jan 23, 2026',
    language: 'JavaScript',
    runtime: 'N/A',
    memory: 'N/A',
  },
];

type PracticeItem = {
  title: string;
  description: string;
  concept: string;
  conceptDesc: string;
  taskDesc: string;
  initialCode: string;
};

const PRACTICE_DATA: Record<string, PracticeItem> = {
  'Web & Internet Basics': {
    title: 'Web & Internet Basics',
    description:
      'Understand how the internet works, what HTTP is, and the request-response cycle.',
    concept: 'HTTP Protocol',
    conceptDesc: 'The foundation of data communication for the World Wide Web.',
    taskDesc:
      'Refactor the mock server response to return a 200 OK status instead of 404.',
    initialCode:
      "function handleRequest(req) {\n  return { status: 404, body: 'Not Found' };\n}",
  },
  'Basic HTML Structure': {
    title: 'Basic HTML Structure',
    description:
      'Learn the core tags that make up every HTML document: html, head, and body.',
    concept: 'Semantic HTML',
    conceptDesc: 'Use tags that convey meaning about the content they enclose.',
    taskDesc: 'Wrap the text in a valid HTML5 boilerplate.',
    initialCode: 'Hello World',
  },
  default: {
    title: 'Async / Await Patterns',
    description:
      'Async functions improve the syntax of Promises, letting you write asynchronous code that reads synchronously.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    concept: 'Promise.all()',
    conceptDesc:
      'Use Promise.all() when you want to initiate multiple async operations and wait for all of them.',
    taskDesc:
      'Refactor the legacy callback function on the right to use async/await. Handle potential rejection with a try/catch block.',
    initialCode:
      '/**\n * @param {string} id\n * @return {Promise<Object>}\n */\nasync function loadUserAsync(id) {\n  try {\n    // your code...\n  } catch (e) {\n    throw e;\n  }\n}',
  },
};

type MiniMonaco = {
  editor: {
    defineTheme: (name: string, data: Record<string, unknown>) => void;
  };
};

function handleEditorWillMount(monaco: MiniMonaco) {
  monaco.editor.defineTheme('cg-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#0F0B3C',
      'editor.lineHighlightBackground': '#ffffff0a',
    },
  });
}

const ResizeHandle = () => (
  <PanelResizeHandle className="w-1.5 hover:bg-[#FF7E5F]/30 transition-colors cursor-col-resize active:bg-[#FF7E5F]/50 flex items-center justify-center group z-10 mx-1 rounded-full">
    <div className="w-0.5 h-8 bg-[color:var(--cg-border)] group-hover:bg-[#FF7E5F] rounded-full transition-colors" />
  </PanelResizeHandle>
);

function AccordionComponent({
  title,
  icon,
  id,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: string;
  id: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[color:var(--cg-border)] py-3">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between text-xs font-semibold text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">{icon}</span>
          {title}
        </div>
        <span
          className="material-symbols-outlined text-[18px] transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        >
          expand_more
        </span>
      </button>
      {isOpen && (
        <div className="mt-3 text-xs text-[color:var(--cg-text-muted)] leading-relaxed pl-6 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

const HorizontalResizeHandle = () => (
  <PanelResizeHandle className="h-1.5 hover:bg-[#FF7E5F]/30 transition-colors cursor-row-resize active:bg-[#FF7E5F]/50 flex items-center justify-center group z-10 my-1 rounded-full">
    <div className="h-0.5 w-8 bg-[color:var(--cg-border)] group-hover:bg-[#FF7E5F] rounded-full transition-colors" />
  </PanelResizeHandle>
);

function Practice() {
  const location = useLocation();
  const navigate = useNavigate();
  const { nodeId, nodeTitle } = location.state || {};

  const currentPractice = PRACTICE_DATA[nodeTitle] || PRACTICE_DATA['default'];
  const chapterLabel = useMemo(
    () => `CHAPTER - ${nodeTitle || 'Practice'}`,
    [nodeTitle]
  );

  // UI States
  const [leftTab, setLeftTab] = useState<'description' | 'solutions'>(
    'description'
  );
  const [consoleTab, setConsoleTab] = useState<
    'testcase' | 'testresult' | 'submissions'
  >('testcase');
  const [language, setLanguage] = useState('javascript');
  const [expandedAccordions, setExpandedAccordions] = useState<
    Record<string, boolean>
  >({});

  // Logic States
  const [attempts, setAttempts] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [code, setCode] = useState(() => currentPractice.initialCode);

  useEffect(() => {
    // Defer setting code to avoid synchronous state update inside effect
    setTimeout(() => setCode(currentPractice.initialCode), 0);
  }, [currentPractice.initialCode]);

  const handleReset = () => {
    setCode(currentPractice.initialCode);
  };

  const toggleAccordion = (key: string) => {
    setExpandedAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const surveyData = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore JSON parse errors
      void e;
    }
    return null;
  }, []);

  const maxAttempts = surveyData?.penaltyAcceptance === 'strict' ? 5 : 10;

  useEffect(() => {
    if (isCooldown && cooldownTime > 0) {
      const timer = setInterval(() => setCooldownTime((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    // when cooldown reaches zero, clear the flag in a microtask to avoid sync setState in effect
    if (isCooldown && cooldownTime <= 0) {
      setTimeout(() => setIsCooldown(false), 0);
    }
  }, [isCooldown, cooldownTime]);

  const handleSubmit = async () => {
    if (isLocked || isCooldown || isSubmitting) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= maxAttempts) {
      setIsLocked(true);
    } else if (newAttempts >= 4) {
      setIsCooldown(true);
      setCooldownTime(30);
    } else {
      setIsSubmitting(true);
      try {
        if (nodeId) {
          await updateNodeProgress(nodeId, {
            status: 'completed',
            quizScore: 10,
          });
        }
        alert(
          '🎉 Chúc mừng! Bạn đã hoàn thành bài học: ' + currentPractice.title
        );
        navigate('/learning-path');
      } catch (error) {
        console.error('Lỗi cập nhật tiến độ:', error);
        alert('Có lỗi xảy ra khi lưu tiến độ. Vui lòng thử lại!');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Accordion component is declared below (outside render) to avoid recreating during each render

  return (
    <div className="h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-hidden flex flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 20% 10%,rgba(79,70,229,0.18),transparent 55%),radial-gradient(circle at 78% 22%,rgba(255,126,95,0.14),transparent 58%),radial-gradient(circle at 30% 88%,rgba(255,165,0,0.12),transparent 58%)',
          }}
        />
        <div className="absolute -top-1/4 -left-[15%] h-[620px] w-[620px] rounded-full bg-[#FF7E5F]/8 blur-[160px]" />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px] h-full flex flex-col">
        {/* Header */}
        <header className="h-[64px] px-8 flex-shrink-0 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur-xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-[#ff7e5f]/20 blur-md group-hover:bg-[#ff7e5f]/35 transition-all" />
              <img
                src="/component_2_2x.png"
                alt="CodeForGlory"
                className="relative h-7 w-7 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="font-['Lexend'] text-base font-bold tracking-tight">
              <span className="text-[#FF7E5F]">Code</span>ForGlory
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 text-xs text-[color:var(--cg-text-muted)]">
            <span className="material-symbols-outlined text-[16px]">
              menu_book
            </span>
            <span className="font-semibold">{chapterLabel}</span>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="font-bold text-[color:var(--cg-text)]">
              {currentPractice.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition hover:bg-[color:var(--cg-container-a22)]">
              <span className="material-symbols-outlined text-[16px] text-[#ff7e5f]">
                person
              </span>
            </button>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 p-2 min-h-0 overflow-hidden">
          <PanelGroup orientation="horizontal" className="h-full">
            {/* LEFT PANEL */}
            <Panel
              defaultSize={45}
              minSize={30}
              className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md flex flex-col overflow-hidden"
            >
              {/* Left Tabs */}
              <div className="flex items-center gap-1 px-2 pt-2 border-b border-[color:var(--cg-border)] bg-[#0A0726]/40">
                <button
                  onClick={() => setLeftTab('description')}
                  className={cx(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border-b-2',
                    leftTab === 'description'
                      ? 'text-[#FF7E5F] border-[#FF7E5F]'
                      : 'text-[color:var(--cg-text-muted)] border-transparent hover:text-[color:var(--cg-text)]'
                  )}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    description
                  </span>{' '}
                  Description
                </button>
                <div className="w-px h-4 bg-[color:var(--cg-border)] mx-1" />
                <button
                  onClick={() => setLeftTab('solutions')}
                  className={cx(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border-b-2',
                    leftTab === 'solutions'
                      ? 'text-[#FF7E5F] border-[#FF7E5F]'
                      : 'text-[color:var(--cg-text-muted)] border-transparent hover:text-[color:var(--cg-text)]'
                  )}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    science
                  </span>{' '}
                  Solutions
                </button>
              </div>

              {/* Left Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                {leftTab === 'description' && (
                  <div className="animate-fade-in flex flex-col h-full">
                    <h2 className="font-['Lexend'] text-xl font-bold mb-4">
                      {currentPractice.title}
                    </h2>

                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                        Easy
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[color:var(--cg-text-muted)] bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)]">
                        38.3M Accepted
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[color:var(--cg-text-muted)] bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)]">
                        57.6% Rate
                      </span>
                    </div>

                    <div className="text-sm leading-relaxed text-[color:var(--cg-text)] font-medium whitespace-pre-wrap mb-8">
                      {currentPractice.description}
                    </div>

                    <div className="mb-8">
                      <h3 className="font-['Lexend'] text-sm font-semibold mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#FF7E5F] text-[16px]">
                          target
                        </span>{' '}
                        The Task
                      </h3>
                      <div className="bg-[#0A0726]/40 p-4 rounded-xl border border-[color:var(--cg-border)]">
                        <p className="text-sm text-[color:var(--cg-text-muted)]">
                          {currentPractice.taskDesc}
                        </p>
                      </div>
                    </div>

                    {/* Accordions */}
                    <div className="mt-auto pt-8">
                      <AccordionComponent
                        title="Topics"
                        icon="sell"
                        id="topics"
                        isOpen={!!expandedAccordions['topics']}
                        onToggle={toggleAccordion}
                      >
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 rounded-md bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)]">
                            Array
                          </span>
                          <span className="px-2 py-1 rounded-md bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)]">
                            Hash Table
                          </span>
                        </div>
                      </AccordionComponent>
                      <AccordionComponent
                        title="Companies"
                        icon="domain"
                        id="companies"
                        isOpen={!!expandedAccordions['companies']}
                        onToggle={toggleAccordion}
                      >
                        Frequently asked by: Google, Meta, Amazon, Microsoft.
                      </AccordionComponent>
                      <AccordionComponent
                        title="Hint 1"
                        icon="lightbulb"
                        id="hint1"
                        isOpen={!!expandedAccordions['hint1']}
                        onToggle={toggleAccordion}
                      >
                        {currentPractice.conceptDesc}
                      </AccordionComponent>
                      <AccordionComponent
                        title="Hint 2"
                        icon="lightbulb"
                        id="hint2"
                        isOpen={!!expandedAccordions['hint2']}
                        onToggle={toggleAccordion}
                      >
                        A really brute force way would be to search for all
                        possible pairs of numbers but that would be too slow.
                        Again, it's best to try and think of a hash map.
                      </AccordionComponent>
                      <AccordionComponent
                        title="Similar Questions"
                        icon="format_list_bulleted"
                        id="similar"
                        isOpen={!!expandedAccordions['similar']}
                        onToggle={toggleAccordion}
                      >
                        <div className="flex justify-between items-center py-1 hover:text-[#FF7E5F] cursor-pointer transition-colors">
                          <span>3Sum</span>
                          <span className="text-emerald-400">Medium</span>
                        </div>
                      </AccordionComponent>
                      <AccordionComponent
                        title="Discussion (2K)"
                        icon="forum"
                        id="discussion"
                        isOpen={!!expandedAccordions['discussion']}
                        onToggle={toggleAccordion}
                      >
                        Community discussion goes here.
                      </AccordionComponent>
                    </div>
                  </div>
                )}

                {leftTab === 'solutions' && (
                  <div className="animate-fade-in flex flex-col h-full">
                    {/* Search & Tags */}
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 rounded-lg border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[color:var(--cg-text-muted)]">
                          search
                        </span>
                        <input
                          type="text"
                          placeholder="Search solutions..."
                          className="bg-transparent border-none outline-none text-xs w-full text-[color:var(--cg-text)]"
                        />
                      </div>
                      <button className="rounded-lg bg-[#FF7E5F] text-[#0F0B3C] font-bold text-xs px-3 py-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          add
                        </span>{' '}
                        Share
                      </button>
                    </div>

                    {/* Solutions List */}
                    <div className="flex flex-col gap-3">
                      {MOCK_SOLUTIONS.map((sol) => (
                        <div
                          key={sol.id}
                          className="rounded-xl border border-[color:var(--cg-border)] bg-[#0A0726]/40 p-4 hover:border-[#FF7E5F]/50 transition-colors cursor-pointer group"
                        >
                          <h4 className="text-sm font-bold mb-2 group-hover:text-[#FF7E5F] transition-colors">
                            {sol.title}
                          </h4>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#FF7E5F] to-[#FFA500] flex items-center justify-center text-[10px] text-[#0F0B3C] font-bold">
                              {sol.author[0]}
                            </div>
                            <span className="text-xs text-[color:var(--cg-text-muted)]">
                              {sol.author}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {sol.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md text-[10px] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] border border-[color:var(--cg-border)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-semibold text-[color:var(--cg-text-muted)]">
                            <span className="flex items-center gap-1 hover:text-emerald-400">
                              <span className="material-symbols-outlined text-[14px]">
                                arrow_upward
                              </span>{' '}
                              {sol.upvotes}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">
                                visibility
                              </span>{' '}
                              {sol.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">
                                chat_bubble
                              </span>{' '}
                              240
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Panel>

            <ResizeHandle />

            {/* RIGHT PANEL: Editor & Console Split */}
            <Panel
              defaultSize={55}
              minSize={30}
              className="flex flex-col min-h-0"
            >
              <PanelGroup orientation="vertical">
                {/* TOP: Editor */}
                <Panel
                  defaultSize={65}
                  minSize={20}
                  className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md flex flex-col overflow-hidden"
                >
                  {/* Editor Header */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-[color:var(--cg-border)] bg-[#0A0726]/40">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <span className="material-symbols-outlined text-[14px]">
                          code
                        </span>{' '}
                        Code
                      </span>
                      <div className="h-4 w-px bg-[color:var(--cg-border)] mx-1" />

                      {/* Language Selector */}
                      <div className="relative group">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="appearance-none bg-transparent hover:bg-[color:var(--cg-container-a16)] rounded-md px-2 py-1 pr-6 text-xs font-semibold text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] outline-none cursor-pointer transition-colors"
                        >
                          <option
                            className="text-black bg-white"
                            value="javascript"
                          >
                            JavaScript
                          </option>
                          <option
                            className="text-black bg-white"
                            value="typescript"
                          >
                            TypeScript
                          </option>
                          <option
                            className="text-black bg-white"
                            value="python"
                          >
                            Python
                          </option>
                          <option className="text-black bg-white" value="java">
                            Java
                          </option>
                          <option className="text-black bg-white" value="cpp">
                            C++
                          </option>
                          <option className="text-black bg-white" value="c">
                            C
                          </option>
                          <option
                            className="text-black bg-white"
                            value="csharp"
                          >
                            C#
                          </option>
                          <option className="text-black bg-white" value="ruby">
                            Ruby
                          </option>
                          <option className="text-black bg-white" value="go">
                            Go
                          </option>
                          <option className="text-black bg-white" value="rust">
                            Rust
                          </option>
                          <option className="text-black bg-white" value="php">
                            PHP
                          </option>
                          <option className="text-black bg-white" value="swift">
                            Swift
                          </option>
                          <option
                            className="text-black bg-white"
                            value="kotlin"
                          >
                            Kotlin
                          </option>
                          <option className="text-black bg-white" value="dart">
                            Dart
                          </option>
                          <option className="text-black bg-white" value="scala">
                            Scala
                          </option>
                          <option className="text-black bg-white" value="r">
                            R
                          </option>
                          <option className="text-black bg-white" value="sql">
                            SQL
                          </option>
                          <option className="text-black bg-white" value="html">
                            HTML
                          </option>
                          <option className="text-black bg-white" value="css">
                            CSS
                          </option>
                        </select>
                        <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-[14px] text-[color:var(--cg-text-muted)] pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isLocked && (
                        <span className="flex items-center gap-1 text-red-400 text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">
                            lock
                          </span>{' '}
                          LOCKED
                        </span>
                      )}
                      <div className="flex items-center gap-1 rounded bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--cg-text-muted)]">
                        <span className="material-symbols-outlined text-[12px] text-[#FFA500]">
                          timer
                        </span>
                        ATTEMPT {attempts}/{maxAttempts}
                      </div>
                      <button className="text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition-colors">
                        <span className="material-symbols-outlined text-[16px]">
                          settings
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Monaco Container */}
                  <div className="flex-1 relative">
                    <Editor
                      height="100%"
                      language={language}
                      theme="cg-theme"
                      beforeMount={handleEditorWillMount}
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        scrollBeyondLastLine: false,
                        padding: { top: 16 },
                        lineHeight: 24,
                        renderLineHighlight: 'all',
                      }}
                    />
                  </div>
                </Panel>

                <HorizontalResizeHandle />

                {/* BOTTOM: Console */}
                <Panel
                  defaultSize={35}
                  minSize={20}
                  className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md flex flex-col overflow-hidden"
                >
                  {/* Console Tabs */}
                  <div className="flex items-center gap-1 px-2 pt-2 border-b border-[color:var(--cg-border)] bg-[#0A0726]/40">
                    <button
                      onClick={() => setConsoleTab('testcase')}
                      className={cx(
                        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors border-b-2',
                        consoleTab === 'testcase'
                          ? 'text-emerald-400 border-emerald-400'
                          : 'text-[color:var(--cg-text-muted)] border-transparent hover:text-[color:var(--cg-text)]'
                      )}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        check_box
                      </span>{' '}
                      Testcase
                    </button>
                    <button
                      onClick={() => setConsoleTab('testresult')}
                      className={cx(
                        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors border-b-2',
                        consoleTab === 'testresult'
                          ? 'text-emerald-400 border-emerald-400'
                          : 'text-[color:var(--cg-text-muted)] border-transparent hover:text-[color:var(--cg-text)]'
                      )}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        terminal
                      </span>{' '}
                      Test Result
                    </button>
                    <div className="w-px h-4 bg-[color:var(--cg-border)] mx-1" />
                    <button
                      onClick={() => setConsoleTab('submissions')}
                      className={cx(
                        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors border-b-2',
                        consoleTab === 'submissions'
                          ? 'text-emerald-400 border-emerald-400'
                          : 'text-[color:var(--cg-text-muted)] border-transparent hover:text-[color:var(--cg-text)]'
                      )}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        history
                      </span>{' '}
                      Submissions
                    </button>
                  </div>

                  {/* Console Content */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {consoleTab === 'testcase' && (
                      <div className="p-4 flex-1 flex flex-col items-center justify-center opacity-50">
                        <span className="material-symbols-outlined text-[32px] text-[color:var(--cg-text-muted)] mb-2">
                          code_blocks
                        </span>
                        <p className="text-sm text-[color:var(--cg-text-muted)]">
                          You must run your code first
                        </p>
                      </div>
                    )}

                    {consoleTab === 'testresult' && (
                      <div className="p-4 flex-1 flex flex-col items-center justify-center opacity-50">
                        <p className="text-sm text-[color:var(--cg-text-muted)]">
                          Run code to see test results
                        </p>
                      </div>
                    )}

                    {consoleTab === 'submissions' && (
                      <div className="animate-fade-in text-xs w-full">
                        <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] px-4 py-2 text-[color:var(--cg-text-muted)] font-semibold border-b border-[color:var(--cg-border)] sticky top-0 bg-[color:var(--cg-container-a16)] z-10">
                          <div>Status</div>
                          <div>Language</div>
                          <div>Runtime</div>
                          <div>Memory</div>
                          <div>Notes</div>
                        </div>
                        <div className="flex flex-col">
                          {MOCK_SUBMISSIONS.map((sub, i) => (
                            <div
                              key={sub.id}
                              className={cx(
                                'grid grid-cols-[80px_1fr_1fr_1fr_1fr] px-4 py-3 items-center transition-colors cursor-pointer hover:bg-[color:var(--cg-border)]',
                                i % 2 === 0
                                  ? 'bg-[#0A0726]/20'
                                  : 'bg-transparent'
                              )}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className={cx(
                                    'font-bold',
                                    sub.status === 'Accepted'
                                      ? 'text-emerald-400'
                                      : 'text-red-400'
                                  )}
                                >
                                  {sub.status}
                                </span>
                                <span className="text-[10px] text-[color:var(--cg-text-muted)]">
                                  {sub.date}
                                </span>
                              </div>
                              <div>
                                <span className="px-2 py-0.5 rounded-full bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)] text-[10px] font-semibold">
                                  {sub.language}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[color:var(--cg-text)]">
                                <span className="material-symbols-outlined text-[14px] text-[color:var(--cg-text-muted)]">
                                  schedule
                                </span>{' '}
                                {sub.runtime}
                              </div>
                              <div className="flex items-center gap-1.5 text-[color:var(--cg-text)]">
                                <span className="material-symbols-outlined text-[14px] text-[color:var(--cg-text-muted)]">
                                  memory
                                </span>{' '}
                                {sub.memory}
                              </div>
                              <div>
                                <button className="text-[color:var(--cg-text-muted)] hover:text-[#FF7E5F]">
                                  <span className="material-symbols-outlined text-[16px]">
                                    edit_note
                                  </span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Console Footer (Actions) */}
                  <div className="border-t border-[color:var(--cg-border)] bg-[#0A0726]/60 px-4 py-2.5 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--cg-text-muted)] hover:text-[#FF7E5F] transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          restart_alt
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="rounded-lg border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-1.5 text-xs font-bold transition hover:bg-[color:var(--cg-container-a22)]"
                      >
                        Run
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={cx(
                          'px-5 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2',
                          isLocked
                            ? 'bg-red-500/20 text-red-300 cursor-not-allowed border border-red-500/30'
                            : isCooldown
                              ? 'bg-orange-500/20 text-orange-300 cursor-not-allowed border border-orange-500/30'
                              : isSubmitting
                                ? 'bg-gray-500/20 text-gray-300 cursor-wait border border-gray-500/30'
                                : 'bg-[#FF7E5F] hover:bg-[#ff8f75] text-[#0F0B3C] shadow-[0_0_15px_rgba(255,126,95,0.4)]'
                        )}
                      >
                        {isSubmitting ? (
                          <span className="material-symbols-outlined animate-spin text-[14px]">
                            refresh
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px]">
                            cloud_upload
                          </span>
                        )}
                        {isLocked
                          ? 'LOCKED'
                          : isCooldown
                            ? `WAIT ${cooldownTime}s`
                            : isSubmitting
                              ? 'SUBMITTING...'
                              : `Submit`}
                      </button>
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </main>
      </div>
    </div>
  );
}

export default Practice;
