import { PRACTICE_BACKEND_SOLUTIONS } from './practiceBackendSolutions';

export type PracticeSolutionLocale = 'vi' | 'en';

export type PracticeLanguage =
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

export type PracticeSolutionContent = {
  /**
   * Ngôn ngữ nên ưu tiên hiển thị code (fallback).
   * Ví dụ: HTML/CSS exercises sẽ ưu tiên `html` hoặc `css`.
   */
  primaryLanguage: PracticeLanguage;
  /**
   * Code lời giải theo từng ngôn ngữ.
   * Mục tiêu: 1 lời giải chuẩn/bài, đủ sạch để đọc và reuse.
   */
  code: Partial<Record<PracticeLanguage, string>>;
  /**
   * Giải thích ngắn gọn, tập trung vào ý đồ + trade-offs.
   * Dùng markdown nhẹ (xuống dòng, bullet) vì UI sẽ render text thẳng.
   */
  explanation: Record<PracticeSolutionLocale, string>;
};

/**
 * Map: `PracticeCatalogItem.id` -> solution content.
 * Hiện tại ưu tiên full track Frontend. Backend sẽ bổ sung sau.
 */
export const PRACTICE_SOLUTIONS: Record<string, PracticeSolutionContent> = {
  'fe-html-structure': {
    primaryLanguage: 'html',
    code: {
      html: `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Landing Page</title>
    <meta
      name="description"
      content="Trang landing page tối giản, có cấu trúc semantic rõ ràng."
    />
  </head>
  <body>
    <header>
      <nav aria-label="Điều hướng chính">
        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>

    <main id="home">
      <h1>Build faster, ship safer</h1>
      <p>Một landing page shell chuẩn semantic, dễ mở rộng.</p>

      <section id="features" aria-labelledby="features-title">
        <h2 id="features-title">Features</h2>
        <ul>
          <li>Semantic landmarks</li>
          <li>Heading hierarchy</li>
          <li>Accessible navigation</li>
        </ul>
      </section>

      <section id="pricing" aria-labelledby="pricing-title">
        <h2 id="pricing-title">Pricing</h2>
        <p>Chọn plan phù hợp với team của bạn.</p>
      </section>
    </main>

    <footer>
      <small>© 2026 Demo Corp. All rights reserved.</small>
    </footer>
  </body>
</html>
`,
    },
    explanation: {
      vi: [
        'Mục tiêu là tạo “bộ khung” HTML5 chuẩn với landmark rõ ràng: `header`, `nav`, `main`, `section`, `footer`.',
        'Thứ tự heading phải hợp lý (`h1` cho tiêu đề trang, `h2` cho section).',
        'Dùng `aria-label`/`aria-labelledby` để giúp screen reader hiểu vùng nội dung mà không cần “div soup”.',
      ].join('\n'),
      en: [
        'Goal: a valid HTML5 shell with clear landmarks (`header`, `nav`, `main`, `section`, `footer`).',
        'Keep heading hierarchy consistent (`h1` for the page, `h2` for sections).',
        'Use `aria-label`/`aria-labelledby` where it improves navigation for screen readers.',
      ].join('\n'),
    },
  },

  'fe-semantic-article': {
    primaryLanguage: 'html',
    code: {
      html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Blog Article</title>
  </head>
  <body>
    <header>
      <a href="/">Demo Blog</a>
      <nav aria-label="Primary">
        <a href="/posts">Posts</a>
        <a href="/about">About</a>
      </nav>
    </header>

    <main>
      <article>
        <header>
          <h1>Semantic Article Landmarks</h1>
          <p>
            <time datetime="2026-07-01">Jul 1, 2026</time> · 6 min read
          </p>
        </header>

        <section aria-labelledby="intro">
          <h2 id="intro">Intro</h2>
          <p>Semantic tags make your content easier to navigate.</p>
        </section>

        <section aria-labelledby="details">
          <h2 id="details">Details</h2>
          <p>
            Use <code>&lt;section&gt;</code> for logical groupings and proper
            headings.
          </p>
        </section>

        <footer>
          <p>
            Written by <a href="/authors/alex">Alex</a>
          </p>
        </footer>
      </article>

      <aside aria-label="Related posts">
        <h2>Related</h2>
        <ul>
          <li><a href="/posts/a11y">Accessibility basics</a></li>
          <li><a href="/posts/html5">HTML5 landmarks</a></li>
        </ul>
      </aside>
    </main>

    <footer>
      <small>© Demo Blog</small>
    </footer>
  </body>
</html>
`,
    },
    explanation: {
      vi: [
        'Tách rõ “chrome” của trang (`header`/`nav`) và nội dung chính (`main`).',
        'Bài viết nằm trong `article`; trong bài có thể có `header`/`footer` riêng (hợp lệ).',
        '`aside` dùng cho nội dung phụ trợ (related posts), giúp screen reader nhận ra đây không phải nội dung chính.',
      ].join('\n'),
      en: [
        'Separate page chrome (`header`/`nav`) from primary content (`main`).',
        'Wrap the post in an `article` and use an internal `header`/`footer` for metadata and attribution.',
        'Use `aside` for supporting content like related posts.',
      ].join('\n'),
    },
  },

  'fe-pricing-card-markup': {
    primaryLanguage: 'html',
    code: {
      html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pricing</title>
  </head>
  <body>
    <main>
      <h1>Pricing</h1>

      <section aria-label="Pricing plans">
        <article aria-labelledby="plan-pro">
          <header>
            <h2 id="plan-pro">Pro</h2>
            <p>
              <span aria-label="Price">$19</span>
              <span aria-hidden="true">/mo</span>
            </p>
          </header>

          <ul aria-label="Plan features">
            <li>Unlimited projects</li>
            <li>Team collaboration</li>
            <li>Email support</li>
          </ul>

          <button type="button" aria-label="Choose Pro plan">Choose plan</button>
        </article>
      </section>
    </main>
  </body>
</html>
`,
    },
    explanation: {
      vi: [
        'Giữ cấu trúc: mỗi “card” là một `article` với `h2` (tên plan) và danh sách tính năng là `ul`/`li`.',
        '`aria-label` cho button giúp screen reader hiểu ngữ cảnh (“Choose Pro plan”).',
        'Không lạm dụng `div`; ưu tiên tag có nghĩa để dễ audit và dễ test.',
      ].join('\n'),
      en: [
        'Model each pricing card as an `article` with a plan name (`h2`) and a feature list (`ul`).',
        'Use contextual labels (e.g. `aria-label="Choose Pro plan"`) for clear screen reader output.',
        'Prefer semantic tags over generic wrappers to improve auditability and testing.',
      ].join('\n'),
    },
  },

  'fe-dashboard-landmarks': {
    primaryLanguage: 'html',
    code: {
      html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dashboard</title>
  </head>
  <body>
    <header>
      <h1>Dashboard</h1>
      <nav aria-label="Dashboard navigation">
        <a href="/overview">Overview</a>
        <a href="/reports">Reports</a>
        <a href="/settings">Settings</a>
      </nav>
    </header>

    <main>
      <section aria-labelledby="kpis">
        <h2 id="kpis">Key metrics</h2>
        <div role="list">
          <div role="listitem">Revenue</div>
          <div role="listitem">Active users</div>
          <div role="listitem">Conversion</div>
        </div>
      </section>

      <section aria-labelledby="activity">
        <h2 id="activity">Recent activity</h2>
        <ul>
          <li>Invoice #123 paid</li>
          <li>User “Sam” signed up</li>
        </ul>
      </section>
    </main>

    <footer>
      <small>Last sync: <time datetime="2026-07-01T09:00:00Z">09:00</time></small>
    </footer>
  </body>
</html>
`,
    },
    explanation: {
      vi: [
        'Checklist nhanh khi “cleanup div soup”: 1) có `header`/`nav`/`main`/`footer`, 2) heading rõ, 3) region có label.',
        'Các cụm KPI có thể là list thực (`ul`) hoặc `role="list"` nếu UI cần giữ layout nhưng vẫn hỗ trợ assistive tech.',
      ].join('\n'),
      en: [
        'A quick “div soup” cleanup checklist: 1) `header`/`nav`/`main`/`footer`, 2) clear headings, 3) labeled regions.',
        'KPI blocks can be real lists (`ul`) or `role="list"` when layout constraints apply.',
      ].join('\n'),
    },
  },

  'fe-responsive-layout': {
    primaryLanguage: 'css',
    code: {
      css: `:root {
  --gap: 16px;
  --sidebar: 280px;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.layout {
  display: grid;
  grid-template-columns: var(--sidebar) 1fr;
  gap: var(--gap);
  min-height: 100vh;
  padding: var(--gap);
}

.sidebar {
  border: 1px solid #2a2a3a;
  border-radius: 12px;
  padding: 12px;
}

.main {
  border: 1px solid #2a2a3a;
  border-radius: 12px;
  padding: 12px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
`,
    },
    explanation: {
      vi: [
        'Dùng CSS Grid để định nghĩa “2 cột” rõ ràng và đổi sang “1 cột” bằng media query.',
        'Giữ spacing bằng token (`--gap`) để dễ maintain và scale UI.',
      ].join('\n'),
      en: [
        'Use CSS Grid for a clear 2-column layout and collapse to 1 column via a media query.',
        'Use spacing tokens (`--gap`) to keep the layout maintainable.',
      ].join('\n'),
    },
  },

  'fe-sticky-sidebar': {
    primaryLanguage: 'css',
    code: {
      css: `.dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
  padding: 16px;
  min-height: 100vh;
}

.sidebar {
  position: sticky;
  top: 16px;
  align-self: start; /* quan trọng để sticky hoạt động trong grid */
  height: fit-content;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #2a2a3a;
}

.content {
  min-width: 0;
}

@media (max-width: 900px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: static;
  }
}
`,
    },
    explanation: {
      vi: [
        '`position: sticky` cần “điểm neo” (`top`) và container không được có `overflow` cắt ngang.',
        'Trong grid, thêm `align-self: start` để tránh sidebar bị stretch làm sticky khó đoán.',
      ].join('\n'),
      en: [
        '`position: sticky` needs an anchor (`top`) and a container that does not clip overflow.',
        'In CSS Grid, `align-self: start` prevents stretching and keeps sticky behavior predictable.',
      ].join('\n'),
    },
  },

  'fe-grid-gallery': {
    primaryLanguage: 'css',
    code: {
      css: `.gallery {
  --gap: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--gap);
}

.card {
  border: 1px solid #2a2a3a;
  border-radius: 12px;
  padding: 12px;
}

.card.featured {
  grid-column: span 2;
}

@media (max-width: 520px) {
  .card.featured {
    grid-column: auto;
  }
}
`,
    },
    explanation: {
      vi: [
        '`auto-fit + minmax()` giúp grid “tự co giãn” theo viewport mà không phải hardcode breakpoints quá nhiều.',
        'Card “featured” dùng `grid-column: span 2` và có media query nhỏ để tránh vỡ layout trên mobile.',
      ].join('\n'),
      en: [
        '`auto-fit + minmax()` makes the grid responsive without excessive breakpoints.',
        'Use `grid-column: span 2` for featured cards, and reset on small screens.',
      ].join('\n'),
    },
  },

  'fe-mobile-nav-sheet': {
    primaryLanguage: 'css',
    code: {
      css: `.sheetBackdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.sheet {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #0a0726;
  border-bottom: 1px solid #2a2a3a;
  border-radius: 0 0 16px 16px;
  padding: 16px;
  transform: translateY(-110%);
  transition: transform 180ms ease-out;
  will-change: transform;
}

.sheet.isOpen {
  transform: translateY(0);
}

.sheet nav a {
  display: block;
  padding: 10px 8px;
}
`,
    },
    explanation: {
      vi: [
        'Tách backdrop và sheet, dùng `transform` để animate mượt (thay vì animate `top`).',
        'Khi mở, thêm class `isOpen` để sheet trượt xuống; backdrop giúp “click outside” đóng menu.',
      ].join('\n'),
      en: [
        'Separate the backdrop and the sheet; animate with `transform` for smoother performance.',
        'Toggle an `isOpen` class to slide the sheet down; the backdrop enables click-outside dismissal.',
      ].join('\n'),
    },
  },

  'fe-react-state': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { useMemo, useState } from 'react';

type Item = { id: string; title: string; done: boolean };

export function TodoList({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [query, setQuery] = useState('');

  // Single source of truth: items + query
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.title.toLowerCase().includes(q));
  }, [items, query]);

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it))
    );
  }

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>
        {visible.map((it) => (
          <li key={it.id}>
            <label>
              <input
                type="checkbox"
                checked={it.done}
                onChange={() => toggle(it.id)}
              />
              {it.title}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
    },
    explanation: {
      vi: [
        'Không lưu “derived state” (ví dụ `filteredItems`) vào state riêng; hãy derive bằng `useMemo`.',
        'Update state theo functional style (`setItems(prev => ...)`) để tránh bug khi nhiều update liên tiếp.',
      ].join('\n'),
      en: [
        'Avoid storing derived state (e.g. `filteredItems`) separately; derive via `useMemo`.',
        'Use functional updates (`setItems(prev => ...)`) to prevent stale updates.',
      ].join('\n'),
    },
  },

  'fe-multistep-form': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { useReducer } from 'react';

type Step = 'account' | 'profile' | 'confirm';
type Draft = { email: string; password: string; name: string };

type State =
  | { status: 'editing'; step: Step; draft: Draft; errors: Partial<Record<keyof Draft, string>> }
  | { status: 'submitting'; draft: Draft }
  | { status: 'done' };

type Action =
  | { type: 'field'; key: keyof Draft; value: string }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'submit' }
  | { type: 'success' }
  | { type: 'error'; errors: State extends { errors: infer E } ? E : never };

const initial: State = {
  status: 'editing',
  step: 'account',
  draft: { email: '', password: '', name: '' },
  errors: {},
};

function validate(step: Step, draft: Draft) {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (step === 'account') {
    if (!draft.email.includes('@')) errors.email = 'Email không hợp lệ';
    if (draft.password.length < 8) errors.password = 'Mật khẩu tối thiểu 8 ký tự';
  }
  if (step === 'profile') {
    if (!draft.name.trim()) errors.name = 'Tên không được trống';
  }
  return errors;
}

function reducer(state: State, action: Action): State {
  if (state.status === 'done') return state;
  if (state.status === 'submitting') {
    if (action.type === 'success') return { status: 'done' };
    return state;
  }

  switch (action.type) {
    case 'field': {
      return {
        ...state,
        draft: { ...state.draft, [action.key]: action.value },
      };
    }
    case 'next': {
      const errors = validate(state.step, state.draft);
      if (Object.keys(errors).length) return { ...state, errors };
      const nextStep: Step =
        state.step === 'account' ? 'profile' : state.step === 'profile' ? 'confirm' : 'confirm';
      return { ...state, step: nextStep, errors: {} };
    }
    case 'back': {
      const prevStep: Step =
        state.step === 'confirm' ? 'profile' : state.step === 'profile' ? 'account' : 'account';
      return { ...state, step: prevStep, errors: {} };
    }
    case 'submit': {
      const errors = validate('confirm', state.draft);
      if (Object.keys(errors).length) return { ...state, errors };
      return { status: 'submitting', draft: state.draft };
    }
    default:
      return state;
  }
}

export function MultiStepForm() {
  const [state, dispatch] = useReducer(reducer, initial);
  // UI render theo state.status + state.step (omitted)
  return (
    <button onClick={() => dispatch({ type: 'next' })} disabled={state.status !== 'editing'}>
      Next
    </button>
  );
}
`,
    },
    explanation: {
      vi: [
        'Model form như một state machine: `editing(step) -> submitting -> done` để tránh boolean chồng chéo.',
        'Validate theo step, chỉ chặn “Next/Submit” khi step hiện tại chưa hợp lệ; reset errors khi chuyển step.',
      ].join('\n'),
      en: [
        'Model the form as a state machine: `editing(step) -> submitting -> done` to avoid overlapping booleans.',
        'Validate per step and only block transitions when current step is invalid; reset errors on step change.',
      ].join('\n'),
    },
  },

  'fe-debounced-search': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { useEffect, useMemo, useState } from 'react';

