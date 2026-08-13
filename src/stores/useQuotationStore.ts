import { create } from 'zustand';
import { createQuotation as apiCreateQuotation, updateQuotation as apiUpdateQuotation } from '@/actions';
import type { QuotationDetail, Quotation } from '@/types';

export interface DraftDoor {
  doorId: number;
  code: string;
  width: number;
  height: number;
  quantity: number;
  accessoryIds: number[];
  extraOptionIds: number[];
}

export interface DraftMaterial {
  materialId: number;
  initPrice: number;
  doors: DraftDoor[];
}

export interface DraftFloor {
  name: string;
  index: number;
  materials: DraftMaterial[];
}

interface QuotationState {
  title: string;
  code: string;
  discountPercentage: number;
  status: string;
  projectId: number;
  reviewBy: string | null;
  floors: DraftFloor[];

  initialize: (quotation: QuotationDetail) => void;
  setQuotationField: (field: string, value: any) => void;

  // Floor Actions
  addFloor: () => void;
  removeFloor: (fIndex: number) => void;
  updateFloorName: (fIndex: number, name: string) => void;

  // Material Actions
  addMaterial: (fIndex: number, defaultMaterialId: number, defaultPrice: number) => void;
  updateMaterial: (fIndex: number, mIndex: number, materialId: number, initPrice: number) => void;
  removeMaterial: (fIndex: number, mIndex: number) => void;

  // Door Actions
  addDoor: (fIndex: number, mIndex: number, defaultDoorId: number, defaultCode: string) => void;
  updateDoor: (fIndex: number, mIndex: number, dIndex: number, field: string, value: any) => void;
  removeDoor: (fIndex: number, mIndex: number, dIndex: number) => void;

  // Accessory Actions
  addAccessory: (fIndex: number, mIndex: number, dIndex: number, accessoryId: number) => void;
  updateAccessory: (fIndex: number, mIndex: number, dIndex: number, aIndex: number, newAccessoryId: number) => void;
  removeAccessory: (fIndex: number, mIndex: number, dIndex: number, aIndex: number) => void;

  // Extra Option Actions
  addExtraOption: (fIndex: number, mIndex: number, dIndex: number, extraOptionId: number) => void;
  updateExtraOption: (fIndex: number, mIndex: number, dIndex: number, oIndex: number, newExtraOptionId: number) => void;
  removeExtraOption: (fIndex: number, mIndex: number, dIndex: number, oIndex: number) => void;

  // API Payload & Operations Helpers
  getPayload: () => any;
  createQuotation: () => Promise<Quotation>;
  updateQuotation: (id: number) => Promise<Quotation>;
}

