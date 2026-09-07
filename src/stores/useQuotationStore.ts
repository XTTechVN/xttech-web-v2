import { create } from 'zustand';
import { createQuotation as apiCreateQuotation, updateQuotation as apiUpdateQuotation } from '@/actions';
import type { QuotationDetail, Quotation, DraftFormula, DraftDoor, DraftMaterial, DraftFloor, Material, Accessory, ExtraOption } from '@/types';


interface QuotationState {
  title: string;
  code: string;
  discountPercentage: number;
  status: string;
  projectId: number;
  reviewBy: string | null;
  termsAndConditions: string;
  floors: DraftFloor[];
  priceType: 'retail' | 'sale' | 'cost';

  initialize: (quotation: QuotationDetail) => void;
  setQuotationField: (field: string, value: any) => void;
  setTermsAndConditions: (content: string) => void;
  setPriceType: (priceType: 'retail' | 'sale' | 'cost', materialsList: Material[]) => void;

  // Floor Actions
  addFloor: () => void;
  copyFloor: (fIndex: number) => void;
  removeFloor: (fIndex: number) => void;
  updateFloorName: (fIndex: number, name: string) => void;

  // Material Actions
  addMaterial: (fIndex: number, defaultMaterialId: number, defaultPrice: number) => void;
  copyMaterial: (fIndex: number, mIndex: number) => void;
  updateMaterial: (fIndex: number, mIndex: number, materialId: number, initPrice: number) => void;
  updateMaterialField: (fIndex: number, mIndex: number, field: string, value: any) => void;
  removeMaterial: (fIndex: number, mIndex: number) => void;

  // Door Actions
  addDoor: (fIndex: number, mIndex: number, defaultDoorId: number, defaultCode: string, defaultAccessoryIds?: number[]) => void;
  updateDoor: (fIndex: number, mIndex: number, dIndex: number, field: string, value: any) => void;
  removeDoor: (fIndex: number, mIndex: number, dIndex: number) => void;

  // Accessory Actions
  addAccessory: (fIndex: number, mIndex: number, dIndex: number, accessoryId: number) => void;
  setAccessories: (fIndex: number, mIndex: number, dIndex: number, accessoryIds: number[]) => void;
  updateAccessory: (fIndex: number, mIndex: number, dIndex: number, aIndex: number, newAccessoryId: number) => void;
  removeAccessory: (fIndex: number, mIndex: number, dIndex: number, aIndex: number) => void;

  // Extra Option Actions
  addExtraOption: (fIndex: number, mIndex: number, dIndex: number, extraOptionId: number) => void;
  updateExtraOption: (fIndex: number, mIndex: number, dIndex: number, oIndex: number, newExtraOptionId: number) => void;
  removeExtraOption: (fIndex: number, mIndex: number, dIndex: number, oIndex: number) => void;

  // Formula Actions
  addFormula: (fIndex: number, mIndex: number, dIndex: number, formulaId: number, width?: number, salary?: number) => void;
  updateFormula: (fIndex: number, mIndex: number, dIndex: number, foIndex: number, field: string, value: any) => void;
  removeFormula: (fIndex: number, mIndex: number, dIndex: number, foIndex: number) => void;

  // API Payload & Operations Helpers
  getPayload: (accessoriesList?: Accessory[], extraOptionsList?: ExtraOption[]) => any;
  createQuotation: () => Promise<Quotation>;
  updateQuotation: (id: number) => Promise<Quotation>;
}

import { DEFAULT_TERMS_AND_CONDITIONS } from '@/app/(auth)/app/(sidebar)/projects/[id]/quotations/[quotationId]/components/editor/config';

