import React from 'react';
import { FrameConfig, FrameShape } from '../../studio-types';

interface CadMiteredFrameProps {
  fx: number;
  fy: number;
  fwBox: number;
  fhBox: number;
  aluminumColor: string;
  frameD: number;
  frameShape: FrameShape;
  framesCount: number;
  frameConfig?: FrameConfig;
}

/**
 * Render Khung bao ngoài (Frame Box) với xử lý hở sàn (open-bottom) và ghép góc mòi 45°/90°
 */
export const CadMiteredFrame: React.FC<CadMiteredFrameProps> = ({
  fx,
  fy,
  fwBox,
  fhBox,
  aluminumColor,
  frameD,
  frameShape,
  framesCount,
  frameConfig,
}) => {
  if (frameShape === 'round_top_2' && framesCount === 1) {
    const cr = Math.min(40, Math.round(fwBox * 0.2));
    return (
      <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.8">
        <path
          d={`M ${fx} ${fy + fhBox} L ${fx} ${fy + cr} Q ${fx} ${fy} ${fx + cr} ${fy} L ${fx + fwBox - cr} ${fy} Q ${fx + fwBox} ${fy} ${fx + fwBox} ${fy + cr} L ${fx + fwBox} ${fy + fhBox} Z`}
        />
      </g>
    );
  }

  const isOpenBottom = frameConfig?.isOpenBottom ?? false;
  const cornerJoint = frameConfig?.cornerJoint ?? '45';

  // 1. Trường hợp Khung hở 3 cạnh (chạm sàn - Open Bottom): không có thanh đáy
  if (isOpenBottom) {
    if (cornerJoint === '90_horiz') {
      return (
        <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.8">
          <rect x={fx} y={fy} width={fwBox} height={frameD} />
          <rect x={fx} y={fy + frameD} width={frameD} height={fhBox - frameD} />
          <rect x={fx + fwBox - frameD} y={fy + frameD} width={frameD} height={fhBox - frameD} />
        </g>
      );
    }
    if (cornerJoint === '90_vert') {
      return (
        <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.8">
          <rect x={fx} y={fy} width={frameD} height={fhBox} />
          <rect x={fx + fwBox - frameD} y={fy} width={frameD} height={fhBox} />
          <rect x={fx + frameD} y={fy} width={fwBox - 2 * frameD} height={frameD} />
        </g>
      );
    }
    // Miter 45° 2 góc trên, 90° đáy bằng
    return (
      <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.8" strokeLinejoin="miter">
        <polygon points={`${fx},${fy} ${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + frameD},${fy + frameD}`} />
        <polygon points={`${fx},${fy} ${fx + frameD},${fy + frameD} ${fx + frameD},${fy + fhBox} ${fx},${fy + fhBox}`} />
        <polygon
          points={`${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + fwBox - frameD},${fy + fhBox} ${fx + fwBox},${fy + fhBox}`}
        />
      </g>
    );
  }

  // 2. Trường hợp 4 cạnh kín: 90° Ngang phủ
  if (cornerJoint === '90_horiz') {
    return (
      <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.8">
        <rect x={fx} y={fy} width={fwBox} height={frameD} />
        <rect x={fx} y={fy + fhBox - frameD} width={fwBox} height={frameD} />
        <rect x={fx} y={fy + frameD} width={frameD} height={fhBox - 2 * frameD} />
        <rect x={fx + fwBox - frameD} y={fy + frameD} width={frameD} height={fhBox - 2 * frameD} />
      </g>
    );
  }

  // 3. Trường hợp 4 cạnh kín: 90° Dọc phủ
  if (cornerJoint === '90_vert') {
    return (
      <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.8">
        <rect x={fx} y={fy} width={frameD} height={fhBox} />
        <rect x={fx + fwBox - frameD} y={fy} width={frameD} height={fhBox} />
        <rect x={fx + frameD} y={fy} width={fwBox - 2 * frameD} height={frameD} />
        <rect x={fx + frameD} y={fy + fhBox - frameD} width={fwBox - 2 * frameD} height={frameD} />
      </g>
    );
  }

  // 4. Trường hợp 4 cạnh kín: 45° Trên, 90° Dưới
  if (cornerJoint === '45_top_90_bot') {
    return (
      <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.8" strokeLinejoin="miter">
        <polygon points={`${fx},${fy} ${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + frameD},${fy + frameD}`} />
        <rect x={fx} y={fy + fhBox - frameD} width={fwBox} height={frameD} />
        <polygon points={`${fx},${fy} ${fx + frameD},${fy + frameD} ${fx + frameD},${fy + fhBox - frameD} ${fx},${fy + fhBox - frameD}`} />
        <polygon
          points={`${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + fwBox - frameD},${fy + fhBox - frameD} ${fx + fwBox},${fy + fhBox - frameD}`}
        />
      </g>
    );
  }

  // 5. Mặc định: Ghép mòi 45° cả 4 góc
  return (
    <g fill={aluminumColor} stroke="#27272a" strokeWidth="0.8" strokeLinejoin="miter">
      <polygon points={`${fx},${fy} ${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + frameD},${fy + frameD}`} />
      <polygon
        points={`${fx},${fy + fhBox} ${fx + fwBox},${fy + fhBox} ${fx + fwBox - frameD},${fy + fhBox - frameD} ${fx + frameD},${fy + fhBox - frameD}`}
      />
      <polygon points={`${fx},${fy} ${fx + frameD},${fy + frameD} ${fx + frameD},${fy + fhBox - frameD} ${fx},${fy + fhBox}`} />
      <polygon
        points={`${fx + fwBox},${fy} ${fx + fwBox - frameD},${fy + frameD} ${fx + fwBox - frameD},${fy + fhBox - frameD} ${fx + fwBox},${fy + fhBox}`}
      />
    </g>
  );
};
