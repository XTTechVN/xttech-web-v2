'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createCuttingPlan,
  getCuttingPlan,
  issueCuttingPlan,
  returnCuttingOffcuts,
} from '@/actions';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';

// Quản lý kế hoạch cắt của một lệnh sản xuất: xem, tối ưu lại, lập phiếu xuất, trả đoạn dư
export function useCuttingPlan(projectId: number, orderId: number | null) {
  const queryKey = ['cutting_plan', projectId, orderId];
  const isEnabled = !!projectId && orderId !== null;

  const planQuery = useQuery({
    queryKey,
    queryFn: () => getCuttingPlan(projectId, orderId as number),
    enabled: isEnabled,
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['production_orders', projectId] });
    queryClient.invalidateQueries({ queryKey: ['order_shortage', projectId, orderId] });
    queryClient.invalidateQueries({ queryKey: ['warehouse_items'] });
    queryClient.invalidateQueries({ queryKey: ['warehouse_receipts'] });
    queryClient.invalidateQueries({ queryKey: ['warehouse_offcuts'] });
  };

  const createMutation = useMutation({
    mutationFn: () => createCuttingPlan(projectId, orderId as number),
    onSuccess: (plan) => {
      queryClient.setQueryData(queryKey, plan);
      toast.success(`Đã tối ưu thanh cắt (bản ${plan.version})`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi tối ưu thanh cắt'),
  });

  const issueMutation = useMutation({
    mutationFn: () => issueCuttingPlan(projectId, orderId as number),
    onSuccess: (plan) => {
      queryClient.setQueryData(queryKey, plan);
      refreshAll();
      toast.success('Đã tạo phiếu xuất kho nháp, chờ thủ kho duyệt');
    },
    onError: (err) => showErrorToast(err, 'Lỗi tạo phiếu xuất kho'),
  });

  const returnMutation = useMutation({
    mutationFn: (barIds: number[]) => returnCuttingOffcuts(projectId, orderId as number, barIds),
    onSuccess: (result) => {
      refreshAll();
      toast.success(`Đã trả ${result.returnedCount} đoạn dư về kho`);
    },
    onError: (err) => showErrorToast(err, 'Lỗi trả đoạn dư về kho'),
  });

  return {
    plan: planQuery.data ?? null,
    isLoading: planQuery.isLoading,
    createPlan: createMutation.mutate,
    isCreating: createMutation.isPending,
    issuePlan: issueMutation.mutate,
    isIssuing: issueMutation.isPending,
    returnOffcuts: returnMutation.mutate,
    isReturning: returnMutation.isPending,
  };
}
