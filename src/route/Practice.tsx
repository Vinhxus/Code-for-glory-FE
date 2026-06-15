import { useMemo, useState, useEffect, useRef } from 'react';
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
const PRACTICE_LANG_KEY = 'cg_practice_language_v1';

type PracticeLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'ruby'
  | 'go'
  | 'rust'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'dart'
  | 'scala'
  | 'r'
  | 'sql'
  | 'html'
  | 'css';

type LanguageConfig = { label: string; monaco: string };

const LANGUAGE_CONFIG: Record<PracticeLanguage, LanguageConfig> = {
  javascript: { label: 'JavaScript', monaco: 'javascript' },
  typescript: { label: 'TypeScript', monaco: 'typescript' },
  python: { label: 'Python', monaco: 'python' },
  java: { label: 'Java', monaco: 'java' },
  cpp: { label: 'C++', monaco: 'cpp' },
  c: { label: 'C', monaco: 'c' },
  csharp: { label: 'C#', monaco: 'csharp' },
  ruby: { label: 'Ruby', monaco: 'ruby' },
  go: { label: 'Go', monaco: 'go' },
  rust: { label: 'Rust', monaco: 'rust' },
  php: { label: 'PHP', monaco: 'php' },
  // Monaco mặc định không có highlight cho các ngôn ngữ dưới đây; fallback về plaintext
  swift: { label: 'Swift', monaco: 'plaintext' },
  kotlin: { label: 'Kotlin', monaco: 'plaintext' },
  dart: { label: 'Dart', monaco: 'plaintext' },
  scala: { label: 'Scala', monaco: 'plaintext' },
  r: { label: 'R', monaco: 'plaintext' },
  sql: { label: 'SQL', monaco: 'sql' },
  html: { label: 'HTML', monaco: 'html' },
  css: { label: 'CSS', monaco: 'css' },
};

function safeReadPracticeLanguage(): PracticeLanguage {
  try {
    const raw = localStorage.getItem(PRACTICE_LANG_KEY);
    if (!raw) return 'javascript';
    if (raw in LANGUAGE_CONFIG) return raw as PracticeLanguage;
    return 'javascript';
  } catch {
    return 'javascript';
  }
}

function safeWritePracticeLanguage(lang: PracticeLanguage) {
  try {
    localStorage.setItem(PRACTICE_LANG_KEY, lang);
  } catch {
    // ignore
  }
}

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

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Track = 'Frontend' | 'Backend';

type PracticeCatalogItem = {
  id: string;
  title: string;
  summary: string;
  topic: string;
  difficulty: Difficulty;
  track: Track;
  acceptanceRate: string;
  solvedCount: string;
  estimatedTime: string;
  tags: string[];
};

