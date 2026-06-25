import React, { useState } from 'react';
import Tracking from './Tracking';
import SideNav from '../../components/SideNav';
import Header from '../../components/layout/Header';
import './index.css';
import Finished from './Finished';
import UnFinished from './UnFinished';
import Saved from './Saved';
import HButton from '../../components/history/HButton';
import Recall from '../../route/Recall';

interface TabItem {
  key: string;
  label: string;
}

const TABS: TabItem[] = [
  { key: 'finished', label: 'Finished' },
  { key: 'unfinished', label: 'Unfinished' },
  { key: 'saved', label: 'Saved' },
  { key: 'tracking', label: 'Tracking' },
];

export default function TabComponent() {
  const [activeTab, setActiveTab] = useState<string>('tracking');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // Trạng thái đóng mở menu trên mobile

  // Tìm label của tab hiện tại để hiển thị làm tiêu đề giống trong ảnh 2
  const currentTabLabel =
    TABS.find((t) => t.key === activeTab)?.label || 'History';

  return (
    <div className="flex flex-col tab-container-root">
      <Header />
      <SideNav />

      {/* HEADER BAR CHỨA TIÊU ĐỀ VÀ NÚT HAMBURGER */}
      <div className="history-header-bar">
        <h1 className="history-page-title">{currentTabLabel}</h1>

        {/* Nút Hamburger chỉ xuất hiện trên Mobile */}
        <button
          className="hamburger-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      {/* KHỐI TABS (MENU THIẾT KẾ THEO ẢNH CỦA BẠN) */}
      <div className={`history-menu-container ${isMenuOpen ? 'open' : ''}`}>
        <div className="history-box-blue">
          <h2 className="history-box-title">History</h2>
          <div className="history-tabs-list">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTab(t.key);
                  setIsMenuOpen(false); // Bấm xong thì đóng menu lại
                }}
                className={`history-tab-item ${activeTab === t.key ? 'active' : ''}`}
              >
                {t.label}
              </button>
            ))}

            {/* Nút Recall tích hợp thêm vào menu */}
            <HButton
              className="history-tab-item recall-btn-custom"
              variant="recall"
              onClick={() => {
                setActiveTab('recall');
                setIsMenuOpen(false);
              }}
            >
              Recall
            </HButton>
          </div>
        </div>
      </div>

      {/* NỘI DUNG CỦA TAB */}
      <div className="history-tab-content">
        {activeTab === 'tracking' && <Tracking />}
        {activeTab === 'finished' && <Finished />}
        {activeTab === 'unfinished' && <UnFinished />}
        {activeTab === 'saved' && <Saved />}
        {activeTab === 'recall' && <Recall />}
      </div>
    </div>
  );
}