type Result = { id: string; label: string };

async function fetchResults(query: string, signal: AbortSignal): Promise<Result[]> {
  const res = await fetch('/api/search?q=' + encodeURIComponent(query), { signal });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export function DebouncedSearch() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: Result[] }
    | { status: 'error'; message: string }
  >({ status: 'idle' });

  const normalized = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!normalized) {
      setState({ status: 'idle' });
      return;
    }

    const ac = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        setState({ status: 'loading' });
        const data = await fetchResults(normalized, ac.signal);
        setState({ status: 'success', data });
      } catch (e) {
        if (ac.signal.aborted) return;
        setState({ status: 'error', message: (e as Error).message });
      }
    }, 300);

    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [normalized]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
`,
    },
    explanation: {
      vi: [
        'Debounce: delay 300ms trước khi fetch để giảm request spam.',
        'Dùng `AbortController` để hủy request cũ khi query đổi nhanh, tránh race-condition cập nhật UI bằng response “cũ”.',
      ].join('\n'),
      en: [
        'Debounce: delay 300ms before fetching to reduce request spam.',
        'Use `AbortController` to cancel stale requests and avoid race conditions updating UI with old responses.',
      ].join('\n'),
    },
  },

  'fe-kanban-reducer': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `type ColumnId = 'todo' | 'doing' | 'done';
