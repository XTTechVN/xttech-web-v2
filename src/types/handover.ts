import type { EvidenceMediaItem, ProgressStepCode } from './cutting-plan';

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

export interface PublicSigningView {
  subjectType: 'contract' | 'acceptance' | 'quotation';
  /** Trạng thái chứng từ hoặc link: signed | revoked | expired | draft | sent | awaiting_customer... */
  status: string;
  expiresAt: string;
  projectName: string;
  projectAddress?: string | null;
  documentCode: string;
  documentTitle: string;
  totalAmount?: number | null;
  parties?: Record<string, Record<string, string>> | null;
  milestones: { name: string; percentage: number; amount: number }[];
  items: {
    code?: string;
    name?: string;
    floor?: string;
    width?: number;
    height?: number;
    areaM2?: number;
    /** Chỉ có ở báo giá */
    sellingPrice?: number;
  }[];
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

export interface ProjectAcceptance {
  id: number;
  projectId: number;
  code: string;
  status: AcceptanceStatus;
  positionIds: number[];
  positionCodes: string[];
  photos: EvidenceMediaItem[];
  note?: string | null;
  signatures: ESignature[];
  signedAt?: string | null;
  createdAt: string;
  signing?: SigningRequestResult | null;
}

export interface AcceptanceCreatePayload {
  positionIds: number[];
  photos: EvidenceMediaItem[];
  note?: string;
  companySignature: SignatureInput;
  customerSignature?: SignatureInput;
  sendLink?: boolean;
  recipientEmail?: string;
}

// ---------- Bảo hành ----------
export type WarrantyState = 'not_started' | 'active' | 'expired';
export type WarrantyVisitStatus = 'scheduled' | 'in_progress' | 'done' | 'cancelled';
export type WarrantyVisitKind = 'periodic' | 'claim';

export interface WarrantyVisit {
  id: number;
  projectId: number;
  code: string;
  kind: WarrantyVisitKind;
  title: string;
  monthMark?: number | null;
  status: WarrantyVisitStatus;
  scheduledDate: string;
  actualDate?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  positionIds: number[];
  issueDescription?: string | null;
  resultNote?: string | null;
  photos: EvidenceMediaItem[];
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
  progressPercent: number;
  nextVisit?: WarrantyVisit | null;
  visits: WarrantyVisit[];
}

export interface WarrantyVisitCreatePayload {
  kind?: WarrantyVisitKind;
  title: string;
  scheduledDate: string;
  assigneeId?: string;
  issueDescription?: string;
  isChargeable?: boolean;
  feeAmount?: number;
  scopeNote?: string;
}

export interface WarrantyVisitUpdatePayload {
  title?: string;
  scheduledDate?: string;
  assigneeId?: string;
  issueDescription?: string;
  isInScope?: boolean;
  isChargeable?: boolean;
  feeAmount?: number;
  scopeNote?: string;
}

export interface WarrantyVisitCompletePayload {
  resultNote: string;
  photos: EvidenceMediaItem[];
  actualDate?: string;
  feeAmount?: number;
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

// ---------- Trang QR công khai ----------
export interface PositionQrView {
  projectId: number;
  code: string;
  name?: string | null;
  doorName: string;
  doorType?: string | null;
  projectName: string;
  projectAddress?: string | null;
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
}
