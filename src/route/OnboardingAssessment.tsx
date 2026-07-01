import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT';
import { useSettingsStore } from '../store/settings';

type TrackId =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'data'
  | 'devops'
  | 'mobile';

type SurveyState = {
  tracks: TrackId[];
};

type Difficulty = 'easy' | 'medium' | 'hard';
type SkillTrack = 'frontend' | 'backend';

type L = { en: string; vi: string };

function pickText(text: L, language: 'en' | 'vi') {
  return language === 'vi' ? text.vi : text.en;
}

type McqQuestion = {
  id: string;
  track: SkillTrack;
  difficulty: Difficulty;
  title: L;
  prompt: L;
  options: L[];
  correctIndex: number;
  explanation: L;
};

type CodeTask = {
  track: SkillTrack;
  difficulty: Difficulty;
  title: L;
  prompt: L;
  starter?: string;
};

type CodeAnswer = {
  difficulty: Difficulty;
  code: string;
  confidence: 1 | 2 | 3 | 4 | 5;
};

type AssessmentState = {
  version: 'v1';
  updatedAt: string;
  maxDifficultyByTrack: Partial<Record<SkillTrack, Difficulty>>;
  answers: Record<string, number>;
  codeAnswers: Partial<Record<SkillTrack, CodeAnswer>>;
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const SURVEY_STORAGE_KEY = 'cg_survey_v1';
const ASSESSMENT_STORAGE_KEY = 'cg_skill_assessment_v1';

function loadSurvey(): SurveyState | null {
  try {
    const raw = localStorage.getItem(SURVEY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SurveyState>;
    if (!Array.isArray(parsed.tracks)) return null;
    return { tracks: parsed.tracks as TrackId[] };
  } catch {
    return null;
  }
}

function freshState(): AssessmentState {
  return {
    version: 'v1',
    updatedAt: new Date().toISOString(),
    maxDifficultyByTrack: {},
    answers: {},
    codeAnswers: {},
  };
}

function loadInitialState(): AssessmentState {
  // Always start fresh — clear any previous session so the Quick Technical
  // Test can be retaken every time the user opens this page.
  try {
    localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
  } catch {
    // ignore
  }
  return freshState();
}

const QUESTIONS: McqQuestion[] = [
  // ===== Frontend (Easy) =====
  {
    id: 'fe_easy_semantic',
    track: 'frontend',
    difficulty: 'easy',
    title: { en: 'HTML Semantics', vi: 'HTML Semantics' },
    prompt: {
      en: 'When should you use <button> instead of <div> + onClick?',
      vi: 'Khi nào nên dùng <button> thay vì <div> + onClick?',
    },
    options: [
      {
        en: 'Only when you need custom styles; otherwise use <div>',
        vi: 'Chỉ khi bạn cần custom style; còn lại dùng <div>',
      },
      {
        en: 'When it is an interactive action (click/submit) for semantics + accessibility',
        vi: 'Khi đó là hành động tương tác (click/submit) để có semantics + accessibility',
      },
      {
        en: "It doesn't matter; the browser will understand",
        vi: 'Không quan trọng; browser tự hiểu',
      },
      {
        en: 'Only when using Tailwind',
        vi: 'Chỉ khi bạn dùng Tailwind',
      },
    ],
    correctIndex: 1,
    explanation: {
      en: '<button> provides semantics, focus, keyboard interaction, and better defaults than a <div>.',
      vi: '<button> có semantics, focus, keyboard interaction và default tốt hơn <div>.',
    },
  },
  {
    id: 'fe_easy_css_specificity',
    track: 'frontend',
    difficulty: 'easy',
    title: { en: 'CSS Specificity', vi: 'CSS Specificity' },
    prompt: {
      en: 'Which selector has higher specificity?',
      vi: 'Selector nào có specificity cao hơn?',
    },
    options: [
      { en: '.card .title', vi: '.card .title' },
      { en: '#cardTitle', vi: '#cardTitle' },
      { en: 'h2.title', vi: 'h2.title' },
      { en: 'div > .title', vi: 'div > .title' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'An #id selector has higher specificity than class/tag combinators.',
      vi: 'Selector dạng #id có specificity cao hơn các combinator của class/tag.',
    },
  },
  {
    id: 'fe_easy_js_eventloop',
    track: 'frontend',
    difficulty: 'easy',
    title: { en: 'JS Basics', vi: 'JS Basics' },
    prompt: {
      en: 'What will this print?\n\nconsole.log(1);\nsetTimeout(()=>console.log(2), 0);\nconsole.log(3);',
      vi: 'Đoạn code sau in ra gì?\n\nconsole.log(1);\nsetTimeout(()=>console.log(2), 0);\nconsole.log(3);',
    },
    options: [
      { en: '1 2 3', vi: '1 2 3' },
      { en: '1 3 2', vi: '1 3 2' },
      { en: '2 1 3', vi: '2 1 3' },
      { en: '3 2 1', vi: '3 2 1' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'setTimeout runs after the current call stack, so 2 prints last.',
      vi: 'Callback của setTimeout chạy sau call stack hiện tại, nên 2 in ra sau.',
    },
  },

  // ===== Frontend (Medium) =====
  {
    id: 'fe_med_react_state',
    track: 'frontend',
    difficulty: 'medium',
    title: { en: 'React State', vi: 'React State' },
    prompt: {
      en: "Why shouldn't you mutate state objects directly in React?",
      vi: 'Vì sao không nên mutate trực tiếp state object trong React?',
    },
    options: [
      {
        en: 'Because mutating will crash JavaScript',
        vi: 'Vì mutate sẽ làm JS crash',
      },
      {
        en: 'Because React relies on reference equality to detect changes and trigger re-renders',
        vi: 'Vì React dựa trên reference để detect thay đổi và trigger re-render',
      },
      {
        en: 'Because mutating makes code 10x slower',
        vi: 'Vì mutate làm code chậm hơn 10x',
      },
      {
        en: 'Because TypeScript forbids mutation',
        vi: 'Vì TypeScript không cho mutate',
      },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Immutability helps React detect changes via references and optimize rendering.',
      vi: 'Immutability giúp React so sánh reference để detect thay đổi và tối ưu render.',
    },
  },
  {
    id: 'fe_med_useeffect_deps',
    track: 'frontend',
    difficulty: 'medium',
    title: { en: 'useEffect deps', vi: 'useEffect deps' },
    prompt: {
      en: 'When does useEffect(() => {...}, []) run?',
      vi: 'useEffect(() => {...}, []) chạy khi nào?',
    },
    options: [
      { en: 'Every time state changes', vi: 'Mỗi lần state đổi' },
      {
        en: 'Only after the initial mount (and cleanup on unmount)',
        vi: 'Chỉ sau mount (và cleanup khi unmount)',
      },
      { en: 'Before the first render', vi: 'Trước render đầu tiên' },
      { en: 'After every props change', vi: 'Sau mỗi lần props đổi' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'An empty dependency array runs the effect once after mount (and cleanup on unmount).',
      vi: 'Dependency array rỗng khiến effect chạy sau mount và cleanup khi unmount.',
    },
  },
  {
    id: 'fe_med_fetch_errors',
    track: 'frontend',
    difficulty: 'medium',
    title: { en: 'Fetch & Errors', vi: 'Fetch & Errors' },
    prompt: {
      en: 'If fetch gets an HTTP 404, does fetch() reject the promise by default?',
      vi: 'Khi fetch nhận HTTP 404, fetch() có reject promise không (mặc định)?',
    },
    options: [
      {
        en: 'Yes, any status >= 400 rejects',
        vi: 'Có, status >= 400 đều reject',
      },
      {
        en: 'No, fetch resolves and you must check response.ok / status',
        vi: 'Không, fetch resolve và bạn phải tự check response.ok / status',
      },
      {
        en: 'It rejects only if the body is empty',
        vi: 'Chỉ reject nếu body rỗng',
      },
      { en: 'It rejects only on Chrome', vi: 'Chỉ reject trên Chrome' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'fetch only rejects on network errors; HTTP errors still resolve (response.ok=false).',
      vi: 'fetch chỉ reject khi lỗi network; HTTP errors vẫn resolve (response.ok=false).',
    },
  },

  // ===== Frontend (Hard) =====
  {
    id: 'fe_hard_memo',
    track: 'frontend',
    difficulty: 'hard',
    title: { en: 'Performance', vi: 'Hiệu năng' },
    prompt: { en: 'What does React.memo() do?', vi: 'React.memo() giúp gì?' },
    options: [
      { en: 'Reduces bundle size', vi: 'Giảm bundle size' },
      {
        en: 'Prevents re-render when props are shallow-equal',
        vi: 'Ngăn re-render khi props shallow-equal',
      },
      {
        en: 'Automatically optimizes all state updates',
        vi: 'Tự động optimize tất cả state updates',
      },
      { en: 'Replaces useEffect', vi: 'Thay thế useEffect' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'React.memo memoizes a component and skips rendering when props are unchanged (shallow compare).',
      vi: 'React.memo memoize component và skip render nếu props không đổi (shallow compare).',
    },
  },
  {
    id: 'fe_hard_keys',
    track: 'frontend',
    difficulty: 'hard',
    title: { en: 'List Keys', vi: 'Keys trong list' },
    prompt: {
      en: 'What issue can happen if you use array index as a key in a list?',
      vi: 'Dùng index làm key trong list có thể gây issue gì?',
    },
    options: [
      { en: 'No issue', vi: 'Không có issue' },
      {
        en: 'On reorder/insert/remove, React may mix up state/DOM, causing UI bugs',
        vi: 'Khi reorder/insert/remove, React có thể gán nhầm state/DOM gây bug UI',
      },
      { en: 'Only affects TypeScript', vi: 'Chỉ ảnh hưởng TypeScript' },
      {
        en: 'Only slightly slower; no bugs',
        vi: 'Chỉ chậm hơn một chút; không bug',
      },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Keys must be stable per item identity; index changes with position and can mis-assign state.',
      vi: 'Keys phải stable theo identity item; index thay đổi theo vị trí nên dễ bị “đổi chỗ state”.',
    },
  },
  {
    id: 'fe_hard_accessibility',
    track: 'frontend',
    difficulty: 'hard',
    title: { en: 'Accessibility', vi: 'Accessibility' },
    prompt: {
      en: 'How should ARIA be used?',
      vi: 'ARIA nên được dùng như thế nào?',
    },
    options: [
      {
        en: 'ARIA completely replaces HTML semantics',
        vi: 'ARIA thay thế hoàn toàn HTML semantics',
      },
      {
        en: 'Prefer correct semantic HTML first; use ARIA only to supplement when needed',
        vi: 'Ưu tiên dùng semantic HTML đúng trước; ARIA chỉ để bổ sung khi cần',
      },
      { en: 'ARIA is only for React', vi: 'ARIA chỉ dùng trong React' },
      {
        en: "A11y isn't needed for a coding learning app",
        vi: 'Không cần A11y cho app học code',
      },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Rule of thumb: “No ARIA is better than bad ARIA” — use semantic HTML first.',
      vi: 'Nguyên tắc: “No ARIA is better than bad ARIA” — dùng semantic HTML trước.',
    },
  },

  // ===== Backend (Easy) =====
  {
    id: 'be_easy_status',
    track: 'backend',
    difficulty: 'easy',
    title: { en: 'HTTP Status', vi: 'HTTP Status' },
    prompt: {
      en: 'Which status code fits when a resource is created successfully?',
      vi: 'Status code nào phù hợp khi tạo resource thành công?',
    },
    options: [
      { en: '200', vi: '200' },
      { en: '201', vi: '201' },
      { en: '204', vi: '204' },
      { en: '301', vi: '301' },
    ],
    correctIndex: 1,
    explanation: {
      en: '201 Created is used when creating a new resource.',
      vi: '201 Created dùng khi tạo resource mới thành công.',
    },
  },
  {
    id: 'be_easy_json',
    track: 'backend',
    difficulty: 'easy',
    title: { en: 'API Contracts', vi: 'API Contracts' },
    prompt: {
      en: 'Why validate request bodies on the server?',
      vi: 'Vì sao nên validate body request ở server?',
    },
    options: [
      {
        en: 'To make the client run faster',
        vi: 'Để làm client chạy nhanh hơn',
      },
      {
        en: 'To prevent invalid/missing input and improve safety (security + data integrity)',
        vi: 'Để tránh input sai/thiếu và tăng an toàn (security + data integrity)',
      },
      {
        en: 'To reduce the number of endpoints',
        vi: 'Để giảm số lượng endpoints',
      },
      {
        en: 'Not needed if using TypeScript',
        vi: 'Không cần nếu dùng TypeScript',
      },
    ],
    correctIndex: 1,
    explanation: {
      en: "Clients aren't 100% trustworthy; server validation protects the system and data.",
      vi: 'Client không đáng tin 100%; server validate để bảo vệ hệ thống và dữ liệu.',
    },
  },
  {
    id: 'be_easy_sql_injection',
    track: 'backend',
    difficulty: 'easy',
    title: { en: 'Security Basics', vi: 'Bảo mật cơ bản' },
    prompt: {
      en: 'A common way to prevent SQL injection is to…',
      vi: 'Cách phổ biến để tránh SQL Injection?',
    },
    options: [
      {
        en: 'Build SQL by string concatenation',
        vi: 'Nối chuỗi query bằng string',
      },
      {
        en: 'Use parameterized queries / prepared statements',
        vi: 'Dùng parameterized queries / prepared statements',
      },
      { en: 'Only allow GET requests', vi: 'Chỉ cho phép GET' },
      {
        en: 'Switch to NoSQL so injection disappears',
        vi: 'Chuyển DB sang NoSQL là hết injection',
      },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Parameterized queries separate data from the SQL statement and greatly reduce injection risk.',
      vi: 'Parameterized query tách data khỏi SQL statement, giảm injection đáng kể.',
    },
  },

  // ===== Backend (Medium) =====
  {
    id: 'be_med_idempotent',
    track: 'backend',
    difficulty: 'medium',
    title: { en: 'REST Semantics', vi: 'REST Semantics' },
    prompt: {
      en: 'In REST, PUT is typically…',
      vi: 'Trong REST, PUT thường có tính chất gì?',
    },
    options: [
      {
        en: 'Non-idempotent (calling multiple times creates multiple records)',
        vi: 'Non-idempotent (gọi nhiều lần tạo nhiều record)',
      },
      {
        en: 'Idempotent (calling multiple times produces the same result)',
        vi: 'Idempotent (gọi nhiều lần kết quả tương tự)',
      },
      { en: 'Only used for delete', vi: 'Chỉ dùng để delete' },
      { en: 'Only used for file uploads', vi: 'Chỉ dùng cho file upload' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'PUT is usually idempotent: applying the same update yields the same result.',
      vi: 'PUT (thường) idempotent: update/replace resource với cùng payload cho cùng kết quả.',
    },
  },
  {
    id: 'be_med_pagination',
    track: 'backend',
    difficulty: 'medium',
    title: { en: 'Pagination', vi: 'Phân trang' },
    prompt: {
      en: 'Why is cursor-based pagination often better than offset/limit on large tables?',
      vi: 'Vì sao cursor-based pagination thường tốt hơn offset/limit ở bảng lớn?',
    },
    options: [
      { en: 'Cursor is always simpler', vi: 'Cursor luôn đơn giản hơn' },
      {
        en: 'Large offsets force more scanning; cursor based on an indexed ordering is more stable and faster',
        vi: 'Offset lớn làm DB phải scan nhiều; cursor dựa trên index/ordering nên ổn định và nhanh hơn',
      },
      {
        en: "Offset doesn't work on Postgres",
        vi: 'Offset không chạy được trên Postgres',
      },
      {
        en: 'Cursor automatically encrypts data',
        vi: 'Cursor giúp encrypt dữ liệu',
      },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Large offsets are expensive; cursor based on a key (id/createdAt) can leverage indexes efficiently.',
      vi: 'Offset lớn tốn kém; cursor dựa trên key (id/createdAt) giúp query theo index hiệu quả.',
    },
  },
  {
    id: 'be_med_n_plus_one',
    track: 'backend',
    difficulty: 'medium',
    title: { en: 'Data Access', vi: 'Truy cập dữ liệu' },
    prompt: {
      en: 'What is the N+1 query problem?',
      vi: 'N+1 query problem là gì?',
    },
    options: [
      {
        en: 'A bug where the query returns N+1 rows',
        vi: 'Bug khi query bị cộng thêm 1 record',
      },
      {
        en: 'Fetching N items, then running 1 extra query per item (total N+1 queries)',
        vi: 'Lấy list N items rồi mỗi item query thêm 1 lần (tổng N+1 queries)',
      },
      {
        en: 'When the DB only allows N+1 connections',
        vi: 'Khi DB chỉ cho phép N+1 connections',
      },
      { en: 'When you join too many tables', vi: 'Khi join quá nhiều bảng' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'N+1 happens when the ORM/data layer fails to eager-load properly, causing many extra queries.',
      vi: 'N+1 xảy ra khi ORM/layer data access không eager load đúng, gây rất nhiều queries.',
    },
  },

  // ===== Backend (Hard) =====
  {
    id: 'be_hard_transactions',
    track: 'backend',
    difficulty: 'hard',
    title: { en: 'Transactions', vi: 'Transactions' },
    prompt: {
      en: 'When do you need a transaction?',
      vi: 'Khi nào cần transaction?',
    },
    options: [
      {
        en: 'Every query needs a transaction',
        vi: 'Mọi query đều cần transaction',
      },
      {
        en: 'When multiple DB operations must be all-or-nothing to avoid partial state',
        vi: 'Khi nhiều thao tác DB phải all-or-nothing để tránh trạng thái dở dang',
      },
      { en: 'Only when using NoSQL', vi: 'Chỉ khi dùng NoSQL' },
      { en: 'Only for SELECT queries', vi: 'Chỉ khi query SELECT' },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Transactions ensure consistency when multiple related inserts/updates must succeed together.',
      vi: 'Transaction đảm bảo tính nhất quán khi có nhiều bước update/insert liên quan.',
    },
  },
  {
    id: 'be_hard_jwt',
    track: 'backend',
    difficulty: 'hard',
    title: { en: 'Auth', vi: 'Auth' },
    prompt: {
      en: 'Where should you store a JWT in a web app to reduce XSS risk?',
      vi: 'JWT nên lưu ở đâu để giảm rủi ro XSS?',
    },
    options: [
      { en: 'LocalStorage', vi: 'LocalStorage' },
      {
        en: 'HttpOnly secure cookie (with CSRF protection)',
        vi: 'HttpOnly secure cookie (kèm CSRF protection)',
      },
      { en: 'Window.name', vi: 'Window.name' },
      {
        en: "Don't store it; hard-code it",
        vi: 'Không cần lưu; hard-code vào code',
      },
    ],
    correctIndex: 1,
    explanation: {
      en: "HttpOnly cookies can't be read by JS (reduces XSS token theft), but you must mitigate CSRF.",
      vi: 'HttpOnly cookie không bị JS đọc trực tiếp (giảm XSS leak), nhưng cần chống CSRF.',
    },
  },
  {
    id: 'be_hard_rate_limit',
    track: 'backend',
    difficulty: 'hard',
    title: { en: 'Reliability', vi: 'Độ ổn định' },
    prompt: {
      en: 'What is rate limiting used for?',
      vi: 'Rate limiting dùng để làm gì?',
    },
    options: [
      { en: 'To reduce network latency', vi: 'Giảm độ trễ mạng' },
      {
        en: 'To prevent abuse/DoS, protect backend resources, and enforce fairness',
        vi: 'Chống abuse/DoS, bảo vệ backend và fairness giữa users',
      },
      { en: 'To improve SEO', vi: 'Tăng SEO' },
      {
        en: 'To automatically cache responses',
        vi: 'Để cache response tự động',
      },
    ],
    correctIndex: 1,
    explanation: {
      en: 'Rate limiting helps keep systems stable and reduces spam/DoS risk.',
      vi: 'Rate limit giúp hệ thống ổn định hơn và giảm nguy cơ bị spam/DoS.',
    },
  },
];

const CODE_TASKS: Record<SkillTrack, Record<Difficulty, CodeTask>> = {
  frontend: {
    easy: {
      track: 'frontend',
      difficulty: 'easy',
      title: { en: 'FE Easy — DOM & JS', vi: 'FE Easy — DOM & JS' },
      prompt: {
        en: 'Write a function `countVowels(str)` that returns the number of vowels (a,e,i,o,u) in a string (case-insensitive).\n\nExample:\ncountVowels("Hello") => 2',
        vi: 'Viết hàm `countVowels(str)` trả về số lượng nguyên âm (a,e,i,o,u) trong chuỗi (không phân biệt hoa/thường).\n\nVí dụ:\ncountVowels("Hello") => 2',
      },
      starter: `function countVowels(str: string): number {\n  // TODO\n  return 0;\n}\n`,
    },
    medium: {
      track: 'frontend',
      difficulty: 'medium',
      title: { en: 'FE Medium — React Hook', vi: 'FE Medium — React Hook' },
      prompt: {
        en: 'Write a custom hook `useDebounce(value, delayMs)`.\nRequirements:\n- Return the debounced value.\n- When value changes, wait delayMs before updating.\n- Cleanup the timer on unmount / when value changes.\n\nHint: useEffect + setTimeout/clearTimeout.',
        vi: 'Viết custom hook `useDebounce(value, delayMs)`.\nYêu cầu:\n- Trả về giá trị đã debounce.\n- Khi value đổi, đợi delayMs rồi mới update.\n- Cleanup timer khi unmount / value đổi.\n\nGợi ý: useEffect + setTimeout/clearTimeout.',
      },
      starter: `import { useEffect, useState } from "react";\n\nexport function useDebounce<T>(value: T, delayMs: number): T {\n  // TODO\n  return value;\n}\n`,
    },
    hard: {
      track: 'frontend',
      difficulty: 'hard',
      title: {
        en: 'FE Hard — Data Fetching + Abort',
        vi: 'FE Hard — Data Fetching + Abort',
      },
      prompt: {
        en: 'Design a hook `useUserSearch(query)`.\nRequirements:\n- When query changes: call /api/users?q=... (mock) and update loading/error/data.\n- Cancel the previous request if query changes quickly (AbortController).\n- Avoid race conditions (only use the latest response).\n\nYou can write pseudo-code; it does not need to run.',
        vi: 'Thiết kế hook `useUserSearch(query)`.\nYêu cầu:\n- Khi query thay đổi: gọi /api/users?q=... (mock) và cập nhật loading/error/data.\n- Hủy request cũ nếu query đổi nhanh (AbortController).\n- Tránh race condition (chỉ lấy response mới nhất).\n\nBạn có thể viết pseudo-code, không cần chạy được.',
      },
      starter: `type User = { id: string; name: string };\n\ntype State = { loading: boolean; error: string | null; data: User[] };\n\nexport function useUserSearch(query: string): State {\n  // TODO\n  return { loading: false, error: null, data: [] };\n}\n`,
    },
  },
  backend: {
    easy: {
      track: 'backend',
      difficulty: 'easy',
      title: { en: 'BE Easy — Validation', vi: 'BE Easy — Validation' },
      prompt: {
        en: 'Assume POST /signup receives { email, password }.\nWrite pseudo-code validation:\n- email must include "@",\n- password length >= 8,\n- on failure return 400 + message.\n\n(No specific framework required.)',
        vi: 'Giả sử POST /signup nhận { email, password }.\nViết pseudo-code validate:\n- email phải có "@",\n- password >= 8 ký tự,\n- nếu fail trả 400 + message.\n\n(Không cần framework cụ thể.)',
      },
      starter: `type Req = { body: { email?: string; password?: string } };\ntype Res = { status: (code: number) => Res; json: (x: unknown) => void };\n\nexport function signup(req: Req, res: Res) {\n  // TODO\n}\n`,
    },
    medium: {
      track: 'backend',
      difficulty: 'medium',
      title: {
        en: 'BE Medium — Pagination API',
        vi: 'BE Medium — Pagination API',
      },
      prompt: {
        en: 'Design an endpoint GET /posts?limit=20&cursor=...\nRequirements:\n- Return { items, nextCursor }\n- Cursor based on createdAt or id.\n- Describe the SQL/pseudo query and response format.\n\nNo running code required, but be clear.',
        vi: 'Thiết kế endpoint GET /posts?limit=20&cursor=...\nYêu cầu:\n- Trả về { items, nextCursor }\n- Cursor dựa trên createdAt hoặc id.\n- Mô tả query SQL/pseudo + format response.\n\nKhông cần code chạy nhưng mô tả rõ.',
      },
      starter: `type Post = { id: string; title: string; createdAt: string };\n\ntype Response = { items: Post[]; nextCursor: string | null };\n\nexport async function listPosts(limit: number, cursor: string | null): Promise<Response> {\n  // TODO\n  return { items: [], nextCursor: null };\n}\n`,
    },
    hard: {
      track: 'backend',
      difficulty: 'hard',
      title: {
        en: 'BE Hard — Auth Middleware',
        vi: 'BE Hard — Auth Middleware',
      },
      prompt: {
        en: 'Write pseudo-code middleware `auth()`:\n- Read token from Authorization: Bearer <token>\n- Verify JWT (assume verifyJwt)\n- Attach userId to req.context\n- On failure: 401\n\nBonus: distinguish 401 vs 403 (insufficient permissions).',
        vi: 'Viết pseudo-code middleware `auth()`:\n- Nhận token từ Authorization: Bearer <token>\n- Verify JWT (giả định có verifyJwt)\n- Gắn userId vào req.context\n- Nếu fail: 401\n\nBonus: phân biệt 401 vs 403 (không đủ quyền).',
      },
      starter: `type Req = { headers: Record<string, string | undefined>; context?: { userId?: string } };\ntype Res = { status: (code: number) => Res; json: (x: unknown) => void };\ntype Next = () => void;\n\ndeclare function verifyJwt(token: string): { userId: string };\n\nexport function auth(req: Req, res: Res, next: Next) {\n  // TODO\n}\n`,
    },
  },
};

function formatDifficulty(d: Difficulty) {
  if (d === 'easy') return 'Easy';
  if (d === 'medium') return 'Medium';
  return 'Hard';
}

function difficultyColor(d: Difficulty) {
  if (d === 'easy') return 'border-[#4ADE80]/35 bg-[#4ADE80]/10 text-[#A7F3D0]';
  if (d === 'medium')
    return 'border-[#FFA500]/35 bg-[#FFA500]/10 text-[#FFD8A8]';
  return 'border-[#FF7E5F]/35 bg-[#FF7E5F]/10 text-[#FFC3B6]';
}

function McqBlock({
  question,
  selectedIndex,
  onSelect,
}: {
  question: McqQuestion;
  selectedIndex: number | undefined;
  onSelect: (idx: number) => void;
}) {
  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const isCorrect =
    typeof selectedIndex === 'number' &&
    selectedIndex === question.correctIndex;
  const answered = typeof selectedIndex === 'number';

  const title = pickText(question.title, language);
  const prompt = pickText(question.prompt, language);
  const explanation = pickText(question.explanation, language);

  return (
    <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-6 shadow-[0_40px_160px_rgba(0,0,0,0.30)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
          {question.track.toUpperCase()} · {title.toUpperCase()}
        </div>
        <div
          className={cx(
            'rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide',
            difficultyColor(question.difficulty)
          )}
        >
          {formatDifficulty(question.difficulty)}
        </div>
      </div>

      <h3 className="mt-4 whitespace-pre-line text-base font-semibold leading-6">
        {prompt}
      </h3>

      <div className="mt-4 space-y-3">
        {question.options.map((opt, i) => {
          const active = selectedIndex === i;
          const optText = pickText(opt, language);
          return (
            <button
              key={`${question.id}_${i}`}
              type="button"
              className={cx(
                'group flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition',
                active
                  ? 'border-[rgba(255,165,0,0.55)] bg-[rgba(255,165,0,0.14)]'
                  : 'border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] hover:border-[rgba(255,255,255,0.18)]'
              )}
              onClick={() => onSelect(i)}
            >
              <div
                className={cx(
                  'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold',
                  active
                    ? 'border-[rgba(255,165,0,0.65)] bg-[rgba(255,165,0,0.22)] text-[color:var(--cg-text)]'
                    : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)]'
                )}
              >
                {String.fromCharCode(65 + i)}
              </div>
              <div className="text-sm leading-6 text-[color:var(--cg-text)]">
                {optText}
              </div>
            </button>
          );
        })}
      </div>

      {answered ? (
        <div
          className={cx(
            'mt-5 rounded-2xl border px-4 py-3 text-xs leading-5',
            isCorrect
              ? 'border-[#4ADE80]/25 bg-[#4ADE80]/10 text-[color:var(--cg-text)]'
              : 'border-[#FF7E5F]/25 bg-[#FF7E5F]/10 text-[color:var(--cg-text)]'
          )}
        >
          <div className="font-semibold tracking-wide">
            {isCorrect ? t('assess.correct') : t('assess.notQuite')}
          </div>
          <div className="mt-1 text-[color:var(--cg-text-muted)]">
            {explanation}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OnboardingAssessment() {
  const navigate = useNavigate();
  const logoSrc = '/component_2_2x.png';
  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const ui =
    language === 'vi'
      ? {
          skillAssessment: 'ĐÁNH GIÁ KỸ NĂNG',
          step: 'BƯỚC',
          skipToPractice: 'Bỏ qua tới Practice',
          answerLevel: 'Hãy trả lời mức hiện tại. Qua được thì mở mức kế tiếp.',
          frontendMiniCode: 'FRONTEND · MINI CODE',
          backendMiniCode: 'BACKEND · MINI CODE',
          results: 'KẾT QUẢ',
          frontendScore: 'ĐIỂM FRONTEND',
          backendScore: 'ĐIỂM BACKEND',
          missionBrief: 'TÓM TẮT NHIỆM VỤ',
          preview: 'XEM TRƯỚC',
          tracks: 'Track',
          frontendMax: 'Mức Frontend tối đa',
          backendMax: 'Mức Backend tối đa',
          autosave: 'Tự lưu',
          on: 'BẬT',
        }
      : {
          skillAssessment: 'SKILL ASSESSMENT',
          step: 'STEP',
          skipToPractice: 'Skip to Practice',
          answerLevel: 'Answer the current level. Pass to unlock the next.',
          frontendMiniCode: 'FRONTEND · MINI CODE',
          backendMiniCode: 'BACKEND · MINI CODE',
          results: 'RESULTS',
          frontendScore: 'FRONTEND SCORE',
          backendScore: 'BACKEND SCORE',
          missionBrief: 'MISSION BRIEF',
          preview: 'PREVIEW',
          tracks: 'Tracks',
          frontendMax: 'Frontend max',
          backendMax: 'Backend max',
          autosave: 'Autosave',
          on: 'ON',
        };

  const survey = useMemo(() => loadSurvey(), []);
  const tracks = survey?.tracks ?? [];

  const wantsFrontend =
    tracks.includes('frontend') || tracks.includes('fullstack');
  const wantsBackend =
    tracks.includes('backend') || tracks.includes('fullstack');

  const steps = useMemo(() => {
    const s: Array<{
      id: 'frontend' | 'backend' | 'code' | 'finish';
      label: string;
    }> = [];
    if (wantsFrontend) s.push({ id: 'frontend', label: 'Frontend' });
    if (wantsBackend) s.push({ id: 'backend', label: 'Backend' });
    s.push({ id: 'code', label: 'Mini Code' });
    s.push({ id: 'finish', label: 'Finish' });
    return s;
  }, [wantsFrontend, wantsBackend]);

  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex]?.id ?? 'finish';

  const [state, setState] = useState<AssessmentState>(() => loadInitialState());

  // We use maxDifficultyByTrack as the *current* level the user is attempting.
  // Flow: Easy → (pass) Medium → (pass) Hard → (pass) next step.
  // If user fails at any level, we exit early.
  const currentFrontendDifficulty: Difficulty =
    state.maxDifficultyByTrack.frontend ?? 'easy';
  const currentBackendDifficulty: Difficulty =
    state.maxDifficultyByTrack.backend ?? 'easy';

  // Keep old variable names for UI sections below (preview/results).
  const maxDifficultyFrontend = wantsFrontend
    ? currentFrontendDifficulty
    : undefined;
  const maxDifficultyBackend = wantsBackend
    ? currentBackendDifficulty
    : undefined;

  const frontendLevelQuestions = useMemo(() => {
    if (!wantsFrontend) return [];
    return QUESTIONS.filter(
      (q) =>
        q.track === 'frontend' && q.difficulty === currentFrontendDifficulty
    );
  }, [wantsFrontend, currentFrontendDifficulty]);

  const backendLevelQuestions = useMemo(() => {
    if (!wantsBackend) return [];
    return QUESTIONS.filter(
      (q) => q.track === 'backend' && q.difficulty === currentBackendDifficulty
    );
  }, [wantsBackend, currentBackendDifficulty]);

  const progressPct =
    steps.length === 0 ? 0 : ((stepIndex + 1) / steps.length) * 100;

  function persist(next: AssessmentState) {
    try {
      localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function setMaxDifficulty(track: SkillTrack, d: Difficulty) {
    setState((prev) => {
      const next: AssessmentState = {
        ...prev,
        updatedAt: new Date().toISOString(),
        maxDifficultyByTrack: { ...prev.maxDifficultyByTrack, [track]: d },
      };
      persist(next);
      return next;
    });
  }

  function answer(questionId: string, idx: number) {
    setState((prev) => {
      const next: AssessmentState = {
        ...prev,
        updatedAt: new Date().toISOString(),
        answers: { ...prev.answers, [questionId]: idx },
      };
      persist(next);
      return next;
    });
  }

  function setCodeAnswer(track: SkillTrack, patch: Partial<CodeAnswer>) {
    setState((prev) => {
      const current: CodeAnswer = prev.codeAnswers[track] ?? {
        difficulty: 'easy',
        code: CODE_TASKS[track].easy.starter ?? '',
        confidence: 3,
      };
      const nextAnswer: CodeAnswer = { ...current, ...patch };
      const next: AssessmentState = {
        ...prev,
        updatedAt: new Date().toISOString(),
        codeAnswers: { ...prev.codeAnswers, [track]: nextAnswer },
      };
      persist(next);
      return next;
    });
  }

  const canProceed = useMemo(() => {
    if (step === 'frontend') {
      if (!wantsFrontend) return true;
      return frontendLevelQuestions.every(
        (q) => typeof state.answers[q.id] === 'number'
      );
    }
    if (step === 'backend') {
      if (!wantsBackend) return true;
      return backendLevelQuestions.every(
        (q) => typeof state.answers[q.id] === 'number'
      );
    }
    if (step === 'code') {
      const okTrack = (t: SkillTrack) => {
        const a = state.codeAnswers[t];
        if (!a) return false;
        return a.code.trim().length >= 20;
      };

      if (wantsFrontend && !okTrack('frontend')) return false;
      if (wantsBackend && !okTrack('backend')) return false;
      // If user didn't pick FE/BE tracks, allow proceeding anyway (fallback)
      if (!wantsFrontend && !wantsBackend) return true;
      return true;
    }
    return true;
  }, [
    step,
    wantsFrontend,
    wantsBackend,
    frontendLevelQuestions,
    backendLevelQuestions,
    state.answers,
    state.codeAnswers,
  ]);

  const scoreFrontend = useMemo(() => {
    if (!wantsFrontend) return null;
    const list = QUESTIONS.filter((q) => q.track === 'frontend');
    const answered = list.filter(
      (q) => typeof state.answers[q.id] === 'number'
    );
    const score = answered.reduce(
      (acc, q) => acc + (state.answers[q.id] === q.correctIndex ? 1 : 0),
      0
    );
    return { score, total: answered.length };
  }, [wantsFrontend, state.answers]);

  const scoreBackend = useMemo(() => {
    if (!wantsBackend) return null;
    const list = QUESTIONS.filter((q) => q.track === 'backend');
    const answered = list.filter(
      (q) => typeof state.answers[q.id] === 'number'
    );
    const score = answered.reduce(
      (acc, q) => acc + (state.answers[q.id] === q.correctIndex ? 1 : 0),
      0
    );
    return { score, total: answered.length };
  }, [wantsBackend, state.answers]);

  function finalizeAndNavigateToPracticeOnFail(reason: {
    track: SkillTrack;
    difficulty: Difficulty;
  }) {
    // Lock the level we failed at so preview/results are consistent.
    const payload = {
      ...state,
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      maxDifficultyByTrack: {
        ...state.maxDifficultyByTrack,
        [reason.track]: reason.difficulty,
      },
      score: {
        frontend: scoreFrontend,
        backend: scoreBackend,
      },
      surveyTracks: tracks,
      exitReason: reason,
    };

    try {
      localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }

    // On fail, jump directly to Practice (codespace) so user can continue.
    navigate('/practice');
  }

  function goNext() {
    if (!canProceed) return;

    // Frontend: Easy -> Medium -> Hard. Fail -> exit.
    if (step === 'frontend') {
      const list = frontendLevelQuestions;
      const allCorrect = list.every(
        (q) => state.answers[q.id] === q.correctIndex
      );
      if (!allCorrect) {
        finalizeAndNavigateToPracticeOnFail({
          track: 'frontend',
          difficulty: currentFrontendDifficulty,
        });
        return;
      }

      if (currentFrontendDifficulty === 'easy') {
        setMaxDifficulty('frontend', 'medium');
        return;
      }
      if (currentFrontendDifficulty === 'medium') {
        setMaxDifficulty('frontend', 'hard');
        return;
      }
      // Hard passed → continue to next step
      setStepIndex((i) => Math.min(steps.length - 1, i + 1));
      return;
    }

    // Backend: Easy -> Medium -> Hard. Fail -> exit.
    if (step === 'backend') {
      const list = backendLevelQuestions;
      const allCorrect = list.every(
        (q) => state.answers[q.id] === q.correctIndex
      );
      if (!allCorrect) {
        finalizeAndNavigateToPracticeOnFail({
          track: 'backend',
          difficulty: currentBackendDifficulty,
        });
        return;
      }

      if (currentBackendDifficulty === 'easy') {
        setMaxDifficulty('backend', 'medium');
        return;
      }
      if (currentBackendDifficulty === 'medium') {
        setMaxDifficulty('backend', 'hard');
        return;
      }
      // Hard passed → continue to next step
      setStepIndex((i) => Math.min(steps.length - 1, i + 1));
      return;
    }

    // Default behavior for other steps.
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    }
  }

  function goBack() {
    // For FE/BE steps: allow stepping back within difficulty levels first.
    if (step === 'frontend') {
      if (currentFrontendDifficulty === 'hard') {
        setMaxDifficulty('frontend', 'medium');
        return;
      }
      if (currentFrontendDifficulty === 'medium') {
        setMaxDifficulty('frontend', 'easy');
        return;
      }
    }
    if (step === 'backend') {
      if (currentBackendDifficulty === 'hard') {
        setMaxDifficulty('backend', 'medium');
        return;
      }
      if (currentBackendDifficulty === 'medium') {
        setMaxDifficulty('backend', 'easy');
        return;
      }
    }
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function finalizeAndNavigateToPractice() {
    const payload = {
      ...state,
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      score: {
        frontend: scoreFrontend,
        backend: scoreBackend,
      },
      surveyTracks: tracks,
    };
    try {
      localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
    // Jump into Practice workspace after finishing the assessment
    navigate('/practice');
  }

  function retakeAssessment() {
    // Clear saved state and restart from scratch
    try {
      localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(freshState());
    setStepIndex(0);
  }

  const missionBrief = useMemo(() => {
    if (step === 'frontend') {
      return {
        title: 'Frontend Calibration',
        body: 'Quickly assess UI/React fundamentals to pick the right quest pack.',
        hint: 'Flow: Easy → Medium → Hard. Fail a level and we’ll exit back to the Map.',
      };
    }
    if (step === 'backend') {
      return {
        title: 'Backend Calibration',
        body: 'Check HTTP/DB/Auth basics to estimate difficulty and your server-side path.',
        hint: 'Flow: Easy → Medium → Hard. Fail a level and we’ll exit back to the Map.',
      };
    }
    if (step === 'code') {
      return {
        title: 'Mini Code Challenges',
        body: "These coding tasks don't need to run — we want to see how you think and structure a solution.",
        hint: 'Be clear. Add short comments if needed. Pseudo-code is fine.',
      };
    }
    return {
      title: 'Assessment Complete',
      body: 'We saved your results and you can now jump into the Practice Workspace.',
      hint: 'You can retake it by clearing localStorage key cg_skill_assessment_v1.',
    };
  }, [step]);

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--cg-container-a30),transparent_55%),radial-gradient(circle_at_78%_22%,var(--cg-coral-a18),transparent_58%),radial-gradient(circle_at_30%_88%,var(--cg-amber-a14),transparent_58%)]" />
        <div className="absolute -top-56 left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--cg-container-a30),transparent_62%)] blur-2xl" />
      </div>

      <header className="relative z-10 border-b border-[color:var(--cg-border)] bg-transparent px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="Logo"
              className="h-8 w-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-sm font-semibold tracking-wide">
              <span className="bg-gradient-to-r from-[color:var(--cg-coral)] to-[color:var(--cg-amber)] bg-clip-text text-transparent">
                CodeForGlory
              </span>
            </span>
          </Link>

          <div className="flex w-full max-w-sm flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
              <span>{ui.skillAssessment}</span>
              <span>
                {ui.step} {stepIndex + 1}/{steps.length}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[color:var(--cg-container-a16)] ring-1 ring-[rgba(255,255,255,0.08)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[color:var(--cg-coral)] via-[color:var(--cg-amber)] to-[color:var(--cg-green)] transition-[width] duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              className="text-xs font-semibold text-[color:var(--cg-text-muted)] transition hover:text-[color:var(--cg-text)]"
              onClick={() => navigate('/practice')}
            >
              {ui.skipToPractice}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-28 pt-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {t('assess.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--cg-text-muted)]">
            {t('assess.subtitle')}
          </p>
        </div>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {step === 'frontend' ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-7 shadow-[0_40px_160px_rgba(0,0,0,0.30)] backdrop-blur">
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                    {t('assess.frontend.max')}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight">
                    {t('assess.chooseMax')}
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                    {ui.answerLevel}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((d) => (
                      <div
                        key={d}
                        className={cx(
                          'rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide',
                          d === currentFrontendDifficulty
                            ? difficultyColor(d)
                            : 'border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] text-[color:var(--cg-text-muted)] opacity-60'
                        )}
                      >
                        {formatDifficulty(d)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  {frontendLevelQuestions.map((q) => (
                    <McqBlock
                      key={q.id}
                      question={q}
                      selectedIndex={state.answers[q.id]}
                      onSelect={(idx) => answer(q.id, idx)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {step === 'backend' ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-7 shadow-[0_40px_160px_rgba(0,0,0,0.30)] backdrop-blur">
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                    {t('assess.backend.max')}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight">
                    {t('assess.chooseMax')}
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                    {ui.answerLevel}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((d) => (
                      <div
                        key={d}
                        className={cx(
                          'rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide',
                          d === currentBackendDifficulty
                            ? difficultyColor(d)
                            : 'border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] text-[color:var(--cg-text-muted)] opacity-60'
                        )}
                      >
                        {formatDifficulty(d)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  {backendLevelQuestions.map((q) => (
                    <McqBlock
                      key={q.id}
                      question={q}
                      selectedIndex={state.answers[q.id]}
                      onSelect={(idx) => answer(q.id, idx)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {step === 'code' ? (
              <div className="space-y-6">
                {!wantsFrontend && !wantsBackend ? (
                  <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-7 shadow-[0_40px_160px_rgba(0,0,0,0.30)] backdrop-blur">
                    <div className="text-sm font-semibold">
                      {t('assess.code.noTracksTitle')}
                    </div>
                    <p className="mt-2 text-xs text-[color:var(--cg-text-muted)]">
                      {t('assess.code.noTracksBody')}
                    </p>
                  </div>
                ) : null}

                {wantsFrontend ? (
                  <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-7 shadow-[0_40px_160px_rgba(0,0,0,0.30)] backdrop-blur">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                        {ui.frontendMiniCode}
                      </div>
                      <div className="flex items-center gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            className={cx(
                              'rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide transition',
                              state.codeAnswers.frontend?.difficulty === d
                                ? 'border-[rgba(255,165,0,0.65)] bg-[rgba(255,165,0,0.16)] text-[color:var(--cg-text)]'
                                : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]'
                            )}
                            onClick={() => {
                              const starter =
                                CODE_TASKS.frontend[d].starter ?? '';
                              setCodeAnswer('frontend', {
                                difficulty: d,
                                code: starter,
                              });
                            }}
                          >
                            {formatDifficulty(d)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(() => {
                      const d =
                        state.codeAnswers.frontend?.difficulty ?? 'easy';
                      const task = CODE_TASKS.frontend[d];
                      return (
                        <>
                          <h3 className="mt-4 text-lg font-semibold">
                            {pickText(task.title, language)}
                          </h3>
                          <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[color:var(--cg-text-muted)]">
                            {pickText(task.prompt, language)}
                          </p>
                          <textarea
                            rows={12}
                            value={
                              state.codeAnswers.frontend?.code ??
                              task.starter ??
                              ''
                            }
                            onChange={(e) =>
                              setCodeAnswer('frontend', {
                                code: e.target.value,
                              })
                            }
                            className={cx(
                              'mt-4 w-full resize-none rounded-2xl border px-4 py-3 font-mono text-[12px] leading-5 outline-none transition',
                              'border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] text-[rgba(199,201,255,0.85)]',
                              'placeholder:text-[rgba(199,201,255,0.40)] focus:border-[rgba(255,165,0,0.45)] focus:ring-2 focus:ring-[rgba(255,165,0,0.18)]'
                            )}
                            placeholder={t('assess.code.placeholder')}
                          />
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs text-[color:var(--cg-text-muted)]">
                              {t('assess.confidence')}
                            </div>
                            <div className="flex items-center gap-2">
                              {([1, 2, 3, 4, 5] as const).map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  className={cx(
                                    'h-8 w-8 rounded-xl border text-xs font-bold transition',
                                    (state.codeAnswers.frontend?.confidence ??
                                      3) === n
                                      ? 'border-[rgba(255,165,0,0.65)] bg-[rgba(255,165,0,0.16)] text-[color:var(--cg-text)]'
                                      : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]'
                                  )}
                                  onClick={() =>
                                    setCodeAnswer('frontend', {
                                      confidence: n,
                                    })
                                  }
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3 text-xs text-[color:var(--cg-text-muted)]">
                            {t('assess.tip.notAutograded')}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : null}

                {wantsBackend ? (
                  <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-7 shadow-[0_40px_160px_rgba(0,0,0,0.30)] backdrop-blur">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                        {ui.backendMiniCode}
                      </div>
                      <div className="flex items-center gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            className={cx(
                              'rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide transition',
                              state.codeAnswers.backend?.difficulty === d
                                ? 'border-[rgba(255,165,0,0.65)] bg-[rgba(255,165,0,0.16)] text-[color:var(--cg-text)]'
                                : 'border-white/10 bg-white/5 text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]'
                            )}
                            onClick={() => {
                              const starter =
                                CODE_TASKS.backend[d].starter ?? '';
                              setCodeAnswer('backend', {
                                difficulty: d,
                                code: starter,
                              });
                            }}
                          >
                            {formatDifficulty(d)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(() => {
                      const d = state.codeAnswers.backend?.difficulty ?? 'easy';
                      const task = CODE_TASKS.backend[d];
                      return (
                        <>
                          <h3 className="mt-4 text-lg font-semibold">
                            {pickText(task.title, language)}
                          </h3>
                          <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[color:var(--cg-text-muted)]">
                            {pickText(task.prompt, language)}
                          </p>
                          <textarea
                            rows={12}
                            value={
                              state.codeAnswers.backend?.code ??
                              task.starter ??
                              ''
                            }
                            onChange={(e) =>
                              setCodeAnswer('backend', { code: e.target.value })
                            }
                            className={cx(
                              'mt-4 w-full resize-none rounded-2xl border px-4 py-3 font-mono text-[12px] leading-5 outline-none transition',
                              'border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] text-[rgba(199,201,255,0.85)]',
                              'placeholder:text-[rgba(199,201,255,0.40)] focus:border-[rgba(255,165,0,0.45)] focus:ring-2 focus:ring-[rgba(255,165,0,0.18)]'
                            )}
                            placeholder={t('assess.pseudo.placeholder')}
                          />
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs text-[color:var(--cg-text-muted)]">
                              {t('assess.confidence')}
                            </div>
                            <div className="flex items-center gap-2">
                              {([1, 2, 3, 4, 5] as const).map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  className={cx(
                                    'h-8 w-8 rounded-xl border text-xs font-bold transition',
                                    (state.codeAnswers.backend?.confidence ??
                                      3) === n
                                      ? 'border-[rgba(255,165,0,0.65)] bg-[rgba(255,165,0,0.16)] text-[color:var(--cg-text)]'
                                      : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]'
                                  )}
                                  onClick={() =>
                                    setCodeAnswer('backend', { confidence: n })
                                  }
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 'finish' ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-8 shadow-[0_40px_160px_rgba(0,0,0,0.30)] backdrop-blur">
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                    {ui.results}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                    {t('assess.results.title')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                    {t('assess.results.body')}
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] p-5">
                      <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                        {ui.frontendScore}
                      </div>
                      <div className="mt-3 text-2xl font-semibold">
                        {scoreFrontend
                          ? `${scoreFrontend.score}/${scoreFrontend.total}`
                          : '—'}
                      </div>
                      <div className="mt-2 text-xs text-[color:var(--cg-text-muted)]">
                        {t('assess.results.selectedLevel')}{' '}
                        <span className="font-semibold text-[color:var(--cg-text)]">
                          {maxDifficultyFrontend
                            ? formatDifficulty(maxDifficultyFrontend)
                            : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] p-5">
                      <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                        {ui.backendScore}
                      </div>
                      <div className="mt-3 text-2xl font-semibold">
                        {scoreBackend
                          ? `${scoreBackend.score}/${scoreBackend.total}`
                          : '—'}
                      </div>
                      <div className="mt-2 text-xs text-[color:var(--cg-text-muted)]">
                        {t('assess.results.selectedLevel')}{' '}
                        <span className="font-semibold text-[color:var(--cg-text)]">
                          {maxDifficultyBackend
                            ? formatDifficulty(maxDifficultyBackend)
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--cg-green)] px-5 py-3 text-xs font-bold text-[#0f0b3c] shadow-[0_16px_60px_rgba(74,222,128,0.18)] transition hover:bg-[color:var(--cg-green-hover)] active:scale-[0.98]"
                      onClick={finalizeAndNavigateToPractice}
                    >
                      {t('assess.results.enterPractice')}{' '}
                      <span className="text-sm">↯</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-5 py-3 text-xs font-semibold text-[color:var(--cg-text)] backdrop-blur-md transition hover:bg-[color:var(--cg-container-a22)]"
                      onClick={() => navigate('/onboarding/summary')}
                    >
                      {t('assess.results.viewSummary')}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl border border-[rgba(255,126,95,0.35)] bg-[rgba(255,126,95,0.10)] px-5 py-3 text-xs font-semibold text-[color:var(--cg-coral)] backdrop-blur-md transition hover:bg-[rgba(255,126,95,0.18)]"
                      onClick={retakeAssessment}
                    >
                      ↺ {language === 'vi' ? 'Làm lại' : 'Retake'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] shadow-[0_40px_160px_rgba(0,0,0,0.30)] backdrop-blur">
              <div className="relative p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_12%,var(--cg-container-a30),transparent_58%),radial-gradient(circle_at_80%_18%,var(--cg-coral-a18),transparent_62%),radial-gradient(circle_at_50%_90%,var(--cg-amber-a14),transparent_62%)]" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                        {ui.missionBrief}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold tracking-tight">
                        {missionBrief.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                        {missionBrief.body}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--cg-bg-a55)] ring-1 ring-[rgba(255,255,255,0.10)]">
                      <span className="text-sm font-semibold text-[color:var(--cg-text)]">
                        ⌁
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl bg-[color:var(--cg-bg-a55)] px-4 py-3 text-xs leading-5 text-[rgba(199,201,255,0.70)] ring-1 ring-[rgba(255,255,255,0.10)]">
                    {missionBrief.hint}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-6 backdrop-blur">
              <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                {ui.preview}
              </div>
              <div className="mt-4 space-y-3 text-xs text-[color:var(--cg-text-muted)]">
                <div className="flex items-center justify-between gap-3">
                  <span>{ui.tracks}</span>
                  <span className="font-semibold text-[color:var(--cg-text)]">
                    {tracks.length ? tracks.join(', ') : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{ui.frontendMax}</span>
                  <span className="font-semibold text-[color:var(--cg-text)]">
                    {maxDifficultyFrontend
                      ? formatDifficulty(maxDifficultyFrontend)
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{ui.backendMax}</span>
                  <span className="font-semibold text-[color:var(--cg-text)]">
                    {maxDifficultyBackend
                      ? formatDifficulty(maxDifficultyBackend)
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{ui.autosave}</span>
                  <span className="font-semibold text-[color:var(--cg-text)]">
                    {ui.on}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            type="button"
            className={cx(
              'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition',
              stepIndex === 0
                ? 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] opacity-60'
                : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[color:var(--cg-container-a22)]'
            )}
            disabled={stepIndex === 0}
            onClick={goBack}
          >
            ← Back
          </button>

          <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
            STEP {stepIndex + 1} / {steps.length} · ANSWER_REQUIRED=
            {String(!canProceed).toUpperCase()}
          </div>

          {step === 'finish' ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--cg-green)] px-4 py-2 text-xs font-semibold text-[#0f0b3c] shadow-[0_16px_60px_rgba(74,222,128,0.18)] transition hover:bg-[color:var(--cg-green-hover)] active:brightness-95"
              onClick={finalizeAndNavigateToPractice}
            >
              Practice <span className="text-[14px] leading-none">↯</span>
            </button>
          ) : (
            <button
              type="button"
              className={cx(
                'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition active:brightness-95',
                canProceed
                  ? 'bg-[color:var(--cg-green)] text-[#0f0b3c] shadow-[0_16px_60px_rgba(74,222,128,0.18)] hover:bg-[color:var(--cg-green-hover)]'
                  : 'cursor-not-allowed bg-[rgba(74,222,128,0.20)] text-[rgba(15,11,60,0.55)] shadow-none'
              )}
              onClick={goNext}
            >
              Next <span className="text-[14px] leading-none">↯</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingAssessment;