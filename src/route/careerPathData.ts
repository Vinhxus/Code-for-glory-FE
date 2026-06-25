export type CareerTrack = 'frontend' | 'backend';
export type CareerLevel = 'beginner' | 'intermediate' | 'advanced';

export type CareerPathNodeMeta = {
  id: string;
  title: string;
  level: CareerLevel;
  /** External resources (roadmap.sh or other official pages) */
  links: Array<{ label: string; url: string }>;
};

const FRONTEND_NODES: CareerPathNodeMeta[] = [
  {
    id: 'internet',
    title: 'Internet',
    level: 'beginner',
    links: [{ label: 'Frontend Roadmap', url: 'https://roadmap.sh/frontend' }],
  },
  { id: 'html', title: 'HTML', level: 'beginner', links: [{ label: 'HTML', url: 'https://roadmap.sh/html' }] },
  { id: 'css', title: 'CSS', level: 'beginner', links: [{ label: 'CSS', url: 'https://roadmap.sh/css' }] },
  { id: 'javascript', title: 'JavaScript', level: 'beginner', links: [{ label: 'JavaScript', url: 'https://roadmap.sh/javascript' }] },
  { id: 'version-control', title: 'Version Control', level: 'intermediate', links: [{ label: 'Git & GitHub', url: 'https://roadmap.sh/git-github' }] },
  { id: 'package-managers', title: 'Package Managers', level: 'intermediate', links: [{ label: 'Frontend Roadmap', url: 'https://roadmap.sh/frontend' }] },
  { id: 'frameworks', title: 'Learn a Framework', level: 'intermediate', links: [{ label: 'React', url: 'https://roadmap.sh/react' }] },
  { id: 'css-frameworks', title: 'CSS Frameworks', level: 'intermediate', links: [{ label: 'Tailwind CSS', url: 'https://roadmap.sh/tailwindcss' }] },
  { id: 'bundlers', title: 'Module Bundlers', level: 'advanced', links: [{ label: 'Frontend Roadmap', url: 'https://roadmap.sh/frontend' }] },
  { id: 'linters', title: 'Linters & Formatters', level: 'advanced', links: [{ label: 'Frontend Roadmap', url: 'https://roadmap.sh/frontend' }] },
  { id: 'testing', title: 'Testing', level: 'advanced', links: [{ label: 'Frontend Roadmap', url: 'https://roadmap.sh/frontend' }] },
  { id: 'web-apis', title: 'Web APIs', level: 'advanced', links: [{ label: 'Frontend Roadmap', url: 'https://roadmap.sh/frontend' }] },
  { id: 'web-security', title: 'Web Security', level: 'advanced', links: [{ label: 'API Security Best Practices', url: 'https://roadmap.sh/api-security-best-practices' }] },
  { id: 'accessibility', title: 'Accessibility', level: 'advanced', links: [{ label: 'Frontend Roadmap', url: 'https://roadmap.sh/frontend' }] },
  { id: 'graphql', title: 'GraphQL', level: 'advanced', links: [{ label: 'GraphQL', url: 'https://roadmap.sh/graphql' }] },
  { id: 'typescript', title: 'TypeScript', level: 'intermediate', links: [{ label: 'TypeScript', url: 'https://roadmap.sh/typescript' }] },
  { id: 'react-native', title: 'React Native', level: 'advanced', links: [{ label: 'React Native', url: 'https://roadmap.sh/react-native' }] },
  { id: 'flutter', title: 'Flutter', level: 'advanced', links: [{ label: 'Flutter', url: 'https://roadmap.sh/flutter' }] },
  { id: 'nodejs', title: 'Node.js', level: 'advanced', links: [{ label: 'Node.js', url: 'https://roadmap.sh/nodejs' }] },
];

const BACKEND_NODES: CareerPathNodeMeta[] = [
  { id: 'introduction', title: 'Introduction', level: 'beginner', links: [{ label: 'Backend Roadmap', url: 'https://roadmap.sh/backend' }] },
  { id: 'frontend-basics', title: 'Frontend Basics', level: 'beginner', links: [{ label: 'Frontend Roadmap', url: 'https://roadmap.sh/frontend' }] },
  { id: 'vcs', title: 'Version Control Systems', level: 'beginner', links: [{ label: 'Git & GitHub', url: 'https://roadmap.sh/git-github' }] },
  { id: 'databases', title: 'Relational Databases', level: 'intermediate', links: [{ label: 'SQL', url: 'https://roadmap.sh/sql' }] },
  { id: 'apis', title: 'Learn about APIs', level: 'intermediate', links: [{ label: 'API Design', url: 'https://roadmap.sh/api-design' }] },
  { id: 'auth', title: 'Authentication', level: 'intermediate', links: [{ label: 'Backend Roadmap', url: 'https://roadmap.sh/backend' }] },
  { id: 'caching', title: 'Caching', level: 'intermediate', links: [{ label: 'Redis', url: 'https://roadmap.sh/redis' }] },
  { id: 'containers', title: 'Containers', level: 'advanced', links: [{ label: 'Docker', url: 'https://roadmap.sh/docker' }] },
  { id: 'kubernetes', title: 'Kubernetes', level: 'advanced', links: [{ label: 'Kubernetes', url: 'https://roadmap.sh/kubernetes' }] },
  { id: 'message-brokers', title: 'Message Brokers', level: 'advanced', links: [{ label: 'Backend Roadmap', url: 'https://roadmap.sh/backend' }] },
  { id: 'system-design', title: 'System Design', level: 'advanced', links: [{ label: 'System Design', url: 'https://roadmap.sh/system-design' }] },
];

const TRACKS: Record<CareerTrack, CareerPathNodeMeta[]> = {
  frontend: FRONTEND_NODES,
  backend: BACKEND_NODES,
};

export function getCareerPathNodeMeta(
  track: CareerTrack,
  nodeId: string
): CareerPathNodeMeta | null {
  return TRACKS[track].find((n) => n.id === nodeId) ?? null;
}

export function listCareerPathNodes(track: CareerTrack): CareerPathNodeMeta[] {
  return TRACKS[track];
}

