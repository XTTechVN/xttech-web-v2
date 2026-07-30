/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { Suggestion } from '@/types';

interface SuggestionState {
  selectedSuggestion: Suggestion | null;
  isDetailModalOpen: boolean;
  isCreateModalOpen: boolean;
  searchQuery: string;
  selectedCategory: string | 'all';
  activeTab: 'all' | 'pending' | 'processed';
  currentPage: number;
  itemsPerPage: number;

  // New state from suggestion-table
  isExporting: boolean;
  isRefreshing: boolean;
  priorityFilterVal: string | undefined;
  categoryFilterVal: string | undefined;
  senderVal: string | undefined;
  tab: string;
  search: string;

  // Create Modal Form States
  createTitle: string;
  createCategory: string;
  createPriority: 'low' | 'medium' | 'high';
  createProblem: string;
  createSolution: string;
  createIsAnonymous: boolean;
  createAttachments: any[];
  createErrors: Record<string, string>;

  // Detail / Edit Modal Form States
  reviewText: string;
  isEditing: boolean;
  editCategory: string;
  editTitle: string;
  editProblem: string;
  editSolution: string;
  editAttachments: any[];
  editPriority: 'low' | 'medium' | 'high';
  isDeleteConfirmOpen: boolean;
  isSaving: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | 'all') => void;
  setActiveTab: (tab: 'all' | 'pending' | 'processed') => void;
  setCurrentPage: (page: number) => void;
  setSelectedSuggestion: (proposal: Suggestion | null) => void;
  setDetailModalOpen: (isOpen: boolean) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  resetFilters: () => void;

  // New actions
  setExporting: (val: boolean) => void;
  setRefreshing: (val: boolean) => void;
  setPriorityFilterVal: (val: string | undefined) => void;
  setCategoryFilterVal: (val: string | undefined) => void;
  setSenderVal: (val: string | undefined) => void;
  setTab: (val: string) => void;
  setSearch: (val: string) => void;

  // Create Modal Form Actions
  setCreateTitle: (val: string) => void;
  setCreateCategory: (val: string) => void;
  setCreatePriority: (val: 'low' | 'medium' | 'high') => void;
  setCreateProblem: (val: string) => void;
  setCreateSolution: (val: string) => void;
  setCreateIsAnonymous: (val: boolean) => void;
  setCreateAttachments: (val: any[] | ((prev: any[]) => any[])) => void;
  setCreateErrors: (val: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  resetCreateForm: () => void;

  // Detail / Edit Modal Form Actions
  setReviewText: (val: string) => void;
  setIsEditing: (val: boolean) => void;
  setEditCategory: (val: string) => void;
  setEditTitle: (val: string) => void;
  setEditProblem: (val: string) => void;
  setEditSolution: (val: string) => void;
  setEditAttachments: (val: any[] | ((prev: any[]) => any[])) => void;
  setEditPriority: (val: 'low' | 'medium' | 'high') => void;
  setIsDeleteConfirmOpen: (val: boolean) => void;
  setIsSaving: (val: boolean) => void;
  resetEditForm: () => void;
}

export const useSuggestionStore = create<SuggestionState>((set) => ({
  selectedSuggestion: null,
  isDetailModalOpen: false,
  isCreateModalOpen: false,
  searchQuery: '',
  selectedCategory: 'all',
  activeTab: 'all',
  currentPage: 1,
  itemsPerPage: 10,

  // New state initial values
  isExporting: false,
  isRefreshing: false,
  priorityFilterVal: undefined,
  categoryFilterVal: undefined,
  senderVal: undefined,
  tab: 'all',
  search: '',

  // Create Modal Form initial values
  createTitle: '',
  createCategory: 'process',
  createPriority: 'medium',
  createProblem: '',
  createSolution: '',
  createIsAnonymous: false,
  createAttachments: [],
  createErrors: {},

  // Detail / Edit Modal Form initial values
  reviewText: '',
  isEditing: false,
  editCategory: 'process',
  editTitle: '',
  editProblem: '',
  editSolution: '',
  editAttachments: [],
  editPriority: 'medium',
  isDeleteConfirmOpen: false,
  isSaving: false,

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setSelectedCategory: (category) => set({ selectedCategory: category, currentPage: 1 }),
  setActiveTab: (tab) => set({ activeTab: tab, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedSuggestion: (proposal) => set({ selectedSuggestion: proposal }),
  setDetailModalOpen: (isOpen) => set({ isDetailModalOpen: isOpen }),
  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedCategory: 'all',
      activeTab: 'all',
      currentPage: 1,
      priorityFilterVal: undefined,
      categoryFilterVal: undefined,
      senderVal: undefined,
      tab: 'all',
      search: '',
    }),

  // New actions implementation
  setExporting: (val) => set({ isExporting: val }),
  setRefreshing: (val) => set({ isRefreshing: val }),
  setPriorityFilterVal: (val) => set({ priorityFilterVal: val }),
  setCategoryFilterVal: (val) => set({ categoryFilterVal: val }),
  setSenderVal: (val) => set({ senderVal: val }),
  setTab: (val) => set({ tab: val }),
  setSearch: (val) => set({ search: val }),

  // Create Modal Form Actions
  setCreateTitle: (val) => set({ createTitle: val }),
  setCreateCategory: (val) => set({ createCategory: val }),
  setCreatePriority: (val) => set({ createPriority: val }),
  setCreateProblem: (val) => set({ createProblem: val }),
  setCreateSolution: (val) => set({ createSolution: val }),
  setCreateIsAnonymous: (val) => set({ createIsAnonymous: val }),
  setCreateAttachments: (val) =>
    set((state) => ({
      createAttachments: typeof val === 'function' ? val(state.createAttachments) : val,
    })),
  setCreateErrors: (val) =>
    set((state) => ({
      createErrors: typeof val === 'function' ? val(state.createErrors) : val,
    })),
  resetCreateForm: () =>
    set({
      createTitle: '',
      createCategory: 'process',
      createPriority: 'medium',
      createProblem: '',
      createSolution: '',
      createIsAnonymous: false,
      createAttachments: [],
      createErrors: {},
    }),

  // Detail / Edit Modal Form Actions
  setReviewText: (val) => set({ reviewText: val }),
  setIsEditing: (val) => set({ isEditing: val }),
  setEditCategory: (val) => set({ editCategory: val }),
  setEditTitle: (val) => set({ editTitle: val }),
  setEditProblem: (val) => set({ editProblem: val }),
  setEditSolution: (val) => set({ editSolution: val }),
  setEditAttachments: (val) =>
    set((state) => ({
      editAttachments: typeof val === 'function' ? val(state.editAttachments) : val,
    })),
  setEditPriority: (val) => set({ editPriority: val }),
  setIsDeleteConfirmOpen: (val) => set({ isDeleteConfirmOpen: val }),
  setIsSaving: (val) => set({ isSaving: val }),
  resetEditForm: () =>
    set({
      reviewText: '',
      isEditing: false,
      editCategory: 'process',
      editTitle: '',
      editProblem: '',
      editSolution: '',
      editAttachments: [],
      editPriority: 'medium',
      isDeleteConfirmOpen: false,
      isSaving: false,
    }),
}));
