'use client';

import React, { useState } from 'react';
import { FrameConfig, SashConfig } from '../../studio-types';
import { ConfigFrameTab } from './config-frame-tab';
import { ConfigSashTab } from './config-sash-tab';
import { ProfileBar } from '@/types';
import { LayoutGrid, DoorClosed } from 'lucide-react';

interface ConfigTabViewProps {
  frameConfig: FrameConfig;
  sashConfig: SashConfig;
  onChangeFrameConfig: (updates: Partial<FrameConfig>) => void;
  onChangeSashConfig: (updates: Partial<SashConfig>) => void;
  profiles: ProfileBar[];
}

export const ConfigTabView: React.FC<ConfigTabViewProps> = ({
  frameConfig,
  sashConfig,
  onChangeFrameConfig,
  onChangeSashConfig,
  profiles,
}) => {
  const [subTab, setSubTab] = useState<'frame' | 'sash'>('frame');

  return (
    <div className="flex flex-col h-full bg-slate-50/50 overflow-y-auto">
      {/* Sub-tab Switcher: Cấu hình khung vs Cấu hình cánh (Matches Windova) */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 py-3 px-6 flex items-center justify-center">
        <div className="bg-gray-100/90 p-1 rounded-xl flex items-center gap-1 border border-gray-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setSubTab('frame')}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'frame'
                ? 'bg-white text-blue-900 shadow-xs ring-1 ring-black/5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid size={14} className={subTab === 'frame' ? 'text-blue-900' : 'text-gray-400'} />
            <span>CẤU HÌNH KHUNG</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('sash')}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'sash'
                ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-black/5'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <DoorClosed size={14} className={subTab === 'sash' ? 'text-emerald-800' : 'text-gray-400'} />
            <span>CẤU HÌNH CÁNH</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto w-full py-4 px-4">
        {subTab === 'frame' ? (
          <ConfigFrameTab
            config={frameConfig}
            onChangeConfig={onChangeFrameConfig}
            profiles={profiles}
          />
        ) : (
          <ConfigSashTab
            config={sashConfig}
            onChangeConfig={onChangeSashConfig}
            profiles={profiles}
          />
        )}
      </div>
    </div>
  );
};
