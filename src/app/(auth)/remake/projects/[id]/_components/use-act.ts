import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { messageOf } from '../../../_components/form';

// Một thao tác ghi của dự án: toast kết quả, làm mới mọi truy vấn ['project', id, ...].
export function useAct<V = void>(projectId: number, fn: (v: V) => Promise<unknown>, msg: string, after?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      [
        'project_quotation_active',
        'project_quotation_sheet',
        'project_quotations',
        'project_quotation_material_analysis',
        'design_options',
        'project_overview',
      ].forEach((k) => qc.invalidateQueries({ queryKey: [k, projectId] }));
      after?.();
    },
    onError: (e) => toast.error(messageOf(e)),
  });
}

export const day = (s?: string | null) => (s ? new Date(s).toLocaleDateString('vi-VN') : '–');
