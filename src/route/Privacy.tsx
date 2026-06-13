import SideNav from '../components/SideNav';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] overflow-x-hidden">
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-4xl mx-auto px-8 py-16 animate-fade-in-up">
          <div className="glass-card p-10 md:p-16 space-y-8">
            <h1 className="font-['Lexend'] text-4xl font-bold border-b border-[color:var(--cg-border)] pb-6">
              Privacy Policy
            </h1>
            <div className="prose prose-invert max-w-none text-[color:var(--cg-text-muted)] space-y-6 leading-relaxed">
              <p>Last updated: June 2026</p>
              <h3 className="text-xl font-bold text-[color:var(--cg-text)] pt-4">
                1. Information Collection
              </h3>
              <p>
                We collect information you provide directly to us, such as when
                you create or modify your account, request on-demand services,
                contact customer support, or otherwise communicate with us. This
                information may include: name, email, phone number, postal
                address, profile picture, payment method, and other information
                you choose to provide.
              </p>

              <h3 className="text-xl font-bold text-[color:var(--cg-text)] pt-4">
                2. Use of Information
              </h3>
              <p>
                We may use the information we collect about you to provide,
                maintain, and improve our Services, including, for example, to
                facilitate payments, send receipts, provide products and
                services you request, develop new features, provide customer
                support, develop safety features, authenticate users, and send
                product updates and administrative messages.
              </p>

              <h3 className="text-xl font-bold text-[color:var(--cg-text)] pt-4">
                3. Sharing of Information
              </h3>
              <p>
                We may share the information we collect about you as described
                in this Statement or as described at the time of collection or
                sharing, including as follows: With third party service
                providers; in response to a request for information by a
                competent authority if we believe disclosure is in accordance
                with, or is otherwise required by, any applicable law,
                regulation, or legal process.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
