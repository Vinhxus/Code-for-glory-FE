import { useMemo, useState, useEffect, useRef } from 'react';
import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';
import UserProfileModal from '../components/UserProfileModal';
import FriendsSidebar from '../components/FriendsSidebar';
import {
  getPosts,
  createPost,
  getDirectMessages,
  sendDirectMessage,
} from '../services/forumApi';
import type { ForumPost, DirectMessage } from '../services/forumApi';

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
  const [activeChannelId, setActiveChannelId] = useState('getting-started');
  const [draft, setDraft] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<
    'smileys' | 'people' | 'nature' | 'food' | 'activity' | 'symbols'
  >('smileys');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const EMOJI_CATEGORIES = {
    smileys: {
      icon: '😊',
      label: 'Smileys',
      emojis: [
        '😀',
        '😃',
        '😄',
        '😁',
        '😆',
        '😅',
        '🤣',
        '😂',
        '🙂',
        '😊',
        '😇',
        '🥰',
        '😍',
        '😘',
        '😗',
        '😙',
        '😚',
        '😋',
        '😛',
        '😜',
        '🤪',
        '😝',
        '🤑',
        '🤗',
        '🤭',
        '🤫',
        '🤔',
        '🤐',
        '🤨',
        '😐',
        '😑',
        '😶',
        '😏',
        '😒',
        '🙄',
        '😬',
        '🤥',
        '😌',
        '😔',
      ],
    },
    people: {
      icon: '👋',
      label: 'People',
      emojis: [
        '👋',
        '🤚',
        '✋',
        '🖖',
        '👌',
        '🤌',
        '✌️',
        '🤞',
        '🤟',
        '🤘',
        '🤙',
        '👈',
        '👉',
        '👆',
        '🖕',
        '👇',
        '☝️',
        '👍',
        '👎',
        '✊',
        '👊',
        '🤛',
        '🤜',
        '👏',
        '🙌',
        '👐',
        '🤲',
        '🤝',
        '🙏',
        '✍️',
        '💅',
        '🤳',
        '💪',
        '🦾',
        '🦿',
        '🦵',
        '🦶',
        '👂',
        '🦻',
      ],
    },
    nature: {
      icon: '🌿',
      label: 'Nature',
      emojis: [
        '🐶',
        '🐱',
        '🐭',
        '🐹',
        '🐰',
        '🦊',
        '🐻',
        '🐼',
        '🐨',
        '🐯',
        '🦁',
        '🐮',
        '🐷',
        '🐸',
        '🐵',
        '🐔',
        '🐧',
        '🐦',
        '🦆',
        '🦅',
        '🦉',
        '🦇',
        '🐝',
        '🦋',
        '🌸',
        '🌺',
        '🌻',
        '🌼',
        '🌷',
        '🍀',
        '🌱',
        '🌿',
        '🍃',
        '🌲',
        '🌳',
        '🌴',
        '☘️',
        '🌾',
        '💐',
      ],
    },
    food: {
      icon: '🍕',
      label: 'Food',
      emojis: [
        '🍎',
        '🍊',
        '🍋',
        '🍇',
        '🍓',
        '🫐',
        '🍈',
        '🍒',
        '🍑',
        '🥭',
        '🍍',
        '🥥',
        '🥝',
        '🍅',
        '🍆',
        '🥑',
        '🥦',
        '🌽',
        '🌶️',
        '🍄',
        '🧅',
        '🧄',
        '🥔',
        '🍠',
        '🫘',
        '🌰',
        '🍞',
        '🥐',
        '🥖',
        '🫓',
        '🥨',
        '🥯',
        '🧀',
        '🍳',
        '🍕',
        '🌭',
        '🥪',
        '🌮',
        '🌯',
      ],
    },
    activity: {
      icon: '⚽',
      label: 'Activity',
      emojis: [
        '⚽',
        '🏀',
        '🏈',
        '⚾',
        '🥎',
        '🏐',
        '🏉',
        '🥏',
        '🎾',
        '🏸',
        '🏒',
        '🥍',
        '🏏',
        '🪃',
        '🥅',
        '⛳',
        '🪁',
        '🎿',
        '🛷',
        '🥌',
        '🎯',
        '🪀',
        '🪆',
        '🎱',
        '🔮',
        '🧿',
        '🎮',
        '🕹️',
        '🎲',
        '🧩',
        '🧸',
        '🪅',
        '🎭',
        '🎨',
        '🖼️',
        '🎰',
        '🚂',
        '🛳️',
        '✈️',
      ],
    },
    symbols: {
      icon: '💡',
      label: 'Symbols',
      emojis: [
        '❤️',
        '🧡',
        '💛',
        '💚',
        '💙',
        '💜',
        '🖤',
        '🤍',
        '🤎',
        '💔',
        '❣️',
        '💕',
        '💞',
        '💓',
        '💗',
        '💖',
        '💘',
        '💝',
        '💟',
        '☮️',
        '✝️',
        '🔥',
        '💥',
        '✨',
        '⭐',
        '🌟',
        '💫',
        '🎉',
        '🎊',
        '🏆',
        '🥇',
        '🎁',
        '🎈',
        '💡',
        '🔑',
        '🗝️',
        '🔒',
        '🔓',
        '💰',
      ],
    },
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? draft.length;
      const end = input.selectionEnd ?? draft.length;
      const next = draft.slice(0, start) + emoji + draft.slice(end);
      setDraft(next);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setDraft((prev) => prev + emoji);
    }
  };

  const insertMention = () => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? draft.length;
      const next = draft.slice(0, start) + '@' + draft.slice(start);
      setDraft(next);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + 1, start + 1);
      }, 0);
    }
  };

  const wrapText = (prefix: string, suffix = prefix) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const selected = draft.slice(start, end) || 'text';
    const next =
      draft.slice(0, start) + prefix + selected + suffix + draft.slice(end);
    setDraft(next);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 0);
  };

  const [realPosts, setRealPosts] = useState<ForumPost[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeDmUser, setActiveDmUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = activeChannelId.startsWith('dm-')
    ? {
        id: activeChannelId,
        name: activeDmUser?.name || 'Direct Message',
        group: 'community' as const,
        topic: 'Private conversation',
        presence: 1,
        unread: 0,
        pinned: 0,
        badge: 'DM',
      }
    : (channels.find((channel) => channel.id === activeChannelId) ??
      channels[0]);

  useEffect(() => {
    if (activeChannelId.startsWith('dm-')) {
      const targetUserId = activeChannelId.replace('dm-', '');
      getDirectMessages(targetUserId)
        .then(setDirectMessages)
        .catch(console.error);
    } else {
      getPosts(activeChannelId).then(setRealPosts).catch(console.error);
    }
  }, [activeChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [realPosts, directMessages, activeChannelId]);

  const sendMessage = () => {
    const value = draft.trim();
    if (!value) return;

    if (activeChannelId.startsWith('dm-')) {
      const targetUserId = activeChannelId.replace('dm-', '');
      sendDirectMessage(targetUserId, value)
        .then((newMsg) => setDirectMessages((prev) => [...prev, newMsg]))
        .catch(console.error);
    } else {
      createPost(activeChannelId, value)
        .then((newPost) => setRealPosts((prev) => [newPost, ...prev]))
        .catch(console.error);
    }

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
                  {(activeChannelId.startsWith('dm-')
                    ? directMessages
                    : [...realPosts].reverse()
                  ).length === 0 ? (
                    <div className="text-center py-10 text-[color:var(--cg-text-muted)] italic">
                      {isVi
                        ? 'Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!'
                        : 'No messages yet. Start the conversation!'}
                    </div>
                  ) : (
                    (activeChannelId.startsWith('dm-')
                      ? directMessages
                      : [...realPosts].reverse()
                    ).map((message) => {
                      // Map the common properties
                      const isDm = activeChannelId.startsWith('dm-');
                      const msgDm = isDm ? (message as DirectMessage) : null;
                      const msgPost = !isDm ? (message as ForumPost) : null;

                      const authorUser = isDm
                        ? msgDm!.senderId
                        : msgPost!.author;
                      const id = isDm ? msgDm!._id : msgPost!._id;
                      const body = isDm ? msgDm!.body : msgPost!.body;
                      const time = new Date(
                        isDm ? msgDm!.createdAt : msgPost!.createdAt
                      ).toLocaleTimeString();
                      const avatar =
                        authorUser?.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorUser?.username || 'unknown'}`;
                      const username = authorUser?.username || 'Unknown';
                      const role = authorUser?.role || 'member';
                      const authorId = authorUser?._id;

                      return (
                        <article key={id} className="flex gap-4">
                          <img
                            src={avatar}
                            alt={username}
                            className="h-11 w-11 flex-shrink-0 rounded-2xl object-cover shadow-lg border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)]"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => setSelectedUserId(authorId)}
                                className="font-semibold hover:underline"
                              >
                                {username}
                              </button>
                              <span
                                className={cx(
                                  'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
                                  role === 'mentor'
                                    ? 'bg-[#4ade80]/10 text-[#4ade80]'
                                    : role === 'builder'
                                      ? 'bg-[#a78bfa]/12 text-[#c4b5fd]'
                                      : 'bg-[color:var(--cg-container-a30)] text-[color:var(--cg-text-muted)]'
                                )}
                              >
                                {role}
                              </span>
                              <span className="text-xs text-[color:var(--cg-text-muted)]">
                                {time}
                              </span>
                            </div>

                            <div className="mt-2 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
                              <p className="whitespace-pre-wrap text-sm leading-7 text-[color:var(--cg-text)]">
                                {body}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-[color:var(--cg-border)] bg-[color:var(--cg-bg)] px-4 py-4 md:px-6 shrink-0">
                <div className="mx-auto max-w-4xl">
                  <div className="relative rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-3">
                    {/* ── Emoji Picker Panel ─────────────────────────────────── */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 z-50 w-[340px] rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg)] shadow-2xl overflow-hidden">
                        {/* Category Tabs */}
                        <div className="flex items-center border-b border-[color:var(--cg-border)] px-2 pt-2 gap-1">
                          {(
                            Object.entries(EMOJI_CATEGORIES) as [
                              keyof typeof EMOJI_CATEGORIES,
                              { icon: string; label: string; emojis: string[] },
                            ][]
                          ).map(([key, cat]) => (
                            <button
                              key={key}
                              onClick={() => setEmojiCategory(key)}
                              title={cat.label}
                              className={cx(
                                'flex-1 rounded-t-xl py-1.5 text-base transition-colors',
                                emojiCategory === key
                                  ? 'bg-[color:var(--cg-container-a30)] text-[color:var(--cg-text)]'
                                  : 'text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]'
                              )}
                            >
                              {cat.icon}
                            </button>
                          ))}
                          <button
                            onClick={() => setShowEmojiPicker(false)}
                            className="ml-auto p-1.5 text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              close
                            </span>
                          </button>
                        </div>
                        {/* Emoji Grid */}
                        <div className="grid grid-cols-8 gap-0.5 p-2 h-[180px] overflow-y-auto">
                          {EMOJI_CATEGORIES[emojiCategory].emojis.map(
                            (emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  insertEmoji(emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className="flex items-center justify-center rounded-lg p-1.5 text-lg hover:bg-[color:var(--cg-container-a30)] transition-colors"
                              >
                                {emoji}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Toolbar Row ─────────────────────────────────────────── */}
                    <div className="flex items-center gap-1 border-b border-[color:var(--cg-border)] pb-3">
                      {/* Attach File */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={() => {
                          /* TODO: upload */
                        }}
                      />
                      <button
                        type="button"
                        title={isVi ? 'Đính kèm file' : 'Attach file'}
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative rounded-xl p-2 text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a30)] hover:text-[#4ade80] transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          attach_file
                        </span>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--cg-bg)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          {isVi ? 'Đính kèm' : 'Attach'}
                        </span>
                      </button>

                      {/* Image / Screenshot */}
                      <button
                        type="button"
                        title={isVi ? 'Thêm ảnh' : 'Add image'}
                        onClick={() => {
                          const i = document.createElement('input');
                          i.type = 'file';
                          i.accept = 'image/*';
                          i.click();
                        }}
                        className="group relative rounded-xl p-2 text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a30)] hover:text-[#38bdf8] transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          image
                        </span>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--cg-bg)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          {isVi ? 'Ảnh' : 'Image'}
                        </span>
                      </button>

                      {/* Emoji Picker Toggle */}
                      <button
                        type="button"
                        title="Emoji"
                        onClick={() => setShowEmojiPicker((v) => !v)}
                        className={cx(
                          'group relative rounded-xl p-2 transition-all',
                          showEmojiPicker
                            ? 'bg-[#f59e0b]/15 text-[#f59e0b]'
                            : 'text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a30)] hover:text-[#f59e0b]'
                        )}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          mood
                        </span>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--cg-bg)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          Emoji
                        </span>
                      </button>

                      {/* GIF */}
                      <button
                        type="button"
                        title="GIF"
                        onClick={() => setDraft((p) => p + '[GIF] ')}
                        className="group relative rounded-xl p-2 text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a30)] hover:text-[#a78bfa] transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          gif
                        </span>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--cg-bg)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          GIF
                        </span>
                      </button>

                      {/* Mention */}
                      <button
                        type="button"
                        title={isVi ? 'Nhắc tên ai đó' : 'Mention someone'}
                        onClick={insertMention}
                        className="group relative rounded-xl p-2 text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a30)] hover:text-[#fb7185] transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          alternate_email
                        </span>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--cg-bg)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          {isVi ? 'Nhắc tên' : 'Mention'}
                        </span>
                      </button>

                      {/* Divider */}
                      <div className="mx-1 h-5 w-px bg-[color:var(--cg-border)]" />

                      {/* Bold */}
                      <button
                        type="button"
                        title={isVi ? 'In đậm' : 'Bold'}
                        onClick={() => wrapText('**')}
                        className="group relative rounded-xl p-2 text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a30)] hover:text-[color:var(--cg-text)] transition-all font-bold text-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          format_bold
                        </span>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--cg-bg)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          {isVi ? 'Đậm' : 'Bold'}
                        </span>
                      </button>

                      {/* Italic */}
                      <button
                        type="button"
                        title={isVi ? 'In nghiêng' : 'Italic'}
                        onClick={() => wrapText('_')}
                        className="group relative rounded-xl p-2 text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a30)] hover:text-[color:var(--cg-text)] transition-all text-sm italic"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          format_italic
                        </span>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--cg-bg)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          {isVi ? 'Nghiêng' : 'Italic'}
                        </span>
                      </button>

                      {/* Inline Code */}
                      <button
                        type="button"
                        title={isVi ? 'Code nội dòng' : 'Inline code'}
                        onClick={() => wrapText('`')}
                        className="group relative rounded-xl p-2 text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a30)] hover:text-[#4ade80] transition-all font-mono text-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          code
                        </span>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--cg-bg)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          {isVi ? 'Code' : 'Code'}
                        </span>
                      </button>

                      {/* Code Block */}
                      <button
                        type="button"
                        title={isVi ? 'Khối code' : 'Code block'}
                        onClick={() => wrapText('```\n', '\n```')}
                        className="group relative rounded-xl p-2 text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a30)] hover:text-[#a78bfa] transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          data_object
                        </span>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--cg-bg)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          {isVi ? 'Khối code' : 'Code block'}
                        </span>
                      </button>

                      {/* Divider */}
                      <div className="mx-1 h-5 w-px bg-[color:var(--cg-border)]" />

                      {/* Link */}
                      <button
                        type="button"
                        title={isVi ? 'Chèn link' : 'Insert link'}
                        onClick={() => wrapText('[', '](url)')}
                        className="group relative rounded-xl p-2 text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a30)] hover:text-[#38bdf8] transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          link
                        </span>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--cg-bg)] border border-[color:var(--cg-border)] px-2 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          {isVi ? 'Link' : 'Link'}
                        </span>
                      </button>
                    </div>

                    {/* ── Message Input Row ──────────────────────────────────── */}
                    <div className="flex items-center gap-3 pt-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={draft}
                        onChange={(event) => {
                          setDraft(event.target.value);
                          if (showEmojiPicker) setShowEmojiPicker(false);
                        }}
                        onKeyDown={onComposerKeyDown}
                        placeholder={`${content.placeholderPrefix} #${activeChannel.name}...`}
                        className="flex-1 bg-transparent px-1 py-3 text-sm text-[color:var(--cg-text)] placeholder:text-[color:var(--cg-text-muted)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!draft.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#4ade80] px-4 py-2.5 text-sm font-semibold text-[#0f0b3c] transition-all hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          send
                        </span>
                        {isVi ? 'Gửi' : 'Send'}
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-[color:var(--cg-text-muted)]">
                    {isVi
                      ? 'Enter để gửi · Shift+Enter xuống dòng · ** đậm · _ nghiêng · ` code'
                      : 'Enter to send · Shift+Enter for newline · **bold** · _italic_ · `code`'}
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

                <div className="pt-4 mt-4">
                  <FriendsSidebar
                    onViewProfile={(userId) => setSelectedUserId(userId)}
                    onSelectFriend={(id, name) => {
                      setActiveChannelId(`dm-${id}`);
                      setActiveDmUser({ id, name });
                    }}
                  />
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
