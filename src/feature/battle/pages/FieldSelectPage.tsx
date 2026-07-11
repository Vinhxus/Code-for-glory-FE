import { useNavigate } from 'react-router-dom';
import { useBattleStore } from '../store/battleStore';
import FieldCard from '../components/FieldCard';
import type { BattleField } from '../types/battle.types';
import { BATTLE_ROUTES } from '../constants/battle.constants';
import SideNav from '../../../components/SideNav';
import Header from '../../../components/layout/Header';

const FIELDS: {
  value: BattleField;
  icon: string;
  title: string;
  description: string;
  tags: string[];
  badge?: string;
}[] = [
  {
    value: 'FE',
    icon: '🖥️',
    title: 'Frontend Arena',
    description:
      'Battle với UI engineering, React patterns, accessibility, rendering, và browser behavior.',
    tags: ['React', 'TypeScript', 'A11y'],
  },
  {
    value: 'BE',
    icon: '⚙️',
    title: 'Backend Arena',
    description:
      'Tập trung vào API design, database, caching, queue, reliability và system trade-offs.',
    tags: ['NestJS', 'SQL', 'Caching'],
    badge: 'Hot',
  },
  {
    value: 'CORE',
    icon: '🧠',
    title: 'Core Knowledge',
    description:
      'Luyện DSA, debugging, HTTP, testing, security và tư duy kỹ thuật nền cho mọi hướng đi.',
    tags: ['DSA', 'HTTP', 'Testing'],
    badge: 'Recommended',
  },
];

const FieldSelectPage = () => {
  const navigate = useNavigate();
  const setBattleField = useBattleStore((s) => s.setBattleField);

  const handleSelect = (field: BattleField) => {
    setBattleField(field);
    navigate(BATTLE_ROUTES.MODE);
  };

  return (
    <div className="min-h-screen bg-(--cg-bg) text-(--cg-text) select-none overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#a78bfa 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute top-[20%] left-[10%] h-175 w-175 rounded-full bg-(--cg-coral-a18) blur-[160px]" />
        <div className="absolute top-[40%] right-[10%] h-150 w-150 rounded-full bg-(--cg-coral-a14) blur-[140px]" />
      </div>

      <SideNav />
      <div className="relative z-10 md:pl-24">
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-8 py-16 pt-18">
          {/* Badge + Heading */}
          <div className="text-center space-y-4 animate-fade-in-up">
            <div className="badge-coral w-fit mx-auto">
              <span className="material-symbols-outlined text-[14px">
                sports_esports
              </span>
              SELECT BATTLEGROUND
            </div>
            <h1 className="font-['Lexend'] text-4xl font-bold tracking-tight">
              Select Your <span className="gradient-text">Arena Track</span>
            </h1>
            <p className="text-sm text-(--cg-text-muted) max-w-md mx-auto">
              Chọn lane thi đấu phù hợp với định hướng của bạn rồi bước vào
              battle thật.
            </p>
          </div>
          {/* Card  */}
          <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-fade-in-up">
            {FIELDS.map((f) => (
              <FieldCard
                key={f.value}
                icon={f.icon}
                title={f.title}
                description={f.description}
                tags={f.tags}
                badge={f.badge}
                onClick={() => handleSelect(f.value)}
              />
            ))}
          </div>
          <p className="text-xs text-(--cg-text-muted) animate-fade-in-up">
            Matchmaking sẽ tự tìm đối thủ cùng lane và cùng mode.
          </p>
        </main>
      </div>
    </div>
  );
};

export default FieldSelectPage;