export const useQuotationStore = create<QuotationState>((set, get) => ({
  title: '',
  code: '',
  discountPercentage: 0,
  status: 'pending',
  projectId: 0,
  reviewBy: null,
  floors: [],

  initialize: (quotation) => {
    const mappedFloors = (quotation.floors || []).map((floor: any, fIndex: number) => ({
      name: floor.name || `Tầng ${fIndex + 1}`,
      index: floor.index ?? fIndex,
      materials: (floor.materials || []).map((mat: any) => ({
        materialId: mat.materialId,
        initPrice: mat.initPrice,
        doors: (mat.doors || []).map((door: any) => ({
          doorId: door.doorId,
          code: door.code || '',
          width: door.width || 0,
          height: door.height || 0,
          quantity: door.quantity || 1,
          accessoryIds: door.accessoryIds || (door.accessories || []).map((a: any) => a.accessoryId),
          extraOptionIds: door.extraOptionIds || (door.extraOptions || []).map((o: any) => o.optionId),
        })),
      })),
    }));

    set({
      title: quotation.title || '',
      code: quotation.code || '',
      discountPercentage: quotation.discountPercentage ?? 0,
      status: quotation.status || 'pending',
      projectId: quotation.projectId || 0,
      reviewBy: quotation.reviewBy || null,
      floors: mappedFloors,
    });
  },

  setQuotationField: (field, value) => {
    set((state) => ({ ...state, [field]: value }));
  },

  addFloor: () => {
    set((state) => {
      const newFloor: DraftFloor = {
        name: `Tầng ${state.floors.length + 1}`,
        index: state.floors.length,
        materials: [],
      };
      return { floors: [...state.floors, newFloor] };
    });
  },

  removeFloor: (fIndex) => {
    set((state) => {
      const newFloors = state.floors.filter((_, idx) => idx !== fIndex).map((f, idx) => ({ ...f, index: idx }));
      return { floors: newFloors };
    });
  },

  updateFloorName: (fIndex, name) => {
    set((state) => {
      const newFloors = [...state.floors];
      newFloors[fIndex] = { ...newFloors[fIndex], name };
      return { floors: newFloors };
    });
  },

  addMaterial: (fIndex, defaultMaterialId, defaultPrice) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      floor.materials = [
        ...floor.materials,
        {
          materialId: defaultMaterialId,
          initPrice: defaultPrice,
          doors: [],
        },
      ];
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  updateMaterial: (fIndex, mIndex, materialId, initPrice) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      materials[mIndex] = { ...materials[mIndex], materialId, initPrice };
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  removeMaterial: (fIndex, mIndex) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      materials.splice(mIndex, 1);
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  addDoor: (fIndex, mIndex, defaultDoorId, defaultCode) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      mat.doors = [
        ...mat.doors,
        {
          doorId: defaultDoorId,
          code: defaultCode,
          width: 0,
          height: 0,
          quantity: 1,
          accessoryIds: [],
          extraOptionIds: [],
        },
      ];
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  updateDoor: (fIndex, mIndex, dIndex, field, value) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      const door = { ...doors[dIndex], [field]: value };

      doors[dIndex] = door;
      mat.doors = doors;
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  removeDoor: (fIndex, mIndex, dIndex) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      doors.splice(dIndex, 1);
      mat.doors = doors;
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  addAccessory: (fIndex, mIndex, dIndex, accessoryId) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      const door = { ...doors[dIndex] };
      door.accessoryIds = [...(door.accessoryIds || []), accessoryId];

      doors[dIndex] = door;
      mat.doors = doors;
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  updateAccessory: (fIndex, mIndex, dIndex, aIndex, newAccessoryId) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      const door = { ...doors[dIndex] };
      const accessoryIds = [...(door.accessoryIds || [])];
      accessoryIds[aIndex] = newAccessoryId;
      door.accessoryIds = accessoryIds;

      doors[dIndex] = door;
      mat.doors = doors;
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  removeAccessory: (fIndex, mIndex, dIndex, aIndex) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      const door = { ...doors[dIndex] };
      const accessoryIds = [...(door.accessoryIds || [])];
      accessoryIds.splice(aIndex, 1);
      door.accessoryIds = accessoryIds;

      doors[dIndex] = door;
      mat.doors = doors;
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  addExtraOption: (fIndex, mIndex, dIndex, extraOptionId) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      const door = { ...doors[dIndex] };
      door.extraOptionIds = [...(door.extraOptionIds || []), extraOptionId];

      doors[dIndex] = door;
      mat.doors = doors;
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  updateExtraOption: (fIndex, mIndex, dIndex, oIndex, newExtraOptionId) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      const door = { ...doors[dIndex] };
      const extraOptionIds = [...(door.extraOptionIds || [])];
      extraOptionIds[oIndex] = newExtraOptionId;
      door.extraOptionIds = extraOptionIds;

      doors[dIndex] = door;
      mat.doors = doors;
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  removeExtraOption: (fIndex, mIndex, dIndex, oIndex) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      const door = { ...doors[dIndex] };
      const extraOptionIds = [...(door.extraOptionIds || [])];
      extraOptionIds.splice(oIndex, 1);
      door.extraOptionIds = extraOptionIds;

      doors[dIndex] = door;
      mat.doors = doors;
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  getPayload: () => {
    const { title, code, discountPercentage, status, projectId, reviewBy, floors } = get();
    return {
      title,
      code,
      discountPercentage,
      status,
      projectId,
      reviewBy,
      floors,
    };
  },

  createQuotation: async () => {
    const payload = get().getPayload();
    return apiCreateQuotation(payload);
  },

  updateQuotation: async (id: number) => {
    const payload = get().getPayload();
    return apiUpdateQuotation(id, payload);
  },
}));

export default useQuotationStore;
