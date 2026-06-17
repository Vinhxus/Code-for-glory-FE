export type I18nKey =
  // common
  | 'common.skip'
  | 'common.next'
  | 'common.back'
  | 'common.finish'
  | 'common.profile'
  | 'common.comingSoon'
  | 'common.notImplemented'
  // sidenav
  | 'nav.map'
  | 'nav.battle'
  | 'nav.practice'
  | 'nav.history'
  // homepage
  | 'home.nav.quests'
  | 'home.nav.leaderboard'
  | 'home.nav.shop'
  | 'home.hero.tag'
  | 'home.hero.titleA'
  | 'home.hero.titleB'
  | 'home.hero.subtitle'
  | 'home.hero.start'
  | 'home.hero.roadmap'
  | 'home.stats.solved'
  | 'home.stats.participants'
  | 'home.stats.gold'
  | 'home.path.title'
  | 'home.path.subtitle'
  | 'home.arena.tag'
  | 'home.arena.title'
  | 'home.arena.subtitle'
  | 'home.arena.cta'
  | 'home.top.title'
  | 'home.top.viewAll'
  | 'home.footer.platform'
  | 'home.footer.community'
  | 'home.footer.terms'
  | 'home.footer.privacy'
  | 'home.footer.support'
  | 'common.backToMap'
  | 'summary.primaryTrack'
  // assessment
  | 'assess.title'
  | 'assess.subtitle'
  | 'assess.frontend.max'
  | 'assess.backend.max'
  | 'assess.chooseMax'
  | 'assess.chooseBeforeAnswer'
  | 'assess.code.noTracksTitle'
  | 'assess.code.noTracksBody'
  | 'assess.correct'
  | 'assess.notQuite'
  | 'assess.confidence'
  | 'assess.code.placeholder'
  | 'assess.pseudo.placeholder'
  | 'assess.tip.notAutograded'
  | 'assess.results.title'
  | 'assess.results.body'
  | 'assess.results.selectedLevel'
  | 'assess.results.enterPractice'
  | 'assess.results.viewSummary'
  | 'roadmap.topics'
  | 'roadmap.completed'
  | 'roadmap.inProgress'
  | 'roadmap.locked'
  | 'roadmap.current'
  | 'roadmap.frontend'
  | 'roadmap.backend'
  | 'roadmap.stage.beginner'
  | 'roadmap.stage.intermediate'
  | 'roadmap.stage.advanced'
  | 'roadmap.tooltip.locked'
  | 'roadmap.estCompletion'
  | 'roadmap.welcome.empty'
  | 'survey.profileReady.title'
  | 'survey.profileReady.body.part1'
  | 'survey.profileReady.startJourney'
  | 'footer.tagline'
  | 'footer.platform'
  | 'footer.community'
  | 'footer.courses'
  | 'footer.arena'
  | 'footer.pricing'
  | 'footer.discord'
  | 'footer.events'
  | 'footer.guilds';

