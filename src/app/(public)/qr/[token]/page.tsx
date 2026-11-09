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
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-12">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-3.5 sm:px-4 lg:px-8 py-2.5 lg:py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg lg:max-w-7xl items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-[#045863] min-w-0">
            <QrCode size={18} className="shrink-0" />
            <span className="text-xs lg:text-sm font-bold uppercase tracking-wider truncate">
              XT-Tech · Cổng QR Công Trình
            </span>
          </div>

          {/* Thanh điều hướng ngang trên Máy tính (Desktop >= 1024px) */}
          <nav
            aria-label="Điều hướng cổng QR trên máy tính"
            className="hidden lg:flex items-center gap-1.5 rounded-xl bg-slate-100/90 p-1 border border-slate-200/70"
          >
            {navItems.map((item) => {
              const ActiveIcon = item.Icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-[#045863] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                  }`}
                >
                  <ActiveIcon size={15} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`inline-flex h-4 min-w-[18px] items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold tabular-nums ${
                        isActive
                          ? 'bg-white text-[#045863]'
                          : 'bg-[#045863]/15 text-[#045863]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {view.floorName && (
              <span className="hidden sm:inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {view.floorName}
              </span>
            )}
            <span className="rounded-md bg-[#045863]/10 border border-[#045863]/20 px-2 sm:px-2.5 py-1 font-mono text-[11px] sm:text-xs font-bold text-[#045863]">
              {view.code}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg lg:max-w-7xl space-y-3.5 sm:space-y-4 lg:space-y-6 px-3 sm:px-4 lg:px-8 pt-3 sm:pt-4 lg:pt-6">
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

      {/* Thanh điều hướng đáy cố định cho Mobile (< 1024px) */}
      <nav
        aria-label="Điều hướng cổng QR"
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
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
                className={`relative flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[11px] font-semibold transition cursor-pointer ${
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
