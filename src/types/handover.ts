import type { EvidenceMediaItem, ProgressStepCode } from './cutting-plan';
import type { DoorFulfillmentType } from './supplier-door';

// ---------- Chữ ký điện tử ----------
export interface SignatureInput {
  signerName: string;
  signerTitle?: string;
  /** Ảnh chữ ký dạng data URL PNG (vẽ tay trên màn hình) */
  signatureImage: string;
}

export interface ESignature {
  id: number;
  party: 'company' | 'customer';
  signerName: string;
  signerTitle?: string | null;
  signatureImage: string;
  signedAt: string;
}

export interface SigningRequestPayload {
  recipientName?: string;
  recipientEmail?: string;
  expiresInDays?: number;
  companySignature?: SignatureInput;
  sendEmail?: boolean;
}

export interface SigningRequestResult {
  id: number;
  subjectType: 'contract' | 'acceptance' | 'quotation';
  subjectId: number;
  token: string;
  signingUrl: string;
  status: string;
  recipientEmail?: string | null;
  expiresAt: string;
  emailSent: boolean;
}

export type AcceptanceItemResult = 'passed' | 'failed';

export type PublicSigningSubject = 'contract' | 'acceptance' | 'quotation';

export interface PublicParty {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  representative?: string | null;
  representativeRole?: string | null;
  taxCode?: string | null;
}

export interface PublicParties {
  partyA?: PublicParty | null;
}

export interface PublicMilestone {
  name: string;
  percentage?: number | null;
  amount?: number | null;
}

export interface PublicDoorSpec {
  width?: number | null;
  height?: number | null;
  areaM2?: number | null;
  doorType?: string | null;
  brandName?: string | null;
  colorName?: string | null;
  colorHex?: string | null;
  supplierName?: string | null;
  specification?: string | null;
  glassName?: string | null;
  note?: string | null;
}

export interface PublicDoorDrawing {
  imagePath?: string | null;
  systemConfig?: Record<string, unknown> | null;
}

export interface PublicAccessoryLine {
  code?: string | null;
  name: string;
  category?: string | null;
  brandName?: string | null;
  comboName?: string | null;
  unit?: string | null;
  quantity: number;
  note?: string | null;
}

export interface PublicDoorPricing {
  unitPricePerM2: number;
  unit?: 'm2' | 'set';
  unitPrice?: number;
  amount: number;
  doorAmount: number;
  accessoryAmount: number;
}

export interface PublicSigningItem {
  positionId: number;
  code: string;
  name: string;
  floorId?: number | null;
  floorName?: string | null;
  sortIndex: number;
  spec: PublicDoorSpec;
  drawing?: PublicDoorDrawing | null;
  accessories: PublicAccessoryLine[];
  pricing?: PublicDoorPricing | null;
  /** Chỉ có ở nghiệm thu */
  result?: AcceptanceItemResult | null;
  note?: string | null;
}

export interface PublicPricingSummary {
  accessoryMode: string;
  totalQuantity: number;
  totalAreaM2: number;
  subtotalAmount?: number | null;
  otherAmount?: number | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  amountBeforeVat?: number | null;
  vatPercent?: number | null;
  vatAmount?: number | null;
  totalAmount?: number | null;
}

export interface PublicSigningView {
  subjectType: PublicSigningSubject;
  /** Trạng thái chứng từ hoặc link: signed | revoked | expired | draft | sent | awaiting_customer... */
  status: string;
  expiresAt: string;
  projectName: string;
  projectAddress?: string | null;
  documentCode: string;
  documentTitle: string;
  totalAmount?: number | null;
  parties?: PublicParties | null;
  milestones: PublicMilestone[];
  items: PublicSigningItem[];
  pricing?: PublicPricingSummary | null;
  photos: EvidenceMediaItem[];
  signatures: ESignature[];
}

export interface PublicSignPayload {
  signerName: string;
  signerTitle?: string;
  signatureImage: string;
  agree: boolean;
}

// ---------- Nghiệm thu ----------
export type AcceptanceStatus = 'awaiting_customer' | 'signed' | 'cancelled';

export interface AcceptanceItemInput {
  positionId: number;
  result: AcceptanceItemResult;
  note?: string;
}

export interface AcceptanceItem {
  positionId: number;
  positionCode: string;
  doorName: string;
  result: AcceptanceItemResult;
  note?: string | null;
}

export interface ProjectAcceptance {
  id: number;
  projectId: number;
  code: string;
  status: AcceptanceStatus;
  positionIds: number[];
  positionCodes: string[];
  items?: AcceptanceItem[];
  photos: EvidenceMediaItem[];
  note?: string | null;
  signatures: ESignature[];
  signedAt?: string | null;
  createdAt: string;
  signing?: SigningRequestResult | null;
}

