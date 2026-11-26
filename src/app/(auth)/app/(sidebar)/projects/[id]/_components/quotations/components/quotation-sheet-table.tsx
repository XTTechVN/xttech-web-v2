import { QUOTATION_SHEET_ROW_TYPE_MAP } from '@/config';
import type { QuotationSheet, QuotationSheetRow } from '@/types';
import { getFileUrl } from '@/utils';
import { DoorThumbnail } from '@/components';
import {
  SHEET_UNIT_LABELS,
  floorLetter,
  formatSheetNumber,
} from '../utils/quotation-sheet-format';

const COLUMN_WIDTHS = [4, 11, 8, 24, 5, 6, 6, 5, 7, 11, 13];
const LABEL_SPAN = 7;

const ROW_CLASS: Record<QuotationSheetRow['rowType'], string> = {
  door: QUOTATION_SHEET_ROW_TYPE_MAP.door.rowClass,
  glass: QUOTATION_SHEET_ROW_TYPE_MAP.glass.rowClass,
  accessory: QUOTATION_SHEET_ROW_TYPE_MAP.accessory.rowClass,
  extra: QUOTATION_SHEET_ROW_TYPE_MAP.extra.rowClass,
};

interface ItemRowProps {
  row: QuotationSheetRow;
  // Số dòng mà TT và Hình ảnh chiếm (dòng cửa + các dòng kính bổ sung & phụ kiện đi kèm)
  identitySpan?: number;
  // Dòng con (kính bổ sung / phụ kiện) nằm dưới dòng cửa: 2 ô đầu đã được dòng cửa gộp
  isIdentityMerged?: boolean;
}

function ItemRow({ row, identitySpan = 1, isIdentityMerged = false }: ItemRowProps) {
  const isDoor = row.rowType === 'door';
  const isGlass = row.rowType === 'glass';
  const hasCad = isDoor && Boolean(row.systemConfig?.rootCell);

  return (
    <tr className={ROW_CLASS[row.rowType]}>
      {!isIdentityMerged && (
        <>
          <td className="qt-center" rowSpan={identitySpan}>
            {isDoor ? row.orderNumber : ''}
          </td>
          <td className="qt-center" rowSpan={identitySpan}>
            {hasCad ? (
              <DoorThumbnail
                systemConfig={row.systemConfig}
                hideDimensions
                className="qt-thumb"
              />
            ) : (
              isDoor &&
              row.imagePath && (
                <img className="qt-thumb" src={getFileUrl(row.imagePath)} alt={row.positionCode} />
              )
            )}
          </td>
        </>
      )}
      <td className="qt-center">{row.positionCode}</td>
      <td className="qt-left">{row.description}</td>
      <td className="qt-center">{SHEET_UNIT_LABELS[row.unit]}</td>
      <td className="qt-center">{formatSheetNumber(row.width)}</td>
      <td className="qt-center">{formatSheetNumber(row.height)}</td>
      <td className="qt-center">{row.quantity}</td>
      <td className="qt-center">{isDoor || isGlass ? formatSheetNumber(row.areaM2, 2) : ''}</td>
      <td className="qt-right">{formatSheetNumber(row.unitPrice)}</td>
      <td className="qt-right">{formatSheetNumber(row.amount)}</td>
    </tr>
  );
}

function SummaryRow({
  label,
  className,
  middle,
  amount,
  quantity,
  area,
}: {
  label: string;
  className: string;
  middle?: string;
  amount: string;
  quantity?: number;
  area?: string;
}) {
  return (
    <tr className={className}>
      <td className="qt-center" colSpan={LABEL_SPAN}>
        {label}
      </td>
      <td className="qt-center">{quantity ?? ''}</td>
      <td className="qt-center">{area ?? ''}</td>
      <td className="qt-center">{middle ?? ''}</td>
      <td className="qt-right">{amount}</td>
    </tr>
  );
}

