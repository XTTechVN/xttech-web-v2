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
      {/* Sub-tab Switcher: Cấu hình khung vs Cấu hình cánh */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 py-2.5 px-3 sm:px-6 flex items-center justify-center">
        <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200/80 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => setSubTab('frame')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              subTab === 'frame'
                ? 'bg-primary text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <LayoutGrid size={14} />
            <span>Cấu hình khung</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('sash')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              subTab === 'sash'
                ? 'bg-primary text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <DoorClosed size={14} />
            <span>Cấu hình cánh</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex-1 p-4 sm:p-6 overflow-y-auto">
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
