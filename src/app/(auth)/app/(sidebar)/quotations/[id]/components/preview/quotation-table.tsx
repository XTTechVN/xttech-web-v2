import React from 'react';
import type { Material, Door, PreviewFloor } from '@/types';
import { BASE_MINIO_URL } from '@/config/app';

interface QuotationTableProps {
  floors: PreviewFloor[];
  materialsList: Material[];
  doorsList: Door[];
}

const toRoman = (num: number): string => {
  const romanMap: Record<string, number> = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let result = '';
  let remaining = num;
  for (const key in romanMap) {
    while (remaining >= romanMap[key]) {
      result += key;
      remaining -= romanMap[key];
    }
  }
  return result;
};

export const QuotationTable = ({ floors, materialsList, doorsList }: QuotationTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-400 text-sm">
        <thead>
          <tr className="bg-amber-400 text-gray-900 font-bold text-xs">
            <th rowSpan={2} className="border border-gray-400 py-2 px-1 text-center w-10">TT</th>
            <th rowSpan={2} className="border border-gray-400 py-2 px-1 text-center w-16">Hình ảnh</th>
            <th rowSpan={2} className="border border-gray-400 py-2 px-2 text-center w-20">Ký hiệu</th>
            <th rowSpan={2} className="border border-gray-400 py-2 px-2 text-left">Tên sản phẩm</th>
            <th rowSpan={2} className="border border-gray-400 py-2 px-1 text-center w-12">Đvt</th>
            <th colSpan={2} className="border border-gray-400 py-1 px-2 text-center">Kích thước</th>
            <th rowSpan={2} className="border border-gray-400 py-2 px-1 text-center w-12">Số lượng</th>
            <th rowSpan={2} className="border border-gray-400 py-2 px-2 text-center w-20">Khối lượng<br/><span className="text-[10px] font-normal">(m2)</span></th>
            <th rowSpan={2} className="border border-gray-400 py-2 px-2 text-right w-24">Đơn giá</th>
            <th rowSpan={2} className="border border-gray-400 py-2 px-2 text-right w-28">Thành tiền</th>
          </tr>
          <tr className="bg-amber-400 text-gray-900 font-bold text-[10px]">
            <th className="border border-gray-400 py-1 px-1 text-center w-12">Rộng (mm)</th>
            <th className="border border-gray-400 py-1 px-1 text-center w-12">Cao (mm)</th>
          </tr>
        </thead>
        <tbody className="text-gray-900">
          {floors.length > 0 ? (
            floors.map((floor, fIndex) => (
              <React.Fragment key={floor.id || fIndex}>
                {/* Floor Row */}
                <tr className="bg-amber-100/60 font-bold">
                  <td className="border border-gray-400 py-1.5 px-1 text-center">{String.fromCharCode(65 + fIndex)}</td>
                  <td className="border border-gray-400 py-1.5 px-2" colSpan={6}>{floor.name.toUpperCase()}</td>
                  <td className="border border-gray-400 py-1.5 px-1 text-center">{floor.quantity || 0}</td>
                  <td className="border border-gray-400 py-1.5 px-2 text-center">{floor.totalArea ? floor.totalArea.toFixed(2) : '0.00'}</td>
                  <td className="border border-gray-400 py-1.5 px-2 text-right"></td>
                  <td className="border border-gray-400 py-1.5 px-2 text-right">{new Intl.NumberFormat('vi-VN').format(floor.totalAmount || 0)}</td>
                </tr>
                
                {floor.materials && floor.materials.map((material, mIndex) => {
                  const selectedMat = materialsList.find(m => m.id === material.materialId);
                  const materialName = selectedMat 
                    ? `${selectedMat.name} (${selectedMat.code}) - ${selectedMat.specification || ''}`
                    : `Hệ nhôm (ID: ${material.materialId})`;
                  
                  let itemCounter = 1;
                  
                  return (
                    <React.Fragment key={material.id || mIndex}>
                      {/* Material Row */}
                      <tr className="bg-blue-50/50 font-semibold italic text-blue-900">
                        <td className="border border-gray-400 py-1.5 px-1 text-center">{toRoman(mIndex + 1)}</td>
                        <td className="border border-gray-400 py-1.5 px-2 font-bold" colSpan={6}>
                          <span className="underline">{materialName}</span>
                        </td>
                        <td className="border border-gray-400 py-1.5 px-1 text-center">{material.quantity || 0}</td>
                        <td className="border border-gray-400 py-1.5 px-2 text-center">{material.totalArea ? material.totalArea.toFixed(2) : '0.00'}</td>
                        <td className="border border-gray-400 py-1.5 px-2 text-right"></td>
                        <td className="border border-gray-400 py-1.5 px-2 text-right">{new Intl.NumberFormat('vi-VN').format(material.totalAmount || 0)}</td>
                      </tr>
                      
                      {/* 1. Door Rows */}
                      {material.doors && material.doors.map((door, dIndex) => {
                        const selectedDoor = doorsList.find(d => d.id === door.doorId);
                        const doorName = selectedDoor ? selectedDoor.name : `Cửa (ID: ${door.doorId})`;
                        const currentTT = itemCounter++;
                        
                        const doorImgUrl = selectedDoor?.imagePath
                          ? `${BASE_MINIO_URL}${selectedDoor.imagePath}`
                          : null;
                        
                        return (
                          <tr key={`door-${door.id || dIndex}`} className="hover:bg-gray-50 text-xs">
                            <td className="border border-gray-400 py-2 px-1 text-center">{currentTT}</td>
                            <td className="border border-gray-400 py-2 px-1 text-center">
                              {doorImgUrl ? (
                                <img src={doorImgUrl} alt={doorName} className="w-12 h-12 object-contain mx-auto" />
                              ) : (
                                <span className="text-[10px] text-gray-400">img</span>
                              )}
                            </td>
                            <td className="border border-gray-400 py-2 px-2 text-center font-medium">{door.code || '—'}</td>
                            <td className="border border-gray-400 py-2 px-2 text-sm">{doorName}</td>
                            <td className="border border-gray-400 py-2 px-1 text-center text-xs">m2</td>
                            <td className="border border-gray-400 py-2 px-2 text-center text-xs">{door.width || '—'}</td>
                            <td className="border border-gray-400 py-2 px-2 text-center text-xs">{door.height || '—'}</td>
                            <td className="border border-gray-400 py-2 px-1 text-center">{door.quantity}</td>
                            <td className="border border-gray-400 py-2 px-2 text-center">{door.totalArea ? door.totalArea.toFixed(2) : '0.00'}</td>
                            <td className="border border-gray-400 py-2 px-2 text-right">{new Intl.NumberFormat('vi-VN').format(material.initPrice || 0)}</td>
                            <td className="border border-gray-400 py-2 px-2 text-right">
                              {new Intl.NumberFormat('vi-VN').format((door.totalArea || 0) * (material.initPrice || 0))}
                            </td>
                          </tr>
                        );
                      })}
                      
                      {/* 2. Accessories Rows */}
                      {material.accessories && material.accessories.map((acc, aIndex) => {
                        const currentTT = itemCounter++;
                        return (
                          <tr key={`acc-${acc.accessoryId || aIndex}`} className="hover:bg-gray-50 text-xs bg-gray-50/20 italic">
                            <td className="border border-gray-400 py-2 px-1 text-center">{currentTT}</td>
                            <td className="border border-gray-400 py-2 px-1 text-center"></td>
                            <td className="border border-gray-400 py-2 px-2 text-center font-medium">{acc.code || '—'}</td>
                            <td className="border border-gray-400 py-2 px-2 text-sm pl-4">+ Phụ kiện: {acc.name}</td>
                            <td className="border border-gray-400 py-2 px-1 text-center text-xs">{acc.unit || 'bộ'}</td>
                            <td className="border border-gray-400 py-2 px-2 text-center text-xs"></td>
                            <td className="border border-gray-400 py-2 px-2 text-center text-xs"></td>
                            <td className="border border-gray-400 py-2 px-1 text-center">{acc.totalQuantity}</td>
                            <td className="border border-gray-400 py-2 px-2 text-center">—</td>
                            <td className="border border-gray-400 py-2 px-2 text-right">{new Intl.NumberFormat('vi-VN').format(acc.initPrice || 0)}</td>
                            <td className="border border-gray-400 py-2 px-2 text-right">
                              {new Intl.NumberFormat('vi-VN').format(acc.totalPrice || 0)}
                            </td>
                          </tr>
                        );
                      })}
                      
                      {/* 3. Extra Options Rows */}
                      {material.extraOptions && material.extraOptions.map((opt, oIndex) => {
                        const currentTT = itemCounter++;
                        return (
                          <tr key={`opt-${opt.id || oIndex}`} className="hover:bg-gray-50 text-xs bg-gray-50/20 italic">
                            <td className="border border-gray-400 py-2 px-1 text-center">{currentTT}</td>
                            <td className="border border-gray-400 py-2 px-1 text-center"></td>
                            <td className="border border-gray-400 py-2 px-2 text-center font-medium">{opt.code || '—'}</td>
                            <td className="border border-gray-400 py-2 px-2 text-sm pl-4">+ Tùy chọn: {opt.name}</td>
                            <td className="border border-gray-400 py-2 px-1 text-center text-xs">{opt.code === 'SANO' ? 'm2' : 'bộ'}</td>
                            <td className="border border-gray-400 py-2 px-2 text-center text-xs"></td>
                            <td className="border border-gray-400 py-2 px-2 text-center text-xs"></td>
                            <td className="border border-gray-400 py-2 px-1 text-center">
                              {opt.calculatedQuantity || opt.doorQuantity || 1}
                            </td>
                            <td className="border border-gray-400 py-2 px-2 text-center">—</td>
                            <td className="border border-gray-400 py-2 px-2 text-right">{new Intl.NumberFormat('vi-VN').format(opt.initPrice || 0)}</td>
                            <td className="border border-gray-400 py-2 px-2 text-right">
                              {new Intl.NumberFormat('vi-VN').format(opt.totalPrice || 0)}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={11} className="border border-gray-400 py-8 px-4 text-center text-gray-500 italic">
                Báo giá chưa có chi tiết cấu trúc và hạng mục.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
