import { useState } from 'react';
import { Modal, Button, Badge, Avatar, Input, Select, TableData, TableAction, ITableColumn } from '@/components';
import { toast } from 'react-hot-toast';
import {
  History,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';

export interface TransferHistoryRecord {
  id: string;
  code: string;
  period: string;
  transferDate: string;
  executor: {
    name: string;
    role: string;
    avatar: string;
  };
  totalEmployees: number;
  totalWorkdays: number;
  totalOT: number;
  totalPenaltiesAmount: string;
  status: 'completed' | 'processing' | 'cancelled';
  note: string;
}

const mockTransferHistory: TransferHistoryRecord[] = [
  {
    id: '1',
    code: 'KC-202411-01',
    period: 'Tháng 11/2024 (Đợt 1)',
    transferDate: '05/11/2024 16:30',
    executor: {
      name: 'System Administrator',
      role: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    },
    totalEmployees: 165,
    totalWorkdays: 4280.0,
    totalOT: 1150.0,
    totalPenaltiesAmount: '12,500,000 đ',
    status: 'completed',
    note: 'Đã hoàn thành kết chuyển dữ liệu công chuẩn sang hệ thống Lương.',
  },
  {
    id: '2',
    code: 'KC-202410-02',
    period: 'Tháng 10/2024 (Chính thức)',
    transferDate: '31/10/2024 18:00',
    executor: {
      name: 'Nguyễn Thanh Hà',
      role: 'Trưởng phòng HR',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    },
    totalEmployees: 162,
    totalWorkdays: 4212.0,
    totalOT: 980.5,
    totalPenaltiesAmount: '9,800,000 đ',
    status: 'completed',
    note: 'Kết chuyển dữ liệu chốt lương tháng 10.',
  },
  {
    id: '3',
    code: 'KC-202410-01',
    period: 'Tháng 10/2024 (Tạm tính)',
    transferDate: '25/10/2024 10:15',
    executor: {
      name: 'Trần Văn Nam',
      role: 'Chuyên viên CO-CQ',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    },
    totalEmployees: 160,
    totalWorkdays: 3950.0,
    totalOT: 720.0,
    totalPenaltiesAmount: '15,200,000 đ',
    status: 'completed',
    note: 'Kết chuyển đợt 1 kiểm tra sai lệch.',
  },
  {
    id: '4',
    code: 'KC-202409-02',
    period: 'Tháng 09/2024 (Chính thức)',
    transferDate: '30/09/2024 17:45',
    executor: {
      name: 'System Administrator',
      role: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    },
    totalEmployees: 158,
    totalWorkdays: 4108.0,
    totalOT: 1040.0,
    totalPenaltiesAmount: '11,000,000 đ',
    status: 'completed',
    note: 'Kết chuyển hoàn tất dữ liệu lương tháng 9.',
  },
  {
    id: '5',
    code: 'KC-202409-01',
    period: 'Tháng 09/2024 (Tạm tính)',
    transferDate: '22/09/2024 14:00',
    executor: {
      name: 'Nguyễn Thanh Hà',
      role: 'Trưởng phòng HR',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    },
    totalEmployees: 155,
    totalWorkdays: 3800.0,
    totalOT: 650.0,
    totalPenaltiesAmount: '8,400,000 đ',
    status: 'cancelled',
    note: 'Yêu cầu hủy đợt kết chuyển do sai thông tin ca sản xuất B.',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PayrollTransferHistoryModal({ open, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = mockTransferHistory.filter((item) => {
    const matchSearch =
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.period.toLowerCase().includes(search.toLowerCase()) ||
      item.executor.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportBatchLog = (code: string) => {
    toast.success(`Đã xuất báo cáo chi tiết kết chuyển ${code}!`);
  };

  const handleCreateNewTransfer = () => {
    toast.success('Đã kích hoạt quá trình kết chuyển công & dữ liệu lương tháng mới!');
  };

  const transferColumns: ITableColumn<TransferHistoryRecord>[] = [
    {
      key: 'code',
      label: 'Mã kết chuyển',
      minWidth: '120px',
      cell: (row) => <span className="font-bold text-slate-800">{row.code}</span>,
    },
    {
      key: 'period',
      label: 'Kỳ công',
      minWidth: '150px',
      cell: (row) => <span className="font-semibold text-teal-800">{row.period}</span>,
    },
    {
      key: 'transferDate',
      label: 'Thời gian kết chuyển',
      minWidth: '140px',
      cell: (row) => <span className="text-slate-500 whitespace-nowrap">{row.transferDate}</span>,
    },
    {
      key: 'executor',
      label: 'Người thực hiện',
      minWidth: '170px',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Avatar src={row.executor.avatar} name={row.executor.name} size="xs" />
          <div>
            <p className="font-semibold text-slate-800 leading-tight">{row.executor.name}</p>
            <p className="text-[10px] text-slate-400">{row.executor.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'totalEmployees',
      label: 'Tổng NV',
      minWidth: '80px',
      cell: (row) => <span className="font-bold text-slate-800 text-center block">{row.totalEmployees}</span>,
    },
    {
      key: 'totalWorkdays',
      label: 'Tổng ngày công',
      minWidth: '120px',
      cell: (row) => <span className="font-bold text-slate-900 text-right block">{row.totalWorkdays.toFixed(1)} ngày</span>,
    },
    {
      key: 'totalOT',
      label: 'Tổng OT',
      minWidth: '100px',
      cell: (row) => <span className="font-bold text-[#005c53] text-right block">{row.totalOT.toFixed(1)} h</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '110px',
      cell: (row) => (
        <div className="flex justify-center">
          {row.status === 'completed' && (
            <Badge variant="success" className="px-2 py-0.5 text-[10px]">
              Hoàn thành
            </Badge>
          )}
          {row.status === 'processing' && (
            <Badge variant="warning" className="px-2 py-0.5 text-[10px]">
              Đang xử lý
            </Badge>
          )}
          {row.status === 'cancelled' && (
            <Badge variant="danger" className="px-2 py-0.5 text-[10px]">
              Đã hủy
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      minWidth: '100px',
      cell: (row) => (
        <div className="flex justify-center">
          <TableAction
            items={[
              {
                title: 'Tải file',
                icon: FileSpreadsheet,
                size: 18,
                className: 'text-teal-700 hover:text-teal-800 hover:bg-teal-50',
                onClick: () => handleExportBatchLog(row.code),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const renderCard = (row: TransferHistoryRecord, index: number) => (
    <div key={row.id || index} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-2.5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-900 text-sm block">{row.code}</span>
          <span className="text-xs font-semibold text-teal-800">{row.period}</span>
        </div>
        {row.status === 'completed' && <Badge variant="success">Hoàn thành</Badge>}
        {row.status === 'processing' && <Badge variant="warning">Đang xử lý</Badge>}
        {row.status === 'cancelled' && <Badge variant="danger">Đã hủy</Badge>}
      </div>
      <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <p><strong>Người thực hiện:</strong> {row.executor.name} ({row.executor.role})</p>
        <p><strong>Thời gian:</strong> {row.transferDate}</p>
        <p><strong>Tổng NV / Công / OT:</strong> {row.totalEmployees} NV | {row.totalWorkdays.toFixed(1)} ngày | OT: {row.totalOT.toFixed(1)}h</p>
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="py-1 px-2.5 text-xs gap-1 border-slate-200 text-slate-700 hover:bg-slate-100"
          onClick={() => handleExportBatchLog(row.code)}
        >
          <FileSpreadsheet size={14} className="text-teal-700" />
          Tải file chi tiết
        </Button>
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div className="text-xs text-slate-500 font-medium">
        Tổng số: <strong className="text-slate-800">{filteredData.length}</strong> phiên kết chuyển
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onClose} className="border-slate-200">
          Đóng
        </Button>
        <Button
          variant="primary"
          className="gap-2"
          onClick={handleCreateNewTransfer}
          leftIcon={<TrendingUp size={16} />}
        >
          Tạo đợt kết chuyển mới
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <History className="text-[#005c53]" size={20} />
          <span>Lịch sử kết chuyển dữ liệu công & lương</span>
        </div>
      }
      size="xl"
      footer={footer}
    >
      <div className="space-y-5">
        {/* Filters Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Tìm mã phiên, kỳ công, người kết chuyển..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white text-xs"
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs w-44 bg-white"
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: 'Hoàn thành', value: 'completed' },
                { label: 'Đang xử lý', value: 'processing' },
                { label: 'Đã hủy', value: 'cancelled' },
              ]}
            />
          </div>
        </div>

        {/* History Table */}
        <TableData<TransferHistoryRecord>
          queryKey={['payroll-transfer-history', search, statusFilter]}
          fetcher={async ({ offset, limit }) => {
            const start = offset;
            const end = offset + limit;
            return {
              items: filteredData.slice(start, end),
              meta: {
                total: filteredData.length,
                offset,
                limit,
                next: end < filteredData.length,
              },
            };
          }}
          columns={transferColumns}
          renderCard={renderCard}
          select={false}
          syncToUrl={false}
        />

        {/* Informational Banner */}
        <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3.5 text-xs text-teal-800 flex items-start gap-2.5">
          <CheckCircle2 size={16} className="text-[#005c53] mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Lưu ý về dữ liệu kết chuyển:</p>
            <p className="text-teal-700/90 mt-0.5">
              Mỗi phiên kết chuyển sẽ chụp lại toàn bộ snapshot ngày công, giờ tăng ca, số phút vi phạm và trạng thái đối soát của toàn bộ nhân viên tại thời điểm thực hiện.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