export const useQuotationStore = create<QuotationState>((set, get) => ({
  title: '',
  code: '',
  discountPercentage: 0,
  status: 'pending',
  projectId: 0,
  reviewBy: null,
  termsAndConditions: DEFAULT_TERMS_AND_CONDITIONS,
  floors: [],
  priceType: 'retail',

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
          fomulas: door.fomulas || (door.formulas && door.formulas.length > 0
            ? door.formulas.map((f: any) => ({
                fomulaId: f.formulaId ?? f.fomulaId,
                width: f.width,
                salary: f.salary,
              }))
            : (door.formulaIds || []).map((id: number) => ({
                fomulaId: id,
              }))),
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
      termsAndConditions: quotation.termsAndConditions ?? DEFAULT_TERMS_AND_CONDITIONS,
      floors: mappedFloors,
      priceType: (quotation.priceType as any) || 'retail',
    });
  },

  setQuotationField: (field, value) => {
    set((state) => ({ ...state, [field]: value }));
  },

  setTermsAndConditions: (content) => {
    set({ termsAndConditions: content });
  },

  setPriceType: (priceType, materialsList) => {
    set((state) => {
      const newFloors = state.floors.map((floor) => ({
        ...floor,
        materials: floor.materials.map((mat) => {
          const master = materialsList.find((m) => m.id === mat.materialId);
          const pKey = priceType === 'retail' ? 'retailPrice' : (priceType === 'sale' ? 'salePrice' : 'costPrice');
          const newPrice = master 
            ? (master[pKey] !== undefined && master[pKey] !== null 
                ? master[pKey] 
                : (master.retailPrice || master.salePrice || master.costPrice || 0))
            : mat.initPrice;
          return {
            ...mat,
            initPrice: newPrice,
          };
        }),
      }));
      return { priceType, floors: newFloors };
    });
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

  copyFloor: (fIndex) => {
    set((state) => {
      const targetFloor = state.floors[fIndex];
      if (!targetFloor) return state;

      const clonedFloor: DraftFloor = JSON.parse(JSON.stringify(targetFloor));
      clonedFloor.name = `${targetFloor.name} (Bản sao)`;

      const newFloors = [...state.floors];
      newFloors.splice(fIndex + 1, 0, clonedFloor);

      const indexedFloors = newFloors.map((f, idx) => ({ ...f, index: idx }));
      return { floors: indexedFloors };
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

  copyMaterial: (fIndex, mIndex) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const targetMaterial = floor.materials[mIndex];
      if (!targetMaterial) return state;

      const clonedMaterial: DraftMaterial = JSON.parse(JSON.stringify(targetMaterial));
      const materials = [...floor.materials];
      materials.splice(mIndex + 1, 0, clonedMaterial);
      floor.materials = materials;
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

  updateMaterialField: (fIndex, mIndex, field, value) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      materials[mIndex] = { ...materials[mIndex], [field]: value };
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

  addDoor: (fIndex, mIndex, defaultDoorId, defaultCode, defaultAccessoryIds = []) => {
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
          width: 1000,
          height: 2000,
          quantity: 1,
          accessoryIds: defaultAccessoryIds,
          extraOptionIds: [],
          fomulas: [],
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

  setAccessories: (fIndex, mIndex, dIndex, accessoryIds) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      const door = { ...doors[dIndex], accessoryIds };

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

  addFormula: (fIndex, mIndex, dIndex, formulaId, width, salary) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      const door = { ...doors[dIndex] };
      door.fomulas = [
        ...(door.fomulas || []),
        {
          fomulaId: formulaId,
          width: width,
          salary: salary,
        },
      ];

      doors[dIndex] = door;
      mat.doors = doors;
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  updateFormula: (fIndex, mIndex, dIndex, foIndex, field, value) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      const door = { ...doors[dIndex] };
      const fomulas = [...(door.fomulas || [])];
      fomulas[foIndex] = { ...fomulas[foIndex], [field]: value };
      door.fomulas = fomulas;

      doors[dIndex] = door;
      mat.doors = doors;
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  removeFormula: (fIndex, mIndex, dIndex, foIndex) => {
    set((state) => {
      const newFloors = [...state.floors];
      const floor = { ...newFloors[fIndex] };
      const materials = [...floor.materials];
      const mat = { ...materials[mIndex] };
      const doors = [...mat.doors];
      const door = { ...doors[dIndex] };
      const fomulas = [...(door.fomulas || [])];
      fomulas.splice(foIndex, 1);
      door.fomulas = fomulas;

      doors[dIndex] = door;
      mat.doors = doors;
      materials[mIndex] = mat;
      floor.materials = materials;
      newFloors[fIndex] = floor;
      return { floors: newFloors };
    });
  },

  getPayload: (accessoriesList, extraOptionsList) => {
    const { title, code, discountPercentage, status, projectId, reviewBy, floors, priceType } = get();

    // Làm sạch dữ liệu cấu trúc tầng trước khi tạo payload
    const cleanedFloors = floors.map((floor) => ({
      ...floor,
      materials: floor.materials.map((mat) => ({
        materialId: mat.materialId,
        initPrice: (mat.initPrice as any) === '' || mat.initPrice === undefined || mat.initPrice === null ? undefined : Number(mat.initPrice),
        doors: mat.doors.map((door) => {
          const accessories = (door.accessoryIds || []).map((id: number) => {
            const acc = (accessoriesList || []).find((a) => a.id === id);
            const pType = priceType || 'retail';
            const pKey = pType === 'retail' ? 'retailPrice' : (pType === 'sale' ? 'salePrice' : 'costPrice');
            const initPrice = acc
              ? (acc[pKey] !== undefined && acc[pKey] !== null
                ? acc[pKey]
                : (acc.retailPrice || acc.salePrice || acc.costPrice || 0))
              : 0;
            return {
              accessoryId: id,
              initPrice: Number(initPrice) || 0,
            };
          });

          const extraOptions = (door.extraOptionIds || []).map((id: number) => {
            const opt = (extraOptionsList || []).find((o) => o.id === id);
            const pType = priceType || 'retail';
            const pKey = pType === 'retail' ? 'retailPrice' : (pType === 'sale' ? 'salePrice' : 'costPrice');
            const initPrice = opt
              ? (opt[pKey] !== undefined && opt[pKey] !== null
                ? opt[pKey]
                : (opt.retailPrice || opt.salePrice || opt.costPrice || 0))
              : 0;
            return {
              optionId: id,
              initPrice: Number(initPrice) || 0,
            };
          });

          return {
            doorId: door.doorId,
            code: door.code?.trim() || undefined,
            width: (door.width as any) === '' ? 0 : Number(door.width) || 0,
            height: (door.height as any) === '' ? 0 : Number(door.height) || 0,
            quantity: (door.quantity as any) === '' ? 1 : Number(door.quantity) || 1,
            accessories,
            extraOptions,
            extraOptionIds: door.extraOptionIds || [],
            fomulas: door.fomulas || [],
          };
        }),
      })),
    }));

    return {
      title,
      code,
      discountPercentage: (discountPercentage as any) === '' ? 0 : Number(discountPercentage) || 0,
      status,
      projectId,
      reviewBy,
      termsAndConditions: get().termsAndConditions,
      floors: cleanedFloors,
      priceType: priceType || 'retail',
    };
  },

  createQuotation: async () => {
    const payload = get().getPayload([], []);
    return apiCreateQuotation(payload);
  },

  updateQuotation: async (id: number) => {
    const payload = get().getPayload([], []);
    return apiUpdateQuotation(id, payload);
  },
}));

export default useQuotationStore;
