'use client';

import React, { useState } from 'react';
import DoorsPage from '../doors/page';
import MaterialsPage from '../materials/page';
import AccessoriesPage from '../accessories/page';
import ExtraOptionsPage from '../extra-options/page';
import FormulasPage from '../formulas/page';
import { Columns, ListChecks, Settings, Calculator, LayoutGrid } from 'lucide-react';

import { useRouter } from 'next/navigation';

const TABS = [
  { id: 'materials', label: 'Hệ nhôm', component: MaterialsPage, icon: <LayoutGrid size={16} /> },
  { id: 'doors', label: 'Biên dạng cửa', component: DoorsPage, icon: <Columns size={16} /> },
  { id: 'accessories', label: 'Phụ kiện', component: AccessoriesPage, icon: <ListChecks size={16} /> },
  { id: 'extra-options', label: 'Tùy chọn phát sinh', component: ExtraOptionsPage, icon: <Settings size={16} /> },
  { id: 'formulas', label: 'Công thức', component: FormulasPage, icon: <Calculator size={16} /> },
];

export default function ProjectConfigurationPage() {
  const [activeTab, setActiveTab] = useState('doors');
  const router = useRouter();

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component || DoorsPage;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push('/app/projects/configuration');
  };

  return (
    <div className="flex flex-col gap-4 text-black">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto scrollbar-none gap-4 p-1">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                isActive ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-primary hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <ActiveComponent />
      </div>
    </div>
  );
}
