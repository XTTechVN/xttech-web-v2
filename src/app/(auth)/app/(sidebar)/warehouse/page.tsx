'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Package,
  Layers,
  Sparkles,
  Building2,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { Button, Heading, Tabs, type TabItem } from '@/components';
import { showErrorToast } from '@/utils';
import {
  WarehouseItem, WarehouseReceipt, WarehouseOffcut, WarehouseSupplier,
  WarehouseReceiptItemCreatePayload,
} from '@/types';
import {
  getWarehouseItems, getWarehouseReceipts, getWarehouseOffcuts, getWarehouseSuppliers,
  approveWarehouseReceipt, cancelWarehouseReceipt, deleteWarehouseSupplier, deleteWarehouseItem,
} from '@/actions';
import {
  WarehouseKpiCards, StockTab, ReceiptsTab, OffcutsTab, SuppliersTab, GlassOrdersTab,
  ItemFormModal, ReceiptDetailModal, SupplierFormModal, SupplierDetailModal,
  OffcutFormModal, ReceiptFormModal, ShortageCheckerModal, DeleteItemModal,
} from './_components';

const WAREHOUSE_TABS: TabItem[] = [
  { value: 'stock', label: '1. Tồn kho & Định mức', icon: <Package size={15} /> },
  { value: 'receipts', label: '2. Phiếu Nhập / Xuất kho', icon: <Layers size={15} /> },
  { value: 'offcuts', label: '3. Kho Nhôm Thừa Tái Sử Dụng (≥ 1.0m)', icon: <Sparkles size={15} /> },
  { value: 'suppliers', label: '4. Danh bạ Nhà cung cấp', icon: <Building2 size={15} /> },
  { value: 'glass', label: '5. Đặt kính nhà máy', icon: <FileSpreadsheet size={15} /> },
];

