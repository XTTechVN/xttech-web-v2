import React from 'react';
import type { Material, Door, PreviewFloor } from '@/types';
import { BASE_MINIO_URL } from '@/config/app';
import { PREVIEW_TABLE_FONT_SIZE } from './config';
import { readVietnameseNumber } from '../editor/utils';

interface QuotationTableProps {
  floors: PreviewFloor[];
  materialsList: Material[];
  doorsList: Door[];
  subtotalPrice?: number;
  discountPercentage?: number;
  totalPrice?: number;
  totalQuantity?: number;
  totalArea?: number;
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

const fmt = (n?: number | null) => new Intl.NumberFormat('vi-VN').format(n || 0);

// CSS chung cho các dòng sub-item (phụ kiện, tùy chọn, công uốn)
const SUB_ROW_CLS = 'hover:bg-gray-50';
const SUB_TD_CLS = 'border border-gray-400 py-1';

export const QuotationTable = ({
  floors,
  materialsList,
  doorsList,
  subtotalPrice = 0,
  discountPercentage = 0,
  totalPrice = 0,
  totalQuantity = 0,
  totalArea = 0,
}: QuotationTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full min-w-200 border-collapse border border-gray-400 ${PREVIEW_TABLE_FONT_SIZE} font-normal not-italic`}>
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
                  <td className="border border-gray-400 py-1 px-2 text-right">{fmt(floor.totalAmount)}</td>
                </tr>

                {floor.materials &&
                  floor.materials.map((material, mIndex) => {
                    const selectedMat = materialsList.find((m) => m.id === material.materialId);
                    const materialName = selectedMat ? `${selectedMat.name}` : `Hệ nhôm`;

                    let itemCounter = 1;

                    // Tính toán phụ kiện/tùy chọn/công thức nào được TẤT CẢ cửa dùng chung
                    const doorCount = material.doors?.length || 0;

                    const commonAccessoryIds = new Set(
                      (material.accessories || [])
                        .filter((acc) => {
                          if (doorCount === 0) return false;
                          const usedByDoors = (material.doors || []).filter((d) =>
                            d.accessories?.some((da) => da.accessoryId === acc.accessoryId),
                          ).length;
                          return usedByDoors === doorCount;
                        })
                        .map((acc) => acc.accessoryId),
                    );

                    const commonOptionIds = new Set(
                      (material.extraOptions || [])
                        .filter((opt) => {
                          if (doorCount === 0) return false;
                          const usedByDoors = (material.doors || []).filter((d) =>
                            d.extraOptions?.some((eo) => eo.extraOptionId === opt.optionId),
                          ).length;
                          return usedByDoors === doorCount;
                        })
                        .map((opt) => opt.optionId),
                    );

                    const commonFormulaIds = new Set(
                      (material.archs || [])
                        .filter((arch) => {
                          if (doorCount === 0) return false;
                          const usedByDoors = (material.doors || []).filter((d) => d.formulas?.some((f) => f.formulaId === arch.formulaId)).length;
                          return usedByDoors === doorCount;
                        })
                        .map((arch) => arch.formulaId),
                    );

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
                          <td className="border border-gray-400 py-1 px-2 text-right">{fmt(material.totalAmount)}</td>
                        </tr>

                        {/* Door Rows */}
                        {material.doors &&
                          material.doors.map((door, dIndex) => {
                            const selectedDoor = doorsList.find((d) => d.id === door.doorId);
                            const doorName = selectedDoor ? selectedDoor.name : `Cửa (ID: ${door.doorId})`;
                            const currentTT = itemCounter++;
                            const doorImgUrl = selectedDoor?.imagePath ? `${BASE_MINIO_URL}${selectedDoor.imagePath}` : null;

                            // Lọc: chỉ hiện những phụ kiện/tùy chọn/công thức KHÔNG chung
                            const doorAccessories = (door.accessories || []).filter((acc) => !commonAccessoryIds.has(acc.accessoryId));
                            const doorExtraOptions = (door.extraOptions || []).filter((opt) => !commonOptionIds.has(opt.extraOptionId));
                            const doorFormulas = (door.formulas || []).filter((f) => !commonFormulaIds.has(f.formulaId));

                            return (
                              <React.Fragment key={`door-group-${door.id || dIndex}`}>
                                {/* Door Main Row */}
                                <tr className="hover:bg-gray-50">
                                  <td className="border border-gray-400 py-1 px-1 text-center font-medium">{currentTT}</td>
                                  <td className="border border-gray-400 py-1 px-1 text-center">
                                    {doorImgUrl ? (
                                      <img src={doorImgUrl} alt={doorName} className="w-10 h-10 object-contain mx-auto" />
                                    ) : (
                                      <span className="text-gray-400">img</span>
                                    )}
                                  </td>
                                  <td className="border border-gray-400 py-1 px-2 text-center">{door.code || ''}</td>
                                  <td className="border border-gray-400 py-1 px-2 font-medium">{doorName}</td>
                                  <td className="border border-gray-400 py-1 px-1 text-center">{door.unit === 'set' ? 'Bộ' : 'm²'}</td>
                                  <td className="border border-gray-400 py-1 px-2 text-center">{door.effectiveWidth ?? door.width ?? ''}</td>
                                  <td className="border border-gray-400 py-1 px-2 text-center">{door.effectiveHeight ?? door.height ?? ''}</td>
                                  <td className="border border-gray-400 py-1 px-1 text-center">{door.quantity}</td>
                                  <td className="border border-gray-400 py-1 px-2 text-center">
                                    {door.totalArea ? door.totalArea.toFixed(2) : '0.00'}
                                  </td>
                                  <td className="border border-gray-400 py-1 px-2 text-right">{fmt(door.initPrice)}</td>
                                  <td className="border border-gray-400 py-1 px-2 text-right">{fmt(door.totalPrice)}</td>
                                </tr>

                                {/* Door-level Accessories (chỉ hiện phụ kiện KHÔNG dùng chung tất cả cửa) */}
                                {doorAccessories.map((acc, aIndex) => {
                                  const accTT = `${currentTT}.${aIndex + 1}`;
                                  const totalQuantity = (acc.quantityPerDoor ?? 1) * door.quantity;
                                  return (
                                    <tr key={`door-${dIndex}-acc-${acc.accessoryId}-${aIndex}`} className={SUB_ROW_CLS}>
                                      <td className={`${SUB_TD_CLS} px-1 text-center text-[10px]`}>{accTT}</td>
                                      <td className={`${SUB_TD_CLS} px-1 text-center`}></td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center text-xs`}>{acc.code || ''}</td>
                                      <td className={`${SUB_TD_CLS} px-2`}>{acc.name}</td>
                                      <td className={`${SUB_TD_CLS} px-1 text-center text-xs`}>{acc.unit || 'bộ'}</td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                                      <td className={`${SUB_TD_CLS} px-1 text-center text-xs`}>{totalQuantity}</td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                                      <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(acc.initPrice)}</td>
                                      <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(acc.totalPrice)}</td>
                                    </tr>
                                  );
                                })}

                                {/* Door-level ExtraOptions (chỉ hiện tùy chọn KHÔNG dùng chung tất cả cửa) */}
                                {doorExtraOptions.map((opt, oIndex) => {
                                  const accLength = doorAccessories.length;
                                  const optTT = `${currentTT}.${accLength + oIndex + 1}`;
                                  const unit = opt.unit || 'bộ';
                                  const totalQuantity = (opt.calculatedQuantity || 1) * door.quantity;
                                  return (
                                    <tr key={`door-${dIndex}-opt-${opt.extraOptionId}-${oIndex}`} className={SUB_ROW_CLS}>
                                      <td className={`${SUB_TD_CLS} px-1 text-center text-[10px]`}>{optTT}</td>
                                      <td className={`${SUB_TD_CLS} px-1 text-center`}></td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center text-xs`}>{opt.code || ''}</td>
                                      <td className={`${SUB_TD_CLS} px-2`}>{opt.name}</td>
                                      <td className={`${SUB_TD_CLS} px-1 text-center text-xs`}>{unit}</td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                                      <td className={`${SUB_TD_CLS} px-1 text-center text-xs`}>{unit === 'm2' ? '' : totalQuantity}</td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center text-xs`}>
                                        {unit === 'm2' ? (opt.totalArea ? opt.totalArea.toFixed(2) : '0.00') : ''}
                                      </td>
                                      <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(opt.initPrice)}</td>
                                      <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(opt.totalPrice)}</td>
                                    </tr>
                                  );
                                })}

                                {/* Door-level Formulas (chỉ hiện công thức KHÔNG dùng chung tất cả cửa) */}
                                {doorFormulas.map((formula, fIdx) => {
                                  const accLength = doorAccessories.length;
                                  const optLength = doorExtraOptions.length;
                                  const fTT = `${currentTT}.${accLength + optLength + fIdx + 1}`;
                                  const totalArea = (formula.totalArea ?? 0) * door.quantity;
                                  return (
                                    <tr key={`door-${dIndex}-formula-${formula.formulaId}-${fIdx}`} className={SUB_ROW_CLS}>
                                      <td className={`${SUB_TD_CLS} px-1 text-center text-[10px]`}>{fTT}</td>
                                      <td className={`${SUB_TD_CLS} px-1 text-center`}></td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center text-xs`}>{formula.code || ''}</td>
                                      <td className={`${SUB_TD_CLS} px-2`}>{formula.name || 'Công uốn vòm'}</td>
                                      <td className={`${SUB_TD_CLS} px-1 text-center text-xs`}>{formula.unit || 'md'}</td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                                      <td className={`${SUB_TD_CLS} px-1 text-center`}></td>
                                      <td className={`${SUB_TD_CLS} px-2 text-center text-xs`}>{totalArea ? totalArea.toFixed(2) : ''}</td>
                                      <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(formula.salary)}</td>
                                      <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(formula.totalPrice)}</td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}

                        {/* Material-level Accessories gộp (chỉ hiện những phụ kiện CHUNG tất cả cửa) */}
                        {(material.accessories || [])
                          .filter((acc) => commonAccessoryIds.has(acc.accessoryId))
                          .map((acc, aIdx) => (
                            <tr key={`mat-${mIndex}-acc-${acc.accessoryId}-${aIdx}`} className={SUB_ROW_CLS}>
                              <td className={`${SUB_TD_CLS} px-1 text-center text-[10px]`}></td>
                              <td className={`${SUB_TD_CLS} px-1 text-center`}></td>
                              <td className={`${SUB_TD_CLS} px-2 text-center text-xs`}>{acc.code}</td>
                              <td className={`${SUB_TD_CLS} px-2`}>{acc.name}</td>
                              <td className={`${SUB_TD_CLS} px-1 text-center text-xs`}>{acc.unit}</td>
                              <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                              <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                              <td className={`${SUB_TD_CLS} px-1 text-center text-xs`}>{acc.totalQuantity}</td>
                              <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                              <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(acc.initPrice)}</td>
                              <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(acc.totalPrice)}</td>
                            </tr>
                          ))}

                        {/* Material-level ExtraOptions gộp (chỉ hiện những tùy chọn CHUNG tất cả cửa) */}
                        {(material.extraOptions || [])
                          .filter((opt) => commonOptionIds.has(opt.optionId))
                          .map((opt, oIdx) => (
                            <tr key={`mat-${mIndex}-opt-${opt.optionId}-${oIdx}`} className={SUB_ROW_CLS}>
                              <td className={`${SUB_TD_CLS} px-1 text-center text-[10px]`}></td>
                              <td className={`${SUB_TD_CLS} px-1 text-center`}></td>
                              <td className={`${SUB_TD_CLS} px-2 text-center text-xs`}>{opt.code}</td>
                              <td className={`${SUB_TD_CLS} px-2`}>{opt.name}</td>
                              <td className={`${SUB_TD_CLS} px-1 text-center text-xs`}>{opt.unit}</td>
                              <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                              <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                              <td className={`${SUB_TD_CLS} px-1 text-center text-xs`}>{opt.calculatedQuantity}</td>
                              <td className={`${SUB_TD_CLS} px-2 text-center text-xs`}>{opt.totalArea ? opt.totalArea.toFixed(2) : ''}</td>
                              <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(opt.initPrice)}</td>
                              <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(opt.totalPrice)}</td>
                            </tr>
                          ))}

                        {/* Material-level Archs gộp (chỉ hiện công uốn CHUNG tất cả cửa) */}
                        {(material.archs || [])
                          .filter((arch) => commonFormulaIds.has(arch.formulaId))
                          .map((arch, aIdx) => (
                            <tr key={`mat-${mIndex}-arch-${arch.formulaId}-${aIdx}`} className={SUB_ROW_CLS}>
                              <td className={`${SUB_TD_CLS} px-1 text-center text-[10px]`}></td>
                              <td className={`${SUB_TD_CLS} px-1 text-center`}></td>
                              <td className={`${SUB_TD_CLS} px-2 text-center text-xs`}>{arch.code}</td>
                              <td className={`${SUB_TD_CLS} px-2`}>{arch.name}</td>
                              <td className={`${SUB_TD_CLS} px-1 text-center text-xs`}>{arch.unit}</td>
                              <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                              <td className={`${SUB_TD_CLS} px-2 text-center`}></td>
                              <td className={`${SUB_TD_CLS} px-1 text-center text-xs`}>{arch.totalQuantity}</td>
                              <td className={`${SUB_TD_CLS} px-2 text-center text-xs`}>{arch.totalArea ? arch.totalArea.toFixed(2) : ''}</td>
                              <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(arch.salary)}</td>
                              <td className={`${SUB_TD_CLS} px-2 text-right text-xs`}>{fmt(arch.totalPrice)}</td>
                            </tr>
                          ))}
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
          {floors.length > 0 && (
            <>
              {/* Row 1: TỔNG */}
              <tr className="font-bold bg-slate-100/70 text-slate-800">
                <td colSpan={7} className="border border-gray-400 py-1.5 px-2 text-center uppercase tracking-wider">
                  TỔNG
                </td>
                <td className="border border-gray-400 py-1.5 px-1 text-center">
                  {totalQuantity}
                </td>
                <td className="border border-gray-400 py-1.5 px-2 text-center">
                  {totalArea ? totalArea.toFixed(2) : '0.00'}
                </td>
                <td className="border border-gray-400 py-1.5 px-2"></td>
                <td className="border border-gray-400 py-1.5 px-2 text-right">
                  {fmt(subtotalPrice)}
                </td>
              </tr>

              {/* Row 2: CHIẾT KHẤU */}
              {discountPercentage > 0 && (
                <tr className="font-bold text-slate-800">
                  <td colSpan={7} className="border border-gray-400 py-1.5 px-2 text-center uppercase tracking-wider">
                    CHIẾT KHẤU
                  </td>
                  <td className="border border-gray-400 py-1.5 px-1"></td>
                  <td className="border border-gray-400 py-1.5 px-2"></td>
                  <td className="border border-gray-400 py-1.5 px-2 text-center">
                    {discountPercentage}%
                  </td>
                  <td className="border border-gray-400 py-1.5 px-2 text-right">
                    -{fmt(subtotalPrice - totalPrice)}
                  </td>
                </tr>
              )}

              {/* Row 3: TỔNG THANH TOÁN */}
              <tr className="font-bold text-red-600 bg-red-50/20">
                <td colSpan={7} className="border border-gray-400 py-1.5 px-2 text-center uppercase tracking-wider">
                  TỔNG THANH TOÁN
                </td>
                <td className="border border-gray-400 py-1.5 px-1"></td>
                <td className="border border-gray-400 py-1.5 px-2"></td>
                <td className="border border-gray-400 py-1.5 px-2"></td>
                <td className="border border-gray-400 py-1.5 px-2 text-right">
                  {fmt(totalPrice)}
                </td>
              </tr>

              {/* Row 4: Bằng chữ */}
              <tr className="font-semibold italic bg-[#d0eef7]/40 text-slate-800">
                <td colSpan={3} className="border border-gray-400 py-1.5 px-2 text-center">
                  Bằng chữ:
                </td>
                <td colSpan={8} className="border border-gray-400 py-1.5 px-3 text-left">
                  {readVietnameseNumber(totalPrice)}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};
