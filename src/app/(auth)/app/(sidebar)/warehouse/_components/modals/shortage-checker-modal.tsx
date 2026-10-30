'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, AlertTriangle, CheckCircle2, ShoppingCart, RefreshCw } from 'lucide-react';
import { Button, Modal, Select } from '@/components';
import { ShortageCheckResponse, WarehouseReceiptItemCreatePayload } from '@/types';
import { checkProjectMaterialShortage, getProjects } from '@/actions';
import { toDisplayUnit } from '../../_utils/unit-mapping';
import { buildShortagePurchaseItems, getPurchasableShortages } from '../../_utils/shortage-purchase';

interface ShortageCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReceiptWithShortages: (items: WarehouseReceiptItemCreatePayload[]) => void;
}

export function ShortageCheckerModal({
  isOpen,
  onClose,
  onOpenReceiptWithShortages,
}: ShortageCheckerModalProps) {
  const [projects, setProjects] = useState<Array<{ id: number; name: string; code?: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [shortageResult, setShortageResult] = useState<ShortageCheckResponse | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchProjects = async () => {
      try {
        const res = await getProjects({ limit: 50 });
        const list = res?.items || [];
        setProjects(list.map((p) => ({ id: p.id, name: p.name, code: p.code })));
        if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0].id);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách dự án:', err);
      }
    };
    fetchProjects();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckShortage = async () => {
    if (!selectedProjectId) {
      toast.error('Vui lòng chọn dự án cần kiểm tra');
      return;
    }
    setLoading(true);
    try {
      const data = await checkProjectMaterialShortage(selectedProjectId);
      setShortageResult(data);
      if (data.isFullyStocked) {
        toast.success('Dự án đã đủ 100% vật tư để tiến hành sản xuất!');
      } else {
        toast.error(`Phát hiện thiếu hụt ${data.totalShortageItems} mặt hàng vật tư!`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err.message || 'Lỗi kiểm tra thiếu hụt vật tư');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJitPurchase = () => {
    if (!shortageResult || shortageResult.shortages.length === 0) return;
    const validShortages = getPurchasableShortages(shortageResult.shortages);
    if (validShortages.length === 0) {
      toast.error('Tất cả mặt hàng thiếu hụt đều chưa được gán profile trong thiết kế cửa!');
      return;
    }
    const skippedCount = shortageResult.shortages.length - validShortages.length;
    if (skippedCount > 0) {
      toast(`Đã bỏ qua ${skippedCount} thanh nhôm chưa gán profile khi lập phiếu mua.`, { icon: '⚠️' });
    }
    const proj = projects.find((p) => p.id === shortageResult.projectId);
    const projText = proj
      ? `${proj.code ? `[${proj.code}] ` : ''}${proj.name}`
      : `#${shortageResult.projectId}`;
    const itemsToBuy = buildShortagePurchaseItems(validShortages, projText);
    onOpenReceiptWithShortages(itemsToBuy);
    onClose();
  };

  const titleNode = (
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-5 h-5 text-amber-600" />
      <span>Kiểm Soát Thiếu Hụt Vật Tư Dự Án (JIT Check)</span>
    </div>
  );

  const footerNode = (
    <div className="flex items-center justify-end w-full">
      <Button variant="outline" size="sm" onClick={onClose}>
        Đóng
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleNode}
      size="xl"
      footer={footerNode}
    >
      <div className="space-y-5">
          {/* Project Selector Bar */}
          <div className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Chọn Dự Án Cần Rà Soát Tồn Kho
              </label>
              <Select
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                options={projects.map((p) => ({
                  value: p.id,
                  label: `${p.code ? `[${p.code}] ` : ''}${p.name}`,
                }))}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleCheckShortage}
              disabled={loading || !selectedProjectId}
              leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
              className="shrink-0"
            >
              {loading ? 'Đang Kiểm Tra...' : 'Kiểm Tra Tồn Kho'}
            </Button>
          </div>

          {/* Result view */}
          {shortageResult && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Summary Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  shortageResult.isFullyStocked
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {shortageResult.isFullyStocked ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {shortageResult.isFullyStocked
                        ? 'ĐỦ ĐIỀU KIỆN SẢN XUẤT'
                        : `THIẾU HỤT ${shortageResult.totalShortageItems} MẶT HÀNG VẬT TƯ`}
                    </h4>
                    <p className="text-xs opacity-90">
                      Tổng số loại vật tư: {shortageResult.totalRequiredItems} | Thiếu: {shortageResult.totalShortageItems}
                    </p>
                  </div>
                </div>

                {!shortageResult.isFullyStocked && shortageResult.shortages.length > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreateJitPurchase}
                    leftIcon={<ShoppingCart size={14} />}
                    className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                  >
                    Lập Phiếu Mua Bù JIT
                  </Button>
                )}
              </div>

              {/* Warning Banner for Unconfigured Items */}
              {shortageResult.shortages.some((s) => s.isConfigured === false) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-800 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Cảnh báo cấu hình profile:</span> Có thanh nhôm trong thiết kế cửa chưa được gán mã profile cụ thể. Hệ thống chỉ nhắc nhở cảnh báo và không thể lập phiếu mua/nhập kho cho các thanh này. Vui lòng vào <strong>Door Studio</strong> hoàn tất cấu hình profile trước khi sản xuất!
                  </div>
                </div>
              )}

              {/* Table */}
              {shortageResult.shortages.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3">Mã VT</th>
                        <th className="p-3">Tên Vật Tư</th>
                        <th className="p-3">Màu sắc</th>
                        <th className="p-3 text-center">ĐVT</th>
                        <th className="p-3 text-right">Đơn giá dự kiến</th>
                        <th className="p-3 text-right">Nhu cầu SX</th>
                        <th className="p-3 text-right">Tồn thực tế</th>
                        <th className="p-3 text-right">Đã giữ chỗ</th>
                        <th className="p-3 text-right">Khả dụng</th>
                        <th className="p-3 text-right text-red-600 font-bold">Số lượng thiếu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {shortageResult.shortages.map((item, index) => {
                        const isUnconf = item.isConfigured === false;
                        return (
                          <tr key={index} className={isUnconf ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-red-50/30'}>
                            <td className="p-3 font-mono font-medium text-slate-900">
                              <div className="flex items-center gap-1.5">
                                {item.itemCode}
                                {isUnconf && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded">
                                    Chưa gán
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-medium text-slate-800">
                              {item.itemName}
                              {isUnconf && (
                                <p className="text-[11px] text-amber-700 font-normal">
                                  Cần mở Door Studio cấu hình profile
                                </p>
                              )}
                              {Boolean(item.usedOffcutsCount && item.usedOffcutsCount > 0) && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                                  ✓ Tận dụng {item.usedOffcutsCount} thanh đề-xê
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-slate-600">{item.colorName || '-'}</td>
                            <td className="p-3 text-center font-medium text-slate-700">
                              {toDisplayUnit(item.unit)}
                            </td>
                            <td className="p-3 text-right text-slate-700 font-medium">
                              {isUnconf || !item.estimatedPrice ? (
                                <span className="text-slate-400 font-normal italic">-</span>
                              ) : (
                                `${item.estimatedPrice.toLocaleString('vi-VN')} đ`
                              )}
                            </td>
                            <td className="p-3 text-right font-medium text-slate-700">
                              {item.requiredQty.toLocaleString('vi-VN')}
                            </td>
                            <td className="p-3 text-right text-slate-600">
                              {item.currentStock.toLocaleString('vi-VN')}
                            </td>
                            <td className="p-3 text-right text-amber-600">
                              {item.reservedQty.toLocaleString('vi-VN')}
                            </td>
                            <td className="p-3 text-right text-slate-600">
                              {item.availableQty.toLocaleString('vi-VN')}
                            </td>
                            <td className="p-3 text-right font-bold text-red-600 bg-red-50/50">
                              +{item.shortageQty.toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">
                    Kho hiện tại đủ toàn bộ nhôm và phụ kiện cho dự án này.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Bạn có thể tự động xuất kho theo lệnh sản xuất mà không gặp sự cố thiếu hụt.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
    </Modal>
  );
}