const PRACTICE_CATALOG: PracticeCatalogItem[] = [
  {
    id: 'fe-html-structure',
    title: 'Basic HTML Structure',
    summary:
      'Build a semantic landing page shell with clean section hierarchy.',
    topic: 'HTML & Semantics',
    difficulty: 'Easy',
    track: 'Frontend',
    acceptanceRate: '91.2%',
    solvedCount: '18.4K',
    estimatedTime: '12 min',
    tags: ['HTML', 'Semantics', 'Accessibility'],
  },
  {
    id: 'fe-responsive-layout',
    title: 'Responsive Layout Sprint',
    summary: 'Translate a dashboard wireframe into a responsive layout.',
    topic: 'CSS & Layout',
    difficulty: 'Easy',
    track: 'Frontend',
    acceptanceRate: '84.7%',
    solvedCount: '14.1K',
    estimatedTime: '18 min',
    tags: ['CSS', 'Responsive', 'Flexbox'],
  },
  {
    id: 'fe-react-state',
    title: 'React State Patterns',
    summary: 'Refactor component state into a clearer single source of truth.',
    topic: 'React',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '63.9%',
    solvedCount: '11.6K',
    estimatedTime: '24 min',
    tags: ['React', 'Hooks', 'State'],
  },
  {
    id: 'fe-accessible-form',
    title: 'Accessible Form Validation',
    summary: 'Improve field semantics, errors, and keyboard-friendly UX.',
    topic: 'Accessibility',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '58.4%',
    solvedCount: '7.3K',
    estimatedTime: '20 min',
    tags: ['Accessibility', 'Forms', 'UX'],
  },
  {
    id: 'fe-dashboard-fetch',
    title: 'Fetch Dashboard Metrics',
    summary:
      'Coordinate concurrent API calls and present stable loading states.',
    topic: 'API Integration',
    difficulty: 'Hard',
    track: 'Frontend',
    acceptanceRate: '47.2%',
    solvedCount: '5.9K',
    estimatedTime: '28 min',
    tags: ['Async', 'API', 'UI State'],
  },
  {
    id: 'be-http-basics',
    title: 'Web & Internet Basics',
    summary: 'Fix the request-response contract for a basic server handler.',
    topic: 'HTTP Fundamentals',
    difficulty: 'Easy',
    track: 'Backend',
    acceptanceRate: '89.1%',
    solvedCount: '16.9K',
    estimatedTime: '10 min',
    tags: ['HTTP', 'API', 'Backend'],
  },
  {
    id: 'be-rest-endpoint',
    title: 'REST Endpoint Status Flow',
    summary: 'Return the right status code and payload for each branch.',
    topic: 'API Design',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '61.3%',
    solvedCount: '10.2K',
    estimatedTime: '22 min',
    tags: ['REST', 'Status Code', 'Node.js'],
  },
  {
    id: 'be-jwt-guard',
    title: 'JWT Session Guard',
    summary: 'Protect a route with clearer auth and authorization boundaries.',
    topic: 'Authentication',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '55.8%',
    solvedCount: '8.4K',
    estimatedTime: '26 min',
    tags: ['JWT', 'Security', 'Middleware'],
  },
  {
    id: 'be-sql-analytics',
    title: 'SQL Analytics Snapshot',
    summary: 'Aggregate activity data into a ranked analytics summary.',
    topic: 'Database',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '42.6%',
    solvedCount: '4.7K',
    estimatedTime: '30 min',
    tags: ['SQL', 'Aggregation', 'Analytics'],
  },
  {
    id: 'be-async-worker',
    title: 'Async Queue Worker',
    summary:
      'Refactor a callback-heavy background job into readable async flow.',
    topic: 'Concurrency',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '39.8%',
    solvedCount: '3.9K',
    estimatedTime: '32 min',
    tags: ['Async', 'Queues', 'Reliability'],
  },
];

