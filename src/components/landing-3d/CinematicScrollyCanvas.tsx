'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
interface CinematicCanvasProps {
  scrollProgress: number; // 0.0 -> 1.0
}

export function CinematicScrollyCanvas({ scrollProgress }: CinematicCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(scrollProgress);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020714, 0.011);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    camera.position.set(4, 0, 36);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);

    // Bố cục Asymmetric Split-Screen: Đẩy không gian 3D lệch sang bên phải (Right 60%)
    const updateCameraOffset = (w: number, h: number) => {
      const isDesktop = w >= 768;
      const offsetX = isDesktop ? -w * 0.14 : 0;
      camera.setViewOffset(w, h, offsetX, 0, w, h);
    };
    updateCameraOffset(width, height);

    // 2. Hệ Thống Ánh Sáng Chiếu Rọi Không Gian Mạng
    const ambientLight = new THREE.AmbientLight(0x111e38, 3.8);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0x38bdf8, 4.2);
    mainKeyLight.position.set(25, 35, 30);
    scene.add(mainKeyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 3.8);
    rimLight.position.set(-25, 20, -10);
    scene.add(rimLight);

    const trackingPointLight = new THREE.PointLight(0x06b6d4, 5.0, 75);
    trackingPointLight.position.set(4, 3, 28);
    scene.add(trackingPointLight);

    // =========================================================================
    // NỀN KHÔNG GIAN MẠNG 3D VÔ TẬN (INFINITE CYBERSPACE HORIZON & DATA DUST)
    // =========================================================================
    const cyberspaceEnvGroup = new THREE.Group();
    scene.add(cyberspaceEnvGroup);

    const horizonGridPoints: THREE.Vector3[] = [];
    const gridSpanX = 50;
    const gridStartZ = 60;
    const gridEndZ = -260;
    const stepX = 5;
    const stepZ = 8;

    for (let x = -gridSpanX; x <= gridSpanX; x += stepX) {
      horizonGridPoints.push(new THREE.Vector3(x, -9.5, gridStartZ), new THREE.Vector3(x, -9.5, gridEndZ));
      horizonGridPoints.push(new THREE.Vector3(x, 9.5, gridStartZ), new THREE.Vector3(x, 9.5, gridEndZ));
    }
    for (let z = gridStartZ; z >= gridEndZ; z -= stepZ) {
      horizonGridPoints.push(new THREE.Vector3(-gridSpanX, -9.5, z), new THREE.Vector3(gridSpanX, -9.5, z));
      horizonGridPoints.push(new THREE.Vector3(-gridSpanX, 9.5, z), new THREE.Vector3(gridSpanX, 9.5, z));
    }

    const horizonGridGeo = new THREE.BufferGeometry().setFromPoints(horizonGridPoints);
    const horizonGridMat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.18 });
    const horizonGrid = new THREE.LineSegments(horizonGridGeo, horizonGridMat);
    cyberspaceEnvGroup.add(horizonGrid);

    const highwayPoints = [
      new THREE.Vector3(-22, -9.2, gridStartZ), new THREE.Vector3(-22, -9.2, gridEndZ),
      new THREE.Vector3(26, -9.2, gridStartZ), new THREE.Vector3(26, -9.2, gridEndZ),
      new THREE.Vector3(-22, 9.2, gridStartZ), new THREE.Vector3(-22, 9.2, gridEndZ),
      new THREE.Vector3(26, 9.2, gridStartZ), new THREE.Vector3(26, 9.2, gridEndZ),
    ];
    const highwayGeo = new THREE.BufferGeometry().setFromPoints(highwayPoints);
    const highwayMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 2, transparent: true, opacity: 0.45 });
    const highwayLines = new THREE.LineSegments(highwayGeo, highwayMat);
    cyberspaceEnvGroup.add(highwayLines);

    const dustCount = 1200;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let d = 0; d < dustCount; d++) {
      dustPositions[d * 3] = (Math.random() - 0.5) * 60;
      dustPositions[d * 3 + 1] = (Math.random() - 0.5) * 24;
      dustPositions[d * 3 + 2] = 50 - Math.random() * 300;

      const isCyan = Math.random() > 0.35;
      dustColors[d * 3] = isCyan ? 0.05 : 0.95;
      dustColors[d * 3 + 1] = isCyan ? 0.75 : 0.65;
      dustColors[d * 3 + 2] = isCyan ? 0.95 : 0.1;
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    cyberspaceEnvGroup.add(dustParticles);

    // Root Group chứa toàn bộ không gian mô hình 3D
    const worldGroup = new THREE.Group();
    worldGroup.position.set(2.5, 0, 0);
    scene.add(worldGroup);

    // =========================================================================
    // 1. PHÂN CẢNH 1: SIÊU MÔ HÌNH PROFILE MẶT CẮT NHÔM SLIM COVER 3 RAY & 3 CÁNH KÍNH
    // Chuẩn xác 100% theo ảnh mẫu: Góc cắt mòi 45 độ hệ nhôm Slim Cover, màu Vàng Đồng Champagne Metallic,
    // Mặt cắt kỹ thuật 3 ray trượt đa khoang, 3 cánh kính cường lực siêu trong lồng tầng giật cấp,
    // Hiệu ứng cửa lùa tự động trượt đóng khít và Bảng Pop-up thông tin kỹ thuật.
    // =========================================================================
    const logoGearSceneGroup = new THREE.Group();
    worldGroup.add(logoGearSceneGroup);

    // Cụm mô hình Góc Cắt Kỹ Thuật Hệ Nhôm Slim Cover
    const slimCoverGroup = new THREE.Group();
    slimCoverGroup.position.set(2.2, 0.4, 0);
    slimCoverGroup.scale.setScalar(0.72); // Tỉ lệ vàng vừa vặn, không bao giờ bị phóng đại đập vào mắt
    slimCoverGroup.rotation.set(0.32, -0.46, 0.10); // Góc nghiêng Isometric chuẩn theo ảnh mẫu
    logoGearSceneGroup.add(slimCoverGroup);

    // 1. Vật liệu Nhôm Slim Vàng Đồng Champagne Metallic (Chuẩn y hệt ảnh mẫu)
    const champagneGoldMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#c5a880'), // Vàng đồng Champagne thanh lịch
      emissive: new THREE.Color('#251808'),
      metalness: 0.94,
      roughness: 0.22,
      clearcoat: 0.90,
      clearcoatRoughness: 0.10,
      reflectivity: 0.96,
    });

    // Bát treo trần màu trắng xám sáng sạch (Ceiling Mount Box)
    const ceilingMountMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f1f5f9'),
      roughness: 0.35,
      metalness: 0.12,
    });

    // Khoang ray trượt kỹ thuật màu đen than (Track Channels)
    const trackChannelMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1e293b'),
      roughness: 0.5,
      metalness: 0.8,
    });

    // 2. Vật liệu Kính Cường Lực Siêu Trong Suốt (Architectural Ultra-Clear Glass)
    const glassPaneMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e0f2fe'),
      transmission: 0.93,
      opacity: 1.0,
      transparent: true,
      roughness: 0.03,
      ior: 1.52,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });

    const glassEdgeMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });

    // 3. Dựng Khung Nhôm L-Frame (Thanh Ngang Trên & Thanh Đứng Cạnh Trái)
    // A. Thanh Ngang Trên (Top Header Profile) - Dài 8.8, Cao 2.2, Sâu 5.2
    const topHeaderGroup = new THREE.Group();
    topHeaderGroup.position.set(0, 0, 0);
    slimCoverGroup.add(topHeaderGroup);

    // Bát treo trần trên cùng
    const ceilingBoxGeo = new THREE.BoxGeometry(9.0, 0.8, 5.4);
    const ceilingBox = new THREE.Mesh(ceilingBoxGeo, ceilingMountMat);
    ceilingBox.position.set(4.5, 1.5, 0);
    topHeaderGroup.add(ceilingBox);

    // Thân ray nhôm 3 ray treo (Chính giữa)
    const topRailGeo = new THREE.BoxGeometry(8.8, 2.2, 5.0);
    const topRail = new THREE.Mesh(topRailGeo, champagneGoldMat);
    topRail.position.set(4.4, 0, 0);
    topHeaderGroup.add(topRail);

    // Mặt cắt kỹ thuật 3 ray trượt ở đầu phải (Exposed Cutout)
    const trackSlotGeo = new THREE.BoxGeometry(0.3, 1.4, 0.9);
    for (let t = 0; t < 3; t++) {
      const zOffset = -1.5 + t * 1.5;
      const slot = new THREE.Mesh(trackSlotGeo, trackChannelMat);
      slot.position.set(8.85, -0.4, zOffset);
      topHeaderGroup.add(slot);
    }

    // 3 bậc giật cấp Slim Cover mặt trước thanh trên
    for (let step = 0; step < 3; step++) {
      const stepGeo = new THREE.BoxGeometry(8.8, 0.45, 0.25);
      const stepMesh = new THREE.Mesh(stepGeo, champagneGoldMat);
      stepMesh.position.set(4.4, 0.7 - step * 0.55, 2.65 - step * 0.15);
      topHeaderGroup.add(stepMesh);
    }

    // B. Thanh Đứng Cạnh Trái (Side Jamb Profile) - Cao 10.5, Rộng 2.2, Sâu 5.0
    const sideJambGroup = new THREE.Group();
    sideJambGroup.position.set(0, 0, 0);
    slimCoverGroup.add(sideJambGroup);

    const sideJambGeo = new THREE.BoxGeometry(2.2, 10.5, 5.0);
    const sideJamb = new THREE.Mesh(sideJambGeo, champagneGoldMat);
    sideJamb.position.set(0, -5.25, 0);
    sideJambGroup.add(sideJamb);

    // 3 bậc giật cấp Slim Cover ở mặt trước thanh đứng
    for (let step = 0; step < 3; step++) {
      const stepGeo = new THREE.BoxGeometry(0.45, 10.5, 0.25);
      const stepMesh = new THREE.Mesh(stepGeo, champagneGoldMat);
      stepMesh.position.set(0.7 - step * 0.55, -5.25, 2.65 - step * 0.15);
      sideJambGroup.add(stepMesh);
    }

    // Đường vát mòi 45 độ sắc nét tại góc giao chữ L (Miter Joint Seam)
    const miterLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.1, 1.1, 2.8),
      new THREE.Vector3(1.1, -1.1, 2.8),
    ]);
    const miterLine = new THREE.Line(
      miterLineGeo,
      new THREE.LineBasicMaterial({ color: 0x926c42, linewidth: 2 })
    );
    slimCoverGroup.add(miterLine);

    // 4. Dựng Hệ 3 Tấm Kính Cường Lực Trong Suốt (3-Layer Glass Panes)
    // Tấm kính chữ nhật có góc vát mòi đáy 45 độ chuẩn theo ảnh mẫu
    const glassShape = new THREE.Shape();
    glassShape.moveTo(0, 0);
    glassShape.lineTo(6.8, 0);
    glassShape.lineTo(6.8, -6.8);
    glassShape.lineTo(4.8, -8.8); // Vát kỹ thuật góc dưới
    glassShape.lineTo(0, -8.8);
    glassShape.closePath();

    const glassExtrudeGeo = new THREE.ExtrudeGeometry(glassShape, { depth: 0.14, bevelEnabled: false });
    const glassEdgesGeo = new THREE.EdgesGeometry(glassExtrudeGeo);

    const glassPanes: THREE.Group[] = [];

    // 3 Tấm kính gắn vào 3 ray lùa (Z = 1.5, 0.0, -1.5)
    for (let g = 0; g < 3; g++) {
      const gGroup = new THREE.Group();
      const zPos = 1.5 - g * 1.5;
      const xStagger = 1.1 + g * 0.45; // So le nhẹ

      gGroup.position.set(xStagger, -1.1, zPos);

      const glassMesh = new THREE.Mesh(glassExtrudeGeo, glassPaneMat);
      gGroup.add(glassMesh);

      // Viền sáng xanh ngọc bích khúc xạ phản quang
      const edgeLine = new THREE.LineSegments(glassEdgesGeo, glassEdgeMat);
      gGroup.add(edgeLine);

      slimCoverGroup.add(gGroup);
      glassPanes.push(gGroup);
    }

    // 5. Hệ thống Chiếu Sáng Studio Chuyên Nghiệp (Làm nổi bật màu Vàng Đồng Champagne & Độ trong của kính)
    const studioKeyLight = new THREE.DirectionalLight(0xfffbeb, 4.0);
    studioKeyLight.position.set(18, 22, 24);
    logoGearSceneGroup.add(studioKeyLight);

    const studioRimLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    studioRimLight.position.set(-16, 14, -18);
    logoGearSceneGroup.add(studioRimLight);

    const studioFillLight = new THREE.PointLight(0xffffff, 2.2, 45);
    studioFillLight.position.set(6, -8, 16);
    logoGearSceneGroup.add(studioFillLight);

    // =========================================================================
    // 2. PHÂN CẢNH 2: TRUNG TÂM DỮ LIỆU & BỘ CỬA NHÔM KÍNH THỦY LỰC CAO CẤP (0.25 -> 0.55)
    // =========================================================================
    const datacenterGroup = new THREE.Group();
    datacenterGroup.position.set(0, 0, -48);
    worldGroup.add(datacenterGroup);

    const rackCount = 9;
    const rackW = 2.6;
    const rackH = 13.5;
    const rackD = 4.4;

    const rackFrameGeo = new THREE.BoxGeometry(rackW, rackH, rackD);
    const rackFrameMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.92,
      roughness: 0.22,
    });

    const rackEdgesGeo = new THREE.EdgesGeometry(rackFrameGeo);
    const rackEdgesMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 2 });

    const serverGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.5,
      opacity: 0.75,
      transparent: true,
      roughness: 0.1,
    });

    for (let i = 0; i < rackCount; i++) {
      const zPos = -i * 8.5;

      const rackL = new THREE.Mesh(rackFrameGeo, rackFrameMat);
      rackL.position.set(-15, 0, zPos);
      datacenterGroup.add(rackL);

      const edgeL = new THREE.LineSegments(rackEdgesGeo, rackEdgesMat);
      edgeL.position.copy(rackL.position);
      datacenterGroup.add(edgeL);

      const glassL = new THREE.Mesh(new THREE.PlaneGeometry(rackH * 0.9, rackW * 0.8), serverGlassMat);
      glassL.position.set(-13.6, 0, zPos);
      glassL.rotation.y = Math.PI / 2;
      datacenterGroup.add(glassL);

      const rackR = new THREE.Mesh(rackFrameGeo, rackFrameMat);
      rackR.position.set(15, 0, zPos);
      datacenterGroup.add(rackR);

      const edgeR = new THREE.LineSegments(rackEdgesGeo, rackEdgesMat);
      edgeR.position.copy(rackR.position);
      datacenterGroup.add(edgeR);

      const glassR = new THREE.Mesh(new THREE.PlaneGeometry(rackH * 0.9, rackW * 0.8), serverGlassMat);
      glassR.position.set(13.6, 0, zPos);
      glassR.rotation.y = -Math.PI / 2;
      datacenterGroup.add(glassR);

      for (let s = 0; s < 5; s++) {
        const ledGeo = new THREE.BoxGeometry(0.12, 0.35, 0.9);
        const ledColor = s % 2 === 0 ? 0x38bdf8 : 0x10b981;
        const ledMat = new THREE.MeshBasicMaterial({ color: ledColor });

        const ledL = new THREE.Mesh(ledGeo, ledMat);
        ledL.position.set(-13.5, -3.5 + s * 1.8, zPos + (s - 2) * 0.7);
        datacenterGroup.add(ledL);

        const ledR = new THREE.Mesh(ledGeo, ledMat);
        ledR.position.set(13.5, -3.5 + s * 1.8, zPos + (s - 2) * 0.7);
        datacenterGroup.add(ledR);
      }
    }

    const fiberPoints = [
      new THREE.Vector3(-6, -6.6, 12),
      new THREE.Vector3(-6, -6.6, -rackCount * 8.5),
      new THREE.Vector3(6, -6.6, 12),
      new THREE.Vector3(6, -6.6, -rackCount * 8.5),
    ];
    const fiberGeo = new THREE.BufferGeometry().setFromPoints(fiberPoints);
    const fiberLines = new THREE.LineSegments(
      fiberGeo,
      new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 3 })
    );
    datacenterGroup.add(fiberLines);

    // =========================================================================
    // MÔ HÌNH 3D CỬA NHÔM KÍNH THỦY LỰC HOÀNG GIA CAO CẤP (CHUẨN CƠ KHÍ XTTECH)
    // =========================================================================
    const aluminumDoorFacade = new THREE.Group();
    aluminumDoorFacade.position.set(0, 0, -rackCount * 8.5);
    datacenterGroup.add(aluminumDoorFacade);

    const aluProfileMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.92,
      roughness: 0.28,
    });

    const goldBrassMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.96,
      roughness: 0.12,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
    });

    const doorGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.88,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.82,
    });

    const createOuterFrame = () => {
      const frameGroup = new THREE.Group();
      const colGeo = new THREE.BoxGeometry(1.2, 16.5, 1.4);
      const colL = new THREE.Mesh(colGeo, aluProfileMat);
      colL.position.set(-11.4, 0, 0);
      const colR = new THREE.Mesh(colGeo, aluProfileMat);
      colR.position.set(11.4, 0, 0);

      const beamGeo = new THREE.BoxGeometry(24, 1.2, 1.4);
      const beamTop = new THREE.Mesh(beamGeo, aluProfileMat);
      beamTop.position.set(0, 8.25, 0);
      const beamBot = new THREE.Mesh(beamGeo, aluProfileMat);
      beamBot.position.set(0, -8.25, 0);

      const transomBeam = new THREE.Mesh(new THREE.BoxGeometry(24, 0.8, 1.2), aluProfileMat);
      transomBeam.position.set(0, 5.0, 0);

      const sideliteColL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 13.5, 1.2), aluProfileMat);
      sideliteColL.position.set(-7.2, -1.8, 0);
      const sideliteColR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 13.5, 1.2), aluProfileMat);
      sideliteColR.position.set(7.2, -1.8, 0);

      frameGroup.add(colL, colR, beamTop, beamBot, transomBeam, sideliteColL, sideliteColR);
      return frameGroup;
    };
    aluminumDoorFacade.add(createOuterFrame());

    const createDecorativeGlassPane = (w: number, h: number, x: number, y: number) => {
      const paneGroup = new THREE.Group();
      paneGroup.position.set(x, y, 0);

      const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), doorGlassMat);
      paneGroup.add(glass);

      const vMullion = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, h, 8), goldBrassMat);
      paneGroup.add(vMullion);

      const diaGeo = new THREE.RingGeometry(0.35, 0.42, 4);
      diaGeo.rotateZ(Math.PI / 4);
      const dia1 = new THREE.Mesh(diaGeo, goldBrassMat);
      dia1.position.set(0, h * 0.25, 0.05);
      const dia2 = new THREE.Mesh(diaGeo, goldBrassMat);
      dia2.position.set(0, -h * 0.25, 0.05);
      paneGroup.add(dia1, dia2);

      return paneGroup;
    };

    aluminumDoorFacade.add(createDecorativeGlassPane(6.4, 2.5, -7.2, 6.6));
    aluminumDoorFacade.add(createDecorativeGlassPane(7.0, 2.5, 0, 6.6));
    aluminumDoorFacade.add(createDecorativeGlassPane(6.4, 2.5, 7.2, 6.6));

    aluminumDoorFacade.add(createDecorativeGlassPane(3.2, 11.8, -9.2, -1.8));
    aluminumDoorFacade.add(createDecorativeGlassPane(3.2, 11.8, 9.2, -1.8));

    const createDoorLeaf = (isLeft: boolean) => {
      const leafGroup = new THREE.Group();
      const leafW = 6.6;
      const leafH = 12.0;

      const stilesGeo = new THREE.BoxGeometry(0.85, leafH, 0.9);
      const stileOuter = new THREE.Mesh(stilesGeo, aluProfileMat);
      stileOuter.position.set(isLeft ? -leafW / 2 + 0.42 : leafW / 2 - 0.42, 0, 0);

      const stileInner = new THREE.Mesh(stilesGeo, aluProfileMat);
      stileInner.position.set(isLeft ? leafW / 2 - 0.42 : -leafW / 2 + 0.42, 0, 0);

      const railsGeo = new THREE.BoxGeometry(leafW, 1.1, 0.9);
      const railTop = new THREE.Mesh(railsGeo, aluProfileMat);
      railTop.position.set(0, leafH / 2 - 0.55, 0);

      const railBot = new THREE.Mesh(new THREE.BoxGeometry(leafW, 1.6, 0.9), aluProfileMat);
      railBot.position.set(0, -leafH / 2 + 0.8, 0);

      leafGroup.add(stileOuter, stileInner, railTop, railBot);

      const innerGlass = new THREE.Mesh(new THREE.PlaneGeometry(leafW - 1.5, leafH - 2.5), doorGlassMat);
      leafGroup.add(innerGlass);

      const gridGroup = new THREE.Group();
      gridGroup.position.set(0, 0, 0.04);
      leafGroup.add(gridGroup);

      const vBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, leafH - 2.8, 8), goldBrassMat);
      gridGroup.add(vBar);

      for (let r = -2; r <= 2; r++) {
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(leafW - 1.8, 0.08, 0.05), goldBrassMat);
        hBar.position.set(0, r * 1.8, 0);
        gridGroup.add(hBar);

        const diamondGeo = new THREE.RingGeometry(0.42, 0.52, 4);
        diamondGeo.rotateZ(Math.PI / 4);
        const diamondMesh = new THREE.Mesh(diamondGeo, goldBrassMat);
        diamondMesh.position.set(0, r * 1.8, 0.02);
        gridGroup.add(diamondMesh);
      }

      const cornerGeo = new THREE.BoxGeometry(1.2, 1.2, 0.1);
      const cornerOffsets = [
        { x: -leafW / 2 + 1.2, y: leafH / 2 - 1.4 },
        { x: leafW / 2 - 1.2, y: leafH / 2 - 1.4 },
        { x: -leafW / 2 + 1.2, y: -leafH / 2 + 1.8 },
        { x: leafW / 2 - 1.2, y: -leafH / 2 + 1.8 },
      ];
      cornerOffsets.forEach((co) => {
        const cPlate = new THREE.Mesh(cornerGeo, goldBrassMat);
        cPlate.position.set(co.x, co.y, 0.46);
        leafGroup.add(cPlate);
      });

      const handleGroup = new THREE.Group();
      const handleEdgeX = isLeft ? leafW / 2 - 0.75 : -leafW / 2 + 0.75;
      handleGroup.position.set(handleEdgeX, -0.4, 0.85);

      const handleRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 4.8, 16),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
      );
      handleGroup.add(handleRod);

      [-2.3, 0, 2.3].forEach((pos) => {
        const goldCap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.45, 16), goldBrassMat);
        goldCap.position.y = pos;
        handleGroup.add(goldCap);
      });

      const mount1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 12), goldBrassMat);
      mount1.rotation.x = Math.PI / 2;
      mount1.position.set(0, 1.5, -0.3);
      const mount2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 12), goldBrassMat);
      mount2.rotation.x = Math.PI / 2;
      mount2.position.set(0, -1.5, -0.3);
      handleGroup.add(mount1, mount2);

      leafGroup.add(handleGroup);

      return leafGroup;
    };

    const leftHingePivot = new THREE.Group();
    leftHingePivot.position.set(-6.8, -1.8, 0);
    const leftDoorLeaf = createDoorLeaf(true);
    leftDoorLeaf.position.set(3.3, 0, 0);
    leftHingePivot.add(leftDoorLeaf);

    const rightHingePivot = new THREE.Group();
    rightHingePivot.position.set(6.8, -1.8, 0);
    const rightDoorLeaf = createDoorLeaf(false);
    rightDoorLeaf.position.set(-3.3, 0, 0);
    rightHingePivot.add(rightDoorLeaf);

    aluminumDoorFacade.add(leftHingePivot, rightHingePivot);

    // =========================================================================
    // 3. PHÂN CẢNH 3: QUẢ ĐỊA CẦU NASA 2K & CÚ LAO MÁY QUAY ZOOM VÀO VIỆT NAM (0.55 -> 0.80)
    // =========================================================================
    const globeSceneGroup = new THREE.Group();
    globeSceneGroup.position.set(2.0, 0, -145);
    worldGroup.add(globeSceneGroup);

    const globeRadius = 5.6;

    const textureLoader = new THREE.TextureLoader();
    const earthDayMap = textureLoader.load('/textures/earth_day.jpg');
    const earthNightMap = textureLoader.load('/textures/earth_night.png');
    const earthSpecularMap = textureLoader.load('/textures/earth_specular.jpg');

    const earthGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthDayMap,
      roughnessMap: earthSpecularMap,
      roughness: 0.42,
      metalness: 0.15,
      emissiveMap: earthNightMap,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
    });
    const earthSphere = new THREE.Mesh(earthGeo, earthMat);
    globeSceneGroup.add(earthSphere);

    const atmosGeo = new THREE.SphereGeometry(globeRadius + 0.18, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
    });
    const atmosSphere = new THREE.Mesh(atmosGeo, atmosMat);
    globeSceneGroup.add(atmosSphere);

    const equatorGeo = new THREE.RingGeometry(globeRadius + 0.05, globeRadius + 0.09, 64);
    const equatorMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const equatorRing = new THREE.Mesh(equatorGeo, equatorMat);
    equatorRing.rotation.x = Math.PI / 2;
    globeSceneGroup.add(equatorRing);

    const gpsGroup = new THREE.Group();
    globeSceneGroup.add(gpsGroup);

    const makeGpsBeacon = (lat: number, lon: number, colorHex: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const r = globeRadius + 0.05;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      const dotGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, y, z);
      gpsGroup.add(dot);

      const needleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8);
      needleGeo.translate(0, 0.9, 0);
      const needleMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
      const needle = new THREE.Mesh(needleGeo, needleMat);
      needle.position.set(x, y, z);
      needle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, y, z).normalize());
      gpsGroup.add(needle);

      const rippleGeo = new THREE.RingGeometry(0.04, 0.16, 24);
      const rippleMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ripple = new THREE.Mesh(rippleGeo, rippleMat);
      ripple.position.set(x, y, z);
      ripple.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(x, y, z).normalize());
      gpsGroup.add(ripple);

      return { dot, ripple, rippleMat, pos: new THREE.Vector3(x, y, z) };
    };

    const stHanoi = makeGpsBeacon(21.0285, 105.8542, 0x10b981);
    const stDanang = makeGpsBeacon(16.0544, 108.2022, 0x38bdf8);
    const stHcm = makeGpsBeacon(10.8231, 106.6297, 0xf59e0b);

    const makeFlightArc = (v1: THREE.Vector3, v2: THREE.Vector3, colorHex: number) => {
      const mid = v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(globeRadius + 0.65);
      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const pts = curve.getPoints(36);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const arcMat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 1.5, transparent: true, opacity: 0.85 });
      return new THREE.Line(arcGeo, arcMat);
    };

    const arc1 = makeFlightArc(stHanoi.pos, stDanang.pos, 0x10b981);
    const arc2 = makeFlightArc(stDanang.pos, stHcm.pos, 0x38bdf8);
    gpsGroup.add(arc1, arc2);

    // =========================================================================
    // 4. PHÂN CẢNH 4: MA TRẬN NHÂN SỰ VỚI THẺ HOLOGRAM LỚN & ĐƯỜNG BUS MẠCH PCB 90°
    // =========================================================================
    const matrixSceneGroup = new THREE.Group();
    matrixSceneGroup.position.set(0, 0, -195);
    worldGroup.add(matrixSceneGroup);

    const gridPoints: THREE.Vector3[] = [];
    for (let c = -24; c <= 24; c += 4) {
      gridPoints.push(new THREE.Vector3(c, -8, 25), new THREE.Vector3(c, -8, -25));
      gridPoints.push(new THREE.Vector3(-24, -8, c), new THREE.Vector3(24, -8, c));
      gridPoints.push(new THREE.Vector3(c, 8, 25), new THREE.Vector3(c, 8, -25));
      gridPoints.push(new THREE.Vector3(-24, 8, c), new THREE.Vector3(24, 8, c));
    }
    const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPoints);
    const gridMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.15 });
    const pcbGrid = new THREE.LineSegments(gridGeo, gridMat);
    matrixSceneGroup.add(pcbGrid);

    const telemetryLinesGroup = new THREE.Group();
    matrixSceneGroup.add(telemetryLinesGroup);

    const makeTelemetryColumn = (x: number, y: number, z: number, text: string) => {
      const colCanvas = document.createElement('canvas');
      colCanvas.width = 128;
      colCanvas.height = 512;
      const cctx = colCanvas.getContext('2d')!;
      cctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      cctx.font = '14px monospace';
      const lines = text.split('\n');
      lines.forEach((l, idx) => {
        cctx.fillText(l, 8, 24 + idx * 22);
      });
      const tex = new THREE.CanvasTexture(colCanvas);
      const colGeo = new THREE.PlaneGeometry(2.0, 8.0);
      const colMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
      const colMesh = new THREE.Mesh(colGeo, colMat);
      colMesh.position.set(x, y, z);
      return colMesh;
    };

    const teleText = "GPS: 108.2022 E\nLAT: 16.0544 N\nPING: 1.2ms\nSTATUS: SYNC\nDEV: OK\nAUTH: PASS\nLOG: 88204\nGEO: LOCKED";
    telemetryLinesGroup.add(makeTelemetryColumn(-14, 2, -18, teleText));
    telemetryLinesGroup.add(makeTelemetryColumn(15, -1, -18, teleText));
    telemetryLinesGroup.add(makeTelemetryColumn(-12, -3, -12, teleText));

    const createStaffCardTexture = (
      name: string,
      role: string,
      status: string,
      statusColor: string,
      idCode: string,
      project: string,
      avatarChar: string,
      avatarBg: string
    ) => {
      const cardCanvas = document.createElement('canvas');
      cardCanvas.width = 1024;
      cardCanvas.height = 512;
      const ctx = cardCanvas.getContext('2d')!;

      ctx.fillStyle = 'rgba(10, 18, 36, 0.95)';
      ctx.roundRect(16, 16, 992, 480, 32);
      ctx.fill();

      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 6;
      ctx.shadowColor = statusColor;
      ctx.shadowBlur = 24;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = statusColor;
      ctx.fillRect(16, 16, 48, 12);
      ctx.fillRect(16, 16, 12, 48);
      ctx.fillRect(960, 16, 48, 12);
      ctx.fillRect(996, 16, 12, 48);
      ctx.fillRect(16, 484, 48, 12);
      ctx.fillRect(16, 448, 12, 48);
      ctx.fillRect(960, 484, 48, 12);
      ctx.fillRect(996, 448, 12, 48);

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`ID: ${idCode}`, 60, 75);
      ctx.textAlign = 'right';
      ctx.fillText('[▲ 5G LIVE • 99%]', 960, 75);

      ctx.textAlign = 'left';
      ctx.fillStyle = avatarBg;
      ctx.beginPath();
      ctx.arc(150, 260, 88, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(avatarChar, 150, 260);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText(name, 280, 200);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '36px monospace';
      ctx.fillText(role, 280, 270);

      ctx.fillStyle = '#06b6d4';
      ctx.font = '28px monospace';
      ctx.fillText(`📍 ${project}`, 280, 330);

      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(300, 410, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = statusColor;
      ctx.font = 'bold 32px monospace';
      ctx.fillText(status, 335, 412);

      return new THREE.CanvasTexture(cardCanvas);
    };

    const staffList = [
      {
        name: 'Nguyễn Văn An',
        role: 'Quản đốc Công trình',
        status: 'ĐANG TRỰC CA (GPS LIVE)',
        id: 'XT-8801',
        project: 'Keangnam Landmark 72',
        color: '#10b981',
        char: 'AN',
        bg: '#047857',
        pos: new THREE.Vector3(0, 2.2, 4),
      },
      {
        name: 'Lê Thị Mai',
        role: 'Kỹ sư Thiết kế Nhôm Kính',
        status: 'ONLINE • XỬ LÝ BOM',
        id: 'XT-8814',
        project: 'Nhà máy Nhôm Kính Số 1',
        color: '#38bdf8',
        char: 'MAI',
        bg: '#0284c7',
        pos: new THREE.Vector3(9.5, 4.0, -2),
      },
      {
        name: 'Trần Quốc Toàn',
        role: 'Chỉ huy trưởng Hiện trường',
        status: 'ĐANG DI CHUYỂN (35 km/h)',
        id: 'XT-8829',
        project: 'Dự án Cầu Rồng Plaza',
        color: '#f59e0b',
        char: 'TOAN',
        bg: '#d97706',
        pos: new THREE.Vector3(-9.5, -2.5, -2),
      },
      {
        name: 'Phạm Minh Đức',
        role: 'Kỹ thuật viên Lắp dựng',
        status: 'ĐANG TRỰC CA (GPS LIVE)',
        id: 'XT-8837',
        project: 'Tòa nhà Bitexco SG',
        color: '#10b981',
        char: 'DUC',
        bg: '#047857',
        pos: new THREE.Vector3(9.0, -4.5, -8),
      },
      {
        name: 'Hoàng Thu Trang',
        role: 'Kế toán Quản trị & Báo giá',
        status: 'ĐỒNG BỘ DOANH THU',
        id: 'XT-8845',
        project: 'Trụ sở Tổng Công ty',
        color: '#a855f7',
        char: 'TRANG',
        bg: '#7e22ce',
        pos: new THREE.Vector3(-8.5, 4.2, -8),
      },
    ];

    const staffCardMeshes: THREE.Mesh[] = [];
    const cardGeo = new THREE.PlaneGeometry(6.6, 3.3);

    staffList.forEach((st) => {
      const tex = createStaffCardTexture(st.name, st.role, st.status, st.color, st.id, st.project, st.char, st.bg);
      const cardMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      cardMesh.position.copy(st.pos);
      matrixSceneGroup.add(cardMesh);
      staffCardMeshes.push(cardMesh);
    });

    const pcbCircuitGroup = new THREE.Group();
    matrixSceneGroup.add(pcbCircuitGroup);

    interface CircuitTrack {
      curve: THREE.CurvePath<THREE.Vector3>;
      pulseMeshes: THREE.Mesh[];
      color: number;
    }
    const circuitTracks: CircuitTrack[] = [];

    const pulseSphereGeo = new THREE.SphereGeometry(0.24, 12, 12);

    const createOrthogonalPcbTrack = (p1: THREE.Vector3, p2: THREE.Vector3, colorHex: number) => {
      const midX = (p1.x + p2.x) * 0.5;
      const corner1 = new THREE.Vector3(midX, p1.y, p1.z);
      const corner2 = new THREE.Vector3(midX, p2.y, p2.z);

      const path = new THREE.CurvePath<THREE.Vector3>();
      path.add(new THREE.LineCurve3(p1, corner1));
      path.add(new THREE.LineCurve3(corner1, corner2));
      path.add(new THREE.LineCurve3(corner2, p2));

      const pts = path.getPoints(48);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 3, transparent: true, opacity: 0.85 });
      const lineMesh = new THREE.Line(lineGeo, lineMat);
      pcbCircuitGroup.add(lineMesh);

      const jointGeo = new THREE.RingGeometry(0.14, 0.32, 16);
      const jointMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide });
      const joint1 = new THREE.Mesh(jointGeo, jointMat);
      joint1.position.copy(corner1);
      const joint2 = new THREE.Mesh(jointGeo, jointMat);
      joint2.position.copy(corner2);
      pcbCircuitGroup.add(joint1, joint2);

      const pulseMeshes: THREE.Mesh[] = [];
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let k = 0; k < 3; k++) {
        const pMesh = new THREE.Mesh(pulseSphereGeo, pulseMat);
        pcbCircuitGroup.add(pMesh);
        pulseMeshes.push(pMesh);
      }

      circuitTracks.push({ curve: path, pulseMeshes, color: colorHex });
    };

    createOrthogonalPcbTrack(staffList[0].pos, staffList[1].pos, 0x38bdf8);
    createOrthogonalPcbTrack(staffList[0].pos, staffList[2].pos, 0xf59e0b);
    createOrthogonalPcbTrack(staffList[1].pos, staffList[3].pos, 0x10b981);
    createOrthogonalPcbTrack(staffList[2].pos, staffList[4].pos, 0xa855f7);

    // =========================================================================
    // VÒNG LẶP RENDER & CƠ CHẾ XOAY MÔ HÌNH VÀ MỞ CỬA THỦY LỰC
    // =========================================================================
    let animId: number;
    let clock = 0;
    let lastDrawnScrapRef = -1;

    const renderLoop = () => {
      clock += 0.015;
      const p = progressRef.current;

      // 1. Quỹ đạo Camera lướt sâu - QUÃNG NGHỈ THƯỞNG THỨC Ở SCENE 1
      let targetZ = 34;
      if (p <= 0.22) {
        // Quãng nghỉ Scene 1: Camera giữ khoảng cách bao quát Z = 34 -> 31.5, KHÔNG ZOOM SÁT ĐẬP VÀO MẮT!
        targetZ = 34 - p * 11.5;
      } else {
        // Sau khi thưởng thức xong Scene 1, camera bắt đầu lướt sâu vào Scene 2
        const plungeFactor = (p - 0.22) / 0.78;
        targetZ = 31.4 - plungeFactor * 225;
      }

      // CÚ LAO MÁY QUAY ZOOM THẲNG VÀO VIỆT NAM (p: 0.65 -> 0.78)
      if (p >= 0.65 && p <= 0.78) {
        const diveFactor = (p - 0.65) / 0.13;
        targetZ = -118 - diveFactor * 21;
      }

      camera.position.z += (targetZ - camera.position.z) * 0.12;
      camera.position.y = Math.sin(clock * 0.5) * 0.3;
      trackingPointLight.position.z = camera.position.z - 6;

      // 2. Chuyển động Nền Không Gian Mạng
      horizonGrid.position.z = -((clock * 6) % stepZ);
      dustParticles.rotation.y = clock * 0.02;

      // 3. CÁCH LY PHÂN CẢNH TUYỆT ĐỐI
      logoGearSceneGroup.visible = p <= 0.28;
      datacenterGroup.visible = p >= 0.22 && p <= 0.53;
      globeSceneGroup.visible = p >= 0.50 && p <= 0.79;
      matrixSceneGroup.visible = p >= 0.77;

      // 4. Chuyển động HỆ NHÔM SLIM COVER 3 RAY & 3 CÁNH KÍNH Scene 1
      if (logoGearSceneGroup.visible) {
        // Hệ số trượt đóng cửa từ 0 -> 1 khi p từ 0 -> 0.08
        const slideFactor = Math.min(1, Math.max(0, p / 0.08));

        // 3 Cánh kính trượt êm ái dọc ray về vị trí đóng khít
        // Ban đầu (p=0): cửa hé mở (offset +2.2, +1.4, +0.6)
        // Khi p >= 0.08: cửa đóng khít hoàn hảo vào thanh đứng
        if (glassPanes.length === 3) {
          glassPanes[0].position.x = 1.1 + (1 - slideFactor) * 2.2;
          glassPanes[1].position.x = 1.55 + (1 - slideFactor) * 1.4;
          glassPanes[2].position.x = 2.0 + (1 - slideFactor) * 0.6;
        }

        // Góc nghiêng kỹ thuật Isometric lơ lửng êm ái
        slimCoverGroup.rotation.y = -0.46 + Math.sin(clock * 0.5) * 0.03;
        slimCoverGroup.rotation.x = 0.32 + Math.cos(clock * 0.4) * 0.02;
      }

      // 5. CƠ CHẾ XOAY MỞ CỬA NHÔM KÍNH THỦY LỰC Scene 2
      if (datacenterGroup.visible && p > 0.28 && p < 0.53) {
        const openVal = Math.min(1, Math.max(0, (p - 0.36) * 8.0));
        const swingAngle = openVal * (Math.PI / 2.3);
        leftHingePivot.rotation.y = -swingAngle;
        rightHingePivot.rotation.y = swingAngle;
      }

      // 6. Quả Địa Cầu Scene 3: XOAY VIỆT NAM RA CHÍNH DIỆN
      if (globeSceneGroup.visible) {
        const targetEarthRotY = 2.85 + (p - 0.65) * 0.6;
        earthSphere.rotation.y += (targetEarthRotY - earthSphere.rotation.y) * 0.1;
        atmosSphere.rotation.y = earthSphere.rotation.y;
        gpsGroup.rotation.y = earthSphere.rotation.y;
        equatorRing.rotation.z += 0.003;

        const ripScale = 1 + (clock * 2.4) % 2.0;
        const ripAlpha = Math.max(0, 1 - ((clock * 2.4) % 2.0) / 2.0);
        stHanoi.ripple.scale.set(ripScale, ripScale, 1);
        stHanoi.rippleMat.opacity = ripAlpha;
        stDanang.ripple.scale.set(ripScale, ripScale, 1);
        stDanang.rippleMat.opacity = ripAlpha;
        stHcm.ripple.scale.set(ripScale, ripScale, 1);
        stHcm.rippleMat.opacity = ripAlpha;
      }

      // 7. Ma Trận Nhân Sự Scene 4
      if (matrixSceneGroup.visible) {
        staffCardMeshes.forEach((card, idx) => {
          card.position.y += Math.sin(clock * 1.2 + idx) * 0.005;
          card.lookAt(camera.position);
        });

        circuitTracks.forEach((track, i) => {
          track.pulseMeshes.forEach((pMesh, k) => {
            const t = (clock * 0.7 + i * 0.2 + k * 0.33) % 1.0;
            const posOnCurve = track.curve.getPoint(t);
            if (posOnCurve) {
              pMesh.position.copy(posOnCurve);
            }
          });
        });

        telemetryLinesGroup.position.y = Math.sin(clock * 0.3) * 0.4;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      updateCameraOffset(w, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      try {
        earthDayMap?.dispose?.();
        earthNightMap?.dispose?.();
        earthSpecularMap?.dispose?.();
        cyberspaceEnvGroup?.clear?.();
        logoGearSceneGroup?.clear?.();
        datacenterGroup?.clear?.();
        globeSceneGroup?.clear?.();
        matrixSceneGroup?.clear?.();
      } catch {}
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none h-full w-full" />;
}
