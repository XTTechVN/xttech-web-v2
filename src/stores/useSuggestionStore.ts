/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { Suggestion, User } from '@/types';

interface SuggestionState {
  selectedSuggestion: Suggestion | null;
  isDetailModalOpen: boolean;
  isCreateModalOpen: boolean;
  searchQuery: string;
  selectedType: string | 'all';
  activeTab: 'all' | 'pending' | 'processed';
  currentPage: number;
  itemsPerPage: number;

  // New state from suggestion-table
  isExporting: boolean;
  isRefreshing: boolean;
  typeFilterVal: string | undefined;
  tab: string;
  search: string;
  userSearch: string;
  usersList: User[];

  // Create Modal Form States
  createTitle: string;
  createType: string;
  createProblem: string;
  createIsAnonymous: boolean;
  createAttachments: any[];
  createErrors: Record<string, string>;
  createShowAllImages: boolean;
  createShowAllFiles: boolean;
  createPreviewUrl: string | null;
  createUploadProgress: number | null;

  // Detail / Edit Modal Form States
  reviewText: string;
  isEditing: boolean;
  editType: string;
  editTitle: string;
  editProblem: string;
  editAttachments: any[];
  isDeleteConfirmOpen: boolean;
  isSaving: boolean;
  detailShowAllImages: boolean;
  detailShowAllFiles: boolean;
  detailPreviewUrl: string | null;
  detailShowAllDetailImages: boolean;
  detailShowAllDetailFiles: boolean;
  detailUploadProgress: number | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedType: (type: string | 'all') => void;
  setActiveTab: (tab: 'all' | 'pending' | 'processed') => void;
  setCurrentPage: (page: number) => void;
  setSelectedSuggestion: (proposal: Suggestion | null) => void;
  setDetailModalOpen: (isOpen: boolean) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  resetFilters: () => void;

  // New actions
  setExporting: (val: boolean) => void;
  setRefreshing: (val: boolean) => void;
  setTypeFilterVal: (val: string | undefined) => void;
  setTab: (val: string) => void;
  setSearch: (val: string) => void;
  setUserSearch: (val: string) => void;
  setUsersList: (val: User[] | ((prev: User[]) => User[])) => void;

