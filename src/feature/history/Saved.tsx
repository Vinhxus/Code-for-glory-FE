import React, { useMemo, useState, type FC } from 'react';
import './Saved.css';

interface LoreItem {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  tags: string[];
  isBookmarked: boolean;
}

interface LoreCardProps {
  data: LoreItem;
  onRemoveBookmark: (id: string) => void;
}

const LoreCard: FC<LoreCardProps> = ({ data, onRemoveBookmark }) => {
  const { id, title, description, bannerUrl, tags } = data;
  const [isDisappearing, setIsDisappearing] = useState<boolean>(false);

  const handleRemoveClick = () => {
    // Kích hoạt class CSS hiệu ứng biến mất trước
    setIsDisappearing(true);

    // Đợi 300ms (khớp với thời gian transition bên CSS) rồi mới xóa hẳn data ở component cha
    setTimeout(() => {
      onRemoveBookmark(id);
    }, 300);
  };

  return (
    <article
      className={`lore-card glass-card card-hover ${isDisappearing ? 'lore-card--fade-out' : ''}`}
    >
      <div className="lore-banner">
        <img src={bannerUrl} alt={title} loading="lazy" />
        {/* Nút hủy */}
        <button
          className="btn-bookmark-remove"
          onClick={handleRemoveClick}
          aria-label="Hủy lưu bài viết"
          title="Hủy lưu bài viết"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="lore-body">
        <div className="lore-tags">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={index === 0 ? 'badge-purple' : 'badge-default'}
            >
              {tag.toUpperCase()}
            </span>
          ))}
        </div>

        <h2 className="lore-card-title">{title}</h2>
        <p className="lore-card-desc">{description}</p>

        <div className="lore-footer">
          <a href={`/lore/${id}`} className="link-recall">
            RECALL LORE <span className="arrow">&rarr;</span>
          </a>
        </div>
      </div>
    </article>
  );
};

const INITIAL_LORE_DATA: LoreItem[] = [
  {
    id: '1',
    title: 'The Sigils of State',
    description:
      'Mastering complex state management using custom hooks and the Context API within the...',
    bannerUrl: 'https://picsum.photos/id/1005/400/250',
    tags: ['React', 'Advanced Architecture'],
    isBookmarked: true,
  },
  {
    id: '2',
    title: 'Asynchronous Alchemy',
    description:
      'Optimizing event-loop performance for high-throughput digital environments using advanced...',
    bannerUrl: 'https://picsum.photos/id/1018/400/250',
    tags: ['Node.js', 'Performance'],
    isBookmarked: true,
  },
];

export const Saved: React.FC = () => {
  const [loreList, setLoreList] = useState<LoreItem[]>(INITIAL_LORE_DATA);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleRemoveBookmark = (id: string) => {
    setLoreList((prevList) => prevList.filter((item) => item.id !== id));
  };

  const filteredLore = useMemo(() => {
    return loreList.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [loreList, searchQuery]);

  return (
    <div className="lore-container animate-fade-in-up">
      <div className="lore-header-row">
        <div>
          <h1 className="lore-title gradient-text-amber ">Bookmarked Lore</h1>
          <p className="lore-subtitle">
            Ancient knowledge preserved for your mastery.
          </p>
        </div>

        <div className="search-wrapper">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            placeholder="Search saved scrolls..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="lore-grid">
        {filteredLore.map((item) => (
          <LoreCard
            key={item.id}
            data={item}
            onRemoveBookmark={handleRemoveBookmark}
          />
        ))}

        <div className="discover-card card-hover">
          <div className="discover-content">
            <span className="material-symbols-outlined discover-icon">
              explore
            </span>
            <p>DISCOVER MORE LORE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Saved;
