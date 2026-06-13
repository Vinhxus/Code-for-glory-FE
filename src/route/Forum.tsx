import SideNav from '../components/SideNav';

export default function Forum() {
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] overflow-hidden flex flex-col">
      <SideNav />
      <div className="relative z-10 md:pl-[96px] flex-1 flex h-screen">
        {/* Sidebar Channels */}
        <div className="w-64 border-r border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] p-4 flex flex-col gap-6 hidden lg:flex h-full">
          <div>
            <h3 className="text-xs font-bold text-[color:var(--cg-text-muted)] uppercase tracking-wider mb-3">
              Beginner Friendly
            </h3>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[color:var(--cg-container-a30)] text-[#4ade80] font-medium cursor-pointer">
                <span className="text-lg">#</span> getting-started
              </li>
              <li className="flex items-center gap-2 px-3 py-2 rounded-xl text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a16)] cursor-pointer">
                <span className="text-lg">#</span> html-css-help
              </li>
              <li className="flex items-center gap-2 px-3 py-2 rounded-xl text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a16)] cursor-pointer">
                <span className="text-lg">#</span> js-basics
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[color:var(--cg-text-muted)] uppercase tracking-wider mb-3">
              Community
            </h3>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 px-3 py-2 rounded-xl text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a16)] cursor-pointer">
                <span className="text-lg">#</span> general-chat
              </li>
              <li className="flex items-center gap-2 px-3 py-2 rounded-xl text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a16)] cursor-pointer">
                <span className="text-lg">#</span> show-your-work
              </li>
            </ul>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-[color:var(--cg-bg)]">
          <header className="border-b border-[color:var(--cg-border)] p-4 bg-[color:var(--cg-container-a16)] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-[color:var(--cg-text-muted)]">#</span>{' '}
                getting-started
              </h2>
              <p className="text-xs text-[color:var(--cg-text-muted)]">
                A safe space for absolute beginners to ask anything about web
                development!
              </p>
            </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* Message 1 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff7e5f] to-[#fbbf24] flex-shrink-0" />
              <div className="space-y-1 w-full max-w-3xl">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-sm">NewbieDev</span>
                  <span className="text-xs text-[color:var(--cg-text-muted)]">
                    Today at 10:42 AM
                  </span>
                </div>
                <p className="text-sm text-[color:var(--cg-text-muted)] leading-relaxed bg-[color:var(--cg-container-a16)] p-3 rounded-tr-xl rounded-b-xl border border-[color:var(--cg-border)] inline-block">
                  Hi everyone! I just started learning HTML yesterday. I'm
                  trying to make a button but it looks really plain. How do you
                  guys make those cool glowing buttons?
                </p>
              </div>
            </div>

            {/* Message 2 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4ade80] to-[#34d399] flex-shrink-0" />
              <div className="space-y-1 w-full max-w-3xl">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-sm text-[#4ade80]">
                    Mentor_Alex{' '}
                    <span className="text-[10px] bg-[#4ade80]/20 px-1.5 py-0.5 rounded text-[#4ade80] ml-1 uppercase">
                      Mentor
                    </span>
                  </span>
                  <span className="text-xs text-[color:var(--cg-text-muted)]">
                    Today at 10:45 AM
                  </span>
                </div>
                <div className="bg-[color:var(--cg-container-a16)] p-4 rounded-tr-xl rounded-b-xl border border-[#4ade80]/30 space-y-3">
                  <p className="text-sm text-[color:var(--cg-text)] leading-relaxed">
                    Welcome to the community! 🎉 To make glowing buttons, you'll
                    need to use CSS (Cascading Style Sheets). Specifically, you
                    can use the{' '}
                    <code className="bg-[color:var(--cg-bg)] px-1.5 py-0.5 rounded text-[#ff7e5f] font-['JetBrains_Mono'] border border-[color:var(--cg-border)]">
                      box-shadow
                    </code>{' '}
                    property. Here's a very simple example for beginners:
                  </p>
                  <div className="rounded-xl overflow-hidden border border-[color:var(--cg-border)] bg-[color:var(--cg-bg)]">
                    <div className="bg-[color:var(--cg-container-a30)] px-4 py-2 text-xs font-['JetBrains_Mono'] text-[color:var(--cg-text-muted)] flex justify-between">
                      <span>style.css</span>
                      <span>CSS</span>
                    </div>
                    <pre className="p-4 text-sm font-['JetBrains_Mono'] overflow-x-auto">
                      <code className="text-white">
                        .glowing-btn {'{'}
                        <span className="text-[#60a5fa]">background-color</span>
                        : <span className="text-[#4ade80]">#ff7e5f</span>;
                        <span className="text-[#60a5fa]">box-shadow</span>: 0 0
                        15px <span className="text-[#4ade80]">#ff7e5f</span>;
                        <span className="text-[#60a5fa]">color</span>:{' '}
                        <span className="text-[#4ade80]">white</span>;
                        <span className="text-[#60a5fa]">border</span>:{' '}
                        <span className="text-[#4ade80]">none</span>;
                        <span className="text-[#60a5fa]">padding</span>:{' '}
                        <span className="text-[#4ade80]">10px 20px</span>;{'}'}
                      </code>
                    </pre>
                  </div>
                  <p className="text-sm text-[color:var(--cg-text)] leading-relaxed">
                    Don't worry if it looks complicated right now, we cover all
                    of this step-by-step in the{' '}
                    <span className="text-[#a78bfa] cursor-pointer hover:underline font-bold">
                      Frontend Foundation
                    </span>{' '}
                    course! Let us know if you need more help!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[color:var(--cg-bg)] border-t border-[color:var(--cg-border)] shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Message #getting-started..."
                className="w-full bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)] rounded-xl py-4 px-4 pr-12 text-sm focus:outline-none focus:border-[#4ade80] transition-colors text-[color:var(--cg-text)]"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#4ade80] rounded-lg flex items-center justify-center text-[#0f0b3c] hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-[18px]">
                  send
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
