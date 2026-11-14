import {
  createSupplierDoor,
  setPrimarySupplierDoorImage,
  updateSupplierDoor,
} from '@/actions';
import type { SupplierDoor, SupplierDoorImage } from '@/types';

export interface SubmitSupplierDoorParams {
  initialData?: SupplierDoor | null;
  supplierId: string;
  code: string;
  name: string;
  doorType: string;
  specification: string;
  referenceCostPerSqm: string;
  isActive: boolean;
  existingImages: SupplierDoorImage[];
  deletedImageIds: number[];
  primaryImageId: number | null;
  newFiles: File[];
  newPrimaryIdx: number;
}

export async function submitSupplierDoorForm(params: SubmitSupplierDoorParams) {
  const parsedSupplierId = Number(params.supplierId);
  const parsedCost = Number(params.referenceCostPerSqm.replace(/[^\d.]/g, '')) || 0;
  const shouldPromoteNewFile =
    params.newFiles.length > 0 &&
    (params.existingImages.length === 0 || params.primaryImageId === null);
  const primaryFile =
    shouldPromoteNewFile &&
    params.newPrimaryIdx >= 0 &&
    params.newPrimaryIdx < params.newFiles.length
      ? params.newFiles[params.newPrimaryIdx]
      : undefined;
  const extraFiles = params.newFiles.filter((file) => file !== primaryFile);

  const payloadData = {
    supplierId: parsedSupplierId,
    code: params.code.trim(),
    name: params.name.trim(),
    doorType: params.doorType,
    specification: params.specification.trim() || null,
    referenceCostPerSqm: parsedCost,
    isActive: params.isActive,
  };

  if (params.initialData) {
    const promoteUploadedPrimary = Boolean(primaryFile);
    const updated = await updateSupplierDoor(params.initialData.id, {
      data: payloadData,
      file: primaryFile,
      files: extraFiles.length > 0 ? extraFiles : undefined,
      deletedImageIds: params.deletedImageIds.length > 0 ? params.deletedImageIds : undefined,
      promoteUploadedPrimary,
    });
    if (params.primaryImageId && !primaryFile) {
      await setPrimarySupplierDoorImage(params.initialData.id, params.primaryImageId);
    }
    return updated;
  }

  return createSupplierDoor({
    data: payloadData,
    file: primaryFile,
    files: extraFiles.length > 0 ? extraFiles : undefined,
  });
}