type Card = { id: string; title: string };

type State = Record<ColumnId, Card[]>;

type Action =
  | { type: 'add'; column: ColumnId; card: Card }
  | { type: 'move'; from: ColumnId; to: ColumnId; cardId: string; toIndex: number };

export function kanbanReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      return { ...state, [action.column]: [...state[action.column], action.card] };
    }
    case 'move': {
      const fromList = state[action.from];
      const idx = fromList.findIndex((c) => c.id === action.cardId);
      if (idx < 0) return state;

      const card = fromList[idx];
      const nextFrom = fromList.filter((c) => c.id !== action.cardId);

      const toList = state[action.to];
      const nextTo = [...toList];
      const insertAt = Math.max(0, Math.min(action.toIndex, nextTo.length));
      nextTo.splice(insertAt, 0, card);

      return { ...state, [action.from]: nextFrom, [action.to]: nextTo };
    }
    default:
      return state;
  }
}
`,
    },
    explanation: {
      vi: [
        'Reducer giúp state “predictable”: mọi thay đổi đi qua action rõ ràng (add/move).',
        'Luôn return state mới (immutability) để React dễ detect rerender, đồng thời code dễ test.',
      ].join('\n'),
      en: [
        'A reducer makes state changes predictable via explicit actions (add/move).',
        'Return new immutable state for React updates and easier unit testing.',
      ].join('\n'),
    },
  },

  'fe-accessible-form': {
    primaryLanguage: 'html',
    code: {
      html: `<form novalidate>
  <div>
    <label for="email">Email</label>
    <input
      id="email"
      name="email"
      type="email"
      aria-invalid="true"
      aria-describedby="email-error"
    />
    <p id="email-error" role="alert">Email không hợp lệ.</p>
  </div>

  <button type="submit">Submit</button>
