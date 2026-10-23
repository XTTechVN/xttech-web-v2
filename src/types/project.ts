import type { ProgressStepCode } from './cutting-plan';
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
  defaultBrandId?: number | null;
  defaultSeriesId?: number | null;
  defaultColorId?: number | null;
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
  defaultBrandId?: number | null;
  defaultSeriesId?: number | null;
  defaultColorId?: number | null;
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

export interface ProjectStatsResponse {
  total: number;
  planning: number;
  quoting: number;
  inProgress: number;
  completed: number;
  cancelled: number;
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
  systemConfig?: Record<string, any>;
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

export interface ContractTerms {
  // Nội dung soạn thảo gộp chung (Cơ chế, Điều khoản, Chính sách)
  content?: string;
  // Dữ liệu cũ tách 3 phần: chỉ đọc để gộp khi hiển thị, sẽ bị bỏ khi lưu lại
  mechanism?: string;
  clauses?: string;
  policy?: string;
  // Các khóa do hệ thống quản lý (thay thế, hủy...) được giữ nguyên khi gửi lại
  [systemKey: string]: unknown;
}

// Thông tin Bên A hiển thị trên hợp đồng (camelCase ở UI, được chuyển đổi khi lưu - xem contract-party.ts)
export interface ContractPartyA {
  name: string;
  identityCard: string;
  birthDate: string;
  identityIssuedDate: string;
  address: string;
  siteAddress: string;
  phone: string;
}

// Dữ liệu thô của snapshot hai bên do backend lưu (khóa dạng snake_case)
export interface ContractPartySnapshot {
  party_a?: Record<string, string | null | undefined>;
}

export interface ContractUpdatePayload {
  contractName?: string;
  contractTerms?: ContractTerms;
  note?: string;
}

export interface ContractCreatePayload {
  contractTerms?: ContractTerms;
  partyAOverride?: Record<string, string>;
  quotationId?: number;
  contractName?: string;
  contractDate?: string;
  milestones?: ContractMilestoneInput[];
  note?: string;
}

export interface ContractCancelPayload {
  reason?: string;
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
  replacedContractCode?: string | null;
  inheritedPaidAmount: number;
  contractTerms?: ContractTerms | null;
  partySnapshot?: ContractPartySnapshot | null;
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

export interface ProgressStepStatus {
  isDone: boolean;
  isCurrent: boolean;
  updatedAt?: string | null;
  updatedByName?: string | null;
  note?: string | null;
  evidenceCount: number;
}

export interface ProgressMatrixItem {
  positionId: number;
  positionCode: string;
  positionName?: string | null;
  doorName: string;
  floorName: string;
  width: number;
  height: number;
  areaM2: number;
  currentStatus: ProgressStepCode;
  surveyed: ProgressStepStatus;
  producing: ProgressStepStatus;
  factoryDone: ProgressStepStatus;
  delivered: ProgressStepStatus;
  installed: ProgressStepStatus;
  accepted: ProgressStepStatus;
}

export interface ProjectProgressMatrix {
  projectId: number;
  items: ProgressMatrixItem[];
  totalPositions: number;
  factoryProgressPercent: number;
  overallWeightedProgressPercent: number;
}

export interface ProductionSheetProfileItem {
  profileCode: string;
  profileName: string;
  cutLengthMm: number;
  cutAngle: string;
  quantity: number;
  barType: string;
  weightKg?: number | null;
  stockSource?: string | null;
}

export interface ProductionSheetGlassItem {
  glassName: string;
  widthMm: number;
  heightMm: number;
  areaM2: number;
  quantity: number;
}

export interface ProductionSheetGasketItem {
  code?: string;
  name?: string;
  lengthM?: number;
  unit?: string;
}

export interface ProductionSheetAccessoryItem {
  accessoryCode?: string | null;
  accessoryName: string;
  quantity: number;
  unit: string;
}

export interface ProductionSheetReinforcementItem {
  accessoryCode?: string | null;
  accessoryName?: string | null;
  name?: string | null;
  qty?: number;
  quantity?: number;
  unit?: string;
}

export interface ProductionSheet {
  orderCode: string;
  orderName: string;
  positionId: number;
  positionCode: string;
  positionName?: string | null;
  doorName: string;
  floorName: string;
  width: number;
  height: number;
  areaM2: number;
  brandName?: string | null;
  seriesName?: string | null;
  colorName?: string | null;
  imagePath?: string | null;
  totalWeightKg: number;
  isEstimated: boolean;
  profiles: ProductionSheetProfileItem[];
  glasses: ProductionSheetGlassItem[];
  gaskets: ProductionSheetGasketItem[];
  accessories: ProductionSheetAccessoryItem[];
  reinforcements: ProductionSheetReinforcementItem[];
  systemConfig?: Record<string, any> | null;
}




