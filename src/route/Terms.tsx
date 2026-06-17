import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';

export default function Terms() {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';
  const text = isVi
    ? {
        title: 'Điều khoản dịch vụ',
        updated: 'Cập nhật lần cuối: Tháng 6 2026',
        section1: '1. Chấp nhận điều khoản',
        section1Body:
          'Khi truy cập và sử dụng CodeForGlory, bạn đồng ý tuân thủ các điều khoản và quy định của thoả thuận này. Khi sử dụng các dịch vụ cụ thể, bạn cũng cần tuân theo mọi hướng dẫn hoặc quy tắc được đăng tải cho các dịch vụ đó.',
        section2: '2. Mô tả dịch vụ',
        section2Body:
          'CodeForGlory cung cấp cho người dùng quyền truy cập vào nhiều tài nguyên như công cụ giao tiếp, diễn đàn và nội dung cá nhân hoá. Bạn hiểu và đồng ý rằng Dịch vụ có thể bao gồm quảng cáo và đây là yếu tố cần thiết để CodeForGlory vận hành dịch vụ.',
        section3: '3. Hành vi người dùng',
        section3Body:
          'Bạn đồng ý không sử dụng Dịch vụ để tải lên, đăng, gửi email, truyền hoặc công bố bất kỳ nội dung nào mang tính trái pháp luật, gây hại, đe doạ, lạm dụng, quấy rối, phỉ báng, tục tĩu, xâm phạm quyền riêng tư, thù ghét hoặc phản cảm.',
      }
    : {
        title: 'Terms of Service',
        updated: 'Last updated: June 2026',
        section1: '1. Acceptance of Terms',
        section1Body:
          'By accessing and using CodeForGlory, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.',
        section2: '2. Description of Service',
        section2Body:
          'CodeForGlory provides users with access to a rich collection of resources, including various communications tools, forums, and personalized content. You understand and agree that the Service may include advertisements and that these advertisements are necessary for CodeForGlory to provide the Service.',
        section3: '3. User Conduct',
        section3Body:
          "You agree to not use the Service to upload, post, email, transmit or otherwise make available any Content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable.",
      };
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] overflow-x-hidden">
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-4xl mx-auto px-8 py-16 animate-fade-in-up">
          <div className="glass-card p-10 md:p-16 space-y-8">
            <h1 className="font-['Lexend'] text-4xl font-bold border-b border-[color:var(--cg-border)] pb-6">
              {text.title}
            </h1>
            <div className="prose prose-invert max-w-none text-[color:var(--cg-text-muted)] space-y-6 leading-relaxed">
              <p>{text.updated}</p>
              <h3 className="text-xl font-bold text-[color:var(--cg-text)] pt-4">
                {text.section1}
              </h3>
              <p>{text.section1Body}</p>

              <h3 className="text-xl font-bold text-[color:var(--cg-text)] pt-4">
                {text.section2}
              </h3>
              <p>{text.section2Body}</p>

              <h3 className="text-xl font-bold text-[color:var(--cg-text)] pt-4">
                {text.section3}
              </h3>
              <p>{text.section3Body}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
