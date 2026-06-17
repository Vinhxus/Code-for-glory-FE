import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';

export default function Privacy() {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';
  const text = isVi
    ? {
        title: 'Chính sách bảo mật',
        updated: 'Cập nhật lần cuối: Tháng 6 2026',
        section1: '1. Thu thập thông tin',
        section1Body:
          'Chúng tôi thu thập thông tin bạn cung cấp trực tiếp, chẳng hạn khi tạo hoặc chỉnh sửa tài khoản, yêu cầu dịch vụ, liên hệ hỗ trợ hoặc tương tác với chúng tôi. Thông tin có thể bao gồm: tên, email, số điện thoại, địa chỉ, ảnh đại diện, phương thức thanh toán và các dữ liệu khác do bạn cung cấp.',
        section2: '2. Mục đích sử dụng thông tin',
        section2Body:
          'Chúng tôi có thể dùng dữ liệu thu thập để cung cấp, duy trì và cải thiện Dịch vụ; hỗ trợ thanh toán, gửi biên nhận, cung cấp sản phẩm/dịch vụ bạn yêu cầu, phát triển tính năng mới, hỗ trợ khách hàng, tăng cường an toàn, xác thực người dùng và gửi cập nhật sản phẩm.',
        section3: '3. Chia sẻ thông tin',
        section3Body:
          'Chúng tôi có thể chia sẻ thông tin như mô tả trong chính sách này hoặc tại thời điểm thu thập, bao gồm với nhà cung cấp dịch vụ bên thứ ba hoặc khi có yêu cầu hợp lệ từ cơ quan có thẩm quyền theo quy định pháp luật.',
      }
    : {
        title: 'Privacy Policy',
        updated: 'Last updated: June 2026',
        section1: '1. Information Collection',
        section1Body:
          'We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.',
        section2: '2. Use of Information',
        section2Body:
          'We may use the information we collect about you to provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request, develop new features, provide customer support, develop safety features, authenticate users, and send product updates and administrative messages.',
        section3: '3. Sharing of Information',
        section3Body:
          'We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows: With third party service providers; in response to a request for information by a competent authority if we believe disclosure is in accordance with, or is otherwise required by, any applicable law, regulation, or legal process.',
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
