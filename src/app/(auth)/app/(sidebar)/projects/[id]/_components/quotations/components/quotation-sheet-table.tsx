import type { QuotationSheet, QuotationSheetRow } from '@/types';
import { getFileUrl } from '@/utils';
import { DoorThumbnail } from '../../../../configuration/door-templates/_components/door-thumbnail';
import {
  SHEET_UNIT_LABELS,
  floorLetter,
  formatSheetNumber,
} from '../utils/quotation-sheet-format';

const COLUMN_WIDTHS = [4, 11, 8, 24, 5, 6, 6, 5, 7, 11, 13];
const COLUMN_COUNT = COLUMN_WIDTHS.length;
const LABEL_SPAN = 7;

const ROW_CLASS: Record<QuotationSheetRow['rowType'], string> = {
  door: '',
  accessory: 'qt-accessory',
  extra: '',
};

interface ItemRowProps {
  row: QuotationSheetRow;
  // Số dòng mà TT / Hình / Ký hiệu chiếm (dòng cửa kèm phụ kiện rời = 2)
  identitySpan?: number;
  // Dòng phụ kiện nằm dưới dòng cửa: 3 ô đầu đã được dòng cửa gộp
  isIdentityMerged?: boolean;
}

function ItemRow({ row, identitySpan = 1, isIdentityMerged = false }: ItemRowProps) {
  const isDoor = row.rowType === 'door';
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
          <td className="qt-center" rowSpan={identitySpan}>
            {row.positionCode}
          </td>
        </>
      )}
      <td className="qt-left">{row.description}</td>
      <td className="qt-center">{SHEET_UNIT_LABELS[row.unit]}</td>
      <td className="qt-center">{formatSheetNumber(row.width)}</td>
      <td className="qt-center">{formatSheetNumber(row.height)}</td>
      <td className="qt-center">{row.quantity}</td>
      <td className="qt-center">{isDoor ? formatSheetNumber(row.areaM2, 2) : ''}</td>
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
          <FloorRows key={floor.floorId} letter={floorLetter(index)} name={floor.floorName} rows={floor.rows} />
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

function FloorRows({ letter, name, rows }: { letter: string; name: string; rows: QuotationSheetRow[] }) {
  return (
    <>
      <tr className="qt-floor">
        <td className="qt-center">{letter}</td>
        <td className="qt-left" colSpan={COLUMN_COUNT - 1}>
          {name}
        </td>
      </tr>
      {rows.map((row, index) => {
        const isAccessoryFollowing = row.rowType === 'door' && rows[index + 1]?.rowType === 'accessory';
        const isAccessoryOfDoor = row.rowType === 'accessory' && rows[index - 1]?.rowType === 'door';
        return (
          <ItemRow
            key={`${row.positionCode}-${row.rowType}-${index}`}
            row={row}
            identitySpan={isAccessoryFollowing ? 2 : 1}
            isIdentityMerged={isAccessoryOfDoor}
          />
        );
      })}
    </>
  );
}
