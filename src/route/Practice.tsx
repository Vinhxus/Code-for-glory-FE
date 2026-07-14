import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels';
import SideNav from '../components/SideNav';
import { updateNodeProgress } from '../services/learningPathApi';
import {
  getPracticeSubmissions,
  getProgressSummary,
  runPracticeCode,
  submitPracticeCode,
  type ChapterProgressSummary,
  type JudgeRunResult,
  type ProgressSummaryResponse,
  type SubmissionRecord,
  type SubmissionStatus,
} from '../services/practiceApi';
import { useSettingsStore } from '../store/settings';
import {
  PRACTICE_SOLUTIONS,
  pickSolutionCode,
  type PracticeLanguage,
} from '../feature/practice/practiceSolutions';
import { TheoryViewer } from './TheoryViewer';
import { AiMentorBubble } from '../feature/ai-mentor/components/AiMentorBubble.tsx';
import { AiMentorDrawer } from '../feature/ai-mentor/components/AiMentorDrawer.tsx';
import { useAiMentorStore } from '../feature/ai-mentor/store/aiMentorStore.ts';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const STORAGE_KEY = 'cg_survey_v2';
const PRACTICE_LANG_KEY = 'cg_practice_language_v1';

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

type PracticeSolutionCard = {
  id: string;
  title: string;
  author: string;
  tags: string[];
  upvotes: string;
  views: string;
  code: string;
  explanation: string;
};

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

type JudgeTemplate = {
  id: string;
  title: string;
  input: string;
  expected: string;
  match: (source: string) => boolean;
  successText: string;
  failureText: string;
};

type JudgeRunState = JudgeRunResult & {
  fingerprint: string;
};

function sourceHasAll(source: string, patterns: RegExp[]) {
  return patterns.every((pattern) => pattern.test(source));
}

function sourceHasAny(source: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(source));
}

