import { DoorCalculateResponse } from '@/types';
import { FrameConfig, SashConfig, SceneCellNode } from '../studio-types';
import { resolveGlobalCadReversalMode } from '../cad-engine/cad-reversal-utils';

export const detectProfileIssues = ({
  rootCell,
  frameConfig,
  sashConfig,
  seriesId,
  calcData,
}: {
  rootCell?: SceneCellNode;
  frameConfig?: FrameConfig;
  sashConfig?: SashConfig;
  seriesId?: number;
  calcData?: DoorCalculateResponse | null;
}): string[] => {
  const issues: string[] = [];

  // 1. Kiểm tra Hệ nhôm
  if (!seriesId) {
    issues.push('Chưa chọn Hệ nhôm (Series) cho bộ cửa');
  }

  // 2. Kiểm tra Cánh (Sashes)
  let hasSash = false;
  let hasDoubleSash = false;
  let hasMullion = false;
  let hasCellReversal = false;

  const checkNodes = (node?: SceneCellNode) => {
    if (!node) return;
    if (
      node.reversalOverride === 'wall' ||
      node.reversalOverride === 'sash' ||
      Boolean(node.hasFrameReversalOverride)
    ) {
      hasCellReversal = true;
    }
    if (node.sashType && node.sashType !== 'fixed') {
      hasSash = true;
      if (node.sashType === 'swing_double') {
        hasDoubleSash = true;
      }
    }
    if (node.children && node.children.length > 0) {
      if (node.splitType !== 'coupling' && node.splitType !== 'sash_pair') {
        hasMullion = true;
      }
      for (const c of node.children) {
        checkNodes(c);
      }
    }
  };
  checkNodes(rootCell);

  if (hasSash) {
    if (!sashConfig?.leftProfileId) {
      issues.push('Thiếu profile bao cánh: cạnh trái');
    }
    if (!sashConfig?.topProfileId) {
      issues.push('Thiếu profile bao cánh: cạnh trên');
    }
    if (!sashConfig?.rightProfileId) {
      issues.push('Thiếu profile bao cánh: cạnh phải');
    }
    if (!sashConfig?.bottomProfileId) {
      issues.push('Thiếu profile bao cánh: cạnh dưới');
    }
    if (hasDoubleSash && !sashConfig?.mullionProfileId) {
      issues.push('Thiếu profile đố động giữa 2 cánh');
    }
    if (!sashConfig?.beadProfileId && !frameConfig?.beadProfileId) {
      issues.push('Thiếu profile nẹp kính cánh');
    }
  }

  // 3. Kiểm tra Khung bao (Frame)
  const leftEdge = frameConfig?.leftEdge;
  const topEdge = frameConfig?.topEdge;
  const rightEdge = frameConfig?.rightEdge;
  const bottomEdge = frameConfig?.bottomEdge;
  const isOpenBottom = frameConfig?.isOpenBottom ?? false;

  if (!leftEdge?.profileId) {
    issues.push('Thanh "Đứng trái" thiếu profile');
  }
  if (!topEdge?.profileId) {
    issues.push('Thanh "Ngang trên" thiếu profile');
  }
  if (!rightEdge?.profileId) {
    issues.push('Thanh "Đứng phải" thiếu profile');
  }
  if (!isOpenBottom && !bottomEdge?.profileId) {
    issues.push('Thanh "Ngang dưới" thiếu profile');
  }

  // 4. Kiểm tra Đố chia (Mullions)
  if (hasMullion && !frameConfig?.mullionProfileId) {
    issues.push('Chưa cấu hình profile mặc định cho Đố chia khung/vách');
  }

  // 5. Kiểm tra Nẹp kính khung bao nếu có ô kính cố định
  let hasFixedGlass = false;
  const checkFixed = (node?: SceneCellNode) => {
    if (!node) return;
    if (node.sashType === 'fixed' && node.paneType === 'glass') {
      hasFixedGlass = true;
    }
    node.children?.forEach(checkFixed);
  };
  checkFixed(rootCell);

  if (hasFixedGlass && !frameConfig?.beadProfileId) {
    issues.push('Thiếu profile nẹp kính cho vách cố định (Khung bao)');
  }

  // 5b. Kiểm tra thanh Đảo khung (REVERSAL) nếu bật Đảo nhưng hãng nhôm chưa cấu hình profile REVERSAL
  const hasAnyReversalEnabled =
    resolveGlobalCadReversalMode(frameConfig) !== 'none' || hasCellReversal;
  const hasUnconfiguredReversalBar = Boolean(
    calcData?.bars?.some(
      (bar) => (bar.category || '').toLowerCase() === 'reversal' && !bar.profileId
    )
  );
  if (hasAnyReversalEnabled && hasUnconfiguredReversalBar) {
    issues.push(
      'Hãng nhôm chưa cấu hình thanh Đảo khung (REVERSAL) — đang tạm tính bản rộng 28mm, tỷ trọng 0 kg/m'
    );
  }

  // 6. Kiểm tra Cảnh báo Phụ kiện & Ke liên kết
  if (calcData?.hardwareWarnings && calcData.hardwareWarnings.length > 0) {
    issues.push(
      `Còn ${calcData.hardwareWarnings.length} cảnh báo thiếu phụ kiện / con ke góc so với kết cấu cửa (xem mục Phụ kiện & Ke)`
    );
  } else if (calcData && calcData.hasUnconfiguredJoints) {
    issues.push(
      'Có vị trí liên kết góc (con ke) chưa được cấu hình phụ kiện tương ứng'
    );
  }

  return issues;
};