export function QuotationSheetTable({ sheet }: { sheet: QuotationSheet }) {
  const hasDiscount = sheet.discountAmount > 0;
  return (
    <table className="qt-table">
      <colgroup>
        {COLUMN_WIDTHS.map((width, index) => (
          <col key={index} style={{ width: `${width}%` }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th rowSpan={2}>TT</th>
          <th rowSpan={2}>Hình ảnh</th>
          <th rowSpan={2}>Ký hiệu</th>
          <th rowSpan={2}>Tên sản phẩm</th>
          <th rowSpan={2}>Đvt</th>
          <th colSpan={2}>Kích thước</th>
          <th rowSpan={2}>Số lượng</th>
          <th rowSpan={2}>Khối lượng (m²)</th>
          <th rowSpan={2}>Đơn giá</th>
          <th rowSpan={2}>Thành tiền</th>
        </tr>
        <tr>
          <th>Rộng (mm)</th>
          <th>Cao (mm)</th>
        </tr>
      </thead>
      <tbody>
        {sheet.floors.map((floor, index) => (
          <FloorRows
            key={floor.floorId}
            letter={floorLetter(index)}
            name={floor.floorName}
            rows={floor.rows}
            totalQuantity={floor.totalQuantity}
            totalAreaM2={floor.totalAreaM2}
            totalAmount={floor.totalAmount}
          />
        ))}
        {sheet.extraRows.map((row, index) => (
          <ItemRow key={`extra-${index}`} row={row} />
        ))}
        <SummaryRow
          label="TỔNG"
          className="qt-sum"
          quantity={sheet.totalQuantity}
          area={formatSheetNumber(sheet.totalAreaM2, 2)}
          amount={formatSheetNumber(sheet.subtotalAmount)}
        />
        {hasDiscount && (
          <>
            <SummaryRow
              label="CHIẾT KHẤU"
              className="qt-sum"
              middle={`${sheet.discountPercent}%`}
              amount={`-${formatSheetNumber(sheet.discountAmount)}`}
            />
            <SummaryRow
              label="TỔNG SAU CHIẾT KHẤU"
              className="qt-payable"
              amount={formatSheetNumber(sheet.payableAmount)}
            />
          </>
        )}
      </tbody>
    </table>
  );
}

function FloorRows({
  letter,
  name,
  rows,
  totalQuantity,
  totalAreaM2,
  totalAmount,
}: {
  letter: string;
  name: string;
  rows: QuotationSheetRow[];
  totalQuantity?: number;
  totalAreaM2?: number;
  totalAmount?: number;
}) {
  return (
    <>
      <tr className="qt-floor">
        <td className="qt-center">{letter}</td>
        <td className="qt-left" colSpan={6}>
          {name}
        </td>
        <td className="qt-center">{totalQuantity ? totalQuantity : ''}</td>
        <td className="qt-center">{totalAreaM2 ? formatSheetNumber(totalAreaM2, 2) : ''}</td>
        <td className="qt-center"></td>
        <td className="qt-right">{totalAmount ? formatSheetNumber(totalAmount) : ''}</td>
      </tr>
      {rows.map((row, index) => {
        let identitySpan = 1;
        let isIdentityMerged = false;

        if (row.rowType === 'door') {
          let offset = 1;
          while (
            index + offset < rows.length &&
            (rows[index + offset].rowType === 'glass' || rows[index + offset].rowType === 'accessory')
          ) {
            offset += 1;
          }
          identitySpan = offset;
        } else if (row.rowType === 'glass' || row.rowType === 'accessory') {
          let prev = index - 1;
          while (prev >= 0 && (rows[prev].rowType === 'glass' || rows[prev].rowType === 'accessory')) {
            prev -= 1;
          }
          isIdentityMerged = prev >= 0 && rows[prev].rowType === 'door';
        }

        return (
          <ItemRow
            key={`${row.positionCode}-${row.rowType}-${index}`}
            row={row}
            identitySpan={identitySpan}
            isIdentityMerged={isIdentityMerged}
          />
        );
      })}
    </>
  );
}
