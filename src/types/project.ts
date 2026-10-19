import type { Customer } from './customer';
import type { User } from './user';
import type { Brand, BrandColor } from './brand';
import type { DoorSeries } from './door-series';

export type ProjectStatus =
  | 'draft'
  | 'surveying'
  | 'designing'
  | 'quotation'
  | 'contract'
  | 'producing'
  | 'installing'
  | 'completed'
  | 'cancelled';

export interface ProjectFloorItem {
  id: number;
  projectId: number;
  name: string;
  orderIndex: number;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: number;
  code: string;
  name: string;
  customerId: number;
  status: ProjectStatus;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  defaultBrandId: number | null;
  defaultSeriesId: number | null;
  defaultColorId: number | null;
  startDate: string | null;
  targetDate: string | null;
  handoverDate: string | null;
  warrantyEndDate: string | null;
  totalPositions: number;
  totalAreaM2: number;
  totalAluminumKg: number;
  customer?: Pick<Customer, 'id' | 'name' | 'phone'> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  customer: Customer | null;
  user: User | null;
  defaultBrand: Brand | null;
  defaultSeries: DoorSeries | null;
  defaultColor: BrandColor | null;
  floors: ProjectFloorItem[];
}

export interface ProjectCreate {
  code?: string;
  name: string;
  customerId: number;
  status?: ProjectStatus;
  note?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  defaultBrandId?: number;
  defaultSeriesId?: number;
  defaultColorId?: number;
  startDate?: string;
  targetDate?: string;
  handoverDate?: string;
  warrantyEndDate?: string;
}

export interface ProjectUpdate {
  name?: string;
  customerId?: number;
  status?: ProjectStatus;
  note?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  defaultBrandId?: number;
  defaultSeriesId?: number;
  defaultColorId?: number;
  startDate?: string;
  targetDate?: string;
  handoverDate?: string;
  warrantyEndDate?: string;
}

export interface ProjectQueryParams {
  search?: string;
  customerId?: number;
  userId?: string;
  status?: ProjectStatus;
  code?: string;
  offset?: number;
  limit?: number;
}

export interface ProjectActivity {
  id: number;
  projectId: number;
  userId: string | null;
  actorType: string;
  actionType: string;
  actionCategory: string;
  actionTitle: string;
  targetType: string | null;
  targetId: number | null;
  targetName: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'fullName' | 'email'> | null;
}


export interface ProjectActivityQueryParams {
  projectId?: number;
  actionCategory?: string;
  actionType?: string;
  userId?: string;
  offset?: number;
  limit?: number;
}

// Module 002: Tầng & Vị trí cửa
export type DoorPositionStatus =
  | 'draft'
  | 'surveyed'
  | 'designed'
  | 'approved'
  | 'producing'
  | 'completed'
  | 'cancelled';