function getInitialCodeForPractice(
  practiceKey: string,
  lang: PracticeLanguage
): string {
  // NOTE: Đây là “starter code” theo ngôn ngữ. App hiện chưa có engine chạy code,
  // nên mục tiêu ở đây là đổi template và highlight phù hợp khi đổi dropdown.
  switch (practiceKey) {
    case 'Web & Internet Basics': {
      const variants: Partial<Record<PracticeLanguage, string>> = {
        javascript:
          "function handleRequest(req) {\n  return { status: 404, body: 'Not Found' };\n}\n",
        typescript:
          "type Response = { status: number; body: string };\n\nfunction handleRequest(req: unknown): Response {\n  return { status: 404, body: 'Not Found' };\n}\n",
        python:
          'def handle_request(req):\n    # TODO: return status 200 instead of 404\n    return {"status": 404, "body": "Not Found"}\n',
        java: 'class Solution {\n  static class Response {\n    int status;\n    String body;\n    Response(int status, String body) { this.status = status; this.body = body; }\n  }\n\n  Response handleRequest(Object req) {\n    // TODO: return status 200 instead of 404\n    return new Response(404, "Not Found");\n  }\n}\n',
        cpp: '#include <string>\n\nstruct Response {\n  int status;\n  std::string body;\n};\n\nResponse handleRequest(void* req) {\n  // TODO: return status 200 instead of 404\n  return {404, "Not Found"};\n}\n',
        c: '/* C starter template (pseudo) */\n/* TODO: return status 200 instead of 404 */\n',
        csharp:
          'public class Solution {\n  public record Response(int Status, string Body);\n\n  public Response HandleRequest(object req) {\n    // TODO: return status 200 instead of 404\n    return new Response(404, "Not Found");\n  }\n}\n',
        go: 'package main\n\ntype Response struct {\n  Status int\n  Body   string\n}\n\nfunc handleRequest(req any) Response {\n  // TODO: return status 200 instead of 404\n  return Response{Status: 404, Body: "Not Found"}\n}\n',
        rust: '#[derive(Debug)]\nstruct Response {\n  status: i32,\n  body: String,\n}\n\nfn handle_request(_req: ()) -> Response {\n  // TODO: return status 200 instead of 404\n  Response { status: 404, body: "Not Found".into() }\n}\n',
        php: '<?php\nfunction handleRequest($req) {\n  // TODO: return status 200 instead of 404\n  return ["status" => 404, "body" => "Not Found"]; \n}\n',
        ruby: "def handle_request(req)\n  # TODO: return status 200 instead of 404\n  { status: 404, body: 'Not Found' }\nend\n",
        sql: '-- SQL không phù hợp cho bài này. Dùng pseudo:\n-- TODO: return 200 OK\n',
        html: '<!-- Bài này không phù hợp HTML. -->\n',
        css: '/* Bài này không phù hợp CSS. */\n',
      };
      return variants[lang] ?? variants.javascript ?? '';
    }
    case 'Basic HTML Structure': {
      const html = `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>Practice</title>\n  </head>\n  <body>\n    Hello World\n  </body>\n</html>\n`;
      const css = `/* TODO: style your page */\nbody {\n  font-family: system-ui, sans-serif;\n}\n`;
      const variants: Partial<Record<PracticeLanguage, string>> = {
        html,
        css,
        javascript:
          '// Bài này phù hợp HTML/CSS hơn.\n// Tip: chuyển dropdown sang HTML để làm.\n',
        typescript:
          '// Bài này phù hợp HTML/CSS hơn.\n// Tip: chuyển dropdown sang HTML để làm.\n',
      };
      return variants[lang] ?? html;
    }
    default: {
      const variants: Partial<Record<PracticeLanguage, string>> = {
        javascript:
          '/**\n * @param {string} id\n * @return {Promise<Object>}\n */\nasync function loadUserAsync(id) {\n  try {\n    // your code...\n  } catch (e) {\n    throw e;\n  }\n}\n',
        typescript:
          'type User = Record<string, unknown>;\n\nasync function loadUserAsync(id: string): Promise<User> {\n  try {\n    // your code...\n    return {};\n  } catch (e) {\n    throw e;\n  }\n}\n',
        python:
          'import asyncio\n\nasync def load_user_async(user_id: str) -> dict:\n    try:\n        # your code...\n        return {}\n    except Exception as e:\n        raise e\n',
        java: 'import java.util.*;\n\nclass Solution {\n  // Pseudo async (Java dùng CompletableFuture)\n  java.util.concurrent.CompletableFuture<Map<String, Object>> loadUserAsync(String id) {\n    return java.util.concurrent.CompletableFuture.supplyAsync(() -> {\n      // your code...\n      return new HashMap<>();\n    });\n  }\n}\n',
        cpp: '// C++ pseudo async (std::future)\n// TODO: implement\n',
        c: '/* C không có async/await. Đây là pseudo template. */\n',
        csharp:
          'using System;\nusing System.Collections.Generic;\nusing System.Threading.Tasks;\n\npublic class Solution {\n  public async Task<Dictionary<string, object>> LoadUserAsync(string id) {\n    try {\n      // your code...\n      return new Dictionary<string, object>();\n    } catch (Exception e) {\n      throw;\n    }\n  }\n}\n',
        go: '// Go dùng goroutine/channel thay cho async/await.\n// TODO: implement\n',
        rust: '// Rust async/await (pseudo)\n// async fn load_user_async(id: String) -> std::collections::HashMap<String, String> { ... }\n',
        php: '<?php\n// PHP async phụ thuộc runtime (Swoole/ReactPHP). Dùng pseudo.\n',
        ruby: '# Ruby async phụ thuộc runtime (Fiber). Dùng pseudo.\n',
        sql: '-- SQL không phù hợp cho bài async/await.\n',
        html: '<!-- Bài này không phù hợp HTML. -->\n',
        css: '/* Bài này không phù hợp CSS. */\n',
      };
      return variants[lang] ?? variants.javascript ?? '';
    }
  }
}

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

