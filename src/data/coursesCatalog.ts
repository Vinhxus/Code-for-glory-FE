export type CourseTrack =
  | 'Frontend'
  | 'Backend'
  | 'Fullstack'
  | 'DevOps'
  | 'Database';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CourseCatalogItem {
  id: string;
  slug: string;
  title: { en: string; vi: string };
  provider: string;
  providerKind: 'Official' | 'Community';
  track: CourseTrack;
  level: CourseLevel;
  accent: string;
  xp: number;
  featured: boolean;
  format: { en: string; vi: string };
  lessonMeta: { en: string; vi: string };
  priceLabel: { en: string; vi: string };
  languageLabel: { en: string; vi: string };
  url: string;
  summary: { en: string; vi: string };
  whyPick: { en: string; vi: string };
  tags: string[];
  outcomes: Array<{ en: string; vi: string }>;
}

export const COURSES_CATALOG: CourseCatalogItem[] = [
  {
    id: 'mdn-learn-web-dev',
    slug: 'mdn-learn-web-development',
    title: {
      en: 'MDN Learn Web Development',
      vi: 'MDN Learn Web Development',
    },
    provider: 'MDN Web Docs',
    providerKind: 'Official',
    track: 'Frontend',
    level: 'Beginner',
    accent: '#4ade80',
    xp: 1200,
    featured: true,
    format: { en: 'Official learning area', vi: 'Lộ trình học chính thức' },
    lessonMeta: { en: '3 learning arcs', vi: '3 chặng học' },
    priceLabel: { en: 'Free', vi: 'Miễn phí' },
    languageLabel: { en: 'English', vi: 'Tiếng Anh' },
    url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development',
    summary: {
      en: 'A structured entry path for HTML, CSS, JavaScript, testing skills, and browser fundamentals.',
      vi: 'Lộ trình nhập môn có cấu trúc cho HTML, CSS, JavaScript, bài kiểm tra kỹ năng và nền tảng trình duyệt.',
    },
    whyPick: {
      en: 'Ideal if you want a strong web foundation before jumping into frameworks.',
      vi: 'Rất hợp nếu bạn muốn chắc nền web trước khi nhảy vào framework.',
    },
    tags: ['HTML', 'CSS', 'JavaScript', 'Accessibility'],
    outcomes: [
      {
        en: 'Understand core web building blocks and browser thinking.',
        vi: 'Hiểu các khối nền tảng của web và cách trình duyệt hoạt động.',
      },
      {
        en: 'Practice with skill tests and coding challenges along the path.',
        vi: 'Luyện thêm bằng các bài test kỹ năng và challenge trong lộ trình.',
      },
      {
        en: 'Build enough confidence to move into React or other frontend stacks.',
        vi: 'Đủ tự tin để chuyển sang React hoặc các stack frontend khác.',
      },
    ],
  },
  {
    id: 'react-learn',
    slug: 'react-learn',
    title: { en: 'React Learn', vi: 'React Learn' },
    provider: 'React',
    providerKind: 'Official',
    track: 'Frontend',
    level: 'Intermediate',
    accent: '#7dd3fc',
    xp: 2100,
    featured: true,
    format: { en: 'Official docs path', vi: 'Lộ trình docs chính thức' },
    lessonMeta: { en: '10 core concepts', vi: '10 concept cốt lõi' },
    priceLabel: { en: 'Free', vi: 'Miễn phí' },
    languageLabel: { en: 'English', vi: 'Tiếng Anh' },
    url: 'https://react.dev/learn',
    summary: {
      en: 'The canonical path for components, JSX, state, events, rendering, and shared state.',
      vi: 'Lộ trình chuẩn để học component, JSX, state, events, render và chia sẻ state.',
    },
    whyPick: {
      en: 'The best fit when your FE is already React and you want habits that align with modern React guidance.',
      vi: 'Phù hợp nhất khi FE của bạn đã dùng React và bạn muốn học đúng theo tư duy React hiện đại.',
    },
    tags: ['React', 'JSX', 'State', 'Hooks'],
    outcomes: [
      {
        en: 'Write React UI with component-based thinking.',
        vi: 'Viết UI React theo tư duy component rõ ràng.',
      },
      {
        en: 'Handle conditional rendering, lists, events, and state updates.',
        vi: 'Xử lý render điều kiện, list, event và cập nhật state.',
      },
      {
        en: 'Lift state and structure components more cleanly.',
        vi: 'Biết nâng state lên và tổ chức component sạch hơn.',
      },
    ],
  },
  {
    id: 'typescript-docs',
    slug: 'typescript-docs',
    title: { en: 'TypeScript Handbook & Docs', vi: 'TypeScript Handbook & Docs' },
    provider: 'TypeScript',
    providerKind: 'Official',
    track: 'Fullstack',
    level: 'Intermediate',
    accent: '#60a5fa',
    xp: 2400,
    featured: true,
    format: { en: 'Handbook + guides', vi: 'Handbook + guide' },
    lessonMeta: { en: 'Get Started + Handbook', vi: 'Get Started + Handbook' },
    priceLabel: { en: 'Free', vi: 'Miễn phí' },
    languageLabel: { en: 'English', vi: 'Tiếng Anh' },
    url: 'https://www.typescriptlang.org/docs/',
    summary: {
      en: 'A practical progression from basic types to generics, narrowing, utilities, and project configuration.',
      vi: 'Lộ trình thực tế từ type cơ bản tới generics, narrowing, utility types và cấu hình project.',
    },
    whyPick: {
      en: 'Great for tightening both FE and BE code quality in a TS-first codebase.',
      vi: 'Rất hợp để nâng chất lượng code cả FE lẫn BE trong codebase TypeScript.',
    },
    tags: ['TypeScript', 'Generics', 'Narrowing', 'Tooling'],
    outcomes: [
      {
        en: 'Use stronger typing for components, APIs, and shared models.',
        vi: 'Dùng typing tốt hơn cho component, API và shared model.',
      },
      {
        en: 'Understand everyday types, functions, objects, and type transformations.',
        vi: 'Hiểu everyday types, function, object và biến đổi type.',
      },
      {
        en: 'Work more confidently with tsconfig and build tooling.',
        vi: 'Làm việc tự tin hơn với tsconfig và build tooling.',
      },
    ],
  },
  {
    id: 'fullstack-open',
    slug: 'fullstack-open',
    title: { en: 'Full Stack Open', vi: 'Full Stack Open' },
    provider: 'University of Helsinki',
    providerKind: 'Community',
    track: 'Fullstack',
    level: 'Advanced',
    accent: '#f97316',
    xp: 4800,
    featured: true,
    format: { en: 'Deep course series', vi: 'Chuỗi khóa học chuyên sâu' },
    lessonMeta: { en: '15 parts', vi: '15 phần học' },
    priceLabel: { en: 'Free', vi: 'Miễn phí' },
    languageLabel: { en: 'English', vi: 'Tiếng Anh' },
    url: 'https://fullstackopen.com/en/',
    summary: {
      en: 'A modern JavaScript fullstack path covering React, Node.js, MongoDB, GraphQL, TypeScript, CI/CD, containers, and Next.js.',
      vi: 'Lộ trình fullstack JavaScript hiện đại gồm React, Node.js, MongoDB, GraphQL, TypeScript, CI/CD, containers và Next.js.',
    },
    whyPick: {
      en: 'Excellent when you want one serious path that bridges frontend, backend, testing, deployment, and databases.',
      vi: 'Rất mạnh nếu bạn muốn một lộ trình nghiêm túc nối liền frontend, backend, testing, deployment và database.',
    },
    tags: ['React', 'Node.js', 'GraphQL', 'CI/CD', 'Containers'],
    outcomes: [
      {
        en: 'Build SPA + API systems with a realistic modern stack.',
        vi: 'Xây được hệ SPA + API với stack hiện đại sát thực tế.',
      },
      {
        en: 'Touch testing, state management, mobile, containers, and relational databases.',
        vi: 'Chạm vào testing, state management, mobile, containers và relational databases.',
      },
      {
        en: 'Develop stronger end-to-end engineering context.',
        vi: 'Có góc nhìn end-to-end tốt hơn khi làm sản phẩm.',
      },
    ],
  },
  {
    id: 'nodejs-learn',
    slug: 'nodejs-learn',
    title: { en: 'Node.js Learn', vi: 'Node.js Learn' },
    provider: 'Node.js',
    providerKind: 'Official',
    track: 'Backend',
    level: 'Beginner',
    accent: '#22c55e',
    xp: 1800,
    featured: false,
    format: { en: 'Official learning path', vi: 'Lộ trình chính thức' },
    lessonMeta: {
      en: 'Getting started + HTTP + async',
      vi: 'Nhập môn + HTTP + async',
    },
    priceLabel: { en: 'Free', vi: 'Miễn phí' },
    languageLabel: { en: 'English', vi: 'Tiếng Anh' },
    url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
    summary: {
      en: 'A clean backend starting point for Node runtime, npm, HTTP, async I/O, event loop, and security basics.',
      vi: 'Điểm khởi đầu sạch cho backend với Node runtime, npm, HTTP, async I/O, event loop và nền tảng bảo mật.',
    },
    whyPick: {
      en: 'Useful when you need to understand Node itself instead of only using frameworks on top of it.',
      vi: 'Hợp khi bạn muốn hiểu bản thân Node thay vì chỉ dùng framework dựng sẵn bên trên.',
    },
    tags: ['Node.js', 'HTTP', 'Event Loop', 'npm'],
    outcomes: [
      {
        en: 'Understand why Node handles many concurrent connections efficiently.',
        vi: 'Hiểu vì sao Node xử lý nhiều kết nối đồng thời hiệu quả.',
      },
      {
        en: 'Learn the runtime model behind backend JavaScript.',
        vi: 'Nắm mô hình runtime phía sau JavaScript backend.',
      },
      {
        en: 'Move into Express or Nest with stronger foundations.',
        vi: 'Chuyển sang Express hoặc Nest với nền tảng chắc hơn.',
      },
    ],
  },
  {
    id: 'nestjs-first-steps',
    slug: 'nestjs-first-steps',
    title: { en: 'NestJS First Steps', vi: 'NestJS First Steps' },
    provider: 'NestJS',
    providerKind: 'Official',
    track: 'Backend',
    level: 'Intermediate',
    accent: '#f43f5e',
    xp: 2600,
    featured: false,
    format: { en: 'Framework fundamentals', vi: 'Nền tảng framework' },
    lessonMeta: { en: 'Core CRUD starter', vi: 'Starter CRUD cốt lõi' },
    priceLabel: { en: 'Free', vi: 'Miễn phí' },
    languageLabel: { en: 'English', vi: 'Tiếng Anh' },
    url: 'https://docs.nestjs.com/first-steps',
    summary: {
      en: 'A guided start into Nest fundamentals, CLI setup, app structure, and the bootstrap flow of a TypeScript backend.',
      vi: 'Lộ trình nhập môn Nest gồm CLI, cấu trúc app và bootstrap flow của một backend TypeScript.',
    },
    whyPick: {
      en: 'Best for teams building modular Node backends with controllers, modules, and services.',
      vi: 'Rất hợp cho team xây backend Node theo hướng module, controller và service rõ ràng.',
    },
    tags: ['NestJS', 'Modules', 'Controllers', 'Services'],
    outcomes: [
      {
        en: 'Understand the Nest app lifecycle and project scaffolding.',
        vi: 'Hiểu vòng đời app Nest và cách scaffold project.',
      },
      {
        en: 'Work more cleanly with module-based architecture.',
        vi: 'Làm việc sạch hơn với kiến trúc module-based.',
      },
      {
        en: 'Prepare for auth, database, and production patterns in Nest.',
        vi: 'Sẵn sàng đi tiếp sang auth, database và pattern production của Nest.',
      },
    ],
  },
  {
    id: 'fcc-backend-apis',
    slug: 'freecodecamp-backend-development-and-apis',
    title: {
      en: 'freeCodeCamp Back-End Development and APIs',
      vi: 'freeCodeCamp Back-End Development and APIs',
    },
    provider: 'freeCodeCamp',
    providerKind: 'Community',
    track: 'Backend',
    level: 'Beginner',
    accent: '#facc15',
    xp: 3200,
    featured: false,
    format: { en: 'Interactive certification path', vi: 'Lộ trình chứng chỉ tương tác' },
    lessonMeta: { en: '39 challenges + projects', vi: '39 challenge + project' },
    priceLabel: { en: 'Free', vi: 'Miễn phí' },
    languageLabel: { en: 'English', vi: 'Tiếng Anh' },
    url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/',
    summary: {
      en: 'An interactive path for npm, basic Node and Express, MongoDB, Mongoose, and microservice-style projects.',
      vi: 'Lộ trình tương tác cho npm, Node và Express cơ bản, MongoDB, Mongoose và các project kiểu microservice.',
    },
    whyPick: {
      en: 'Good if you learn best by solving guided exercises and shipping mini backend projects.',
      vi: 'Phù hợp nếu bạn học tốt nhất bằng cách làm bài tương tác và ship mini backend project.',
    },
    tags: ['Express', 'MongoDB', 'Mongoose', 'Microservices'],
    outcomes: [
      {
        en: 'Learn backend basics through hands-on tasks instead of only reading docs.',
        vi: 'Học backend cơ bản bằng bài thực hành thay vì chỉ đọc docs.',
      },
      {
        en: 'Practice npm package management and API project workflows.',
        vi: 'Luyện quản lý package npm và luồng làm API project.',
      },
      {
        en: 'Build several microservice-style portfolio pieces.',
        vi: 'Tạo được vài project kiểu microservice để bỏ vào portfolio.',
      },
    ],
  },
  {
    id: 'docker-get-started',
    slug: 'docker-get-started',
    title: { en: 'Docker Get Started', vi: 'Docker Get Started' },
    provider: 'Docker',
    providerKind: 'Official',
    track: 'DevOps',
    level: 'Intermediate',
    accent: '#38bdf8',
    xp: 2300,
    featured: false,
    format: { en: 'Concepts + workshop', vi: 'Concepts + workshop' },
    lessonMeta: { en: '9 workshop parts', vi: '9 phần workshop' },
    priceLabel: { en: 'Free', vi: 'Miễn phí' },
    languageLabel: { en: 'English', vi: 'Tiếng Anh' },
    url: 'https://docs.docker.com/get-started/',
    summary: {
      en: 'A practical Docker starting path for images, containers, Compose, persistence, and multi-container apps.',
      vi: 'Lộ trình nhập môn Docker thực tế về image, container, Compose, persistence và app nhiều container.',
    },
    whyPick: {
      en: 'Perfect when you are already coding but want to ship your app more professionally.',
      vi: 'Rất hợp khi bạn đã code được nhưng muốn đóng gói và chạy app chuyên nghiệp hơn.',
    },
    tags: ['Docker', 'Compose', 'Containers', 'Images'],
    outcomes: [
      {
        en: 'Understand the container workflow from build to run.',
        vi: 'Hiểu workflow container từ build tới run.',
      },
      {
        en: 'Use Docker Compose and persistence more confidently.',
        vi: 'Dùng Docker Compose và persistence tự tin hơn.',
      },
      {
        en: 'Prepare FE/BE projects for local environments and deployment.',
        vi: 'Chuẩn bị FE/BE project cho môi trường local và deployment.',
      },
    ],
  },
  {
    id: 'postgresql-tutorial',
    slug: 'postgresql-tutorial',
    title: { en: 'PostgreSQL Tutorial', vi: 'PostgreSQL Tutorial' },
    provider: 'PostgreSQL',
    providerKind: 'Official',
    track: 'Database',
    level: 'Beginner',
    accent: '#818cf8',
    xp: 1600,
    featured: false,
    format: { en: 'Official tutorial', vi: 'Tutorial chính thức' },
    lessonMeta: { en: '4 getting-started chapters', vi: '4 chương nhập môn' },
    priceLabel: { en: 'Free', vi: 'Miễn phí' },
    languageLabel: { en: 'English', vi: 'Tiếng Anh' },
    url: 'https://www.postgresql.org/docs/current/tutorial-start.html',
    summary: {
      en: 'A clean start to installation, architecture basics, creating databases, and accessing PostgreSQL.',
      vi: 'Khởi đầu gọn cho cài đặt, kiến trúc cơ bản, tạo database và truy cập PostgreSQL.',
    },
    whyPick: {
      en: 'Useful for backend learners who need a solid relational database base before ORM-heavy work.',
      vi: 'Rất hữu ích cho người học backend muốn chắc nền relational database trước khi dùng ORM nhiều.',
    },
    tags: ['PostgreSQL', 'SQL', 'Database', 'Relational'],
    outcomes: [
      {
        en: 'Understand database setup and first contact with PostgreSQL.',
        vi: 'Hiểu cách setup và làm quen ban đầu với PostgreSQL.',
      },
      {
        en: 'Develop better database intuition for backend systems.',
        vi: 'Có trực giác database tốt hơn cho hệ backend.',
      },
      {
        en: 'Prepare for migrations, schema design, and query thinking.',
        vi: 'Sẵn sàng đi tiếp sang migration, schema design và tư duy query.',
      },
    ],
  },
];