export const translations: Record<I18nKey, { en: string; vi: string }> = {
  'common.skip': { en: 'Skip', vi: 'Bỏ qua' },
  'common.next': { en: 'Next', vi: 'Tiếp' },
  'common.back': { en: 'Back', vi: 'Quay lại' },
  'common.finish': { en: 'Finish', vi: 'Hoàn thành' },
  'common.profile': { en: 'PROFILE', vi: 'HỒ SƠ' },
  'common.comingSoon': { en: 'COMING SOON', vi: 'SẮP RA MẮT' },
  'common.notImplemented': {
    en: 'This page is not implemented yet. We’ll connect it to the real flow once the API and data are finalized.',
    vi: 'Trang này chưa được triển khai. Sẽ nối vào flow thật khi API và dữ liệu được chốt.',
  },

  'nav.map': { en: 'Map', vi: 'Bản đồ' },
  'nav.battle': { en: 'Battle', vi: 'Đấu' },
  'nav.practice': { en: 'Practice', vi: 'Luyện tập' },
  'nav.history': { en: 'History', vi: 'Lịch sử' },

  'home.nav.quests': { en: 'Quests', vi: 'Nhiệm vụ' },
  'home.nav.leaderboard': { en: 'Leaderboard', vi: 'Bảng xếp hạng' },
  'home.nav.shop': { en: 'Shop', vi: 'Cửa hàng' },
  'home.hero.tag': {
    en: '⚡ SEASON 1: THE BINARY FRONTIER',
    vi: '⚡ MÙA 1: BIÊN GIỚI NHỊ PHÂN',
  },
  'home.hero.titleA': { en: 'Master Code Through', vi: 'Làm chủ code qua' },
  'home.hero.titleB': { en: 'Epic', vi: 'Những' },
  'home.hero.subtitle': {
    en: 'Forge your destiny as a developer by conquering administrative terminal challenges.',
    vi: 'Rèn luyện như một developer bằng cách chinh phục các thử thách thực chiến.',
  },
  'home.hero.start': { en: 'Start Your Adventure', vi: 'Bắt đầu hành trình' },
  'home.hero.roadmap': { en: 'Career Path', vi: 'Lộ trình nghề nghiệp' },
  'home.stats.solved': { en: 'Quests Solved', vi: 'Nhiệm vụ đã giải' },
  'home.stats.participants': { en: 'Participants', vi: 'Người tham gia' },
  'home.stats.gold': { en: 'Gold Distributed', vi: 'Vàng phát mỗi ngày' },
  'home.path.title': { en: 'The Learning Path', vi: 'Lộ trình học' },
  'home.path.subtitle': {
    en: 'Progress through interactive islands to master modern web technologies.',
    vi: 'Tiến qua các “hòn đảo” tương tác để làm chủ công nghệ web hiện đại.',
  },
  'home.arena.tag': { en: '⚔️ LIVE COMBAT', vi: '⚔️ ĐẤU TRƯỜNG' },
  'home.arena.title': { en: 'Battle Arena', vi: 'Đấu trường' },
  'home.arena.subtitle': {
    en: 'Challenge fellow coders in real-time performance duels. Prove your speed and optimization skills to climb the ranks.',
    vi: 'So tài real-time. Chứng minh tốc độ và khả năng tối ưu để leo rank.',
  },
  'home.arena.cta': { en: 'Join the Arena', vi: 'Vào đấu trường' },
  'home.top.title': { en: 'Top Users', vi: 'Top người chơi' },
  'home.top.viewAll': { en: 'VIEW ALL RANKINGS', vi: 'XEM TẤT CẢ XẾP HẠNG' },
  'home.footer.platform': { en: 'Platform', vi: 'Nền tảng' },
  'home.footer.community': { en: 'Community', vi: 'Cộng đồng' },
  'home.footer.terms': { en: 'Terms', vi: 'Điều khoản' },
  'home.footer.privacy': { en: 'Privacy', vi: 'Bảo mật' },
  'home.footer.support': { en: 'Support', vi: 'Hỗ trợ' },
  'common.backToMap': { en: 'Back to Map', vi: 'Quay lại Bản đồ' },
  'summary.primaryTrack': { en: 'PRIMARY TRACK', vi: 'CHẶNG CHÍNH' },

  'assess.title': {
    en: 'Skill Assessment (Frontend/Backend)',
    vi: 'Khảo sát kỹ năng (Frontend/Backend)',
  },
  'assess.subtitle': {
    en: 'Multiple-choice + mini coding tasks at Easy / Medium / Hard to estimate your level.',
    vi: 'Trắc nghiệm + mini bài code theo Easy / Medium / Hard để ước lượng trình độ.',
  },
  'assess.frontend.max': {
    en: 'FRONTEND · CHOOSE YOUR MAX DIFFICULTY',
    vi: 'FRONTEND · CHỌN ĐỘ KHÓ CAO NHẤT',
  },
  'assess.backend.max': {
    en: 'BACKEND · CHOOSE YOUR MAX DIFFICULTY',
    vi: 'BACKEND · CHỌN ĐỘ KHÓ CAO NHẤT',
  },
  'assess.chooseMax': {
    en: 'How far do you want to go?',
    vi: 'Bạn muốn làm tới mức nào?',
  },
  'assess.chooseBeforeAnswer': {
    en: 'Choose a difficulty before answering.',
    vi: 'Chọn độ khó trước khi trả lời.',
  },
  'assess.code.noTracksTitle': {
    en: "You didn't pick Frontend/Backend in the previous survey.",
    vi: 'Bạn chưa chọn Frontend/Backend ở survey trước.',
  },
  'assess.code.noTracksBody': {
    en: 'You can still press Next to enter Practice.',
    vi: 'Bạn vẫn có thể bấm Next để vào Practice.',
  },
  'assess.correct': { en: '✓ Correct', vi: '✓ Đúng' },
  'assess.notQuite': { en: '✕ Not quite', vi: '✕ Chưa đúng' },
  'assess.confidence': {
    en: 'Confidence (1 low → 5 high)',
    vi: 'Độ tự tin (1 thấp → 5 cao)',
  },
  'assess.code.placeholder': {
    en: '// Write your code here…',
    vi: '// Viết code ở đây…',
  },
  'assess.pseudo.placeholder': {
    en: '// Write pseudo-code here…',
    vi: '// Viết pseudo-code ở đây…',
  },
  'assess.tip.notAutograded': {
    en: 'Tip: this is not auto-graded. The goal is to save it so you (or a mentor) can review your thinking.',
    vi: 'Tip: bài này không chấm tự động. Mục tiêu là lưu lại để bạn (hoặc mentor) review cách bạn tư duy.',
  },
  'assess.results.title': {
    en: 'Skill assessment completed',
    vi: 'Hoàn thành khảo sát kỹ năng',
  },
  'assess.results.body': {
    en: 'Results are saved to localStorage for personalization and Practice.',
    vi: 'Kết quả được lưu vào localStorage để cá nhân hoá và dùng cho Practice.',
  },
  'assess.results.selectedLevel': { en: 'Selected level:', vi: 'Mức đã chọn:' },
  'assess.results.enterPractice': {
    en: 'Enter Practice Workspace',
    vi: 'Vào Practice Workspace',
  },
  'assess.results.viewSummary': {
    en: 'View Quest Map Summary',
    vi: 'Xem Quest Map Summary',
  },

  // roadmap
  'roadmap.topics': { en: 'Topics', vi: 'Chủ đề' },
  'roadmap.completed': { en: 'Completed', vi: 'Đã hoàn thành' },
  'roadmap.inProgress': { en: 'In Progress', vi: 'Đang học' },
  'roadmap.locked': { en: 'Locked', vi: 'Đã khóa' },
  'roadmap.current': { en: 'Current', vi: 'Hiện tại' },
  'roadmap.frontend': { en: 'Front-end Roadmap', vi: 'Lộ trình Front-end' },
  'roadmap.backend': { en: 'Back-end Roadmap', vi: 'Lộ trình Back-end' },
  'roadmap.stage.beginner': { en: '🌱 Beginner Stage', vi: '🌱 Chặng Cơ bản' },
  'roadmap.stage.intermediate': {
    en: '🚀 Intermediate Stage',
    vi: '🚀 Chặng Trung cấp',
  },
  'roadmap.stage.advanced': { en: '🔥 Advanced Stage', vi: '🔥 Chặng Cao cấp' },
  'roadmap.tooltip.locked': {
    en: 'Finish previous milestone to unlock',
    vi: 'Hoàn thành cột mốc trước để mở khóa',
  },
  'roadmap.estCompletion': {
    en: 'Est. Completion:',
    vi: 'Dự kiến hoàn thành:',
  },
  'roadmap.welcome.empty': {
    en: 'Select Frontend or Backend to explore the detailed learning roadmap.',
    vi: 'Chọn Frontend hoặc Backend để khám phá roadmap học tập chi tiết.',
  },
  // survey / profile ready
  'survey.profileReady.title': {
    en: 'Your Profile is Ready',
    vi: 'Hồ sơ của bạn đã sẵn sàng',
  },
  'survey.profileReady.body.part1': {
    en: 'We detect you are a',
    vi: 'Chúng tôi nhận thấy bạn là một',
  },
  'survey.profileReady.startJourney': {
    en: 'Start your journey',
    vi: 'Bắt đầu hành trình',
  },
  // footer
  'footer.tagline': {
    en: 'Gamifying the future of software engineering.',
    vi: 'Gamify tương lai của kỹ thuật phần mềm.',
  },
  'footer.platform': { en: 'Platform', vi: 'Nền tảng' },
  'footer.community': { en: 'Community', vi: 'Cộng đồng' },
  'footer.courses': { en: 'Courses', vi: 'Khoá học' },
  'footer.arena': { en: 'Arena', vi: 'Đấu trường' },
  'footer.pricing': { en: 'Pricing', vi: 'Giá' },
  'footer.discord': { en: 'Discord', vi: 'Discord' },
  'footer.events': { en: 'Events', vi: 'Sự kiện' },
  'footer.guilds': { en: 'Guilds', vi: 'Guilds' },
};
