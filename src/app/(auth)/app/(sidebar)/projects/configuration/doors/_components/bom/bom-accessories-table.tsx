import React from 'react';
import { DoorCalculateResponse } from '@/types';

interface BomAccessoriesTableProps {
  accessories?: DoorCalculateResponse['accessories'];
  totalAccessoryQty?: number;
  totalAccessoryPrice?: number;
}

export const BomAccessoriesTable: React.FC<BomAccessoriesTableProps> = ({
  accessories = [],
  totalAccessoryQty,
  totalAccessoryPrice,
}) => {
  if (!accessories || accessories.length === 0) {
    return (
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50 space-y-1">
        <p className="text-xs text-slate-500 font-medium">Chưa có phụ kiện nào trong gói thiết kế.</p>
        <p className="text-[11px] text-slate-400">Chọn gói combo phụ kiện ở tab Phụ kiện để hệ thống tự động bóc tách bản lề, khóa, chốt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50 text-[10px] sm:text-[11px] uppercase tracking-wider">
            <th className="py-2.5 px-2.5 sm:px-3">Phụ kiện & Mã vật tư</th>
            <th className="py-2.5 px-2 hidden sm:table-cell">Nguồn / Gói combo</th>
            <th className="py-2.5 px-2 text-center whitespace-nowrap">ĐVT</th>
            <th className="py-2.5 px-2 text-center whitespace-nowrap">SL</th>
            <th className="py-2.5 px-2 text-right hidden sm:table-cell">Đơn giá</th>
            <th className="py-2.5 px-2.5 sm:px-3 text-right whitespace-nowrap">Thành tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {accessories.map((item, idx) => (
            <tr key={`bom-acc-${item.accessoryId || idx}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-2.5 px-2.5 sm:px-3">
                <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                  {item.name}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] mt-0.5 flex-wrap">
                  {item.code && (
                    <span className="font-mono text-slate-600 bg-slate-100 px-1 py-0.2 rounded font-medium">
                      {item.code}
                    </span>
                  )}
                  {item.brandName && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                      {item.brandName}
                    </span>
                  )}
                  {item.note && (
                    <span className="text-slate-400 italic truncate max-w-[200px]" title={item.note}>
                      {item.note}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-2.5 px-2 text-slate-600 text-[11px] hidden sm:table-cell">
                <span className="font-medium text-slate-700">{item.comboName || 'Phụ kiện lẻ'}</span>
              </td>
              <td className="py-2.5 px-2 text-center text-slate-600 font-medium text-[11px] whitespace-nowrap">
                {item.unit || 'cái'}
              </td>
              <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                {item.quantity}
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-slate-600 text-[11px] hidden sm:table-cell whitespace-nowrap">
                {item.unitPrice > 0 ? `${item.unitPrice.toLocaleString('vi-VN')} đ` : '—'}
              </td>
              <td className="py-2.5 px-2.5 sm:px-3 text-right font-mono font-bold text-blue-700 text-xs sm:text-sm whitespace-nowrap">
                {item.totalPrice > 0 ? `${item.totalPrice.toLocaleString('vi-VN')} đ` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
        {(totalAccessoryPrice !== undefined || totalAccessoryQty !== undefined) && (
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900 text-xs">
              <td className="py-2.5 px-2.5 sm:px-3" colSpan={3}>
                Tổng cộng phụ kiện
              </td>
              <td className="py-2.5 px-2 text-center font-mono text-blue-700 whitespace-nowrap">
                {totalAccessoryQty ?? accessories.reduce((s, a) => s + a.quantity, 0)}
              </td>
              <td className="py-2.5 px-2 hidden sm:table-cell"></td>
              <td className="py-2.5 px-2.5 sm:px-3 text-right font-mono text-blue-700 text-xs sm:text-sm whitespace-nowrap">
                {totalAccessoryPrice !== undefined
                  ? `${totalAccessoryPrice.toLocaleString('vi-VN')} đ`
                  : `${accessories.reduce((s, a) => s + a.totalPrice, 0).toLocaleString('vi-VN')} đ`}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};
