import React from 'react';
import type { Material, Door, PreviewFloor } from '@/types';
import { BASE_MINIO_URL } from '@/config/app';
import { PREVIEW_TABLE_FONT_SIZE } from './config';

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
      <table className={`w-full border-collapse border border-gray-400 ${PREVIEW_TABLE_FONT_SIZE} font-normal not-italic`}>
        <thead>
          <tr className="bg-primary text-white">
            <th rowSpan={2} className="border border-gray-400 py-1.5 px-1 text-center w-8">
              TT
            </th>
            <th rowSpan={2} className="border border-gray-400 py-1.5 px-1 text-center w-14">
              Hình ảnh
            </th>
            <th rowSpan={2} className="border border-gray-400 py-1.5 px-1 text-center w-16">
              Ký hiệu
            </th>
            <th rowSpan={2} className="border border-gray-400 py-1.5 px-2 text-left">
              Tên sản phẩm
            </th>
            <th rowSpan={2} className="border border-gray-400 py-1.5 px-1 text-center w-10">
              Đvt
            </th>
            <th colSpan={2} className="border border-gray-400 py-1 px-1 text-center">
              Kích thước
            </th>
            <th rowSpan={2} className="border border-gray-400 py-1.5 px-1 text-center w-10">
              Số lượng
            </th>
            <th rowSpan={2} className="border border-gray-400 py-1.5 px-1 text-center w-16">
              Khối lượng
              <br />
              <span className="text-[9px] font-normal">(m2)</span>
            </th>
            <th rowSpan={2} className="border border-gray-400 py-1.5 px-1 text-right w-20">
              Đơn giá
            </th>
            <th rowSpan={2} className="border border-gray-400 py-1.5 px-1 text-right w-24">
              Thành tiền
            </th>
          </tr>
          <tr className="bg-primary text-white">
            <th className="border border-gray-400 py-0.5 px-0.5 text-center w-10">Rộng (mm)</th>
            <th className="border border-gray-400 py-0.5 px-0.5 text-center w-10">Cao (mm)</th>
          </tr>
        </thead>
        <tbody className="text-gray-900">
          {floors.length > 0 ? (
            floors.map((floor, fIndex) => (
              <React.Fragment key={floor.id || fIndex}>
                {/* Floor Row */}
                <tr className="bg-primary/10 text-primary">
                  <td className="border border-gray-400 py-1 px-1 text-center">{String.fromCharCode(65 + fIndex)}</td>
                  <td className="border border-gray-400 py-1 px-2" colSpan={6}>
                    {floor.name.toUpperCase()}
                  </td>
                  <td className="border border-gray-400 py-1 px-1 text-center">{floor.quantity || 0}</td>
                  <td className="border border-gray-400 py-1 px-2 text-center">{floor.totalArea ? floor.totalArea.toFixed(2) : '0.00'}</td>
                  <td className="border border-gray-400 py-1 px-2 text-right"></td>
                  <td className="border border-gray-400 py-1 px-2 text-right">{new Intl.NumberFormat('vi-VN').format(floor.totalAmount || 0)}</td>
                </tr>

                {floor.materials &&
                  floor.materials.map((material, mIndex) => {
                    const selectedMat = materialsList.find((m) => m.id === material.materialId);
                    const materialName = selectedMat
                      ? `${selectedMat.name} (${selectedMat.code}) - ${selectedMat.specification || ''}`
                      : `Hệ nhôm (ID: ${material.materialId})`;

                    let itemCounter = 1;

                    return (
                      <React.Fragment key={material.id || mIndex}>
                        {/* Material Row */}
                        <tr className="bg-blue-50/50 text-blue-900">
                          <td className="border border-gray-400 py-1 px-1 text-center">{toRoman(mIndex + 1)}</td>
                          <td className="border border-gray-400 py-1 px-2" colSpan={6}>
                            <span>{materialName}</span>
                          </td>
                          <td className="border border-gray-400 py-1 px-1 text-center">{material.quantity || 0}</td>
                          <td className="border border-gray-400 py-1 px-2 text-center">
                            {material.totalArea ? material.totalArea.toFixed(2) : '0.00'}
                          </td>
                          <td className="border border-gray-400 py-1 px-2 text-right"></td>
                          <td className="border border-gray-400 py-1 px-2 text-right">
                            {new Intl.NumberFormat('vi-VN').format(material.totalAmount || 0)}
                          </td>
                        </tr>

                        {/* 1. Door Rows */}
                        {material.doors &&
                          material.doors.map((door, dIndex) => {
                            const selectedDoor = doorsList.find((d) => d.id === door.doorId);
                            const doorName = selectedDoor ? selectedDoor.name : `Cửa (ID: ${door.doorId})`;
                            const currentTT = itemCounter++;

                            const doorImgUrl = selectedDoor?.imagePath ? `${BASE_MINIO_URL}${selectedDoor.imagePath}` : null;

                            return (
                              <tr key={`door-${door.id || dIndex}`} className="hover:bg-gray-50">
                                <td className="border border-gray-400 py-1 px-1 text-center">{currentTT}</td>
                                <td className="border border-gray-400 py-1 px-1 text-center">
                                  {doorImgUrl ? (
                                    <img src={doorImgUrl} alt={doorName} className="w-10 h-10 object-contain mx-auto" />
                                  ) : (
                                    <span className="text-gray-400">img</span>
                                  )}
                                </td>
                                <td className="border border-gray-400 py-1 px-2 text-center">{door.code || ''}</td>
                                <td className="border border-gray-400 py-1 px-2">{doorName}</td>
                                <td className="border border-gray-400 py-1 px-1 text-center">m2</td>
                                <td className="border border-gray-400 py-1 px-2 text-center">{door.effectiveWidth ?? door.width ?? ''}</td>
                                <td className="border border-gray-400 py-1 px-2 text-center">{door.effectiveHeight ?? door.height ?? ''}</td>
                                <td className="border border-gray-400 py-1 px-1 text-center">{door.quantity}</td>
                                <td className="border border-gray-400 py-1 px-2 text-center">
                                  {door.totalArea ? door.totalArea.toFixed(2) : '0.00'}
                                </td>
                                <td className="border border-gray-400 py-1 px-2 text-right">
                                  {new Intl.NumberFormat('vi-VN').format(door.initPrice || 0)}
                                </td>
                                <td className="border border-gray-400 py-1 px-2 text-right">
                                  {new Intl.NumberFormat('vi-VN').format(door.totalPrice || 0)}
                                </td>
                              </tr>
                            );
                          })}

                        {/* 2. Accessories Rows */}
                        {material.accessories &&
                          material.accessories.map((acc, aIndex) => {
                            const currentTT = itemCounter++;
                            return (
                              <tr key={`acc-${acc.accessoryId || aIndex}`} className="hover:bg-gray-50 bg-gray-50/20">
                                <td className="border border-gray-400 py-1 px-1 text-center">{currentTT}</td>
                                <td className="border border-gray-400 py-1 px-1 text-center"></td>
                                <td className="border border-gray-400 py-1 px-2 text-center">{acc.code || ''}</td>
                                <td className="border border-gray-400 py-1 px-2">{acc.name}</td>
                                <td className="border border-gray-400 py-1 px-1 text-center">{acc.unit || 'bộ'}</td>
                                <td className="border border-gray-400 py-1 px-2 text-center"></td>
                                <td className="border border-gray-400 py-1 px-2 text-center"></td>
                                <td className="border border-gray-400 py-1 px-1 text-center">{acc.totalQuantity}</td>
                                <td className="border border-gray-400 py-1 px-2 text-center"></td>
                                <td className="border border-gray-400 py-1 px-2 text-right">
                                  {new Intl.NumberFormat('vi-VN').format(acc.initPrice || 0)}
                                </td>
                                <td className="border border-gray-400 py-1 px-2 text-right">
                                  {new Intl.NumberFormat('vi-VN').format(acc.totalPrice || 0)}
                                </td>
                              </tr>
                            );
                          })}

                        {/* 3. Extra Options Rows */}
                        {material.extraOptions &&
                          material.extraOptions.map((opt, oIndex) => {
                            const name = opt.name || `Tùy chọn (ID: ${opt.optionId})`;
                            const code = opt.code || '';
                            const unit = opt.unit || 'bộ';
                            const initPrice = opt.initPrice || 0;
                            const totalQuantity = opt.calculatedQuantity || 0;
                            const totalPrice = opt.totalPrice || 0;
                            const currentTT = itemCounter++;

                            return (
                              <tr key={`opt-${opt.optionId || oIndex}`} className="hover:bg-gray-50 bg-gray-50/20">
                                <td className="border border-gray-400 py-1 px-1 text-center">{currentTT}</td>
                                <td className="border border-gray-400 py-1 px-1 text-center"></td>
                                <td className="border border-gray-400 py-1 px-2 text-center">{code}</td>
                                <td className="border border-gray-400 py-1 px-2">{name}</td>
                                <td className="border border-gray-400 py-1 px-1 text-center">{unit}</td>
                                <td className="border border-gray-400 py-1 px-2 text-center"></td>
                                <td className="border border-gray-400 py-1 px-2 text-center"></td>
                                <td className="border border-gray-400 py-1 px-1 text-center">
                                  {unit === 'm2' ? '' : totalQuantity}
                                </td>
                                <td className="border border-gray-400 py-1 px-2 text-center">
                                  {unit === 'm2' ? (opt.totalArea ? opt.totalArea.toFixed(2) : '0.00') : ''}
                                </td>
                                <td className="border border-gray-400 py-1 px-2 text-right">{new Intl.NumberFormat('vi-VN').format(initPrice)}</td>
                                <td className="border border-gray-400 py-1 px-2 text-right">{new Intl.NumberFormat('vi-VN').format(totalPrice)}</td>
                              </tr>
                            );
                          })}

                        {/* 4. Archs / Formulas Rows */}
                        {material.archs &&
                          material.archs.map((arch, aIndex) => {
                            const currentTT = itemCounter++;
                            return (
                              <tr key={`arch-${arch.formulaId || aIndex}`} className="hover:bg-gray-50 bg-gray-50/20">
                                <td className="border border-gray-400 py-1 px-1 text-center">{currentTT}</td>
                                <td className="border border-gray-400 py-1 px-1 text-center"></td>
                                <td className="border border-gray-400 py-1 px-2 text-center">{arch.code || ''}</td>
                                <td className="border border-gray-400 py-1 px-2">{arch.name}</td>
                                <td className="border border-gray-400 py-1 px-1 text-center">{arch.unit || 'md'}</td>
                                <td className="border border-gray-400 py-1 px-2 text-center"></td>
                                <td className="border border-gray-400 py-1 px-2 text-center"></td>
                                <td className="border border-gray-400 py-1 px-1 text-center"></td>
                                <td className="border border-gray-400 py-1 px-2 text-center">{arch.totalArea ? arch.totalArea.toFixed(2) : ''}</td>
                                <td className="border border-gray-400 py-1 px-2 text-right">
                                  {new Intl.NumberFormat('vi-VN').format(arch.salary || 0)}
                                </td>
                                <td className="border border-gray-400 py-1 px-2 text-right">
                                  {new Intl.NumberFormat('vi-VN').format(arch.totalPrice || 0)}
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
