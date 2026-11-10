'use client';

import React, { useEffect, useState } from 'react';
import { Boxes, Plus, RefreshCw } from 'lucide-react';
import { getProjectGlassOrders, getWarehouseSuppliers } from '@/actions';
import { Button } from '@/components';
import { GlassOrderGenerateModal, GlassOrdersTable } from '@/components/warehouse';
import { GlassOrder, WarehouseSupplier } from '@/types';
import { showErrorToast } from '@/utils';

interface ProjectGlassOrdersPanelProps {
  projectId: number;
}

export function ProjectGlassOrdersPanel({ projectId }: ProjectGlassOrdersPanelProps) {
  const [glassOrders, setGlassOrders] = useState<GlassOrder[]>([]);
  const [suppliers, setSuppliers] = useState<WarehouseSupplier[]>([]);
  const [loading, setLoading] = useState<boolean>(() => Boolean(projectId));
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const [ordersRes, suppliersRes] = await Promise.all([
          getProjectGlassOrders(projectId),
          getWarehouseSuppliers({ limit: 100 }).catch(() => null),
        ]);
        if (cancelled) return;
        setGlassOrders(ordersRes?.items || []);
        if (suppliersRes?.items) {
          setSuppliers(suppliersRes.items);
        }
      } catch (err: unknown) {
        if (!cancelled) showErrorToast(err, 'Lỗi tải danh sách đơn đặt kính');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const fetchOrders = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getProjectGlassOrders(projectId);
      setGlassOrders(res?.items || []);
    } catch (err: unknown) {
      showErrorToast(err, 'Lỗi tải danh sách đơn đặt kính');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-slate-800">
            Quản Lý Đơn Đặt Kính Dự Án ({glassOrders.length} đơn)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            leftIcon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
            className="text-xs"
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowGenerateModal(true)}
            leftIcon={<Plus size={14} />}
            className="text-xs"
          >
            Tạo Đơn Đặt Kính
          </Button>
        </div>
      </div>

      <GlassOrdersTable
        key={projectId}
        projectId={projectId}
        orders={glassOrders}
        loading={loading}
        onRefresh={fetchOrders}
      />

      <GlassOrderGenerateModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        projectId={projectId}
        glassSuppliers={suppliers.filter((s) => s.supplierType === 'glass')}
        onSuccess={fetchOrders}
      />
    </div>
  );
}
