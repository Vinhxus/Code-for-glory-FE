import type { Event } from './event.type';

function nextSunday(): Date {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? 7 : 7 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

export const EVENTS: Event[] = [
  {
    id: 1,
    title: 'Global Hackathon 2026',
    date: 'Oct 15 - Oct 17',
    target: new Date('2026-10-15T00:00:00'),
    type: 'Competition',
    reward: '100,000 XP',
    status: 'Registration Open',
    color: 'coral',
    desc: "The world's largest online coding competition. Build a full-stack AI-powered product in 48 hours and compete against 10,000+ developers from 80+ countries.",
    participants: 9840,
    maxParticipants: 12000,
    duration: '48 hours',
    tags: ['Full-stack', 'AI/ML', 'Open to all levels'],
    prizes: [
      { icon: 'workspace_premium', name: '1st Place', value: '50,000 XP + Lifetime Pro', color: '#fbbf24' },
      { icon: 'military_tech', name: '2nd Place', value: '30,000 XP + 1yr Pro', color: '#94a3b8' },
      { icon: 'emoji_events', name: '3rd Place', value: '20,000 XP + 6mo Pro', color: '#b45309' },
    ],
  },
  {
    id: 2,
    title: 'System Design Masterclass',
    date: 'Oct 22, 10:00 AM',
    target: new Date('2026-10-22T10:00:00'),
    type: 'Webinar',
    reward: 'Exclusive Badge',
    status: 'Upcoming',
    color: 'purple',
    desc: 'A 3-hour deep-dive hosted by senior engineers from Google and Meta. Learn how to design scalable distributed systems used by billions of users.',
    participants: 1420,
    maxParticipants: 2000,
    duration: '3 hours',
    tags: ['System Design', 'Backend', 'Intermediate+'],
    prizes: [
      { icon: 'workspace_premium', name: 'Attendance', value: 'Verified Badge', color: '#a78bfa' },
      { icon: 'star', name: 'Top Q&A', value: '5,000 XP Bonus', color: '#60a5fa' },
    ],
  },
  {
    id: 3,
    title: 'Algorithm Weekly Challenge',
    date: 'Every Sunday',
    target: nextSunday(),
    type: 'Challenge',
    reward: '5,000 XP',
    status: 'Ongoing',
    color: 'amber',
    desc: 'Every Sunday a new set of algorithmic puzzles drops — ranging from greedy to dynamic programming. Climb the weekly leaderboard and earn XP streaks.',
    participants: 3260,
    maxParticipants: null,
    duration: '24 hours',
    tags: ['Algorithms', 'Competitive', 'Weekly'],
    prizes: [
      { icon: 'workspace_premium', name: 'Weekly #1', value: '5,000 XP', color: '#fbbf24' },
      { icon: 'local_fire_department', name: 'Streak (4w)', value: '10,000 XP', color: '#f97316' },
    ],
  },
  {
    id: 4,
    title: 'AI/ML Sprint Challenge',
    date: 'Nov 3 - Nov 5',
    target: new Date('2026-11-03T00:00:00'),
    type: 'Competition',
    reward: '30,000 XP',
    status: 'Registration Open',
    color: 'coral',
    desc: 'Build and deploy a machine learning model in 48 hours using any dataset. Judged on accuracy, creativity, and code quality by a panel of ML researchers.',
    participants: 2100,
    maxParticipants: 5000,
    duration: '48 hours',
    tags: ['Machine Learning', 'Python', 'Open to all'],
    prizes: [
      { icon: 'workspace_premium', name: '1st Place', value: '15,000 XP + Certificate', color: '#fbbf24' },
      { icon: 'military_tech', name: '2nd Place', value: '10,000 XP', color: '#94a3b8' },
      { icon: 'emoji_events', name: '3rd Place', value: '5,000 XP', color: '#b45309' },
    ],
  },
];