export default function WarehouseManagementPage() {
  const [activeTab, setActiveTab] = useState<string>('stock');
  const [loading, setLoading] = useState<boolean>(true);

  // Core collections
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [receipts, setReceipts] = useState<WarehouseReceipt[]>([]);
  const [offcuts, setOffcuts] = useState<WarehouseOffcut[]>([]);
  const [suppliers, setSuppliers] = useState<WarehouseSupplier[]>([]);

  // Modals state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<WarehouseItem | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showOffcutModal, setShowOffcutModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<WarehouseSupplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<WarehouseSupplier | null>(null);
  const [showShortageModal, setShowShortageModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<WarehouseReceipt | null>(null);
  const [prefilledReceiptItems, setPrefilledReceiptItems] = useState<
    WarehouseReceiptItemCreatePayload[] | undefined
  >();

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, receiptsRes, offcutsRes, suppliersRes] = await Promise.all([
        getWarehouseItems({ limit: 200 }),
        getWarehouseReceipts({ limit: 100 }),
        getWarehouseOffcuts({ limit: 100 }),
        getWarehouseSuppliers({ limit: 100 }),
      ]);
      setItems(itemsRes.items || []);
      setReceipts(receiptsRes.items || []);
      setOffcuts(offcutsRes.items || []);
      setSuppliers(suppliersRes.items || []);
    } catch (err: any) {
      showErrorToast(err, 'Lỗi khi tải dữ liệu kho vật tư');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleApproveReceipt = async (receiptId: number) => {
    try {
      await approveWarehouseReceipt(receiptId);
      toast.success('Duyệt phiếu kho thành công! Tồn kho đã được cập nhật nguyên tử.');
      loadAll();
    } catch (err: any) {
      showErrorToast(err, 'Lỗi duyệt phiếu kho');
    }
  };

  const handleCancelReceipt = async (receiptId: number) => {
    try {
      await cancelWarehouseReceipt(receiptId);
      toast.success('Đã hủy phiếu kho và giải phóng vật tư giữ chỗ.');
      loadAll();
    } catch (err: any) {
      showErrorToast(err, 'Lỗi hủy phiếu kho');
    }
  };

  const handleDeleteSupplier = async (supplier: WarehouseSupplier) => {
    try {
      await deleteWarehouseSupplier(supplier.id);
      toast.success(`Đã xóa nhà cung cấp "${supplier.name}" thành công.`);
      loadAll();
    } catch (err: any) {
      showErrorToast(err, 'Lỗi xóa nhà cung cấp');
    }
  };

  const handleConfirmDeleteItem = async () => {
    if (!deletingItem) return;
    setIsDeletingItem(true);
    try {
      await deleteWarehouseItem(deletingItem.id);
      toast.success(`Đã xóa mặt hàng "${deletingItem.itemName}" khỏi kho.`);
      setDeletingItem(null);
      loadAll();
    } catch (err: any) {
      showErrorToast(err, 'Lỗi xóa mặt hàng kho');
    } finally {
      setIsDeletingItem(false);
    }
  };

  // KPI calculations
  const kpiData = useMemo(() => ({
    totalItems: items.length,
    lowStockItems: items.filter(
      (i) => i.isLowStock || i.availableStock <= i.minStockLevel
    ).length,
    pendingReceipts: receipts.filter((r) => r.status === 'draft').length,
    availableOffcuts: offcuts.filter((o) => o.status === 'available').length,
  }), [items, receipts, offcuts]);

  const profileItems = useMemo(
    () => items.filter((i) => i.itemType === 'profile'),
    [items]
  );

  return (
    <div className="p-4 flex flex-col gap-4 text-slate-800 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Heading size="h1" className="text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Kho Vật Tư & Chuỗi Cung Ứng
          </Heading>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm soát tồn kho nhôm phụ kiện, giữ chỗ xuất kho theo lệnh SX, thu hồi nhôm thừa tái sử dụng và đặt kính nhà máy tôi
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAll}
          leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          className="shrink-0"
        >
          Làm mới dữ liệu
        </Button>
      </div>

      {/* KPI Cards */}
      <WarehouseKpiCards
        totalItems={kpiData.totalItems}
        lowStockItems={kpiData.lowStockItems}
        pendingReceipts={kpiData.pendingReceipts}
        availableOffcuts={kpiData.availableOffcuts}
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <Tabs tabs={WAREHOUSE_TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {activeTab === 'stock' && (
          <StockTab
            items={items}
            loading={loading}
            onOpenAddItem={() => { setEditingItem(null); setShowItemModal(true); }}
            onOpenShortageChecker={() => setShowShortageModal(true)}
            onEditItem={(item) => { setEditingItem(item); setShowItemModal(true); }}
            onDeleteItem={(item) => setDeletingItem(item)}
          />
        )}
        {activeTab === 'receipts' && (
          <ReceiptsTab
            receipts={receipts}
            loading={loading}
            onOpenCreateReceipt={() => {
              setPrefilledReceiptItems(undefined);
              setShowReceiptModal(true);
            }}
            onSelectReceiptDetail={setSelectedReceipt}
            onApproveReceipt={handleApproveReceipt}
            onCancelReceipt={handleCancelReceipt}
          />
        )}
        {activeTab === 'offcuts' && (
          <OffcutsTab
            offcuts={offcuts}
            loading={loading}
            onOpenAddOffcut={() => setShowOffcutModal(true)}
          />
        )}
        {activeTab === 'suppliers' && (
          <SuppliersTab
            suppliers={suppliers}
            loading={loading}
            onOpenAddSupplier={() => { setEditingSupplier(null); setShowSupplierModal(true); }}
            onEditSupplier={(s) => { setEditingSupplier(s); setShowSupplierModal(true); }}
            onDeleteSupplier={handleDeleteSupplier}
            onViewSupplierDetail={(s) => setViewingSupplier(s)}
          />
        )}
        {activeTab === 'glass' && <GlassOrdersTab suppliers={suppliers} />}
      </div>

      {/* Modals */}
      <ItemFormModal
        isOpen={showItemModal}
        onClose={() => { setShowItemModal(false); setEditingItem(null); }}
        onSuccess={loadAll}
        initialData={editingItem}
      />
      <DeleteItemModal
        isOpen={Boolean(deletingItem)}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDeleteItem}
        isDeleting={isDeletingItem}
      />
      <ReceiptFormModal
        isOpen={showReceiptModal}
        onClose={() => { setShowReceiptModal(false); setPrefilledReceiptItems(undefined); }}
        onSuccess={loadAll}
        itemsList={items}
        suppliersList={suppliers}
        initialItems={prefilledReceiptItems}
        onSupplierCreated={(newSup) => setSuppliers((prev) => [newSup, ...prev])}
      />
      <OffcutFormModal
        isOpen={showOffcutModal}
        onClose={() => setShowOffcutModal(false)}
        onSuccess={loadAll}
        profileItems={profileItems}
      />
      <SupplierFormModal
        isOpen={showSupplierModal}
        onClose={() => { setShowSupplierModal(false); setEditingSupplier(null); }}
        onSuccess={loadAll}
        initialData={editingSupplier}
      />
      <SupplierDetailModal
        isOpen={Boolean(viewingSupplier)}
        onClose={() => setViewingSupplier(null)}
        supplier={viewingSupplier}
        itemsList={items}
        receiptsList={receipts}
      />
      <ShortageCheckerModal
        isOpen={showShortageModal}
        onClose={() => setShowShortageModal(false)}
        onOpenReceiptWithShortages={(jitItems) => { setPrefilledReceiptItems(jitItems); setShowReceiptModal(true); }}
      />
      {selectedReceipt && (
        <ReceiptDetailModal
          isOpen={Boolean(selectedReceipt)}
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onApprove={() => { const id = selectedReceipt.id; setSelectedReceipt(null); handleApproveReceipt(id); }}
          onCancel={() => { const id = selectedReceipt.id; setSelectedReceipt(null); handleCancelReceipt(id); }}
        />
      )}
    </div>
  );
}
