import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';

export default function Pricing() {
  const language = useSettingsStore((s) => s.language);
  const text =
    language === 'vi'
      ? {
          titleA: 'Giá đơn giản,',
          titleB: 'minh bạch',
          subtitle:
            'Đầu tư cho hành trình nâng cấp kỹ năng. Chọn gói phù hợp với bạn.',
          novice: 'Tân binh',
          pro: 'Chiến binh Pro',
          guild: 'Thủ lĩnh Guild',
          month: '/tháng',
          user: '/người dùng',
          basicQuests: 'Nhiệm vụ cơ bản',
          communityForum: 'Diễn đàn cộng đồng',
          premiumCourses: 'Khoá học cao cấp',
          startFree: 'Bắt đầu miễn phí',
          mostPopular: 'PHỔ BIẾN NHẤT',
          allBasic: 'Toàn bộ tính năng cơ bản',
          premiumPaths: 'Khoá học và lộ trình cao cấp',
          arenaAccess: 'Quyền vào Arena nâng cao',
          prioritySupport: 'Hỗ trợ ưu tiên',
          goPro: 'Nâng cấp Pro',
          everythingInPro: 'Bao gồm mọi thứ của Pro',
          guildManagement: 'Quản lý Guild',
          analytics: 'Phân tích tuỳ chỉnh',
          contactSales: 'Liên hệ tư vấn',
        }
      : {
          titleA: 'Simple, Transparent',
          titleB: 'Pricing',
          subtitle:
            'Invest in your mastery. Choose the path that fits your journey.',
          novice: 'Novice',
          pro: 'Pro Warrior',
          guild: 'Guild Master',
          month: '/mo',
          user: '/user',
          basicQuests: 'Basic Quests',
          communityForum: 'Community Forum',
          premiumCourses: 'Premium Courses',
          startFree: 'Start Free',
          mostPopular: 'MOST POPULAR',
          allBasic: 'All Basic Features',
          premiumPaths: 'Premium Courses & Paths',
          arenaAccess: 'Advanced Arena Access',
          prioritySupport: 'Priority Support',
          goPro: 'Go Pro',
          everythingInPro: 'Everything in Pro',
          guildManagement: 'Guild Management',
          analytics: 'Custom Analytics',
          contactSales: 'Contact Sales',
        };
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#a78bfa 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-8 py-20 space-y-16">
          <div className="text-center space-y-4 animate-fade-in-up">
            <h1 className="font-['Lexend'] text-5xl font-bold tracking-tight">
              {text.titleA} <span className="gradient-text-green">{text.titleB}</span>
            </h1>
            <p className="text-[color:var(--cg-text-muted)]">
              {text.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in-up delay-100 items-center">
            {/* Free */}
            <div className="glass-card p-8 space-y-6 opacity-90 hover:opacity-100 transition-opacity">
              <h3 className="text-xl font-bold">{text.novice}</h3>
              <div className="text-4xl font-black">
                $0
                <span className="text-sm font-normal text-[color:var(--cg-text-muted)]">
                  {text.month}
                </span>
              </div>
              <ul className="space-y-4 text-sm text-[color:var(--cg-text-muted)]">
                <li className="flex gap-2 items-center">
                  <span className="material-symbols-outlined text-[18px] text-[#4ade80]">
                    check_circle
                  </span>{' '}
                  {text.basicQuests}
                </li>
                <li className="flex gap-2 items-center">
                  <span className="material-symbols-outlined text-[18px] text-[#4ade80]">
                    check_circle
                  </span>{' '}
                  {text.communityForum}
                </li>
                <li className="flex gap-2 items-center opacity-40">
                  <span className="material-symbols-outlined text-[18px]">
                    cancel
                  </span>{' '}
                  {text.premiumCourses}
                </li>
              </ul>
              <button className="w-full rounded-xl border border-[color:var(--cg-border)] py-3 font-bold hover:bg-[color:var(--cg-container-a30)] transition-colors">
                {text.startFree}
              </button>
            </div>

            {/* Pro */}
            <div className="relative p-1 rounded-2xl bg-gradient-to-b from-[#ff7e5f] to-[#a78bfa] animate-glow-ring transform md:-translate-y-4 shadow-2xl z-10">
              <div className="bg-[#181445] rounded-xl p-8 space-y-6 h-full">
                <div className="absolute top-0 right-6 -translate-y-1/2 badge-amber bg-[#fbbf24] text-[#0f0b3c] border-0">
                  {text.mostPopular}
                </div>
                <h3 className="text-2xl font-bold text-[#ff7e5f]">
                  {text.pro}
                </h3>
                <div className="text-5xl font-black">
                  $19
                  <span className="text-sm font-normal text-[color:var(--cg-text-muted)]">
                    {text.month}
                  </span>
                </div>
                <ul className="space-y-4 text-sm text-[color:var(--cg-text-muted)] font-medium">
                  <li className="flex gap-2 items-center text-[color:var(--cg-text)]">
                    <span className="material-symbols-outlined text-[18px] text-[#ff7e5f]">
                      check_circle
                    </span>{' '}
                    {text.allBasic}
                  </li>
                  <li className="flex gap-2 items-center text-[color:var(--cg-text)]">
                    <span className="material-symbols-outlined text-[18px] text-[#ff7e5f]">
                      check_circle
                    </span>{' '}
                    {text.premiumPaths}
                  </li>
                  <li className="flex gap-2 items-center text-[color:var(--cg-text)]">
                    <span className="material-symbols-outlined text-[18px] text-[#ff7e5f]">
                      check_circle
                    </span>{' '}
                    {text.arenaAccess}
                  </li>
                  <li className="flex gap-2 items-center text-[color:var(--cg-text)]">
                    <span className="material-symbols-outlined text-[18px] text-[#ff7e5f]">
                      check_circle
                    </span>{' '}
                    {text.prioritySupport}
                  </li>
                </ul>
                <button className="w-full neon-btn py-4 text-lg">{text.goPro}</button>
              </div>
            </div>

            {/* Team */}
            <div className="glass-card p-8 space-y-6 opacity-90 hover:opacity-100 transition-opacity">
              <h3 className="text-xl font-bold">{text.guild}</h3>
              <div className="text-4xl font-black">
                $49
                <span className="text-sm font-normal text-[color:var(--cg-text-muted)]">
                  {text.user}
                </span>
              </div>
              <ul className="space-y-4 text-sm text-[color:var(--cg-text-muted)]">
                <li className="flex gap-2 items-center">
                  <span className="material-symbols-outlined text-[18px] text-[#4ade80]">
                    check_circle
                  </span>{' '}
                  {text.everythingInPro}
                </li>
                <li className="flex gap-2 items-center">
                  <span className="material-symbols-outlined text-[18px] text-[#4ade80]">
                    check_circle
                  </span>{' '}
                  {text.guildManagement}
                </li>
                <li className="flex gap-2 items-center">
                  <span className="material-symbols-outlined text-[18px] text-[#4ade80]">
                    check_circle
                  </span>{' '}
                  {text.analytics}
                </li>
              </ul>
              <button className="w-full rounded-xl border border-[color:var(--cg-border)] py-3 font-bold hover:bg-[color:var(--cg-container-a30)] transition-colors">
                {text.contactSales}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
