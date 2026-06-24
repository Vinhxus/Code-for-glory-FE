import { useMemo, useState, useEffect } from 'react';
import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';
import UserProfileModal from '../components/UserProfileModal';
import FriendsSidebar from '../components/FriendsSidebar';
import {
  getPosts,
  createPost,
  reactToPost,
  ForumPost,
} from '../services/forumApi';

type Channel = {
  id: string;
  name: string;
  group: 'learning' | 'community';
  badge?: string;
  topic: string;
  presence: number;
  unread: number;
  pinned: number;
};

type ChatMessage = {
  id: string;
  author: string;
  role?: 'mentor' | 'builder' | 'member' | 'you';
  time: string;
  body: string;
  accent: string;
  replies?: number;
  reactions?: Array<{ emoji: string; count: number }>;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function Forum() {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const content = useMemo(
    () =>
      isVi
        ? {
            workspace: 'Cộng đồng học tập',
            workspaceDesc:
              'Forum giờ được thiết kế như một khu chat theo channel để mọi người hỏi đáp, khoe tiến độ và kéo nhau học chung mỗi ngày.',
            learning: 'Kênh học tập',
            community: 'Kênh cộng đồng',
            onlineNow: 'đang online',
            pinned: 'ghim',
            members: 'Thành viên',
            activeNow: 'Đang hoạt động',
            placeholderPrefix: 'Nhắn vào',
            quickActions: 'Gợi ý nhanh',
            actionAsk: 'Đặt câu hỏi',
            actionReview: 'Xin review',
            actionPair: 'Rủ học cùng',
            actionShare: 'Chia sẻ tiến độ',
            enterHint: 'Nhấn Enter để gửi',
            chatFeelsAlive: 'Luồng chat theo thời gian thực',
            chatFeelsAliveDesc:
              'Channel có unread, số người online, message feed, member list và composer riêng cho từng phòng.',
            memberTitle: 'Những người đang góp mặt',
            roomGuide: 'Góc điều hướng',
            roomGuideDesc:
              'Chuyển room để xem đúng ngữ cảnh thảo luận, thay vì chỉ có một khung minh hoạ cố định.',
            mentor: 'Mentor',
            builder: 'Builder',
            member: 'Member',
            you: 'Bạn',
          }
        : {
            workspace: 'Learning community',
            workspaceDesc:
              'The forum now behaves like a proper multi-channel chat space where people can ask, help, share progress, and study together.',
            learning: 'Learning channels',
            community: 'Community channels',
            onlineNow: 'online',
            pinned: 'pinned',
            members: 'Members',
            activeNow: 'Active now',
            placeholderPrefix: 'Message',
            quickActions: 'Quick prompts',
            actionAsk: 'Ask a question',
            actionReview: 'Request review',
            actionPair: 'Find a study buddy',
            actionShare: 'Share progress',
            enterHint: 'Press Enter to send',
            chatFeelsAlive: 'Live chat flow',
            chatFeelsAliveDesc:
              'Each room has unread counts, presence, a message feed, member list, and its own composer.',
            memberTitle: 'People in this room',
            roomGuide: 'Room navigator',
            roomGuideDesc:
              'Switch rooms to jump into the right context instead of staying in a fixed symbolic mockup.',
            mentor: 'Mentor',
            builder: 'Builder',
            member: 'Member',
            you: 'You',
          },
    [isVi]
  );

  const channels = useMemo<Channel[]>(
    () =>
      isVi
        ? [
            {
              id: 'getting-started',
              name: 'getting-started',
              group: 'learning',
              badge: 'Starter',
              topic: 'Mọi câu hỏi đầu tiên về HTML, CSS, JS và cách học web.',
              presence: 124,
              unread: 6,
              pinned: 2,
            },
            {
              id: 'html-css-help',
              name: 'html-css-help',
              group: 'learning',
              topic: 'Markup, layout, responsive và các lỗi UI hằng ngày.',
              presence: 86,
              unread: 2,
              pinned: 4,
            },
            {
              id: 'js-basics',
              name: 'js-basics',
              group: 'learning',
              topic: 'Biến, hàm, async, array methods và debug căn bản.',
              presence: 73,
              unread: 0,
              pinned: 3,
            },
            {
              id: 'show-your-work',
              name: 'show-your-work',
              group: 'community',
              badge: 'Build',
              topic:
                'Khoe mini project, landing page, challenge và milestone mới.',
              presence: 58,
              unread: 9,
              pinned: 1,
            },
            {
              id: 'general-chat',
              name: 'general-chat',
              group: 'community',
              topic:
                'Trò chuyện linh tinh, chia sẻ tài nguyên và rủ nhau học nhóm.',
              presence: 91,
              unread: 1,
              pinned: 2,
            },
          ]
        : [
            {
              id: 'getting-started',
              name: 'getting-started',
              group: 'learning',
              badge: 'Starter',
              topic:
                'First questions about HTML, CSS, JS, and how to learn web dev.',
              presence: 124,
              unread: 6,
              pinned: 2,
            },
            {
              id: 'html-css-help',
              name: 'html-css-help',
              group: 'learning',
              topic:
                'Markup, layout, responsive behavior, and day-to-day UI fixes.',
              presence: 86,
              unread: 2,
              pinned: 4,
            },
            {
              id: 'js-basics',
              name: 'js-basics',
              group: 'learning',
              topic:
                'Variables, functions, async flows, array methods, and debugging.',
              presence: 73,
              unread: 0,
              pinned: 3,
            },
            {
              id: 'show-your-work',
              name: 'show-your-work',
              group: 'community',
              badge: 'Build',
              topic:
                'Share mini projects, landing pages, challenge wins, and milestones.',
              presence: 58,
              unread: 9,
              pinned: 1,
            },
            {
              id: 'general-chat',
              name: 'general-chat',
              group: 'community',
              topic:
                'Casual conversation, resources, and finding people to study with.',
              presence: 91,
              unread: 1,
              pinned: 2,
            },
          ],
    [isVi]
  );

  const initialMessages = useMemo<Record<string, ChatMessage[]>>(
    () =>
      isVi
        ? {
            'getting-started': [
              {
                id: 'gs-1',
                author: 'NewbieDev',
                role: 'member',
                time: 'Hôm nay 10:42',
                body: 'Mình mới học HTML được hai hôm. Có cách nào để biết khi nào nên dùng `section`, khi nào nên dùng `div` không mọi người?',
                accent: 'from-[#ff7e5f] to-[#fbbf24]',
                replies: 4,
                reactions: [
                  { emoji: '👍', count: 7 },
                  { emoji: '🔥', count: 2 },
                ],
              },
              {
                id: 'gs-2',
                author: 'Mentor_Alex',
                role: 'mentor',
                time: 'Hôm nay 10:45',
                body: 'Rule ngắn gọn: nếu block đó có ý nghĩa nội dung riêng và có thể đặt tiêu đề thì ưu tiên `section`; còn `div` chỉ nên là wrapper trung tính. Nếu bạn muốn, mình có thể chỉ luôn cách nhìn semantic cho một landing page nhỏ.',
                accent: 'from-[#4ade80] to-[#22c55e]',
                replies: 3,
                reactions: [
                  { emoji: '✅', count: 12 },
                  { emoji: '💡', count: 5 },
                ],
              },
              {
                id: 'gs-3',
                author: 'UI_Beans',
                role: 'builder',
                time: 'Hôm nay 10:47',
                body: 'Mình thường tự hỏi: nếu ngày mai bỏ hết CSS đi, block này còn có nghĩa gì với người đọc hay screen reader không? Nếu có thì nên semantic.',
                accent: 'from-[#a78bfa] to-[#8b5cf6]',
                reactions: [{ emoji: '👏', count: 6 }],
              },
            ],
            'html-css-help': [
              {
                id: 'hc-1',
                author: 'PixelMie',
                role: 'builder',
                time: 'Hôm nay 11:03',
                body: 'Có ai gặp lỗi card bị vỡ layout khi title dài quá không? Mình đang phân vân giữa `minmax`, `line-clamp` và `overflow-wrap`.',
                accent: 'from-[#38bdf8] to-[#3b82f6]',
                replies: 8,
                reactions: [{ emoji: '🧩', count: 4 }],
              },
              {
                id: 'hc-2',
                author: 'CSS_Garden',
                role: 'mentor',
                time: 'Hôm nay 11:06',
                body: 'Nếu card grid thì mình ưu tiên `minmax()` cho cột, còn text dài thì thêm `overflow-wrap: anywhere;`. `line-clamp` chỉ xử lý phần hiển thị thôi.',
                accent: 'from-[#4ade80] to-[#14b8a6]',
                reactions: [{ emoji: '✅', count: 9 }],
              },
            ],
            'js-basics': [
              {
                id: 'js-1',
                author: 'LanCode',
                role: 'member',
                time: 'Hôm nay 09:18',
                body: 'Mình hay bị rối giữa `map`, `filter`, `find`. Có mn nào có mẹo nhớ nhanh không?',
                accent: 'from-[#fb7185] to-[#f43f5e]',
                replies: 5,
              },
              {
                id: 'js-2',
                author: 'CoachMinh',
                role: 'mentor',
                time: 'Hôm nay 09:21',
                body: '`map` biến đổi toàn bộ mảng, `filter` giữ lại vài phần tử, `find` lấy đúng một phần tử đầu tiên. Cứ nhớ câu này là đủ dùng 80% tình huống rồi.',
                accent: 'from-[#4ade80] to-[#22c55e]',
                reactions: [{ emoji: '📝', count: 11 }],
              },
            ],
            'show-your-work': [
              {
                id: 'sw-1',
                author: 'AnTran',
                role: 'builder',
                time: 'Hôm nay 08:56',
                body: 'Mình vừa xong landing page đầu tiên bằng HTML/CSS thuần. Phần hero còn hơi cứng, ai rảnh xem giúp mình hierarchy với spacing được không?',
                accent: 'from-[#f59e0b] to-[#ef4444]',
                replies: 12,
                reactions: [{ emoji: '🚀', count: 15 }],
              },
            ],
            'general-chat': [
              {
                id: 'gc-1',
                author: 'StudyBuddy',
                role: 'member',
                time: 'Hôm nay 12:10',
                body: 'Tối nay có ai muốn mở phòng pair study 45 phút không? Mình đang học Flexbox với semantic HTML.',
                accent: 'from-[#60a5fa] to-[#2563eb]',
                replies: 9,
                reactions: [{ emoji: '🙌', count: 8 }],
              },
            ],
          }
        : {
            'getting-started': [
              {
                id: 'gs-1',
                author: 'NewbieDev',
                role: 'member',
                time: 'Today 10:42',
                body: 'I just started learning HTML. How do you decide when to use `section` versus `div` in a real page?',
                accent: 'from-[#ff7e5f] to-[#fbbf24]',
                replies: 4,
                reactions: [
                  { emoji: '👍', count: 7 },
                  { emoji: '🔥', count: 2 },
                ],
              },
              {
                id: 'gs-2',
                author: 'Mentor_Alex',
                role: 'mentor',
                time: 'Today 10:45',
                body: 'Short rule: if the block carries standalone meaning and could reasonably have its own heading, prefer `section`; otherwise use `div` as a neutral wrapper. I can break it down with a landing-page example if you want.',
                accent: 'from-[#4ade80] to-[#22c55e]',
                replies: 3,
                reactions: [
                  { emoji: '✅', count: 12 },
                  { emoji: '💡', count: 5 },
                ],
              },
              {
                id: 'gs-3',
                author: 'UI_Beans',
                role: 'builder',
                time: 'Today 10:47',
                body: 'I usually ask myself: if all CSS disappeared, would this block still communicate meaning to a reader or screen reader? If yes, it should probably be semantic.',
                accent: 'from-[#a78bfa] to-[#8b5cf6]',
                reactions: [{ emoji: '👏', count: 6 }],
              },
            ],
            'html-css-help': [
              {
                id: 'hc-1',
                author: 'PixelMie',
                role: 'builder',
                time: 'Today 11:03',
                body: 'Does anyone else fight card layouts when the title gets too long? I am debating between `minmax`, `line-clamp`, and `overflow-wrap`.',
                accent: 'from-[#38bdf8] to-[#3b82f6]',
                replies: 8,
                reactions: [{ emoji: '🧩', count: 4 }],
              },
              {
                id: 'hc-2',
                author: 'CSS_Garden',
                role: 'mentor',
                time: 'Today 11:06',
                body: 'For grid cards I would start with `minmax()` for the columns, then add `overflow-wrap: anywhere;` for long text. `line-clamp` only controls the visible slice.',
                accent: 'from-[#4ade80] to-[#14b8a6]',
                reactions: [{ emoji: '✅', count: 9 }],
              },
            ],
            'js-basics': [
              {
                id: 'js-1',
                author: 'LanCode',
                role: 'member',
                time: 'Today 09:18',
                body: 'I keep mixing up `map`, `filter`, and `find`. Does anyone have a quick way to remember them?',
                accent: 'from-[#fb7185] to-[#f43f5e]',
                replies: 5,
              },
              {
                id: 'js-2',
                author: 'CoachMinh',
                role: 'mentor',
                time: 'Today 09:21',
                body: '`map` transforms every item, `filter` keeps some items, and `find` returns the first matching item. That one sentence covers most day-to-day cases.',
                accent: 'from-[#4ade80] to-[#22c55e]',
                reactions: [{ emoji: '📝', count: 11 }],
              },
            ],
            'show-your-work': [
              {
                id: 'sw-1',
                author: 'AnTran',
                role: 'builder',
                time: 'Today 08:56',
                body: 'I just finished my first HTML/CSS landing page. The hero still feels stiff. If anyone has time, I would love feedback on the hierarchy and spacing.',
                accent: 'from-[#f59e0b] to-[#ef4444]',
                replies: 12,
                reactions: [{ emoji: '🚀', count: 15 }],
              },
            ],
            'general-chat': [
              {
                id: 'gc-1',
                author: 'StudyBuddy',
                role: 'member',
                time: 'Today 12:10',
                body: 'Anyone interested in a 45-minute pair-study room tonight? I am reviewing Flexbox and semantic HTML.',
                accent: 'from-[#60a5fa] to-[#2563eb]',
                replies: 9,
                reactions: [{ emoji: '🙌', count: 8 }],
              },
            ],
          },
    [isVi]
  );

  const members = useMemo(
    () =>
      isVi
        ? [
            { name: 'Mentor_Alex', role: content.mentor, status: 'typing' },
            { name: 'NewbieDev', role: content.member, status: 'online' },
            { name: 'UI_Beans', role: content.builder, status: 'online' },
            { name: 'LanCode', role: content.member, status: 'idle' },
            { name: 'StudyBuddy', role: content.member, status: 'online' },
          ]
        : [
            { name: 'Mentor_Alex', role: content.mentor, status: 'typing' },
            { name: 'NewbieDev', role: content.member, status: 'online' },
            { name: 'UI_Beans', role: content.builder, status: 'online' },
            { name: 'LanCode', role: content.member, status: 'idle' },
            { name: 'StudyBuddy', role: content.member, status: 'online' },
          ],
    [content, isVi]
  );

  const [activeChannelId, setActiveChannelId] = useState('getting-started');
  const [draft, setDraft] = useState('');
  const [messagesByChannel, setMessagesByChannel] =
    useState<Record<string, ChatMessage[]>>(initialMessages);
  const [realPosts, setRealPosts] = useState<ForumPost[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const activeChannel =
    channels.find((channel) => channel.id === activeChannelId) ?? channels[0];
  const activeMessages = messagesByChannel[activeChannelId] ?? [];

  useEffect(() => {
    // Fetch real posts when channel changes
    getPosts(activeChannelId).then(setRealPosts).catch(console.error);
  }, [activeChannelId]);

  const sendMessage = () => {
    const value = draft.trim();
    if (!value) return;

    const nextMessage: ChatMessage = {
      id: `${activeChannelId}-${Date.now()}`,
      author: content.you,
      role: 'you',
      time: isVi ? 'Vừa xong' : 'Just now',
      body: value,
      accent: 'from-[#ff7e5f] to-[#fb7185]',
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] ?? []), nextMessage],
    }));

    // Also send to real API
    createPost(activeChannelId, value)
      .then((newPost) => {
        setRealPosts((prev) => [newPost, ...prev]);
      })
      .catch(console.error);

    setDraft('');
  };

  const onComposerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] overflow-hidden flex flex-col">
      <SideNav />
      <div className="relative z-10 md:pl-[96px] flex-1 flex h-screen">
        <aside className="hidden xl:flex w-[320px] border-r border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] flex-col">
          <div className="p-5 border-b border-[color:var(--cg-border)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--cg-text-muted)]">
              {content.workspace}
            </p>
            <h1 className="mt-2 text-2xl font-bold">
              {content.chatFeelsAlive}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
              {content.workspaceDesc}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--cg-text-muted)]">
                {content.roomGuide}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                {content.roomGuideDesc}
              </p>
            </div>

            {(['learning', 'community'] as const).map((group) => (
              <div key={group}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--cg-text-muted)]">
                  {group === 'learning' ? content.learning : content.community}
                </p>
                <div className="space-y-2">
                  {channels
                    .filter((channel) => channel.group === group)
                    .map((channel) => {
                      const active = channel.id === activeChannelId;
                      return (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => setActiveChannelId(channel.id)}
                          className={cx(
                            'w-full rounded-2xl border px-4 py-3 text-left transition-all',
                            active
                              ? 'border-[#4ade80]/35 bg-[#4ade80]/10 shadow-[0_0_0_1px_rgba(74,222,128,0.12)]'
                              : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] hover:bg-[color:var(--cg-container-a30)]'
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="text-[color:var(--cg-text-muted)]">
                                #
                              </span>
                              <span className="truncate font-semibold">
                                {channel.name}
                              </span>
                              {channel.badge ? (
                                <span className="rounded-full border border-[#a78bfa]/30 bg-[#a78bfa]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c4b5fd]">
                                  {channel.badge}
                                </span>
                              ) : null}
                            </div>
                            {channel.unread > 0 ? (
                              <span className="rounded-full bg-[#ff7e5f] px-2 py-0.5 text-[10px] font-bold text-white">
                                {channel.unread}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                            {channel.topic}
                          </p>
                          <div className="mt-3 flex items-center gap-3 text-[11px] text-[color:var(--cg-text-muted)]">
                            <span>
                              {channel.presence} {content.onlineNow}
                            </span>
                            <span>
                              {channel.pinned} {content.pinned}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col bg-[color:var(--cg-bg)]">
          <header className="border-b border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-4 md:px-6 shrink-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[color:var(--cg-text-muted)]">#</span>
                  <h2 className="truncate text-xl font-bold">
                    {activeChannel.name}
                  </h2>
                  {activeChannel.badge ? (
                    <span className="rounded-full border border-[#4ade80]/30 bg-[#4ade80]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4ade80]">
                      {activeChannel.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--cg-text-muted)]">
                  {activeChannel.topic}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg)] px-3 py-2 text-xs text-[color:var(--cg-text-muted)]">
                  {activeChannel.presence} {content.onlineNow}
                </div>
                <div className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg)] px-3 py-2 text-xs text-[color:var(--cg-text-muted)]">
                  {activeChannel.pinned} {content.pinned}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 min-h-0 flex">
            <section className="flex-1 min-w-0 flex flex-col">
              <div className="border-b border-[color:var(--cg-border)] px-4 py-3 md:px-6">
                <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
                  <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--cg-text-muted)]">
                      {content.chatFeelsAlive}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                      {content.chatFeelsAliveDesc}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--cg-text-muted)]">
                      {content.quickActions}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        content.actionAsk,
                        content.actionReview,
                        content.actionPair,
                        content.actionShare,
                      ].map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => setDraft(action)}
                          className="rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-bg)] px-3 py-1.5 text-xs font-medium text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
                <div className="mx-auto max-w-4xl space-y-6">
                  {activeMessages.map((message) => (
                    <article key={message.id} className="flex gap-4">
                      <div
                        className={cx(
                          'h-11 w-11 flex-shrink-0 rounded-2xl bg-gradient-to-br shadow-lg',
                          message.accent
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() =>
                              setSelectedUserId(message.authorId || 'fake')
                            }
                            className="font-semibold hover:underline"
                          >
                            {message.author}
                          </button>
                          {message.role ? (
                            <span
                              className={cx(
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
                                message.role === 'mentor'
                                  ? 'bg-[#4ade80]/10 text-[#4ade80]'
                                  : message.role === 'builder'
                                    ? 'bg-[#a78bfa]/12 text-[#c4b5fd]'
                                    : message.role === 'you'
                                      ? 'bg-[#ff7e5f]/12 text-[#ffb49e]'
                                      : 'bg-[color:var(--cg-container-a30)] text-[color:var(--cg-text-muted)]'
                              )}
                            >
                              {message.role === 'mentor'
                                ? content.mentor
                                : message.role === 'builder'
                                  ? content.builder
                                  : message.role === 'you'
                                    ? content.you
                                    : content.member}
                            </span>
                          ) : null}
                          <span className="text-xs text-[color:var(--cg-text-muted)]">
                            {message.time}
                          </span>
                        </div>

                        <div className="mt-2 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
                          <p className="whitespace-pre-wrap text-sm leading-7 text-[color:var(--cg-text)]">
                            {message.body}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {message.reactions?.map((reaction) => (
                            <span
                              key={`${message.id}-${reaction.emoji}`}
                              className="rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-bg)] px-2.5 py-1 text-xs text-[color:var(--cg-text-muted)]"
                            >
                              {reaction.emoji} {reaction.count}
                            </span>
                          ))}
                          {typeof message.replies === 'number' ? (
                            <button
                              type="button"
                              className="rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-bg)] px-2.5 py-1 text-xs text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]"
                            >
                              {message.replies}{' '}
                              {isVi
                                ? 'phản hồi trong thread'
                                : 'thread replies'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="border-t border-[color:var(--cg-border)] bg-[color:var(--cg-bg)] px-4 py-4 md:px-6 shrink-0">
                <div className="mx-auto max-w-4xl">
                  <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-3">
                    <div className="flex items-center gap-2 border-b border-[color:var(--cg-border)] pb-3">
                      {[
                        'add',
                        'attach_file',
                        'tag_faces',
                        'alternate_email',
                      ].map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className="rounded-xl p-2 text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a30)] hover:text-[color:var(--cg-text)]"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {icon}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <input
                        type="text"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={onComposerKeyDown}
                        placeholder={`${content.placeholderPrefix} #${activeChannel.name}...`}
                        className="flex-1 bg-transparent px-1 py-3 text-sm text-[color:var(--cg-text)] placeholder:text-[color:var(--cg-text-muted)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={sendMessage}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#4ade80] px-4 py-3 text-sm font-semibold text-[#0f0b3c] transition-opacity hover:opacity-85"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          send
                        </span>
                        {isVi ? 'Gửi' : 'Send'}
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--cg-text-muted)]">
                    {content.enterHint}
                  </p>
                </div>
              </div>
            </section>

            <aside className="hidden 2xl:flex w-[320px] border-l border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] flex-col">
              <div className="p-5 border-b border-[color:var(--cg-border)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--cg-text-muted)]">
                  {content.members}
                </p>
                <h3 className="mt-2 text-lg font-bold">
                  {content.memberTitle}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--cg-text-muted)]">
                    {content.activeNow}
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {activeChannel.presence}
                  </p>
                  <p className="text-sm text-[color:var(--cg-text-muted)]">
                    {content.onlineNow} trong `#{activeChannel.name}`
                  </p>
                </div>

                {members.map((member) => (
                  <div
                    key={member.name}
                    className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{member.name}</p>
                        <p className="text-xs text-[color:var(--cg-text-muted)]">
                          {member.role}
                        </p>
                      </div>
                      <span
                        className={cx(
                          'h-2.5 w-2.5 rounded-full',
                          member.status === 'typing'
                            ? 'bg-[#f59e0b]'
                            : member.status === 'idle'
                              ? 'bg-[#a78bfa]'
                              : 'bg-[#4ade80]'
                        )}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-4 mt-4 border-t border-[color:var(--cg-border)]">
                  <FriendsSidebar />
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
      {selectedUserId && selectedUserId !== 'fake' && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
