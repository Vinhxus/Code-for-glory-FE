import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';

export default function Network() {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';
  const text = isVi
    ? {
        titleA: 'Mạng lưới',
        titleB: 'người học',
        subtitle:
          'Bạn không học một mình. Hãy tham gia hệ sinh thái toàn cầu nơi người mới và người có kinh nghiệm cùng luyện tập, review code và phát triển.',
        countries: '120+ quốc gia',
        countriesDesc:
          'Kết nối với người học trên khắp thế giới, chia sẻ góc nhìn và văn hoá code đa dạng.',
        students: '500K+ học viên',
        studentsDesc:
          'Một cộng đồng lớn, năng động với rất nhiều người mới đang bắt đầu hành trình coding như bạn.',
        answers: 'Hàng triệu câu trả lời',
        answersDesc:
          'Không bị kẹt quá lâu. Diễn đàn và mạng lưới Q&A luôn sẵn sàng với lời giải chi tiết cho lỗi web dev.',
      }
    : {
        titleA: 'Global',
        titleB: 'Learner Network',
        subtitle:
          'You are not learning alone. Join a worldwide ecosystem of beginners and experts helping each other master web development. Our global network connects you with peers to practice, review code, and grow together.',
        countries: '120+ Countries',
        countriesDesc:
          'Connect with learners from all over the world, sharing diverse perspectives and coding cultures.',
        students: '500K+ Students',
        studentsDesc:
          'A massive, active community of beginners starting their coding journey just like you.',
        answers: 'Millions of Answers',
        answersDesc:
          'Never get stuck for long. Our active forum and Q&A network provides detailed solutions for every web dev bug.',
      };
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#4ade80 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-8 py-16 animate-fade-in-up space-y-16">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="font-['Lexend'] text-5xl font-bold tracking-tight">
              {text.titleA} <span className="gradient-text-green">{text.titleB}</span>
            </h1>
            <p className="text-lg text-[color:var(--cg-text-muted)] leading-relaxed">
              {text.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#4ade80] bg-opacity-20 flex items-center justify-center mx-auto text-[#4ade80]">
                <span className="material-symbols-outlined text-[32px]">
                  public
                </span>
              </div>
              <h3 className="text-2xl font-bold">{text.countries}</h3>
              <p className="text-sm text-[color:var(--cg-text-muted)]">
                {text.countriesDesc}
              </p>
            </div>
            <div className="glass-card p-8 text-center space-y-4 relative overflow-hidden transform md:-translate-y-4 shadow-2xl border-[#ff7e5f]/30">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2 bg-[#ff7e5f] blur-2xl" />
              <div className="w-16 h-16 rounded-full bg-[#ff7e5f] bg-opacity-20 flex items-center justify-center mx-auto text-[#ff7e5f]">
                <span className="material-symbols-outlined text-[32px]">
                  school
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#ff7e5f]">
                {text.students}
              </h3>
              <p className="text-sm text-[color:var(--cg-text-muted)]">
                {text.studentsDesc}
              </p>
            </div>
            <div className="glass-card p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#a78bfa] bg-opacity-20 flex items-center justify-center mx-auto text-[#a78bfa]">
                <span className="material-symbols-outlined text-[32px]">
                  forum
                </span>
              </div>
              <h3 className="text-2xl font-bold">{text.answers}</h3>
              <p className="text-sm text-[color:var(--cg-text-muted)]">
                {text.answersDesc}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