export interface ProjectFloor {
  id: number;
  projectId: number;
  name: string;
  nameNormalized: string;
  orderIndex: number;
  note?: string | null;
  doorsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFloorCreate {
  name: string;
  orderIndex?: number;
  note?: string;
}

export interface ProjectFloorUpdate {
  name?: string;
  orderIndex?: number;
  note?: string;
}

export interface ProjectDoorPosition {
  id: number;
  projectId: number;
  floorId: number;
  code: string;
  description?: string | null;
  doorType: 'door' | 'window' | string;
  templateDoorId?: number | null;
  width: number;
  height: number;
  areaM2: number;
  aluminumKg: number;
  brandId?: number | null;
  doorSeriesId?: number | null;
  colorId?: number | null;
  glassId?: number | null;
  gasketId?: number | null;
  status: DoorPositionStatus;
  qrCodeToken: string;
  revision: number;
  isMeasured?: boolean;
  measuredAt?: string | null;
  measureNote?: string | null;
  systemConfig?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  floor?: Pick<ProjectFloor, 'id' | 'name'> | null;
  brand?: Pick<Brand, 'id' | 'name'> | null;
  doorSeries?: Pick<DoorSeries, 'id' | 'name'> | null;
  color?: Pick<BrandColor, 'id' | 'name' | 'colorHex'> | null;
}

export interface ProjectDoorPositionCreate {
  projectId: number;
  code: string;
  floorId?: number;
  floorName?: string;
  description?: string;
  doorType?: string;
  templateDoorId?: number;
  width: number;
  height: number;
  brandId?: number;
  doorSeriesId?: number;
  colorId?: number;
  glassId?: number;
  gasketId?: number;
  status?: DoorPositionStatus;
  systemConfig?: Record<string, any>;
}

export interface ProjectDoorPositionBulkCreate {
  projectId: number;
  floorId?: number;
  floorName?: string;
  baseCode: string;
  quantity: number;
  description?: string;
  doorType?: string;
  templateDoorId?: number;
  width: number;
  height: number;
  brandId?: number;
  doorSeriesId?: number;
  colorId?: number;
  glassId?: number;
  gasketId?: number;
}

export interface ProjectDoorPositionUpdate {
  code?: string;
  floorId?: number;
  floorName?: string;
  description?: string;
  doorType?: string;
  templateDoorId?: number;
  width?: number;
  height?: number;
  brandId?: number;
  doorSeriesId?: number;
  colorId?: number;
  glassId?: number;
  gasketId?: number;
  status?: DoorPositionStatus;
  systemConfig?: Record<string, any>;
  revision?: number;
}

export interface ProjectDoorPositionDuplicate {
  newCode?: string;
  newFloorId?: number;
  newFloorName?: string;
}

export interface MeasurePositionRequest {
  width: number;
  height: number;
  measureNote?: string;
}

export interface MeasurePositionResponse {
  positionId: number;
  positionCode: string;
  width: number;
  height: number;
  areaM2: number;
  isMeasured: boolean;
  measuredAt?: string | null;
  toleranceExceeded: boolean;
  toleranceDiffMm: number;
  warningMessage?: string | null;
}

// Module 004: Hợp đồng & Sổ cái thanh toán
export interface ContractMilestoneInput {
  milestoneOrder: number;
  installmentName: string;
  percentage: number;
  dueDate?: string;
  note?: string;
}

export interface ContractCreatePayload {
  quotationId: number;
  contractName?: string;
  contractDate?: string;
  milestones?: ContractMilestoneInput[];
  note?: string;
}

export interface ContractAppendixCreatePayload {
  parentContractId: number;
  quotationId: number;
  contractName?: string;
  contractDate?: string;
  milestones?: ContractMilestoneInput[];
  note?: string;
}

export interface ProjectContractItem {
  id: number;
  projectId: number;
  quotationId: number;
  parentContractId?: number | null;
  contractCode: string;
  contractName: string;
  kind: 'main' | 'appendix';
  status: 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'cancelled';
  contractDate?: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  contractFileUrl?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  payments?: ProjectPaymentMilestoneItem[];
}

export interface ProjectPaymentMilestoneItem {
  id: number;
  projectId: number;
  contractId: number;
  milestoneOrder: number;
  installmentName: string;
  percentage: number;
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate?: string | null;
  status: 'pending' | 'partial' | 'completed' | 'overdue';
  note?: string | null;
}

export interface ProjectLedgerSummary {
  projectId: number;
  totalContractValue: number;
  totalCollected: number;
  remainingDebt: number;
  totalTransactionsCount: number;
  isFullyPaid: boolean;
}

export interface PaymentTransactionItem {
  id: number;
  transactionCode: string;
  projectId: number;
  paymentInstallmentId?: number | null;
  contractId?: number | null;
  amount: number;
  transactionType: 'collection' | 'refund' | 'reversal';
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'e_wallet' | 'other';
  bankReference?: string | null;
  transactionDate: string;
  receiptImage?: string | null;
  reversalOfId?: number | null;
  note?: string | null;
  createdAt: string;
}

export interface PaymentTransactionCreatePayload {
  projectId: number;
  paymentInstallmentId?: number;
  contractId?: number;
  amount: number;
  transactionType?: 'collection' | 'refund';
  paymentMethod?: string;
  bankReference?: string;
  note?: string;
}

export interface PaymentTransactionReversalPayload {
  reversalOfId: number;
  note: string;
}

// Module 005: Lệnh sản xuất, KCS, Thẻ A4 & Tiến độ
export interface ProductionOrderCreatePayload {
  name: string;
  startDate?: string;
  dueDate?: string;
  positionIds: number[];
  note?: string;
}

export interface ProductionOrderItem {
  id: number;
  productionOrderId: number;
  positionId: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  positionCode?: string;
  doorName?: string;
  floorName?: string;
  width?: number;
  height?: number;
  areaM2?: number;
  isStale?: boolean;
}

export interface ProductionOrder {
  id: number;
  projectId: number;
  code: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate?: string | null;
  dueDate?: string | null;
  note?: string | null;
  totalItems: number;
  completedItems: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
  items?: ProductionOrderItem[];
}

export interface ProgressMatrixItem {
  floorId: number;
  floorName: string;
  positions: {
    id: number;
    code: string;
    name: string;
    areaM2: number;
    status: string;
  }[];
}

export interface ProjectProgressMatrix {
  projectId: number;
  totalPositions: number;
  factoryProgressPercent: number;
  overallProgressPercent: number;
  matrix: ProgressMatrixItem[];
}