</form>
`,
    },
    explanation: {
      vi: [
        'Lỗi field nên gắn với input bằng `aria-describedby` và bật `aria-invalid="true"` khi invalid.',
        'Message lỗi dùng `role="alert"` (hoặc `aria-live`) để screen reader announce khi lỗi xuất hiện.',
      ].join('\n'),
      en: [
        'Connect errors to inputs via `aria-describedby` and set `aria-invalid="true"` when invalid.',
        'Use `role="alert"` (or `aria-live`) so screen readers announce new error messages.',
      ].join('\n'),
    },
  },

  'fe-keyboard-modal': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { useEffect, useRef } from 'react';

function getFocusable(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
}

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    if (dialog) {
      const focusables = getFocusable(dialog);
      (focusables[0] ?? dialog).focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables = getFocusable(dialog);
      if (focusables.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      lastActiveRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" ref={dialogRef} tabIndex={-1}>
      <button onClick={onClose}>Close</button>
      {children}
    </div>
  );
}
`,
    },
    explanation: {
      vi: [
        'Khi mở modal: lưu element đang focus, focus vào phần tử focusable đầu tiên trong modal.',
        'Trap focus bằng cách intercept `Tab` và vòng lại first/last; hỗ trợ `Escape` để đóng.',
        'Khi đóng modal: trả focus về element trước đó.',
      ].join('\n'),
      en: [
        'On open: store the previously focused element and focus the first focusable element inside the dialog.',
        'Trap focus by intercepting `Tab` and looping between first/last; support `Escape` to close.',
        'On close: restore focus to the previous element.',
      ].join('\n'),
    },
  },

  'fe-live-region-toast': {
    primaryLanguage: 'html',
    code: {
      html: `<div
  aria-live="polite"
  aria-atomic="true"
  style="position: fixed; right: 16px; bottom: 16px"
>
  <!-- Toast messages injected here -->
  <div role="status">Saved successfully.</div>
</div>
`,
    },
    explanation: {
      vi: [
        'Toast “info/success” thường dùng `aria-live="polite"` để không cắt ngang người dùng.',
        'Bật `aria-atomic="true"` để đọc toàn bộ message khi thay đổi.',
        'Nếu là lỗi nghiêm trọng, cân nhắc `aria-live="assertive"` nhưng dùng hạn chế để tránh spam.',
      ].join('\n'),
      en: [
        'For success/info toasts, prefer `aria-live="polite"` to avoid interrupting users.',
        'Use `aria-atomic="true"` so the whole message is announced.',
        'Use `aria-live="assertive"` sparingly for critical errors only.',
      ].join('\n'),
    },
  },

  'fe-color-contrast-audit': {
    primaryLanguage: 'css',
    code: {
      css: `:root {
  /* Base palette */
  --bg: #0a0726;
  --surface: #121041;

  /* Contrast-safe text */
  --text: #f5f7ff;
  --text-muted: rgba(245, 247, 255, 0.72);

  /* Action colors (avoid low-contrast orange on bright bg) */
  --brand: #ff7e5f;
  --brand-strong: #ff5b3a;
  --focus: #7dd3fc;
}

.btn {
  background: var(--brand);
  color: #0a0726;
}

.btn:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
`,
    },
    explanation: {
      vi: [
        'Chuẩn hoá theme bằng CSS variables để audit/đổi palette dễ hơn.',
        'Tách rõ `--text` và `--text-muted` (không dùng opacity quá thấp trên nền tối).',
        'Đảm bảo focus ring đủ nổi (`:focus-visible`) để hỗ trợ keyboard navigation.',
      ].join('\n'),
      en: [
        'Normalize theme tokens with CSS variables to make audits and palette changes easier.',
        'Separate `--text` and `--text-muted` (avoid overly low opacity on dark backgrounds).',
        'Provide a strong `:focus-visible` outline for keyboard users.',
      ].join('\n'),
    },
  },

  'fe-dashboard-fetch': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `type KPI = { label: string; value: number };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Request failed: ' + res.status);
  return res.json();
}

export async function loadDashboard() {
  // Concurrent requests (fail fast if any request fails)
  const [kpis, activity] = await Promise.all([
    fetchJson<KPI[]>('/api/kpis'),
    fetchJson<string[]>('/api/activity'),
  ]);

  return { kpis, activity };
}
`,
    },
    explanation: {
      vi: [
        'Dùng `Promise.all` để chạy song song các call độc lập, giảm tổng latency.',
        'Tách `fetchJson<T>` để chuẩn hoá error handling và type inference.',
        'UI layer nên model state rõ ràng: `loading | success | error` thay vì nhiều boolean.',
      ].join('\n'),
      en: [
        'Use `Promise.all` to run independent requests concurrently and reduce total latency.',
        'Extract `fetchJson<T>` for consistent error handling and strong typing.',
        'In the UI, model state explicitly: `loading | success | error` instead of multiple booleans.',
      ].join('\n'),
    },
  },

  'fe-optimistic-todo-sync': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `type Todo = { id: string; title: string; done: boolean };

async function apiToggleTodo(id: string): Promise<Todo> {
  const res = await fetch('/api/todos/' + encodeURIComponent(id) + '/toggle', {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Toggle failed');
  return res.json();
}

export async function optimisticToggle(
  todos: Todo[],
  id: string,
  setTodos: (next: Todo[]) => void
) {
  const prev = todos;
  const optimistic = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  setTodos(optimistic);

  try {
    const server = await apiToggleTodo(id);
    // Reconcile using server truth (handles stale fields)
    setTodos((current) => current.map((t) => (t.id === id ? server : t)));
  } catch (e) {
    // Roll back on failure
    setTodos(prev);
    throw e;
  }
}
`,
    },
    explanation: {
      vi: [
        'Optimistic UI: update ngay để UX “nhanh”, nhưng luôn có rollback khi API fail.',
        'Sau khi server trả về, reconcile theo “server truth” để tránh drift (ví dụ server có thêm field).',
        'Trong app thật, nên kèm request id/version để chống race-condition khi click liên tục.',
      ].join('\n'),
      en: [
        'Optimistic UI: update immediately for responsiveness, but keep a rollback path if the API fails.',
        'Reconcile with the server response to avoid drift.',
        'In real apps, include a request/version id to avoid race conditions with rapid toggles.',
      ].join('\n'),
    },
  },

  'fe-infinite-feed': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { useEffect, useRef, useState } from 'react';

