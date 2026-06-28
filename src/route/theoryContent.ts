// theoryContent.ts
// Full theory content for all 21 practice topics in CodeForGlory
// Each topic has: overview, keyPoints, sections (with code examples), quiz

export type TheoryCodeExample = {
  id: string;
  label: string;
  lang: string;
  code: string;
  caption?: string;
};

export type TheorySection = {
  id: string;
  title: string;
  icon: string;
  body: string; // markdown-like rich text
  examples?: TheoryCodeExample[];
  callout?: { type: 'tip' | 'warning' | 'info' | 'danger'; text: string };
};

export type TheoryQuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct: number; // index
  explanation: string;
};

export type TopicTheory = {
  topic: string;
  tagline: string;
  overview: string;
  estimatedRead: string; // e.g. "8 min"
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  sections: TheorySection[];
  quiz: TheoryQuizQuestion[];
};

export const THEORY_CONTENT: Record<string, TopicTheory> = {
  'HTML & Semantics': {
    topic: 'HTML & Semantics',
    tagline: 'Structure that speaks for itself',
    overview:
      'HTML is more than angle brackets — it is a contract between your page and every system that reads it: browsers, screen readers, search crawlers, and AI parsers. Semantic HTML encodes meaning directly in the markup so machines understand the document structure without relying on CSS classes or visual cues.',
    estimatedRead: '9 min',
    difficulty: 'Foundational',
    sections: [
      {
        id: 'why-semantics',
        title: 'Why Semantics Matter',
        icon: 'lightbulb',
        body: 'A <div> tells the browser nothing. A <nav> tells it "this is navigation." That difference unlocks accessibility shortcuts, better SEO ranking signals, and predictable styling hooks. Semantic elements carry an implicit ARIA role — <main> is implicitly role="main", <button> is implicitly role="button" — so you get accessibility for free when you choose the right tag.',
        callout: {
          type: 'info',
          text: 'Screen readers give users a "landmarks" shortcut to jump between <header>, <main>, <nav>, and <footer>. Div soup breaks this entirely.',
        },
      },
      {
        id: 'document-outline',
        title: 'The Document Outline',
        icon: 'account_tree',
        body: 'Every HTML document should read like a book: a single <h1> per page (the title), followed by <h2> sections, <h3> subsections, and so on. Never skip heading levels for visual styling purposes — use CSS for that instead. The heading hierarchy forms the accessibility tree that assistive technology navigates.',
        examples: [
          {
            id: 'outline-bad',
            label: '❌ Bad — div soup with no hierarchy',
            lang: 'html',
            code: `<div class="header">My Blog</div>
<div class="big-text">Post Title</div>
<div class="medium-text">Section A</div>
<div class="content">...</div>`,
          },
          {
            id: 'outline-good',
            label: '✅ Good — semantic outline',
            lang: 'html',
            code: `<header>
  <a href="/" class="logo">My Blog</a>
  <nav aria-label="Main">...</nav>
</header>
<main>
  <article>
    <h1>Post Title</h1>
    <section>
      <h2>Section A</h2>
      <p>...</p>
    </section>
  </article>
</main>
<footer>...</footer>`,
          },
        ],
      },
      {
        id: 'landmark-elements',
        title: 'Landmark Elements',
        icon: 'map',
        body: 'HTML5 introduced landmark elements that map directly to ARIA landmark roles. Use exactly one <main> per page — it marks the primary content. Wrap site-wide navigation in <nav>. Use <header> and <footer> for the page shell, but they can also appear inside <article> or <section> to scope to that content.',
        examples: [
          {
            id: 'landmarks',
            label: 'Core landmark shell',
            lang: 'html',
            code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Page Title</title>
  </head>
  <body>
    <header>
      <nav aria-label="Primary">...</nav>
    </header>

    <main>
      <section aria-labelledby="hero-heading">
        <h1 id="hero-heading">Welcome</h1>
      </section>

      <aside aria-label="Related links">...</aside>
    </main>

    <footer>
      <nav aria-label="Footer links">...</nav>
    </footer>
  </body>
</html>`,
          },
        ],
        callout: {
          type: 'tip',
          text: 'Add aria-label to <nav> elements when you have more than one on a page, so screen reader users can distinguish "Primary navigation" from "Footer navigation".',
        },
      },
      {
        id: 'interactive-elements',
        title: 'Interactive Element Rules',
        icon: 'touch_app',
        body: 'Use <button> for in-page actions (open modal, toggle menu, submit form). Use <a href="..."> for navigation. Never use <div onClick> — it breaks keyboard navigation and screen reader announcements. If you must use a non-native element as a button, add role="button", tabindex="0", and keyboard event handlers.',
        examples: [
          {
            id: 'interactive',
            label: 'Button vs Link',
            lang: 'html',
            code: `<!-- Action → button -->
<button type="button" onclick="openModal()">
  Open Settings
</button>

<!-- Navigation → anchor -->
<a href="/dashboard">Go to Dashboard</a>

<!-- Form submit → input or button[type=submit] -->
<button type="submit">Save Changes</button>

<!-- AVOID: non-semantic click handler -->
<!-- <div onclick="...">Click me</div>  ❌ -->`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Which element correctly marks the primary content of a page?',
        options: ['<div id="main">', '<section>', '<main>', '<article>'],
        correct: 2,
        explanation:
          '<main> is the correct landmark for primary page content. There should be exactly one per page. <div id="main"> has no semantic value, and <section>/<article> are content sectioning elements, not landmarks.',
      },
      {
        id: 'q2',
        question:
          'A page has two <nav> elements — one primary, one footer. What should you add?',
        options: [
          'role="navigation" to both',
          'aria-label to distinguish them',
          'id attributes to both',
          'Nothing, two <nav> elements is invalid',
        ],
        correct: 1,
        explanation:
          'Adding aria-label (e.g., aria-label="Primary" and aria-label="Footer links") lets screen reader users distinguish between multiple navigation landmarks when browsing by landmark.',
      },
      {
        id: 'q3',
        question:
          'Why should you never use <div> with an onClick for a button?',
        options: [
          'It is slower to render',
          'It lacks keyboard focus and ARIA role by default',
          'CSS cannot style it',
          'JavaScript does not work on divs',
        ],
        correct: 1,
        explanation:
          'A <div> is not focusable by default and has no implicit role, so keyboard users cannot Tab to it, and screen readers will not announce it as interactive. <button> gets focus, role="button", and keyboard events for free.',
      },
    ],
  },

  'CSS & Layout': {
    topic: 'CSS & Layout',
    tagline: 'Control space, flow, and stacking order',
    overview:
      'Modern CSS layout is built on two complementary systems: Flexbox for one-dimensional flows and Grid for two-dimensional structure. Understanding how each model handles space distribution, alignment, and overflow is the difference between layouts that break under content and layouts that adapt gracefully.',
    estimatedRead: '10 min',
    difficulty: 'Foundational',
    sections: [
      {
        id: 'box-model',
        title: 'The Box Model',
        icon: 'crop_square',
        body: 'Every element is a rectangular box. box-sizing: border-box (the modern default in most resets) means width and height include padding and border — the intuitive model. The default content-box means padding adds to the declared width, which is almost never what you want.',
        examples: [
          {
            id: 'box-model',
            label: 'Box sizing reset',
            lang: 'css',
            code: `*, *::before, *::after {
  box-sizing: border-box;
}

/* With border-box: a 200px card stays 200px
   regardless of padding/border */
.card {
  width: 200px;
  padding: 24px;    /* included in 200px */
  border: 1px solid #ccc; /* also included */
}`,
          },
        ],
      },
      {
        id: 'flexbox',
        title: 'Flexbox — One-Dimensional Layout',
        icon: 'view_column',
        body: 'Flexbox controls layout along one axis at a time: row (default) or column. The container defines the axis and distribution strategy; the children control their own growth, shrinkage, and basis. Key mental model: flex-grow decides how to share extra space, flex-shrink decides how to handle overflow, and flex-basis is the starting size before distribution.',
        examples: [
          {
            id: 'flex-row',
            label: 'Horizontal nav bar',
            lang: 'css',
            code: `.navbar {
  display: flex;
  align-items: center;       /* cross-axis: vertical center */
  justify-content: space-between; /* main-axis: push logo ↔ links */
  gap: 16px;
  padding: 0 24px;
  height: 64px;
}

/* Spacer pattern — push last item to far right */
.navbar__spacer {
  flex: 1;
}`,
          },
          {
            id: 'flex-card',
            label: 'Equal-height card grid (flex-wrap)',
            lang: 'css',
            code: `.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.card {
  flex: 1 1 280px;  /* grow | shrink | min-width */
  display: flex;
  flex-direction: column;
}

/* Push footer to bottom of card regardless of content height */
.card__footer {
  margin-top: auto;
}`,
          },
        ],
      },
      {
        id: 'grid',
        title: 'CSS Grid — Two-Dimensional Layout',
        icon: 'grid_on',
        body: 'Grid excels at placing items across rows and columns simultaneously. Define the track structure on the container, then let items auto-place or explicitly position themselves. grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) is the one-liner that gives you a responsive grid without media queries.',
        examples: [
          {
            id: 'grid-basic',
            label: 'Responsive product grid',
            lang: 'css',
            code: `.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

/* Featured card spans 2 columns on wider screens */
@media (min-width: 768px) {
  .product-card--featured {
    grid-column: span 2;
  }
}`,
          },
          {
            id: 'grid-dashboard',
            label: 'Dashboard layout with named areas',
            lang: 'css',
            code: `.dashboard {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  height: 100vh;
}

.sidebar { grid-area: sidebar; }
.header  { grid-area: header;  }
.main    { grid-area: main;    }`,
          },
        ],
        callout: {
          type: 'tip',
          text: 'Choose Flexbox when you are laying items out along a single direction (a row of buttons, a vertical stack). Choose Grid when you need to control both dimensions simultaneously (a card grid, a page shell).',
        },
      },
      {
        id: 'positioning',
        title: 'Positioning & Stacking',
        icon: 'layers',
        body: 'The position property takes elements out of normal flow. relative creates a positioning context without removing the element from flow. absolute positions relative to the nearest positioned ancestor. fixed pins to the viewport. sticky is a hybrid: flows normally until a scroll threshold is hit, then sticks. z-index only works on positioned elements.',
        examples: [
          {
            id: 'sticky',
            label: 'Sticky sidebar',
            lang: 'css',
            code: `.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  align-items: start;  /* key: without this, sidebar stretches full height */
}

.sidebar {
  position: sticky;
  top: 24px;         /* sticks 24px from top of viewport */
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'You want 3 items in a row on desktop, wrapping to 1 column on mobile. Which property achieves this without media queries?',
        options: [
          'flex-direction: column',
          'grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))',
          'display: inline-block',
          'float: left',
        ],
        correct: 1,
        explanation:
          'repeat(auto-fill, minmax(200px, 1fr)) creates as many columns as fit at minimum 200px wide, automatically collapsing to fewer columns (and eventually one) as the viewport shrinks.',
      },
      {
        id: 'q2',
        question:
          'A sticky sidebar is not sticking. Its parent has overflow: auto. What is the likely cause?',
        options: [
          'position: sticky requires JavaScript',
          'overflow: auto on an ancestor breaks sticky positioning',
          'sticky only works with Flexbox, not Grid',
          'You need to add z-index',
        ],
        correct: 1,
        explanation:
          'position: sticky is contained within its scroll container. If a parent has overflow: auto or overflow: scroll, the sticky element sticks within that container — which may not scroll — rather than the viewport.',
      },
      {
        id: 'q3',
        question: 'What does flex: 1 1 0 mean?',
        options: [
          'flex-grow: 1, flex-shrink: 1, flex-basis: 0 — share all available space equally',
          'The element is 1px wide',
          'flex-grow: 1, no shrink, 0 padding',
          'An invalid shorthand',
        ],
        correct: 0,
        explanation:
          'flex: 1 1 0 expands to flex-grow: 1, flex-shrink: 1, flex-basis: 0. Starting from 0, all items grow equally from the available space, giving perfectly equal widths when siblings all have flex: 1.',
      },
    ],
  },

  Accessibility: {
    topic: 'Accessibility',
    tagline: 'Build for every user, not just some',
    overview:
      'Accessibility (A11y) means building products that work for people regardless of disability, assistive technology, or input method. The Web Content Accessibility Guidelines (WCAG) define a testable standard at levels A, AA, and AAA. Most products target WCAG 2.1 AA. Beyond compliance, accessible products are simply better designed: cleaner markup, keyboard-friendly interactions, and meaningful feedback benefit all users.',
    estimatedRead: '11 min',
    difficulty: 'Intermediate',
    sections: [
      {
        id: 'aria-basics',
        title: 'ARIA — The Supplement, Not the Solution',
        icon: 'accessibility',
        body: 'ARIA (Accessible Rich Internet Applications) lets you communicate semantics to assistive technology that HTML alone cannot express. The first rule of ARIA: do not use it if a native HTML element does the job. A <button> is always better than <div role="button">. ARIA never changes visual appearance or keyboard behavior — it only changes what screen readers announce.',
        examples: [
          {
            id: 'aria-label',
            label: 'Labeling ambiguous icons',
            lang: 'html',
            code: `<!-- Icon-only button: add aria-label -->
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- Icon + visible text: hide icon from AT -->
<button type="button">
  <svg aria-hidden="true" focusable="false">...</svg>
  Save Changes
</button>`,
          },
        ],
      },
      {
        id: 'keyboard-nav',
        title: 'Keyboard Navigation',
        icon: 'keyboard',
        body: 'Every interactive element must be reachable by Tab and operable by keyboard alone. The focus outline must always be visible — never suppress it with outline: none without providing a visible alternative. For modals and flyouts, implement focus trapping: Tab cycles only within the open overlay, and Escape closes it, returning focus to the trigger.',
        examples: [
          {
            id: 'focus-trap',
            label: 'Focus trap hook (React)',
            lang: 'typescript',
            code: `import { useEffect, useRef } from 'react';

function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const focusable = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { /* close modal */ }
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    first?.focus();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return containerRef;
}`,
          },
        ],
        callout: {
          type: 'warning',
          text: 'Removing focus outlines with outline: none is one of the most common and damaging accessibility mistakes. Use :focus-visible to show outlines for keyboard users while hiding them on mouse clicks.',
        },
      },
      {
        id: 'form-accessibility',
        title: 'Accessible Forms',
        icon: 'edit_note',
        body: 'Every form control needs a programmatically associated label. Use <label for="id"> or wrap the input in <label>. Never use placeholder as the sole label — it vanishes on typing. For errors, add aria-invalid="true" to the field and aria-describedby pointing to the error message element so screen readers announce the error when the field is focused.',
        examples: [
          {
            id: 'form-a11y',
            label: 'Fully accessible form field',
            lang: 'html',
            code: `<div class="field">
  <label for="email">
    Email address
    <span aria-hidden="true" class="required">*</span>
  </label>

  <input
    id="email"
    type="email"
    name="email"
    autocomplete="email"
    aria-required="true"
    aria-invalid="true"
    aria-describedby="email-error"
    value=""
  />

  <p id="email-error" role="alert" class="error">
    Enter a valid email address.
  </p>
</div>`,
          },
        ],
      },
      {
        id: 'live-regions',
        title: 'Live Regions',
        icon: 'campaign',
        body: 'Live regions announce dynamic content changes to screen readers without requiring focus movement. aria-live="polite" waits for the user to finish their current activity before announcing. aria-live="assertive" interrupts immediately — use only for critical errors. role="status" is polite; role="alert" is assertive.',
        examples: [
          {
            id: 'live-region',
            label: 'Toast notification with live region',
            lang: 'html',
            code: `<!-- Place this once in the DOM, always present -->
<div
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
  id="toast-region"
></div>

<!-- Inject/replace text to trigger announcement -->
<script>
function announce(message) {
  const region = document.getElementById('toast-region');
  // Clear first to re-announce the same message
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
</script>`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'A button only contains an icon SVG. What must you add for screen reader users?',
        options: [
          'title attribute on the SVG',
          'aria-label on the button',
          'role="img" on the SVG',
          'alt attribute',
        ],
        correct: 1,
        explanation:
          'aria-label on the <button> provides the accessible name. Add aria-hidden="true" to the SVG so the icon is decorative and not double-announced. The title attribute on SVG has inconsistent support.',
      },
      {
        id: 'q2',
        question:
          'An error message appears below a text input. What ARIA links the input to the error?',
        options: [
          'aria-label on the error paragraph',
          'aria-describedby on the input pointing to the error id',
          'role="alert" on the input',
          'data-error attribute',
        ],
        correct: 1,
        explanation:
          'aria-describedby="error-id" tells screen readers to read the element with that id as supplementary description when the input is focused. Combine with aria-invalid="true" to signal the error state.',
      },
      {
        id: 'q3',
        question:
          'When should you use aria-live="assertive" vs aria-live="polite"?',
        options: [
          '"assertive" for decorative toasts, "polite" for critical errors',
          '"assertive" only for critical, immediate errors; "polite" for most notifications',
          'They are interchangeable',
          '"assertive" for form validation, "polite" for loading spinners',
        ],
        correct: 1,
        explanation:
          '"assertive" interrupts the screen reader mid-sentence — use only when the information is urgent and time-sensitive (e.g., a session expiry warning). "polite" queues the announcement without interrupting, making it right for most notifications.',
      },
    ],
  },

  React: {
    topic: 'React',
    tagline: 'Declarative UI driven by state',
    overview:
      'React is a component model where UI is a pure function of state: UI = f(state). When state changes, React reconciles the virtual DOM and updates only what changed. Understanding hooks, the rendering cycle, and when side effects run is the foundation of building predictable, performant React components.',
    estimatedRead: '12 min',
    difficulty: 'Intermediate',
    sections: [
      {
        id: 'hooks-mental-model',
        title: 'Hooks Mental Model',
        icon: 'extension',
        body: "Hooks let function components tap into React's state and lifecycle machinery. The rules: call hooks only at the top level (never inside conditions or loops) and only inside React functions. Each hook call is identified by its call order — React relies on this being stable across renders.",
        examples: [
          {
            id: 'use-state',
            label: 'useState — local state',
            lang: 'typescript',
            code: `import { useState } from 'react';

function Counter() {
  // [current value, setter function]
  const [count, setCount] = useState(0);

  // Functional update form — always use this when
  // next state depends on previous state
  const increment = () => setCount(prev => prev + 1);

  return (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}`,
          },
        ],
      },
      {
        id: 'use-effect',
        title: 'useEffect — Synchronizing with the Outside World',
        icon: 'sync',
        body: 'useEffect runs after render to synchronize your component with external systems: APIs, subscriptions, timers, DOM libraries. The dependency array controls when it re-runs: empty [] runs once on mount; [value] re-runs when value changes; omitted runs after every render. Always return a cleanup function to avoid memory leaks.',
        examples: [
          {
            id: 'effect-fetch',
            label: 'Data fetching with cleanup',
            lang: 'typescript',
            code: `import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false; // guard against stale updates

    setLoading(true);
    fetchUser(userId).then(data => {
      if (!cancelled) {
        setUser(data);
        setLoading(false);
      }
    });

    return () => { cancelled = true; }; // cleanup
  }, [userId]); // re-fetch when userId changes

  if (loading) return <Skeleton />;
  return <div>{user?.name}</div>;
}`,
          },
        ],
        callout: {
          type: 'warning',
          text: 'Missing dependencies in the array cause stale closures — your effect reads an old value forever. Use the eslint-plugin-react-hooks exhaustive-deps rule to catch these automatically.',
        },
      },
      {
        id: 'use-reducer',
        title: 'useReducer — Predictable State Machines',
        icon: 'device_hub',
        body: 'When state has multiple sub-values that change together, or when the next state depends on complex logic, useReducer is cleaner than multiple useState calls. The reducer is a pure function (state, action) => newState — easy to test in isolation and debug with Redux DevTools.',
        examples: [
          {
            id: 'reducer',
            label: 'Shopping cart reducer',
            lang: 'typescript',
            code: `type CartItem = { id: string; qty: number };
type CartState = { items: CartItem[]; loading: boolean };
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}`,
          },
        ],
      },
      {
        id: 'memoization',
        title: 'Memoization — Skip Unnecessary Work',
        icon: 'speed',
        body: 'React re-renders a component whenever its state or props change. useMemo caches an expensive computation; useCallback caches a function reference. memo() prevents a component from re-rendering if its props are shallowly equal. Reach for these only after profiling — premature optimization adds complexity without benefit.',
        examples: [
          {
            id: 'memo',
            label: 'Memoized filtered list',
            lang: 'typescript',
            code: `import { useMemo, useCallback, memo } from 'react';

function ProductList({ products, filter }: Props) {
  // Only recalculates when products or filter changes
  const filtered = useMemo(
    () => products.filter(p => p.category === filter),
    [products, filter]
  );

  // Stable reference across renders
  const handleBuy = useCallback((id: string) => {
    addToCart(id);
  }, []); // no deps since addToCart is stable

  return filtered.map(p => (
    <ProductCard key={p.id} product={p} onBuy={handleBuy} />
  ));
}

// Only re-renders if product or onBuy reference changes
const ProductCard = memo(function ProductCard({ product, onBuy }) {
  return <button onClick={() => onBuy(product.id)}>{product.name}</button>;
});`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'useEffect with [] as the dependency array runs after every render. True or false?',
        options: [
          'True — [] means no filter',
          'False — it runs only once, after the initial mount',
          'True on development, false on production',
          'It depends on React version',
        ],
        correct: 1,
        explanation:
          '[] means "no dependencies" — the effect has nothing to watch, so it only runs after the first render (mount). Omitting the array entirely causes it to run after every render.',
      },
      {
        id: 'q2',
        question:
          'setCount(count + 1) vs setCount(prev => prev + 1) — when does the second form matter?',
        options: [
          'They are always equivalent',
          'When calling setState multiple times in the same synchronous event handler',
          'Only in class components',
          'When count is a string',
        ],
        correct: 1,
        explanation:
          'If you call setCount(count + 1) twice in the same handler, both reads see the same stale count and you only get one increment. The functional form setCount(prev => prev + 1) always receives the latest queued value, so two calls produce two increments.',
      },
      {
        id: 'q3',
        question: 'When is useReducer preferred over multiple useState calls?',
        options: [
          'Always — useReducer is strictly better',
          'When state values update independently',
          'When multiple state values change together in complex transitions',
          'When you need async state updates',
        ],
        correct: 2,
        explanation:
          'useReducer shines when multiple pieces of state change together in coordinated ways (e.g., loading + data + error) or when the next state depends on complex logic. For simple independent toggles, useState is simpler.',
      },
    ],
  },

  'JavaScript Fundamentals': {
    topic: 'JavaScript Fundamentals',
    tagline: 'The language beneath every web product',
    overview:
      'JavaScript is single-threaded but non-blocking, event-driven but synchronous at its core. Mastering the event loop, the prototype chain, closures, and modern array methods transforms you from someone who makes JS work to someone who understands why it works the way it does.',
    estimatedRead: '10 min',
    difficulty: 'Foundational',
    sections: [
      {
        id: 'event-loop',
        title: 'The Event Loop',
        icon: 'loop',
        body: "JavaScript executes one thing at a time on the call stack. Async work (setTimeout, fetch, DOM events) is handled by the browser's Web APIs, which push callbacks onto queues when complete. The event loop checks: if the call stack is empty, pull from the microtask queue first (Promises, queueMicrotask), then the macrotask queue (setTimeout, setInterval).",
        examples: [
          {
            id: 'event-loop',
            label: 'Execution order quiz',
            lang: 'javascript',
            code: `console.log('1 — sync');

setTimeout(() => console.log('2 — macrotask'), 0);

Promise.resolve().then(() => console.log('3 — microtask'));

console.log('4 — sync');

// Output order:
// 1 — sync
// 4 — sync
// 3 — microtask   ← microtasks drain before macrotasks
// 2 — macrotask`,
          },
        ],
        callout: {
          type: 'info',
          text: 'async/await is syntactic sugar over Promises. An await expression suspends the current async function and schedules the continuation as a microtask.',
        },
      },
      {
        id: 'closures',
        title: 'Closures',
        icon: 'lock',
        body: 'A closure is a function that remembers the variables from its lexical scope, even after that scope has exited. Every function in JavaScript is a closure. This enables private state, factory functions, and partial application — and is the mechanism behind React hooks storing state between renders.',
        examples: [
          {
            id: 'closure',
            label: 'Counter factory with private state',
            lang: 'javascript',
            code: `function makeCounter(initial = 0) {
  let count = initial; // private — not accessible outside

  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
    reset: () => { count = initial; },
  };
}

const counter = makeCounter(10);
counter.increment(); // 11
counter.increment(); // 12
counter.reset();     // back to 10
console.log(counter.value()); // 10`,
          },
        ],
      },
      {
        id: 'array-methods',
        title: 'Array Transform Methods',
        icon: 'transform',
        body: 'map(), filter(), and reduce() are the core functional array transformers. map transforms each element into a new value. filter returns a subset. reduce accumulates elements into a single output. Chain them to build readable data pipelines. All three return new arrays (or a single value for reduce) — they never mutate the original.',
        examples: [
          {
            id: 'pipeline',
            label: 'Data transformation pipeline',
            lang: 'javascript',
            code: `const orders = [
  { id: 1, status: 'delivered', total: 49.99 },
  { id: 2, status: 'pending',   total: 12.00 },
  { id: 3, status: 'delivered', total: 89.50 },
];

// Revenue from delivered orders
const deliveredRevenue = orders
  .filter(o => o.status === 'delivered')   // [o1, o3]
  .map(o => o.total)                       // [49.99, 89.50]
  .reduce((sum, total) => sum + total, 0); // 139.49

console.log(deliveredRevenue); // 139.49`,
          },
        ],
      },
      {
        id: 'optional-chaining',
        title: 'Optional Chaining & Nullish Coalescing',
        icon: 'link_off',
        body: 'Optional chaining (?.) short-circuits to undefined if the left side is null or undefined, preventing Cannot read properties of undefined errors. Nullish coalescing (??) returns the right side only when the left is null or undefined — unlike || which also triggers on 0, "", and false.',
        examples: [
          {
            id: 'optional',
            label: 'Defensive API response access',
            lang: 'typescript',
            code: `type APIResponse = {
  user?: {
    profile?: {
      avatar?: string;
      badges?: string[];
    };
  };
};

function getAvatar(res: APIResponse): string {
  // Optional chaining — no TypeError if any level is undefined
  return res.user?.profile?.avatar ?? '/default-avatar.png';
  //                                  ^^ Nullish coalescing fallback
}

// Also works with method calls and array access
const firstBadge = res.user?.profile?.badges?.[0];
const count = res.user?.profile?.badges?.length ?? 0;`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Given: setTimeout(fn, 0) and Promise.resolve().then(fn2) — which runs first?',
        options: [
          'setTimeout — it was declared first',
          'Promise — microtasks run before macrotasks',
          'They run simultaneously',
          'It depends on browser',
        ],
        correct: 1,
        explanation:
          'Promises resolve as microtasks, which drain completely before the event loop picks up the next macrotask (setTimeout). Even setTimeout(fn, 0) is a macrotask and runs after all pending microtasks.',
      },
      {
        id: 'q2',
        question: 'What does [1, 2, 3].reduce((acc, n) => acc + n, 0) return?',
        options: ['[1, 2, 3]', '3', '6', '0'],
        correct: 2,
        explanation:
          'reduce starts with accumulator 0 and adds each element: 0+1=1, 1+2=3, 3+3=6. The second argument to reduce is the initial value of the accumulator.',
      },
      {
        id: 'q3',
        question: 'What is the difference between ?? and ||?',
        options: [
          'They are identical',
          '?? triggers on falsy (0, "", false); || only on null/undefined',
          '|| triggers on falsy (0, "", false); ?? only on null/undefined',
          '?? is only for TypeScript',
        ],
        correct: 2,
        explanation:
          '|| uses the right side for any falsy value including 0, "", and false. ?? (nullish coalescing) only uses the right side when the left is null or undefined. This matters for numeric defaults: score ?? 0 preserves a score of 0, while score || 0 would replace it.',
      },
    ],
  },

  TypeScript: {
    topic: 'TypeScript',
    tagline: 'Catch bugs at compile time, not in production',
    overview:
      'TypeScript is a typed superset of JavaScript that compiles to plain JS. Types are erased at runtime — they exist only to help you and your tools catch mistakes early. The goal is not to appease the compiler; it is to model your domain so precisely that an entire class of bugs becomes impossible.',
    estimatedRead: '11 min',
    difficulty: 'Intermediate',
    sections: [
      {
        id: 'type-vs-interface',
        title: 'type vs interface',
        icon: 'compare',
        body: 'Both type aliases and interfaces describe object shapes. The key differences: interfaces can be reopened (declaration merging), making them better for library authors. Type aliases can describe any shape including unions, tuples, and primitives. In application code, type aliases are more versatile — prefer them unless you specifically need merging.',
        examples: [
          {
            id: 'type-vs-interface',
            label: 'When to use each',
            lang: 'typescript',
            code: `// Use 'type' for most cases
type User = {
  id: string;
  name: string;
  role: 'admin' | 'member'; // union — only possible with type
};

// Union of shapes
type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Use 'interface' when you need declaration merging
interface RequestConfig {
  timeout: number;
}
// Later, another module can extend it:
interface RequestConfig {
  retries: number;
}`,
          },
        ],
      },
      {
        id: 'discriminated-unions',
        title: 'Discriminated Unions',
        icon: 'call_split',
        body: 'A discriminated union is a union of types that share a literal field (the discriminant). TypeScript narrows the type automatically when you check that field. This pattern eliminates impossible state combinations — you cannot have loading: true and data defined simultaneously.',
        examples: [
          {
            id: 'discriminated',
            label: 'UI state modeled as discriminated union',
            lang: 'typescript',
            code: `type UIState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function render<T>(state: UIState<T>) {
  switch (state.status) {
    case 'idle':
      return <EmptyState />;
    case 'loading':
      return <Skeleton />;
    case 'success':
      // TypeScript knows state.data exists here
      return <DataView data={state.data} />;
    case 'error':
      // TypeScript knows state.message exists here
      return <ErrorBanner message={state.message} />;
  }
}`,
          },
        ],
        callout: {
          type: 'tip',
          text: 'The switch exhaustiveness check is a safety net: if you add a new union member and forget to handle it, TypeScript will error. Add a default: const _: never = state branch to enforce this.',
        },
      },
      {
        id: 'generics',
        title: 'Generics — Reusable Type Contracts',
        icon: 'recycling',
        body: 'Generics let you write a function or type once and use it with any type, while keeping the relationship between inputs and outputs precise. Think of <T> as a type parameter — like a function argument but for types. Constraints (T extends SomeType) limit what can be passed.',
        examples: [
          {
            id: 'generics',
            label: 'Generic API response wrapper',
            lang: 'typescript',
            code: `type ApiResponse<T> = {
  data: T;
  error: string | null;
  timestamp: number;
};

async function apiFetch<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  if (!res.ok) {
    return { data: null as T, error: res.statusText, timestamp: Date.now() };
  }
  const data: T = await res.json();
  return { data, error: null, timestamp: Date.now() };
}

// TypeScript infers the type at the call site
const { data } = await apiFetch<User[]>('/api/users');
// data is User[] — fully typed, no casting needed`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'What makes a discriminated union different from a regular union?',
        options: [
          'Discriminated unions can only contain objects',
          'They share a common literal field (discriminant) enabling automatic narrowing',
          'They are only available in TypeScript 5+',
          'They require a switch statement',
        ],
        correct: 1,
        explanation:
          'A discriminated union has a shared literal field (like status: "idle" | "loading" | "success") that TypeScript uses to narrow the type in branches. Without this discriminant, TypeScript cannot tell which member of the union you are working with.',
      },
      {
        id: 'q2',
        question: 'What does T extends string mean in a generic constraint?',
        options: [
          'T must be exactly the string type',
          'T can be any type assignable to string (string, string literal types)',
          'T is a class that extends String',
          'T is optional',
        ],
        correct: 1,
        explanation:
          'extends in a generic constraint means "is assignable to" — T must be a subtype of string. This includes string itself and all string literal types like "admin" | "member".',
      },
      {
        id: 'q3',
        question:
          'When should you use an interface over a type alias in TypeScript?',
        options: [
          'Always — interfaces are faster to compile',
          'When you need declaration merging (reopening a type from multiple places)',
          'When the type involves a union',
          'Interfaces and type aliases are identical',
        ],
        correct: 1,
        explanation:
          'Interfaces support declaration merging: two interface declarations with the same name merge into one. This is essential for library authors (e.g., extending third-party types). For union types, primitive aliases, or tuple types, type aliases are required since interfaces cannot express them.',
      },
    ],
  },

  'State Management': {
    topic: 'State Management',
    tagline: 'A single source of truth your whole app can trust',
    overview:
      'State management is the discipline of deciding where state lives, how it changes, and how components subscribe to it. Bad state management leads to stale UI, impossible states, and debugging nightmares. The right tool depends on scope: local state for single components, lifted state for siblings, Context for feature trees, and external stores (Zustand, Redux) for app-wide concerns.',
    estimatedRead: '10 min',
    difficulty: 'Intermediate',
    sections: [
      {
        id: 'state-colocation',
        title: 'Colocation — State Lives as Low as Possible',
        icon: 'vertical_align_bottom',
        body: 'The first question before reaching for a global store: where is the smallest component tree that needs this state? If only one component needs it, keep it local. If siblings need it, lift it to their common parent. Only reach for a global store when state must be shared across unrelated parts of the tree or when prop drilling becomes painful.',
        callout: {
          type: 'tip',
          text: "Over-globalizing state is the most common mistake. A modal's open/closed state should almost always be local, not in a Redux slice.",
        },
      },
      {
        id: 'zustand',
        title: 'Zustand — Minimal Global Store',
        icon: 'storage',
        body: 'Zustand is a tiny, hook-based state manager with no boilerplate. Create a store with create(), define state and actions together, and subscribe from any component with a selector. Unlike Context, Zustand only re-renders components that subscribe to the slice of state that changed.',
        examples: [
          {
            id: 'zustand',
            label: 'Zustand cart store',
            lang: 'typescript',
            code: `import { create } from 'zustand';

type CartItem = { id: string; name: string; qty: number; price: number };

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set(state => ({
      items: state.items.some(i => i.id === item.id)
        ? state.items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...state.items, item],
    })),

  removeItem: (id) =>
    set(state => ({ items: state.items.filter(i => i.id !== id) })),

  clearCart: () => set({ items: [] }),

  // Derived value — computed on read
  total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
}));

// Usage in any component — only re-renders on items change
function CartBadge() {
  const count = useCartStore(state => state.items.length);
  return <span>{count}</span>;
}`,
          },
        ],
      },
      {
        id: 'context-pitfalls',
        title: 'React Context — Use Carefully',
        icon: 'warning',
        body: 'Context is not a state manager — it is a dependency injection mechanism. Every component that consumes a Context re-renders when the Context value changes, even if the specific data it uses did not change. Split contexts by concern (AuthContext, ThemeContext) and memoize the value object to avoid unnecessary renders.',
        examples: [
          {
            id: 'context',
            label: 'Splitting contexts by update frequency',
            lang: 'typescript',
            code: `// ❌ One big context — everything re-renders on any change
const AppContext = createContext({ user, theme, cart, notifications });

// ✅ Separate contexts by how often they change
const UserContext = createContext<User | null>(null);          // rare
const ThemeContext = createContext<'light' | 'dark'>('dark'); // rare
const NotificationContext = createContext<Notification[]>([]); // frequent

// Memoize the value to prevent unnecessary re-renders
function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          "A modal's open/close state is only used by the modal and its trigger button. Where should this state live?",
        options: [
          'In a global Zustand store',
          'In Redux',
          'In the closest common parent of the modal and trigger',
          'In a Context provider at the app root',
        ],
        correct: 2,
        explanation:
          'Colocation: state lives in the smallest component tree that needs it. If only the modal and its trigger button use open/close state, lift it to their common parent. No need for global state.',
      },
      {
        id: 'q2',
        question:
          'Why does Zustand cause fewer re-renders than React Context for the same data?',
        options: [
          'Zustand uses Web Workers',
          'Components subscribe with selectors — only re-render when their selected slice changes',
          'Zustand batches updates automatically',
          'Zustand uses immutable data structures',
        ],
        correct: 1,
        explanation:
          'When you use useCartStore(state => state.items.length), Zustand only triggers a re-render if items.length changes. Context re-renders all consumers whenever any part of the context value changes, even if the consumer only uses a different part.',
      },
      {
        id: 'q3',
        question:
          'You have a context value object: const value = { user, setUser }. It causes re-renders on every parent render. Why, and how do you fix it?',
        options: [
          'Context values cannot be objects; use primitives',
          'A new object reference is created on every render; wrap with useMemo([user])',
          'setUser is a side effect; move it to useEffect',
          'The provider needs key={user.id}',
        ],
        correct: 1,
        explanation:
          'Every render of the Provider creates a new {} object with a new reference. React Context compares by reference, so all consumers see a "changed" value and re-render. Wrapping with useMemo(() => ({ user, setUser }), [user]) creates a new object only when user changes.',
      },
    ],
  },

  Testing: {
    topic: 'Testing',
    tagline: 'Confidence that your code does what you think it does',
    overview:
      'Testing is the practice of writing code that verifies other code behaves correctly. Good tests are fast, isolated, deterministic, and focused on behavior — not implementation details. The Testing Trophy (Kent C. Dodds) favors integration tests as the highest-value layer for frontend code.',
    estimatedRead: '10 min',
    difficulty: 'Intermediate',
    sections: [
      {
        id: 'testing-trophy',
        title: 'The Testing Trophy',
        icon: 'emoji_events',
        body: 'Unit tests verify individual functions in isolation. Integration tests verify how multiple units work together (a component with its hooks and child components). E2E tests verify full user flows in a real browser. The Testing Trophy suggests investing most in integration tests: they catch real bugs without the brittleness of E2E tests or the false confidence of unit tests that mock everything.',
        callout: {
          type: 'info',
          text: 'Test behavior, not implementation. If a test breaks when you refactor without changing behavior, it was testing the wrong thing.',
        },
      },
      {
        id: 'rtl',
        title: 'React Testing Library',
        icon: 'science',
        body: "React Testing Library (RTL) encourages testing from the user's perspective. Query elements by role, label, or text — not by CSS classes or component internals. This makes tests resilient to refactoring while catching real accessibility and UX bugs.",
        examples: [
          {
            id: 'rtl-example',
            label: 'Component integration test',
            lang: 'typescript',
            code: `import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('shows validation error when email is blank on submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={jest.fn()} />);

    // Find by accessible label, not by className
    const submit = screen.getByRole('button', { name: /sign in/i });
    await user.click(submit);

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Email is required');
  });

  it('calls onSuccess with email after successful login', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith('test@example.com')
    );
  });
});`,
          },
        ],
      },
      {
        id: 'mocking',
        title: 'Mocking — Control the Outside World',
        icon: 'science',
        body: 'Tests should be deterministic. Mock network requests, timers, and external modules to control what the component sees. MSW (Mock Service Worker) is the modern approach: intercept actual fetch/XHR calls at the network level so your component code is unchanged in tests.',
        examples: [
          {
            id: 'msw',
            label: 'MSW handler setup',
            lang: 'typescript',
            code: `import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Alice',
      role: 'admin',
    });
  }),

  http.post('/api/login', async ({ request }) => {
    const body = await request.json() as { email: string };
    if (body.email === 'bad@test.com') {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json({ token: 'mock-jwt' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'screen.getByRole("button", { name: /submit/i }) — what does this query?',
        options: [
          'Any element with className="button"',
          'Any button element with accessible name matching "submit"',
          'Only <button type="submit"> elements',
          'An element with id="submit"',
        ],
        correct: 1,
        explanation:
          'getByRole queries by ARIA role and accessible name. It finds <button>, <input type="button">, <input type="submit">, and elements with role="button" whose accessible name (from text content, aria-label, or aria-labelledby) matches /submit/i.',
      },
      {
        id: 'q2',
        question:
          'Your test breaks after a CSS refactor that did not change behavior. What is the most likely cause?',
        options: [
          'The browser cache needs clearing',
          'The test queries by className instead of role or label',
          'RTL does not support CSS-in-JS',
          'You need to add data-testid attributes',
        ],
        correct: 1,
        explanation:
          'Querying by className (getByClass, querySelector) couples tests to implementation details. When the class names change during a refactor, tests break even though behavior is unchanged. Prefer getByRole, getByLabelText, and getByText.',
      },
      {
        id: 'q3',
        question:
          'What is the main advantage of MSW over jest.spyOn(global, "fetch")?',
        options: [
          'MSW is faster',
          'MSW intercepts at the network level — your component code and fetch calls remain unchanged',
          'MSW works without Node.js',
          'MSW generates test data automatically',
        ],
        correct: 1,
        explanation:
          'Mocking fetch directly means your component must call fetch exactly as mocked. MSW intercepts real network requests using a Service Worker, so your component code is identical in tests and production — you are testing the real network layer.',
      },
    ],
  },

  Performance: {
    topic: 'Performance',
    tagline: 'Fast pages are better products',
    overview:
      "Web performance is the practice of shipping less code, loading it smarter, and executing it efficiently. The Core Web Vitals (LCP, INP, CLS) are Google's measurable proxies for perceived performance. Optimization follows a strict hierarchy: measure first, then fix the biggest bottleneck, not the easiest one.",
    estimatedRead: '10 min',
    difficulty: 'Advanced',
    sections: [
      {
        id: 'render-performance',
        title: 'React Render Performance',
        icon: 'speed',
        body: 'A React re-render is cheap unless it triggers expensive computation or re-renders a large subtree. Profile with React DevTools Profiler before optimizing. The most impactful optimizations: lift state to avoid cascading re-renders, memoize expensive computations with useMemo, and split large Context providers.',
        examples: [
          {
            id: 'lazy-loading',
            label: 'Code splitting with React.lazy',
            lang: 'typescript',
            code: `import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// These chunks are only downloaded when the route is visited
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}`,
          },
        ],
      },
      {
        id: 'image-loading',
        title: 'Image Loading Strategy',
        icon: 'image',
        body: 'Images are the single biggest contributor to slow LCP. Prioritize the hero image with fetchpriority="high", defer below-fold images with loading="lazy", and serve correctly sized images with srcset and sizes. Use modern formats (WebP, AVIF) which are 30–50% smaller than JPEG.',
        examples: [
          {
            id: 'images',
            label: 'Optimized image markup',
            lang: 'html',
            code: `<!-- Hero image: high priority, no lazy loading -->
<img
  src="/hero.webp"
  alt="Product hero"
  width="1200"
  height="600"
  fetchpriority="high"
  decoding="async"
/>

<!-- Below-fold images: defer loading -->
<img
  src="/product-thumb.webp"
  alt="Product thumbnail"
  width="400"
  height="300"
  loading="lazy"
  decoding="async"
/>

<!-- Responsive image with srcset -->
<img
  src="/photo-800.webp"
  srcset="/photo-400.webp 400w, /photo-800.webp 800w, /photo-1200.webp 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="..."
  loading="lazy"
/>`,
          },
        ],
        callout: {
          type: 'info',
          text: 'LCP (Largest Contentful Paint) measures when the largest visible element is rendered. The most common LCP element is a hero image — optimize it first.',
        },
      },
      {
        id: 'bundle-optimization',
        title: 'Bundle Size Optimization',
        icon: 'compress',
        body: 'Large JavaScript bundles block parsing and execution, delaying Time to Interactive. Analyze your bundle with source-map-explorer or bundlephobia. Common wins: tree-shake unused exports, replace heavy libraries with lighter alternatives (date-fns instead of moment.js), and ensure third-party scripts are loaded asynchronously.',
        examples: [
          {
            id: 'tree-shaking',
            label: 'Proper tree-shakeable imports',
            lang: 'typescript',
            code: `// ❌ Imports entire lodash library (~70kB)
import _ from 'lodash';
const sorted = _.sortBy(items, 'name');

// ✅ Imports only the function you need (~1kB)
import sortBy from 'lodash/sortBy';
const sorted = sortBy(items, 'name');

// ✅ Better: native alternatives when possible
const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What does React.lazy() do?',
        options: [
          'Makes components render lazily after 100ms',
          'Splits the component into a separate bundle loaded only when rendered',
          'Prevents the component from re-rendering',
          'Defers data fetching until scroll',
        ],
        correct: 1,
        explanation:
          'React.lazy(() => import("./Component")) creates a code-split point. The component\'s code is packaged into a separate chunk that the browser only downloads when that component is first rendered, reducing the initial bundle size.',
      },
      {
        id: 'q2',
        question:
          'Which attribute should you add to the hero image to improve LCP?',
        options: [
          'loading="eager"',
          'fetchpriority="high"',
          'decoding="sync"',
          'importance="critical"',
        ],
        correct: 1,
        explanation:
          'fetchpriority="high" signals to the browser\'s preload scanner that this image is critical and should be fetched at highest priority. loading="eager" is the default and does not change priority; importance is a deprecated non-standard attribute.',
      },
      {
        id: 'q3',
        question:
          'useMemo and useCallback are always good optimizations. True or false?',
        options: [
          'True — they always make code faster',
          'False — they add overhead and complexity; profile before adding',
          'True for useMemo, false for useCallback',
          'It depends on the React version',
        ],
        correct: 1,
        explanation:
          'useMemo and useCallback themselves have a cost: React must store the memoized value and run the comparison every render. If the computation being memoized is cheap (simple arithmetic, array access), the memoization overhead can exceed the savings. Profile first.',
      },
    ],
  },

  'Forms & Validation': {
    topic: 'Forms & Validation',
    tagline: 'Guide users to correct input, never punish them',
    overview:
      'Forms are the primary way users input data. Good form design means: clear labels, inline validation with helpful error messages, accessible error announcements, and minimal friction. Form logic involves state (current values), validation (rules), submission (async), and feedback (errors/success).',
    estimatedRead: '9 min',
    difficulty: 'Intermediate',
    sections: [
      {
        id: 'controlled-forms',
        title: 'Controlled vs Uncontrolled',
        icon: 'toggle_on',
        body: 'Controlled forms store values in React state and update on every keystroke. Uncontrolled forms read values from the DOM via refs at submission time. Controlled forms give you real-time validation and derived UI but cause more renders. For complex forms, libraries like React Hook Form use uncontrolled inputs for performance while adding a validation layer.',
        examples: [
          {
            id: 'controlled',
            label: 'Controlled form with validation',
            lang: 'typescript',
            code: `import { useState } from 'react';

type FormValues = { email: string; password: string };
type FormErrors = Partial<FormValues>;

function LoginForm() {
  const [values, setValues] = useState<FormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (vals: FormValues): FormErrors => {
    const errs: FormErrors = {};
    if (!vals.email.includes('@')) errs.email = 'Enter a valid email';
    if (vals.password.length < 8) errs.password = 'At least 8 characters';
    return errs;
  };

  const handleChange = (field: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...values, [field]: e.target.value };
      setValues(next);
      if (touched[field]) setErrors(validate(next));
    };

  const handleBlur = (field: string) => () => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  return (
    <form>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={values.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
      />
      {errors.email && (
        <p id="email-error" role="alert">{errors.email}</p>
      )}
    </form>
  );
}`,
          },
        ],
        callout: {
          type: 'tip',
          text: 'Show errors on blur, not on every keystroke. Users need to finish typing before you tell them they are wrong.',
        },
      },
      {
        id: 'schema-validation',
        title: 'Schema-Driven Validation',
        icon: 'schema',
        body: 'Libraries like Zod or Yup let you define a schema once and derive both TypeScript types and runtime validation from it. This single source of truth prevents the schema and the type diverging as requirements change.',
        examples: [
          {
            id: 'zod',
            label: 'Zod schema with inferred type',
            lang: 'typescript',
            code: `import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine(
  data => data.password === data.confirmPassword,
  { message: 'Passwords must match', path: ['confirmPassword'] }
);

// TypeScript type inferred from schema — no duplicate definition
type SignUpValues = z.infer<typeof signUpSchema>;

// Validate at runtime
const result = signUpSchema.safeParse(formValues);
if (!result.success) {
  const errors = result.error.flatten().fieldErrors;
  // { email: ['Enter a valid email'], password: [...] }
}`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'When should validation errors be shown for the best UX?',
        options: [
          'On every keystroke from the first character',
          'Only after form submission',
          'On blur (after the user leaves the field), updating inline on subsequent changes',
          'When the user hovers the submit button',
        ],
        correct: 2,
        explanation:
          'Show errors on blur so users can finish typing. Once touched, update errors inline on change so users see correction feedback immediately. Showing errors on the first keystroke is distracting and premature.',
      },
      {
        id: 'q2',
        question:
          'What is the main benefit of defining a Zod schema over separate TypeScript types and validation functions?',
        options: [
          'Zod is faster at runtime than TypeScript',
          'One schema is the single source of truth for both the TypeScript type and runtime validation rules',
          'Zod eliminates the need for form state',
          'Zod validation runs in a Web Worker',
        ],
        correct: 1,
        explanation:
          'Without schema libraries, the TypeScript type and the validation rules are defined separately and can diverge as requirements change. Zod/Yup infer the type from the schema, keeping them in sync automatically.',
      },
      {
        id: 'q3',
        question: 'aria-describedby on an input field serves what purpose?',
        options: [
          'Sets the visible label for the field',
          'Links the input to a supplementary description or error message for screen readers',
          'Disables the field',
          'Validates the field server-side',
        ],
        correct: 1,
        explanation:
          'aria-describedby="error-id" tells screen readers to read the referenced element\'s text as additional context when the input receives focus. Combined with aria-invalid="true", it announces the error to assistive technology without moving focus.',
      },
    ],
  },

  'HTTP Fundamentals': {
    topic: 'HTTP Fundamentals',
    tagline: 'The protocol powering every web request',
    overview:
      'HTTP (Hypertext Transfer Protocol) is the stateless request-response protocol used by the web. Every API call, page load, and asset fetch is HTTP. Understanding status codes, headers, methods, and caching is essential for debugging, optimizing, and designing reliable web services.',
    estimatedRead: '9 min',
    difficulty: 'Foundational',
    sections: [
      {
        id: 'methods-semantics',
        title: 'HTTP Methods & Their Semantics',
        icon: 'send',
        body: 'HTTP methods carry semantic meaning that the entire web relies on. GET is safe (no side effects) and idempotent (same result every time). POST creates resources. PUT replaces a resource completely. PATCH modifies parts. DELETE removes. Using the wrong method breaks caching (GET responses are cached; POST responses are not by default) and idempotency guarantees.',
        examples: [
          {
            id: 'methods',
            label: 'REST method mapping',
            lang: 'javascript',
            code: `// REST endpoint conventions
// GET    /users           → list users (safe, idempotent)
// GET    /users/:id       → get one user (safe, idempotent)
// POST   /users           → create user (not idempotent)
// PUT    /users/:id       → replace user (idempotent)
// PATCH  /users/:id       → update fields (idempotent)
// DELETE /users/:id       → delete user (idempotent)

// PATCH example — send only changed fields
const res = await fetch('/api/users/123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'New Name' }), // only the changed field
});`,
          },
        ],
      },
      {
        id: 'status-codes',
        title: 'Status Code Groups',
        icon: 'tag',
        body: '2xx = success. 3xx = redirection. 4xx = client error (your fault). 5xx = server error (our fault). Common codes: 200 OK, 201 Created (after POST), 204 No Content (successful DELETE), 400 Bad Request (validation failed), 401 Unauthorized (not authenticated), 403 Forbidden (authenticated but not allowed), 404 Not Found, 429 Too Many Requests, 500 Internal Server Error.',
        callout: {
          type: 'warning',
          text: 'Never return 200 with an error body like { success: false, error: "..." }. Use the appropriate 4xx or 5xx status so clients can handle errors correctly.',
        },
      },
      {
        id: 'caching',
        title: 'HTTP Caching Headers',
        icon: 'cached',
        body: 'The Cache-Control header controls how long a response can be cached and by whom. max-age=3600 caches for 1 hour. no-cache means "revalidate before using cached version" (not "do not cache"). no-store means "never cache this." ETag provides content fingerprinting so clients can ask "did this change?" with If-None-Match.',
        examples: [
          {
            id: 'cache-headers',
            label: 'Cache header patterns',
            lang: 'javascript',
            code: `// Static assets (CSS, JS with content hash) — cache forever
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

// API responses — always revalidate, never stale
res.setHeader('Cache-Control', 'no-cache');

// Sensitive user data — no caching anywhere
res.setHeader('Cache-Control', 'no-store');

// Dynamic page — cache 60s, then revalidate in background
res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');

// ETag for conditional requests
const etag = \`"\${hashContent(data)}"\`;
res.setHeader('ETag', etag);
if (req.headers['if-none-match'] === etag) {
  res.status(304).end(); // Not Modified — client can use cached version
}`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'A payment endpoint is accidentally called twice. Which HTTP method guarantees the payment only processes once?',
        options: ['POST', 'GET', 'PUT', 'PATCH'],
        correct: 2,
        explanation:
          'PUT is idempotent — calling it multiple times with the same payload has the same effect as calling it once. POST is not idempotent — a duplicate POST could create duplicate payments. For payment APIs, also use an Idempotency-Key header.',
      },
      {
        id: 'q2',
        question:
          'Cache-Control: no-cache means the response is never cached. True or false?',
        options: [
          'True — no-cache disables caching entirely',
          'False — it means revalidate with the server before using the cached copy',
          'True in Chrome, false in Firefox',
          'It depends on the request method',
        ],
        correct: 1,
        explanation:
          'no-cache is confusingly named. It means "store a copy but always revalidate with the server before using it." no-store means "never cache this under any circumstances." This distinction matters for frequently updated content that must never be stale.',
      },
      {
        id: 'q3',
        question:
          'A user is not logged in and requests a protected resource. What status code should the server return?',
        options: [
          '403 Forbidden',
          '404 Not Found',
          '401 Unauthorized',
          '400 Bad Request',
        ],
        correct: 2,
        explanation:
          '401 Unauthorized means "you are not authenticated — provide credentials." 403 Forbidden means "you are authenticated but not authorized to access this." The naming is unfortunately confusing but the distinction is important for client-side handling.',
      },
    ],
  },

  'API Design': {
    topic: 'API Design',
    tagline: 'Contracts that are easy to use and hard to misuse',
    overview:
      'A well-designed API is a product. It should be intuitive, consistent, and tolerant of reasonable client mistakes. REST, GraphQL, and RPC are different design philosophies, but all good APIs share traits: predictable contracts, clear error responses, versioning, and pagination for collections.',
    estimatedRead: '10 min',
    difficulty: 'Intermediate',
    sections: [
      {
        id: 'rest-design',
        title: 'RESTful Resource Design',
        icon: 'api',
        body: 'REST organizes endpoints around nouns (resources), not verbs. The HTTP method is the verb. Use plural nouns for collections (/users), nested resources for relationships (/users/:id/posts), and query parameters for filtering, sorting, and pagination (/users?role=admin&sort=name&limit=20&cursor=xyz).',
        examples: [
          {
            id: 'rest-response',
            label: 'Consistent API response envelope',
            lang: 'typescript',
            code: `// Success response
{
  "data": {
    "id": "user_123",
    "name": "Alice",
    "email": "alice@example.com"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": 1718000000000
  }
}

// Error response — always structured the same way
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Must be a valid email address" }
    ]
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": 1718000000000
  }
}`,
          },
        ],
      },
      {
        id: 'pagination',
        title: 'Pagination Patterns',
        icon: 'pages',
        body: 'Offset pagination (?page=2&limit=20) is simple but breaks when items are inserted or deleted between pages. Cursor pagination (?cursor=eyJpZCI6MTIzfQ==&limit=20) uses a stable pointer to the last-seen item, making it safe for real-time data. Prefer cursor pagination for feeds and any data that changes frequently.',
        examples: [
          {
            id: 'cursor-pagination',
            label: 'Cursor pagination response',
            lang: 'typescript',
            code: `// Cursor pagination API response
{
  "data": [...20 items],
  "pagination": {
    "hasNextPage": true,
    "hasPreviousPage": false,
    "nextCursor": "eyJpZCI6NDIsInRzIjoxNzE4MDAwMDAwfQ==",
    "prevCursor": null,
    "totalCount": 247
  }
}

// Server-side cursor implementation
async function listPosts(cursor?: string, limit = 20) {
  const decodedCursor = cursor
    ? JSON.parse(Buffer.from(cursor, 'base64').toString())
    : null;

  const posts = await db.post.findMany({
    take: limit + 1, // fetch one extra to check hasNextPage
    cursor: decodedCursor ? { id: decodedCursor.id } : undefined,
    skip: decodedCursor ? 1 : 0,
    orderBy: { createdAt: 'desc' },
  });

  const hasNextPage = posts.length > limit;
  const items = hasNextPage ? posts.slice(0, limit) : posts;
  const lastItem = items[items.length - 1];

  return {
    data: items,
    pagination: {
      hasNextPage,
      nextCursor: hasNextPage
        ? Buffer.from(JSON.stringify({ id: lastItem.id })).toString('base64')
        : null,
    },
  };
}`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Why is cursor pagination better than offset pagination for real-time feeds?',
        options: [
          'Cursor pagination is faster',
          'Offset pagination breaks when items are inserted between pages — you see duplicates or miss items',
          'Cursor pagination supports backward traversal',
          'Offset pagination requires database transactions',
        ],
        correct: 1,
        explanation:
          'With offset pagination, if 5 new posts are inserted while a user is on page 2, page 3 will skip items (they shifted earlier). Cursor pagination points to a specific item, so inserts/deletes before that cursor do not affect subsequent pages.',
      },
      {
        id: 'q2',
        question:
          'You receive a POST /users request missing the required email field. What status code should you return?',
        options: [
          '500 Internal Server Error',
          '404 Not Found',
          '400 Bad Request',
          '422 Unprocessable Entity',
        ],
        correct: 3,
        explanation:
          '422 Unprocessable Entity is semantically correct for validation failures where the request is well-formed (valid JSON) but contains invalid data. 400 Bad Request is also acceptable and widely used. 500 implies a server bug, which is incorrect.',
      },
      {
        id: 'q3',
        question:
          'An API returns { success: false, error: "not found" } with a 200 status. What is the problem?',
        options: [
          'The JSON structure is invalid',
          'HTTP clients and intermediaries (CDNs, caches) use status codes, not body content, for routing decisions. A 200 prevents correct error handling.',
          'You cannot use "success" as a field name',
          'Nothing — this is a valid pattern',
        ],
        correct: 1,
        explanation:
          'Returning errors in a 200 body breaks HTTP semantics. Caches will cache the "error" response as a success. Monitoring tools will not count it as an error. HTTP clients like fetch() resolve successfully, requiring the client to parse the body to detect failure.',
      },
    ],
  },

  Authentication: {
    topic: 'Authentication',
    tagline: 'Prove identity, then grant access',
    overview:
      'Authentication (AuthN) answers "who are you?" Authorization (AuthZ) answers "what are you allowed to do?" These are separate concerns that are often conflated. JWT-based auth, OAuth, session cookies, and API keys each make different tradeoffs around security, scalability, and user experience.',
    estimatedRead: '11 min',
    difficulty: 'Advanced',
    sections: [
      {
        id: 'jwt',
        title: 'JSON Web Tokens (JWT)',
        icon: 'token',
        body: 'A JWT is a signed token containing a payload (claims) and a signature. The server can verify a JWT without a database lookup because it validates the signature cryptographically. JWTs are stateless — but this means you cannot invalidate a specific token before it expires. Common fix: use short-lived access tokens (15 minutes) with longer-lived refresh tokens, and revoke refresh tokens in a database.',
        examples: [
          {
            id: 'jwt-example',
            label: 'JWT structure and verification',
            lang: 'typescript',
            code: `// JWT = base64(header) + "." + base64(payload) + "." + signature
// Payload is NOT encrypted — only signed. Never put secrets in it.

// Signing a token (server)
import jwt from 'jsonwebtoken';

function createTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' } // short-lived
  );

  const refreshToken = jwt.sign(
    { sub: userId },
    process.env.REFRESH_SECRET!,
    { expiresIn: '30d' } // long-lived, stored in DB
  );

  return { accessToken, refreshToken };
}

// Verifying a token (middleware)
function authenticateRequest(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Missing token');

  const token = authHeader.split(' ')[1];
  const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  return payload;
}`,
          },
        ],
        callout: {
          type: 'danger',
          text: 'Never store JWT access tokens in localStorage — they are vulnerable to XSS attacks. Store refresh tokens in httpOnly, Secure, SameSite=Strict cookies.',
        },
      },
      {
        id: 'rbac',
        title: 'Role-Based Access Control (RBAC)',
        icon: 'manage_accounts',
        body: 'RBAC assigns permissions to roles rather than directly to users. A user is assigned a role (admin, member, viewer), and the role has a set of permissions. This scales better than per-user permissions for most applications. For fine-grained access, Attribute-Based Access Control (ABAC) adds conditions: "can edit this post if user.id === post.authorId".',
        examples: [
          {
            id: 'rbac',
            label: 'RBAC middleware',
            lang: 'typescript',
            code: `type Role = 'admin' | 'editor' | 'viewer';
type Permission = 'posts:write' | 'posts:delete' | 'users:manage';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin:  ['posts:write', 'posts:delete', 'users:manage'],
  editor: ['posts:write'],
  viewer: [],
};

function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user as { role: Role };
    const allowed = ROLE_PERMISSIONS[role] ?? [];

    if (!allowed.includes(permission)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }
    next();
  };
}

// Usage
router.delete('/posts/:id',
  authenticate,                          // 401 if not logged in
  requirePermission('posts:delete'),     // 403 if not admin
  deletePostHandler
);`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'A user logs out. Their JWT access token expires in 14 minutes. Are they truly logged out?',
        options: [
          'Yes — the server deletes the token on logout',
          'No — JWTs are stateless; the token is valid until expiry unless you implement a blocklist',
          'Yes — the client deletes the token on logout',
          'It depends on the JWT algorithm',
        ],
        correct: 1,
        explanation:
          'JWTs are stateless — the server does not track issued tokens. Deleting the token from the client prevents further use from that client, but the token itself remains valid for its remaining lifetime. To truly invalidate a JWT, you need a blocklist/denylist or very short expiry times.',
      },
      {
        id: 'q2',
        question: 'What is the difference between 401 and 403 status codes?',
        options: [
          'They are identical',
          '401 = not authenticated (no credentials); 403 = authenticated but not authorized',
          '401 = not authorized; 403 = not authenticated',
          '401 is for APIs; 403 is for web pages',
        ],
        correct: 1,
        explanation:
          '401 Unauthorized (confusingly named) means "authentication required — provide credentials." 403 Forbidden means "you are authenticated but do not have permission." This distinction determines what the client should do: 401 → show login, 403 → show access denied.',
      },
      {
        id: 'q3',
        question:
          'Why should refresh tokens be stored in httpOnly cookies rather than localStorage?',
        options: [
          'httpOnly cookies are faster to access',
          'httpOnly cookies cannot be read by JavaScript, preventing XSS attacks from stealing the token',
          'localStorage has size limits',
          'Cookies work on HTTP; localStorage requires HTTPS',
        ],
        correct: 1,
        explanation:
          'httpOnly cookies are inaccessible to JavaScript — document.cookie cannot read them. This means even if an attacker injects malicious scripts (XSS), they cannot steal the refresh token. Tokens in localStorage are readable by any JS on the page.',
      },
    ],
  },

  Database: {
    topic: 'Database',
    tagline: 'Persist, query, and protect your data',
    overview:
      'Database design decisions made early are expensive to undo later. Understanding SQL query planning, indexing, transactions, and the N+1 problem helps you write backend code that scales instead of collapsing under production load.',
    estimatedRead: '11 min',
    difficulty: 'Advanced',
    sections: [
      {
        id: 'indexing',
        title: 'Indexes — Fast Lookups at a Cost',
        icon: 'manage_search',
        body: 'An index is a separate data structure (usually a B-tree) that lets the database find rows without scanning every row. Without an index, a WHERE clause on 1 million rows reads all 1 million. With an index on the column, it reads O(log n) ≈ 20 rows. The tradeoff: indexes take disk space and slow down INSERT/UPDATE/DELETE because the index must be updated too.',
        examples: [
          {
            id: 'indexing',
            label: 'Index strategy',
            lang: 'sql',
            code: `-- Check if a query uses an index
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 'user_123';

-- Create a composite index for a common query pattern
-- Index columns in the order they appear in WHERE and ORDER BY
CREATE INDEX idx_orders_user_status_date
  ON orders (user_id, status, created_at DESC);

-- This query now uses the index
SELECT * FROM orders
WHERE user_id = 'user_123'
  AND status = 'pending'
ORDER BY created_at DESC
LIMIT 20;`,
          },
        ],
      },
      {
        id: 'n-plus-one',
        title: 'The N+1 Problem',
        icon: 'warning',
        body: 'The N+1 problem: loading a list of N items and making 1 additional query per item = N+1 queries total. With 100 posts, that is 101 database queries for what could be 2. The fix: eager loading (JOIN) or batching (DataLoader pattern) to fetch related data in one query.',
        examples: [
          {
            id: 'n-plus-one',
            label: 'N+1 vs Eager Loading (Prisma)',
            lang: 'typescript',
            code: `// ❌ N+1 — 1 query for posts + N queries for authors
const posts = await prisma.post.findMany();
for (const post of posts) {
  post.author = await prisma.user.findUnique({ // N queries!
    where: { id: post.authorId }
  });
}

// ✅ Eager loading — 1 query with JOIN
const posts = await prisma.post.findMany({
  include: { author: true }, // single SQL JOIN
});

// ✅ Raw SQL equivalent
const posts = await db.query(\`
  SELECT p.*, u.name as author_name, u.avatar as author_avatar
  FROM posts p
  JOIN users u ON u.id = p.author_id
  WHERE p.published = true
  ORDER BY p.created_at DESC
  LIMIT 20
\`);`,
          },
        ],
        callout: {
          type: 'warning',
          text: 'N+1 queries are silent in development (small data sets) but catastrophic in production. Use query logging in development: log any query count above 5 for a single request.',
        },
      },
      {
        id: 'transactions',
        title: 'Transactions — All or Nothing',
        icon: 'account_balance',
        body: 'A transaction groups multiple operations so they either all succeed or all fail (atomicity). Use transactions whenever you have related writes that must be consistent: transferring money (debit + credit), placing an order (create order + decrement inventory + charge card). Without a transaction, a crash mid-operation leaves data in an inconsistent state.',
        examples: [
          {
            id: 'transactions',
            label: 'Transactional inventory update',
            lang: 'typescript',
            code: `async function placeOrder(userId: string, productId: string, qty: number) {
  return await prisma.$transaction(async (tx) => {
    // 1. Lock and check inventory
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { stock: true, price: true },
    });

    if (!product || product.stock < qty) {
      throw new Error('Insufficient stock'); // auto-rollback
    }

    // 2. Decrement stock
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: qty } },
    });

    // 3. Create order — if this fails, stock is rolled back too
    const order = await tx.order.create({
      data: { userId, productId, qty, total: product.price * qty },
    });

    return order;
  });
  // All operations committed atomically, or all rolled back
}`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'You have a query: SELECT * FROM users WHERE email = ? — when should you add an index on email?',
        options: [
          'Never — indexes slow down writes',
          'When users table has more than 1000 rows and this query runs frequently',
          'Always — indexes always improve performance',
          'Only when using PostgreSQL',
        ],
        correct: 1,
        explanation:
          'Indexes have a cost: they use disk space and slow down writes. For small tables (< ~1000 rows), a full table scan is often faster than an index lookup. Add indexes on columns used in frequent WHERE, JOIN, and ORDER BY clauses that query large tables.',
      },
      {
        id: 'q2',
        question: 'What is the N+1 problem?',
        options: [
          'Fetching N+1 columns instead of N',
          'Running 1 query for a list and N additional queries for related data on each item',
          'A race condition in transactions',
          'Returning one extra row from a LIMIT query',
        ],
        correct: 1,
        explanation:
          'Fetching 100 posts and then making 1 query per post to get its author = 101 queries. The fix is eager loading (JOIN) or batching. N+1 is usually invisible in development with small data but catastrophic in production.',
      },
      {
        id: 'q3',
        question:
          'A transaction deducts money from account A then crashes before crediting account B. What happens?',
        options: [
          'The deduction persists — data is inconsistent',
          'The transaction rolls back automatically — account A is restored',
          'The system re-runs the transaction on restart',
          'Account B receives a pending credit',
        ],
        correct: 1,
        explanation:
          'Transactions are atomic: if any operation fails (including a crash mid-transaction), the entire transaction is rolled back. The database restores all changes to their state before the transaction started, preventing inconsistent partial updates.',
      },
    ],
  },

  Caching: {
    topic: 'Caching',
    tagline: 'Never compute the same thing twice',
    overview:
      'Caching stores the result of expensive operations so subsequent requests can skip the work. A well-designed cache makes your application faster and cheaper. A poorly designed one serves stale data and is harder to debug than having no cache at all. The three hardest problems in computer science: cache invalidation, naming things, and off-by-one errors.',
    estimatedRead: '10 min',
    difficulty: 'Advanced',
    sections: [
      {
        id: 'cache-patterns',
        title: 'Cache-Aside Pattern',
        icon: 'storage',
        body: 'Cache-aside (lazy loading) is the most common pattern: check cache → if hit, return; if miss, fetch from DB, store in cache, return. The application owns the cache interaction, not the infrastructure. This gives fine-grained control over what gets cached and for how long.',
        examples: [
          {
            id: 'cache-aside',
            label: 'Cache-aside with Redis',
            lang: 'typescript',
            code: `import { redis } from './redis';
import { db } from './db';

async function getUser(userId: string) {
  const cacheKey = \`user:\${userId}\`;

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as User; // cache hit
  }

  // 2. Cache miss — fetch from DB
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  // 3. Store in cache with TTL
  await redis.setex(cacheKey, 3600, JSON.stringify(user)); // 1 hour TTL

  return user;
}

// Invalidate on update
async function updateUser(userId: string, data: Partial<User>) {
  const updated = await db.user.update({ where: { id: userId }, data });
  await redis.del(\`user:\${userId}\`); // invalidate cache entry
  return updated;
}`,
          },
        ],
      },
      {
        id: 'swr-pattern',
        title: 'Stale-While-Revalidate',
        icon: 'refresh',
        body: 'Stale-While-Revalidate (SWR) serves the cached (possibly stale) response immediately while refreshing the cache in the background. The client gets a fast response; the cache gets updated for the next request. Great for data that changes occasionally and where slight staleness is acceptable (product catalog, user preferences).',
        examples: [
          {
            id: 'swr',
            label: 'SWR cache implementation',
            lang: 'typescript',
            code: `async function getProductsWithSWR() {
  const cacheKey = 'products:featured';

  const cached = await redis.get(cacheKey);
  const parsed = cached ? JSON.parse(cached) : null;

  if (parsed) {
    // Check if stale (older than 60s but within grace period of 600s)
    const age = Date.now() - parsed.cachedAt;
    const isStale = age > 60_000;
    const isExpired = age > 600_000;

    if (!isExpired) {
      if (isStale) {
        // Revalidate in background — don't await
        refreshProductCache().catch(console.error);
      }
      return parsed.data; // serve immediately
    }
  }

  // Cache expired or cold — must fetch
  return refreshProductCache();
}

async function refreshProductCache() {
  const products = await db.product.findMany({ where: { featured: true } });
  await redis.setex('products:featured', 600, JSON.stringify({
    data: products,
    cachedAt: Date.now(),
  }));
  return products;
}`,
          },
        ],
        callout: {
          type: 'info',
          text: 'The HTTP Cache-Control: stale-while-revalidate=N header tells CDNs and browsers to do this automatically — serve the stale response while fetching a fresh one in the background.',
        },
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'In cache-aside, who is responsible for managing the cache?',
        options: [
          'The database',
          'The application code',
          'The CDN',
          'The OS page cache',
        ],
        correct: 1,
        explanation:
          'In cache-aside (lazy loading), the application explicitly checks the cache, fetches from the database on a miss, and populates the cache. This is in contrast to write-through or read-through patterns where the caching layer sits between the app and DB.',
      },
      {
        id: 'q2',
        question:
          'A cached product page becomes stale after an admin edit. What should the update handler do?',
        options: [
          'Set a short TTL on all product caches',
          'Invalidate the specific cache key for that product',
          'Flush the entire Redis cache',
          'Do nothing — TTL will expire naturally',
        ],
        correct: 1,
        explanation:
          'Targeted invalidation (deleting the specific key) is the correct approach. Flushing the entire cache causes a thundering herd (all requests hit the database simultaneously). Short TTLs trade freshness guarantees — you may serve stale data for up to TTL seconds.',
      },
      {
        id: 'q3',
        question: 'What is the "thundering herd" problem in caching?',
        options: [
          'Too many cache keys for a single entity',
          'When a popular cache entry expires and many concurrent requests simultaneously hit the database',
          'A cache that grows too large and runs out of memory',
          'When Redis and the database return different data',
        ],
        correct: 1,
        explanation:
          'When a cache entry expires and there are many concurrent requests, they all find a cache miss simultaneously and all query the database. This sudden burst can overwhelm the database. Solutions: mutex locks, probabilistic expiry, or background refresh before expiry.',
      },
    ],
  },

  Security: {
    topic: 'Security',
    tagline:
      "Build systems attackers cannot break, not ones you hope they won't find",
    overview:
      'Web security is about threat modeling: who are your adversaries, what do they want, and how can they get it? The OWASP Top 10 identifies the most critical web application risks. Injection, broken authentication, and XSS consistently rank at the top because they have the highest business impact and are often avoidable with basic practices.',
    estimatedRead: '11 min',
    difficulty: 'Advanced',
    sections: [
      {
        id: 'injection',
        title: 'Injection Attacks',
        icon: 'bug_report',
        body: 'SQL injection inserts malicious SQL into user input that gets executed by the database. The fix is always parameterized queries — never string concatenation. Similarly, XSS injects JavaScript into pages that other users view. The fix is output encoding and a Content Security Policy.',
        examples: [
          {
            id: 'sql-injection',
            label: 'SQL Injection: vulnerable vs safe',
            lang: 'javascript',
            code: `// ❌ VULNERABLE — never do this
const userId = req.params.id; // attacker sends: "1 OR 1=1"
const user = await db.query(
  \`SELECT * FROM users WHERE id = \${userId}\` // ← injection point
);

// ✅ SAFE — parameterized query
const user = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId] // driver escapes the value safely
);

// ✅ SAFE — ORM (Prisma, Drizzle, etc.)
const user = await prisma.user.findUnique({
  where: { id: userId }, // automatically parameterized
});`,
          },
        ],
        callout: {
          type: 'danger',
          text: 'Never build SQL queries by string concatenation. Ever. Even with "trusted" inputs like internal IDs. Parameterized queries are the only safe approach.',
        },
      },
      {
        id: 'rate-limiting',
        title: 'Rate Limiting',
        icon: 'speed',
        body: 'Rate limiting protects against brute force attacks (trying millions of passwords), credential stuffing (trying leaked credentials), and DDoS. Implement per-IP limits on auth endpoints and per-user limits on API endpoints. Use a sliding window algorithm with Redis for accurate limiting across multiple server instances.',
        examples: [
          {
            id: 'rate-limit',
            label: 'Sliding window rate limiter with Redis',
            lang: 'typescript',
            code: `async function rateLimitLogin(ip: string): Promise<boolean> {
  const key = \`ratelimit:login:\${ip}\`;
  const limit = 5;         // max attempts
  const window = 15 * 60; // 15 minutes in seconds

  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, window);
  const results = await pipeline.exec();

  const count = results?.[0]?.[1] as number;
  return count > limit; // true = rate limited
}

// Middleware usage
router.post('/auth/login', async (req, res, next) => {
  const isLimited = await rateLimitLogin(req.ip);
  if (isLimited) {
    return res.status(429).json({
      error: { code: 'TOO_MANY_REQUESTS', retryAfter: 900 }
    });
  }
  next();
});`,
          },
        ],
      },
      {
        id: 'secrets',
        title: 'Secret Management',
        icon: 'lock',
        body: 'Secrets (API keys, database passwords, JWT secrets) must never be committed to version control, stored in client-side code, or logged. Use environment variables in development and a secrets manager (AWS Secrets Manager, Vault, Doppler) in production. Rotate secrets regularly and audit access.',
        examples: [
          {
            id: 'secrets',
            label: 'Safe secret access patterns',
            lang: 'typescript',
            code: `// ❌ NEVER hardcode secrets
const DB_URL = 'postgres://user:password123@localhost/mydb';

// ❌ NEVER log secrets (even accidentally)
console.log('Config:', process.env); // logs everything!

// ✅ Access from environment
const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) throw new Error('DATABASE_URL is not set');

// ✅ Validate required secrets at startup
function validateSecrets() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'REDIS_URL'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(\`Missing required secrets: \${missing.join(', ')}\`);
  }
}

// ✅ .env is in .gitignore — provide .env.example with placeholders
// DATABASE_URL=postgres://user:password@localhost/dbname
// JWT_SECRET=your-secret-here`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the correct fix for SQL injection vulnerabilities?',
        options: [
          'Escape special characters in user input',
          'Use parameterized queries / prepared statements',
          'Validate that input contains only alphanumeric characters',
          'Use an ORM (ORMs automatically prevent injection)',
        ],
        correct: 1,
        explanation:
          'Parameterized queries send the SQL and data separately — the database driver ensures the data is never interpreted as SQL. Input validation and escaping can help but are not sufficient alone. ORMs use parameterized queries internally, which is why they are generally safe.',
      },
      {
        id: 'q2',
        question:
          'A .env file containing database credentials is committed to a public GitHub repo. What must you do immediately?',
        options: [
          'Delete the commit from git history',
          'Make the repo private',
          'Rotate all exposed credentials immediately — assume they are compromised',
          'Add the file to .gitignore and push',
        ],
        correct: 2,
        explanation:
          'Once committed, credentials must be treated as compromised even if you delete the commit. Git history is often indexed by automated scanners within seconds. Rotate all exposed credentials immediately (change passwords, revoke API keys, generate new JWT secrets), then clean the git history.',
      },
      {
        id: 'q3',
        question:
          'Rate limiting returns 429 Too Many Requests. What header should you include?',
        options: [
          'X-Rate-Limit: blocked',
          'Retry-After: <seconds>',
          'X-Retry-Limit: 5',
          'Cache-Control: no-store',
        ],
        correct: 1,
        explanation:
          'The Retry-After header tells the client when it can try again. Without it, clients may retry immediately and still be rate limited. Include Retry-After with the number of seconds (or an HTTP date) the client should wait.',
      },
    ],
  },

  'Node.js Runtime': {
    topic: 'Node.js Runtime',
    tagline: 'Server-side JavaScript with an async core',
    overview:
      'Node.js runs JavaScript on the server using the V8 engine and libuv for async I/O. Its event-driven, non-blocking model makes it excellent for I/O-heavy workloads (APIs, real-time apps) but unsuitable for CPU-heavy computation. Understanding the event loop, streams, and process lifecycle is essential for production Node services.',
    estimatedRead: '10 min',
    difficulty: 'Advanced',
    sections: [
      {
        id: 'streams',
        title: 'Streams — Process Data Without Loading It All',
        icon: 'stream',
        body: 'Node.js streams process data piece by piece without loading everything into memory. Readable streams produce data, Writable streams consume it, and Transform streams do both. Use pipeline() (not .pipe()) to connect streams — it handles error propagation and cleanup automatically.',
        examples: [
          {
            id: 'streams',
            label: 'Streaming CSV export',
            lang: 'typescript',
            code: `import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';

// Stream large CSV export without loading all rows into memory
async function exportOrdersCSV(res: ServerResponse) {
  const dbStream = await db.orders.createReadStream(); // DB cursor
  const csvTransform = new Transform({
    objectMode: true,
    transform(row, _encoding, callback) {
      const line = \`\${row.id},\${row.total},\${row.createdAt}\n\`;
      callback(null, line);
    },
    flush(callback) {
      callback(null, ''); // finalize
    },
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');

  // pipeline handles errors and cleanup; pipe() does not
  await pipeline(dbStream, csvTransform, res);
}`,
          },
        ],
        callout: {
          type: 'warning',
          text: 'Loading a 1GB file into memory with fs.readFileSync() or even fs.readFile() will crash your Node process. Always stream large files.',
        },
      },
      {
        id: 'graceful-shutdown',
        title: 'Graceful Shutdown',
        icon: 'power_settings_new',
        body: 'Kubernetes and container orchestrators kill processes by sending SIGTERM, giving them time to finish in-flight requests before a hard SIGKILL. Without a SIGTERM handler, your server dies mid-request. Graceful shutdown: stop accepting new connections, drain in-flight requests, close DB connections, exit.',
        examples: [
          {
            id: 'shutdown',
            label: 'Graceful shutdown handler',
            lang: 'typescript',
            code: `const server = app.listen(PORT);

async function shutdown(signal: string) {
  console.log(\`\${signal} received — starting graceful shutdown\`);

  // 1. Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed');

    try {
      // 2. Drain in-flight background jobs
      await jobQueue.close();

      // 3. Close database connections
      await db.$disconnect();
      await redis.quit();

      console.log('Graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  // 4. Forcefully exit if shutdown takes too long
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30_000); // 30 second hard limit
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Why should you use pipeline() instead of .pipe() for Node.js streams?',
        options: [
          'pipeline() is faster',
          'pipeline() properly handles errors and cleans up streams; .pipe() silently leaks on error',
          'pipe() only works with file streams',
          'pipeline() supports async/await; .pipe() does not',
        ],
        correct: 1,
        explanation:
          '.pipe() does not propagate errors between stream stages and does not clean up destination streams when the source errors. pipeline() (from node:stream/promises) handles errors and destroys all streams in the chain on failure, preventing memory leaks.',
      },
      {
        id: 'q2',
        question:
          'SIGTERM is sent to your Node process. No handler is registered. What happens?',
        options: [
          'Node finishes in-flight requests then exits',
          'Node ignores it',
          'Node exits immediately, potentially mid-request',
          'Node restarts automatically',
        ],
        correct: 2,
        explanation:
          'Without a SIGTERM handler, Node exits immediately on the signal. In-flight HTTP requests are dropped, database connections may not close cleanly, and ongoing background jobs may corrupt data. Always handle SIGTERM for graceful shutdown.',
      },
      {
        id: 'q3',
        question:
          'Your Node API is slow under load despite low CPU. What is the most likely cause?',
        options: [
          'JavaScript is too slow for production',
          'Blocking the event loop with synchronous operations or CPU-heavy computation',
          'Too many worker threads',
          'V8 garbage collection',
        ],
        correct: 1,
        explanation:
          'Node.js is single-threaded. If any code runs synchronously for a long time (parsing a large JSON, running crypto operations, blocking file reads), it blocks the event loop and no other requests can be processed during that time. Use async I/O and Worker Threads for CPU work.',
      },
    ],
  },

  Observability: {
    topic: 'Observability',
    tagline: 'Know what your system is doing in production',
    overview:
      'Observability is the ability to understand the internal state of a system from its external outputs. The three pillars are logs (what happened), metrics (how much / how often), and traces (where time was spent across services). Good observability means you can diagnose an incident without SSH-ing into production.',
    estimatedRead: '9 min',
    difficulty: 'Advanced',
    sections: [
      {
        id: 'structured-logging',
        title: 'Structured Logging',
        icon: 'list_alt',
        body: 'Console.log strings are useless in production — you cannot query them. Structured logs are JSON objects with consistent fields (timestamp, level, requestId, userId, duration). Log aggregators (Datadog, Splunk, CloudWatch) index these fields for fast searching and alerting.',
        examples: [
          {
            id: 'logging',
            label: 'Structured logging with trace context',
            lang: 'typescript',
            code: `import { Logger } from 'pino'; // fast structured logger

// Middleware: generate requestId and attach to logger
function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  req.log = logger.child({ requestId, path: req.path, method: req.method });

  const start = Date.now();
  res.on('finish', () => {
    req.log.info({
      status: res.statusCode,
      durationMs: Date.now() - start,
    }, 'request completed');
  });

  next();
}

// Use in handlers — requestId follows the entire request
async function getUser(req: Request, res: Response) {
  req.log.info({ userId: req.params.id }, 'fetching user');
  const user = await db.user.findUnique({ where: { id: req.params.id } });

  if (!user) {
    req.log.warn({ userId: req.params.id }, 'user not found');
    return res.status(404).json({ error: 'Not found' });
  }

  req.log.info({ userId: user.id }, 'user fetched successfully');
  res.json({ data: user });
}`,
          },
        ],
      },
      {
        id: 'distributed-tracing',
        title: 'Distributed Tracing',
        icon: 'route',
        body: 'In a microservices architecture, a single user request touches multiple services. Distributed tracing assigns a traceId to each request and propagates it across service boundaries. Each unit of work within a trace is a span. Tools like Jaeger, Zipkin, and Datadog APM visualize the full request lifecycle across services.',
        examples: [
          {
            id: 'tracing',
            label: 'Propagating trace context across services',
            lang: 'typescript',
            code: `// Service A — generate and attach trace headers
async function callServiceB(traceId: string, spanId: string) {
  return fetch('http://service-b/api/data', {
    headers: {
      'X-Trace-Id': traceId,
      'X-Span-Id': spanId,
      'X-Parent-Span-Id': spanId,
    },
  });
}

// Service B — read trace context from incoming request
function extractTraceContext(req: Request) {
  return {
    traceId: req.headers['x-trace-id'] as string ?? crypto.randomUUID(),
    parentSpanId: req.headers['x-span-id'] as string,
    spanId: crypto.randomUUID(), // new span for this service
  };
}

// Log with trace context for stitching across services
req.log.info({
  ...extractTraceContext(req),
  service: 'service-b',
  operation: 'processData',
}, 'span started');`,
          },
        ],
        callout: {
          type: 'info',
          text: 'The W3C Trace Context standard (traceparent header) is a vendor-neutral format for propagating trace context. Use it instead of custom X- headers for interoperability.',
        },
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Why is console.log("User not found") insufficient for production logging?',
        options: [
          'console.log is too slow',
          'Plain strings cannot be queried, filtered by userId, or alerted on in log management tools',
          'console.log does not support async',
          'It causes memory leaks',
        ],
        correct: 1,
        explanation:
          'Log aggregators (Datadog, Splunk) index structured JSON fields. A structured log { level: "warn", userId: "123", message: "User not found" } can be queried (find all warnings for userId 123), alerted on, and correlated with other events. A plain string cannot.',
      },
      {
        id: 'q2',
        question:
          'A traceId propagated across 5 microservices serves what purpose?',
        options: [
          'Authenticates requests between services',
          'Allows all logs and spans from a single user request to be joined and visualized end-to-end',
          'Encrypts inter-service communication',
          'Tracks user sessions',
        ],
        correct: 1,
        explanation:
          'A traceId ties together all spans from a single logical request across multiple services. In a trace visualization tool, you can see exactly which service was slow, which DB query took the most time, and where an error originated — even if it spans 10 services.',
      },
      {
        id: 'q3',
        question: 'What is the difference between a metric and a log?',
        options: [
          'Metrics are for errors; logs are for normal events',
          'Metrics aggregate numeric values over time (req/s, p99 latency); logs capture individual event details',
          'Logs are structured; metrics are unstructured',
          'Metrics are only for infrastructure; logs are for application code',
        ],
        correct: 1,
        explanation:
          'Metrics are numeric time-series data: request rate, error rate, p50/p95/p99 latency, memory usage. They answer "how much / how often." Logs capture individual event details: which user, what data, what error. Together they provide comprehensive observability.',
      },
    ],
  },

  'Messaging & Queues': {
    topic: 'Messaging & Queues',
    tagline: 'Decouple producers from consumers for resilient systems',
    overview:
      'Message queues decouple the part of your system that generates work from the part that processes it. This enables async processing (email sends, PDF generation, webhooks), load leveling (absorb traffic spikes), and retry logic (failed jobs retry automatically). Key tradeoffs: at-least-once vs exactly-once delivery, message ordering, and handling poison messages.',
    estimatedRead: '10 min',
    difficulty: 'Advanced',
    sections: [
      {
        id: 'queue-fundamentals',
        title: 'Queue Fundamentals',
        icon: 'queue',
        body: 'Producers push messages onto a queue; consumers pull and process them. Most queues guarantee at-least-once delivery: a message may be delivered more than once (especially on retry). This means consumers must be idempotent — processing the same message twice should have the same effect as processing it once.',
        examples: [
          {
            id: 'queue-producer',
            label: 'Producer/Consumer pattern (BullMQ)',
            lang: 'typescript',
            code: `import { Queue, Worker } from 'bullmq';

// Producer — enqueue email jobs
const emailQueue = new Queue('emails', {
  connection: { host: 'localhost', port: 6379 },
  defaultJobOptions: {
    attempts: 3,               // retry up to 3 times
    backoff: { type: 'exponential', delay: 2000 }, // 2s, 4s, 8s
    removeOnComplete: { age: 3600 }, // clean up after 1 hour
    removeOnFail: { count: 50 },
  },
});

async function sendWelcomeEmail(userId: string, email: string) {
  await emailQueue.add('welcome', { userId, email }, {
    jobId: \`welcome-\${userId}\`, // deduplicate: same userId = same job
  });
}

// Consumer — process email jobs
const worker = new Worker('emails', async (job) => {
  const { userId, email } = job.data;

  await job.updateProgress(10);
  const template = await renderWelcomeTemplate(userId);

  await job.updateProgress(50);
  await mailer.send({ to: email, ...template });

  await job.updateProgress(100);
  return { sentAt: new Date().toISOString() };
}, { connection: { host: 'localhost', port: 6379 } });`,
          },
        ],
      },
      {
        id: 'dlq',
        title: 'Dead-Letter Queues',
        icon: 'report',
        body: 'A dead-letter queue (DLQ) receives messages that could not be processed after all retry attempts. Without a DLQ, failed messages are either lost or block the queue. With a DLQ, you can inspect failed messages, fix the underlying bug, and replay them. Always configure a DLQ for production queues.',
        examples: [
          {
            id: 'dlq',
            label: 'DLQ pattern with idempotency',
            lang: 'typescript',
            code: `// Idempotent consumer — safe to process the same message twice
async function processOrderEvent(message: OrderEvent) {
  const idempotencyKey = \`order-event:\${message.eventId}\`;

  // Check if already processed
  const alreadyProcessed = await redis.exists(idempotencyKey);
  if (alreadyProcessed) {
    console.log(\`Skipping duplicate event \${message.eventId}\`);
    return; // idempotent skip
  }

  // Process the event
  await db.order.update({
    where: { id: message.orderId },
    data: { status: message.newStatus },
  });

  // Mark as processed (TTL of 7 days covers retry windows)
  await redis.setex(idempotencyKey, 7 * 24 * 3600, '1');
}

// Failed event handler → route to DLQ for investigation
worker.on('failed', async (job, error) => {
  if (job && job.attemptsMade >= job.opts.attempts!) {
    await dlqQueue.add('failed-order-event', {
      originalJob: job.data,
      error: error.message,
      failedAt: new Date().toISOString(),
    });
  }
});`,
          },
        ],
        callout: {
          type: 'tip',
          text: 'Use a stable, business-meaningful jobId (like "welcome-{userId}") to prevent duplicate jobs when the producer retries. BullMQ will deduplicate jobs with the same jobId.',
        },
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'A queue guarantees "at-least-once" delivery. What must your consumer implement?',
        options: [
          'Exactly-once processing using distributed locks',
          'Idempotency — processing the same message multiple times produces the same result',
          'Message ordering guarantees',
          'Synchronous acknowledgment',
        ],
        correct: 1,
        explanation:
          'At-least-once delivery means messages may be delivered more than once (e.g., after a worker crash mid-processing). Consumers must be idempotent: processing the same message twice must not double-charge a payment, send two emails, etc. Idempotency keys stored in Redis are a common solution.',
      },
      {
        id: 'q2',
        question: 'What is the purpose of a dead-letter queue (DLQ)?',
        options: [
          'To store high-priority messages',
          'To capture messages that failed all retry attempts for inspection and replay',
          'To archive completed messages',
          'To handle messages that arrive out of order',
        ],
        correct: 1,
        explanation:
          'A DLQ captures messages that could not be processed after all retry attempts. Without a DLQ, failed messages are silently dropped. With a DLQ, engineers can inspect failed messages, identify the bug pattern, fix it, and replay the DLQ.',
      },
      {
        id: 'q3',
        question:
          'Exponential backoff retries a job after 2s, 4s, 8s, 16s. Why not retry immediately?',
        options: [
          'Immediate retries are not supported by queue libraries',
          'Immediate retries hammer a struggling downstream service, making the outage worse. Backoff gives it time to recover.',
          'Immediate retries cause message ordering issues',
          'Queue consumers cannot process messages faster than 1 per second',
        ],
        correct: 1,
        explanation:
          'If a downstream service is overloaded or down, retrying immediately adds more load to an already struggling system, worsening the outage. Exponential backoff gives the service time to recover between attempts. Combined with jitter (random delay), it spreads retries across multiple consumers.',
      },
    ],
  },

  Concurrency: {
    topic: 'Concurrency',
    tagline: 'Do more at once, safely',
    overview:
      'Concurrency is about managing multiple things that are in progress simultaneously. In JavaScript/Node.js, this is primarily async concurrency via the event loop — not true parallelism (which requires Worker Threads). Common challenges: race conditions, deadlocks, shared mutable state, and coordinating parallel operations without overlapping or missing work.',
    estimatedRead: '10 min',
    difficulty: 'Advanced',
    sections: [
      {
        id: 'async-concurrency',
        title: 'Async Concurrency Patterns',
        icon: 'sync_alt',
        body: 'Promise.all() runs async operations in parallel and waits for all to complete. Promise.allSettled() does the same but does not reject if one fails. Promise.race() resolves with the first to complete. Promise.any() resolves with the first to fulfill (ignores rejections). Use these to avoid sequential awaits when operations are independent.',
        examples: [
          {
            id: 'promise-all',
            label: 'Parallel vs Sequential fetching',
            lang: 'typescript',
            code: `// ❌ Sequential — slow (3 round trips, one at a time)
async function loadDashboardSlow(userId: string) {
  const user   = await fetchUser(userId);     // 200ms
  const orders = await fetchOrders(userId);   // 150ms
  const stats  = await fetchStats(userId);    // 100ms
  return { user, orders, stats };            // total: ~450ms
}

// ✅ Parallel — fast (all requests in flight simultaneously)
async function loadDashboard(userId: string) {
  const [user, orders, stats] = await Promise.all([
    fetchUser(userId),
    fetchOrders(userId),
    fetchStats(userId),
  ]);
  return { user, orders, stats };            // total: ~200ms (slowest wins)
}

// ✅ Parallel with partial failures — allSettled never rejects
async function loadDashboardResilient(userId: string) {
  const [userResult, ordersResult] = await Promise.allSettled([
    fetchUser(userId),
    fetchOrders(userId),
  ]);

  const user = userResult.status === 'fulfilled' ? userResult.value : null;
  return { user, orders: ordersResult.status === 'fulfilled' ? ordersResult.value : [] };
}`,
          },
        ],
      },
      {
        id: 'concurrency-limits',
        title: 'Concurrency Limits — p-limit',
        icon: 'tune',
        body: 'Running 1000 API calls with Promise.all() starts 1000 concurrent requests and likely overwhelms the target. Concurrency limits process N operations at a time, starting a new one when one finishes. p-limit is the standard Node.js solution.',
        examples: [
          {
            id: 'p-limit',
            label: 'Bounded concurrency with p-limit',
            lang: 'typescript',
            code: `import pLimit from 'p-limit';

async function processUsersInBatches(userIds: string[]) {
  const limit = pLimit(10); // max 10 concurrent operations

  const results = await Promise.all(
    userIds.map(id =>
      limit(async () => {
        // At most 10 of these run concurrently
        const user = await fetchUser(id);
        const updated = await processUser(user);
        return updated;
      })
    )
  );

  return results;
}

// Without p-limit: 10,000 simultaneous requests → rate limit / OOM
// With p-limit(10): max 10 in flight, predictable resource usage`,
          },
        ],
        callout: {
          type: 'tip',
          text: 'A good concurrency limit for external API calls is 5–10. For your own database, you can go higher (25–50) depending on connection pool size.',
        },
      },
      {
        id: 'race-conditions',
        title: 'Race Conditions',
        icon: 'warning',
        body: 'A race condition occurs when the outcome depends on the timing of concurrent operations. Classic example: two requests read stock = 1, both decide to place an order, both decrement to 0, but stock goes to -1. Fix with database-level locks (SELECT FOR UPDATE) or optimistic locking (version fields).',
        examples: [
          {
            id: 'race-condition',
            label: 'Fixing a race condition with DB locks',
            lang: 'typescript',
            code: `// ❌ RACE CONDITION — two requests can both read stock = 1
async function reserveStock_UNSAFE(productId: string, qty: number) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (product.stock < qty) throw new Error('Insufficient stock');

  // Another request can interleave here! ←
  await db.product.update({
    where: { id: productId },
    data: { stock: { decrement: qty } },
  });
}

// ✅ SAFE — atomic conditional update
async function reserveStock(productId: string, qty: number) {
  const result = await db.product.updateMany({
    where: {
      id: productId,
      stock: { gte: qty }, // condition checked atomically with update
    },
    data: { stock: { decrement: qty } },
  });

  if (result.count === 0) {
    throw new Error('Insufficient stock or already reserved');
  }
}`,
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'You need to fetch user data, orders, and analytics in a dashboard handler. What is the most efficient approach?',
        options: [
          'await each sequentially to ensure order',
          'Promise.all() to run all three in parallel',
          'Use three separate endpoints from the client',
          'Cache all data globally',
        ],
        correct: 1,
        explanation:
          'The three fetches are independent — there is no reason to wait for user data before fetching orders. Promise.all() starts all three concurrently; the total time is the slowest of the three, not the sum of all three.',
      },
      {
        id: 'q2',
        question:
          'Promise.all() vs Promise.allSettled() — when should you use allSettled?',
        options: [
          'allSettled() is always preferred',
          'When you want partial results even if some promises reject (do not short-circuit on first failure)',
          'When promises have dependencies between them',
          'allSettled is only for TypeScript',
        ],
        correct: 1,
        explanation:
          'Promise.all() rejects as soon as any promise rejects. Promise.allSettled() always resolves with an array of results (fulfilled or rejected) for all promises. Use allSettled when you want to handle partial success — e.g., load as much of a dashboard as possible even if one API call fails.',
      },
      {
        id: 'q3',
        question:
          'Two concurrent requests both read stock = 1 and both try to reserve it. What prevents overselling?',
        options: [
          'JavaScript is single-threaded so this cannot happen',
          'An atomic conditional database update: UPDATE WHERE stock >= qty',
          'Retrying failed requests',
          'Rate limiting the endpoint',
        ],
        correct: 1,
        explanation:
          'JavaScript is single-threaded but database operations are async — two requests can interleave at any await point. An atomic conditional update (WHERE stock >= qty in the same UPDATE) is handled as a single database operation, preventing the race condition at the database level.',
      },
    ],
  },

  'API Integration': {
    topic: 'API Integration',
    tagline: 'Connect your UI to data with resilience and clarity',
    overview:
      'API integration in frontend work covers fetching data, managing loading/error/empty states, handling stale data, and keeping the UI responsive during async operations. The difference between a frustrating and a delightful UI is often how gracefully it handles the in-between moments: loading, partial failures, and retries.',
    estimatedRead: '10 min',
    difficulty: 'Intermediate',
    sections: [
      {
        id: 'fetch-states',
        title: 'Modeling Fetch States Correctly',
        icon: 'cloud_download',
        body: 'A fetch operation has at minimum four states: idle (not started), loading, success, and error. Modeling these as a discriminated union instead of separate booleans prevents impossible combinations like loading: true and data defined simultaneously.',
        examples: [
          {
            id: 'fetch-states',
            label: 'Discriminated fetch state hook',
            lang: 'typescript',
            code: `type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({ status: 'idle' });

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    setState({ status: 'loading' });

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(\`\${res.status} \${res.statusText}\`);
        return res.json() as Promise<T>;
      })
      .then(data => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch(err => {
        if (!cancelled) setState({ status: 'error', message: err.message });
      });

    return () => { cancelled = true; };
  }, [url]);

  return state;
}`,
          },
        ],
      },
      {
        id: 'optimistic-ui',
        title: 'Optimistic Updates',
        icon: 'flash_on',
        body: 'Optimistic updates apply the expected state change immediately in the UI, then revert on error. This makes the UI feel instant — especially important for interactions like "like", "delete", and "reorder" where the network round trip would feel slow. Always implement rollback logic.',
        examples: [
          {
            id: 'optimistic',
            label: 'Optimistic todo deletion',
            lang: 'typescript',
            code: `function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  async function deleteTodo(id: string) {
    // 1. Optimistic update — remove immediately
    const previousTodos = todos;
    setTodos(todos.filter(t => t.id !== id));

    try {
      // 2. Sync with server
      await api.delete(\`/todos/\${id}\`);
    } catch (error) {
      // 3. Rollback on failure
      setTodos(previousTodos);
      toast.error('Failed to delete todo. Please try again.');
    }
  }

  return { todos, deleteTodo };
}`,
          },
        ],
        callout: {
          type: 'tip',
          text: 'React Query and SWR handle optimistic updates, caching, background refetching, and retry logic out of the box. For anything beyond simple fetching, use a data fetching library.',
        },
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'What is wrong with modeling fetch state as separate isLoading, isError, and data variables?',
        options: [
          'It uses too much memory',
          'Impossible states can exist: isLoading and data can both be true simultaneously',
          'React cannot re-render with multiple state variables',
          'TypeScript does not support boolean state',
        ],
        correct: 1,
        explanation:
          'Multiple booleans allow impossible combinations: isLoading=true AND data defined, or isError=true AND isLoading=true. A discriminated union with a single status field makes impossible states unrepresentable and simplifies rendering logic.',
      },
      {
        id: 'q2',
        question: 'An optimistic delete fails. What must your UI do?',
        options: [
          'Show a 404 page',
          'Roll back to the previous state and notify the user',
          'Retry the delete automatically',
          'Refresh the entire page',
        ],
        correct: 1,
        explanation:
          'Optimistic updates must save previous state before updating and restore it on failure. Without rollback, a failed delete leaves the item visually removed from the UI even though it still exists on the server, causing data inconsistency.',
      },
      {
        id: 'q3',
        question:
          'Why should you use an AbortController or cancelled flag in useEffect data fetching?',
        options: [
          'To improve performance',
          'To prevent updating state on an unmounted component when the effect cleanup runs before the fetch resolves',
          'Fetch API requires it',
          'To handle CORS errors',
        ],
        correct: 1,
        explanation:
          'If a component unmounts while a fetch is in flight (e.g., user navigates away), the fetch resolves after unmount and calls setState on an unmounted component. A cancelled flag or AbortController prevents this, avoiding the "Can\'t perform state update on unmounted component" warning and potential memory leaks.',
      },
    ],
  },
};