  // Create Modal Form Actions
  setCreateTitle: (val: string) => void;
  setCreateType: (val: string) => void;
  setCreateProblem: (val: string) => void;
  setCreateIsAnonymous: (val: boolean) => void;
  setCreateAttachments: (val: any[] | ((prev: any[]) => any[])) => void;
  setCreateErrors: (val: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  setCreateShowAllImages: (val: boolean) => void;
  setCreateShowAllFiles: (val: boolean) => void;
  setCreatePreviewUrl: (val: string | null) => void;
  setCreateUploadProgress: (val: number | null) => void;
  resetCreateForm: () => void;

  // Detail / Edit Modal Form Actions
  setReviewText: (val: string) => void;
  setIsEditing: (val: boolean) => void;
  setEditType: (val: string) => void;
  setEditTitle: (val: string) => void;
  setEditProblem: (val: string) => void;
  setEditAttachments: (val: any[] | ((prev: any[]) => any[])) => void;
  setIsDeleteConfirmOpen: (val: boolean) => void;
  setIsSaving: (val: boolean) => void;
  setDetailShowAllImages: (val: boolean) => void;
  setDetailShowAllFiles: (val: boolean) => void;
  setDetailPreviewUrl: (val: string | null) => void;
  setDetailShowAllDetailImages: (val: boolean) => void;
  setDetailShowAllDetailFiles: (val: boolean) => void;
  setDetailUploadProgress: (val: number | null) => void;
  resetEditForm: () => void;
}

export const useSuggestionStore = create<SuggestionState>((set) => ({
  selectedSuggestion: null,
  isDetailModalOpen: false,
  isCreateModalOpen: false,
  searchQuery: '',
  selectedType: 'all',
  activeTab: 'all',
  currentPage: 1,
  itemsPerPage: 10,

  // New state initial values
  isExporting: false,
  isRefreshing: false,
  typeFilterVal: undefined,
  senderVal: undefined,
  tab: 'all',
  search: '',
  userSearch: '',
  usersList: [],

  // Create Modal Form initial values
  createTitle: '',
  createType: 'process',
  createProblem: '',
  createSolution: '',
  createIsAnonymous: false,
  createAttachments: [],
  createErrors: {},
  createShowAllImages: false,
  createShowAllFiles: false,
  createPreviewUrl: null,
  createUploadProgress: null,

  // Detail / Edit Modal Form initial values
  reviewText: '',
  isEditing: false,
  editType: 'process',
  editTitle: '',
  editProblem: '',
  editSolution: '',
  editAttachments: [],
  isDeleteConfirmOpen: false,
  isSaving: false,
  detailShowAllImages: false,
  detailShowAllFiles: false,
  detailPreviewUrl: null,
  detailShowAllDetailImages: false,
  detailShowAllDetailFiles: false,
  detailUploadProgress: null,

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setSelectedType: (type) => set({ selectedType: type, currentPage: 1 }),
  setActiveTab: (tab) => set({ activeTab: tab, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedSuggestion: (proposal) => set({ selectedSuggestion: proposal }),
  setDetailModalOpen: (isOpen) => set({ isDetailModalOpen: isOpen }),
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedType: 'all',
      activeTab: 'all',
      currentPage: 1,
      typeFilterVal: undefined,
      tab: 'all',
      search: '',
      userSearch: '',
      usersList: [],
    }),

  // New actions implementation
  setExporting: (val) => set({ isExporting: val }),
  setRefreshing: (val) => set({ isRefreshing: val }),
  setTypeFilterVal: (val) => set({ typeFilterVal: val }),
  setTab: (val) => set({ tab: val }),
  setSearch: (val) => set({ search: val }),
  setUserSearch: (val) => set({ userSearch: val }),
  setUsersList: (val) =>
    set((state) => ({
      usersList: typeof val === 'function' ? val(state.usersList) : val,
    })),

  // Create Modal Form Actions
  setCreateTitle: (val) => set({ createTitle: val }),
  setCreateType: (val) => set({ createType: val }),
  setCreateProblem: (val) => set({ createProblem: val }),
  setCreateIsAnonymous: (val) => set({ createIsAnonymous: val }),
  setCreateAttachments: (val) =>
    set((state) => ({
      createAttachments: typeof val === 'function' ? val(state.createAttachments) : val,
    })),
  setCreateErrors: (val) =>
    set((state) => ({
      createErrors: typeof val === 'function' ? val(state.createErrors) : val,
    })),
  setCreateShowAllImages: (val) => set({ createShowAllImages: val }),
  setCreateShowAllFiles: (val) => set({ createShowAllFiles: val }),
  setCreatePreviewUrl: (val) => set({ createPreviewUrl: val }),
  setCreateUploadProgress: (val) => set({ createUploadProgress: val }),
  resetCreateForm: () =>
    set({
      createTitle: '',
      createType: 'process',
      createProblem: '',
      createIsAnonymous: false,
      createAttachments: [],
      createErrors: {},
      createShowAllImages: false,
      createShowAllFiles: false,
      createPreviewUrl: null,
      createUploadProgress: null,
    }),

  // Detail / Edit Modal Form Actions
  setReviewText: (val) => set({ reviewText: val }),
  setIsEditing: (val) => set({ isEditing: val }),
  setEditType: (val) => set({ editType: val }),
  setEditTitle: (val) => set({ editTitle: val }),
  setEditProblem: (val) => set({ editProblem: val }),
  setEditAttachments: (val) =>
    set((state) => ({
      editAttachments: typeof val === 'function' ? val(state.editAttachments) : val,
    })),
  setIsDeleteConfirmOpen: (val) => set({ isDeleteConfirmOpen: val }),
  setIsSaving: (val) => set({ isSaving: val }),
  setDetailShowAllImages: (val) => set({ detailShowAllImages: val }),
  setDetailShowAllFiles: (val) => set({ detailShowAllFiles: val }),
  setDetailPreviewUrl: (val) => set({ detailPreviewUrl: val }),
  setDetailShowAllDetailImages: (val) => set({ detailShowAllDetailImages: val }),
  setDetailShowAllDetailFiles: (val) => set({ detailShowAllDetailFiles: val }),
  setDetailUploadProgress: (val) => set({ detailUploadProgress: val }),
  resetEditForm: () =>
    set({
      reviewText: '',
      isEditing: false,
      editType: 'process',
      editTitle: '',
      editProblem: '',
      editAttachments: [],
      isDeleteConfirmOpen: false,
      isSaving: false,
      detailShowAllImages: false,
      detailShowAllFiles: false,
      detailPreviewUrl: null,
      detailShowAllDetailImages: false,
      detailShowAllDetailFiles: false,
      detailUploadProgress: null,
    }),
}));
