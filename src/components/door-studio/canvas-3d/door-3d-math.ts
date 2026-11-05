export type Vec3 = [number, number, number];
export type Mat4 = Float32Array;

export function hexToRgb01(hex: string, fallback: Vec3 = [0.28, 0.33, 0.41]): Vec3 {
  const clean = (hex || '').replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) return [r, g, b];
  }
  if (clean.length >= 6) {
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) return [r, g, b];
  }
  return fallback;
}

export function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function vec3Normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len < 1e-8) return [0, 0, 1];
  return [v[0] / len, v[1] / len, v[2] / len];
}

export function mat4Identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

export function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    const b0 = b[col * 4 + 0];
    const b1 = b[col * 4 + 1];
    const b2 = b[col * 4 + 2];
    const b3 = b[col * 4 + 3];
    out[col * 4 + 0] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[col * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[col * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[col * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return out;
}

export function mat4Perspective(fovRad: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1.0 / Math.tan(fovRad / 2);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

export function mat4LookAt(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
  const z = vec3Normalize(vec3Sub(eye, center));
  const x = vec3Normalize(vec3Cross(up, z));
  const y = vec3Cross(z, x);

  const out = new Float32Array(16);
  out[0] = x[0];
  out[1] = y[0];
  out[2] = z[0];
  out[3] = 0;
  out[4] = x[1];
  out[5] = y[1];
  out[6] = z[1];
  out[7] = 0;
  out[8] = x[2];
  out[9] = y[2];
  out[10] = z[2];
  out[11] = 0;
  out[12] = -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]);
  out[13] = -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]);
  out[14] = -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]);
  out[15] = 1;
  return out;
}

/**
 * Material type IDs for shader:
 * 0 = Metallic Aluminum (powder coat / anodized)
 * 1 = Wood-grain Aluminum
 * 2 = Matte Rubber / Gasket / Floor Grid
 * 3 = Architectural Wall / Floor
 * 4 = Hardware (Handle / Hinge chrome / bronze)
 * 5 = Procedural Studio Floor (Tile 60x60 / 80x80 / 60x120 / Wood Planks)
 */
export type MaterialId = 0 | 1 | 2 | 3 | 4 | 5;

export class Door3DMeshCollector {
  // Opaque triangles: 10 floats per vertex (x, y, z, nx, ny, nz, r, g, b, matId)
  public opaqueVerts: number[] = [];
  // Edge lines: 7 floats per vertex (x, y, z, r, g, b, alpha)
  public lineVerts: number[] = [];
  // Transparent triangles (glass/screen): 10 floats per vertex (x, y, z, nx, ny, nz, r, g, b, alpha)
  public transVerts: number[] = [];

  public getSnapshotIndices() {
    return {
      opaqueStart: this.opaqueVerts.length,
      lineStart: this.lineVerts.length,
      transStart: this.transVerts.length,
    };
  }

