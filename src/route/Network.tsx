import SideNav from '../components/SideNav';

export default function Network() {
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
              Global{' '}
              <span className="gradient-text-green">Learner Network</span>
            </h1>
            <p className="text-lg text-[color:var(--cg-text-muted)] leading-relaxed">
              You are not learning alone. Join a worldwide ecosystem of
              beginners and experts helping each other master web development.
              Our global network connects you with peers to practice, review
              code, and grow together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#4ade80] bg-opacity-20 flex items-center justify-center mx-auto text-[#4ade80]">
                <span className="material-symbols-outlined text-[32px]">
                  public
                </span>
              </div>
              <h3 className="text-2xl font-bold">120+ Countries</h3>
              <p className="text-sm text-[color:var(--cg-text-muted)]">
                Connect with learners from all over the world, sharing diverse
                perspectives and coding cultures.
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
                500K+ Students
              </h3>
              <p className="text-sm text-[color:var(--cg-text-muted)]">
                A massive, active community of beginners starting their coding
                journey just like you.
              </p>
            </div>
            <div className="glass-card p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#a78bfa] bg-opacity-20 flex items-center justify-center mx-auto text-[#a78bfa]">
                <span className="material-symbols-outlined text-[32px]">
                  forum
                </span>
              </div>
              <h3 className="text-2xl font-bold">Millions of Answers</h3>
              <p className="text-sm text-[color:var(--cg-text-muted)]">
                Never get stuck for long. Our active forum and Q&A network
                provides detailed solutions for every web dev bug.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
