'use client';

import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { getProjectGlassOrders, getProjects } from '@/actions';
import { Button, Select } from '@/components';
import { GlassOrderGenerateModal, GlassOrdersTable } from '@/components/warehouse';
import { GlassOrder, WarehouseSupplier } from '@/types';
import { showErrorToast } from '@/utils';

interface GlassOrdersTabProps {
  suppliers: WarehouseSupplier[];
}

export function GlassOrdersTab({ suppliers }: GlassOrdersTabProps) {
  const [projects, setProjects] = useState<Array<{ id: number; name: string; code?: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const [glassOrders, setGlassOrders] = useState<GlassOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const glassSuppliers = suppliers.filter((s) => s.supplierType === 'glass');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getProjects({ limit: 50 });
        if (cancelled) return;
        const list = res?.items || [];
        setProjects(list.map((p) => ({ id: p.id, name: p.name, code: p.code })));
        if (list.length > 0) {
          const firstId = list[0].id;
          setSelectedProjectId(firstId);
          const ordersRes = await getProjectGlassOrders(firstId);
          if (!cancelled) setGlassOrders(ordersRes?.items || []);
        }
      } catch (err: unknown) {
        if (!cancelled) showErrorToast(err, 'Lỗi tải dữ liệu đơn đặt kính');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchOrders = async (projId: number) => {
    setLoading(true);
    try {
      const res = await getProjectGlassOrders(projId);
      setGlassOrders(res?.items || []);
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi tải danh sách đơn đặt kính');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (projId: number) => {
    setSelectedProjectId(projId);
    if (projId) {
      fetchOrders(projId);
    } else {
      setGlassOrders([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider shrink-0">
            Dự Án:
          </label>
          <div className="w-full sm:w-80">
            <Select
              value={selectedProjectId || ''}
              onChange={(e) => handleProjectChange(Number(e.target.value))}
              options={projects.map((p) => ({
                value: p.id,
                label: `${p.code ? `[${p.code}] ` : ''}${p.name}`,
              }))}
              className="text-xs"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedProjectId && fetchOrders(selectedProjectId)}
            leftIcon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
            className="text-xs"
          >
            Làm mới
          </Button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowGenerateModal(true)}
          disabled={!selectedProjectId}
          leftIcon={<Plus size={14} />}
          className="text-xs shrink-0"
        >
          Bóc Tách & Lập Đơn Đặt Kính
        </Button>
      </div>

      <GlassOrdersTable
        key={selectedProjectId ?? 'none'}
        projectId={selectedProjectId}
        orders={glassOrders}
        loading={loading}
        onRefresh={() => selectedProjectId && fetchOrders(selectedProjectId)}
      />

      <GlassOrderGenerateModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        projectId={selectedProjectId}
        glassSuppliers={glassSuppliers}
        onSuccess={() => selectedProjectId && fetchOrders(selectedProjectId)}
      />
    </div>
  );
}