type FeedItem = { id: string; title: string };
type Page = { items: FeedItem[]; nextCursor: string | null };

async function fetchPage(cursor: string | null): Promise<Page> {
  const url = cursor
    ? '/api/feed?cursor=' + encodeURIComponent(cursor)
    : '/api/feed';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}

export function useInfiniteFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const loadingRef = useRef(false);

  async function loadMore() {
    if (loadingRef.current) return;
    if (status === 'done') return;
    loadingRef.current = true;
    setStatus('loading');
    try {
      const page = await fetchPage(cursor);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setStatus(page.nextCursor ? 'idle' : 'done');
    } catch {
      setStatus('error');
    } finally {
      loadingRef.current = false;
    }
  }

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) loadMore();
    });
    io.observe(node);
    return () => io.disconnect();
  }, [cursor, status]);

  return { items, status, loadMore, sentinelRef };
}
`,
    },
    explanation: {
      vi: [
        'Dùng `IntersectionObserver` để trigger load khi “sentinel” chạm viewport (mượt hơn scroll listener).',
        'Giữ `cursor` và `status` rõ ràng (`idle/loading/error/done`) để UI render end-of-list / retry chính xác.',
        'Chặn concurrent loads bằng `loadingRef` để tránh duplicate requests.',
      ].join('\n'),
      en: [
        'Use `IntersectionObserver` to trigger loads when a sentinel enters the viewport (smoother than scroll listeners).',
        'Keep `cursor` and `status` explicit to render end-of-list and retry states correctly.',
        'Prevent concurrent loads with a ref guard to avoid duplicate requests.',
      ].join('\n'),
    },
  },

  'fe-error-boundary-data': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import React from 'react';

export class DataErrorBoundary extends React.Component<
  { onRetry: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <p>Something went wrong while rendering.</p>
          <button onClick={() => (this.setState({ hasError: false }), this.props.onRetry())}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage:
// <DataErrorBoundary onRetry={() => refetch()}>
//   <Screen />
// </DataErrorBoundary>
`,
    },
    explanation: {
      vi: [
        'Error Boundary chỉ bắt lỗi render/lifecycle (không bắt lỗi async trong `fetch`).',
        'Data screen “resilient” thường có 4 trạng thái: skeleton/loading, empty, error + retry, success.',
        'Retry nên reset error UI và gọi lại `refetch` (hoặc reset query cache).',
      ].join('\n'),
      en: [
        'Error Boundaries catch render/lifecycle errors (not async `fetch` errors).',
        'A resilient data screen typically has: loading (skeleton), empty, error+retry, success.',
        'Retry should reset error UI and trigger a refetch (or reset query cache).',
      ].join('\n'),
    },
  },

  'fe-array-transform-pipeline': {
    primaryLanguage: 'javascript',
    code: {
      javascript: `/**
 * Turn a raw product list into a clean feed:
 * - remove disabled items
 * - normalize pricing
 * - sort by score desc
 */
function buildFeed(products) {
  return products
    .filter((p) => p && p.enabled)
    .map((p) => ({
      id: String(p.id),
      title: String(p.title ?? '').trim(),
      price: Number(p.priceCents ?? 0) / 100,
      score: Number(p.score ?? 0),
    }))
    .filter((p) => p.title.length > 0)
    .sort((a, b) => b.score - a.score);
}
`,
    },
    explanation: {
      vi: [
        'Pipeline tốt: mỗi bước làm đúng 1 việc (filter -> map -> filter -> sort) và đặt tên field rõ.',
        'Normalize dữ liệu sớm (`String/Number`) để tránh bug do API trả shape không ổn định.',
      ].join('\n'),
      en: [
        'A good pipeline: each step does one thing (filter -> map -> filter -> sort) with clear field names.',
        'Normalize input early (`String/Number`) to avoid bugs from unstable API payloads.',
      ].join('\n'),
    },
  },

  'fe-event-loop-order': {
    primaryLanguage: 'javascript',
    code: {
      javascript: `console.log('A');

setTimeout(() => console.log('B (timer)'), 0);

Promise.resolve().then(() => console.log('C (microtask)'));

console.log('D');

// Output:
// A
// D
// C (microtask)
// B (timer)
`,
    },
    explanation: {
      vi: [
        'Trong browser/Node: synchronous code chạy trước, microtasks (Promise) chạy sau đó, timers chạy ở tick tiếp theo.',
        'Khi debug bug “thứ tự render” hoặc “state cập nhật lạ”, hãy kiểm tra microtask queue (Promise) vs task queue (setTimeout).',
      ].join('\n'),
      en: [
        'In browsers/Node: synchronous code runs first, then microtasks (Promises), then timers on the next tick.',
        'When debugging odd ordering issues, distinguish microtask queue (Promise) vs task queue (setTimeout).',
      ].join('\n'),
    },
  },

  'fe-defensive-optional-chain': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `type ApiProfile = {
  user?: {
    name?: string;
    avatar?: { url?: string };
  };
};

export function toProfileViewModel(payload: ApiProfile) {
  const name = payload.user?.name?.trim() || 'Anonymous';
  const avatarUrl = payload.user?.avatar?.url ?? null;

  return { name, avatarUrl };
}
`,
    },
    explanation: {
      vi: [
        'Dùng optional chaining (`?.`) và nullish coalescing (`??`) để xử lý payload thiếu field mà không crash.',
        'Tốt nhất là chuyển payload về “view model” (normalization layer) thay vì rải `?.` khắp UI.',
      ].join('\n'),
      en: [
        'Use optional chaining (`?.`) and nullish coalescing (`??`) to handle partial payloads safely.',
        'Prefer a normalization/view-model layer instead of scattering `?.` throughout the UI.',
      ].join('\n'),
    },
  },

  'fe-typesafe-api-client': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; status: number; message: string };
