'use client';

import React, { use, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpenCheck,
  DoorOpen,
  LayoutList,
  Loader2,
  QrCode,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { getPositionQrView, getQrProjectDoors, getQrProjectWarranty } from '@/actions';
import { useAuthStore } from '@/stores';
import { getErrorMessage, type QrPortalTabId } from './_components/qr-helpers';
import { QrProjectHeader } from './_components/qr-project-header';
import { TabClaimRequest } from './_components/tab-claim-request';
import { TabProjectDoors } from './_components/tab-project-doors';
import { TabThisDoor } from './_components/tab-this-door';
import { TabWarrantyBook } from './_components/tab-warranty-book';

export default function QrPositionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const queryClient = useQueryClient();
  const isLoggedIn = Boolean(useAuthStore((state) => state.accessToken));

  const [activeTab, setActiveTab] = useState<QrPortalTabId>('this_door');
  const [selectedDoorIds, setSelectedDoorIds] = useState<number[]>([]);

  const {
    data: view,
    isLoading: isLoadingView,
    error: viewError,
    refetch: refetchView,
  } = useQuery({
    queryKey: ['qr_position_view', token],
    queryFn: () => getPositionQrView(token),
    staleTime: 60 * 1000,
  });

  const shouldLoadDoors = activeTab === 'project_doors' || activeTab === 'claim_request';
  const { data: projectDoors = [], isLoading: isLoadingDoors } = useQuery({
    queryKey: ['qr_project_doors', token],
    queryFn: () => getQrProjectDoors(token),
    enabled: Boolean(view) && shouldLoadDoors,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: warrantySummary,
    isLoading: isLoadingWarranty,
    refetch: refetchWarranty,
  } = useQuery({
    queryKey: ['qr_project_warranty', token],
    queryFn: () => getQrProjectWarranty(token),
    enabled: Boolean(view) && activeTab === 'warranty_book',
    staleTime: 30 * 1000,
  });

  if (viewError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
        <ShieldAlert className="text-amber-500" size={42} />
        <p className="text-sm font-medium text-slate-700">{getErrorMessage(viewError)}</p>
      </main>
    );
  }

  if (isLoadingView || !view) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#045863]" size={28} />
      </main>
    );
  }

  const effectiveSelectedIds =
    selectedDoorIds.length > 0 ? selectedDoorIds : [view.positionId];

  const handleToggleDoor = (doorId: number) => {
    setSelectedDoorIds((prev) => {
      const current = prev.length > 0 ? prev : [view.positionId];
      return current.includes(doorId)
        ? current.filter((id) => id !== doorId)
        : [...current, doorId];
    });
  };

  const handleSelectAllFloor = (floorDoorIds: number[]) => {
    setSelectedDoorIds((prev) => {
      const current = new Set(prev.length > 0 ? prev : [view.positionId]);
      const allSelected = floorDoorIds.every((id) => current.has(id));
      if (allSelected) {
        floorDoorIds.forEach((id) => current.delete(id));
      } else {
        floorDoorIds.forEach((id) => current.add(id));
      }
      return Array.from(current);
    });
  };

  const handleRefreshAll = () => {
    void refetchView();
    void refetchWarranty();
    if (view) {
      void queryClient.invalidateQueries({ queryKey: ['project_warranty', view.projectId] });
    }
  };

  const navItems: {
    id: QrPortalTabId;
    label: string;
    badge?: number;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    { id: 'this_door', label: 'Bộ cửa này', Icon: DoorOpen },
    {
      id: 'project_doors',
      label: 'Cửa dự án',
      badge: view.totalProjectDoors,
      Icon: LayoutList,
    },
    {
      id: 'claim_request',
      label: 'Gửi yêu cầu',
      badge: selectedDoorIds.length > 0 ? selectedDoorIds.length : undefined,
      Icon: Wrench,
    },
    {
      id: 'warranty_book',
      label: 'Sổ bảo hành',
      badge:
        view.warrantyHeader.openClaimsCount > 0
          ? view.warrantyHeader.openClaimsCount
          : undefined,
      Icon: BookOpenCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2 text-[#045863]">
            <QrCode size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">
              XT-Tech · Cổng QR Công Trình
            </span>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
            {view.code}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-3.5 pt-3.5">
        <QrProjectHeader
          view={view}
          onOpenWarrantyBook={() => setActiveTab('warranty_book')}
        />

        {activeTab === 'this_door' && (
          <TabThisDoor
            token={token}
            view={view}
            isLoggedIn={isLoggedIn}
            onRequestWarrantyThisDoor={() => {
              setSelectedDoorIds([view.positionId]);
              setActiveTab('claim_request');
            }}
            onRefresh={handleRefreshAll}
          />
        )}

        {activeTab === 'project_doors' && (
          <TabProjectDoors
            doors={projectDoors}
            isLoading={isLoadingDoors}
            scannedPositionId={view.positionId}
            selectedDoorIds={effectiveSelectedIds}
            onToggleDoor={handleToggleDoor}
            onSelectAllFloor={handleSelectAllFloor}
            onProceedToClaim={() => setActiveTab('claim_request')}
          />
        )}

        {activeTab === 'claim_request' && (
          <TabClaimRequest
            token={token}
            view={view}
            doors={projectDoors}
            isLoadingDoors={isLoadingDoors}
            selectedDoorIds={effectiveSelectedIds}
            onChangeSelectedDoorIds={setSelectedDoorIds}
            onClaimCreated={() => {
              handleRefreshAll();
              setActiveTab('warranty_book');
            }}
          />
        )}

        {activeTab === 'warranty_book' && (
          <TabWarrantyBook
            token={token}
            projectId={view.projectId}
            summary={warrantySummary}
            isLoading={isLoadingWarranty}
            isLoggedIn={isLoggedIn}
            onRefresh={handleRefreshAll}
            onRequestNewClaim={() => setActiveTab('claim_request')}
          />
        )}
      </main>

      <nav
        aria-label="Điều hướng cổng QR"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {navItems.map((item) => {
            const ActiveIcon = item.Icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[11px] font-semibold transition ${
                  isActive ? 'text-[#045863]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[#045863]" />
                )}
                <div className="relative">
                  <ActiveIcon size={19} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#045863] px-1 font-mono text-[9px] font-bold tabular-nums text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
