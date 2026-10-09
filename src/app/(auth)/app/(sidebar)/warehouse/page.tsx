'use client';

import React, { useEffect, useState } from 'react';
import {
  Package,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react';
import {
  Button,
  Heading,
  Badge,
  Tabs,
  type TabItem,
  Input,
  Select,
} from '@/components';
import {
  WarehouseItem,
  WarehouseReceipt,
  WarehouseOffcut,
  WarehouseSupplier,
} from '@/types';
import {
  getWarehouseItems,
  getWarehouseReceipts,
  getWarehouseOffcuts,
  getWarehouseSuppliers,
  createWarehouseItem,
  createWarehouseReceipt,
  approveWarehouseReceipt,
  cancelWarehouseReceipt,
  createWarehouseOffcut,
} from '@/actions';
import {
  WAREHOUSE_ITEM_TYPE_MAP,
  RECEIPT_REASON_MAP,
  RECEIPT_STATUS_MAP,
  SUPPLIER_TYPE_MAP,
} from '@/config';

export default function WarehouseManagementPage() {
  const [activeTab, setActiveTab] = useState<string>('stock');
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [receipts, setReceipts] = useState<WarehouseReceipt[]>([]);
  const [offcuts, setOffcuts] = useState<WarehouseOffcut[]>([]);
  const [suppliers, setSuppliers] = useState<WarehouseSupplier[]>([]);

  // Search & filter
  const [searchItem, setSearchItem] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showOffcutModal, setShowOffcutModal] = useState(false);

  // New item form
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'profile' | 'accessory' | 'consumable'>('profile');
  const [newItemUnit, setNewItemUnit] = useState('cây');
  const [newItemCost, setNewItemCost] = useState('0');
  const [newItemMinStock, setNewItemMinStock] = useState('5');
  const [newItemStock, setNewItemStock] = useState('0');

  // New Import Receipt form
  const [importSupplierId, setImportSupplierId] = useState<number | undefined>();
  const [importNote, setImportNote] = useState('');
  const [importSelectedItemId, setImportSelectedItemId] = useState<number | undefined>();
  const [importQty, setImportQty] = useState('10');
  const [importUnitPrice, setImportUnitPrice] = useState('500000');

  // New Offcut form
  const [offcutProfileId, setOffcutProfileId] = useState<number>(1);
  const [offcutColorId, setOffcutColorId] = useState<number>(1);
  const [offcutLength, setOffcutLength] = useState('1500');
  const [offcutLocation, setOffcutLocation] = useState('Kệ A1');
  const [offcutNote, setOffcutNote] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [itemsRes, receiptsRes, offcutsRes, suppliersRes] = await Promise.all([
        getWarehouseItems({ limit: 100 }),
        getWarehouseReceipts({ limit: 100 }),
        getWarehouseOffcuts({ limit: 100 }),
        getWarehouseSuppliers({ limit: 100 }),
      ]);

      if (itemsRes?.items) setItems(itemsRes.items);
      if (receiptsRes?.items) setReceipts(receiptsRes.items);
      if (offcutsRes?.items) setOffcuts(offcutsRes.items);
      if (suppliersRes?.items) setSuppliers(suppliersRes.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemCode || !newItemName) return;
    try {
      await createWarehouseItem({
        itemCode: newItemCode.trim(),
        itemName: newItemName.trim(),
        itemType: newItemType,
        unit: newItemUnit.trim(),
        costPrice: Number(newItemCost) || 0,
        minStockLevel: Number(newItemMinStock) || 0,
        currentStock: Number(newItemStock) || 0,
      });
      setShowItemModal(false);
      setNewItemCode('');
      setNewItemName('');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi thêm mặt hàng');
    }
  };

  const handleCreateImportReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importSelectedItemId) {
      alert('Vui lòng chọn mặt hàng nhập kho');
      return;
    }
    const item = items.find((i) => i.id === importSelectedItemId);
    try {
      await createWarehouseReceipt({
        receiptType: 'import',
        receiptReason: 'purchase',
        supplierId: importSupplierId,
        note: importNote,
        items: [
          {
            itemId: item?.id,
            itemCode: item?.itemCode || '',
            itemName: item?.itemName || '',
            unit: item?.unit || 'cây',
            quantity: Number(importQty) || 1,
            unitPrice: Number(importUnitPrice) || 0,
          },
        ],
      });
      setShowImportModal(false);
      setImportNote('');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi lập phiếu nhập kho');
    }
  };

  const handleApproveReceipt = async (receiptId: number) => {
    if (!confirm('Xác nhận duyệt phiếu kho này? Tồn kho thực tế sẽ được cập nhật nguyên tử.')) return;
    try {
      await approveWarehouseReceipt(receiptId);
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi duyệt phiếu kho');
    }
  };

  const handleCancelReceipt = async (receiptId: number) => {
    if (!confirm('Bạn có chắc muốn hủy phiếu kho này? Lượng vật tư giữ chỗ (nếu có) sẽ được giải phóng.')) return;
    try {
      await cancelWarehouseReceipt(receiptId);
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi hủy phiếu kho');
    }
  };

  const handleCreateOffcut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(offcutLength) < 1000) {
      alert('Chiều dài đoạn nhôm đề-xê phải từ 1000mm trở lên');
      return;
    }
    try {
      await createWarehouseOffcut({
        profileBarId: offcutProfileId,
        colorId: offcutColorId,
        lengthMm: Number(offcutLength),
        location: offcutLocation,
        note: offcutNote,
      });
      setShowOffcutModal(false);
      setOffcutNote('');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Lỗi nhập kho đề-xê');
    }
  };

  // Metrics
  const totalItemCount = items.length;
  const lowStockCount = items.filter((i) => i.isLowStock || i.availableStock <= i.minStockLevel).length;
  const pendingReceiptCount = receipts.filter((r) => r.status === 'draft').length;
  const totalOffcutCount = offcuts.filter((o) => o.status === 'available').length;

  const tabs: TabItem[] = [
    { value: 'stock', label: '1. Tồn kho & Định mức', icon: <Package size={16} /> },
    { value: 'receipts', label: '2. Phiếu Nhập / Xuất kho', icon: <Layers size={16} /> },
    { value: 'offcuts', label: '3. Kho nhôm Đề-xê tái sử dụng', icon: <Sparkles size={16} /> },
    { value: 'suppliers', label: '4. Nhà cung cấp vật tư', icon: <Layers size={16} /> },
  ];

  const filteredItems = items.filter((i) => {
    const matchName =
      i.itemName.toLowerCase().includes(searchItem.toLowerCase()) ||
      i.itemCode.toLowerCase().includes(searchItem.toLowerCase());
    const matchType = filterType === 'all' || i.itemType === filterType;
    return matchName && matchType;
  });

  return (
    <div className="p-4 flex flex-col gap-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Heading size="h1" className="text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Kho Vật Tư & Chuỗi Cung Ứng
          </Heading>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm soát tồn kho nhôm phụ kiện, giữ chỗ xuất kho theo lệnh SX, thu hồi đề-xê và kiểm soát thiếu hụt
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAll} className="gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowItemModal(true)}
            className="gap-2"
          >
            <Plus size={14} />
            Thêm mặt hàng
          </Button>
          <Button
            size="sm"
            onClick={() => setShowImportModal(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ArrowDownLeft size={14} />
            Lập phiếu nhập kho
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase">Tổng danh mục vật tư</p>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Package size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalItemCount}</div>
          <p className="text-xs text-slate-400 mt-1">Mặt hàng nhôm, kính, phụ kiện</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-600 uppercase">Cảnh báo tồn dưới mức</p>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{lowStockCount}</div>
          <p className="text-xs text-slate-400 mt-1">Cần nhập bổ sung cho sản xuất</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-purple-600 uppercase">Phiếu kho chờ duyệt</p>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Layers size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-2">{pendingReceiptCount}</div>
          <p className="text-xs text-slate-400 mt-1">Đang giữ chỗ hoặc chờ ký nhận</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-600 uppercase">Kho Đề-xê tái sử dụng</p>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{totalOffcutCount}</div>
          <p className="text-xs text-slate-400 mt-1">Thanh nhôm thừa dài từ 1.0m</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: TỒN KHO & ĐỊNH MỨC */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm mã hoặc tên vật tư..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 whitespace-nowrap">Loại vật tư:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="profile">Nhôm thanh Profile</option>
                <option value="accessory">Phụ kiện kim khí</option>
                <option value="consumable">Vật tư phụ & Keo</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4">Mã VT</th>
                  <th className="py-2.5 px-4">Tên mặt hàng</th>
                  <th className="py-2.5 px-4">Phân loại</th>
                  <th className="py-2.5 px-4">ĐVT</th>
                  <th className="py-2.5 px-4 text-right">Tồn thực tế</th>
                  <th className="py-2.5 px-4 text-right text-amber-600">Đang giữ chỗ</th>
                  <th className="py-2.5 px-4 text-right text-emerald-600 font-bold">Khả dụng</th>
                  <th className="py-2.5 px-4 text-right">Định mức tối thiểu</th>
                  <th className="py-2.5 px-4 text-right">Giá vốn VND</th>
                  <th className="py-2.5 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      Không có mặt hàng nào phù hợp bộ lọc
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                        {item.itemCode}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{item.itemName}</td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {WAREHOUSE_ITEM_TYPE_MAP[item.itemType] || item.itemType}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">{item.unit}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-800">
                        {item.currentStock}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-amber-600">
                        {item.reservedQty}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-600">
                        {item.availableStock}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-500">{item.minStockLevel}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                        {item.costPrice ? item.costPrice.toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {item.isLowStock || item.availableStock <= item.minStockLevel ? (
                          <Badge variant="danger" className="text-[10px] px-1.5 py-0.5">
                            Cần nhập thêm
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                            Đủ tồn kho
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PHIẾU XUẤT NHẬP KHO */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4">Mã phiếu</th>
                  <th className="py-2.5 px-4">Loại phiếu</th>
                  <th className="py-2.5 px-4">Mục đích</th>
                  <th className="py-2.5 px-4">Dự án / Lệnh SX</th>
                  <th className="py-2.5 px-4">Nhà cung cấp</th>
                  <th className="py-2.5 px-4 text-right">Tổng tiền VND</th>
                  <th className="py-2.5 px-4">Trạng thái</th>
                  <th className="py-2.5 px-4">Thời gian</th>
                  <th className="py-2.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Chưa có phiếu xuất/nhập kho nào
                    </td>
                  </tr>
                ) : (
                  receipts.map((r) => {
                    const st = RECEIPT_STATUS_MAP[r.status] || {
                      label: r.status,
                      bg: 'bg-slate-100',
                      text: 'text-slate-600',
                    };
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{r.code}</td>
                        <td className="py-2.5 px-4">
                          {r.receiptType === 'import' ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                              <ArrowDownLeft size={12} /> Nhập kho
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-blue-600">
                              <ArrowUpRight size={12} /> Xuất kho
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">
                          {RECEIPT_REASON_MAP[r.receiptReason] || r.receiptReason}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {r.projectName ? `${r.projectName}` : '—'}
                          {r.productionOrderCode ? ` (${r.productionOrderCode})` : ''}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{r.supplierName || '—'}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800">
                          {r.totalAmount ? r.totalAmount.toLocaleString('vi-VN') : '—'}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${st.bg} ${st.text}`}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-2">
                          {r.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleApproveReceipt(r.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[11px]"
                              >
                                Duyệt phiếu
                              </button>
                              <button
                                onClick={() => handleCancelReceipt(r.id)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-medium text-[11px]"
                              >
                                Hủy
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: KHO ĐỀ-XÊ TÁI SỬ DỤNG */}
      {activeTab === 'offcuts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Quy tắc quản lý nhôm đề-xê tái sử dụng:
              </p>
              <p className="text-xs text-slate-500">
                Tất cả các đoạn nhôm thừa sau khi cắt có chiều dài từ 1000mm trở lên được nhập vào kho đề-xê để thuật toán cắt ưu tiên dùng lại.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowOffcutModal(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={14} />
              Nhập thanh đề-xê
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4">Mã đoạn</th>
                  <th className="py-2.5 px-4">Profile Thanh nhôm</th>
                  <th className="py-2.5 px-4">Màu sơn</th>
                  <th className="py-2.5 px-4 text-right">Chiều dài mm</th>
                  <th className="py-2.5 px-4">Vị trí kệ để</th>
                  <th className="py-2.5 px-4">Dự án nguồn</th>
                  <th className="py-2.5 px-4">Trạng thái</th>
                  <th className="py-2.5 px-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offcuts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Chưa có thanh đề-xê nào trong kho
                    </td>
                  </tr>
                ) : (
                  offcuts.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        OFF-{o.id.toString().padStart(4, '0')}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800">Mã Profile #{o.profileBarId}</td>
                      <td className="py-2.5 px-4 text-slate-600">Mã màu #{o.colorId}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-600">
                        {o.lengthMm} mm
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 font-medium">
                        {o.location || 'Chưa xếp kệ'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {o.sourceProjectId ? `DA #${o.sourceProjectId}` : 'Nhập tự do'}
                      </td>
                      <td className="py-2.5 px-4">
                        {o.status === 'available' ? (
                          <Badge variant="default" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            Khả dụng (Sẵn sàng cắt)
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px]">
                            Đã sử dụng
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400">{o.note || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: NHÀ CUNG CẤP */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Mã NCC</th>
                <th className="py-2.5 px-4">Tên nhà cung cấp / đại lý</th>
                <th className="py-2.5 px-4">Phân loại</th>
                <th className="py-2.5 px-4">Hotline</th>
                <th className="py-2.5 px-4">Người liên hệ</th>
                <th className="py-2.5 px-4">Địa chỉ kho</th>
                <th className="py-2.5 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Chưa có danh sách nhà cung cấp
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{s.code}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{s.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {SUPPLIER_TYPE_MAP[s.supplierType] || s.supplierType}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">{s.phone}</td>
                    <td className="py-2.5 px-4 text-slate-600">{s.contactName || '—'}</td>
                    <td className="py-2.5 px-4 text-slate-500">{s.address || '—'}</td>
                    <td className="py-2.5 px-4 text-center">
                      {s.isActive ? (
                        <span className="text-emerald-600 font-semibold">Đang giao dịch</span>
                      ) : (
                        <span className="text-slate-400">Tạm dừng</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: THÊM MẶT HÀNG MỚI */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <Heading size="h3" className="text-lg font-bold text-slate-900">
              Thêm mặt hàng kho mới
            </Heading>
            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Mã vật tư (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: XF55-KB"
                  value={newItemCode}
                  onChange={(e) => setNewItemCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tên mặt hàng (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Khung bao cửa đi Xingfa 55"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phân loại</label>
                  <select
                    value={newItemType}
                    onChange={(e: any) => setNewItemType(e.target.value)}
                    className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="profile">Nhôm Profile</option>
                    <option value="accessory">Phụ kiện</option>
                    <option value="consumable">Vật tư phụ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    required
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tồn ban đầu</label>
                  <input
                    type="number"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mức tối thiểu</label>
                  <input
                    type="number"
                    value={newItemMinStock}
                    onChange={(e) => setNewItemMinStock(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Giá vốn VND</label>
                  <input
                    type="number"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    className="w-full px-2 py-1.5 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowItemModal(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="bg-primary text-white">
                  Lưu mặt hàng
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LẬP PHIẾU NHẬP KHO */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <Heading size="h3" className="text-lg font-bold text-slate-900">
              Lập phiếu nhập kho từ nhà cung cấp
            </Heading>
            <form onSubmit={handleCreateImportReceipt} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Chọn nhà cung cấp</label>
                <select
                  value={importSupplierId || ''}
                  onChange={(e) => setImportSupplierId(Number(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="">-- Chọn nhà cung cấp / đại lý --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Chọn mặt hàng nhập (*)</label>
                <select
                  required
                  value={importSelectedItemId || ''}
                  onChange={(e) => setImportSelectedItemId(Number(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="">-- Chọn mặt hàng trong kho --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.itemCode} - {i.itemName} (Tồn: {i.availableStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Số lượng nhập (*)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={importQty}
                    onChange={(e) => setImportQty(e.target.value)}
                    className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Đơn giá nhập VND</label>
                  <input
                    type="number"
                    value={importUnitPrice}
                    onChange={(e) => setImportUnitPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ghi chú phiếu nhập</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nhập bổ sung đợt sản xuất tuần 42"
                  value={importNote}
                  onChange={(e) => setImportNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowImportModal(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Tạo phiếu nhập kho
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NHẬP THANH ĐỀ-XÊ */}
      {showOffcutModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <Heading size="h3" className="text-lg font-bold text-slate-900">
              Thu hồi thanh nhôm đề-xê
            </Heading>
            <form onSubmit={handleCreateOffcut} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã Profile nhôm (*)</label>
                  <input
                    type="number"
                    required
                    value={offcutProfileId}
                    onChange={(e) => setOffcutProfileId(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã màu sơn (*)</label>
                  <input
                    type="number"
                    required
                    value={offcutColorId}
                    onChange={(e) => setOffcutColorId(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Chiều dài đoạn thừa mm (Từ 1000mm) (*)
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={offcutLength}
                  onChange={(e) => setOffcutLength(e.target.value)}
                  className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Vị trí giá/kệ để</label>
                <input
                  type="text"
                  placeholder="Kệ A2 - Tầng 3"
                  value={offcutLocation}
                  onChange={(e) => setOffcutLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ghi chú thu hồi</label>
                <input
                  type="text"
                  placeholder="Thừa sau khi cắt đợt 1"
                  value={offcutNote}
                  onChange={(e) => setOffcutNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowOffcutModal(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Lưu vào kho Đề-xê
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
