import SideNav from '../components/SideNav';
import { useState } from 'react';

const FAQS = [
  {
    q: 'How do I gain XP?',
    a: 'XP is earned by completing courses, winning arena battles, and participating in global events. The harder the challenge, the more XP you receive.',
  },
  {
    q: 'Can I switch guilds?',
    a: 'Yes, you can switch guilds once every 30 days. However, you will lose your current guild ranking and contribution stats.',
  },
  {
    q: 'What happens if I lose an Arena match?',
    a: 'If you wagered XP, you will lose the wagered amount. If it was an unranked match, your XP remains unaffected.',
  },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
        <main className="max-w-5xl mx-auto px-8 py-16 space-y-16 animate-fade-in-up">
          <div className="text-center space-y-4">
            <h1 className="font-['Lexend'] text-5xl font-bold tracking-tight">
              How can we <span className="gradient-text-green">help</span>?
            </h1>
            <p className="text-[color:var(--cg-text-muted)]">
              Search our knowledge base or submit a ticket to our mages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {FAQS.map((faq, i) => (
                  <div key={i} className="glass-card overflow-hidden">
                    <button
                      className="w-full text-left p-5 font-bold flex items-center justify-between hover:text-[#4ade80] transition-colors"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      {faq.q}
                      <span
                        className="material-symbols-outlined transition-transform"
                        style={{
                          transform:
                            openFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                        }}
                      >
                        expand_more
                      </span>
                    </button>
                    {openFaq === i && (
                      <div className="p-5 pt-0 text-sm text-[color:var(--cg-text-muted)] leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 space-y-6">
              <h2 className="text-2xl font-bold">Submit a Ticket</h2>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs font-bold text-[color:var(--cg-text-muted)] mb-2 uppercase tracking-wide">
                    Category
                  </label>
                  <select className="w-full rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] py-3 px-4 text-sm focus:border-[#4ade80] focus:outline-none appearance-none">
                    <option className="text-black">Account Issue</option>
                    <option className="text-black">Billing</option>
                    <option className="text-black">Bug Report</option>
                    <option className="text-black">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[color:var(--cg-text-muted)] mb-2 uppercase tracking-wide">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] py-3 px-4 text-sm focus:border-[#4ade80] focus:outline-none resize-none placeholder-[color:var(--cg-text-muted)]"
                    placeholder="Describe your issue..."
                  ></textarea>
                </div>
                <button
                  className="w-full rounded-xl py-3 font-bold transition-all hover:scale-[1.02] mt-4"
                  style={{ background: '#4ade80', color: '#0f0b3c' }}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
