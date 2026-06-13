import SideNav from '../components/SideNav';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] overflow-x-hidden">
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-4xl mx-auto px-8 py-16 animate-fade-in-up">
          <div className="glass-card p-10 md:p-16 space-y-8">
            <h1 className="font-['Lexend'] text-4xl font-bold border-b border-[color:var(--cg-border)] pb-6">
              Terms of Service
            </h1>
            <div className="prose prose-invert max-w-none text-[color:var(--cg-text-muted)] space-y-6 leading-relaxed">
              <p>Last updated: June 2026</p>
              <h3 className="text-xl font-bold text-[color:var(--cg-text)] pt-4">
                1. Acceptance of Terms
              </h3>
              <p>
                By accessing and using CodeForGlory, you accept and agree to be
                bound by the terms and provision of this agreement. In addition,
                when using these particular services, you shall be subject to
                any posted guidelines or rules applicable to such services.
              </p>

              <h3 className="text-xl font-bold text-[color:var(--cg-text)] pt-4">
                2. Description of Service
              </h3>
              <p>
                CodeForGlory provides users with access to a rich collection of
                resources, including various communications tools, forums, and
                personalized content. You understand and agree that the Service
                may include advertisements and that these advertisements are
                necessary for CodeForGlory to provide the Service.
              </p>

              <h3 className="text-xl font-bold text-[color:var(--cg-text)] pt-4">
                3. User Conduct
              </h3>
              <p>
                You agree to not use the Service to upload, post, email,
                transmit or otherwise make available any Content that is
                unlawful, harmful, threatening, abusive, harassing, tortious,
                defamatory, vulgar, obscene, libelous, invasive of another's
                privacy, hateful, or racially, ethnically or otherwise
                objectionable.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
