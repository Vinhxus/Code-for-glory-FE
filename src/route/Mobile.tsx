import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';

export default function Mobile() {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';
  const text = isVi
    ? {
        titleA: 'Học Web Dev',
        titleB: 'mọi lúc, mọi nơi.',
        subtitle:
          'Ứng dụng mobile của CodeForGlory giúp người mới luyện code khi đang di chuyển. Bạn có thể xem lại bài học, viết snippet và trao đổi với mentor ngay trên điện thoại.',
        feature1: 'Bài học ngắn gọn',
        feature1Desc:
          'Phù hợp cho người mới. Học HTML, CSS và JS theo từng phần 5 phút khi đang di chuyển.',
        feature2: 'Hỗ trợ cộng đồng tức thì',
        feature2Desc:
          'Nhận thông báo khi mentor trả lời trên forum để không bị kẹt quá lâu.',
        morning: 'Chào buổi sáng',
        coder: 'Coder!',
        streak: 'Chuỗi ngày',
        league: 'Hạng',
        totalXp: 'Tổng XP',
        nextLesson: 'Bài học tiếp theo',
        nextLessonDesc: 'Làm chủ Higher Order Components và custom hooks.',
        resumeLesson: 'Tiếp tục bài học',
        dailyQuests: 'Quest hằng ngày',
        viewAll: 'Xem tất cả',
        quest1: 'Tạo một API Route',
        quest1Desc: 'Hoàn thành 1 bài backend',
        quest2: 'Style một nút phát sáng',
        quest2Desc: 'Tailwind masterclass',
        claim: 'NHẬN',
      }
    : {
        titleA: 'Learn Web Dev',
        titleB: 'Anywhere, Anytime.',
        subtitle:
          'The CodeForGlory mobile app makes it easy for beginners to practice coding on the go. Built with modern cross-platform tech, you can review lessons, write code snippets, and chat with mentors directly from your phone.',
        feature1: 'Bite-sized Lessons',
        feature1Desc:
          'Perfect for beginners. Learn HTML, CSS, and JS in 5-minute interactive chunks while commuting.',
        feature2: 'Instant Community Help',
        feature2Desc:
          'Get push notifications when mentors reply to your forum questions so you never stay stuck.',
        morning: 'Good Morning',
        coder: 'Coder!',
        streak: 'Day Streak',
        league: 'League',
        totalXp: 'Total XP',
        nextLesson: 'Next Lesson',
        nextLessonDesc: 'Master High Order Components and custom hooks.',
        resumeLesson: 'Resume Lesson',
        dailyQuests: 'Daily Quests',
        viewAll: 'View all',
        quest1: 'Build an API Route',
        quest1Desc: 'Complete 1 backend exercise',
        quest2: 'Style a glowing button',
        quest2Desc: 'Tailwind masterclass',
        claim: 'CLAIM',
      };
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#60a5fa 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute -top-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-[#60a5fa] blur-[150px] opacity-20" />
      </div>
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-6xl mx-auto px-8 py-16 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h1 className="font-['Lexend'] text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                {text.titleA} <br />{' '}
                <span className="text-[#60a5fa]">{text.titleB}</span>
              </h1>
              <p className="text-lg text-[color:var(--cg-text-muted)] leading-relaxed max-w-lg">
                {text.subtitle}
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#60a5fa]/20 flex items-center justify-center text-[#60a5fa] shrink-0">
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{text.feature1}</h3>
                    <p className="text-sm text-[color:var(--cg-text-muted)]">
                      {text.feature1Desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#4ade80]/20 flex items-center justify-center text-[#4ade80] shrink-0">
                    <span className="material-symbols-outlined">
                      notifications_active
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base">
                      {text.feature2}
                    </h3>
                    <p className="text-sm text-[color:var(--cg-text-muted)]">
                      {text.feature2Desc}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-6">
                {/* App Store Button */}
                <button className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-black hover:scale-[1.02] transition-transform text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.4)] border border-[#333]">
                  <svg viewBox="0 0 384 512" className="w-8 h-8 fill-white">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  <div className="text-left flex flex-col justify-center">
                    <span className="text-[10px] leading-none font-medium opacity-90 mb-1">
                      Download on the
                    </span>
                    <span className="text-[19px] leading-none font-semibold tracking-tight">
                      App Store
                    </span>
                  </div>
                </button>

                {/* Google Play Button */}
                <button className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-black hover:scale-[1.02] transition-transform text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.4)] border border-[#333]">
                  <svg viewBox="0 0 512 512" className="w-7 h-7">
                    <path
                      fill="#00A6FF"
                      d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"
                    />
                    <path
                      fill="#28B446"
                      d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"
                    />
                    <path
                      fill="#FFC800"
                      d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"
                    />
                    <path
                      fill="#F03355"
                      d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z"
                    />
                  </svg>
                  <div className="text-left flex flex-col justify-center">
                    <span className="text-[10px] leading-none font-medium opacity-90 uppercase tracking-wide mb-1">
                      GET IT ON
                    </span>
                    <span className="text-[19px] leading-none font-semibold tracking-tight">
                      Google Play
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative flex justify-center py-10">
              {/* iPhone 16 Mockup */}
              <div className="relative w-[320px] h-[650px] rounded-[55px] bg-[#111] p-[8px] shadow-[0_0_100px_rgba(96,165,250,0.3)] flex flex-col z-10 transition-transform duration-700 hover:scale-[1.02]">
                {/* Hardware Buttons */}
                <div className="absolute left-[-3px] top-[120px] w-[3px] h-[26px] bg-[#333] rounded-l-md shadow-inner"></div>
                <div className="absolute left-[-3px] top-[165px] w-[3px] h-[55px] bg-[#333] rounded-l-md shadow-inner"></div>
                <div className="absolute left-[-3px] top-[235px] w-[3px] h-[55px] bg-[#333] rounded-l-md shadow-inner"></div>
                <div className="absolute right-[-3px] top-[180px] w-[3px] h-[80px] bg-[#333] rounded-r-md shadow-inner"></div>
                <div className="absolute right-[-3px] top-[340px] w-[3px] h-[40px] bg-[#333] rounded-r-md shadow-inner"></div>

                {/* Screen */}
                <div className="relative w-full h-full rounded-[47px] bg-[color:var(--cg-bg)] overflow-hidden flex flex-col border border-gray-800">
                  {/* Dynamic Island */}
                  <div className="absolute top-[12px] inset-x-0 mx-auto w-[110px] h-[32px] bg-black rounded-full z-30 flex items-center justify-between px-3 shadow-lg border border-[#1a1a1a]">
                    <div className="flex gap-2 items-center">
                      <div className="w-[12px] h-[12px] rounded-full bg-[#0a0a0a] border border-[#222]"></div>
                    </div>
                    <div className="w-[6px] h-[6px] rounded-full bg-[#4ade80] opacity-80 blur-[1px]"></div>
                  </div>

                  <div className="p-5 pt-14 space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-20">
                    {/* Header with Logo */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src="/component_2_2x.png"
                          alt="CodeForGlory Logo"
                          className="w-9 h-9 object-contain drop-shadow-md"
                        />
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                            {text.morning}
                          </p>
                          <h2 className="font-['Lexend'] text-lg font-bold leading-none text-white">
                            {text.coder}
                          </h2>
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#60a5fa] to-[#a78bfa] p-[2px] shadow-lg">
                        <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center overflow-hidden">
                          <span className="material-symbols-outlined text-gray-300 text-[18px]">
                            person
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Gamified Stats / Streak */}
                    <div className="flex justify-between items-center bg-[#151515] p-3 rounded-2xl border border-[#2a2a2a] shadow-inner">
                      <div className="flex flex-col items-center flex-1">
                        <div className="flex items-center gap-1 text-[#ff7e5f]">
                          <span
                            className="material-symbols-outlined text-[16px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            local_fire_department
                          </span>
                          <span className="font-bold text-sm">12</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-medium uppercase mt-0.5">
                          {text.streak}
                        </span>
                      </div>
                      <div className="w-[1px] h-6 bg-[#2a2a2a]"></div>
                      <div className="flex flex-col items-center flex-1">
                        <div className="flex items-center gap-1 text-[#f89820]">
                          <span
                            className="material-symbols-outlined text-[16px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            military_tech
                          </span>
                          <span className="font-bold text-sm">Gold</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-medium uppercase mt-0.5">
                          {text.league}
                        </span>
                      </div>
                      <div className="w-[1px] h-6 bg-[#2a2a2a]"></div>
                      <div className="flex flex-col items-center flex-1">
                        <div className="flex items-center gap-1 text-[#60a5fa]">
                          <span
                            className="material-symbols-outlined text-[16px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            stars
                          </span>
                          <span className="font-bold text-sm">4.2k</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-medium uppercase mt-0.5">
                          {text.totalXp}
                        </span>
                      </div>
                    </div>

                    {/* Next Lesson Card */}
                    <div className="p-4 rounded-3xl bg-gradient-to-b from-[#211d4d] to-[#120f2e] relative overflow-hidden border border-[#393375] shadow-[0_10px_25px_rgba(0,0,0,0.5)] group cursor-pointer">
                      <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#60a5fa] opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-[#60a5fa] bg-[#60a5fa]/10 px-2 py-1 rounded-md border border-[#60a5fa]/20">
                          {text.nextLesson}
                        </div>
                        <span className="text-[11px] font-bold text-white/60">
                          75%
                        </span>
                      </div>
                      <h3 className="font-['Lexend'] font-bold text-[17px] mb-1.5 leading-tight relative z-10 text-white">
                        Advanced React Patterns
                      </h3>
                      <p className="text-[11px] text-gray-400 mb-4 relative z-10 line-clamp-1">
                        {text.nextLessonDesc}
                      </p>

                      <div className="w-full h-1.5 bg-[#0a081a] rounded-full mb-4 overflow-hidden relative z-10 border border-[#2a2a2a]">
                        <div className="h-full bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] w-[75%] rounded-full shadow-[0_0_10px_rgba(96,165,250,0.6)]"></div>
                      </div>

                      <button className="w-full py-2.5 bg-white text-[#120f2e] rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] transition-transform flex justify-center items-center gap-2 relative z-10">
                        {text.resumeLesson}
                        <span className="material-symbols-outlined text-[16px] fill-current">
                          play_circle
                        </span>
                      </button>
                    </div>

                    {/* Daily Quests */}
                    <div className="space-y-3 pb-2">
                      <div className="flex justify-between items-end">
                        <h3 className="font-['Lexend'] font-bold text-sm text-white">
                          {text.dailyQuests}
                        </h3>
                        <span className="text-[9px] text-[#60a5fa] font-bold uppercase tracking-wider cursor-pointer hover:text-white transition-colors">
                          {text.viewAll}
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        <div className="p-3 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] flex justify-between items-center transition-colors hover:border-gray-600 cursor-pointer shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center text-[#4ade80] shadow-inner">
                              <span className="material-symbols-outlined text-[16px]">
                                code
                              </span>
                            </div>
                            <div>
                              <span className="text-[12px] font-bold block mb-0.5 text-white">
                                {text.quest1}
                              </span>
                              <span className="text-[9px] text-gray-500 block">
                                {text.quest1Desc}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[10px] font-bold text-[#4ade80]">
                              +50 XP
                            </span>
                            <div className="w-10 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                              <div className="h-full bg-[#4ade80] w-[30%]"></div>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl border border-[#a78bfa]/30 bg-[#a78bfa]/10 flex justify-between items-center opacity-80 cursor-pointer hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#a78bfa]/20 border border-[#a78bfa]/40 flex items-center justify-center text-[#a78bfa]">
                              <span className="material-symbols-outlined text-[16px]">
                                done_all
                              </span>
                            </div>
                            <div>
                              <span className="text-[12px] font-bold block mb-0.5 text-white">
                                {text.quest2}
                              </span>
                              <span className="text-[9px] text-[#a78bfa]/70 block">
                                {text.quest2Desc}
                              </span>
                            </div>
                          </div>
                          <button className="text-[9px] font-bold text-white px-2.5 py-1 bg-[#a78bfa] rounded-md shadow-[0_0_8px_rgba(167,139,250,0.5)] hover:scale-105 transition-transform">
                            {text.claim}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* iOS Style Bottom Home Indicator */}
                  <div className="absolute bottom-1.5 inset-x-0 mx-auto w-[130px] h-[5px] bg-white/30 rounded-full z-30"></div>

                  {/* Tab bar */}
                  <div className="h-20 pb-4 bg-[color:var(--cg-container-a30)] backdrop-blur-2xl border-t border-[color:var(--cg-border)] flex justify-around items-center z-20">
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                      <span className="material-symbols-outlined text-[#60a5fa] group-hover:scale-110 transition-transform">
                        home
                      </span>
                      <div className="w-1 h-1 rounded-full bg-[#60a5fa]"></div>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                      <span className="material-symbols-outlined text-[color:var(--cg-text-muted)] group-hover:text-white transition-colors">
                        menu_book
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                      <span className="material-symbols-outlined text-[color:var(--cg-text-muted)] group-hover:text-white transition-colors">
                        forum
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                      <span className="material-symbols-outlined text-[color:var(--cg-text-muted)] group-hover:text-white transition-colors">
                        person
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background floating tech icons - Text Only and carefully positioned */}
              {/* React */}
              <div className="absolute top-[8%] -left-6 px-5 py-2.5 rounded-xl bg-[#61DAFB]/10 border border-[#61DAFB]/30 backdrop-blur-md animate-float flex items-center justify-center z-0 shadow-[0_0_15px_rgba(97,218,251,0.2)]">
                <span className="font-bold text-[#61DAFB] tracking-tight drop-shadow-md">
                  React
                </span>
              </div>

              {/* TypeScript */}
              <div className="absolute top-[15%] -right-16 px-5 py-2.5 rounded-xl bg-[#3178C6]/10 border border-[#3178C6]/30 backdrop-blur-md animate-float-slow flex items-center justify-center z-0 delay-100 shadow-[0_0_15px_rgba(49,120,198,0.2)]">
                <span className="font-bold text-[#3178C6] tracking-tight drop-shadow-md">
                  TypeScript
                </span>
              </div>

              {/* Vue.js */}
              <div className="absolute top-[40%] -right-20 px-5 py-2.5 rounded-xl bg-[#4FC08D]/10 border border-[#4FC08D]/30 backdrop-blur-md animate-float flex items-center justify-center z-0 delay-200 shadow-[0_0_15px_rgba(79,192,141,0.2)]">
                <span className="font-bold text-[#4FC08D] tracking-tight drop-shadow-md">
                  Vue.js
                </span>
              </div>

              {/* Tailwind */}
              <div className="absolute top-[35%] -left-10 px-5 py-2.5 rounded-xl bg-[#38B2AC]/10 border border-[#38B2AC]/30 backdrop-blur-md animate-float-slow flex items-center justify-center z-0 delay-300 shadow-[0_0_15px_rgba(56,178,172,0.2)]">
                <span className="font-bold text-[#38B2AC] tracking-tight drop-shadow-md">
                  Tailwind
                </span>
              </div>

              {/* HTML */}
              <div className="absolute bottom-[30%] -left-8 px-5 py-2.5 rounded-xl bg-[#E34F26]/10 border border-[#E34F26]/30 backdrop-blur-md animate-float-slow flex items-center justify-center z-0 delay-[500ms] shadow-[0_0_15px_rgba(227,79,38,0.2)]">
                <span className="font-bold text-[#E34F26] tracking-tight drop-shadow-md">
                  HTML
                </span>
              </div>

              {/* Next.js */}
              <div className="absolute bottom-[20%] -right-12 px-5 py-2.5 rounded-xl bg-white/5 border border-white/20 backdrop-blur-md animate-float flex items-center justify-center z-0 delay-[600ms] shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <span className="font-bold text-white tracking-tight drop-shadow-md">
                  Next.js
                </span>
              </div>

              {/* Java */}
              <div className="absolute bottom-[8%] -left-4 px-5 py-2.5 rounded-xl bg-[#f89820]/10 border border-[#f89820]/30 backdrop-blur-md animate-float-slow flex items-center justify-center z-0 delay-[700ms] shadow-[0_0_15px_rgba(248,152,32,0.2)]">
                <span className="font-bold text-[#f89820] tracking-tight drop-shadow-md">
                  Java
                </span>
              </div>

              {/* CSS */}
              <div className="absolute top-[60%] -right-14 px-5 py-2.5 rounded-xl bg-[#264de4]/10 border border-[#264de4]/30 backdrop-blur-md animate-float flex items-center justify-center z-0 delay-[800ms] shadow-[0_0_15px_rgba(38,77,228,0.2)]">
                <span className="font-bold text-[#264de4] tracking-tight drop-shadow-md">
                  CSS
                </span>
              </div>

              {/* Small glowing dots for extra vibrancy */}
              <div className="absolute top-[25%] left-[-60px] w-3 h-3 rounded-full bg-[#4ade80] shadow-[0_0_15px_#4ade80] animate-pulse -z-10"></div>
              <div className="absolute top-[50%] right-[-70px] w-4 h-4 rounded-full bg-[#a78bfa] shadow-[0_0_15px_#a78bfa] animate-pulse delay-300 -z-10"></div>
              <div className="absolute bottom-[25%] left-[-50px] w-2 h-2 rounded-full bg-[#ff7e5f] shadow-[0_0_10px_#ff7e5f] animate-pulse delay-700 -z-10"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