export interface AcceptanceCreatePayload {
  positionIds?: number[];
  items?: AcceptanceItemInput[];
  photos: EvidenceMediaItem[];
  note?: string;
  companySignature: SignatureInput;
  customerSignature?: SignatureInput;
  sendLink?: boolean;
  recipientEmail?: string;
}

// ---------- Bảo hành & Sửa chữa 2 Giai đoạn ----------
export type WarrantyState = 'not_started' | 'active' | 'expired';
export type WarrantyVisitStatus = 'scheduled' | 'in_progress' | 'done' | 'cancelled';
export type WarrantyVisitKind = 'periodic' | 'claim';
export type WarrantyIssueTag =
  | 'lock_jam'
  | 'sash_sag'
  | 'water_leak'
  | 'glass_crack'
  | 'seal_peel'
  | 'other';

export interface WarrantyVisitPositionItem {
  id: number;
  code: string;
  name?: string | null;
  doorName: string;
  floorId: number;
  floorName?: string | null;
  width: number;
  height: number;
  areaM2: number;
  designImage?: string | null;
  fulfillmentType?: DoorFulfillmentType;
  supplierName?: string | null;
}

export interface WarrantyVisit {
  id: number;
  projectId: number;
  projectCode?: string | null;
  projectName?: string | null;
  projectAddress?: string | null;
  code: string;
  kind: WarrantyVisitKind;
  title: string;
  status: WarrantyVisitStatus;
  scheduledDate: string;
  actualDate?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  positionIds: number[];
  positions: WarrantyVisitPositionItem[];
  // Giai đoạn 1: Khách hàng báo
  requesterName?: string | null;
  requesterPhone?: string | null;
  issueTags: WarrantyIssueTag[];
  issueDescription?: string | null;
  customerPhotos: EvidenceMediaItem[];
  // Giai đoạn 2: Kỹ thuật viên kiểm tra & xử lý
  diagnosisNote?: string | null;
  damagedParts: string[];
  repairActions?: string | null;
  replacedParts: string[];
  resultNote?: string | null;
  photos: EvidenceMediaItem[];
  // Phạm vi & phí
  isInScope: boolean;
  isChargeable: boolean;
  feeAmount: number;
  scopeNote?: string | null;
  isOverdue: boolean;
  completedAt?: string | null;
  createdAt: string;
}

export interface WarrantySummary {
  projectId: number;
  state: WarrantyState;
  warrantyMonths: number;
  startDate?: string | null;
  endDate?: string | null;
  daysRemaining?: number | null;
  elapsedPercent: number;
  totalVisits: number;
  doneVisits: number;
  upcomingVisits: number;
  overdueVisits: number;
  nextVisit?: WarrantyVisit | null;
  visits: WarrantyVisit[];
}

export interface WarrantyQueueStats {
  totalOpen: number;
  newClaims: number;
  inProgressCount: number;
  overdueCount: number;
  doneCount: number;
}

export interface WarrantyQueueQueryParams {
  search?: string;
  status?: WarrantyVisitStatus;
  kind?: WarrantyVisitKind;
  isChargeable?: boolean;
  overdueOnly?: boolean;
  openOnly?: boolean;
  assigneeId?: string;
  projectId?: number;
  offset?: number;
  limit?: number;
}

export interface WarrantyQueueResponse {
  stats: WarrantyQueueStats;
  items: WarrantyVisit[];
  total: number;
}

export interface PublicWarrantyClaimCreatePayload {
  positionIds: number[];
  requesterName: string;
  requesterPhone: string;
  scheduledDate?: string | null;
  issueTags: WarrantyIssueTag[];
  issueDescription: string;
  customerPhotos: EvidenceMediaItem[];
}

export interface WarrantyVisitCreatePayload {
  kind?: WarrantyVisitKind;
  title: string;
  scheduledDate: string;
  assigneeId?: string;
  positionIds?: number[];
  requesterName?: string;
  requesterPhone?: string;
  issueTags?: WarrantyIssueTag[];
  issueDescription?: string;
  customerPhotos?: EvidenceMediaItem[];
  isInScope?: boolean;
  isChargeable?: boolean;
  feeAmount?: number;
  scopeNote?: string;
}

export interface WarrantyVisitUpdatePayload {
  title?: string;
  scheduledDate?: string;
  assigneeId?: string | null;
  positionIds?: number[];
  requesterName?: string | null;
  requesterPhone?: string | null;
  issueTags?: WarrantyIssueTag[];
  issueDescription?: string | null;
  customerPhotos?: EvidenceMediaItem[];
  diagnosisNote?: string | null;
  damagedParts?: string[];
  repairActions?: string | null;
  replacedParts?: string[];
  isInScope?: boolean;
  isChargeable?: boolean;
  feeAmount?: number;
  scopeNote?: string | null;
}

