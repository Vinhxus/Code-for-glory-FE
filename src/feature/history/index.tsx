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

// Thống nhất thứ tự hiển thị tab từ file 2 (hoặc bạn có thể đổi lại nếu muốn)
const TABS: TabItem[] = [
  { key: 'tracking', label: 'Tracking' },
  { key: 'finished', label: 'Finished' },
  { key: 'unfinished', label: 'Unfinished' },
  { key: 'saved', label: 'Saved' },
];

export default function TabComponent() {
  const [activeTab, setActiveTab] = useState<string>('tracking');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // Quản lý menu mobile

  const currentTabLabel =
    TABS.find((t) => t.key === activeTab)?.label || 'History';

  return (
    <div className="flex flex-col tab-container-root relative overflow-x-hidden">
      {/* Background ambient - đồng bộ màu & hiệu ứng với Homepage */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#a78bfa 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute -top-[15%] -left-[10%] h-[600px] w-[600px] rounded-full bg-[color:var(--cg-coral-a18)] blur-[160px]" />
        <div className="absolute top-[35%] -right-[10%] h-[500px] w-[500px] rounded-full bg-[color:var(--cg-green-a14)] blur-[140px]" />
        <div
          className="absolute bottom-[5%] left-[25%] h-[350px] w-[350px] rounded-full"
          style={{
            background: 'rgba(167,139,250,0.08)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Header />
        <SideNav />
        {/* GIAO DIỆN MOBILE: THANH HEADER BAR + HAMBURGER (md:hidden)  */}

        <div className="history-header-bar md:hidden">
          <h1 className="history-page-title">{currentTabLabel}</h1>

          <div className="relative">
            {/* Nút Hamburger tùy biến vị trí tuyệt đối trên mobile */}
            <button
              className="hamburger-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 36 36"
                fill="none"
              >
                <circle cx="18" cy="18" r="18" fill="#5eead4" />
                <circle cx="13" cy="13" r="3.4" fill="#0f172a" />
                <circle cx="23" cy="13" r="3.4" fill="#0f172a" />
                <circle cx="13" cy="23" r="3.4" fill="#0f172a" />
                <circle cx="23" cy="23" r="3.4" fill="#0f172a" />
              </svg>
            </button>
          </div>
        </div>

        {/* MENU XỔ XUỐNG CỦA MOBILE (Chỉ hoạt động khi ở màn hình nhỏ và isMenuOpen = true) */}
        <div
          className={`history-menu-container md:hidden ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="history-box-blue"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="history-box-title">History</h2>
            <div className="history-tabs-list">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setActiveTab(t.key);
                    setIsMenuOpen(false);
                  }}
                  className={`history-tab-item ${activeTab === t.key ? 'active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
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

        {/* 2. GIAO DIỆN DESKTOP: THANH TAB NGANG CỦA INDEX2 (md:flex)                */}
        <div className="hidden md:flex justify-center pt-6 pb-2 px-4 header-bar relative">
          {/* Nút Back */}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 
                    text-sm font-medium text-[color:var(--cg-text-muted)] 
                    bg-[color:var(--cg-container-a16)] backdrop-blur-md
                    border border-[color:var(--cg-border)]
                    hover:bg-[color:var(--cg-container-a22)] hover:text-[color:var(--cg-text)] hover:border-[#a78bfa]/40
                    active:scale-95
                    rounded-xl transition-all duration-150 ease-in-out back-button-his"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <span>Back</span>
          </button>

          {/* Danh sách các Tab hàng ngang */}
          <div className="flex gap-1 p-1 rounded-xl tab-wrapper">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === t.key
                    ? 'bg-[var(--cg-amber)] text-[#0f0b3c] font-bold shadow-[0_0_18px_rgba(251,191,36,0.35)]'
                    : 'text-[var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a22)] hover:text-[color:var(--cg-text)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Nút Recall trên Desktop */}
          <HButton
            className="px-4 py-2 text-sm font-bold rounded-xl border border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80] hover:bg-[#4ade80]/20 hover:shadow-[0_0_18px_rgba(74,222,128,0.25)] transition-all absolute right-8"
            variant="recall"
            onClick={() => setActiveTab('recall')}
          >
            Recall
          </HButton>
        </div>

        {/* 3. PHẦN NỘI DUNG TABS (Dùng chung cho cả 2 thiết bị)                         */}
        <div className="history-tab-content">
          {activeTab === 'tracking' && <Tracking />}
          {activeTab === 'finished' && <Finished />}
          {activeTab === 'unfinished' && <UnFinished />}
          {activeTab === 'saved' && <Saved />}
          {activeTab === 'recall' && <Recall />}
        </div>
      </div>
    </div>
  );
}
