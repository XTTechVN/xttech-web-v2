import { create } from 'zustand';
import { LeaveRequest, LeaveType, DurationType } from '@/types';

interface LeaveRequestState {
  // Modal states
  selectedLeaveRequest: LeaveRequest | null;
  isDetailModalOpen: boolean;
  isCreateModalOpen: boolean;
  isReviewModalOpen: boolean;
  isDeleteConfirmOpen: boolean;
  isSaving: boolean;
  isRefreshing: boolean;

  // Filter states
  tab: string; // 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'
  search: string;
  leaveTypeFilter: string | undefined;
  fromDate: string;
  toDate: string;

  // Form states (Create / Edit)
  isEditing: boolean;
  formLeaveType: LeaveType | string;
  formDurationType: DurationType | string;
  formWorkShiftId: string | null;
  formStartDate: string;
  formEndDate: string;
  formReason: string;
  formFile: File | null;
  formExistingAttachmentUrl: string | null;
  formErrors: Record<string, string>;

  // Review form states
  reviewStatus: 'approved' | 'rejected';
  reviewNote: string;

  // Actions
  setSelectedLeaveRequest: (request: LeaveRequest | null) => void;
  setDetailModalOpen: (isOpen: boolean) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  setReviewModalOpen: (isOpen: boolean) => void;
  setIsDeleteConfirmOpen: (isOpen: boolean) => void;
  setIsSaving: (val: boolean) => void;
  setIsRefreshing: (val: boolean) => void;

  // Filter actions
  setTab: (tab: string) => void;
  setSearch: (search: string) => void;
  setLeaveTypeFilter: (val: string | undefined) => void;
  setFromDate: (val: string) => void;
  setToDate: (val: string) => void;
  resetFilters: () => void;

  // Form actions
  setIsEditing: (val: boolean) => void;
  setFormLeaveType: (val: LeaveType | string) => void;
  setFormDurationType: (val: DurationType | string) => void;
  setFormWorkShiftId: (val: string | null) => void;
  setFormStartDate: (val: string) => void;
  setFormEndDate: (val: string) => void;
  setFormReason: (val: string) => void;
  setFormFile: (file: File | null) => void;
  setFormExistingAttachmentUrl: (url: string | null) => void;
  setFormErrors: (errors: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  resetForm: () => void;
  initEditForm: (request: LeaveRequest) => void;

  // Review actions
  setReviewStatus: (status: 'approved' | 'rejected') => void;
  setReviewNote: (note: string) => void;
  resetReviewForm: () => void;
}

const getTodayString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const useLeaveRequestStore = create<LeaveRequestState>((set) => ({
  // Modal states
  selectedLeaveRequest: null,
  isDetailModalOpen: false,
  isCreateModalOpen: false,
  isReviewModalOpen: false,
  isDeleteConfirmOpen: false,
  isSaving: false,
  isRefreshing: false,

  // Filters
  tab: 'all',
  search: '',
  leaveTypeFilter: undefined,
  fromDate: '',
  toDate: '',

  // Form state
  isEditing: false,
  formLeaveType: LeaveType.ANNUAL,
  formDurationType: DurationType.FULL_DAY,
  formWorkShiftId: null,
  formStartDate: getTodayString(),
  formEndDate: getTodayString(),
  formReason: '',
  formFile: null,
  formExistingAttachmentUrl: null,
  formErrors: {},

  // Review state
  reviewStatus: 'approved',
  reviewNote: '',

  // Setters
  setSelectedLeaveRequest: (request) => set({ selectedLeaveRequest: request }),
  setDetailModalOpen: (isOpen) => set({ isDetailModalOpen: isOpen }),
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  setReviewModalOpen: (isOpen) => set({ isReviewModalOpen: isOpen }),
  setIsDeleteConfirmOpen: (isOpen) => set({ isDeleteConfirmOpen: isOpen }),
  setIsSaving: (val) => set({ isSaving: val }),
  setIsRefreshing: (val) => set({ isRefreshing: val }),

  setTab: (tab) => set({ tab }),
  setSearch: (search) => set({ search }),
  setLeaveTypeFilter: (leaveTypeFilter) => set({ leaveTypeFilter }),
  setFromDate: (fromDate) => set({ fromDate }),
  setToDate: (toDate) => set({ toDate }),
  resetFilters: () =>
    set({
      tab: 'all',
      search: '',
      leaveTypeFilter: undefined,
      fromDate: '',
      toDate: '',
    }),

  setIsEditing: (isEditing) => set({ isEditing }),
  setFormLeaveType: (formLeaveType) => set({ formLeaveType }),
  setFormDurationType: (formDurationType) => set({ formDurationType }),
  setFormWorkShiftId: (formWorkShiftId) => set({ formWorkShiftId }),
  setFormStartDate: (formStartDate) => set({ formStartDate }),
  setFormEndDate: (formEndDate) => set({ formEndDate }),
  setFormReason: (formReason) => set({ formReason }),
  setFormFile: (formFile) => set({ formFile }),
  setFormExistingAttachmentUrl: (formExistingAttachmentUrl) => set({ formExistingAttachmentUrl }),
  setFormErrors: (val) =>
    set((state) => ({
      formErrors: typeof val === 'function' ? val(state.formErrors) : val,
    })),
  resetForm: () =>
    set({
      isEditing: false,
      formLeaveType: LeaveType.ANNUAL,
      formDurationType: DurationType.FULL_DAY,
      formWorkShiftId: null,
      formStartDate: getTodayString(),
      formEndDate: getTodayString(),
      formReason: '',
      formFile: null,
      formExistingAttachmentUrl: null,
      formErrors: {},
    }),
  initEditForm: (request: LeaveRequest) => {
    const shiftId = request.workShiftId ?? (request as any).work_shift_id ?? null;
    set({
      isEditing: true,
      isDetailModalOpen: true,
      selectedLeaveRequest: request,
      formLeaveType: request.leaveType,
      formDurationType: request.durationType,
      formWorkShiftId: shiftId ? String(shiftId) : null,
      formStartDate: request.startDate,
      formEndDate: request.endDate,
      formReason: request.reason,
      formFile: null,
      formExistingAttachmentUrl: request.attachmentPath,
      formErrors: {},
    });
  },

  setReviewStatus: (reviewStatus) => set({ reviewStatus }),
  setReviewNote: (reviewNote) => set({ reviewNote }),
  resetReviewForm: () =>
    set({
      reviewStatus: 'approved',
      reviewNote: '',
    }),
}));
