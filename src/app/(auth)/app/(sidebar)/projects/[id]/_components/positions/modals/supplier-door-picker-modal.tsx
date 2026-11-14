'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Store } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  bulkCreateProjectPositions,
  createProjectPosition,
  getWarehouseSuppliers,
} from '@/actions';
import { Modal } from '@/components';
import type {
  PositionCostStatus,
  ProjectDoorPosition,
  ProjectFloor,
  SupplierDoor,
} from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import {
  SupplierDoorCatalogGrid,
  SupplierDoorInfoStep,
} from '../components/supplier-picker';
import { normalizeBulkBaseCode } from '../components/template-door-info-step';
import { generateNextPositionCode } from './position-draw-init-modal';

interface SupplierDoorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  floors: ProjectFloor[];
  selectedFloorId: number | 'all';
  existingPositions: ProjectDoorPosition[];
  onOpenSketchAfterCreate?: (created: ProjectDoorPosition) => void;
}

export function SupplierDoorPickerModal(props: SupplierDoorPickerModalProps) {
  const modalKey = `${props.projectId}-${props.selectedFloorId}-${props.isOpen ? 'open' : 'closed'}`;
  return <SupplierDoorPickerInner key={modalKey} {...props} />;
}

function SupplierDoorPickerInner({
  isOpen,
  onClose,
  projectId,
  floors,
  selectedFloorId,
  existingPositions,
  onOpenSketchAfterCreate,
}: SupplierDoorPickerModalProps) {
  const defaultFloorId = useMemo(() => {
    if (typeof selectedFloorId === 'number') return String(selectedFloorId);
    return floors[0]?.id ? String(floors[0].id) : '';
  }, [selectedFloorId, floors]);

  const [step, setStep] = useState<'select' | 'info'>('select');
  const [selectedDoor, setSelectedDoor] = useState<SupplierDoor | null>(null);
  const [supplierId, setSupplierId] = useState<string>('');
  const [code, setCode] = useState<string>(() => generateNextPositionCode(existingPositions));
  const [floorId, setFloorId] = useState<string>(defaultFloorId);
  const [width, setWidth] = useState<number>(900);
  const [height, setHeight] = useState<number>(2200);
  const [quantity, setQuantity] = useState<number>(1);
  const [description, setDescription] = useState<string>('');
  const [manualCostInput, setManualCostInput] = useState<string | null>(null);
  const [costStatus, setCostStatus] = useState<PositionCostStatus>('estimated');
  const [isInstallationIncluded, setIsInstallationIncluded] = useState<boolean>(false);

  const { data: suppliersData } = useQuery({
    queryKey: ['warehouse-suppliers', 'door_set'],
    queryFn: () => getWarehouseSuppliers({ supplier_type: 'door_set', is_active: true, limit: 200 }),
    enabled: isOpen,
  });

  const areaM2 = (Math.max(0, width) * Math.max(0, height)) / 1_000_000;
  const computedCost = selectedDoor
    ? String(Math.round((selectedDoor.referenceCostPerSqm || 0) * areaM2))
    : '0';
  const supplierCostValue = manualCostInput !== null ? manualCostInput : computedCost;

  const { mutate: createOutsourcedMutate, isPending } = useMutation({
    mutationFn: async (openSketchAfter: boolean) => {
      const parsedSupplierId = supplierId ? Number(supplierId) : selectedDoor?.supplierId;
      if (!parsedSupplierId) throw new Error('Vui lòng chọn nhà cung cấp');
      const parsedCost = Number(supplierCostValue.replace(/[^\d.]/g, '')) || 0;
      const validQty = Math.max(1, Math.min(100, Math.floor(Number(quantity) || 1)));
      const visualMode = selectedDoor?.imagePath ? ('catalog_image' as const) : ('cad' as const);
      const parsedFloorId = floorId ? Number(floorId) : undefined;

      if (validQty === 1) {
        const created = await createProjectPosition(projectId, {
          projectId,
          code: code.trim(),
          floorId: parsedFloorId,
          description: description.trim() || selectedDoor?.name || 'Cửa nhập NCC',
          doorType: selectedDoor?.doorType || 'casement_door',
          width,
          height,
          fulfillmentType: 'outsourced',
          supplierId: parsedSupplierId,
          supplierDoorId: selectedDoor?.id ?? null,
          costStatus,
          supplierCostPrice: parsedCost,
          isInstallationIncluded,
          visualMode,
        });
        return { items: [created], openSketchAfter };
      }

      const items = await bulkCreateProjectPositions(projectId, {
        projectId,
        floorId: parsedFloorId,
        baseCode: normalizeBulkBaseCode(code),
        quantity: validQty,
        description: description.trim() || selectedDoor?.name || 'Cửa nhập NCC',
        doorType: selectedDoor?.doorType || 'casement_door',
        width,
        height,
        fulfillmentType: 'outsourced',
        supplierId: parsedSupplierId,
        supplierDoorId: selectedDoor?.id ?? null,
        costStatus,
        supplierCostPrice: parsedCost,
        isInstallationIncluded,
        visualMode,
      });
      return { items, openSketchAfter: false };
    },
    onSuccess: ({ items, openSketchAfter }) => {
      queryClient.invalidateQueries({ queryKey: ['project_positions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(`Đã thêm ${items.length} bộ cửa nhập NCC vào dự án`);
      onClose();
      if (openSketchAfter && items[0]) {
        onOpenSketchAfterCreate?.(items[0]);
      }
    },
    onError: (err) => showErrorToast(err, 'Không thể thêm cửa nhập NCC'),
  });

  const handleSelectCatalog = (door: SupplierDoor) => {
    setSelectedDoor(door);
    setSupplierId(String(door.supplierId));
    setDescription(door.name);
    setManualCostInput(null);
    setStep('info');
  };

  const handleSelectCustom = () => {
    setSelectedDoor(null);
    setSupplierId('');
    setDescription('');
    setManualCostInput('0');
    setStep('info');
  };

  const handleSubmit = (openSketchAfter: boolean) => {
    if (!code.trim()) return toast.error('Vui lòng nhập mã vị trí cửa');
    if (width <= 0 || height <= 0) return toast.error('Kích thước phải lớn hơn 0');
    if (!supplierId && !selectedDoor?.supplierId) return toast.error('Vui lòng chọn nhà cung cấp');
    createOutsourcedMutate(openSketchAfter);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          <span>{step === 'select' ? 'Chọn mẫu cửa nhập nguyên bộ (NCC)' : 'Thông số cửa nhập NCC'}</span>
        </div>
      }
    >
      {step === 'select' ? (
        <SupplierDoorCatalogGrid
          onSelectCatalogDoor={handleSelectCatalog}
          onSelectCustomDoor={handleSelectCustom}
        />
      ) : (
        <SupplierDoorInfoStep
          selectedDoor={selectedDoor}
          suppliers={suppliersData?.items ?? []}
          floors={floors}
          supplierId={supplierId}
          onChangeSupplierId={setSupplierId}
          code={code}
          onChangeCode={setCode}
          floorId={floorId}
          onChangeFloorId={setFloorId}
          width={width}
          onChangeWidth={setWidth}
          height={height}
          onChangeHeight={setHeight}
          quantity={quantity}
          onChangeQuantity={setQuantity}
          description={description}
          onChangeDescription={setDescription}
          supplierCostValue={supplierCostValue}
          isCostOverridden={manualCostInput !== null}
          onChangeSupplierCost={setManualCostInput}
          onResetAutoCost={() => setManualCostInput(null)}
          costStatus={costStatus}
          onChangeCostStatus={setCostStatus}
          isInstallationIncluded={isInstallationIncluded}
          onChangeInstallationIncluded={setIsInstallationIncluded}
          isSubmitting={isPending}
          onBack={() => setStep('select')}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  );
}
