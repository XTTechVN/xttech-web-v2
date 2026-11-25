import type { PositionVisualMode } from '@/types';
import { getFileUrl } from './string';

export interface PositionVisualInput {
  visualMode?: PositionVisualMode | null;
  customImagePath?: string | null;
  catalogImagePath?: string | null;
  designImage?: string | null;
  imagePath?: string | null;
  systemConfig?: Record<string, unknown> | null;
}

export interface ResolvedPositionVisual {
  mode: PositionVisualMode;
  imageUrl: string | null;
  systemConfig: Record<string, unknown> | null;
}

const hasRenderableCadConfig = (config?: Record<string, unknown> | null): boolean =>
  Boolean(config && typeof config === 'object' && 'rootCell' in config && config.rootCell);

/**
 * Chuẩn hóa nguồn hiển thị hình ảnh vị trí cửa theo thứ tự ưu tiên:
 * custom_image -> catalog_image -> cad (tôn trọng visualMode nếu dữ liệu tồn tại).
 */
export function resolvePositionVisual(input: PositionVisualInput): ResolvedPositionVisual {
  const customUrl = input.customImagePath ? getFileUrl(input.customImagePath) : null;
  const catalogRaw = input.catalogImagePath ?? input.designImage ?? input.imagePath ?? null;
  const catalogUrl = catalogRaw ? getFileUrl(catalogRaw) : null;
  const cadConfig = hasRenderableCadConfig(input.systemConfig) ? input.systemConfig! : null;

  const customResult: ResolvedPositionVisual | null = customUrl
    ? { mode: 'custom_image', imageUrl: customUrl, systemConfig: null }
    : null;
  const catalogResult: ResolvedPositionVisual | null = catalogUrl
    ? { mode: 'catalog_image', imageUrl: catalogUrl, systemConfig: null }
    : null;
  const cadResult: ResolvedPositionVisual | null = cadConfig
    ? { mode: 'cad', imageUrl: null, systemConfig: cadConfig }
    : null;

  if (input.visualMode === 'custom_image') {
    return customResult ?? catalogResult ?? cadResult ?? { mode: 'custom_image', imageUrl: null, systemConfig: null };
  }
  if (input.visualMode === 'catalog_image') {
    return catalogResult ?? customResult ?? cadResult ?? { mode: 'catalog_image', imageUrl: null, systemConfig: null };
  }
  if (input.visualMode === 'cad') {
    return cadResult ?? customResult ?? catalogResult ?? { mode: 'cad', imageUrl: null, systemConfig: null };
  }

  return customResult ?? catalogResult ?? cadResult ?? { mode: 'cad', imageUrl: null, systemConfig: null };
}