export interface WarrantyVisitCompletePayload {
  resultNote: string;
  photos: EvidenceMediaItem[];
  actualDate?: string;
  diagnosisNote?: string | null;
  damagedParts?: string[];
  repairActions?: string | null;
  replacedParts?: string[];
  isInScope?: boolean;
  isChargeable?: boolean;
  feeAmount?: number;
  scopeNote?: string | null;
}

// ---------- Tổng quan dự án & báo cáo ----------
export interface ProjectOverview {
  projectId: number;
  code: string;
  name: string;
  status: string;
  completedDate?: string | null;
  quotation: {
    id?: number | null;
    code?: string | null;
    version?: number | null;
    status?: string | null;
    isLocked: boolean;
    isOutdated: boolean;
    outdatedReason?: string | null;
    totalAmount: number;
  };
  contract: {
    id?: number | null;
    code?: string | null;
    status?: string | null;
    totalAmount: number;
    replacedCount: number;
    /** Đang chờ khách ký hợp đồng thay thế (cửa không đổi vẫn sản xuất theo hợp đồng cũ) */
    awaitingReplacementSignature: boolean;
  };
  production: {
    percent: number;
    factoryPercent: number;
    totalPositions: number;
    totalAreaM2: number;
    statusCounts: Record<ProgressStepCode, number>;
    statusLabels: Record<ProgressStepCode, string>;
  };
  payment: {
    hasSignedContract: boolean;
    contractTotal: number;
    collected: number;
    remaining: number;
    percent: number;
    isFullyPaid: boolean;
  };
  warranty: WarrantySummary;
  nextActions: string[];
}

export interface ReportOverview {
  generatedAt: string;
  projectsByStatus: Record<string, number>;
  totalProjects: number;
  contractValue: number;
  collected: number;
  outstanding: number;
  positionsByStatus: Record<ProgressStepCode, number>;
  areaM2ByStatus: Record<ProgressStepCode, number>;
  warranty: { activeProjects: number; upcomingVisits7d: number; overdueVisits: number };
}

// ---------- Trang QR công khai Đa Tab ----------
export interface QrWarrantyHeader {
  state: WarrantyState;
  warrantyMonths: number;
  startDate?: string | null;
  endDate?: string | null;
  daysRemaining?: number | null;
  elapsedPercent: number;
  totalVisits: number;
  openClaimsCount: number;
}

export interface QrProjectDoorItem {
  id: number;
  code: string;
  name?: string | null;
  doorName: string;
  doorType?: string | null;
  floorId: number;
  floorName?: string | null;
  width: number;
  height: number;
  areaM2: number;
  isMeasured: boolean;
  status: ProgressStepCode;
  statusLabel: string;
  brandName?: string | null;
  seriesName?: string | null;
  colorName?: string | null;
  glassName?: string | null;
  designImage?: string | null;
  systemConfig?: Record<string, unknown> | null;
  fulfillmentType?: DoorFulfillmentType;
  supplierName?: string | null;
  qrToken: string;
}

export interface PositionQrView {
  positionId: number;
  projectId: number;
  code: string;
  name?: string | null;
  doorName: string;
  doorType?: string | null;
  projectName: string;
  projectAddress?: string | null;
  floorId?: number | null;
  floorName?: string | null;
  width: number;
  height: number;
  areaM2: number;
  isMeasured: boolean;
  measuredAt?: string | null;
  status: ProgressStepCode;
  statusLabel: string;
  brandName?: string | null;
  seriesName?: string | null;
  colorName?: string | null;
  glassName?: string | null;
  designImage?: string | null;
  systemConfig?: Record<string, unknown> | null;
  fulfillmentType?: DoorFulfillmentType;
  supplierName?: string | null;
  bars: {
    name: string;
    length: number;
    qty: number;
    goc1?: number;
    goc2?: number;
    profileCode?: string | null;
    profileName?: string | null;
    positions?: string[];
  }[];
  photos: (EvidenceMediaItem & { stepCode?: string })[];
  timeline: {
    stepCode: string;
    stepLabel: string;
    direction: 'forward' | 'backward';
    note?: string | null;
    updatedBy?: string | null;
    evidenceMedia: EvidenceMediaItem[];
    createdAt: string;
  }[];
  allowedNextSteps: ProgressStepCode[];
  qrUrl: string;
  totalProjectDoors: number;
  warrantyHeader: QrWarrantyHeader;
}
