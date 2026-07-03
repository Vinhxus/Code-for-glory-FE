// ─── guildData.ts ─────────────────────────────────────────────────────────────
// Cấu hình hiển thị dùng chung cho Guild pages.

import type { GuildCard, GuildType as ApiGuildType } from '../services/guildsApi';

export type Guild = GuildCard;
export type Quest = GuildCard['quests'][number];
export type GuildType = ApiGuildType;

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