  /**
   * Dịch chuyển và xoay một cụm hình học (ví dụ: Cánh cửa) quanh trục bản lề (pivotX, pivotY, pivotZ)
   * hoặc trượt dọc theo ray (slideDx, slideDy, slideDz).
   */
  public transformSince(
    snap: { opaqueStart: number; lineStart: number; transStart: number },
    opts: {
      pivotX?: number;
      pivotY?: number;
      pivotZ?: number;
      rotX?: number;
      rotY?: number;
      rotZ?: number;
      dx?: number;
      dy?: number;
      dz?: number;
    }
  ) {
    const px = opts.pivotX ?? 0;
    const py = opts.pivotY ?? 0;
    const pz = opts.pivotZ ?? 0;
    const rx = opts.rotX ?? 0;
    const ry = opts.rotY ?? 0;
    const rz = opts.rotZ ?? 0;
    const dx = opts.dx ?? 0;
    const dy = opts.dy ?? 0;
    const dz = opts.dz ?? 0;

    const cx = Math.cos(rx), sx = Math.sin(rx);
    const cy = Math.cos(ry), sy = Math.sin(ry);
    const cz = Math.cos(rz), sz = Math.sin(rz);

    const rotVec = (vx: number, vy: number, vz: number): Vec3 => {
      // Rotate X
      const y1 = vy * cx - vz * sx;
      const z1 = vy * sx + vz * cx;
      const x1 = vx;
      // Rotate Y
      const x2 = x1 * cy + z1 * sy;
      const z2 = -x1 * sy + z1 * cy;
      const y2 = y1;
      // Rotate Z
      const x3 = x2 * cz - y2 * sz;
      const y3 = x2 * sz + y2 * cz;
      const z3 = z2;
      return [x3, y3, z3];
    };

    for (let i = snap.opaqueStart; i < this.opaqueVerts.length; i += 10) {
      const [rxP, ryP, rzP] = rotVec(
        this.opaqueVerts[i] - px,
        this.opaqueVerts[i + 1] - py,
        this.opaqueVerts[i + 2] - pz
      );
      this.opaqueVerts[i] = rxP + px + dx;
      this.opaqueVerts[i + 1] = ryP + py + dy;
      this.opaqueVerts[i + 2] = rzP + pz + dz;

      const [rnx, rny, rnz] = rotVec(
        this.opaqueVerts[i + 3],
        this.opaqueVerts[i + 4],
        this.opaqueVerts[i + 5]
      );
      this.opaqueVerts[i + 3] = rnx;
      this.opaqueVerts[i + 4] = rny;
      this.opaqueVerts[i + 5] = rnz;
    }

    for (let i = snap.lineStart; i < this.lineVerts.length; i += 7) {
      const [rxP, ryP, rzP] = rotVec(
        this.lineVerts[i] - px,
        this.lineVerts[i + 1] - py,
        this.lineVerts[i + 2] - pz
      );
      this.lineVerts[i] = rxP + px + dx;
      this.lineVerts[i + 1] = ryP + py + dy;
      this.lineVerts[i + 2] = rzP + pz + dz;
    }

    for (let i = snap.transStart; i < this.transVerts.length; i += 10) {
      const [rxP, ryP, rzP] = rotVec(
        this.transVerts[i] - px,
        this.transVerts[i + 1] - py,
        this.transVerts[i + 2] - pz
      );
      this.transVerts[i] = rxP + px + dx;
      this.transVerts[i + 1] = ryP + py + dy;
      this.transVerts[i + 2] = rzP + pz + dz;

      const [rnx, rny, rnz] = rotVec(
        this.transVerts[i + 3],
        this.transVerts[i + 4],
        this.transVerts[i + 5]
      );
      this.transVerts[i + 3] = rnx;
      this.transVerts[i + 4] = rny;
      this.transVerts[i + 5] = rnz;
    }
  }

  public addLine(p1: Vec3, p2: Vec3, color: Vec3, alpha = 0.7) {
    this.lineVerts.push(
      p1[0], p1[1], p1[2], color[0], color[1], color[2], alpha,
      p2[0], p2[1], p2[2], color[0], color[1], color[2], alpha
    );
  }

  public addQuad(
    p0: Vec3,
    p1: Vec3,
    p2: Vec3,
    p3: Vec3,
    color: Vec3,
    matId: MaterialId = 0,
    customNormal?: Vec3
  ) {
    const n = customNormal ?? vec3Normalize(vec3Cross(vec3Sub(p1, p0), vec3Sub(p2, p0)));
    // Triangle 1: p0, p1, p2
    this.opaqueVerts.push(
      p0[0], p0[1], p0[2], n[0], n[1], n[2], color[0], color[1], color[2], matId,
      p1[0], p1[1], p1[2], n[0], n[1], n[2], color[0], color[1], color[2], matId,
      p2[0], p2[1], p2[2], n[0], n[1], n[2], color[0], color[1], color[2], matId
    );
    // Triangle 2: p0, p2, p3
    this.opaqueVerts.push(
      p0[0], p0[1], p0[2], n[0], n[1], n[2], color[0], color[1], color[2], matId,
      p2[0], p2[1], p2[2], n[0], n[1], n[2], color[0], color[1], color[2], matId,
      p3[0], p3[1], p3[2], n[0], n[1], n[2], color[0], color[1], color[2], matId
    );
  }

