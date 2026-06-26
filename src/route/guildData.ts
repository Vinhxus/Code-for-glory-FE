// ─── guildData.ts ─────────────────────────────────────────────────────────────
// Tất cả types, data, config maps, và helpers trong 1 file

// ─── Types ────────────────────────────────────────────────────────────────────

export type GuildType =
  | 'Backend'
  | 'Frontend'
  | 'Data Science'
  | 'DevOps'
  | 'Security'
  | 'Mobile';

export interface Quest {
  label: string;
  progress: number;
  total: number;
  reward: string;
}

export interface Guild {
  id: string;
  name: string;
  members: number;
  maxMembers: number;
  level: number;
  xp: number;
  xpNext: number;
  type: GuildType;
  color: string;
  rank: number;
  winRate: number;
  founded: string;
  openToJoin: boolean;
  featured?: boolean;
  quests: Quest[];
  memberAvatars: string[];
  description: string;
  weeklyXP: number;
  tags: string[];
  language: string;
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

export const TYPE_ICONS: Record<GuildType | 'All', string> = {
  All: 'apps',
  Backend: 'dns',
  Frontend: 'palette',
  'Data Science': 'analytics',
  DevOps: 'cloud',
  Security: 'shield',
  Mobile: 'smartphone',
};

export const TYPE_COLORS: Record<GuildType, string> = {
  Backend: '#a78bfa',
  Frontend: '#ff7e5f',
  'Data Science': '#4ade80',
  DevOps: '#38bdf8',
  Security: '#f472b6',
  Mobile: '#fb923c',
};

export const TYPE_DESCRIPTIONS: Record<GuildType, { vi: string; en: string }> =
  {
    Backend: {
      en: 'Server-side engineers mastering APIs, databases, and distributed systems.',
      vi: 'Kỹ sư phía server, thành thạo API, cơ sở dữ liệu và hệ thống phân tán.',
    },
    Frontend: {
      en: 'UI craftspeople building pixel-perfect, accessible, and performant web experiences.',
      vi: 'Nghệ nhân UI tạo ra trải nghiệm web hoàn hảo, dễ tiếp cận và hiệu suất cao.',
    },
    'Data Science': {
      en: 'Python wizards training ML models, crunching datasets, and making data speak.',
      vi: 'Phù thủy Python huấn luyện mô hình ML, phân tích dữ liệu và khai thác insight.',
    },
    DevOps: {
      en: 'Infrastructure warriors automating deployments, scaling systems, and owning reliability.',
      vi: 'Chiến binh hạ tầng tự động hóa triển khai, mở rộng hệ thống và đảm bảo độ tin cậy.',
    },
    Security: {
      en: 'Ethical hackers and CTF champions finding vulnerabilities before the bad guys do.',
      vi: 'Hacker đạo đức và nhà vô địch CTF tìm lỗ hổng bảo mật trước kẻ xấu.',
    },
    Mobile: {
      en: 'iOS and Android artisans building native and cross-platform mobile experiences.',
      vi: 'Nghệ nhân iOS và Android xây dựng trải nghiệm mobile native và đa nền tảng.',
    },
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const fmtMembers = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

export const rankLabel = (r: number) =>
  r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;

// ─── Guild Data ───────────────────────────────────────────────────────────────

export const GUILDS: Guild[] = [
  {
    id: '1',
    name: 'The Void Walkers',
    members: 1240,
    maxMembers: 1500,
    level: 42,
    xp: 87400,
    xpNext: 100000,
    type: 'Backend',
    color: '#a78bfa',
    rank: 1,
    winRate: 74,
    founded: '2023',
    openToJoin: true,
    featured: true,
    description:
      'Elite backend engineers mastering distributed systems, API design, and high-performance architecture.',
    weeklyXP: 12400,
    tags: ['Node.js', 'Go', 'PostgreSQL', 'Redis'],
    language: 'Go / Node.js',
    quests: [
      {
        label: 'Win 50 ranked battles',
        progress: 38,
        total: 50,
        reward: '5,000 XP',
      },
      {
        label: 'Complete 10 guild challenges',
        progress: 7,
        total: 10,
        reward: '2,500 XP',
      },
      {
        label: 'Recruit 5 new members',
        progress: 3,
        total: 5,
        reward: '1,000 XP',
      },
    ],
    memberAvatars: ['V', 'B', 'S', 'K', 'R'],
  },
  {
    id: '2',
    name: 'Pixel Pioneers',
    members: 890,
    maxMembers: 1000,
    level: 35,
    xp: 62000,
    xpNext: 75000,
    type: 'Frontend',
    color: '#ff7e5f',
    rank: 2,
    winRate: 68,
    founded: '2023',
    openToJoin: true,
    description:
      'Crafting beautiful UIs and pixel-perfect experiences. React, Vue, design systems — we do it all.',
    weeklyXP: 9800,
    tags: ['React', 'Vue', 'TypeScript', 'CSS'],
    language: 'TypeScript',
    quests: [
      {
        label: 'Win 30 JS battles',
        progress: 22,
        total: 30,
        reward: '3,000 XP',
      },
      { label: 'Top 3 this week', progress: 2, total: 3, reward: '4,000 XP' },
    ],
    memberAvatars: ['P', 'A', 'L', 'M', 'E'],
  },
  {
    id: '3',
    name: 'Data Dragons',
    members: 560,
    maxMembers: 750,
    level: 28,
    xp: 41000,
    xpNext: 55000,
    type: 'Data Science',
    color: '#4ade80',
    rank: 3,
    winRate: 61,
    founded: '2024',
    openToJoin: false,
    description:
      'Python wizards and ML practitioners. We train models, crunch datasets, and dominate analytics challenges.',
    weeklyXP: 7200,
    tags: ['Python', 'PyTorch', 'Pandas', 'SQL'],
    language: 'Python',
    quests: [
      {
        label: 'Submit 20 Python solutions',
        progress: 14,
        total: 20,
        reward: '2,000 XP',
      },
    ],
    memberAvatars: ['D', 'N', 'C', 'T'],
  },
  {
    id: '4',
    name: 'Kernel Panic',
    members: 430,
    maxMembers: 600,
    level: 31,
    xp: 51000,
    xpNext: 60000,
    type: 'DevOps',
    color: '#38bdf8',
    rank: 4,
    winRate: 65,
    founded: '2024',
    openToJoin: true,
    description:
      'Infra warriors who live in the terminal. Docker, K8s, CI/CD pipelines are our battleground.',
    weeklyXP: 6100,
    tags: ['Docker', 'Kubernetes', 'Terraform', 'AWS'],
    language: 'Bash / YAML',
    quests: [
      {
        label: 'Complete 15 system challenges',
        progress: 9,
        total: 15,
        reward: '3,500 XP',
      },
      {
        label: 'Guild tournament top 10',
        progress: 0,
        total: 1,
        reward: '8,000 XP',
      },
    ],
    memberAvatars: ['K', 'J', 'O', 'F', 'H'],
  },
  {
    id: '5',
    name: 'Shadow Protocol',
    members: 310,
    maxMembers: 400,
    level: 24,
    xp: 29000,
    xpNext: 40000,
    type: 'Security',
    color: '#f472b6',
    rank: 5,
    winRate: 58,
    founded: '2024',
    openToJoin: true,
    description:
      'CTF champions and ethical hackers. We find vulnerabilities before the bad guys do.',
    weeklyXP: 5300,
    tags: ['CTF', 'Pentesting', 'Cryptography', 'Rust'],
    language: 'Python / Rust',
    quests: [
      {
        label: 'Solve 10 security puzzles',
        progress: 6,
        total: 10,
        reward: '4,000 XP',
      },
    ],
    memberAvatars: ['S', 'X', 'Z', 'Q'],
  },
  {
    id: '6',
    name: 'Swift Nomads',
    members: 275,
    maxMembers: 350,
    level: 19,
    xp: 18000,
    xpNext: 28000,
    type: 'Mobile',
    color: '#fb923c',
    rank: 6,
    winRate: 55,
    founded: '2024',
    openToJoin: false,
    description:
      'iOS and Android artisans. Building mobile-first, performance-obsessed native experiences.',
    weeklyXP: 4100,
    tags: ['Swift', 'Kotlin', 'React Native', 'Flutter'],
    language: 'Swift / Kotlin',
    quests: [
      {
        label: 'Win 20 mobile battles',
        progress: 11,
        total: 20,
        reward: '2,500 XP',
      },
    ],
    memberAvatars: ['W', 'I', 'R', 'Y'],
  },
  {
    id: '7',
    name: 'Iron Servers',
    members: 720,
    maxMembers: 900,
    level: 38,
    xp: 74000,
    xpNext: 90000,
    type: 'Backend',
    color: '#a78bfa',
    rank: 7,
    winRate: 70,
    founded: '2023',
    openToJoin: true,
    description:
      'Scalability-first engineers. Microservices, event-driven architecture, and low-latency APIs.',
    weeklyXP: 10200,
    tags: ['Java', 'Kafka', 'Spring Boot', 'MongoDB'],
    language: 'Java / Kotlin',
    quests: [
      {
        label: 'Deploy 5 microservices',
        progress: 3,
        total: 5,
        reward: '3,500 XP',
      },
      {
        label: 'Achieve 99.9% uptime',
        progress: 1,
        total: 1,
        reward: '6,000 XP',
      },
    ],
    memberAvatars: ['I', 'R', 'O', 'N', 'S'],
  },
  {
    id: '8',
    name: 'Cascade Guild',
    members: 410,
    maxMembers: 600,
    level: 27,
    xp: 38000,
    xpNext: 52000,
    type: 'Frontend',
    color: '#ff7e5f',
    rank: 8,
    winRate: 63,
    founded: '2024',
    openToJoin: true,
    description:
      'CSS masters, animation specialists, and accessibility advocates building the web of tomorrow.',
    weeklyXP: 6800,
    tags: ['CSS', 'Svelte', 'GSAP', 'WebGL'],
    language: 'JavaScript / CSS',
    quests: [
      {
        label: 'Build 5 animated components',
        progress: 4,
        total: 5,
        reward: '2,000 XP',
      },
    ],
    memberAvatars: ['C', 'A', 'S', 'C'],
  },
  {
    id: '9',
    name: 'Neural Nomads',
    members: 340,
    maxMembers: 500,
    level: 22,
    xp: 24000,
    xpNext: 35000,
    type: 'Data Science',
    color: '#4ade80',
    rank: 9,
    winRate: 57,
    founded: '2024',
    openToJoin: true,
    description:
      'Deep learning researchers and NLP practitioners pushing state-of-the-art on every dataset.',
    weeklyXP: 5600,
    tags: ['TensorFlow', 'NLP', 'HuggingFace', 'Jupyter'],
    language: 'Python',
    quests: [
      {
        label: 'Train 3 production models',
        progress: 1,
        total: 3,
        reward: '5,000 XP',
      },
    ],
    memberAvatars: ['N', 'E', 'U', 'R'],
  },
  {
    id: '10',
    name: 'Cloud Riders',
    members: 285,
    maxMembers: 400,
    level: 25,
    xp: 32000,
    xpNext: 44000,
    type: 'DevOps',
    color: '#38bdf8',
    rank: 10,
    winRate: 60,
    founded: '2024',
    openToJoin: false,
    description:
      'Multi-cloud architects and SRE veterans. Zero-downtime deployments are our standard.',
    weeklyXP: 4800,
    tags: ['GCP', 'Ansible', 'Helm', 'Prometheus'],
    language: 'Python / HCL',
    quests: [
      {
        label: 'Set up 3 monitoring stacks',
        progress: 2,
        total: 3,
        reward: '4,500 XP',
      },
    ],
    memberAvatars: ['C', 'L', 'O', 'U', 'D'],
  },
  {
    id: '11',
    name: 'Red Team Zero',
    members: 195,
    maxMembers: 250,
    level: 20,
    xp: 20000,
    xpNext: 30000,
    type: 'Security',
    color: '#f472b6',
    rank: 11,
    winRate: 54,
    founded: '2024',
    openToJoin: true,
    description:
      'Offensive security specialists. Binary exploitation, malware analysis, and red team ops.',
    weeklyXP: 3900,
    tags: ['Reverse Engineering', 'Assembly', 'GDB', 'Binary Exploit'],
    language: 'C / Python',
    quests: [
      {
        label: 'Complete 5 binary exploits',
        progress: 2,
        total: 5,
        reward: '6,000 XP',
      },
    ],
    memberAvatars: ['R', 'T', 'Z', 'E'],
  },
  {
    id: '12',
    name: 'Flutterflies',
    members: 180,
    maxMembers: 250,
    level: 16,
    xp: 13000,
    xpNext: 20000,
    type: 'Mobile',
    color: '#fb923c',
    rank: 12,
    winRate: 50,
    founded: '2025',
    openToJoin: true,
    description:
      'Cross-platform mobile enthusiasts. One codebase, beautiful experiences on every device.',
    weeklyXP: 2800,
    tags: ['Flutter', 'Dart', 'Firebase', 'GetX'],
    language: 'Dart',
    quests: [
      {
        label: 'Publish 2 Flutter apps',
        progress: 1,
        total: 2,
        reward: '4,000 XP',
      },
    ],
    memberAvatars: ['F', 'L', 'T', 'R'],
  },
];
