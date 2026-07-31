import { create } from 'zustand';
import { getDepartments, createDepartment } from '@/actions/dapartment';
import { Department } from '@/types';

// Kiểu dữ liệu cho trạng thái phòng ban
interface DapartmentState {
  departments: Department[];
  total: number;
  isLoading: boolean;
  fetchDepartments: (params?: { offset?: number; limit?: number; search?: string }) => Promise<{
    items: Department[];
    meta: { total: number; offset: number; limit: number; next: boolean };
  } | null>;
  creatDepartment: (department: Omit<Department, 'id' | 'createdAt'>) => Promise<boolean>;
}

const useDapartmentStore = create<DapartmentState>()((set) => ({
  departments: [],
  total: 0,
  isLoading: false,

  // Lấy danh sách phòng ban
  fetchDepartments: async (params) => {
    try {
      set({ isLoading: true });
      const data = await getDepartments(params);
      const result = {
        items: data.items || [],
        meta: {
          total: data.pagination?.total || 0,
          offset: data.pagination?.offset || 0,
          limit: data.pagination?.limit || 10,
          next: data.pagination?.next || false,
        },
      };

      set({ departments: result.items, total: result.meta.total });
      return result;
    } catch (error) {
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Tạo danh sách phòng ban
  creatDepartment: async (department) => {
    try {
      set({ isLoading: true });
      await createDepartment(department);
      return true;
    } catch (error) {
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDapartmentStore;
