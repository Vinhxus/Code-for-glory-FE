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
  { key: 'tracking', label: 'Tracking' },
  { key: 'finished', label: 'Finished' },
  { key: 'unfinished', label: 'Unfinished' },
  { key: 'saved', label: 'Saved' },
];

export default function TabComponent() {
  const [activeTab, setActiveTab] = useState<string>('tracking');

  return (
    <div className="flex flex-col tab-container-root">
      <Header />
      <SideNav />
      <div className="flex justify-center pt-6 pb-2 px-4 header-bar relative">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 px-3 py-1.5 
                    text-sm font-normal text-gray-700 bg-gray-100 hover:bg-gray-200 
                    active:bg-gray-300 active:scale-95 border border-gray-300/50 
                    rounded-md transition-all duration-150 ease-in-out
                    dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700 back-button"
        >
          {/* Icon mũi tên trái */}
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
        <div className="flex gap-1 p-1 rounded-xl tab-wrapper">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === t.key
                  ? 'bg-[var(--cg-amber)] text-[#0f0b3c] font-bold'
                  : 'text-[var(--cg-text-muted)] hover:bg-yellow-500 text-[#0f0b3c] font-medium'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <HButton
          className="px-4 py-2 text-2xl bg-amber-600 text-green-600"
          variant="recall"
          onClick={() => setActiveTab('recall')}
        >
          Recall
        </HButton>
      </div>

      {activeTab === 'tracking' && <Tracking />}
      {activeTab === 'finished' && <Finished />}
      {activeTab === 'unfinished' && <UnFinished />}
      {activeTab === 'saved' && <Saved />}
      {activeTab === 'recall' && <Recall />}
    </div>
  );
}
