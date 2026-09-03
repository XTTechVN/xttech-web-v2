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
    scene.fog = new THREE.FogExp2(0x020617, 0.015);

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.set(4, 0, 36);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // Bố cục Asymmetric Split-Screen: Dịch chuyển trọng tâm 3D sang bên phải màn hình (Right 60%)
    const updateCameraOffset = (w: number, h: number) => {
      // Dịch tâm nhìn để 3D nằm gọn ở nửa phải, nhường toàn bộ nửa trái cho Text HUD
      const isDesktop = w >= 768;
      const offsetX = isDesktop ? -w * 0.14 : 0;
      camera.setViewOffset(w, h, offsetX, 0, w, h);
    };
    updateCameraOffset(width, height);

    // 2. Hệ Thống Ánh Sáng Chiếu Rọi Điện Ảnh
    const ambientLight = new THREE.AmbientLight(0x091428, 2.5);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0x38bdf8, 3.2);
    mainKeyLight.position.set(20, 30, 25);
    scene.add(mainKeyLight);

    const goldFillLight = new THREE.DirectionalLight(0xf59e0b, 2.0);
    goldFillLight.position.set(-20, -10, 15);
    scene.add(goldFillLight);

    const cameraTrackingLight = new THREE.PointLight(0x06b6d4, 4.5, 60);
    cameraTrackingLight.position.set(4, 2, 28);
    scene.add(cameraTrackingLight);

    // Root Group chứa toàn bộ không gian 3D
    const worldGroup = new THREE.Group();
    worldGroup.position.set(2.5, 0, 0);
    scene.add(worldGroup);

    // =========================================================================
    // 1. PHÂN CẢNH 1: CỤM BÁNH RĂNG CƠ KHÍ ĐA TẦNG (0.0 -> 0.25)
    // Xóa bỏ hoàn toàn cái phao tròn cũ, dựng 3 bánh răng kim loại ăn khớp
    // =========================================================================
    const gearTrainGroup = new THREE.Group();
    worldGroup.add(gearTrainGroup);

    // Hàm tạo hình học bánh răng cơ khí chuẩn xác
    const createMechanicalGear = (
      teethCount: number,
      rOuter: number,
      rInner: number,
      depth: number,
      colorHex: number
    ) => {
      const shape = new THREE.Shape();
      const step = (Math.PI * 2) / teethCount;

      for (let i = 0; i < teethCount; i++) {
        const a0 = i * step;
        const a1 = a0 + step * 0.28;
        const a2 = a0 + step * 0.42;
        const a3 = a0 + step * 0.72;
        const a4 = a0 + step * 0.86;

        if (i === 0) shape.moveTo(Math.cos(a0) * rInner, Math.sin(a0) * rInner);
        else shape.lineTo(Math.cos(a0) * rInner, Math.sin(a0) * rInner);
        shape.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
        shape.lineTo(Math.cos(a2) * rOuter, Math.sin(a2) * rOuter);
        shape.lineTo(Math.cos(a3) * rInner, Math.sin(a3) * rInner);
        shape.lineTo(Math.cos(a4) * rInner, Math.sin(a4) * rInner);
      }
      shape.closePath();

      // Vành khoét trong
      const hole = new THREE.Path();
      hole.absarc(0, 0, rInner * 0.55, 0, Math.PI * 2, true);
      shape.holes.push(hole);

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.25,
        bevelThickness: 0.25,
      });
      geo.center();

      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        metalness: 0.92,
        roughness: 0.2,
        emissive: colorHex,
        emissiveIntensity: 0.25,
      });

      const mesh = new THREE.Mesh(geo, mat);

      // Nan hoa cơ khí chữ X bên trong vành
      const spokeGroup = new THREE.Group();
      const spokeGeo = new THREE.BoxGeometry(rInner * 1.05, 0.45, depth * 0.9);
      const spokeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.3 });
      const sp1 = new THREE.Mesh(spokeGeo, spokeMat);
      const sp2 = new THREE.Mesh(spokeGeo, spokeMat);
      sp2.rotation.z = Math.PI / 2;
      spokeGroup.add(sp1, sp2);

      // Trục tâm cơ khí
      const hubGeo = new THREE.CylinderGeometry(rInner * 0.26, rInner * 0.26, depth * 1.3, 24);
      hubGeo.rotateX(Math.PI / 2);
      const hubMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      spokeGroup.add(hub);

      mesh.add(spokeGroup);
      return mesh;
    };

    // Bánh răng 1: Trung tâm - Mạ Titanium Cyan (12 răng)
    const gearMain = createMechanicalGear(12, 6.2, 5.0, 1.4, 0x0284c7);
    gearMain.position.set(0, 0, 0);
    gearTrainGroup.add(gearMain);

    // Bánh răng 2: Vệ tinh trên phải - Mạ Vàng Kim Royal Gold (9 răng)
    const gearGold = createMechanicalGear(9, 4.6, 3.6, 1.2, 0xf59e0b);
    gearGold.position.set(7.8, 5.2, -0.2);
    gearTrainGroup.add(gearGold);

    // Bánh răng 3: Vệ tinh dưới trái - Mạ Xanh Ngọc Emerald (8 răng)
    const gearEmerald = createMechanicalGear(8, 4.2, 3.3, 1.2, 0x10b981);
    gearEmerald.position.set(-6.8, -4.8, -0.2);
    gearTrainGroup.add(gearEmerald);

    // =========================================================================
    // 2. PHÂN CẢNH 2: TRUNG TÂM DỮ LIỆU HIỆN ĐẠI & CỬA HẦM BỌC THÉP (0.25 -> 0.55)
    // Tủ Rack kính khói hiện đại + Cánh cửa hầm thép thủy lực mở đôi (XÓA BỎ PHAO CAM)
    // =========================================================================
    const datacenterGroup = new THREE.Group();
    datacenterGroup.position.set(0, 0, -48);
    worldGroup.add(datacenterGroup);

    // Dãy tủ Rack máy chủ kính hun khói cao cấp
    const rackCount = 9;
    const rackW = 2.4;
    const rackH = 13.0;
    const rackD = 4.2;

    const serverFrameGeo = new THREE.BoxGeometry(rackW, rackH, rackD);
    const serverFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.3,
    });

    const serverGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.6,
      opacity: 0.7,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
    });

    for (let i = 0; i < rackCount; i++) {
      const zPos = -i * 8.5;

      // Rack Trái
      const rackL = new THREE.Mesh(serverFrameGeo, serverFrameMat);
      rackL.position.set(-15, 0, zPos);
      datacenterGroup.add(rackL);

      const glassL = new THREE.Mesh(new THREE.PlaneGeometry(rackH * 0.9, rackW * 0.8), serverGlassMat);
      glassL.position.set(-13.7, 0, zPos);
      glassL.rotation.y = Math.PI / 2;
      datacenterGroup.add(glassL);

      // Rack Phải
      const rackR = new THREE.Mesh(serverFrameGeo, serverFrameMat);
      rackR.position.set(15, 0, zPos);
      datacenterGroup.add(rackR);

      const glassR = new THREE.Mesh(new THREE.PlaneGeometry(rackH * 0.9, rackW * 0.8), serverGlassMat);
      glassR.position.set(13.7, 0, zPos);
      glassR.rotation.y = -Math.PI / 2;
      datacenterGroup.add(glassR);

      // Dải đèn LED Matrix sống tủ
      const ledStripsCount = 4;
      for (let s = 0; s < ledStripsCount; s++) {
        const ledGeo = new THREE.BoxGeometry(0.1, 0.25, 0.8);
        const ledColor = s % 2 === 0 ? 0x38bdf8 : 0x10b981;
        const ledMat = new THREE.MeshBasicMaterial({ color: ledColor });
        const ledL = new THREE.Mesh(ledGeo, ledMat);
        ledL.position.set(-13.6, -3 + s * 2.2, zPos + (s - 1.5) * 0.8);
        datacenterGroup.add(ledL);

        const ledR = new THREE.Mesh(ledGeo, ledMat);
        ledR.position.set(13.6, -3 + s * 2.2, zPos + (s - 1.5) * 0.8);
        datacenterGroup.add(ledR);
      }
    }

    // Dây cáp quang sàn phát sáng chạy dọc hành lang
    const fiberPoints = [
      new THREE.Vector3(-6, -6.4, 10),
      new THREE.Vector3(-6, -6.4, -rackCount * 8.5),
      new THREE.Vector3(6, -6.4, 10),
      new THREE.Vector3(6, -6.4, -rackCount * 8.5),
    ];
    const fiberGeo = new THREE.BufferGeometry().setFromPoints(fiberPoints);
    const fiberMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 2 });
    const fiberLines = new THREE.LineSegments(fiberGeo, fiberMat);
    datacenterGroup.add(fiberLines);

    // =========================================================================
    // CÁNH CỬA HẦM BẢO MẬT THỦY LỰC NGUYÊN KHỐI (HYDRAULIC BLAST HATCH)
    // Xóa sạch phao cam - Dựng 2 cánh cửa thép bọc giáp mở trượt đôi
    // =========================================================================
    const vaultDoorGroup = new THREE.Group();
    vaultDoorGroup.position.set(0, 0, -rackCount * 8.5);
    datacenterGroup.add(vaultDoorGroup);

    // Khung cửa thép hình bát giác kiên cố
    const frameHatchGeo = new THREE.BoxGeometry(22, 16, 2);
    const frameHatchMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.3,
    });
    const frameHatch = new THREE.Mesh(frameHatchGeo, frameHatchMat);
    vaultDoorGroup.add(frameHatch);

    // Hai cánh cửa thép bọc giáp (Left Leaf & Right Leaf)
    const doorLeafGeo = new THREE.BoxGeometry(9.2, 14.5, 1.4);
    const doorLeafMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.95,
      roughness: 0.15,
    });

    const doorLeft = new THREE.Mesh(doorLeafGeo, doorLeafMat);
    doorLeft.position.set(-4.6, 0, 0.4);
    vaultDoorGroup.add(doorLeft);

    const doorRight = new THREE.Mesh(doorLeafGeo, doorLeafMat);
    doorRight.position.set(4.6, 0, 0.4);
    vaultDoorGroup.add(doorRight);

    // Vô-lăng tay quay cơ học 3 chấu ở giữa cửa
    const wheelSpindleGroup = new THREE.Group();
    wheelSpindleGroup.position.set(0, 0, 1.3);
    vaultDoorGroup.add(wheelSpindleGroup);

    const wheelRimGeo = new THREE.TorusGeometry(2.4, 0.25, 16, 36);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.3,
    });
    const wheelRim = new THREE.Mesh(wheelRimGeo, wheelMat);
    wheelSpindleGroup.add(wheelRim);

    for (let sp = 0; sp < 3; sp++) {
      const spAng = (sp * Math.PI * 2) / 3;
      const spGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.4, 12);
      const spMesh = new THREE.Mesh(spGeo, wheelMat);
      spMesh.rotation.z = spAng;
      wheelSpindleGroup.add(spMesh);
    }

    // 4 Piston thủy lực 4 góc
    const pistonGeo = new THREE.CylinderGeometry(0.35, 0.35, 4.5, 16);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
    const pistons: THREE.Mesh[] = [];

    const pistonPositions = [
      { x: -9.5, y: 5.5, ang: 0.4 },
      { x: 9.5, y: 5.5, ang: -0.4 },
      { x: -9.5, y: -5.5, ang: -0.4 },
      { x: 9.5, y: -5.5, ang: 0.4 },
    ];
    pistonPositions.forEach((pos) => {
      const pMesh = new THREE.Mesh(pistonGeo, pistonMat);
      pMesh.position.set(pos.x, pos.y, 0.8);
      pMesh.rotation.z = pos.ang;
      pistons.push(pMesh);
      vaultDoorGroup.add(pMesh);
    });

    // Lõi Dữ Liệu Phát Sáng Tỏa Ánh Kim Vàng rực rỡ bên trong hầm
    const vaultInnerCoreGeo = new THREE.IcosahedronGeometry(4.0, 2);
    const vaultInnerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 2.0,
      wireframe: true,
    });
    const vaultInnerCore = new THREE.Mesh(vaultInnerCoreGeo, vaultInnerCoreMat);
    vaultInnerCore.position.set(0, 0, -12);
    vaultDoorGroup.add(vaultInnerCore);

    // =========================================================================
    // 3. PHÂN CẢNH 3: QUẢ ĐỊA CẦU 3D CHÂN THỰC & ĐỊNH VỊ GPS VIỆT NAM (0.55 -> 0.80)
    // Thay thế toàn bộ quả cầu lưới thô bằng Quả Địa Cầu Lục Địa Phát Quang tinh tế
    // =========================================================================
    const globeSceneGroup = new THREE.Group();
    globeSceneGroup.position.set(0, 0, -150);
    worldGroup.add(globeSceneGroup);

    // Tạo chất liệu bản đồ Trái Đất lục địa bằng Canvas procedural tinh xảo
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 1024;
    earthCanvas.height = 512;
    const eCtx = earthCanvas.getContext('2d')!;

    // Đại dương cyber xanh thẫm
    eCtx.fillStyle = '#030d1a';
    eCtx.fillRect(0, 0, 1024, 512);

    // Lưới kinh vĩ tuyến thanh mảnh
    eCtx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    eCtx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 64) {
      eCtx.beginPath();
      eCtx.moveTo(x, 0);
      eCtx.lineTo(x, 512);
      eCtx.stroke();
    }
    for (let y = 0; y < 512; y += 48) {
      eCtx.beginPath();
      eCtx.moveTo(0, y);
      eCtx.lineTo(1024, y);
      eCtx.stroke();
    }

    // Vẽ các mảng lục địa phát sáng cách điệu (Châu Á, Việt Nam, Châu Âu, Châu Mỹ)
    eCtx.fillStyle = 'rgba(14, 165, 233, 0.65)';
    eCtx.shadowColor = '#38bdf8';
    eCtx.shadowBlur = 12;

    // Lục địa Châu Á & Đông Nam Á
    eCtx.beginPath();
    eCtx.ellipse(680, 210, 150, 90, 0, 0, Math.PI * 2);
    eCtx.fill();

    // Việt Nam phát sáng rực rỡ đặc biệt
    eCtx.fillStyle = '#10b981';
    eCtx.shadowColor = '#10b981';
    eCtx.shadowBlur = 18;
    eCtx.beginPath();
    eCtx.ellipse(710, 245, 18, 45, -0.4, 0, Math.PI * 2);
    eCtx.fill();

    // Châu Âu
    eCtx.fillStyle = 'rgba(14, 165, 233, 0.55)';
    eCtx.beginPath();
    eCtx.ellipse(490, 160, 60, 50, 0, 0, Math.PI * 2);
    eCtx.fill();

    // Châu Mỹ
    eCtx.beginPath();
    eCtx.ellipse(260, 240, 75, 140, 0.2, 0, Math.PI * 2);
    eCtx.fill();

    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Quả Cầu Trái Đất Lục Địa Chân Thực
    const earthGeo = new THREE.SphereGeometry(8.5, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.4,
      metalness: 0.3,
      emissive: 0x082f49,
      emissiveIntensity: 0.6,
    });
    const earthSphere = new THREE.Mesh(earthGeo, earthMat);
    globeSceneGroup.add(earthSphere);

    // Bầu khí quyển phát quang xanh ngọc dịu mắt (Atmosphere Glow Ring)
    const atmosGeo = new THREE.SphereGeometry(8.9, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmosSphere = new THREE.Mesh(atmosGeo, atmosMat);
    globeSceneGroup.add(atmosSphere);

    // Các trạm định vị GPS công trình tại Việt Nam kèm vòng sóng lan tỏa
    const gpsGroup = new THREE.Group();
    globeSceneGroup.add(gpsGroup);

    const makeGpsStation = (lat: number, lon: number, colorHex: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const r = 8.6;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      // Điểm mốc phát sáng
      const dotGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, y, z);
      gpsGroup.add(dot);

      // Vòng sóng radar lan tỏa
      const rippleGeo = new THREE.RingGeometry(0.2, 0.45, 24);
      const rippleMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ripple = new THREE.Mesh(rippleGeo, rippleMat);
      ripple.position.set(x, y, z);
      ripple.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(x, y, z).normalize());
      gpsGroup.add(ripple);

      return { dot, ripple, rippleMat, pos: new THREE.Vector3(x, y, z) };
    };

    const stHanoi = makeGpsStation(21.0285, 105.8542, 0x10b981); // Hà Nội
    const stDanang = makeGpsStation(16.0544, 108.2022, 0x38bdf8); // Đà Nẵng
    const stHcm = makeGpsStation(10.8231, 106.6297, 0xf59e0b); // TP.HCM

    // Đường cong dữ liệu bay (Curved Data Arc) kết nối Hà Nội -> Đà Nẵng -> TP.HCM
    const createCurvedArc = (v1: THREE.Vector3, v2: THREE.Vector3, colorHex: number) => {
      const mid = v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(10.5);
      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const pts = curve.getPoints(36);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const arcMat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 2 });
      return new THREE.Line(arcGeo, arcMat);
    };

    const arc1 = createCurvedArc(stHanoi.pos, stDanang.pos, 0x10b981);
    const arc2 = createCurvedArc(stDanang.pos, stHcm.pos, 0x38bdf8);
    gpsGroup.add(arc1, arc2);

    // =========================================================================
    // 4. PHÂN CẢNH 4: LÕI LÒ PHẢN ỨNG NĂNG LƯỢNG SỐ (0.80 -> 1.00)
    // =========================================================================
    const reactorSceneGroup = new THREE.Group();
    reactorSceneGroup.position.set(0, 0, -220);
    worldGroup.add(reactorSceneGroup);

    const plasmaCount = 2000;
    const plasmaPositions = new Float32Array(plasmaCount * 3);
    const plasmaColors = new Float32Array(plasmaCount * 3);

    for (let i = 0; i < plasmaCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 6.5;

      plasmaPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      plasmaPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      plasmaPositions[i * 3 + 2] = r * Math.cos(phi);

      plasmaColors[i * 3] = 0.15 + Math.random() * 0.4;
      plasmaColors[i * 3 + 1] = 0.75 + Math.random() * 0.25;
      plasmaColors[i * 3 + 2] = 0.95;
    }

    const plasmaGeo = new THREE.BufferGeometry();
    plasmaGeo.setAttribute('position', new THREE.BufferAttribute(plasmaPositions, 3));
    plasmaGeo.setAttribute('color', new THREE.BufferAttribute(plasmaColors, 3));

    const plasmaMat = new THREE.PointsMaterial({
      size: 0.24,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const plasmaMesh = new THREE.Points(plasmaGeo, plasmaMat);
    reactorSceneGroup.add(plasmaMesh);

    // Vòng gia tốc hạt plasma
    const torusRingGeo = new THREE.TorusGeometry(8.5, 0.2, 16, 64);
    const torusRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    const torusRing = new THREE.Mesh(torusRingGeo, torusRingMat);
    reactorSceneGroup.add(torusRing);

    // =========================================================================
    // VÒNG LẶP RENDER VÀ ĐIỀU KHIỂN THEO TIẾN TRÌNH CUỘN (SCROLL LOGIC)
    // =========================================================================
    let animId: number;
    let clock = 0;

    const renderLoop = () => {
      clock += 0.015;
      const p = progressRef.current;

      // 1. Quỹ đạo Camera lướt sâu vào không gian 3D
      // Từ z = 36 (Bánh Răng) -> z = -48 (Hầm Datacenter) -> z = -150 (Quả Địa Cầu) -> z = -220 (Lò Phản Ứng)
      const targetZ = 36 - p * 256;
      camera.position.z += (targetZ - camera.position.z) * 0.1;
      camera.position.y = Math.sin(clock * 0.6) * 0.4;
      cameraTrackingLight.position.z = camera.position.z - 6;

      // 2. Chuyển động Cụm 3 Bánh Răng ăn khớp Scene 1
      const gearSpeed = 0.008 + p * 0.06;
      gearMain.rotation.z += gearSpeed;
      gearGold.rotation.z -= gearSpeed * (12 / 9); // Quay ngược chiều theo tỉ số truyền
      gearEmerald.rotation.z -= gearSpeed * (12 / 8);

      // 3. Cơ chế mở Cửa Hầm Thép Thủy Lực Scene 2
      if (p > 0.30 && p < 0.62) {
        wheelSpindleGroup.rotation.z = clock * 1.5;
        const openVal = Math.min(1, Math.max(0, (p - 0.40) * 7.0));
        doorLeft.position.x = -4.6 - openVal * 4.8;
        doorRight.position.x = 4.6 + openVal * 4.8;
        pistons.forEach((pMesh, idx) => {
          pMesh.scale.y = 1 - openVal * 0.35;
        });
      }
      vaultInnerCore.rotation.x += 0.015;
      vaultInnerCore.rotation.y += 0.02;

      // 4. Chuyển động Quả Địa Cầu 3D & Sóng Radar GPS Scene 3
      earthSphere.rotation.y = clock * 0.25 + (p - 0.55) * 2;
      atmosSphere.rotation.y = earthSphere.rotation.y;
      gpsGroup.rotation.y = earthSphere.rotation.y;

      const ripScale = 1 + (clock * 2) % 2.5;
      const ripAlpha = Math.max(0, (1 - ((clock * 2) % 2.5) / 2.5));
      stHanoi.ripple.scale.set(ripScale, ripScale, 1);
      stHanoi.rippleMat.opacity = ripAlpha;
      stDanang.ripple.scale.set(ripScale, ripScale, 1);
      stDanang.rippleMat.opacity = ripAlpha;
      stHcm.ripple.scale.set(ripScale, ripScale, 1);
      stHcm.rippleMat.opacity = ripAlpha;

      // 5. Chuyển động Lò Phản Ứng Plasma Scene 4
      plasmaMesh.rotation.y -= 0.008;
      torusRing.rotation.x = clock * 1.2;
      torusRing.rotation.y = clock * 0.8;
      const pulse = 1 + Math.sin(clock * 4) * 0.08;
      plasmaMesh.scale.set(pulse, pulse, pulse);

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
      gearTrainGroup.clear();
      datacenterGroup.clear();
      globeSceneGroup.clear();
      reactorSceneGroup.clear();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none h-full w-full" />;
}
