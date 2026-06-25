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
      <div className="flex justify-center pt-6 pb-2 px-4 header-bar">
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