function getDifficultyBadgeClass(difficulty: Difficulty) {
  switch (difficulty) {
    case 'Easy':
      return 'text-emerald-300 bg-emerald-500/10 border border-emerald-400/20';
    case 'Medium':
      return 'text-amber-300 bg-amber-500/10 border border-amber-400/20';
    case 'Hard':
      return 'text-rose-300 bg-rose-500/10 border border-rose-400/20';
    default:
      return 'text-[color:var(--cg-text-muted)] bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)]';
  }
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

  const isHubView = !nodeTitle;
  const selectedCatalogItem = useMemo(
    () => PRACTICE_CATALOG.find((item) => item.title === nodeTitle),
    [nodeTitle]
  );
  const practiceKey =
    nodeTitle && PRACTICE_DATA[nodeTitle] ? nodeTitle : 'default';
  const basePractice = PRACTICE_DATA[practiceKey] || PRACTICE_DATA['default'];
  const currentPractice = useMemo(
    () =>
      nodeTitle && !PRACTICE_DATA[nodeTitle]
        ? { ...basePractice, title: nodeTitle }
        : basePractice,
    [basePractice, nodeTitle]
  );
  const chapterLabel = useMemo(() => {
    if (selectedCatalogItem) {
      return `${selectedCatalogItem.track} · ${selectedCatalogItem.topic}`;
    }
    return `CHAPTER - ${nodeTitle || 'Practice'}`;
  }, [nodeTitle, selectedCatalogItem]);

  // UI States
  const [leftTab, setLeftTab] = useState<'description' | 'solutions'>(
    'description'
  );
  const [consoleTab, setConsoleTab] = useState<
    'testcase' | 'testresult' | 'submissions'
  >('testcase');
  const [language, setLanguage] = useState<PracticeLanguage>(() =>
    safeReadPracticeLanguage()
  );
  const [expandedAccordions, setExpandedAccordions] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<'All' | Track>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'All' | Difficulty
  >('All');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');

  // Logic States
  const [attempts, setAttempts] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [code, setCode] = useState(() =>
    getInitialCodeForPractice(practiceKey, language)
  );

  const monacoLanguage = useMemo(
    () => LANGUAGE_CONFIG[language]?.monaco ?? 'plaintext',
    [language]
  );

  const prevPracticeKeyRef = useRef<string>(practiceKey);
  const lastStarterRef = useRef<string>(
    getInitialCodeForPractice(practiceKey, language)
  );

  useEffect(() => {
    // Chỉ reset code khi đổi bài (nodeTitle), không reset khi đổi ngôn ngữ.
    if (prevPracticeKeyRef.current !== practiceKey) {
      prevPracticeKeyRef.current = practiceKey;
      const starter = getInitialCodeForPractice(practiceKey, language);
      lastStarterRef.current = starter;
      setTimeout(() => setCode(starter), 0);
    }
  }, [practiceKey, language]);

  const handleChangeLanguage = (next: PracticeLanguage) => {
    const prev = language;
    if (next === prev) return;

    const prevStarter = getInitialCodeForPractice(practiceKey, prev);
    const nextStarter = getInitialCodeForPractice(practiceKey, next);

    // Nếu user chưa sửa code (hoặc đang trống), đổi starter code tự động.
    // Nếu đã sửa, hỏi xác nhận để tránh mất công.
    const hasUserEdits =
      code.trim() !== '' && code.trim() !== prevStarter.trim();
    if (hasUserEdits) {
      const ok = window.confirm(
        'Bạn đã sửa code hiện tại. Đổi ngôn ngữ sẽ thay code mẫu theo ngôn ngữ mới.\n\nOK: đổi và thay code mẫu\nCancel: chỉ đổi ngôn ngữ, giữ nguyên code'
      );
      if (ok) {
        setCode(nextStarter);
        lastStarterRef.current = nextStarter;
      }
    } else {
      setCode(nextStarter);
      lastStarterRef.current = nextStarter;
    }

    setLanguage(next);
    safeWritePracticeLanguage(next);
  };

  const handleReset = () => {
    const starter = getInitialCodeForPractice(practiceKey, language);
    setCode(starter);
    lastStarterRef.current = starter;
  };

  const handleOpenPractice = (item: PracticeCatalogItem) => {
    navigate('/practice', {
      state: { nodeId: item.id, nodeTitle: item.title },
    });
  };

  const handleBackToHub = () => {
    navigate('/practice');
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
  const frontendCount = useMemo(
    () => PRACTICE_CATALOG.filter((item) => item.track === 'Frontend').length,
    []
  );
  const backendCount = useMemo(
    () => PRACTICE_CATALOG.filter((item) => item.track === 'Backend').length,
    []
  );
  const topicStats = useMemo(() => {
    const counts = new Map<string, number>();
    PRACTICE_CATALOG.forEach((item) => {
      counts.set(item.topic, (counts.get(item.topic) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([topic, count]) => ({
      topic,
      count,
    }));
  }, []);
  const filteredPractices = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return PRACTICE_CATALOG.filter((item) => {
      const matchesTrack =
        selectedTrack === 'All' ? true : item.track === selectedTrack;
      const matchesDifficulty =
        selectedDifficulty === 'All'
          ? true
          : item.difficulty === selectedDifficulty;
      const matchesTopic =
        selectedTopic === 'All Topics' ? true : item.topic === selectedTopic;
      const matchesSearch = keyword
        ? [item.title, item.summary, item.topic, item.track, ...item.tags]
            .join(' ')
            .toLowerCase()
            .includes(keyword)
        : true;
      return matchesTrack && matchesDifficulty && matchesTopic && matchesSearch;
    });
  }, [searchQuery, selectedTrack, selectedDifficulty, selectedTopic]);

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

  if (isHubView) {
    return (
      <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 20% 10%,rgba(79,70,229,0.18),transparent 55%),radial-gradient(circle at 78% 22%,rgba(255,126,95,0.14),transparent 58%),radial-gradient(circle at 30% 88%,rgba(255,165,0,0.12),transparent 58%)',
            }}
          />
          <div className="absolute -top-1/4 -left-[15%] h-[620px] w-[620px] rounded-full bg-[#FF7E5F]/8 blur-[160px]" />
          <div className="absolute right-0 top-[12%] h-[460px] w-[460px] rounded-full bg-[#4F46E5]/12 blur-[150px]" />
        </div>

        <SideNav />

        <div className="relative z-10 min-h-screen md:pl-[96px]">
          <header className="sticky top-0 z-20 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur-xl">
            <div className="flex min-h-[76px] items-center justify-between gap-4 px-6 py-4 lg:px-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 rounded-lg bg-[#ff7e5f]/20 blur-md group-hover:bg-[#ff7e5f]/35 transition-all" />
                  <img
                    src="/component_2_2x.png"
                    alt="CodeForGlory"
                    className="relative h-8 w-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <div className="font-['Lexend'] text-base font-bold tracking-tight">
                    <span className="text-[#FF7E5F]">Code</span>ForGlory
                  </div>
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                    PRACTICE HUB
                  </div>
                </div>
              </Link>

              <div className="hidden md:flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTrack('All');
                    setSelectedDifficulty('All');
                    setSelectedTopic('All Topics');
                  }}
                  className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2 text-xs font-semibold text-[color:var(--cg-text-muted)] transition hover:bg-[color:var(--cg-container-a22)] hover:text-[color:var(--cg-text)]"
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenPractice(
                      filteredPractices[0] || PRACTICE_CATALOG[0]
                    )
                  }
                  className="rounded-xl bg-[#FF7E5F] px-4 py-2 text-xs font-bold text-[#0F0B3C] shadow-[0_12px_36px_rgba(255,126,95,0.28)] transition hover:bg-[#ff8f75]"
                >
                  Start practicing
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-8 lg:px-8">
            <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-[28px] border border-[color:var(--cg-border)] bg-[linear-gradient(135deg,rgba(17,24,39,0.88),rgba(44,37,103,0.72))] p-6 shadow-[0_36px_120px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="badge-coral">CURATED PRACTICE</span>
                  <span className="badge-purple">FRONTEND + BACKEND</span>
                </div>
                <h1 className="mt-5 max-w-3xl font-['Lexend'] text-3xl font-bold tracking-tight md:text-4xl">
                  Browse problems by topic before entering the code workspace.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--cg-text-muted)] md:text-[15px]">
                  The first practice page now behaves like a proper problem hub:
                  curated lists, topic chips, filters, difficulty breakdown, and
                  cleaner discovery flow inspired by coding platforms.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenPractice(PRACTICE_CATALOG[0])}
                    className="rounded-2xl bg-[#FF7E5F] px-5 py-3 text-sm font-bold text-[#0F0B3C] shadow-[0_18px_60px_rgba(255,126,95,0.25)] transition hover:bg-[#ff9077]"
                  >
                    Open first challenge
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack('Frontend')}
                    className="rounded-2xl border border-[color:var(--cg-border)] bg-white/5 px-5 py-3 text-sm font-semibold text-[color:var(--cg-text)] transition hover:bg-white/10"
                  >
                    Frontend topics
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack('Backend')}
                    className="rounded-2xl border border-[color:var(--cg-border)] bg-white/5 px-5 py-3 text-sm font-semibold text-[color:var(--cg-text)] transition hover:bg-white/10"
                  >
                    Backend topics
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[24px] border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-5 backdrop-blur-xl">
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                    TOTAL PROBLEMS
                  </div>
                  <div className="mt-3 text-4xl font-bold">
                    {PRACTICE_CATALOG.length}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                    Polished practice catalog instead of jumping straight into
                    the editor.
                  </p>
                </div>
                <div className="rounded-[24px] border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-5 backdrop-blur-xl">
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                    TRACK SPLIT
                  </div>
                  <div className="mt-3 flex items-end gap-5">
                    <div>
                      <div className="text-2xl font-bold text-emerald-300">
                        {frontendCount}
                      </div>
                      <div className="text-[11px] text-[color:var(--cg-text-muted)]">
                        Frontend
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-sky-300">
                        {backendCount}
                      </div>
                      <div className="text-[11px] text-[color:var(--cg-text-muted)]">
                        Backend
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                    Organized for topic-based exploration similar to
                    LeetCode-style browsing.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-6 backdrop-blur-xl">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                    TOPIC DIRECTORY
                  </div>
                  <h2 className="mt-2 font-['Lexend'] text-2xl font-semibold tracking-tight">
                    Discover challenges by topic
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--cg-text-muted)]">
                    Topic pills are intentionally dense and scannable so users
                    can browse the catalog the same way they browse algorithm
                    categories.
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[#0A0726]/40 px-4 py-3 text-xs font-semibold text-[color:var(--cg-text-muted)]">
                  {filteredPractices.length}/{PRACTICE_CATALOG.length} visible
                  problems
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTopic('All Topics')}
                  className={cx(
                    'rounded-full border px-4 py-2 text-sm font-semibold transition',
                    selectedTopic === 'All Topics'
                      ? 'border-white/20 bg-white text-[#0F0B3C]'
                      : 'border-[color:var(--cg-border)] bg-white/5 text-[color:var(--cg-text-muted)] hover:bg-white/10 hover:text-[color:var(--cg-text)]'
                  )}
                >
                  All Topics
                </button>
                {topicStats.map(({ topic, count }) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className={cx(
                      'rounded-full border px-4 py-2 text-sm font-semibold transition',
                      selectedTopic === topic
                        ? 'border-[#FF7E5F]/35 bg-[#FF7E5F] text-[#0F0B3C]'
                        : 'border-[color:var(--cg-border)] bg-white/5 text-[color:var(--cg-text)] hover:border-[#FF7E5F]/25 hover:bg-white/10'
                    )}
                  >
                    {topic}
                    <span
                      className={cx(
                        'ml-2 rounded-full px-2 py-0.5 text-[11px]',
                        selectedTopic === topic
                          ? 'bg-black/10 text-[#0F0B3C]'
                          : 'bg-black/20 text-[color:var(--cg-text-muted)]'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-[24px] border border-emerald-400/15 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(15,11,60,0.08))] p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.24em] text-emerald-300/80">
                      FRONTEND PATH
                    </div>
                    <h3 className="mt-2 text-xl font-semibold">
                      UI engineering topics
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-right">
                    <div className="text-2xl font-bold text-emerald-300">
                      {frontendCount}
                    </div>
                    <div className="text-[11px] text-emerald-100/70">
                      problems
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    'HTML & Semantics',
                    'CSS & Layout',
                    'React',
                    'Accessibility',
                    'API Integration',
                  ].map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-sky-400/15 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(15,11,60,0.08))] p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.24em] text-sky-300/80">
                      BACKEND PATH
                    </div>
                    <h3 className="mt-2 text-xl font-semibold">
                      Service and data topics
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-right">
                    <div className="text-2xl font-bold text-sky-300">
                      {backendCount}
                    </div>
                    <div className="text-[11px] text-sky-100/70">problems</div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    'HTTP Fundamentals',
                    'API Design',
                    'Authentication',
                    'Database',
                    'Concurrency',
                  ].map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-sky-400/15 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-200"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-6 backdrop-blur-xl">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                    PROBLEM LIST
                  </div>
                  <h2 className="mt-2 font-['Lexend'] text-2xl font-semibold tracking-tight">
                    Browse, filter, then open a workspace
                  </h2>
                </div>

                <div className="flex flex-col gap-3 xl:min-w-[640px] xl:flex-row">
                  <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[color:var(--cg-border)] bg-[#0A0726]/40 px-4 py-3">
                    <span className="material-symbols-outlined text-[18px] text-[color:var(--cg-text-muted)]">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search challenges, topics, or tags..."
                      className="w-full bg-transparent text-sm text-[color:var(--cg-text)] outline-none placeholder:text-[color:var(--cg-text-muted)]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(['All', 'Frontend', 'Backend'] as const).map((track) => (
                      <button
                        key={track}
                        type="button"
                        onClick={() => setSelectedTrack(track)}
                        className={cx(
                          'rounded-2xl border px-4 py-3 text-xs font-semibold transition',
                          selectedTrack === track
                            ? 'border-[#FF7E5F]/35 bg-[#FF7E5F] text-[#0F0B3C]'
                            : 'border-[color:var(--cg-border)] bg-[#0A0726]/40 text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]'
                        )}
                      >
                        {track}
                      </button>
                    ))}
                    {(['All', 'Easy', 'Medium', 'Hard'] as const).map(
                      (level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSelectedDifficulty(level)}
                          className={cx(
                            'rounded-2xl border px-4 py-3 text-xs font-semibold transition',
                            selectedDifficulty === level
                              ? 'border-white/20 bg-white text-[#0F0B3C]'
                              : 'border-[color:var(--cg-border)] bg-[#0A0726]/40 text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]'
                          )}
                        >
                          {level}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-[color:var(--cg-border)]">
                <div className="hidden grid-cols-[minmax(0,1.8fr)_120px_110px_120px_120px] gap-4 bg-[#0A0726]/65 px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[color:var(--cg-text-muted)] md:grid">
                  <div>Problem</div>
                  <div>Track</div>
                  <div>Difficulty</div>
                  <div>Acceptance</div>
                  <div>Action</div>
                </div>

                <div className="divide-y divide-[color:var(--cg-border)] bg-[rgba(8,8,26,0.24)]">
                  {filteredPractices.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleOpenPractice(item)}
                      className="grid w-full gap-4 px-5 py-5 text-left transition hover:bg-white/5 md:grid-cols-[minmax(0,1.8fr)_120px_110px_120px_120px]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-semibold text-[color:var(--cg-text-muted)]">
                            {String(index + 1).padStart(2, '0')}.
                          </span>
                          <h3 className="truncate text-sm font-bold md:text-[15px]">
                            {item.title}
                          </h3>
                        </div>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--cg-text-muted)]">
                          {item.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-1 text-[11px] font-semibold text-[color:var(--cg-text-muted)]">
                            {item.topic}
                          </span>
                          <span className="rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-1 text-[11px] font-semibold text-[color:var(--cg-text-muted)]">
                            {item.estimatedTime}
                          </span>
                          <span className="rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-1 text-[11px] font-semibold text-[color:var(--cg-text-muted)]">
                            {item.solvedCount} solved
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start md:items-center">
                        <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-200">
                          {item.track}
                        </span>
                      </div>

                      <div className="flex items-start md:items-center">
                        <span
                          className={cx(
                            'rounded-full px-3 py-1.5 text-xs font-semibold',
                            getDifficultyBadgeClass(item.difficulty)
                          )}
                        >
                          {item.difficulty}
                        </span>
                      </div>

                      <div className="flex items-start text-sm font-semibold text-[color:var(--cg-text)] md:items-center">
                        {item.acceptanceRate}
                      </div>

                      <div className="flex items-start md:items-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF7E5F]/25 bg-[#FF7E5F]/10 px-3 py-1.5 text-xs font-semibold text-[#FFB29F]">
                          Open
                          <span className="material-symbols-outlined text-[14px]">
                            arrow_forward
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}

                  {filteredPractices.length === 0 && (
                    <div className="px-5 py-14 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)]">
                        <span className="material-symbols-outlined text-[24px] text-[color:var(--cg-text-muted)]">
                          search_off
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">
                        No matching problems
                      </h3>
                      <p className="mt-2 text-sm text-[color:var(--cg-text-muted)]">
                        Try another topic or clear the current filters.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

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
        <header className="h-[64px] px-5 md:px-8 flex-shrink-0 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBackToHub}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-2 text-xs font-semibold text-[color:var(--cg-text-muted)] transition hover:bg-[color:var(--cg-container-a22)] hover:text-[color:var(--cg-text)]"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              All problems
            </button>

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
          </div>

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

                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                      <span
                        className={cx(
                          'px-2 py-0.5 rounded text-[10px] font-bold',
                          getDifficultyBadgeClass(
                            selectedCatalogItem?.difficulty || 'Easy'
                          )
                        )}
                      >
                        {selectedCatalogItem?.difficulty || 'Easy'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[color:var(--cg-text-muted)] bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)]">
                        {selectedCatalogItem?.solvedCount || '38.3M'} Accepted
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[color:var(--cg-text-muted)] bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)]">
                        {selectedCatalogItem?.acceptanceRate || '57.6%'} Rate
                      </span>
                      {selectedCatalogItem?.track && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-sky-300 bg-sky-500/10 border border-sky-400/20">
                          {selectedCatalogItem.track}
                        </span>
                      )}
                      {selectedCatalogItem?.topic && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[color:var(--cg-text-muted)] bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)]">
                          {selectedCatalogItem.topic}
                        </span>
                      )}
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
                          {(
                            selectedCatalogItem?.tags || ['Array', 'Hash Table']
                          ).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded-md bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </AccordionComponent>
                      <AccordionComponent
                        title="Companies"
                        icon="domain"
                        id="companies"
                        isOpen={!!expandedAccordions['companies']}
                        onToggle={toggleAccordion}
                      >
                        Frequently asked by:{' '}
                        {selectedCatalogItem
                          ? selectedCatalogItem.track === 'Frontend'
                            ? 'Meta, Shopify, Vercel, Figma.'
                            : 'Amazon, Cloudflare, Stripe, GitHub.'
                          : 'Google, Meta, Amazon, Microsoft.'}
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
                          onChange={(e) =>
                            handleChangeLanguage(
                              e.target.value as PracticeLanguage
                            )
                          }
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
                      language={monacoLanguage}
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
