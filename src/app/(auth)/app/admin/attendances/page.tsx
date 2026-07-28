"use client";

import { useEffect, useState } from 'react';
import { Button, TableData, Badge, ITableColumn, Breadcrumb, Select } from '@/components';

import { toast } from 'react-hot-toast';
import { Filter, Plus, RefreshCw, Download, X } from 'lucide-react';
import AddAttendanceModal from "./_components/AddAttendanceModal";
import EditAttendanceModal from "./_components/EditAttendanceModal";
import AttendanceDetailModal from "./_components/AttendanceDetailModal";
import Loading from '../../loading';

import { attendanceApi, Attendance } from './api';

interface Activity {
  id?: string;
  time?: string;
  avatar?: string;
  user?: string;
  checkinTime?: string;
  checkoutTime?: string;
  action?: string;
  status?: 'success' | 'warning' | 'failed';
  details?: string;

}

const lorem = `
  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, lorem
  totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. 
  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. lorem
  Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, 
  sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, 
  quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? 
`
const empty: Activity[] = [{}]

const mockActivities: Activity[] = [
  {
    id: '1',
    time: '18:45',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Nguyễn Văn Anh',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '2',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '3',
    time: '16:15',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Lê Hoàng Long',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'warning',
    details: lorem,
  },
  {
    id: '4',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '5',
    time: '14:20',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'failed',
    details: lorem,
  },
  {
    id: '6',
    time: '11:10',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '7',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '8',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '9',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '10',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'failed',
    details: lorem,
  }, {
    id: '11',
    time: '18:45',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Nguyễn Văn Anh',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '12',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '13',
    time: '16:15',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Lê Hoàng Long',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'warning',
    details: lorem,
  },
  {
    id: '14',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '15',
    time: '14:20',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'failed',
    details: lorem,
  },
  {
    id: '16',
    time: '11:10',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '17',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '18',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '19',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'success',
    details: lorem,
  },
  {
    id: '20',
    time: '15:00',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    user: 'Le Manh Toan',
    checkinTime: '08:00',
    checkoutTime: '17:00',
    action: lorem,
    status: 'failed',
    details: lorem,
  },
];