function buildJudgeTemplates(
  item: PracticeCatalogItem | undefined,
  practice: PracticeItem,
  language: PracticeLanguage,
  isVi: boolean
): JudgeTemplate[] {
  const title = (item?.title ?? practice.title).toLowerCase();
  const topic = item?.topic ?? '';
  const templates: JudgeTemplate[] = [];
  const addAll = (
    id: string,
    caseTitle: string,
    input: string,
    expected: string,
    patterns: RegExp[],
    successText: string,
    failureText: string
  ) => {
    templates.push({
      id,
      title: caseTitle,
      input,
      expected,
      match: (source) => sourceHasAll(source, patterns),
      successText,
      failureText,
    });
  };
  const addAny = (
    id: string,
    caseTitle: string,
    input: string,
    expected: string,
    patterns: RegExp[],
    successText: string,
    failureText: string
  ) => {
    templates.push({
      id,
      title: caseTitle,
      input,
      expected,
      match: (source) => sourceHasAny(source, patterns),
      successText,
      failureText,
    });
  };

  if (title.includes('basic html structure') || topic === 'HTML & Semantics') {
    addAll(
      'html-shell',
      isVi ? 'Bộ khung HTML5' : 'HTML5 shell',
      isVi ? 'Tạo bộ khung tài liệu' : 'Create the document shell',
      '`<!doctype html>`, `<html>`, `<head>`, `<body>`',
      [/<!doctype html>/i, /<html\b/i, /<head\b/i, /<body\b/i],
      isVi ? 'Đã có bộ khung tài liệu chuẩn.' : 'Document shell looks valid.',
      isVi
        ? 'Thiếu `doctype`, `html`, `head` hoặc `body`.'
        : 'Missing `doctype`, `html`, `head`, or `body`.'
    );
    addAny(
      'html-metadata',
      isVi ? 'Metadata cơ bản' : 'Basic metadata',
      isVi ? 'Bổ sung metadata trang' : 'Add page metadata',
      '`<title>` hoặc thẻ `meta viewport`',
      [/<title>[\s\S]*<\/title>/i, /meta[^>]+name=["']viewport["']/i],
      isVi ? 'Metadata cơ bản đã có.' : 'Page metadata is present.',
      isVi
        ? 'Nên thêm `title` hoặc `meta viewport`.'
        : 'Add a `title` or `meta viewport` tag.'
    );
    addAny(
      'semantic-landmarks',
      isVi ? 'Landmark semantics' : 'Semantic landmarks',
      isVi ? 'Dùng thẻ có nghĩa cho layout' : 'Use semantic layout tags',
      '`main`, `header`, `section`, `article`, `footer`, `nav`, hoặc `aside`',
      [
        /<main\b/i,
        /<header\b/i,
        /<section\b/i,
        /<article\b/i,
        /<footer\b/i,
        /<nav\b/i,
        /<aside\b/i,
      ],
      isVi
        ? 'Đã dùng landmark/semantic tag.'
        : 'Semantic landmark tags are present.',
      isVi
        ? 'Nên thay `div` chung chung bằng thẻ semantic.'
        : 'Replace generic wrappers with semantic tags.'
    );
  }

  if (topic === 'CSS & Layout') {
    addAny(
      'layout-engine',
      isVi ? 'Cơ chế layout' : 'Layout engine',
      isVi ? 'Tạo layout chính' : 'Create the main layout',
      '`display: flex` hoặc `display: grid`',
      [/display\s*:\s*flex/i, /display\s*:\s*grid/i],
      isVi ? 'Đã có cơ chế layout rõ ràng.' : 'A layout engine is defined.',
      isVi
        ? 'Thiếu `display: flex` hoặc `display: grid`.'
        : 'Missing `display: flex` or `display: grid`.'
    );
    addAny(
      'layout-spacing',
      isVi ? 'Spacing ổn định' : 'Stable spacing',
      isVi ? 'Giữ nhịp spacing rõ ràng' : 'Keep spacing consistent',
      '`gap`, `padding`, hoặc `margin`',
      [/\bgap\s*:/i, /\bpadding\s*:/i, /\bmargin\s*:/i],
      isVi ? 'Đã có spacing cơ bản.' : 'Spacing rules are present.',
      isVi
        ? 'Nên thêm `gap`, `padding` hoặc `margin`.'
        : 'Add `gap`, `padding`, or `margin`.'
    );
    if (title.includes('responsive')) {
      addAny(
        'layout-responsive',
        isVi ? 'Responsive breakpoint' : 'Responsive breakpoint',
        isVi ? 'Thích ứng màn hình nhỏ' : 'Adapt to small screens',
        '`@media` hoặc `minmax()`',
        [/@media/i, /minmax\s*\(/i],
        isVi
          ? 'Đã có tín hiệu responsive.'
          : 'Responsive behavior is represented.',
        isVi
          ? 'Thiếu breakpoint hoặc chiến lược responsive.'
          : 'Missing a responsive breakpoint or strategy.'
      );
    } else if (title.includes('sticky')) {
      addAll(
        'layout-sticky',
        isVi ? 'Sticky sidebar' : 'Sticky sidebar',
        isVi ? 'Giữ sidebar bám theo scroll' : 'Keep the sidebar sticky',
        '`position: sticky`',
        [/position\s*:\s*sticky/i],
        isVi
          ? 'Sidebar đã được cấu hình sticky.'
          : 'Sticky sidebar is configured.',
        isVi
          ? 'Thiếu `position: sticky` cho sidebar.'
          : 'Missing `position: sticky` for the sidebar.'
      );
    } else if (title.includes('grid')) {
      addAll(
        'layout-grid-columns',
        isVi ? 'Grid columns' : 'Grid columns',
        isVi ? 'Định nghĩa số cột grid' : 'Define grid columns',
        '`grid-template-columns`',
        [/grid-template-columns\s*:/i],
        isVi ? 'Đã cấu hình cột grid.' : 'Grid columns are configured.',
        isVi
          ? 'Thiếu `grid-template-columns`.'
          : 'Missing `grid-template-columns`.'
      );
    } else if (title.includes('mobile navigation')) {
      addAny(
        'layout-layering',
        isVi ? 'Layering menu' : 'Menu layering',
        isVi ? 'Quản lý lớp hiển thị menu' : 'Manage menu stacking',
        '`position: fixed`, `absolute`, `z-index`, hoặc `transform`',
        [
          /position\s*:\s*fixed/i,
          /position\s*:\s*absolute/i,
          /\bz-index\s*:/i,
          /\btransform\s*:/i,
        ],
        isVi ? 'Đã có xử lý layering.' : 'Layering strategy is present.',
        isVi
          ? 'Thiếu xử lý positioning/layering cho menu.'
          : 'Missing menu positioning or layering logic.'
      );
    }
  }

  if (topic === 'Accessibility') {
    addAny(
      'a11y-labelling',
      isVi ? 'Nhãn truy cập' : 'Accessible labeling',
      isVi ? 'Gắn nhãn cho control' : 'Label interactive controls',
      '`label`, `aria-label`, hoặc `aria-labelledby`',
      [/<label\b/i, /aria-label=/i, /aria-labelledby=/i],
      isVi ? 'Đã có nhãn truy cập.' : 'Accessible labels are present.',
      isVi
        ? 'Thiếu `label` hoặc thuộc tính ARIA cho control.'
        : 'Missing `label` or ARIA labelling.'
    );
    addAny(
      'a11y-feedback',
      isVi ? 'Phản hồi lỗi' : 'Accessible feedback',
      isVi
        ? 'Thông báo lỗi/trạng thái rõ ràng'
        : 'Expose errors or status updates',
      '`aria-invalid`, `aria-describedby`, `aria-live`, hoặc `role="alert"`',
      [
        /aria-invalid=/i,
        /aria-describedby=/i,
        /aria-live=/i,
        /role=["']alert["']/i,
      ],
      isVi
        ? 'Đã có cơ chế phản hồi truy cập.'
        : 'Accessible feedback is present.',
      isVi
        ? 'Thiếu trạng thái lỗi hoặc live region.'
        : 'Missing error state or live region semantics.'
    );
    addAny(
      'a11y-keyboard',
      isVi ? 'Keyboard support' : 'Keyboard support',
      isVi ? 'Hỗ trợ thao tác bàn phím' : 'Support keyboard interaction',
      '`tabindex`, xử lý `Escape`, `role="dialog"` hoặc `aria-modal`',
      [
        /\btabindex=/i,
        /escape/i,
        /keydown/i,
        /role=["']dialog["']/i,
        /aria-modal=/i,
      ],
      isVi
        ? 'Đã có tín hiệu hỗ trợ bàn phím.'
        : 'Keyboard support is represented.',
      isVi
        ? 'Thiếu keyboard handling hoặc dialog semantics.'
        : 'Missing keyboard handling or dialog semantics.'
    );
  }

  if (topic === 'React') {
    addAny(
      'react-state-source',
      isVi ? 'State nguồn' : 'State source of truth',
      isVi ? 'Quản lý state rõ ràng' : 'Model a clear source of truth',
      '`useState`, `useReducer`, hoặc state object nhất quán',
      [/\buseState\b/i, /\buseReducer\b/i, /set[A-Z][A-Za-z0-9_]*/],
      isVi
        ? 'Đã có state management cơ bản.'
        : 'State management primitives are present.',
      isVi
        ? 'Thiếu state primitive rõ ràng.'
        : 'Missing a clear state primitive.'
    );
    addAny(
      'react-effects',
      isVi ? 'React effects' : 'React effects',
      isVi ? 'Đồng bộ side effect hợp lý' : 'Coordinate side effects',
      '`useEffect`, callback handler, hoặc derived computation',
      [/\buseEffect\b/i, /\buseMemo\b/i, /handle[A-Z][A-Za-z0-9_]*/],
      isVi
        ? 'Đã có effect/handler chính.'
        : 'Core effects or handlers are present.',
      isVi
        ? 'Nên thêm effect hoặc handler cho luồng state.'
        : 'Add an effect or handler for the state flow.'
    );
    if (title.includes('reducer')) {
      addAll(
        'react-reducer',
        isVi ? 'Reducer flow' : 'Reducer flow',
        isVi
          ? 'Dùng reducer cho cập nhật phức tạp'
          : 'Use a reducer for complex updates',
        '`useReducer` và nhánh action',
        [/\buseReducer\b/i, /\bswitch\b/i],
        isVi ? 'Đã có reducer/action flow.' : 'Reducer flow is implemented.',
        isVi
          ? 'Thiếu `useReducer` hoặc nhánh action.'
          : 'Missing `useReducer` or action branching.'
      );
    } else if (title.includes('debounced')) {
      addAll(
        'react-debounce',
        isVi ? 'Debounce effect' : 'Debounce effect',
        isVi ? 'Giảm fetch trùng lặp' : 'Prevent duplicate fetches',
        '`setTimeout` và `clearTimeout`',
        [/\bsetTimeout\b/i, /\bclearTimeout\b/i],
        isVi ? 'Đã có debounce cơ bản.' : 'Debounce primitives are present.',
        isVi
          ? 'Thiếu `setTimeout`/`clearTimeout` cho debounce.'
          : 'Missing `setTimeout`/`clearTimeout` for debouncing.'
      );
    }
  }

  if (topic === 'JavaScript Fundamentals') {
    if (title.includes('array transform')) {
      addAny(
        'js-array-chain',
        isVi ? 'Array pipeline' : 'Array pipeline',
        isVi
          ? 'Xử lý danh sách bằng pipeline'
          : 'Transform lists with a pipeline',
        '`map`, `filter`, hoặc `reduce`',
        [/\.\s*map\s*\(/i, /\.\s*filter\s*\(/i, /\.\s*reduce\s*\(/i],
        isVi
          ? 'Đã có pipeline biến đổi mảng.'
          : 'Array transformation pipeline found.',
        isVi
          ? 'Nên dùng `map`, `filter`, hoặc `reduce`.'
          : 'Use `map`, `filter`, or `reduce`.'
      );
    } else if (title.includes('optional chaining')) {
      addAll(
        'js-optional-chain',
        isVi ? 'Optional chaining' : 'Optional chaining',
        isVi ? 'Bảo vệ truy cập nested' : 'Guard nested property access',
        'Toán tử `?.`',
        [/\?\./],
        isVi ? 'Đã dùng optional chaining.' : 'Optional chaining is present.',
        isVi ? 'Thiếu toán tử `?.`.' : 'Missing the `?.` operator.'
      );
    } else if (title.includes('event loop')) {
      addAny(
        'js-async-order',
        isVi ? 'Async primitives' : 'Async primitives',
        isVi ? 'Mô tả thứ tự tác vụ' : 'Represent async ordering',
        '`Promise`, `setTimeout`, `queueMicrotask`, hoặc `await`',
        [
          /\bPromise\b/i,
          /\bsetTimeout\b/i,
          /\bqueueMicrotask\b/i,
          /\bawait\b/i,
        ],
        isVi ? 'Đã có primitive bất đồng bộ.' : 'Async primitives are present.',
        isVi
          ? 'Thiếu primitive bất đồng bộ để mô tả event loop.'
          : 'Add async primitives to represent event loop ordering.'
      );
    }
  }

  if (topic === 'TypeScript') {
    addAny(
      'ts-types',
      isVi ? 'Kiểu dữ liệu' : 'Type modeling',
      isVi ? 'Mô hình hóa kiểu rõ ràng' : 'Model the contract with types',
      '`type`, `interface`, hoặc generic `<T>`',
      [/\btype\b/i, /\binterface\b/i, /<\s*[A-Z]\w*\s*>/],
      isVi ? 'Đã có mô hình type cơ bản.' : 'Type modeling is present.',
      isVi
        ? 'Thiếu `type`, `interface` hoặc generic.'
        : 'Missing `type`, `interface`, or generics.'
    );
    addAny(
      'ts-safe-contract',
      isVi ? 'Contract an toàn' : 'Safe contract',
      isVi ? 'Hạn chế kiểu mơ hồ' : 'Avoid vague runtime contracts',
      'Khai báo kiểu trả về hoặc union state',
      [/:\s*Promise<[^>]+>/i, /:\s*[A-Z][A-Za-z0-9_<>, ]+/i, /\|\s*\{/],
      isVi
        ? 'Contract trả về đã rõ hơn.'
        : 'Return or state contract is clearer.',
      isVi
        ? 'Nên khai báo kiểu trả về hoặc state union.'
        : 'Add a return type or state union.'
    );
  }

  if (topic === 'State Management') {
    addAny(
      'state-primitives',
      isVi ? 'Store primitive' : 'Store primitive',
      isVi ? 'Dùng store/context rõ ràng' : 'Use a clear state container',
      '`create(`, `useContext`, `useReducer`, hoặc selector',
      [/\bcreate\s*\(/i, /\buseContext\b/i, /\buseReducer\b/i, /\bselector\b/i],
      isVi ? 'Đã có primitive quản lý state.' : 'A state primitive is present.',
      isVi
        ? 'Thiếu store/context/reducer rõ ràng.'
        : 'Missing a clear store/context/reducer.'
    );
    addAny(
      'state-actions',
      isVi ? 'State actions' : 'State actions',
      isVi ? 'Tách hành động cập nhật' : 'Separate update actions',
      'Action hoặc function cập nhật chuyên biệt',
      [/add[A-Z]/, /remove[A-Z]/, /update[A-Z]/, /set[A-Z]/],
      isVi
        ? 'Đã tách được hành động cập nhật.'
        : 'Update actions are separated.',
      isVi
        ? 'Nên tách actions để state dễ đoán hơn.'
        : 'Split state updates into dedicated actions.'
    );
  }

  if (topic === 'Testing') {
    addAny(
      'test-structure',
      isVi ? 'Test structure' : 'Test structure',
      isVi ? 'Tạo bộ khung test' : 'Create the test skeleton',
      '`describe`, `it`, hoặc `test`',
      [/\bdescribe\s*\(/i, /\bit\s*\(/i, /\btest\s*\(/i],
      isVi ? 'Đã có bộ khung test.' : 'Test structure is present.',
      isVi
        ? 'Thiếu `describe`, `it`, hoặc `test`.'
        : 'Missing `describe`, `it`, or `test`.'
    );
    addAll(
      'test-assertion',
      isVi ? 'Assertion' : 'Assertions',
      isVi ? 'Khẳng định hành vi' : 'Assert the expected behavior',
      '`expect(...)`',
      [/\bexpect\s*\(/i],
      isVi ? 'Đã có assertion.' : 'Assertions are present.',
      isVi
        ? 'Thiếu assertion `expect(...)`.'
        : 'Missing `expect(...)` assertions.'
    );
    addAny(
      'test-user-flow',
      isVi ? 'User flow' : 'User flow coverage',
      isVi ? 'Bao phủ tương tác chính' : 'Cover the main interaction',
      '`render`, `screen`, `userEvent`, hoặc `fireEvent`',
      [/\brender\s*\(/i, /\bscreen\./i, /\buserEvent\./i, /\bfireEvent\./i],
      isVi
        ? 'Đã có tín hiệu kiểm thử tương tác.'
        : 'Interaction coverage is present.',
      isVi
        ? 'Nên thêm render/user event cho luồng chính.'
        : 'Add render or user-event coverage for the main flow.'
    );
  }

  if (topic === 'Performance') {
    addAny(
      'perf-core',
      isVi ? 'Tối ưu render' : 'Render optimization',
      isVi ? 'Giảm tính toán dư thừa' : 'Reduce redundant work',
      '`useMemo`, `memo`, `useCallback`, `lazy`, hoặc `Suspense`',
      [
        /\buseMemo\b/i,
        /\bmemo\b/i,
        /\buseCallback\b/i,
        /\blazy\s*\(/i,
        /\bSuspense\b/i,
      ],
      isVi ? 'Đã có primitive tối ưu.' : 'Optimization primitives are present.',
      isVi
        ? 'Thiếu primitive tối ưu như `useMemo` hoặc `lazy`.'
        : 'Missing optimization primitives like `useMemo` or `lazy`.'
    );
    addAny(
      'perf-loading',
      isVi ? 'Loading strategy' : 'Loading strategy',
      isVi ? 'Ưu tiên tài nguyên quan trọng' : 'Prioritize important resources',
      '`loading="lazy"`, `fetchpriority`, hoặc dynamic import',
      [/loading=["']lazy["']/i, /fetchpriority=/i, /\bimport\s*\(/i],
      isVi
        ? 'Đã có chiến lược tải tài nguyên.'
        : 'A loading strategy is present.',
      isVi
        ? 'Nên thêm lazy loading hoặc ưu tiên tải.'
        : 'Add lazy loading or a resource priority strategy.'
    );
  }

  if (topic === 'Forms & Validation') {
    addAny(
      'form-state',
      isVi ? 'Form state' : 'Form state',
      isVi ? 'Theo dõi giá trị form' : 'Track form values',
      '`values`, `form`, `fields`, hoặc `useState`',
      [/\bvalues\b/i, /\bform\b/i, /\bfields\b/i, /\buseState\b/i],
      isVi ? 'Đã có state cho form.' : 'Form state is modeled.',
      isVi
        ? 'Thiếu state/quy ước dữ liệu form.'
        : 'Missing form state modeling.'
    );
    addAny(
      'form-validation',
      isVi ? 'Validation' : 'Validation',
      isVi ? 'Kiểm tra dữ liệu đầu vào' : 'Validate the input',
      '`errors`, `validate`, `schema`, hoặc so khớp field phụ thuộc',
      [/\berrors\b/i, /\bvalidate\b/i, /\bschema\b/i, /confirm/i],
      isVi ? 'Đã có validation logic.' : 'Validation logic is present.',
      isVi
        ? 'Thiếu logic validation hoặc error state.'
        : 'Missing validation logic or error state.'
    );
    if (title.includes('autosave')) {
      addAny(
        'form-persistence',
        isVi ? 'Draft persistence' : 'Draft persistence',
        isVi ? 'Lưu bản nháp an toàn' : 'Persist draft state',
        '`localStorage`, `sessionStorage`, hoặc save draft helper',
        [/\blocalStorage\b/i, /\bsessionStorage\b/i, /saveDraft/i],
        isVi ? 'Đã có lưu bản nháp.' : 'Draft persistence is present.',
        isVi
          ? 'Thiếu cơ chế lưu/khôi phục bản nháp.'
          : 'Missing draft persistence or recovery.'
      );
    }
  }

  if (topic === 'HTTP Fundamentals') {
    addAny(
      'http-status',
      isVi ? 'HTTP status' : 'HTTP status',
      isVi ? 'Trả mã trạng thái phù hợp' : 'Return an appropriate status code',
      '`200`, `201`, `202`, `204`, hoặc `406`',
      [/\b200\b/, /\b201\b/, /\b202\b/, /\b204\b/, /\b406\b/],
      isVi ? 'Đã có status code hợp lý.' : 'An HTTP status code is present.',
      isVi
        ? 'Thiếu status code phù hợp trong response.'
        : 'Missing a suitable status code in the response.'
    );
    addAny(
      'http-response-shape',
      isVi ? 'Response shape' : 'Response shape',
      isVi
        ? 'Giữ contract phản hồi rõ ràng'
        : 'Keep the response contract clear',
      '`status`, `body`, `headers`, hoặc JSON payload',
      [/\bstatus\b/i, /\bbody\b/i, /\bheaders\b/i, /\bjson\b/i],
      isVi
        ? 'Contract phản hồi đã rõ hơn.'
        : 'The response contract is clearer.',
      isVi
        ? 'Thiếu trường `status`, `body`, `headers` hoặc payload rõ ràng.'
        : 'Missing `status`, `body`, `headers`, or a clear payload.'
    );
    if (title.includes('cache header')) {
      addAny(
        'http-cache-headers',
        isVi ? 'Cache headers' : 'Cache headers',
        isVi ? 'Thiết lập header cache' : 'Configure caching headers',
        '`Cache-Control`, `ETag`, hoặc `max-age`',
        [/cache-control/i, /etag/i, /max-age/i],
        isVi ? 'Đã có cache headers.' : 'Cache headers are present.',
        isVi
          ? 'Thiếu `Cache-Control`, `ETag`, hoặc `max-age`.'
          : 'Missing `Cache-Control`, `ETag`, or `max-age`.'
      );
    } else if (title.includes('idempotency')) {
      addAny(
        'http-idempotency',
        isVi ? 'Idempotency guard' : 'Idempotency guard',
        isVi ? 'Ngăn request trùng lặp' : 'Prevent duplicate processing',
        '`Idempotency-Key`, cache key, hoặc replay guard',
        [/idempotency/i, /idempotency-key/i, /\bduplicate\b/i, /\breplay\b/i],
        isVi
          ? 'Đã có idempotency handling.'
          : 'Idempotency handling is present.',
        isVi
          ? 'Thiếu cơ chế chống request trùng lặp.'
          : 'Missing duplicate-request protection.'
      );
    } else if (title.includes('content negotiation')) {
      addAny(
        'http-content-negotiation',
        isVi ? 'Content negotiation' : 'Content negotiation',
        isVi ? 'Đọc header Accept' : 'Read the Accept header',
        '`Accept`, `Content-Type`, hoặc branch JSON/CSV',
        [/\baccept\b/i, /content-type/i, /\bcsv\b/i, /\bjson\b/i],
        isVi
          ? 'Đã có xử lý format phản hồi.'
          : 'Response format branching is present.',
        isVi
          ? 'Thiếu xử lý `Accept`/`Content-Type`.'
          : 'Missing `Accept` or `Content-Type` handling.'
      );
    }
  }

  if (topic === 'API Design') {
    addAny(
      'api-branching',
      isVi ? 'Branch responses' : 'Branch responses',
      isVi ? 'Xử lý nhiều nhánh response' : 'Handle multiple response branches',
      '`if`, `switch`, hoặc branch theo điều kiện request',
      [/\bif\s*\(/i, /\bswitch\s*\(/i, /status/i],
      isVi ? 'Đã có response branching.' : 'Response branching is present.',
      isVi ? 'Thiếu flow rẽ nhánh cho response.' : 'Missing response branching.'
    );
    addAny(
      'api-contract',
      isVi ? 'API contract' : 'API contract',
      isVi ? 'Trả payload nhất quán' : 'Return a consistent payload',
      '`data`, `error`, `cursor`, `items`, hoặc `results`',
      [/\bdata\b/i, /\berror\b/i, /\bcursor\b/i, /\bitems\b/i, /\bresults\b/i],
      isVi
        ? 'API contract đã rõ ràng hơn.'
        : 'API contract fields are present.',
      isVi
        ? 'Thiếu field contract như `data`, `error`, `cursor`...'
        : 'Missing contract fields like `data`, `error`, or `cursor`.'
    );
  }

  if (topic === 'Authentication') {
    addAny(
      'auth-token',
      isVi ? 'Token handling' : 'Token handling',
      isVi ? 'Xử lý token xác thực' : 'Handle authentication tokens',
      '`jwt`, `bearer`, `token`, hoặc session guard',
      [/\bjwt\b/i, /\bbearer\b/i, /\btoken\b/i, /\bguard\b/i],
      isVi ? 'Đã có logic token/guard.' : 'Token or guard logic is present.',
      isVi
        ? 'Thiếu xử lý token hoặc guard xác thực.'
        : 'Missing token or guard handling.'
    );
    addAny(
      'auth-boundaries',
      isVi ? 'Auth boundary' : 'Auth boundary',
      isVi
        ? 'Phân biệt auth và authorization'
        : 'Separate auth and authorization',
      '`role`, `permission`, `scope`, `refresh`, `revoke`, hoặc `expires`',
      [
        /\brole\b/i,
        /\bpermission\b/i,
        /\bscope\b/i,
        /\brefresh\b/i,
        /\brevoke\b/i,
        /\bexpire/i,
      ],
      isVi
        ? 'Ranh giới quyền đã được thể hiện.'
        : 'Authorization boundaries are represented.',
      isVi
        ? 'Thiếu role/permission hoặc vòng đời token.'
        : 'Missing role/permission or token lifecycle handling.'
    );
  }

  if (topic === 'Database') {
    if (language === 'sql') {
      addAll(
        'sql-core',
        isVi ? 'SQL skeleton' : 'SQL skeleton',
        isVi ? 'Viết câu query cơ bản' : 'Write a valid query skeleton',
        '`SELECT ... FROM ...`',
        [/\bselect\b/i, /\bfrom\b/i],
        isVi ? 'Đã có bộ khung SQL.' : 'SQL skeleton is present.',
        isVi ? 'Thiếu `SELECT` hoặc `FROM`.' : 'Missing `SELECT` or `FROM`.'
      );
      addAny(
        'sql-analysis',
        isVi ? 'Aggregation / join' : 'Aggregation / join',
        isVi ? 'Tổng hợp hoặc kết nối dữ liệu' : 'Aggregate or join data',
        '`JOIN`, `GROUP BY`, `SUM`, `COUNT`, hoặc `AVG`',
        [
          /\bjoin\b/i,
          /\bgroup\s+by\b/i,
          /\bsum\s*\(/i,
          /\bcount\s*\(/i,
          /\bavg\s*\(/i,
        ],
        isVi
          ? 'Đã có thao tác tổng hợp/kết nối.'
          : 'Aggregation or joins are present.',
        isVi
          ? 'Thiếu `JOIN`, `GROUP BY` hoặc hàm tổng hợp.'
          : 'Missing `JOIN`, `GROUP BY`, or aggregate functions.'
      );
    } else {
      addAny(
        'db-optimization',
        isVi ? 'DB optimization' : 'DB optimization',
        isVi ? 'Tránh truy vấn dư thừa' : 'Avoid redundant queries',
        '`join`, `include`, `populate`, `batch`, hoặc eager load',
        [
          /\bjoin\b/i,
          /\binclude\b/i,
          /\bpopulate\b/i,
          /\bbatch\b/i,
          /\beager\b/i,
        ],
        isVi
          ? 'Đã có hướng tối ưu truy vấn.'
          : 'Query optimization hints are present.',
        isVi
          ? 'Thiếu tín hiệu tối ưu truy vấn/N+1.'
          : 'Missing query optimization or N+1 mitigation.'
      );
      addAny(
        'db-consistency',
        isVi ? 'Transaction safety' : 'Transaction safety',
        isVi ? 'Giữ tính nhất quán dữ liệu' : 'Protect data consistency',
        '`transaction`, `commit`, `rollback`, hoặc lock',
        [/\btransaction\b/i, /\bcommit\b/i, /\brollback\b/i, /\block\b/i],
        isVi
          ? 'Đã có cơ chế giữ nhất quán.'
          : 'Consistency mechanisms are present.',
        isVi
          ? 'Thiếu transaction/rollback/lock.'
          : 'Missing transaction, rollback, or lock handling.'
      );
    }
  }

  if (topic === 'Caching') {
    addAny(
      'cache-key',
      isVi ? 'Cache strategy' : 'Cache strategy',
      isVi
        ? 'Xác định cache key hoặc read path'
        : 'Define a cache key or read path',
      '`cache`, `redis`, `key`, hoặc `get/set`',
      [/\bcache\b/i, /\bredis\b/i, /\bkey\b/i, /\bget\b/i, /\bset\b/i],
      isVi ? 'Đã có chiến lược cache cơ bản.' : 'A cache strategy is present.',
      isVi
        ? 'Thiếu cache key hoặc read/write path.'
        : 'Missing a cache key or read/write path.'
    );
    addAny(
      'cache-freshness',
      isVi ? 'Freshness policy' : 'Freshness policy',
      isVi ? 'Quản lý độ tươi dữ liệu' : 'Manage data freshness',
      '`ttl`, `max-age`, `stale-while-revalidate`, hoặc invalidation',
      [/\bttl\b/i, /max-age/i, /stale-while-revalidate/i, /\binvalid/i],
      isVi ? 'Đã có policy độ tươi dữ liệu.' : 'A freshness policy is present.',
      isVi
        ? 'Thiếu TTL, SWR hoặc invalidation.'
        : 'Missing TTL, SWR, or invalidation logic.'
    );
  }

  if (topic === 'Security') {
    addAny(
      'security-guard',
      isVi ? 'Security guard' : 'Security guard',
      isVi ? 'Thêm lớp bảo vệ đầu vào' : 'Add a protection layer',
      '`rateLimit`, `throttle`, `sanitize`, `escape`, hoặc `validate`',
      [
        /\brateLimit\b/i,
        /\bthrottle\b/i,
        /\bsanitize\b/i,
        /\bescape\b/i,
        /\bvalidate\b/i,
      ],
      isVi ? 'Đã có lớp bảo vệ cơ bản.' : 'A security guard is present.',
      isVi
        ? 'Thiếu rate-limit hoặc sanitization/validation.'
        : 'Missing rate limiting or sanitization/validation.'
    );
    addAny(
      'security-secrets',
      isVi ? 'Secret hygiene' : 'Secret hygiene',
      isVi ? 'Giữ secrets/config an toàn' : 'Handle secrets safely',
      '`process.env`, `secret`, `rotation`, `audit`, hoặc expiration',
      [
        /\bprocess\.env\b/i,
        /\bsecret\b/i,
        /\brotation\b/i,
        /\baudit\b/i,
        /\bexpire/i,
      ],
      isVi
        ? 'Đã có dấu hiệu quản lý secrets.'
        : 'Secret management hints are present.',
      isVi
        ? 'Thiếu xử lý secrets hoặc audit/expiration.'
        : 'Missing secret handling or audit/expiration logic.'
    );
  }

  if (topic === 'Node.js Runtime') {
    addAny(
      'node-stream-or-lifecycle',
      isVi ? 'Runtime primitive' : 'Runtime primitive',
      isVi
        ? 'Dùng primitive runtime phù hợp'
        : 'Use the right runtime primitive',
      '`stream`, `pipeline`, `SIGTERM`, `close`, `dispose`, hoặc cleanup',
      [
        /\bstream\b/i,
        /\bpipeline\b/i,
        /\bSIGTERM\b/i,
        /\bclose\b/i,
        /\bdispose\b/i,
        /\bcleanup\b/i,
      ],
      isVi
        ? 'Đã có primitive runtime phù hợp.'
        : 'Runtime primitives are present.',
      isVi
        ? 'Thiếu stream/lifecycle cleanup.'
        : 'Missing streaming or lifecycle cleanup logic.'
    );
    addAny(
      'node-stability',
      isVi ? 'Ổn định tiến trình' : 'Process stability',
      isVi ? 'Bảo vệ tiến trình dài hạn' : 'Protect long-running processes',
      '`try/catch`, listener cleanup, hoặc drain/shutdown flow',
      [
        /\btry\b/i,
        /\bcatch\b/i,
        /\bremoveListener\b/i,
        /\bshutdown\b/i,
        /\bdrain\b/i,
      ],
      isVi ? 'Đã có xử lý ổn định tiến trình.' : 'Stability logic is present.',
      isVi
        ? 'Thiếu cleanup/listener drain hoặc shutdown flow.'
        : 'Missing cleanup, drain, or shutdown handling.'
    );
  }

  if (topic === 'Observability') {
    addAny(
      'obs-logging',
      isVi ? 'Structured logs' : 'Structured logs',
      isVi ? 'Gắn log có cấu trúc' : 'Add structured logging',
      '`logger`, `traceId`, `requestId`, `span`, hoặc context',
      [
        /\blogger\b/i,
        /\btraceId\b/i,
        /\brequestId\b/i,
        /\bspan\b/i,
        /\bcontext\b/i,
      ],
      isVi
        ? 'Đã có log/trace context.'
        : 'Logging or trace context is present.',
      isVi
        ? 'Thiếu logger hoặc trace/request id.'
        : 'Missing logger or trace/request identifiers.'
    );
    addAny(
      'obs-alerting',
      isVi ? 'Alert / metrics' : 'Alerts / metrics',
      isVi ? 'Theo dõi chỉ số hoặc alert' : 'Track metrics or alerts',
      '`metric`, `counter`, `histogram`, `alert`, hoặc `slo`',
      [
        /\bmetric\b/i,
        /\bcounter\b/i,
        /\bhistogram\b/i,
        /\balert\b/i,
        /\bslo\b/i,
      ],
      isVi
        ? 'Đã có tín hiệu observability phụ trợ.'
        : 'Supporting observability signals are present.',
      isVi
        ? 'Thiếu metric/counter/alert.'
        : 'Missing metrics, counters, or alerting logic.'
    );
  }

  if (topic === 'Messaging & Queues') {
    addAny(
      'mq-message-flow',
      isVi ? 'Message flow' : 'Message flow',
      isVi ? 'Quản lý vòng đời message' : 'Manage the message lifecycle',
      '`queue`, `consumer`, `publish`, `ack`, hoặc `retry`',
      [/\bqueue\b/i, /\bconsumer\b/i, /\bpublish\b/i, /\back\b/i, /\bretry\b/i],
      isVi ? 'Đã có flow xử lý message.' : 'Message flow is present.',
      isVi
        ? 'Thiếu queue/consumer/retry flow.'
        : 'Missing queue, consumer, or retry flow.'
    );
    addAny(
      'mq-reliability',
      isVi ? 'Reliability guard' : 'Reliability guard',
      isVi
        ? 'Bảo vệ khỏi duplicate/poison message'
        : 'Protect against duplicate or poison messages',
      '`dlq`, `idempotent`, `outbox`, `dedupe`, hoặc `replay`',
      [/\bdlq\b/i, /\bidempot/i, /\boutbox\b/i, /\bdedupe\b/i, /\breplay\b/i],
      isVi ? 'Đã có cơ chế reliability.' : 'Reliability handling is present.',
      isVi
        ? 'Thiếu DLQ/idempotency/outbox.'
        : 'Missing DLQ, idempotency, or outbox handling.'
    );
  }

  if (topic === 'Concurrency') {
    addAny(
      'concurrency-primitive',
      isVi ? 'Concurrency primitive' : 'Concurrency primitive',
      isVi ? 'Dùng primitive xử lý cạnh tranh' : 'Use a concurrency primitive',
      '`async`, `await`, `queue`, `lock`, `mutex`, hoặc worker',
      [
        /\basync\b/i,
        /\bawait\b/i,
        /\bqueue\b/i,
        /\block\b/i,
        /\bmutex\b/i,
        /\bworker\b/i,
      ],
      isVi
        ? 'Đã có primitive đồng thời.'
        : 'Concurrency primitives are present.',
      isVi
        ? 'Thiếu async/queue/lock/worker.'
        : 'Missing async, queue, lock, or worker handling.'
    );
    addAny(
      'concurrency-safety',
      isVi ? 'No overlap' : 'No-overlap safety',
      isVi
        ? 'Ngăn job trùng / race condition'
        : 'Prevent overlap or race conditions',
      '`retry`, `backoff`, `transaction`, `dedupe`, `cron`, hoặc `schedule`',
      [
        /\bretry\b/i,
        /\bbackoff\b/i,
        /\btransaction\b/i,
        /\bdedupe\b/i,
        /\bcron\b/i,
        /\bschedule\b/i,
      ],
      isVi
        ? 'Đã có cơ chế an toàn đồng thời.'
        : 'Concurrency safety signals are present.',
      isVi
        ? 'Thiếu retry/backoff/transaction hoặc lịch không chồng.'
        : 'Missing retry, backoff, transaction, or no-overlap scheduling.'
    );
  }

  if (templates.length === 0) {
    addAny(
      'generic-solution-shape',
      isVi ? 'Core solution shape' : 'Core solution shape',
      practice.title,
      isVi
        ? 'Có ít nhất một primitive thể hiện lời giải'
        : 'Include at least one clear solution primitive',
      [
        /\bfunction\b/i,
        /\bclass\b/i,
        /\basync\b/i,
        /=>/,
        /<main\b/i,
        /display\s*:/i,
      ],
      isVi ? 'Đã có khung lời giải.' : 'A solution skeleton is present.',
      isVi ? 'Code vẫn còn quá trống.' : 'The solution is still too empty.'
    );
  }

  if (templates.length < 3) {
    addAny(
      'generic-readability',
      isVi ? 'Readable structure' : 'Readable structure',
      isVi ? 'Chia nhỏ lời giải rõ ràng' : 'Keep the implementation readable',
      isVi
        ? 'Có comment, helper, hoặc phân tách logic'
        : 'Use comments, helpers, or structured blocks',
      [/\/\//, /#/, /\/\*/, /\breturn\b/i, /\bconst\b/i, /\blet\b/i],
      isVi
        ? 'Cấu trúc lời giải khá rõ.'
        : 'The solution structure is readable.',
      isVi
        ? 'Nên chia nhỏ logic hoặc thêm comment/hàm phụ.'
        : 'Break the logic into clearer blocks or helpers.'
    );
  }

  return templates.slice(0, 4);
}

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
    id: 'fe-semantic-article',
    title: 'Semantic Article Landmarks',
    summary:
      'Restructure a blog article using semantic landmarks, headings, and supporting regions.',
    topic: 'HTML & Semantics',
    difficulty: 'Easy',
    track: 'Frontend',
    acceptanceRate: '88.6%',
    solvedCount: '15.2K',
    estimatedTime: '14 min',
    tags: ['HTML', 'Landmarks', 'Content Structure'],
  },
  {
    id: 'fe-pricing-card-markup',
    title: 'Accessible Pricing Card Markup',
    summary:
      'Turn a visual pricing mock into semantic markup with accessible labels and hierarchy.',
    topic: 'HTML & Semantics',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '73.8%',
    solvedCount: '9.8K',
    estimatedTime: '16 min',
    tags: ['HTML', 'Accessibility', 'ARIA'],
  },
  {
    id: 'fe-dashboard-landmarks',
    title: 'Dashboard Landmark Cleanup',
    summary:
      'Audit a dashboard page and replace div soup with meaningful document structure.',
    topic: 'HTML & Semantics',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '66.4%',
    solvedCount: '7.1K',
    estimatedTime: '18 min',
    tags: ['HTML', 'Semantics', 'Audit'],
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
    id: 'fe-sticky-sidebar',
    title: 'Sticky Dashboard Sidebar',
    summary:
      'Build a two-column dashboard with a sticky sidebar and resilient content flow.',
    topic: 'CSS & Layout',
    difficulty: 'Easy',
    track: 'Frontend',
    acceptanceRate: '81.1%',
    solvedCount: '12.7K',
    estimatedTime: '17 min',
    tags: ['CSS', 'Positioning', 'Dashboard'],
  },
  {
    id: 'fe-grid-gallery',
    title: 'CSS Grid Product Gallery',
    summary:
      'Lay out a product grid with featured cards, wrapping behavior, and clean spacing.',
    topic: 'CSS & Layout',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '69.3%',
    solvedCount: '8.9K',
    estimatedTime: '19 min',
    tags: ['CSS Grid', 'Cards', 'Responsive'],
  },
  {
    id: 'fe-mobile-nav-sheet',
    title: 'Mobile Navigation Sheet',
    summary:
      'Create a slide-down mobile menu layout that preserves spacing and stacking order.',
    topic: 'CSS & Layout',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '64.7%',
    solvedCount: '7.6K',
    estimatedTime: '21 min',
    tags: ['Layout', 'Mobile', 'Layering'],
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
    id: 'fe-multistep-form',
    title: 'Multi-step Form State Machine',
    summary:
      'Refactor a multi-step form so progress, validation, and draft state stay consistent.',
    topic: 'React',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '61.8%',
    solvedCount: '9.1K',
    estimatedTime: '26 min',
    tags: ['React', 'Forms', 'State Machine'],
  },
  {
    id: 'fe-debounced-search',
    title: 'Debounced Search Results',
    summary:
      'Prevent duplicate fetches by debouncing input and syncing loading state correctly.',
    topic: 'React',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '59.5%',
    solvedCount: '8.7K',
    estimatedTime: '22 min',
    tags: ['React', 'Debounce', 'Effects'],
  },
  {
    id: 'fe-kanban-reducer',
    title: 'Kanban Reducer Refactor',
    summary:
      'Move a scattered task board state into a predictable reducer-driven model.',
    topic: 'React',
    difficulty: 'Hard',
    track: 'Frontend',
    acceptanceRate: '48.9%',
    solvedCount: '5.8K',
    estimatedTime: '30 min',
    tags: ['React', 'Reducer', 'Complex State'],
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
    id: 'fe-keyboard-modal',
    title: 'Keyboard Modal Escape',
    summary:
      'Fix focus trapping, escape handling, and return focus behavior in a modal dialog.',
    topic: 'Accessibility',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '57.2%',
    solvedCount: '7.0K',
    estimatedTime: '18 min',
    tags: ['Accessibility', 'Keyboard', 'Modal'],
  },
  {
    id: 'fe-live-region-toast',
    title: 'Live Region Toast Alerts',
    summary:
      'Announce important UI feedback to screen readers without overwhelming users.',
    topic: 'Accessibility',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '54.9%',
    solvedCount: '6.1K',
    estimatedTime: '17 min',
    tags: ['A11y', 'ARIA', 'Announcements'],
  },
  {
    id: 'fe-color-contrast-audit',
    title: 'Color Contrast Audit',
    summary:
      'Improve a component library theme so critical text and actions meet contrast expectations.',
    topic: 'Accessibility',
    difficulty: 'Hard',
    track: 'Frontend',
    acceptanceRate: '46.5%',
    solvedCount: '4.4K',
    estimatedTime: '23 min',
    tags: ['Accessibility', 'Design System', 'Contrast'],
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
    id: 'fe-optimistic-todo-sync',
    title: 'Optimistic Todo Sync',
    summary:
      'Implement optimistic updates while handling rollback and stale server responses.',
    topic: 'API Integration',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '56.8%',
    solvedCount: '6.9K',
    estimatedTime: '24 min',
    tags: ['API', 'Optimistic UI', 'State'],
  },
  {
    id: 'fe-infinite-feed',
    title: 'Infinite Scroll Feed States',
    summary:
      'Handle pagination, loading sentinels, and end-of-list UI in a content feed.',
    topic: 'API Integration',
    difficulty: 'Hard',
    track: 'Frontend',
    acceptanceRate: '44.3%',
    solvedCount: '5.1K',
    estimatedTime: '27 min',
    tags: ['Pagination', 'Infinite Scroll', 'API'],
  },
  {
    id: 'fe-error-boundary-data',
    title: 'Error Boundary Data Screen',
    summary:
      'Design a resilient data screen with retry flows, skeletons, and empty states.',
    topic: 'API Integration',
    difficulty: 'Hard',
    track: 'Frontend',
    acceptanceRate: '41.9%',
    solvedCount: '4.6K',
    estimatedTime: '29 min',
    tags: ['Error Handling', 'Loading States', 'Fetch'],
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
    id: 'be-cache-header-tuning',
    title: 'Cache Header Tuning',
    summary:
      'Return sensible caching headers for static and dynamic API responses.',
    topic: 'HTTP Fundamentals',
    difficulty: 'Easy',
    track: 'Backend',
    acceptanceRate: '82.9%',
    solvedCount: '12.3K',
    estimatedTime: '13 min',
    tags: ['HTTP', 'Caching', 'Headers'],
  },
  {
    id: 'be-idempotency-key',
    title: 'Idempotency Key Checkout',
    summary:
      'Prevent duplicate checkout requests by honoring idempotency semantics on the server.',
    topic: 'HTTP Fundamentals',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '68.8%',
    solvedCount: '8.3K',
    estimatedTime: '20 min',
    tags: ['HTTP', 'Idempotency', 'Payments'],
  },
  {
    id: 'be-content-negotiation',
    title: 'Content Negotiation Handler',
    summary:
      'Return the right format and status when clients ask for JSON, CSV, or unsupported media.',
    topic: 'HTTP Fundamentals',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '63.4%',
    solvedCount: '6.8K',
    estimatedTime: '19 min',
    tags: ['HTTP', 'Headers', 'Serialization'],
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
    id: 'be-pagination-contract',
    title: 'Pagination Contract Review',
    summary:
      'Standardize cursor pagination so clients can navigate forward and backward safely.',
    topic: 'API Design',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '58.9%',
    solvedCount: '7.4K',
    estimatedTime: '21 min',
    tags: ['API Design', 'Pagination', 'Contracts'],
  },
  {
    id: 'be-bulk-update-api',
    title: 'Bulk Update Batch API',
    summary:
      'Design a batch mutation endpoint with partial success reporting and validation.',
    topic: 'API Design',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '49.4%',
    solvedCount: '5.5K',
    estimatedTime: '29 min',
    tags: ['REST', 'Validation', 'Batching'],
  },
  {
    id: 'be-webhook-retry-flow',
    title: 'Webhook Retry Response Flow',
    summary:
      'Define stable webhook responses so providers can retry safely without duplicate side effects.',
    topic: 'API Design',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '45.8%',
    solvedCount: '4.8K',
    estimatedTime: '27 min',
    tags: ['Webhooks', 'Reliability', 'API'],
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
    id: 'be-role-permission-check',
    title: 'Role Permission Matrix',
    summary:
      'Separate authentication from authorization by enforcing a clearer role permission matrix.',
    topic: 'Authentication',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '57.6%',
    solvedCount: '7.2K',
    estimatedTime: '24 min',
    tags: ['RBAC', 'Authorization', 'Security'],
  },
  {
    id: 'be-refresh-token-rotation',
    title: 'Refresh Token Rotation',
    summary:
      'Implement token rotation and revoke replayed refresh tokens without breaking sessions.',
    topic: 'Authentication',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '46.7%',
    solvedCount: '5.0K',
    estimatedTime: '31 min',
    tags: ['JWT', 'Refresh Token', 'Security'],
  },
  {
    id: 'be-password-reset-flow',
    title: 'Password Reset Token Flow',
    summary:
      'Design a secure password reset flow with expiration, single use, and audit logging.',
    topic: 'Authentication',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '43.5%',
    solvedCount: '4.3K',
    estimatedTime: '28 min',
    tags: ['Auth', 'Reset Token', 'Security'],
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
    id: 'be-order-aggregation',
    title: 'Order Aggregation Report',
    summary:
      'Summarize order revenue, conversion, and top segments from transactional tables.',
    topic: 'Database',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '53.8%',
    solvedCount: '6.0K',
    estimatedTime: '26 min',
    tags: ['SQL', 'Reporting', 'Aggregation'],
  },
  {
    id: 'be-n-plus-one-fix',
    title: 'N+1 Query Refactor',
    summary:
      'Remove repeated database queries in a feed endpoint while keeping the payload intact.',
    topic: 'Database',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '44.8%',
    solvedCount: '4.9K',
    estimatedTime: '25 min',
    tags: ['Database', 'Performance', 'ORM'],
  },
  {
    id: 'be-transaction-inventory',
    title: 'Transactional Inventory Update',
    summary:
      'Protect stock updates with transaction boundaries so order processing stays consistent.',
    topic: 'Database',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '41.1%',
    solvedCount: '4.1K',
    estimatedTime: '28 min',
    tags: ['Transactions', 'Consistency', 'SQL'],
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
  {
    id: 'be-email-retry-orchestrator',
    title: 'Email Retry Orchestrator',
    summary:
      'Coordinate delayed retries for email jobs while preventing endless retry storms.',
    topic: 'Concurrency',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '52.2%',
    solvedCount: '5.9K',
    estimatedTime: '23 min',
    tags: ['Queues', 'Retries', 'Backoff'],
  },
  {
    id: 'be-race-condition-lock',
    title: 'Race Condition Inventory Lock',
    summary:
      'Fix overselling by introducing safer concurrency control around inventory reservation.',
    topic: 'Concurrency',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '40.6%',
    solvedCount: '4.0K',
    estimatedTime: '30 min',
    tags: ['Concurrency', 'Locks', 'Consistency'],
  },
  {
    id: 'be-background-sync-window',
    title: 'Background Sync Window',
    summary:
      'Schedule periodic sync work so duplicate jobs do not overlap during long-running tasks.',
    topic: 'Concurrency',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '38.7%',
    solvedCount: '3.7K',
    estimatedTime: '33 min',
    tags: ['Scheduling', 'Workers', 'Concurrency'],
  },
  {
    id: 'fe-array-transform-pipeline',
    title: 'Array Transform Pipeline',
    summary:
      'Clean up chained map, filter, and reduce steps so a product feed stays readable and correct.',
    topic: 'JavaScript Fundamentals',
    difficulty: 'Easy',
    track: 'Frontend',
    acceptanceRate: '83.4%',
    solvedCount: '10.8K',
    estimatedTime: '15 min',
    tags: ['JavaScript', 'Array Methods', 'Data Transform'],
  },
  {
    id: 'fe-event-loop-order',
    title: 'Event Loop Timeline',
    summary:
      'Reason about microtasks, timers, and rendering order in an interactive widget.',
    topic: 'JavaScript Fundamentals',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '61.7%',
    solvedCount: '7.6K',
    estimatedTime: '20 min',
    tags: ['JavaScript', 'Event Loop', 'Async'],
  },
  {
    id: 'fe-defensive-optional-chain',
    title: 'Defensive Optional Chaining',
    summary:
      'Refactor brittle nested property access so a profile card survives incomplete API payloads.',
    topic: 'JavaScript Fundamentals',
    difficulty: 'Easy',
    track: 'Frontend',
    acceptanceRate: '79.8%',
    solvedCount: '9.2K',
    estimatedTime: '13 min',
    tags: ['JavaScript', 'Objects', 'Optional Chaining'],
  },
  {
    id: 'fe-typesafe-api-client',
    title: 'Type-safe API Client',
    summary:
      'Model request and response contracts with stronger types so client errors surface earlier.',
    topic: 'TypeScript',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '65.1%',
    solvedCount: '8.4K',
    estimatedTime: '24 min',
    tags: ['TypeScript', 'API', 'Contracts'],
  },
  {
    id: 'fe-discriminated-union-state',
    title: 'Discriminated Union UI State',
    summary:
      'Replace vague loading booleans with a discriminated union for empty, loading, success, and error states.',
    topic: 'TypeScript',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '59.7%',
    solvedCount: '6.8K',
    estimatedTime: '21 min',
    tags: ['TypeScript', 'Union Types', 'State Modeling'],
  },
  {
    id: 'fe-generic-table-props',
    title: 'Generic Table Props',
    summary:
      'Build a reusable data table API without sacrificing type inference for columns and rows.',
    topic: 'TypeScript',
    difficulty: 'Hard',
    track: 'Frontend',
    acceptanceRate: '46.8%',
    solvedCount: '4.9K',
    estimatedTime: '29 min',
    tags: ['TypeScript', 'Generics', 'Components'],
  },
  {
    id: 'fe-zustand-cart-slice',
    title: 'Zustand Cart Slice',
    summary:
      'Split a noisy cart store into focused actions and selectors with predictable updates.',
    topic: 'State Management',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '58.6%',
    solvedCount: '7.3K',
    estimatedTime: '23 min',
    tags: ['State Management', 'Zustand', 'Selectors'],
  },
  {
    id: 'fe-context-render-split',
    title: 'Context Render Split',
    summary:
      'Reduce wasted renders by separating context value concerns in a settings dashboard.',
    topic: 'State Management',
    difficulty: 'Hard',
    track: 'Frontend',
    acceptanceRate: '44.9%',
    solvedCount: '4.5K',
    estimatedTime: '27 min',
    tags: ['React Context', 'Performance', 'State'],
  },
  {
    id: 'fe-realtime-notification-store',
    title: 'Realtime Notification Store',
    summary:
      'Merge websocket events into a client store while keeping unread counts and ordering stable.',
    topic: 'State Management',
    difficulty: 'Hard',
    track: 'Frontend',
    acceptanceRate: '42.3%',
    solvedCount: '4.1K',
    estimatedTime: '31 min',
    tags: ['Realtime', 'Store Design', 'WebSocket'],
  },
  {
    id: 'fe-component-unit-test',
    title: 'Component Unit Test Basics',
    summary:
      'Write focused tests for rendering, user actions, and callback behavior in a small React widget.',
    topic: 'Testing',
    difficulty: 'Easy',
    track: 'Frontend',
    acceptanceRate: '80.2%',
    solvedCount: '9.9K',
    estimatedTime: '17 min',
    tags: ['Testing', 'React', 'Unit Test'],
  },
  {
    id: 'fe-form-interaction-test',
    title: 'Form Interaction Test',
    summary:
      'Cover typing, submit, validation, and disabled button transitions in a signup form.',
    topic: 'Testing',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '62.8%',
    solvedCount: '6.7K',
    estimatedTime: '22 min',
    tags: ['Testing', 'Forms', 'User Events'],
  },
  {
    id: 'fe-a11y-regression-test',
    title: 'Accessibility Regression Test',
    summary:
      'Protect critical semantics and keyboard behavior with a compact accessibility-focused test suite.',
    topic: 'Testing',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '57.4%',
    solvedCount: '5.9K',
    estimatedTime: '20 min',
    tags: ['Testing', 'Accessibility', 'Regression'],
  },
  {
    id: 'fe-large-list-memoization',
    title: 'Large List Memoization',
    summary:
      'Stabilize a filterable results list by reducing unnecessary recalculation and rerendering.',
    topic: 'Performance',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '54.7%',
    solvedCount: '6.1K',
    estimatedTime: '23 min',
    tags: ['Performance', 'Memoization', 'React'],
  },
  {
    id: 'fe-image-loading-budget',
    title: 'Image Loading Budget',
    summary:
      'Improve perceived performance by prioritizing hero assets and deferring non-critical images.',
    topic: 'Performance',
    difficulty: 'Easy',
    track: 'Frontend',
    acceptanceRate: '76.9%',
    solvedCount: '8.1K',
    estimatedTime: '16 min',
    tags: ['Performance', 'Images', 'Loading'],
  },
  {
    id: 'fe-bundle-split-route',
    title: 'Route-level Bundle Split',
    summary:
      'Introduce lazy loading so a dashboard shell loads quickly while heavy views stay code-split.',
    topic: 'Performance',
    difficulty: 'Hard',
    track: 'Frontend',
    acceptanceRate: '45.6%',
    solvedCount: '4.7K',
    estimatedTime: '26 min',
    tags: ['Performance', 'Bundling', 'Lazy Loading'],
  },
  {
    id: 'fe-schema-driven-form',
    title: 'Schema-driven Form Rules',
    summary:
      'Generate dynamic fields from configuration while keeping validation and labels consistent.',
    topic: 'Forms & Validation',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '60.9%',
    solvedCount: '7.5K',
    estimatedTime: '24 min',
    tags: ['Forms', 'Validation', 'Dynamic UI'],
  },
  {
    id: 'fe-dependent-field-validation',
    title: 'Dependent Field Validation',
    summary:
      'Validate related inputs like password confirmation and conditional billing fields without noisy UX.',
    topic: 'Forms & Validation',
    difficulty: 'Medium',
    track: 'Frontend',
    acceptanceRate: '58.1%',
    solvedCount: '6.6K',
    estimatedTime: '19 min',
    tags: ['Forms', 'Validation', 'UX'],
  },
  {
    id: 'fe-draft-autosave-form',
    title: 'Draft Autosave Recovery',
    summary:
      'Persist form drafts safely so accidental refreshes do not wipe multi-step progress.',
    topic: 'Forms & Validation',
    difficulty: 'Hard',
    track: 'Frontend',
    acceptanceRate: '47.1%',
    solvedCount: '5.0K',
    estimatedTime: '28 min',
    tags: ['Forms', 'Autosave', 'State Persistence'],
  },
  {
    id: 'be-redis-cache-aside',
    title: 'Redis Cache Aside',
    summary:
      'Introduce cache-aside reads for a hot endpoint without returning stale data forever.',
    topic: 'Caching',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '57.3%',
    solvedCount: '6.4K',
    estimatedTime: '22 min',
    tags: ['Caching', 'Redis', 'Read Path'],
  },
  {
    id: 'be-stale-while-revalidate',
    title: 'Stale-While-Revalidate API',
    summary:
      'Design a response strategy that serves fast data first and refreshes in the background.',
    topic: 'Caching',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '43.9%',
    solvedCount: '4.2K',
    estimatedTime: '27 min',
    tags: ['Caching', 'SWR', 'Latency'],
  },
  {
    id: 'be-cache-invalidation-feed',
    title: 'Cache Invalidation Feed',
    summary:
      'Invalidate cached product pages after admin edits without blowing away the entire cache space.',
    topic: 'Caching',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '41.8%',
    solvedCount: '3.9K',
    estimatedTime: '29 min',
    tags: ['Caching', 'Invalidation', 'Consistency'],
  },
  {
    id: 'be-rate-limit-login',
    title: 'Rate Limit Login Attempts',
    summary:
      'Throttle abusive login bursts while preserving a reasonable experience for legitimate users.',
    topic: 'Security',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '60.7%',
    solvedCount: '7.1K',
    estimatedTime: '18 min',
    tags: ['Security', 'Rate Limiting', 'Auth'],
  },
  {
    id: 'be-input-sanitization-pipeline',
    title: 'Input Sanitization Pipeline',
    summary:
      'Normalize and validate user-provided content before it reaches the persistence layer.',
    topic: 'Security',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '56.2%',
    solvedCount: '6.2K',
    estimatedTime: '21 min',
    tags: ['Security', 'Validation', 'Sanitization'],
  },
  {
    id: 'be-secret-rotation-audit',
    title: 'Secret Rotation Audit',
    summary:
      'Refactor configuration loading so secrets can rotate without risky manual redeploy habits.',
    topic: 'Security',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '44.5%',
    solvedCount: '4.6K',
    estimatedTime: '25 min',
    tags: ['Security', 'Secrets', 'Operations'],
  },
  {
    id: 'be-stream-large-export',
    title: 'Stream Large CSV Export',
    summary:
      'Replace a memory-heavy export route with a streaming response that handles big datasets safely.',
    topic: 'Node.js Runtime',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '55.1%',
    solvedCount: '6.0K',
    estimatedTime: '24 min',
    tags: ['Node.js', 'Streams', 'Performance'],
  },
  {
    id: 'be-memory-leak-hunt',
    title: 'Memory Leak Hunt',
    summary:
      'Identify and fix a retention bug in a long-lived Node service that keeps growing in memory.',
    topic: 'Node.js Runtime',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '39.9%',
    solvedCount: '3.8K',
    estimatedTime: '30 min',
    tags: ['Node.js', 'Memory', 'Diagnostics'],
  },
  {
    id: 'be-graceful-shutdown-worker',
    title: 'Graceful Shutdown Worker',
    summary:
      'Drain in-flight jobs correctly when a worker receives a shutdown signal during deployment.',
    topic: 'Node.js Runtime',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '53.4%',
    solvedCount: '5.6K',
    estimatedTime: '23 min',
    tags: ['Node.js', 'Lifecycle', 'Workers'],
  },
  {
    id: 'be-contract-test-orders-api',
    title: 'Orders API Contract Test',
    summary:
      'Protect an orders endpoint with contract tests that fail when payload shapes drift unexpectedly.',
    topic: 'Testing',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '58.7%',
    solvedCount: '6.3K',
    estimatedTime: '21 min',
    tags: ['Testing', 'API Contracts', 'Backend'],
  },
  {
    id: 'be-integration-test-auth-flow',
    title: 'Auth Flow Integration Test',
    summary:
      'Cover signup, login, token refresh, and logout behavior with a realistic integration suite.',
    topic: 'Testing',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '55.9%',
    solvedCount: '5.8K',
    estimatedTime: '24 min',
    tags: ['Testing', 'Integration', 'Authentication'],
  },
  {
    id: 'be-failure-injection-worker',
    title: 'Failure Injection Worker Test',
    summary:
      'Simulate downstream failures to ensure retries, dead-lettering, and alerting behave as expected.',
    topic: 'Testing',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '42.7%',
    solvedCount: '4.0K',
    estimatedTime: '28 min',
    tags: ['Testing', 'Reliability', 'Workers'],
  },
  {
    id: 'be-structured-logging-trace',
    title: 'Structured Logging Trace IDs',
    summary:
      'Propagate request and job identifiers so logs from multiple services can be stitched together.',
    topic: 'Observability',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '54.4%',
    solvedCount: '5.7K',
    estimatedTime: '20 min',
    tags: ['Observability', 'Logging', 'Tracing'],
  },
  {
    id: 'be-slo-alert-dedup',
    title: 'SLO Alert Deduplication',
    summary:
      'Reduce noisy monitoring by grouping repeated failures into calmer, more actionable alerts.',
    topic: 'Observability',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '40.8%',
    solvedCount: '3.7K',
    estimatedTime: '26 min',
    tags: ['Observability', 'Alerting', 'SLO'],
  },
  {
    id: 'be-trace-request-hop',
    title: 'Trace Request Hop',
    summary:
      'Carry trace context through API, worker, and database boundaries to preserve end-to-end visibility.',
    topic: 'Observability',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '38.9%',
    solvedCount: '3.5K',
    estimatedTime: '29 min',
    tags: ['Observability', 'Tracing', 'Distributed Systems'],
  },
  {
    id: 'be-outbox-event-publisher',
    title: 'Outbox Event Publisher',
    summary:
      'Publish domain events reliably after database commits using an outbox pattern.',
    topic: 'Messaging & Queues',
    difficulty: 'Hard',
    track: 'Backend',
    acceptanceRate: '43.1%',
    solvedCount: '4.3K',
    estimatedTime: '31 min',
    tags: ['Messaging', 'Outbox', 'Reliability'],
  },
  {
    id: 'be-dlq-investigation',
    title: 'Dead-letter Queue Investigation',
    summary:
      'Classify poison messages and route them to recovery workflows without blocking healthy traffic.',
    topic: 'Messaging & Queues',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '52.8%',
    solvedCount: '5.4K',
    estimatedTime: '23 min',
    tags: ['Queues', 'DLQ', 'Recovery'],
  },
  {
    id: 'be-idempotent-consumer',
    title: 'Idempotent Event Consumer',
    summary:
      'Make an event consumer safe against duplicate deliveries and replayed messages.',
    topic: 'Messaging & Queues',
    difficulty: 'Medium',
    track: 'Backend',
    acceptanceRate: '56.6%',
    solvedCount: '6.1K',
    estimatedTime: '22 min',
    tags: ['Messaging', 'Idempotency', 'Consumers'],
  },
];

function getInitialCodeForCatalogItem(
  item: PracticeCatalogItem,
  lang: PracticeLanguage
): string {
  const markupTopics = new Set([
    'HTML & Semantics',
    'CSS & Layout',
    'Accessibility',
  ]);
  const databaseTopics = new Set(['Database']);
  const backendApiTopics = new Set([
    'HTTP Fundamentals',
    'API Design',
    'Authentication',
    'Caching',
    'Security',
    'Node.js Runtime',
    'Observability',
    'Messaging & Queues',
    'Concurrency',
    'Testing',
  ]);

  if (markupTopics.has(item.topic)) {
    return getInitialCodeForPractice('Basic HTML Structure', lang);
  }

  if (databaseTopics.has(item.topic)) {
    if (lang === 'sql') {
      return (
        '-- Write your SQL query here\n' +
        '-- Focus on correctness, filtering, joins, and readable aliases.\n'
      );
    }
    return getInitialCodeForPractice('Web & Internet Basics', lang);
  }

  if (item.track === 'Frontend') {
    return getInitialCodeForPractice('default', lang);
  }

  if (backendApiTopics.has(item.topic)) {
    return getInitialCodeForPractice('Web & Internet Basics', lang);
  }

  return getInitialCodeForPractice('default', lang);
}

function buildPracticeFromCatalogItem(
  item: PracticeCatalogItem,
  lang: PracticeLanguage
): PracticeItem {
  const difficultyHint =
    item.difficulty === 'Easy'
      ? 'Focus on correctness and clean fundamentals first.'
      : item.difficulty === 'Medium'
        ? 'Balance correctness, maintainability, and edge cases.'
        : 'Think about robustness, edge cases, and production behavior.';

  return {
    title: item.title,
    description:
      `${item.summary}\n\n` +
      `Track: ${item.track}\n` +
      `Topic: ${item.topic}\n` +
      `Estimated time: ${item.estimatedTime}\n` +
      `Difficulty: ${item.difficulty}\n\n` +
      `${difficultyHint}`,
    concept: item.topic,
    conceptDesc:
      `This exercise focuses on ${item.topic.toLowerCase()} with special attention to ${item.tags.join(', ')}. ` +
      `Use the task to practice the kind of trade-offs common in real ${item.track.toLowerCase()} work.`,
    taskDesc:
      `Complete "${item.title}" by solving the core problem described in the summary. ` +
      `Aim for a result that would reasonably hit an acceptance benchmark near ${item.acceptanceRate}, ` +
      `and make sure your solution addresses the tags: ${item.tags.join(', ')}.`,
    initialCode: getInitialCodeForCatalogItem(item, lang),
  };
}

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

function getCoinRewardByDifficulty(difficulty: Difficulty) {
  switch (difficulty) {
    case 'Easy':
      return 100;
    case 'Medium':
      return 200;
    case 'Hard':
      return 300;
    default:
      return 0;
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
  const appLanguage = useSettingsStore((s) => s.language);
  const isVi = appLanguage === 'vi';
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
  const chapterLabel = useMemo(() => {
    if (selectedCatalogItem) {
      return `${selectedCatalogItem.track} · ${selectedCatalogItem.topic}`;
    }
    return `CHAPTER - ${nodeTitle || 'Practice'}`;
  }, [nodeTitle, selectedCatalogItem]);
  const ui = isVi
    ? {
      practiceHub: 'TRUNG TÂM PRACTICE',
      clearFilters: 'Xoá bộ lọc',
      startPracticing: 'Bắt đầu luyện tập',
      curatedPractice: 'BÀI TẬP CHỌN LỌC',
      tracks: 'FRONTEND + BACKEND',
      hubTitle: 'Duyệt bài theo chủ đề trước khi vào workspace code.',
      hubSubtitle:
        'Trang practice giờ hoạt động như một problem hub đúng nghĩa với danh sách chọn lọc, topic chip và bộ lọc rõ ràng hơn.',
      openFirst: 'Mở thử thách đầu tiên',
      frontendTopics: 'Chủ đề Frontend',
      backendTopics: 'Chủ đề Backend',
      totalProblems: 'TỔNG SỐ BÀI',
      totalSubtitle: 'Danh mục bài tập gọn gàng trước khi vào editor.',
      trackSplit: 'TỶ LỆ THEO TRACK',
      topicDirectory: 'DANH MỤC CHỦ ĐỀ',
      discoverByTopic: 'Khám phá thử thách theo chủ đề',
      topicSubtitle:
        'Các topic pill được tối ưu để quét nhanh giống trải nghiệm trên các nền tảng luyện thuật toán.',
      visibleProblems: 'bài đang hiển thị',
      allTopics: 'Tất cả chủ đề',
      frontendPath: 'LỘ TRÌNH FRONTEND',
      frontendPathTitle: 'Chủ đề UI engineering',
      backendPath: 'LỘ TRÌNH BACKEND',
      backendPathTitle: 'Chủ đề service và dữ liệu',
      problems: 'bài',
      problemList: 'DANH SÁCH BÀI',
      browseOpen: 'Duyệt, lọc rồi mở workspace',
      searchChallenges: 'Tìm challenge, chủ đề hoặc tag...',
      all: 'Tất cả',
      easy: 'Dễ',
      medium: 'Trung bình',
      hard: 'Khó',
      problem: 'Bài toán',
      track: 'Track',
      difficulty: 'Độ khó',
      acceptance: 'Tỷ lệ',
      action: 'Hành động',
      noMatching: 'Không có bài phù hợp',
      tryAnother: 'Hãy thử chủ đề khác hoặc xoá bộ lọc hiện tại.',
      allProblems: 'Tất cả bài',
      description: 'Mô tả',
      solutions: 'Lời giải',
      theory: 'Lý Thuyết',
      accepted: 'Đã nhận',
      rate: 'Tỷ lệ',
      task: 'Yêu cầu',
      topics: 'Chủ đề',
      companies: 'Công ty',
      askedBy: 'Thường được hỏi bởi:',
      hint1: 'Gợi ý 1',
      hint2: 'Gợi ý 2',
      hint2Body:
        'Một cách brute force là duyệt mọi cặp số có thể, nhưng sẽ quá chậm. Hãy thử nghĩ theo hướng hash map.',
      similarQuestions: 'Câu hỏi tương tự',
      discussion: 'Thảo luận (2K)',
      discussionBody: 'Khu vực thảo luận cộng đồng sẽ nằm ở đây.',
      searchSolutions: 'Tìm lời giải...',
      share: 'Chia sẻ',
      code: 'Code',
      locked: 'ĐÃ KHOÁ',
      attempt: 'LƯỢT',
      testcase: 'Test case',
      testResult: 'Kết quả test',
      submissions: 'Bài nộp',
      runFirst: 'Bạn cần chạy code trước',
      runToSee: 'Chạy code để xem kết quả test',
      status: 'Trạng thái',
      language: 'Ngôn ngữ',
      runtime: 'Thời gian chạy',
      memory: 'Bộ nhớ',
      notes: 'Ghi chú',
      run: 'Chạy',
      wait: 'ĐỢI',
      submitting: 'ĐANG NỘP...',
      submit: 'Nộp bài',
      chapterProgress: 'Tiến độ theo chủ đề',
      chapterProgressSubtitle:
        'Số bài đã giải theo từng mức độ, giống bảng tiến độ trên LeetCode.',
      solvedBadge: 'Đã giải',
      loadingProgress: 'Đang tải tiến độ...',
      reward: 'Thưởng',
      coinsUnit: 'coins',
      firstSolveReward: 'Thưởng lần solve đầu tiên',
    }
    : {
      practiceHub: 'PRACTICE HUB',
      clearFilters: 'Clear filters',
      startPracticing: 'Start practicing',
      curatedPractice: 'CURATED PRACTICE',
      tracks: 'FRONTEND + BACKEND',
      hubTitle:
        'Browse problems by topic before entering the code workspace.',
      hubSubtitle:
        'The practice page behaves like a proper problem hub with curated lists, topic chips, and clearer filtering.',
      openFirst: 'Open first challenge',
      frontendTopics: 'Frontend topics',
      backendTopics: 'Backend topics',
      totalProblems: 'TOTAL PROBLEMS',
      totalSubtitle:
        'Polished practice catalog instead of jumping straight into the editor.',
      trackSplit: 'TRACK SPLIT',
      topicDirectory: 'TOPIC DIRECTORY',
      discoverByTopic: 'Discover challenges by topic',
      topicSubtitle:
        'Topic pills are intentionally dense and scannable so users can browse the catalog like algorithm platforms.',
      visibleProblems: 'visible problems',
      allTopics: 'All Topics',
      frontendPath: 'FRONTEND PATH',
      frontendPathTitle: 'UI engineering topics',
      backendPath: 'BACKEND PATH',
      backendPathTitle: 'Service and data topics',
      problems: 'problems',
      problemList: 'PROBLEM LIST',
      browseOpen: 'Browse, filter, then open a workspace',
      searchChallenges: 'Search challenges, topics, or tags...',
      all: 'All',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      problem: 'Problem',
      track: 'Track',
      difficulty: 'Difficulty',
      acceptance: 'Acceptance',
      action: 'Action',
      noMatching: 'No matching problems',
      tryAnother: 'Try another topic or clear the current filters.',
      allProblems: 'All problems',
      description: 'Description',
      solutions: 'Solutions',
      theory: 'Theory',
      accepted: 'Accepted',
      rate: 'Rate',
      task: 'The Task',
      topics: 'Topics',
      companies: 'Companies',
      askedBy: 'Frequently asked by:',
      hint1: 'Hint 1',
      hint2: 'Hint 2',
      hint2Body:
        "A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try and think of a hash map.",
      similarQuestions: 'Similar Questions',
      discussion: 'Discussion (2K)',
      discussionBody: 'Community discussion goes here.',
      searchSolutions: 'Search solutions...',
      share: 'Share',
      code: 'Code',
      locked: 'LOCKED',
      attempt: 'ATTEMPT',
      testcase: 'Testcase',
      testResult: 'Test Result',
      submissions: 'Submissions',
      runFirst: 'You must run your code first',
      runToSee: 'Run code to see test results',
      status: 'Status',
      language: 'Language',
      runtime: 'Runtime',
      memory: 'Memory',
      notes: 'Notes',
      run: 'Run',
      wait: 'WAIT',
      submitting: 'SUBMITTING...',
      submit: 'Submit',
      chapterProgress: 'Progress by topic',
      chapterProgressSubtitle:
        'Problems solved per difficulty, similar to the LeetCode progress panel.',
      solvedBadge: 'Solved',
      loadingProgress: 'Loading progress...',
      reward: 'Reward',
      coinsUnit: 'coins',
      firstSolveReward: 'First-solve reward',
    };

  // UI States
  const [leftTab, setLeftTab] = useState<
    'description' | 'solutions' | 'theory'
  >('description');
  const [consoleTab, setConsoleTab] = useState<
    'testcase' | 'testresult' | 'submissions'
  >('testcase');
  const [language, setLanguage] = useState<PracticeLanguage>(() =>
    safeReadPracticeLanguage()
  );
  const currentPractice = useMemo(() => {
    if (selectedCatalogItem) {
      return buildPracticeFromCatalogItem(selectedCatalogItem, language);
    }
    return nodeTitle && !PRACTICE_DATA[nodeTitle]
      ? { ...basePractice, title: nodeTitle }
      : basePractice;
  }, [basePractice, language, nodeTitle, selectedCatalogItem]);
  const [expandedAccordions, setExpandedAccordions] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<'All' | Track>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'All' | Difficulty
  >('All');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  // Tổng hợp Easy/Medium/Hard đã giải theo chapter (topic), kiểu LeetCode.
  // null = chưa load xong (lần đầu vào trang) — tránh nháy UI về "0 đã giải".
  const [progressSummary, setProgressSummary] =
    useState<ProgressSummaryResponse | null>(null);
  const [solutionSearchQuery, setSolutionSearchQuery] = useState('');
  const solutionScopeId = selectedCatalogItem?.id ?? practiceKey;
  const practiceSolutions = useMemo<PracticeSolutionCard[]>(() => {
    if (!selectedCatalogItem) return [];

    const content = PRACTICE_SOLUTIONS[selectedCatalogItem.id];
    const explanation = content
      ? isVi
        ? content.explanation.vi
        : content.explanation.en
      : isVi
        ? 'Chưa có lời giải cho bài này (backend sẽ bổ sung sau).'
        : 'No solution available yet (backend will be added later).';
    const code = content
      ? pickSolutionCode(content, language)
      : isVi
        ? '// TODO: Solution will be added later.'
        : '// TODO: Solution will be added later.';

    return [
      {
        id: `${selectedCatalogItem.id}-official`,
        title: isVi
          ? `Lời giải chuẩn · ${selectedCatalogItem.title}`
          : `Official solution · ${selectedCatalogItem.title}`,
        author: 'TRAE',
        tags: selectedCatalogItem.tags,
        upvotes: selectedCatalogItem.solvedCount,
        views: selectedCatalogItem.acceptanceRate,
        code,
        explanation,
      },
    ];
  }, [isVi, language, selectedCatalogItem]);
  const filteredPracticeSolutions = useMemo(() => {
    const query = solutionSearchQuery.trim();
    if (!query) return practiceSolutions;

    return practiceSolutions.filter((sol) => {
      const haystack = [
        sol.title,
        sol.author,
        sol.tags.join(' '),
        sol.explanation,
        sol.code,
      ].join('\n');
      return includesQuery(haystack, query);
    });
  }, [practiceSolutions, solutionSearchQuery]);
  const [expandedSolutionByPractice, setExpandedSolutionByPractice] = useState<
    Record<string, string | null>
  >({});
  const expandedSolutionId =
    expandedSolutionByPractice[solutionScopeId] ??
    filteredPracticeSolutions[0]?.id ??
    null;

  // Logic States
  const [attempts, setAttempts] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<JudgeRunState | null>(
    null
  );
  const [submissionHistory, setSubmissionHistory] = useState<
    SubmissionRecord[]
  >([]);

  // Toast and responsiveness
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Coin reward notification
  const [coinToast, setCoinToast] = useState<number | null>(null);
  const coinToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCoinToast = useCallback((amount: number) => {
    if (coinToastTimeoutRef.current) clearTimeout(coinToastTimeoutRef.current);
    setCoinToast(amount);
    coinToastTimeoutRef.current = setTimeout(() => setCoinToast(null), 4000);
  }, []);

  // XP reward notification — cùng pattern với coinToast ở trên, tách riêng
  // state để 2 toast có thể hiện đồng thời (giải bài Accepted lần đầu luôn
  // trả về cả coinsEarned lẫn xpEarned cùng lúc từ BE).
  const [xpToast, setXpToast] = useState<number | null>(null);
  const xpToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showXpToast = useCallback((amount: number) => {
    if (xpToastTimeoutRef.current) clearTimeout(xpToastTimeoutRef.current);
    setXpToast(amount);
    xpToastTimeoutRef.current = setTimeout(() => setXpToast(null), 4000);
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      setToast({ message, type });
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 5000);
    },
    []
  );

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(isVi ? 'Đã copy vào clipboard.' : 'Copied to clipboard.', 'success');
      } catch {
        showToast(
          isVi ? 'Không thể copy (trình duyệt chặn).' : 'Copy failed (blocked).',
          'error'
        );
      }
    },
    [isVi, showToast]
  );

  const [isTooSmall, setIsTooSmall] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsTooSmall(window.innerWidth < 1024);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => {
      window.removeEventListener('resize', checkSize);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);
  const getStarterCode = useCallback(
    (lang: PracticeLanguage) =>
      selectedCatalogItem
        ? getInitialCodeForCatalogItem(selectedCatalogItem, lang)
        : getInitialCodeForPractice(practiceKey, lang),
    [selectedCatalogItem, practiceKey]
  );
  const activePracticeId = selectedCatalogItem?.id ?? practiceKey;
  const [code, setCode] = useState(() => getStarterCode(language));

  const monacoLanguage = useMemo(
    () => LANGUAGE_CONFIG[language]?.monaco ?? 'plaintext',
    [language]
  );

  const prevPracticeKeyRef = useRef<string>(activePracticeId);
  const lastStarterRef = useRef<string>(getStarterCode(language));
  const currentFingerprint = useMemo(
    () => `${activePracticeId}:${language}:${code.trim()}`,
    [activePracticeId, language, code]
  );
  const activeRunResult =
    lastRunResult?.fingerprint === currentFingerprint ? lastRunResult : null;
  const displayedCases = activeRunResult?.cases ?? [];
  const resetAiMentor = useAiMentorStore((s) => s.reset);

  const aiMentorContext = useMemo(
    () => ({
      ...(nodeId && /^[a-f\d]{24}$/i.test(nodeId) ? { nodeId } : {}),
      ...(activePracticeId && /^[a-f\d]{24}$/i.test(activePracticeId)
        ? { exerciseId: activePracticeId }
        : {}),
      contextSummary: `Exercise: ${currentPractice.title}. Topic: ${selectedCatalogItem?.topic ?? currentPractice.concept}. ${currentPractice.taskDesc}`,
    }),
    [activePracticeId, nodeId, currentPractice, selectedCatalogItem]
  );

  useEffect(() => {
    // Chỉ reset code khi đổi bài (nodeTitle), không reset khi đổi ngôn ngữ.
    if (prevPracticeKeyRef.current !== activePracticeId) {
      prevPracticeKeyRef.current = activePracticeId;
      const starter = getStarterCode(language);
      lastStarterRef.current = starter;
      setTimeout(() => setCode(starter), 0);
      setLastRunResult(null);
      setAttempts(0);
      setIsCooldown(false);
      setCooldownTime(0);
      setIsLocked(false);
      setConsoleTab('testcase');
      resetAiMentor();
    }
  }, [activePracticeId, language, getStarterCode, resetAiMentor]);

  useEffect(() => {
    let isMounted = true;
    void getPracticeSubmissions(activePracticeId)
      .then((items) => {
        if (!isMounted) return;
        setSubmissionHistory(items);
      })
      .catch(() => {
        if (!isMounted) return;
        setSubmissionHistory([]);
      });

    return () => {
      isMounted = false;
    };
  }, [activePracticeId]);

  // Tổng hợp Easy/Medium/Hard theo chapter + danh sách bài đã Accepted,
  // dùng để tick ✔ trên mỗi problem row và hiện khối "Chapter Progress"
  // kiểu LeetCode ở Hub view. Tách thành callback riêng để gọi lại ngay
  // sau khi submit Accepted, không phải chờ user rời trang rồi quay lại.
  const refreshProgressSummary = useCallback(async () => {
    try {
      const summary = await getProgressSummary();
      setProgressSummary(summary);
    } catch (error) {
      // Best-effort: không tick được cũng không nên chặn luồng làm bài,
      // chỉ log để dễ debug khi BE chưa có endpoint này.
      console.warn('Không tải được tiến độ chapter:', error);
    }
  }, []);

  useEffect(() => {
    void refreshProgressSummary();
  }, [refreshProgressSummary]);

  // Set tra cứu nhanh "bài này đã Accepted chưa" — dùng ở cả Hub view
  // (tick trên list) lẫn workspace view (badge "Đã hoàn thành" trên đề bài).
  const solvedPracticeIdSet = useMemo(
    () => new Set(progressSummary?.solvedPracticeIds ?? []),
    [progressSummary]
  );

  // Map nhanh chapter (topic) -> breakdown Easy/Medium/Hard đã giải, để
  // render khối Chapter Progress mà không phải Array.find() mỗi lần render.
  const chapterProgressMap = useMemo(() => {
    const map = new Map<string, ChapterProgressSummary>();
    (progressSummary?.chapters ?? []).forEach((c) => map.set(c.chapter, c));
    return map;
  }, [progressSummary]);

  // Tổng "total" theo chapter+difficulty từ chính PRACTICE_CATALOG tĩnh ở
  // FE — ghép với số "đã giải" từ BE để ra dạng "X/Y" giống LeetCode.
  // Tính 1 lần duy nhất vì PRACTICE_CATALOG là hằng số, không đổi.
  const chapterTotalsByTopic = useMemo(() => {
    const map = new Map<
      string,
      { easy: number; medium: number; hard: number; total: number }
    >();
    PRACTICE_CATALOG.forEach((item) => {
      if (!map.has(item.topic)) {
        map.set(item.topic, { easy: 0, medium: 0, hard: 0, total: 0 });
      }
      const bucket = map.get(item.topic)!;
      bucket.total += 1;
      if (item.difficulty === 'Medium') bucket.medium += 1;
      else if (item.difficulty === 'Hard') bucket.hard += 1;
      else bucket.easy += 1;
    });
    return map;
  }, []);

  const handleChangeLanguage = (next: PracticeLanguage) => {
    const prev = language;
    if (next === prev) return;

    const prevStarter = getStarterCode(prev);
    const nextStarter = getStarterCode(next);

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
    const starter = getStarterCode(language);
    setCode(starter);
    lastStarterRef.current = starter;
  };

  const handleApplySolutionCode = useCallback(
    (solutionCode: string) => {
      const starter = getStarterCode(language);
      const normalizedCurrent = code.trim();
      const normalizedStarter = starter.trim();
      const normalizedSolution = solutionCode.trim();
      const hasUserEdits =
        normalizedCurrent !== '' &&
        normalizedCurrent !== normalizedStarter &&
        normalizedCurrent !== normalizedSolution;

      if (hasUserEdits) {
        const ok = window.confirm(
          isVi
            ? 'Bạn đang có code đã chỉnh sửa. Dán đáp án mẫu sẽ ghi đè editor hiện tại.\n\nOK: ghi đè bằng đáp án mẫu\nCancel: giữ nguyên editor'
            : 'You have edited code in the editor. Applying the official solution will overwrite it.\n\nOK: replace with the official solution\nCancel: keep current editor content'
        );
        if (!ok) return;
      }

      setCode(solutionCode);
      showToast(
        isVi
          ? 'Đã đưa code mẫu vào editor.'
          : 'Official solution applied to the editor.',
        'success'
      );
    },
    [code, getStarterCode, isVi, language, showToast]
  );

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
  const frontendTopicList = useMemo(
    () =>
      Array.from(
        new Set(
          PRACTICE_CATALOG.filter((item) => item.track === 'Frontend').map(
            (item) => item.topic
          )
        )
      ),
    []
  );
  const backendTopicList = useMemo(
    () =>
      Array.from(
        new Set(
          PRACTICE_CATALOG.filter((item) => item.track === 'Backend').map(
            (item) => item.topic
          )
        )
      ),
    []
  );
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

  const runCurrentSolution = async () => {
    const result = await runPracticeCode({
      practiceId: activePracticeId,
      title: currentPractice.title,
      topic: selectedCatalogItem?.topic ?? currentPractice.concept,
      track: selectedCatalogItem?.track ?? 'Frontend',
      language,
      code,
      locale: isVi ? 'vi' : 'en',
      nodeId: nodeId || undefined,
    });
    const nextResult = {
      ...result,
      fingerprint: currentFingerprint,
    };
    setLastRunResult(nextResult);
    return nextResult;
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      await runCurrentSolution();
      setConsoleTab('testresult');
    } catch (error) {
      console.error('Lỗi chạy test:', error);
      showToast(
        isVi
          ? 'Không gọi được API backend để chạy test. Kiểm tra BE rồi thử lại.'
          : 'Unable to reach the backend API to run tests. Please check the backend and try again.',
        'error'
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (isLocked || isCooldown || isSubmitting || isRunning) return;
    setIsSubmitting(true);
    try {
      const payload = {
        practiceId: activePracticeId,
        title: currentPractice.title,
        topic: selectedCatalogItem?.topic ?? currentPractice.concept,
        track: selectedCatalogItem?.track ?? 'Frontend',
        difficulty: selectedCatalogItem?.difficulty,
        language,
        code,
        locale: isVi ? 'vi' : 'en',
        nodeId: nodeId || undefined,
      } as const;
      const response = await submitPracticeCode(payload);
      const runResult = {
        ...response.runResult,
        fingerprint: currentFingerprint,
      };

      setLastRunResult(runResult);
      setSubmissionHistory(response.submissions);
      setConsoleTab('submissions');

      if (runResult.status !== 'Accepted') {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= maxAttempts) {
          setIsLocked(true);
        } else if (newAttempts >= 4) {
          setIsCooldown(true);
          setCooldownTime(30);
        }
        showToast(
          isVi
            ? `Bài chưa pass hết tiêu chí (${runResult.passedCount}/${runResult.total}). Xem lại mục Test Result hoặc Submissions nhé.`
            : `The solution did not pass all checks (${runResult.passedCount}/${runResult.total}). Review Test Result or Submissions.`,
          'error'
        );
        return;
      }

      setAttempts(0);
      setIsCooldown(false);
      setCooldownTime(0);
      setIsLocked(false);

      // Show coin + XP reward notification if earned
      if (response.coinsEarned > 0) {
        showCoinToast(response.coinsEarned);
      }
      if (response.xpEarned > 0) {
        showXpToast(response.xpEarned);
      }

      // Show success toast immediately — accepted regardless of progress sync
      showToast(
        isVi
          ? `🎉 Submit thành công cho bài ${currentPractice.title}.`
          : `🎉 Submission accepted for ${currentPractice.title}.`,
        'success'
      );

      // Refresh chapter progress ngay lập tức để tick ✔ hiện ra tức thì
      // khi user quay lại Hub view, không phải đợi lần mount kế tiếp.
      // Best-effort tương tự updateNodeProgress bên dưới — không chặn UX.

      // Optimistic update: add practiceId to solvedPracticeIds immediately so
      // the "Solved" badge appears without waiting for the API round-trip.
      setProgressSummary((prev) => {
        if (!prev) return prev;
        if (prev.solvedPracticeIds.includes(activePracticeId)) return prev;
        const diff = selectedCatalogItem?.difficulty?.toLowerCase();
        const newOverall = { ...prev.overall };
        if (diff === 'easy') newOverall.easy += 1;
        else if (diff === 'medium') newOverall.medium += 1;
        else if (diff === 'hard') newOverall.hard += 1;
        return {
          ...prev,
          solvedPracticeIds: [...prev.solvedPracticeIds, activePracticeId],
          overall: newOverall,
        };
      });
      void refreshProgressSummary();

      // Sync learning-path progress separately — don't let failures block the UX
      if (nodeId) {
        try {
          await updateNodeProgress(nodeId, {
            status: 'completed',
            quizScore: 10,
          });
        } catch (progressError) {
          // Non-critical: practice submission already recorded; just log quietly
          console.warn('Could not sync learning-path progress:', progressError);
        }
      }
    } catch (error) {
      console.error('Lỗi submit:', error);
      const errorMessage =
        error instanceof Error && error.message.trim()
          ? error.message
          : isVi
            ? 'Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!'
            : 'Something went wrong while submitting. Please try again.';
      showToast(
        errorMessage,
        'error'
      );
    } finally {
      setIsSubmitting(false);
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
          <header className="sticky top-0 z-20 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur-xl animate-fade-in">
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
                    {ui.practiceHub}
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
                  {ui.clearFilters}
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
                  {ui.startPracticing}
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-8 lg:px-8">
            <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-[28px] border border-[color:var(--cg-border)] bg-[linear-gradient(135deg,rgba(17,24,39,0.88),rgba(44,37,103,0.72))] p-6 shadow-[0_36px_120px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:p-8 animate-fade-in-up">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="badge-coral">{ui.curatedPractice}</span>
                  <span className="badge-purple">{ui.tracks}</span>
                </div>
                <h1 className="mt-5 max-w-3xl font-['Lexend'] text-3xl font-bold tracking-tight md:text-4xl">
                  {ui.hubTitle}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--cg-text-muted)] md:text-[15px]">
                  {ui.hubSubtitle}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenPractice(PRACTICE_CATALOG[0])}
                    className="rounded-2xl bg-[#FF7E5F] px-5 py-3 text-sm font-bold text-[#0F0B3C] shadow-[0_18px_60px_rgba(255,126,95,0.25)] transition hover:bg-[#ff9077]"
                  >
                    {ui.openFirst}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack('Frontend')}
                    className="rounded-2xl border border-[color:var(--cg-border)] bg-white/5 px-5 py-3 text-sm font-semibold text-[color:var(--cg-text)] transition hover:bg-white/10"
                  >
                    {ui.frontendTopics}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack('Backend')}
                    className="rounded-2xl border border-[color:var(--cg-border)] bg-white/5 px-5 py-3 text-sm font-semibold text-[color:var(--cg-text)] transition hover:bg-white/10"
                  >
                    {ui.backendTopics}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 animate-fade-in-up delay-100">
                <div className="rounded-[24px] border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-5 backdrop-blur-xl">
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                    {ui.totalProblems}
                  </div>
                  <div className="mt-3 text-4xl font-bold">
                    {PRACTICE_CATALOG.length}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                    {ui.totalSubtitle}
                  </p>
                </div>
                <div className="rounded-[24px] border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-5 backdrop-blur-xl">
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                    {ui.trackSplit}
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

            <section className="rounded-[28px] border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-6 backdrop-blur-xl animate-fade-in-up delay-150">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                    {ui.topicDirectory}
                  </div>
                  <h2 className="mt-2 font-['Lexend'] text-2xl font-semibold tracking-tight">
                    {ui.discoverByTopic}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--cg-text-muted)]">
                    {ui.topicSubtitle}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[#0A0726]/40 px-4 py-3 text-xs font-semibold text-[color:var(--cg-text-muted)]">
                  {filteredPractices.length}/{PRACTICE_CATALOG.length}{' '}
                  {ui.visibleProblems}
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
                  {ui.allTopics}
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

              {/* Chapter Progress — tổng hợp Easy/Medium/Hard đã giải theo
                  từng chapter (topic), giống bảng "Progress" của LeetCode. */}
              <div className="mt-6 rounded-[24px] border border-[color:var(--cg-border)] bg-[#0A0726]/40 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[color:var(--cg-text)]">
                      {ui.chapterProgress}
                    </h3>
                    <p className="mt-1 text-xs text-[color:var(--cg-text-muted)]">
                      {ui.chapterProgressSubtitle}
                    </p>
                  </div>
                  {progressSummary && (
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                        {ui.easy} {progressSummary.overall.easy}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-amber-300">
                        {ui.medium} {progressSummary.overall.medium}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-rose-300">
                        {ui.hard} {progressSummary.overall.hard}
                      </span>
                    </div>
                  )}
                </div>

                {!progressSummary ? (
                  <p className="mt-4 text-xs text-[color:var(--cg-text-muted)]">
                    {ui.loadingProgress}
                  </p>
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from(chapterTotalsByTopic.entries()).map(
                      ([topic, totals]) => {
                        const solved = chapterProgressMap.get(topic)
                          ?.breakdown ?? { easy: 0, medium: 0, hard: 0 };
                        const totalSolved =
                          solved.easy + solved.medium + solved.hard;
                        const pct =
                          totals.total === 0
                            ? 0
                            : Math.round((totalSolved / totals.total) * 100);
                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => setSelectedTopic(topic)}
                            className={cx(
                              'rounded-2xl border p-4 text-left transition',
                              selectedTopic === topic
                                ? 'border-[#FF7E5F]/40 bg-[#FF7E5F]/10'
                                : 'border-[color:var(--cg-border)] bg-white/[0.03] hover:border-[#FF7E5F]/25 hover:bg-white/[0.06]'
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-xs font-bold text-[color:var(--cg-text)]">
                                {topic}
                              </span>
                              <span className="shrink-0 text-[11px] font-semibold text-[color:var(--cg-text-muted)]">
                                {totalSolved}/{totals.total}
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/30">
                              <div
                                className="h-full rounded-full bg-[#FF7E5F] transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold">
                              <span className="text-emerald-300">
                                {ui.easy} {solved.easy}/{totals.easy}
                              </span>
                              <span className="text-amber-300">
                                {ui.medium} {solved.medium}/{totals.medium}
                              </span>
                              <span className="text-rose-300">
                                {ui.hard} {solved.hard}/{totals.hard}
                              </span>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-[24px] border border-emerald-400/15 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(15,11,60,0.08))] p-6 backdrop-blur-xl animate-fade-in-up delay-200">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.24em] text-emerald-300/80">
                      {ui.frontendPath}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold">
                      {ui.frontendPathTitle}
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-right">
                    <div className="text-2xl font-bold text-emerald-300">
                      {frontendCount}
                    </div>
                    <div className="text-[11px] text-emerald-100/70">
                      {ui.problems}
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {frontendTopicList.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-sky-400/15 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(15,11,60,0.08))] p-6 backdrop-blur-xl animate-fade-in-up delay-300">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.24em] text-sky-300/80">
                      {ui.backendPath}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold">
                      {ui.backendPathTitle}
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-right">
                    <div className="text-2xl font-bold text-sky-300">
                      {backendCount}
                    </div>
                    <div className="text-[11px] text-sky-100/70">
                      {ui.problems}
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {backendTopicList.map((label) => (
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

            <section className="rounded-[28px] border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-6 backdrop-blur-xl animate-fade-in-up delay-400">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                    {ui.problemList}
                  </div>
                  <h2 className="mt-2 font-['Lexend'] text-2xl font-semibold tracking-tight">
                    {ui.browseOpen}
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
                      placeholder={ui.searchChallenges}
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
                        {isVi ? (track === 'All' ? ui.all : track) : track}
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
                          {isVi
                            ? level === 'All'
                              ? ui.all
                              : level === 'Easy'
                                ? ui.easy
                                : level === 'Medium'
                                  ? ui.medium
                                  : ui.hard
                            : level}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-[color:var(--cg-border)]">
                <div className="hidden grid-cols-[minmax(0,1.8fr)_120px_110px_120px_120px] gap-4 bg-[#0A0726]/65 px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-[color:var(--cg-text-muted)] md:grid">
                  <div>{ui.problem}</div>
                  <div>{ui.track}</div>
                  <div>{ui.difficulty}</div>
                  <div>{ui.acceptance}</div>
                  <div>{ui.action}</div>
                </div>

                <div className="divide-y divide-[color:var(--cg-border)] bg-[rgba(8,8,26,0.24)]">
                  {filteredPractices.map((item, index) => {
                    const isSolved = solvedPracticeIdSet.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleOpenPractice(item)}
                        className="grid w-full gap-4 px-5 py-5 text-left transition hover:bg-white/5 md:grid-cols-[minmax(0,1.8fr)_120px_110px_120px_120px]"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            {isSolved ? (
                              <span
                                className="material-symbols-outlined shrink-0 text-[18px] text-emerald-400"
                                title={ui.solvedBadge}
                              >
                                check_circle
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-[color:var(--cg-text-muted)]">
                                {String(index + 1).padStart(2, '0')}.
                              </span>
                            )}
                            <h3 className="truncate text-sm font-bold md:text-[15px]">
                              {item.title}
                            </h3>
                            {isSolved && (
                              <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                                {ui.solvedBadge}
                              </span>
                            )}
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
                            <span className="rounded-full border border-[#fbbf24]/25 bg-[#fbbf24]/10 px-3 py-1 text-[11px] font-semibold text-[#fcd34d]">
                              +{getCoinRewardByDifficulty(item.difficulty)}{' '}
                              {ui.coinsUnit}
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
                    );
                  })}

                  {filteredPractices.length === 0 && (
                    <div className="px-5 py-14 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)]">
                        <span className="material-symbols-outlined text-[24px] text-[color:var(--cg-text-muted)]">
                          search_off
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">
                        {ui.noMatching}
                      </h3>
                      <p className="mt-2 text-sm text-[color:var(--cg-text-muted)]">
                        {ui.tryAnother}
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

  if (isTooSmall && !isHubView) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F0B3C] text-center p-6 select-none">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 50%,rgba(255,126,95,0.15),transparent 65%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-md flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-[#ff7e5f]/20 blur-xl animate-pulse-glow" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff7e5f]/30 bg-[#ff7e5f]/10">
              <span className="material-symbols-outlined text-3xl text-[#ff7e5f] animate-status-pulse">
                desktop_windows
              </span>
            </div>
          </div>

          <h2 className="font-['Lexend'] text-xl font-bold tracking-tight text-white">
            {isVi
              ? 'Không Hỗ Trợ Kích Thước Màn Hình Này'
              : 'Unsupported Screen Size'}
          </h2>

          <p className="mt-3 text-xs leading-relaxed text-[color:var(--cg-text-muted)]">
            {isVi
              ? 'Để đảm bảo trải nghiệm học tập và viết code tốt nhất, giao diện Workspace yêu cầu màn hình máy tính có độ rộng tối thiểu 1024px. Vui lòng phóng to trình duyệt hoặc sử dụng thiết bị có màn hình lớn hơn.'
              : 'To ensure the best learning and coding experience, the Workspace requires a desktop screen with a minimum width of 1024px. Please expand your browser window or use a larger device.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleBackToHub()}
              className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2 text-xs font-semibold text-[color:var(--cg-text)] hover:bg-[color:var(--cg-container-a22)] transition cursor-pointer"
            >
              {isVi ? 'Quay lại Hub' : 'Go back to Hub'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] overflow-hidden flex flex-col">
      {/* AI Mentor Floating Chat */}
      <AiMentorBubble isVi={isVi} />
      <AiMentorDrawer
        context={aiMentorContext}
        exerciseTitle={currentPractice.title}
        isVi={isVi}
      />
      {/* Toast notifications */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] animate-bounce-in max-w-md w-full px-4">
          <div
            className={cx(
              'glass-card p-4 flex items-start gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border',
              toast.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/60'
                : toast.type === 'error'
                  ? 'border-rose-500/30 bg-rose-950/60'
                  : 'border-blue-500/30 bg-blue-950/60'
            )}
          >
            <span
              className={cx(
                'material-symbols-outlined text-[20px] shrink-0 mt-0.5',
                toast.type === 'success'
                  ? 'text-emerald-400'
                  : toast.type === 'error'
                    ? 'text-rose-400'
                    : 'text-blue-400'
              )}
            >
              {toast.type === 'success'
                ? 'check_circle'
                : toast.type === 'error'
                  ? 'error'
                  : 'info'}
            </span>
            <div className="flex-1 text-xs font-semibold leading-relaxed text-[color:var(--cg-text)]">
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                close
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Coin reward popup */}
      {coinToast !== null && (
        <div
          className="fixed top-24 right-6 z-[1000] pointer-events-none select-none"
          style={{ animation: 'coinPopIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}
        >
          <div className="relative flex flex-col items-center">
            {/* Floating coin particles */}
            {([0, 1, 2, 3, 4, 5] as const).map((i) => (
              <span
                key={i}
                className="absolute text-xl"
                style={{ animation: `coinFloat${i} 1.4s ease-out forwards`, top: 0, left: '50%', transform: 'translateX(-50%)' }}
              >
                🪙
              </span>
            ))}
            {/* Main reward card */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#fbbf24]/40 bg-gradient-to-br from-[#78350f]/80 to-[#0d0706]/90 px-5 py-4 shadow-[0_0_40px_rgba(251,191,36,0.35),0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl" style={{ minWidth: 210 }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/40 text-2xl shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                🏆
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: 'rgba(252,211,77,0.65)' }}>
                  {isVi ? 'Phần thưởng' : 'Reward Earned'}
                </span>
                <span className="text-[26px] font-extrabold leading-tight" style={{ color: '#fcd34d', textShadow: '0 0 20px rgba(251,191,36,0.8)' }}>
                  +{coinToast} 🪙
                </span>
                <span className="text-[10px] font-medium" style={{ color: 'rgba(252,211,77,0.5)' }}>
                  {isVi ? 'coins đã được thêm vào tài khoản' : 'coins added to your account'}
                </span>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes coinPopIn {
              0%   { opacity:0; transform: scale(0.4) translateY(30px); }
              60%  { opacity:1; transform: scale(1.1) translateY(-6px);  }
              100% { opacity:1; transform: scale(1)   translateY(0);      }
            }
            @keyframes coinFloat0 { 0%{opacity:1;transform:translate(-50%,0) scale(1)} 100%{opacity:0;transform:translate(calc(-50% - 45px),-80px) scale(0.4)} }
            @keyframes coinFloat1 { 0%{opacity:1;transform:translate(-50%,0) scale(1)} 100%{opacity:0;transform:translate(calc(-50% + 45px),-90px) scale(0.4)} }
            @keyframes coinFloat2 { 0%{opacity:1;transform:translate(-50%,0) scale(1)} 100%{opacity:0;transform:translate(calc(-50% - 20px),-100px) scale(0.4)} }
            @keyframes coinFloat3 { 0%{opacity:1;transform:translate(-50%,0) scale(1)} 100%{opacity:0;transform:translate(calc(-50% + 20px),-85px) scale(0.4)} }
            @keyframes coinFloat4 { 0%{opacity:1;transform:translate(-50%,0) scale(1)} 100%{opacity:0;transform:translate(calc(-50% - 65px),-65px) scale(0.4)} }
            @keyframes coinFloat5 { 0%{opacity:1;transform:translate(-50%,0) scale(1)} 100%{opacity:0;transform:translate(calc(-50% + 65px),-70px) scale(0.4)} }
          `}</style>
        </div>
      )}

      {/* XP reward popup — offset top-52 (thay vì top-24 như coin toast) để
          2 popup không đè lên nhau khi cả coinsEarned và xpEarned cùng > 0,
          vốn luôn xảy ra đồng thời ở lần Accepted đầu tiên. */}
      {xpToast !== null && (
        <div
          className="fixed top-52 right-6 z-[1000] pointer-events-none select-none"
          style={{ animation: 'xpPopIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}
        >
          <div className="relative flex flex-col items-center">
            <div className="flex items-center gap-3 rounded-2xl border border-[#818cf8]/40 bg-gradient-to-br from-[#312e81]/80 to-[#0d0620]/90 px-5 py-4 shadow-[0_0_40px_rgba(129,140,248,0.35),0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl" style={{ minWidth: 210 }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#818cf8]/20 border border-[#818cf8]/40 text-2xl shadow-[0_0_20px_rgba(129,140,248,0.4)]">
                ⭐
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: 'rgba(199,210,254,0.65)' }}>
                  {isVi ? 'Kinh nghiệm' : 'Experience Earned'}
                </span>
                <span className="text-[26px] font-extrabold leading-tight" style={{ color: '#c7d2fe', textShadow: '0 0 20px rgba(129,140,248,0.8)' }}>
                  +{xpToast} XP
                </span>
                <span className="text-[10px] font-medium" style={{ color: 'rgba(199,210,254,0.5)' }}>
                  {isVi ? 'XP đã được thêm vào tài khoản' : 'XP added to your account'}
                </span>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes xpPopIn {
              0%   { opacity:0; transform: scale(0.4) translateY(30px); }
              60%  { opacity:1; transform: scale(1.1) translateY(-6px);  }
              100% { opacity:1; transform: scale(1)   translateY(0);      }
            }
          `}</style>
        </div>
      )}

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
        <header className="h-[64px] px-5 md:px-8 flex-shrink-0 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur-xl flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBackToHub}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-2 text-xs font-semibold text-[color:var(--cg-text-muted)] transition hover:bg-[color:var(--cg-container-a22)] hover:text-[color:var(--cg-text)]"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              {ui.allProblems}
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
        <main className="flex-1 p-2 min-h-0 overflow-hidden animate-fade-in-up delay-75">
          <PanelGroup orientation="horizontal" className="h-full">
            {/* LEFT PANEL */}
            <Panel
              defaultSize={45}
              minSize={30}
              className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md flex flex-col overflow-hidden animate-fade-in-up delay-150"
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
                  {ui.description}
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
                  {ui.solutions}
                </button>
                <div className="w-px h-4 bg-[color:var(--cg-border)] mx-1" />
                <button
                  onClick={() => setLeftTab('theory')}
                  className={cx(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border-b-2',
                    leftTab === 'theory'
                      ? 'text-[#FF7E5F] border-[#FF7E5F]'
                      : 'text-[color:var(--cg-text-muted)] border-transparent hover:text-[color:var(--cg-text)]'
                  )}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    menu_book
                  </span>{' '}
                  {ui.theory}
                </button>
              </div>

              {/* Left Content */}
              <div
                className={cx(
                  'flex-1 overflow-y-auto custom-scrollbar',
                  leftTab === 'theory' ? 'p-0' : 'p-5'
                )}
              >
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
                      {solvedPracticeIdSet.has(activePracticeId) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/25">
                          <span className="material-symbols-outlined text-[12px]">
                            check_circle
                          </span>
                          {ui.solvedBadge}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[color:var(--cg-text-muted)] bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)]">
                        {selectedCatalogItem?.solvedCount || '38.3M'}{' '}
                        {ui.accepted}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[color:var(--cg-text-muted)] bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)]">
                        {selectedCatalogItem?.acceptanceRate || '57.6%'}{' '}
                        {ui.rate}
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
                      {selectedCatalogItem?.difficulty && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[#fcd34d] bg-[#fbbf24]/10 border border-[#fbbf24]/25">
                          +{getCoinRewardByDifficulty(selectedCatalogItem.difficulty)}{' '}
                          {ui.coinsUnit}
                        </span>
                      )}
                    </div>

                    <div className="text-sm leading-relaxed text-[color:var(--cg-text)] font-medium whitespace-pre-wrap mb-8">
                      {currentPractice.description}
                    </div>

                    {selectedCatalogItem?.difficulty && (
                      <div className="mb-8 rounded-2xl border border-[#fbbf24]/20 bg-[#fbbf24]/8 p-4">
                        <div className="text-[11px] font-semibold tracking-[0.22em] text-[#fcd34d]">
                          {ui.firstSolveReward}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-[color:var(--cg-text)]">
                          {selectedCatalogItem.difficulty} = +
                          {getCoinRewardByDifficulty(selectedCatalogItem.difficulty)}{' '}
                          {ui.coinsUnit}
                        </div>
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="font-['Lexend'] text-sm font-semibold mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#FF7E5F] text-[16px]">
                          target
                        </span>{' '}
                        {ui.task}
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
                        title={ui.topics}
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
                        title={ui.companies}
                        icon="domain"
                        id="companies"
                        isOpen={!!expandedAccordions['companies']}
                        onToggle={toggleAccordion}
                      >
                        {ui.askedBy}{' '}
                        {selectedCatalogItem
                          ? selectedCatalogItem.track === 'Frontend'
                            ? 'Meta, Shopify, Vercel, Figma.'
                            : 'Amazon, Cloudflare, Stripe, GitHub.'
                          : 'Google, Meta, Amazon, Microsoft.'}
                      </AccordionComponent>
                      <AccordionComponent
                        title={ui.hint1}
                        icon="lightbulb"
                        id="hint1"
                        isOpen={!!expandedAccordions['hint1']}
                        onToggle={toggleAccordion}
                      >
                        {currentPractice.conceptDesc}
                      </AccordionComponent>
                      <AccordionComponent
                        title={ui.hint2}
                        icon="lightbulb"
                        id="hint2"
                        isOpen={!!expandedAccordions['hint2']}
                        onToggle={toggleAccordion}
                      >
                        {ui.hint2Body}
                      </AccordionComponent>
                      <AccordionComponent
                        title={ui.similarQuestions}
                        icon="format_list_bulleted"
                        id="similar"
                        isOpen={!!expandedAccordions['similar']}
                        onToggle={toggleAccordion}
                      >
                        <div className="flex justify-between items-center py-1 hover:text-[#FF7E5F] cursor-pointer transition-colors">
                          <span>3Sum</span>
                          <span className="text-emerald-400">{ui.medium}</span>
                        </div>
                      </AccordionComponent>
                      <AccordionComponent
                        title={ui.discussion}
                        icon="forum"
                        id="discussion"
                        isOpen={!!expandedAccordions['discussion']}
                        onToggle={toggleAccordion}
                      >
                        {ui.discussionBody}
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
                          placeholder={ui.searchSolutions}
                          value={solutionSearchQuery}
                          onChange={(e) => setSolutionSearchQuery(e.target.value)}
                          className="bg-transparent border-none outline-none text-xs w-full text-[color:var(--cg-text)]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSolutionSearchQuery('')}
                        className="rounded-lg bg-[#FF7E5F] text-[#0F0B3C] font-bold text-xs px-3 py-1.5 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                        {isVi ? 'Xoá lọc' : 'Clear'}
                      </button>
                    </div>

                    <div className="mb-4 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-bold text-[color:var(--cg-text)]">
                            {isVi
                              ? 'Official solutions trong FE'
                              : 'Official solutions in FE'}
                          </div>
                          <div className="mt-1 text-xs text-[color:var(--cg-text-muted)]">
                            {isVi
                              ? `Đang hiển thị ${filteredPracticeSolutions.length}/${practiceSolutions.length} lời giải cho bài hiện tại.`
                              : `Showing ${filteredPracticeSolutions.length}/${practiceSolutions.length} solutions for the current problem.`}
                          </div>
                        </div>
                        {!!practiceSolutions[0] && (
                          <button
                            type="button"
                            onClick={() =>
                              handleApplySolutionCode(practiceSolutions[0].code)
                            }
                            className="rounded-lg border border-[#FF7E5F]/40 px-3 py-1.5 text-xs font-bold text-[#FFB199] hover:border-[#FF7E5F] hover:text-[#FF7E5F] transition-colors"
                          >
                            {isVi ? 'Áp dụng vào editor' : 'Apply to editor'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Solutions List */}
                    <div className="flex flex-col gap-3">
                      {filteredPracticeSolutions.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-5 text-xs text-[color:var(--cg-text-muted)]">
                          {isVi
                            ? 'Không tìm thấy lời giải khớp với từ khoá hiện tại.'
                            : 'No solutions match the current search query.'}
                        </div>
                      ) : (
                        filteredPracticeSolutions.map((sol) => (
                          <div
                            key={sol.id}
                            onClick={() =>
                              setExpandedSolutionByPractice((prev) => {
                                const current = prev[solutionScopeId] ?? null;
                                return {
                                  ...prev,
                                  [solutionScopeId]:
                                    current === sol.id ? null : sol.id,
                                };
                              })
                            }
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
                                1
                              </span>
                            </div>

                            {expandedSolutionId === sol.id && (
                              <div className="mt-4 pt-4 border-t border-[color:var(--cg-border)]">
                                <div className="text-[10px] font-semibold text-[color:var(--cg-text-muted)] mb-2">
                                  {isVi ? 'Giải thích' : 'Explanation'}
                                </div>
                                <div className="text-xs text-[color:var(--cg-text-muted)] leading-relaxed whitespace-pre-line">
                                  {sol.explanation}
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                  <div className="text-[10px] font-semibold text-[color:var(--cg-text-muted)]">
                                    {isVi ? 'Code mẫu' : 'Code'}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApplySolutionCode(sol.code);
                                      }}
                                      className="text-[10px] font-bold px-2 py-1 rounded-md bg-[#FF7E5F] text-[#0F0B3C] hover:brightness-105 transition-colors"
                                    >
                                      {isVi ? 'Dán vào editor' : 'Apply'}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void copyToClipboard(sol.code);
                                      }}
                                      className="text-[10px] font-bold px-2 py-1 rounded-md bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)] hover:border-[#FF7E5F]/60 hover:text-[#FF7E5F] transition-colors"
                                    >
                                      {isVi ? 'Copy' : 'Copy'}
                                    </button>
                                  </div>
                                </div>
                                <pre className="mt-2 text-xs text-[color:var(--cg-text)] bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)] rounded-lg p-3 overflow-auto max-h-64 whitespace-pre-wrap">
                                  {sol.code}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {leftTab === 'theory' && (
                  <TheoryViewer
                    topic={
                      selectedCatalogItem?.topic ?? currentPractice.concept
                    }
                    isVi={isVi}
                  />
                )}
              </div>
            </Panel>

            <ResizeHandle />

            {/* RIGHT PANEL: Editor & Console Split */}
            <Panel
              defaultSize={55}
              minSize={30}
              className="flex flex-col min-h-0 animate-fade-in-up delay-200"
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
                        {ui.code}
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
                          {ui.locked}
                        </span>
                      )}
                      <div className="flex items-center gap-1 rounded bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--cg-text-muted)]">
                        <span className="material-symbols-outlined text-[12px] text-[#FFA500]">
                          timer
                        </span>
                        {ui.attempt} {attempts}/{maxAttempts}
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
                  className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md flex flex-col overflow-hidden animate-fade-in delay-300"
                >
                  {/* Console Tabs */}
                  <div className="flex items-center gap-0.5 px-2 pt-1.5 border-b-2 border-white/10 bg-[#060418]/80 backdrop-blur-sm">
                    <button
                      onClick={() => setConsoleTab('testcase')}
                      className={cx(
                        'flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] rounded-t-md',
                        consoleTab === 'testcase'
                          ? 'text-emerald-300 border-emerald-400 bg-emerald-500/10'
                          : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                      )}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        check_box
                      </span>{' '}
                      {ui.testcase}
                    </button>
                    <button
                      onClick={() => setConsoleTab('testresult')}
                      className={cx(
                        'flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] rounded-t-md',
                        consoleTab === 'testresult'
                          ? 'text-emerald-300 border-emerald-400 bg-emerald-500/10'
                          : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                      )}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        terminal
                      </span>{' '}
                      {ui.testResult}
                    </button>
                    <div className="w-px h-5 bg-white/10 mx-1" />
                    <button
                      onClick={() => setConsoleTab('submissions')}
                      className={cx(
                        'flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] rounded-t-md',
                        consoleTab === 'submissions'
                          ? 'text-[#fbbf24] border-[#fbbf24] bg-[#fbbf24]/10'
                          : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                      )}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        history
                      </span>{' '}
                      {ui.submissions}
                      {submissionHistory.length > 0 && (
                        <span className={cx(
                          'ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none',
                          consoleTab === 'submissions' ? 'bg-[#fbbf24]/25 text-[#fbbf24]' : 'bg-white/10 text-slate-400'
                        )}>
                          {submissionHistory.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Console Content */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {consoleTab === 'testcase' && (
                      <div className="animate-fade-in text-xs w-full">
                        {displayedCases.length > 0 ? (
                          <div className="flex flex-col">
                            {displayedCases.map((judgeCase, index) => (
                              <div
                                key={judgeCase.id}
                                className={cx(
                                  'border-b border-[color:var(--cg-border)] px-4 py-3',
                                  index % 2 === 0
                                    ? 'bg-[#0A0726]/20'
                                    : 'bg-transparent'
                                )}
                              >
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-[color:var(--cg-text)]">
                                      {judgeCase.title}
                                    </p>
                                    <p className="text-[11px] text-[color:var(--cg-text-muted)]">
                                      {judgeCase.input}
                                    </p>
                                  </div>
                                  <span
                                    className={cx(
                                      'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
                                      judgeCase.passed
                                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                        : 'border-red-500/40 bg-red-500/10 text-red-300'
                                    )}
                                  >
                                    {judgeCase.passed ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[color:var(--cg-text-muted)]">
                                  {isVi ? 'Kỳ vọng:' : 'Expected:'}{' '}
                                  <span className="text-[color:var(--cg-text)]">
                                    {judgeCase.expected}
                                  </span>
                                </p>
                                <p className="mt-2 text-[11px] text-[color:var(--cg-text-muted)]">
                                  {judgeCase.detail}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 flex-1 flex flex-col items-center justify-center opacity-50">
                            <p className="text-sm text-[color:var(--cg-text-muted)]">
                              {isVi
                                ? 'Bấm Run để tải bộ tiêu chí chấm từ backend cho bài này.'
                                : 'Run the code to load backend evaluation criteria for this exercise.'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {consoleTab === 'testresult' &&
                      (activeRunResult ? (
                        <div className="animate-fade-in p-4 text-sm">
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
                              <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--cg-text-muted)]">
                                {ui.status}
                              </p>
                              <p
                                className={cx(
                                  'mt-2 text-lg font-bold',
                                  activeRunResult.status === 'Accepted'
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                )}
                              >
                                {activeRunResult.status}
                              </p>
                            </div>
                            <div className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
                              <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--cg-text-muted)]">
                                {ui.runtime}
                              </p>
                              <p className="mt-2 text-lg font-bold text-[color:var(--cg-text)]">
                                {activeRunResult.runtime}
                              </p>
                            </div>
                            <div className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
                              <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--cg-text-muted)]">
                                {ui.memory}
                              </p>
                              <p className="mt-2 text-lg font-bold text-[color:var(--cg-text)]">
                                {activeRunResult.memory}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--cg-text-muted)]">
                              {isVi ? 'Tổng quan' : 'Overview'}
                            </p>
                            <p className="mt-2 text-sm text-[color:var(--cg-text)]">
                              {activeRunResult.notes}
                            </p>
                            <p className="mt-2 text-xs text-[color:var(--cg-text-muted)]">
                              {isVi ? 'Đã pass' : 'Passed'}{' '}
                              <span className="font-semibold text-[color:var(--cg-text)]">
                                {activeRunResult.passedCount}/
                                {activeRunResult.total}
                              </span>{' '}
                              {isVi ? 'tiêu chí.' : 'checks.'}
                            </p>
                          </div>
                          <div className="mt-4 space-y-3">
                            {activeRunResult.cases.map((judgeCase) => (
                              <div
                                key={judgeCase.id}
                                className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="font-semibold text-[color:var(--cg-text)]">
                                    {judgeCase.title}
                                  </p>
                                  <span
                                    className={cx(
                                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
                                      judgeCase.passed
                                        ? 'bg-emerald-500/10 text-emerald-300'
                                        : 'bg-red-500/10 text-red-300'
                                    )}
                                  >
                                    {judgeCase.passed ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                                <p className="mt-2 text-[11px] text-[color:var(--cg-text-muted)]">
                                  {isVi ? 'Input:' : 'Input:'} {judgeCase.input}
                                </p>
                                <p className="mt-1 text-[11px] text-[color:var(--cg-text-muted)]">
                                  {isVi ? 'Expected:' : 'Expected:'}{' '}
                                  {judgeCase.expected}
                                </p>
                                <p className="mt-2 text-xs text-[color:var(--cg-text)]">
                                  {judgeCase.detail}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 flex-1 flex flex-col items-center justify-center opacity-50">
                          <p className="text-sm text-[color:var(--cg-text-muted)]">
                            {ui.runToSee}
                          </p>
                        </div>
                      ))}

                    {consoleTab === 'submissions' && (
                      <div className="animate-fade-in text-xs w-full">
                        <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] px-4 py-2.5 border-b-2 border-[#fbbf24]/20 sticky top-0 bg-[#0a0720]/95 backdrop-blur-md z-10 text-[11px] font-bold tracking-wide text-[#fbbf24]/70">
                          <div>{ui.status}</div>
                          <div>{ui.language}</div>
                          <div>{ui.runtime}</div>
                          <div>{ui.memory}</div>
                          <div>{ui.notes}</div>
                        </div>
                        {submissionHistory.length > 0 ? (
                          <div className="flex flex-col">
                            {submissionHistory.map((sub, i) => (
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
                                  <span className="text-[11px] leading-5 text-[color:var(--cg-text-muted)]">
                                    {sub.notes}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 flex-1 flex flex-col items-center justify-center opacity-50">
                            <p className="text-sm text-[color:var(--cg-text-muted)]">
                              {isVi
                                ? 'Chưa có submission nào cho bài này.'
                                : 'No submissions yet for this exercise.'}
                            </p>
                          </div>
                        )}
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
                        onClick={handleRun}
                        disabled={isRunning || isSubmitting}
                        className={cx(
                          'rounded-lg border px-4 py-1.5 text-xs font-bold transition',
                          isRunning || isSubmitting
                            ? 'cursor-wait border-gray-500/30 bg-gray-500/10 text-gray-300'
                            : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] hover:bg-[color:var(--cg-container-a22)]'
                        )}
                      >
                        {isRunning
                          ? isVi
                            ? 'ĐANG CHẠY...'
                            : 'RUNNING...'
                          : ui.run}
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
                          ? ui.locked
                          : isCooldown
                            ? `${ui.wait} ${cooldownTime}s`
                            : isSubmitting
                              ? ui.submitting
                              : ui.submit}
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