type ApiResult<T> = ApiOk<T> | ApiErr;

async function request<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      return { ok: false, status: res.status, message: await res.text() };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (e) {
    return { ok: false, status: 0, message: (e as Error).message };
  }
}

type User = { id: string; name: string };
export function getUser(id: string) {
  return request<User>('/api/users/' + encodeURIComponent(id));
}
`,
    },
    explanation: {
      vi: [
        'Return type `ApiResult<T>` (discriminated union) giúp call-site bắt buộc handle error.',
        'Không throw exception cho lỗi HTTP thường gặp; thay vào đó trả `{ ok: false, ... }` để UI quyết định retry/toast.',
      ].join('\n'),
      en: [
        'Returning `ApiResult<T>` (a discriminated union) forces call-sites to handle errors.',
        'Avoid throwing for common HTTP errors; return `{ ok: false, ... }` so the UI can decide retry/toast behavior.',
      ].join('\n'),
    },
  },

  'fe-discriminated-union-state': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `type UiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function isSuccess<T>(s: UiState<T>): s is Extract<UiState<T>, { status: 'success' }> {
  return s.status === 'success';
}

// Example usage:
// if (isSuccess(state)) state.data ... (type-safe)
`,
    },
    explanation: {
      vi: [
        'Thay vì `isLoading/isError/hasData` (dễ mâu thuẫn), dùng union `status` để state không thể “vừa loading vừa error”.',
        'TypeScript sẽ auto narrow theo `status` giúp UI code ít if/else rối và ít bug hơn.',
      ].join('\n'),
      en: [
        'Instead of `isLoading/isError/hasData` booleans (can conflict), use a `status` union to enforce valid states.',
        'TypeScript narrows by `status`, producing clearer and safer UI code.',
      ].join('\n'),
    },
  },

  'fe-generic-table-props': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
}) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key}>{c.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)}>
            {columns.map((c) => (
              <td key={c.key}>{c.render(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
`,
    },
    explanation: {
      vi: [
        'Bí quyết: column nhận `render(row: T)` để TS infer đúng kiểu row, tránh `any`.',
        'Tách `rowKey` để tránh phụ thuộc vào field “id” cố định (table dùng được cho nhiều dataset).',
      ].join('\n'),
      en: [
        'Key idea: columns use `render(row: T)` so TypeScript infers row types without `any`.',
        'Provide `rowKey` to avoid hardcoding an `id` field and keep the table reusable.',
      ].join('\n'),
    },
  },

  'fe-zustand-cart-slice': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { create } from 'zustand';