export default function AttendancesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [employeeId, setEmployeeId] = useState<string>();
  const [departmentId, setDepartmentId] = useState<string>();
  const [shiftId, setShiftId] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [attendanceDate, setAttendanceDate] = useState<string>();

  const [isLoading, setIsLoading] = useState(false);

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedRow, setSelectedRow] = useState<Activity | null>(null);

  useEffect(() => {

    const fetchAttendances = async () => {
      try {
        setIsLoading(true);
        const response = await attendanceApi.getAttendances({
          offset,
          limit,
          userId: employeeId,
          status,
          workDate: attendanceDate,
        });
        console.log('reponse', response);
        setAttendances(response.items);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải dữ liệu chấm công");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendances();
  }, [
    offset,
    limit,
    employeeId,
    status,
    attendanceDate
  ]);

  const activeFilterCount = [
    employeeId,
    departmentId,
    shiftId,
    status,
    attendanceDate,
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setEmployeeId("");
    setDepartmentId("");
    setShiftId("");
    setStatus("");
    setAttendanceDate("");
    toast.success('Xóa bộ lọc thành công ');
  };


  // Fetcher giả lập lấy dữ liệu và phân trang
  const fetcher = async ({ offset, limit }: { offset: number; limit: number }) => {
    // Giả lập độ trễ mạng
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = mockActivities;
    if (searchQuery) {
      filtered = mockActivities.filter(
        (act) =>
          act?.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          act?.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          act?.details?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    const paginated = filtered.slice(offset, offset + limit);

    return {
      items: paginated,
      meta: {
        total: filtered.length,
        offset,
        limit,
        next: offset + limit < filtered.length,
      },
    };
  };

  // Giao diện Card cho Mobile View
  const renderCard = (row: Activity, index: number) => {
    const variantMap = {
      success: 'success' as const,
      warning: 'warning' as const,
      failed: 'danger' as const,
    };
    const labelMap = {
      success: 'Thành công',
      warning: 'Cảnh báo',
      failed: 'Thất bại',
    };
    return (
      <div
        key={row.id || index}
        className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-2.5 shadow-xs"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-800 text-sm">{row.user}</span>
          <span className="text-xs text-slate-400">{row.time}</span>
        </div>
        <div className="text-sm text-slate-700 font-medium">{row.action}</div>
        <div className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
          {row.details}
        </div>
        <div className="flex justify-end">
          <Badge variant={variantMap[row.status]} size="sm">
            {labelMap[row.status]}
          </Badge>
        </div>?
      </div>
    );
  };


  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/app' },
    { label: 'Quản lý', href: '/app/admin' },
    { label: 'Chấm công', href: '/app/admin/attendances' },
  ];

  const options = [
    { value: 'Sửa', label: 'Sửa' },
    { value: 'Xóa', label: 'Xóa' },
    { value: 'Chi tiết', label: 'Chi tiết' }
  ];


  const handleChange = (name: string, value: string) => {
    toast.success(`[${name}] Đã chọn: ${value}`);
  };


  // Cấu hình các cột cho Desktop View
  // Thêm avatar, giờ checkin, giờ checkout, nút bảng.
  const columns: ITableColumn<Activity>[] = [
    {
      key: 'time',
      label: 'Thời gian',
      minWidth: '100px',
      cell: (row) => <span className="font-medium text-slate-500">{row.time}</span>,
    },
    {
      key: 'avatar',
      label: 'Ảnh',
      minWidth: '100px',
      cell: (row) => <img src={row.avatar} alt={row.user} className="rounded-full h-10 w-10 object-cover" />,
    },
    {
      key: 'user',
      label: 'Người thực hiện',
      minWidth: '160px',
      cell: (row) => <span className="font-semibold text-slate-800">{row.user}</span>,
    },
    {
      key: 'checkinTime',
      label: 'Checkin',
      minWidth: '100px',
      cell: (row) => <span className="font-medium text-slate-500">{row.checkinTime}</span>,
    },
    {
      key: 'checkoutTime',
      label: 'Checkout',
      minWidth: '160px',
      cell: (row) => <span className="font-medium text-slate-500">{row.checkoutTime}</span>,
    },
    {
      key: 'details',
      label: 'Chi tiết',
      minWidth: '260px',
      cell: (row) => <span className="text-xs">{row.details}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      minWidth: '120px',
      cell: (row) => {
        const variantMap = {
          success: 'success' as const,
          warning: 'warning' as const,
          failed: 'danger' as const,
        };
        const labelMap = {
          success: 'Thành công',
          warning: 'Cảnh báo',
          failed: 'Thất bại',
        };
        return <Badge variant={variantMap[row.status]}>{labelMap[row.status]}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Hành động',
      minWidth: '120px',

      cell: (row) => (
        <Select
          placeholder="Chọn một hành động"
          options={options}
          onChange={(e) => {
            const action = e.target.value;
            setSelectedRow(row);
            switch (action) {
              case "Sửa":
                setShowEditModal(true);
                break;
              case "Chi tiết":
                setShowDetailModal(true);
                break;
              case "Xóa":
                handleDelete(row);
                break;

            }
            // reset select về placeholder
            e.target.value = "";

          }}
        />
      ),
    }

  ];

  const handleDelete = (row: Activity) => {

    if (!confirm("Chắc chắn xóa?")) return;

    // api delete
    // await attendanceApi.delete(row.id);

    toast.success("Đã xóa chấm công");
  };

  const filterOptions = [
    {
      key: 'nhansu',
      label: 'Nhân viên',
      value: mockActivities.map((item) => ({
        label: item.user ?? '',
        value: item.id ?? '',
      })),
    },

    {
      key: 'phongban',
      label: 'Phòng ban',
      value: [
        {
          label: 'IT',
          value: 'it',
        },
        {
          label: 'Sale',
          value: 'sale',
        },
      ],
    },

    {
      key: 'calam',
      label: 'Ca làm',
      value: [
        {
          label: 'Ca sáng',
          value: 'morning',
        },
        {
          label: 'Ca chiều',
          value: 'afternoon',
        },
        {
          label: 'Ca tối',
          value: 'night',
        },
      ],
    },

    {
      key: 'ngay',
      label: 'Ngày',
      value: mockActivities.map((item) => ({
        label: item.time ?? '',
        value: item.id ?? '',
      })),
    },

    {
      key: 'trangthai',
      label: 'Trạng thái',
      value: [
        {
          label: 'Thành công',
          value: 'success',
        },
        {
          label: 'Cảnh báo',
          value: 'warning',
        },
        {
          label: 'Thất bại',
          value: 'failed',
        },
      ],
    },
  ];

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col bg-slate-50 p-6">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />

      {/* Header: tiêu đề + nhóm nút hành động */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Danh sách chấm công
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý và theo dõi dữ liệu chấm công nhân viên
          </p>
        </div>

        <div className="flex shrink-0 flex-nowrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="gap-2"
          >
            <Filter size={15} />
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <Button variant="outline" className="gap-2" onClick={() => toast.success('Làm mới thành công ')}>
            <RefreshCw size={15} />
          </Button>

          {/* <Button variant="outline" className="gap-2">
            <Download size={15} />
          </Button> */}

          <Button
            className="gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} />
          </Button>
        </div>
      </div>

      {/* Panel bộ lọc — hiển thị bên dưới header khi isFilterOpen = true */}
      {isFilterOpen && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Bộ lọc chấm công</h3>
            <Button
              variant="ghost"
              onClick={() => setIsFilterOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {/* Nhân sự */}
            <Select
              placeholder="Nhân sự"
              options={filterOptions.find((option) => option.key === 'nhansu')?.value}
              onChange={(e) => setEmployeeId(e.target.value)}
            />

            {/* Phòng ban */}
            <Select
              placeholder="Phòng ban"
              options={filterOptions.find((option) => option.key === 'phongban')?.value}
              onChange={(e) => setDepartmentId(e.target.value)}
            />

            {/* Ca làm */}
            <Select
              placeholder="Ca làm"
              options={filterOptions.find((option) => option.key === 'calam')?.value}
              onChange={(e) => setShiftId(e.target.value)}
            />

            {/* Trạng thái */}
            <Select
              placeholder="Trạng thái"
              options={filterOptions.find((option) => option.key === 'trangthai')?.value}
              onChange={(e) => setStatus(e.target.value)}
            />

            {/* Ngày */}
            <input
              type="date"
              value={attendanceDate || ''}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={handleResetFilters}>
              Xóa lọc
            </Button>
            <Button
              onClick={() => {
                setIsFilterOpen(false);
                toast.success('Đã áp dụng bộ lọc');
              }}
            >
              Áp dụng
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <TableData<Activity>
          queryKey={['today-activities', searchQuery]}
          fetcher={fetcher}
          columns={columns}
          search={{
            placeholder: 'Tìm kiếm hoạt động',
            value: searchQuery,
            onChange: (value) => {
              setSearchQuery(value);
            },
          }}
          renderCard={renderCard}
          select={false}
          syncToUrl={false}
        />
      </div>
      <AddAttendanceModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false)
        }}
        onSuccess={() => {
          toast.success("Thêm thành công")
        }}
      />
      <EditAttendanceModal
        open={showEditModal}
        data={selectedRow}
        onClose={() => {
          setShowEditModal(false)
        }}
        onSuccess={() => {
          toast.success("Cập nhật thành công")
        }}
      />
      <AttendanceDetailModal
        open={showDetailModal}
        data={selectedRow}
        onClose={() => {
          setShowDetailModal(false)
        }}
      />
    </div>
  );
}