  public addTransQuad(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, color: Vec3, alpha: number) {
    const n = vec3Normalize(vec3Cross(vec3Sub(p1, p0), vec3Sub(p2, p0)));
    this.transVerts.push(
      p0[0], p0[1], p0[2], n[0], n[1], n[2], color[0], color[1], color[2], alpha,
      p1[0], p1[1], p1[2], n[0], n[1], n[2], color[0], color[1], color[2], alpha,
      p2[0], p2[1], p2[2], n[0], n[1], n[2], color[0], color[1], color[2], alpha,
      p0[0], p0[1], p0[2], n[0], n[1], n[2], color[0], color[1], color[2], alpha,
      p2[0], p2[1], p2[2], n[0], n[1], n[2], color[0], color[1], color[2], alpha,
      p3[0], p3[1], p3[2], n[0], n[1], n[2], color[0], color[1], color[2], alpha
    );
  }

  /**
   * Đẩy khối một đa giác lồi 2D (points theo chiều ngược kim đồng hồ trên mặt phẳng X-Y)
   * từ mặt sau zBack đến mặt trước zFront, kèm vẽ đường viền CAD sắc nét.
   */
  public addExtrudedConvexPolygon(
    pts2d: [number, number][],
    zBack: number,
    zFront: number,
    color: Vec3,
    matId: MaterialId = 0,
    edgeColor?: Vec3,
    edgeAlpha = 0.55
  ) {
    const n = pts2d.length;
    if (n < 3) return;

    // Front face (z = zFront, normal = +Z)
    for (let i = 1; i < n - 1; i++) {
      const p0: Vec3 = [pts2d[0][0], pts2d[0][1], zFront];
      const p1: Vec3 = [pts2d[i][0], pts2d[i][1], zFront];
      const p2: Vec3 = [pts2d[i + 1][0], pts2d[i + 1][1], zFront];
      this.opaqueVerts.push(
        p0[0], p0[1], p0[2], 0, 0, 1, color[0], color[1], color[2], matId,
        p1[0], p1[1], p1[2], 0, 0, 1, color[0], color[1], color[2], matId,
        p2[0], p2[1], p2[2], 0, 0, 1, color[0], color[1], color[2], matId
      );
    }

    // Back face (z = zBack, normal = -Z)
    for (let i = 1; i < n - 1; i++) {
      const p0: Vec3 = [pts2d[0][0], pts2d[0][1], zBack];
      const p1: Vec3 = [pts2d[i + 1][0], pts2d[i + 1][1], zBack];
      const p2: Vec3 = [pts2d[i][0], pts2d[i][1], zBack];
      this.opaqueVerts.push(
        p0[0], p0[1], p0[2], 0, 0, -1, color[0], color[1], color[2], matId,
        p1[0], p1[1], p1[2], 0, 0, -1, color[0], color[1], color[2], matId,
        p2[0], p2[1], p2[2], 0, 0, -1, color[0], color[1], color[2], matId
      );
    }

    // Side faces + edge lines
    for (let i = 0; i < n; i++) {
      const a = pts2d[i];
      const b = pts2d[(i + 1) % n];
      const p0: Vec3 = [a[0], a[1], zFront];
      const p1: Vec3 = [b[0], b[1], zFront];
      const p2: Vec3 = [b[0], b[1], zBack];
      const p3: Vec3 = [a[0], a[1], zBack];
      this.addQuad(p0, p3, p2, p1, color, matId);

      if (edgeColor) {
        this.addLine(p0, p1, edgeColor, edgeAlpha);
        this.addLine(p3, p2, edgeColor, edgeAlpha * 0.75);
        this.addLine(p0, p3, edgeColor, edgeAlpha * 0.65);
      }
    }
  }

  public addBox(
    cx: number,
    cy: number,
    cz: number,
    w: number,
    h: number,
    d: number,
    color: Vec3,
    matId: MaterialId = 0,
    edgeColor?: Vec3,
    edgeAlpha = 0.5
  ) {
    const hw = w / 2;
    const hh = h / 2;
    const hd = d / 2;
    this.addExtrudedConvexPolygon(
      [
        [cx - hw, cy - hh],
        [cx + hw, cy - hh],
        [cx + hw, cy + hh],
        [cx - hw, cy + hh],
      ],
      cz - hd,
      cz + hd,
      color,
      matId,
      edgeColor,
      edgeAlpha
    );
  }
}