type CartLine = { sku: string; qty: number };
type CartState = {
  lines: CartLine[];
  add: (sku: string) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  totalItems: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  add: (sku) =>
    set((s) => {
      const existing = s.lines.find((l) => l.sku === sku);
      if (!existing) return { lines: [...s.lines, { sku, qty: 1 }] };
      return {
        lines: s.lines.map((l) => (l.sku === sku ? { ...l, qty: l.qty + 1 } : l)),
      };
    }),
  remove: (sku) => set((s) => ({ lines: s.lines.filter((l) => l.sku !== sku) })),
  setQty: (sku, qty) =>
    set((s) => ({
      lines: s.lines.map((l) => (l.sku === sku ? { ...l, qty: Math.max(0, qty) } : l)),
    })),
  totalItems: () => get().lines.reduce((sum, l) => sum + l.qty, 0),
}));
`,
    },
    explanation: {
      vi: [
        'Slice nên có actions nhỏ và predictable (`add/remove/setQty`), tránh “god store”.',
        'Selector như `totalItems()` tách khỏi UI giúp reuse và test dễ.',
      ].join('\n'),
      en: [
        'Keep the slice focused with predictable actions (`add/remove/setQty`) instead of a “god store”.',
        'Expose selectors like `totalItems()` for reuse and easier testing.',
      ].join('\n'),
    },
  },

  'fe-context-render-split': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { createContext, useContext, useMemo, useState } from 'react';

type Settings = { theme: 'dark' | 'light'; language: 'vi' | 'en' };

const SettingsStateCtx = createContext<Settings | null>(null);
const SettingsActionsCtx = createContext<{ setTheme: (t: Settings['theme']) => void } | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({ theme: 'dark', language: 'vi' });

  const actions = useMemo(
    () => ({
      setTheme: (t: Settings['theme']) => setSettings((s) => ({ ...s, theme: t })),
    }),
    []
  );

  return (
    <SettingsActionsCtx.Provider value={actions}>
      <SettingsStateCtx.Provider value={settings}>{children}</SettingsStateCtx.Provider>
    </SettingsActionsCtx.Provider>
  );
}

export function useSettingsState() {
  const v = useContext(SettingsStateCtx);
  if (!v) throw new Error('Missing SettingsProvider');
  return v;
}

export function useSettingsActions() {
  const v = useContext(SettingsActionsCtx);
  if (!v) throw new Error('Missing SettingsProvider');
  return v;
}
`,
    },
    explanation: {
      vi: [
        'Tách “state context” và “actions context” giúp component chỉ dùng actions không bị rerender khi state đổi.',
        'Dùng `useMemo` cho actions để giữ reference ổn định.',
      ].join('\n'),
      en: [
        'Split state and actions contexts so action-only consumers do not rerender when state changes.',
        'Memoize actions to keep stable references.',
      ].join('\n'),
    },
  },

  'fe-realtime-notification-store': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `type Notification = { id: string; createdAt: number; read: boolean; title: string };
type Store = { byId: Map<string, Notification>; order: string[]; unread: number };

export function applyNotificationEvent(state: Store, incoming: Notification): Store {
  const exists = state.byId.get(incoming.id);
  const byId = new Map(state.byId);
  byId.set(incoming.id, { ...exists, ...incoming });

  const order = exists ? state.order : [incoming.id, ...state.order];
  // Keep stable ordering: newest first by createdAt, but do not reshuffle existing ids unnecessarily.
  // If you want strict ordering, sort by createdAt here.

  const unread = Array.from(byId.values()).reduce((sum, n) => sum + (n.read ? 0 : 1), 0);
  return { byId, order, unread };
}
`,
    },
    explanation: {
      vi: [
        'Realtime store nên normalize dữ liệu: `byId` + `order` để update O(1) và render list ổn định.',
        'Event trùng id chỉ merge field, không insert duplicate vào `order`.',
        'Unread count derive từ store (hoặc maintain incrementally nếu dataset lớn).',
      ].join('\n'),
      en: [
        'Normalize realtime data using `byId` + `order` for O(1) updates and stable list rendering.',
        'Merge events by id instead of inserting duplicates.',
        'Compute unread count from the store (or maintain incrementally for very large datasets).',
      ].join('\n'),
    },
  },

  'fe-component-unit-test': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function Counter({ onChange }: { onChange: (n: number) => void }) {
  const [n, setN] = React.useState(0);
  return (
    <div>
      <span aria-label="count">{n}</span>
      <button
        onClick={() => {
          const next = n + 1;
          setN(next);
          onChange(next);
        }}
      >
        Inc
      </button>
    </div>
  );
}

test('increments and calls onChange', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<Counter onChange={onChange} />);

  await user.click(screen.getByRole('button', { name: /inc/i }));
  expect(screen.getByLabelText('count')).toHaveTextContent('1');
  expect(onChange).toHaveBeenCalledWith(1);
});
`,
    },
    explanation: {
      vi: [
        'Test unit tập trung vào hành vi observable: render output + user action + callback.',
        'Dùng `userEvent` thay vì fireEvent để mô phỏng tương tác gần với người dùng thật.',
      ].join('\n'),
      en: [
        'Unit tests should focus on observable behavior: render output, user interactions, and callbacks.',
        'Prefer `userEvent` over `fireEvent` for more realistic interactions.',
      ].join('\n'),
    },
  },

  'fe-form-interaction-test': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('disables submit until form is valid', async () => {
  const user = userEvent.setup();
  render(<SignupForm />);

  const submit = screen.getByRole('button', { name: /sign up/i });
  expect(submit).toBeDisabled();

  await user.type(screen.getByLabelText(/email/i), 'a@b.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');

  expect(submit).toBeEnabled();
});
`,
    },
    explanation: {
      vi: [
        'Interaction test nên cover flow thật: type -> validation -> button state -> submit.',
        'Query theo role/label thay vì className để test bền hơn (ít phụ thuộc UI refactor).',
      ].join('\n'),
      en: [
        'Interaction tests should cover the real flow: type -> validation -> button state -> submit.',
        'Query by role/label instead of className to make tests resilient to UI refactors.',
      ].join('\n'),
    },
  },

  'fe-a11y-regression-test': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

