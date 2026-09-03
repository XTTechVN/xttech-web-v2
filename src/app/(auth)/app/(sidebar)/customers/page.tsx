'use client';

// Lấy hook từ thư viện React
import { useState } from 'react';

// Lấy component dùng chung từ thư mục components của dự án (src/components/)
import { StatsCard } from '@/components';

// Lấy component Table từ thư mục local ngay bên trong (src/app/(auth)/app/(sidebar)/customers/_components/table.tsx)
import Table from './_components/table';

// Lấy các icon từ thư viện lucide-react
import { Users, UserCheck, ShieldAlert, Award } from 'lucide-react';

// Lấy hook quản lý data fetching từ thư viện React Query
import { useQuery, useMutation } from '@tanstack/react-query';

// Lấy các Server Actions dùng để gọi API từ thư mục actions của dự án
import { getCustomers, deleteCustomer } from '@/actions';

// Lấy định nghĩa Type tập trung từ thư mục types của dự án (src/types/)
import type { Customer } from '@/types';

// Lấy thư viện hiển thị thông báo toast
import toast from 'react-hot-toast';

// Lấy cấu hình queryClient từ thư mục utils (src/utils/query.ts)
import queryClient from '@/utils/query';

// Lấy các component Modals từ thư mục local ngay bên trong (src/app/(auth)/app/(sidebar)/customers/_components/modals/)
import { CustomerFormModal, CustomerDeleteModal, CustomerExportModal } from './_components/modals';


// Lấy hook quản lý phân quyền
import { usePermission } from '@/hooks';

const Page = () => {
  const { user, canViewAll } = usePermission();

  // Sử dụng React Query để fetch dữ liệu danh sách khách hàng nhằm mục đích tính toán thống kê (stats)
  const { data: customerData } = useQuery({
    queryKey: ['customers', 'stats', user?.id, canViewAll],
    queryFn: async () => {
      const staffId = !canViewAll && user ? user.id : undefined;
      const res = await getCustomers({ limit: 9999, staffId });
      return res.items;
    },
  });

  // State quản lý các modal tập trung
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const [isExportOpen, setIsExportOpen] = useState(false);


  // Mutation xóa khách hàng
  const { mutate: deleteCustomerMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Xóa khách hàng thành công');
      setIsDeleteOpen(false);
      setCustomerToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Lấy ra tổng khách hàng
  const totalCustomers = customerData?.length || 0;

  // Thống kê khách hàng
  const stats = [
    {
      title: 'Tổng số khách hàng',
      value: totalCustomers,
      icon: <Users />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Khách hàng active',
      value: totalCustomers,
      icon: <UserCheck />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Khách hàng VIP',
      value: 0,
      icon: <Award />,
      trend: 0,
      trendDirection: 'up' as const,
    },
    {
      title: 'Cần liên hệ lại',
      value: 0,
      icon: <ShieldAlert />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  // Mở modal thêm khách hàng
  const handleOpenCreateModal = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  // Mở modal sửa khách hàng
  const handleOpenEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  // Mở modal xóa khách hàng
  const handleOpenDeleteModal = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} trendDirection={stat.trendDirection} />
        ))}
      </div>

      {/* Bảng Danh Sách Khách Hàng */}
      <Table
        onEditClick={handleOpenEditModal}
        onDeleteClick={handleOpenDeleteModal}
        onAddClick={handleOpenCreateModal}
        onExportClick={() => setIsExportOpen(true)}
      />

      {/* Form Modal */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCustomer(null);
        }}
        title={selectedCustomer ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
        submitText={selectedCustomer ? 'Xác nhận lưu' : 'Xác nhận tạo'}
        initialData={
          selectedCustomer
            ? {
                id: selectedCustomer.id,
                name: selectedCustomer.name,
                address: selectedCustomer.address,
                latitude: selectedCustomer.latitude,
                longitude: selectedCustomer.longitude,
                identifyCode: selectedCustomer.identifyCode,
                email: selectedCustomer.email,
                phone: selectedCustomer.phone,
                staffId: selectedCustomer.staffId,
                type: selectedCustomer.type,
                images: selectedCustomer.images,
              }
            : undefined
        }
      />

      {/* Modal Xóa Khách Hàng */}
      <CustomerDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setCustomerToDelete(null);
        }}
        customerName={customerToDelete?.name}
        onConfirm={() => {
          if (customerToDelete) deleteCustomerMutation(customerToDelete.id);
        }}
        isPending={isDeleting}
      />

      {/* Modal Xuất Báo Cáo Excel */}
      <CustomerExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};

export default Page;