test('no a11y violations', async () => {
  const { container } = render(<CheckoutPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
`,
    },
    explanation: {
      vi: [
        'A11y regression test dùng `axe` để bắt các lỗi phổ biến: label thiếu, contrast, aria sai.',
        'Không thay thế manual audit, nhưng rất hiệu quả để chống “regression” khi codebase lớn dần.',
      ].join('\n'),
      en: [
        'Use `axe` to catch common accessibility issues (missing labels, invalid aria, etc.).',
        'It does not replace manual audits, but it is excellent for preventing regressions over time.',
      ].join('\n'),
    },
  },

  'fe-large-list-memoization': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { memo, useMemo, useState } from 'react';

type Row = { id: string; title: string };

const RowItem = memo(function RowItem({ row }: { row: Row }) {
  return <li>{row.title}</li>;
});

export function LargeList({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.title.toLowerCase().includes(s));
  }, [rows, q]);

  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <ul>
        {filtered.map((row) => (
          <RowItem key={row.id} row={row} />
        ))}
      </ul>
    </div>
  );
}
`,
    },
    explanation: {
      vi: [
        'Memoize computation nặng (`filtered`) bằng `useMemo`.',
        'Memoize item component (`React.memo`) để tránh rerender list item khi props không đổi.',
      ].join('\n'),
      en: [
        'Memoize expensive computations (e.g. `filtered`) with `useMemo`.',
        'Use `React.memo` for row items to reduce rerenders when props do not change.',
      ].join('\n'),
    },
  },

  'fe-image-loading-budget': {
    primaryLanguage: 'html',
    code: {
      html: `<!-- Hero image: high priority -->
<img
  src="/img/hero.jpg"
  alt="Hero"
  width="1200"
  height="600"
  fetchpriority="high"
  decoding="async"
/>

<!-- Non-critical images: lazy -->
<img src="/img/card-1.jpg" alt="Card 1" loading="lazy" decoding="async" />
<img src="/img/card-2.jpg" alt="Card 2" loading="lazy" decoding="async" />
`,
    },
    explanation: {
      vi: [
        'Ưu tiên hero asset (above-the-fold) bằng `fetchpriority="high"` và kích thước cố định (giảm layout shift).',
        'Các ảnh dưới fold dùng `loading="lazy"` để giảm tải network và cải thiện TTI.',
      ].join('\n'),
      en: [
        'Prioritize above-the-fold hero assets with `fetchpriority="high"` and explicit dimensions (reduce layout shift).',
        'Lazy-load non-critical images to reduce network contention and improve TTI.',
      ].join('\n'),
    },
  },

  'fe-bundle-split-route': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const HeavyReports = lazy(() => import('../pages/ReportsPage'));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/reports"
        element={
          <Suspense fallback={<div>Loading…</div>}>
            <HeavyReports />
          </Suspense>
        }
      />
    </Routes>
  );
}
`,
    },
    explanation: {
      vi: [
        'Code-splitting theo route giúp initial bundle nhỏ hơn, đặc biệt với page nặng (charts/editor).',
        'Luôn có fallback UI hợp lý (skeleton/spinner) để UX không “đơ”.',
      ].join('\n'),
      en: [
        'Route-level code splitting reduces initial bundle size, especially for heavy pages (charts/editors).',
        'Always provide a reasonable fallback UI (skeleton/spinner) to avoid “blank” transitions.',
      ].join('\n'),
    },
  },

  'fe-schema-driven-form': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `type Field =
  | { type: 'text'; name: 'fullName'; label: string; required?: boolean }
  | { type: 'email'; name: 'email'; label: string; required?: boolean }
  | { type: 'select'; name: 'plan'; label: string; options: string[] };

const schema: Field[] = [
  { type: 'text', name: 'fullName', label: 'Full name', required: true },
  { type: 'email', name: 'email', label: 'Email', required: true },
  { type: 'select', name: 'plan', label: 'Plan', options: ['Free', 'Pro'] },
];

export function validate(values: Record<string, string>) {
  const errors: Record<string, string> = {};
  for (const f of schema) {
    const v = values[f.name] ?? '';
    if (f.required && !v.trim()) errors[f.name] = 'Required';
    if (f.type === 'email' && v && !v.includes('@')) errors[f.name] = 'Invalid email';
  }
  return errors;
}
`,
    },
    explanation: {
      vi: [
        'Schema-driven form: field list là data, UI chỉ render theo schema.',
        'Validation cũng dựa schema để tránh “logic rải rác” trong từng component.',
      ].join('\n'),
      en: [
        'In schema-driven forms, fields are data and the UI renders from the schema.',
        'Centralize validation based on the same schema to avoid scattered component logic.',
      ].join('\n'),
    },
  },

  'fe-dependent-field-validation': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `type Values = { password: string; confirm: string };

export function validate(values: Values) {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (values.password.length < 8) errors.password = 'Min 8 chars';
  if (values.confirm !== values.password) errors.confirm = 'Passwords do not match';
  return errors;
}
`,
    },
    explanation: {
      vi: [
        'Dependent validation: validate `confirm` dựa trên `password` hiện tại.',
        'Tránh hiển thị lỗi quá sớm (UX): chỉ show mismatch sau khi user “touched” confirm hoặc submit.',
      ].join('\n'),
      en: [
        'Dependent validation: validate `confirm` against the current `password` value.',
        'For better UX, show mismatch only after the confirm field is touched or on submit.',
      ].join('\n'),
    },
  },

  'fe-draft-autosave-form': {
    primaryLanguage: 'typescript',
    code: {
      typescript: `import { useEffect, useState } from 'react';

const KEY = 'draft:checkout:v1';

type Draft = { email: string; address: string };

function safeRead(): Draft | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function useDraftAutosave() {
  const [draft, setDraft] = useState<Draft>(() => safeRead() ?? { email: '', address: '' });

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(draft));
      } catch {
        // ignore
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [draft]);

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }

  return { draft, setDraft, clear };
}
`,
    },
    explanation: {
      vi: [
        'Autosave dạng debounce (300ms) để giảm ghi localStorage liên tục.',
        'Dùng “safe read/write” để không crash trong môi trường chặn storage (private mode).',
        'Khi submit thành công, gọi `clear()` để không restore draft cũ.',
      ].join('\n'),
      en: [
        'Debounce autosave (300ms) to avoid excessive localStorage writes.',
        'Use safe read/write to avoid crashes when storage is unavailable.',
        'Clear the draft after successful submit to prevent restoring stale data.',
      ].join('\n'),
    },
  },
  ...PRACTICE_BACKEND_SOLUTIONS,
};

export function pickSolutionCode(
  content: PracticeSolutionContent,
  language: PracticeLanguage
): string {
  return (
    content.code[language] ??
    content.code[content.primaryLanguage] ??
    content.code.typescript ??
    content.code.javascript ??
    content.code.html ??
    content.code.css ??
    ''
  );
}
