import {
  Door3DMeshCollector,
  mat4LookAt,
  mat4Multiply,
  mat4Perspective,
  Vec3,
} from './door-3d-math';
import { FloorMaterialType } from './door-3d-types';

const OPAQUE_VS = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_pos;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec3 a_color;
layout(location = 3) in float a_matId;

uniform mat4 u_projView;

out vec3 v_pos;
out vec3 v_normal;
out vec3 v_color;
out float v_matId;

void main() {
  v_pos = a_pos;
  v_normal = normalize(a_normal);
  v_color = a_color;
  v_matId = a_matId;
  gl_Position = u_projView * vec4(a_pos, 1.0);
}
`;

const OPAQUE_FS = `#version 300 es
precision highp float;

in vec3 v_pos;
in vec3 v_normal;
in vec3 v_color;
in float v_matId;

uniform vec3 u_eyePos;
uniform float u_roughness;
uniform float u_metalness;
uniform float u_isAnodize;
uniform int u_floorType;

out vec4 outColor;

void main() {
  vec3 N = normalize(v_normal);
  vec3 V = normalize(u_eyePos - v_pos);
  if (dot(N, V) < 0.0) {
    N = -N;
  }

  // Material 5: Procedural Studio Floor (Tile 60x60 / 80x80 / 60x120 / Wood Planks)
  if (v_matId > 4.5) {
    vec3 studioBg = vec3(0.935, 0.93, 0.92);
    float dist = length(v_pos.xz);
    float fade = smoothstep(2.4, 5.2, dist);

    vec3 floorCol = vec3(0.86, 0.85, 0.83);
    if (u_floorType == 4) {
      // Sàn gỗ tự nhiên (Wood planks: rộng 180mm, dài 1200mm xếp so le)
      float plankW = 0.18;
      float plankL = 1.20;
      float colIdx = floor(v_pos.x / plankW);
      float zShift = v_pos.z + mod(colIdx, 2.0) * (plankL * 0.5);
      float rowIdx = floor(zShift / plankL);

      float fx = abs(fract(v_pos.x / plankW) - 0.5);
      float fz = abs(fract(zShift / plankL) - 0.5);
      float groove = smoothstep(0.475, 0.495, fx) + smoothstep(0.492, 0.499, fz);

      float seed = fract(sin(colIdx * 12.9898 + rowIdx * 78.233) * 43758.5453);
      float grain = sin(v_pos.z * 38.0 + sin(v_pos.x * 95.0 + seed * 6.28) * 2.4) * 0.5 + 0.5;
      float fineGrain = sin(v_pos.z * 180.0 + v_pos.x * 45.0) * 0.5 + 0.5;

      vec3 oakLight = vec3(0.84, 0.71, 0.56);
      vec3 oakDark = vec3(0.73, 0.58, 0.43);
      floorCol = mix(oakDark, oakLight, grain * 0.72 + fineGrain * 0.28);
      floorCol *= (0.94 + seed * 0.1);
      floorCol = mix(floorCol, vec3(0.36, 0.26, 0.18), clamp(groove, 0.0, 1.0) * 0.85);
    } else {
      // Sàn gạch men (60x60, 80x80, 60x120)
      vec2 tileSize = u_floorType == 1 ? vec2(0.6, 0.6) : (u_floorType == 2 ? vec2(0.8, 0.8) : vec2(0.6, 1.2));
      vec2 uv = v_pos.xz / tileSize;
      vec2 cell = floor(uv);
      vec2 f = abs(fract(uv) - 0.5);
      vec2 lineW = vec2(0.0022) / tileSize;
      float grout = smoothstep(0.5 - lineW.x * 2.0, 0.5 - lineW.x * 0.5, f.x)
                  + smoothstep(0.5 - lineW.y * 2.0, 0.5 - lineW.y * 0.5, f.y);
      float tileVar = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
      float marble = sin((v_pos.x * 2.8 + v_pos.z * 2.1) + sin(v_pos.x * 6.0) * 0.6) * 0.5 + 0.5;
      vec3 tileBase = mix(vec3(0.89, 0.88, 0.86), vec3(0.94, 0.93, 0.91), marble * 0.6 + tileVar * 0.4);
      floorCol = mix(tileBase, vec3(0.64, 0.63, 0.61), clamp(grout, 0.0, 1.0));
    }

    vec3 L = normalize(vec3(0.45, 0.85, 0.55));
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), u_floorType == 4 ? 28.0 : 64.0) * (u_floorType == 4 ? 0.08 : 0.16);
    float contactOcc = smoothstep(0.0, 0.45, length(vec2(v_pos.x * 0.45, v_pos.z * 2.2)));
    floorCol = floorCol * (0.86 + 0.14 * contactOcc) + vec3(spec);

    outColor = vec4(mix(floorCol, studioBg, fade), 1.0);
    return;
  }

  vec3 baseColor = v_color;
  if (v_matId > 0.5 && v_matId < 1.5) {
    float grain = sin(v_pos.y * 95.0 + sin(v_pos.x * 55.0 + v_pos.z * 40.0) * 3.2) * 0.5 + 0.5;
    float fine = sin((v_pos.x + v_pos.y) * 260.0) * 0.5 + 0.5;
    baseColor = mix(baseColor * 0.76, baseColor * 1.12, grain * 0.75 + fine * 0.25);
  }

  vec3 L1 = normalize(vec3(0.55, 0.78, 0.68));
  vec3 L2 = normalize(vec3(-0.65, 0.45, -0.58));
  vec3 L3 = normalize(vec3(-0.2, -0.7, 0.5));

  float diff1 = max(dot(N, L1), 0.0);
  float diff2 = max(dot(N, L2), 0.0);
  float diff3 = max(dot(N, L3), 0.0);

  float hemi = N.y * 0.5 + 0.5;
  vec3 ambient = mix(vec3(0.44, 0.46, 0.50), vec3(0.78, 0.81, 0.86), hemi);

  vec3 H1 = normalize(L1 + V);
  vec3 H2 = normalize(L2 + V);

  float rough = clamp(u_roughness, 0.02, 1.0);
  float metal = clamp(u_metalness, 0.0, 1.0);
  float specPower = mix(128.0, 10.0, rough * rough);
  float specStrength = mix(0.65, 0.08, rough) * (0.45 + metal * 0.85);

  if (u_isAnodize > 0.5 && v_matId < 1.5) {
    specStrength *= 1.35;
    specPower = max(24.0, specPower * 0.85);
  }

  if (v_matId > 3.5) {
    specPower = 72.0;
    specStrength = 0.52;
  } else if (v_matId > 1.5 && v_matId < 3.5) {
    specPower = 12.0;
    specStrength = 0.05;
  }

  float spec1 = pow(max(dot(N, H1), 0.0), specPower) * specStrength;
  float spec2 = pow(max(dot(N, H2), 0.0), specPower) * (specStrength * 0.55);
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0) * (specStrength * 0.5);

  vec3 specTint = mix(vec3(1.0, 0.99, 0.97), mix(vec3(1.0), baseColor * 1.35, 0.55), metal * (0.5 + u_isAnodize * 0.4));
  float diffuseFactor = mix(1.0, 0.62, metal * 0.65);

  vec3 litColor = baseColor * diffuseFactor * (ambient * 0.58 + diff1 * 0.52 + diff2 * 0.28 + diff3 * 0.12)
                + specTint * (spec1 + spec2 + fresnel);

  outColor = vec4(clamp(litColor, 0.0, 1.0), 1.0);
}
`;

const TRANS_VS = `#version 300 es
precision highp float;

layout(location = 0) in vec3 a_pos;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec3 a_color;
layout(location = 3) in float a_alpha;

uniform mat4 u_projView;

out vec3 v_pos;
out vec3 v_normal;
out vec3 v_color;
out float v_alpha;

void main() {
  v_pos = a_pos;
  v_normal = a_normal;
  v_color = a_color;
  v_alpha = a_alpha;
  gl_Position = u_projView * vec4(a_pos, 1.0);
}
`;

const TRANS_FS = `#version 300 es
precision highp float;

in vec3 v_pos;
in vec3 v_normal;
in vec3 v_color;
in float v_alpha;

uniform vec3 u_eyePos;
uniform float u_glassRoughness;
uniform float u_glassFrost;

out vec4 outColor;

void main() {
  float nLen = length(v_normal);
  if (nLen < 0.1) {
    outColor = vec4(v_color, v_alpha);
    return;
  }

  vec3 N = normalize(v_normal);
  vec3 V = normalize(u_eyePos - v_pos);
  if (dot(N, V) < 0.0) {
    N = -N;
  }

  vec3 L = normalize(vec3(0.5, 0.8, 0.65));
  vec3 H = normalize(L + V);
  float gRough = clamp(u_glassRoughness, 0.02, 1.0);
  float specExp = mix(140.0, 14.0, gRough);
  float spec = pow(max(dot(N, H), 0.0), specExp) * mix(0.75, 0.22, gRough);
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.8);

  float sheenBand = smoothstep(0.42, 0.5, sin((v_pos.x * 3.2 + v_pos.y * 2.4) * 3.14159)) * (0.09 * (1.0 - gRough * 0.6));
  vec3 frostTint = mix(v_color, vec3(0.95, 0.97, 0.99), clamp(u_glassFrost * 0.75 + gRough * 0.35, 0.0, 0.85));
  vec3 glassRgb = mix(frostTint, vec3(0.96, 0.99, 1.0), fresnel * 0.52 + spec + sheenBand);
  float finalAlpha = clamp(v_alpha + u_glassFrost * 0.45 + fresnel * 0.24 + spec * 0.4 + sheenBand, 0.08, 0.92);

  outColor = vec4(glassRgb, finalAlpha);
}
`;

function createProgram(gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string): WebGLProgram {
  const p = gl.createProgram()!;
  const vs = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vs, vsSrc);
  gl.compileShader(vs);
  const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fs, fsSrc);
  gl.compileShader(fs);
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return p;
}

const FLOOR_TYPE_MAP: Record<FloorMaterialType, number> = {
  tile_60x60: 1,
  tile_80x80: 2,
  tile_60x120: 3,
  wood: 4,
};

export class Door3DWebGLEngine {
  private gl: WebGL2RenderingContext;
  private opaqueProg: WebGLProgram;
  private transProg: WebGLProgram;
  private opaqueVao: WebGLVertexArrayObject;
  private opaqueBuf: WebGLBuffer;
  private opaqueCount = 0;
  private lineVao: WebGLVertexArrayObject;
  private lineBuf: WebGLBuffer;
  private lineCount = 0;
  private transVao: WebGLVertexArrayObject;
  private transBuf: WebGLBuffer;
  private transCount = 0;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'default' });
    if (!gl) throw new Error('Trình duyệt không hỗ trợ WebGL2');
    this.gl = gl;
    this.opaqueProg = createProgram(gl, OPAQUE_VS, OPAQUE_FS);
    this.transProg = createProgram(gl, TRANS_VS, TRANS_FS);

    const stride10 = 10 * 4;
    this.opaqueVao = gl.createVertexArray()!;
    this.opaqueBuf = gl.createBuffer()!;
    gl.bindVertexArray(this.opaqueVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.opaqueBuf);
    for (let i = 0; i < 4; i++) {
      gl.enableVertexAttribArray(i);
      gl.vertexAttribPointer(i, i === 3 ? 1 : 3, gl.FLOAT, false, stride10, i * 3 * 4);
    }

    const stride7 = 7 * 4;
    this.lineVao = gl.createVertexArray()!;
    this.lineBuf = gl.createBuffer()!;
    gl.bindVertexArray(this.lineVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride7, 0);
    gl.disableVertexAttribArray(1);
    gl.vertexAttrib3f(1, 0, 0, 0);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride7, 3 * 4);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride7, 6 * 4);

    this.transVao = gl.createVertexArray()!;
    this.transBuf = gl.createBuffer()!;
    gl.bindVertexArray(this.transVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.transBuf);
    for (let i = 0; i < 4; i++) {
      gl.enableVertexAttribArray(i);
      gl.vertexAttribPointer(i, i === 3 ? 1 : 3, gl.FLOAT, false, stride10, i * 3 * 4);
    }
    gl.bindVertexArray(null);
  }

  public uploadGeometry(collector: Door3DMeshCollector) {
    const { gl } = this;
    const opaqueArr = new Float32Array(collector.opaqueVerts);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.opaqueBuf);
    gl.bufferData(gl.ARRAY_BUFFER, opaqueArr, gl.DYNAMIC_DRAW);
    this.opaqueCount = opaqueArr.length / 10;

    const lineArr = new Float32Array(collector.lineVerts);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuf);
    gl.bufferData(gl.ARRAY_BUFFER, lineArr, gl.DYNAMIC_DRAW);
    this.lineCount = lineArr.length / 7;

    const transArr = new Float32Array(collector.transVerts);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.transBuf);
    gl.bufferData(gl.ARRAY_BUFFER, transArr, gl.DYNAMIC_DRAW);
    this.transCount = transArr.length / 10;
  }

  public render(params: {
    width: number;
    height: number;
    eye: Vec3;
    target: Vec3;
    showEdges: boolean;
    roughness?: number;
    metalness?: number;
    isAnodize?: boolean;
    isStudio?: boolean;
    floorType?: FloorMaterialType;
    glassRoughness?: number;
    glassFrost?: number;
  }) {
    const { gl } = this;
    const { width, height, eye, target, showEdges } = params;

    gl.viewport(0, 0, width, height);
    if (params.isStudio !== false) {
      gl.clearColor(0.935, 0.93, 0.92, 1.0); // Warm architectural studio backdrop
    } else {
      gl.clearColor(0.945, 0.96, 0.976, 1.0); // Technical slate backdrop
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = Math.max(0.1, width / Math.max(1, height));
    const proj = mat4Perspective((38 * Math.PI) / 180, aspect, 0.05, 50.0);
    const view = mat4LookAt(eye, target, [0, 1, 0]);
    const projView = mat4Multiply(proj, view);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 1.0);

    if (this.opaqueCount > 0) {
      gl.useProgram(this.opaqueProg);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.opaqueProg, 'u_projView'), false, projView);
      gl.uniform3fv(gl.getUniformLocation(this.opaqueProg, 'u_eyePos'), eye);
      gl.uniform1f(gl.getUniformLocation(this.opaqueProg, 'u_roughness'), params.roughness ?? 0.25);
      gl.uniform1f(gl.getUniformLocation(this.opaqueProg, 'u_metalness'), params.metalness ?? 0.24);
      gl.uniform1f(gl.getUniformLocation(this.opaqueProg, 'u_isAnodize'), params.isAnodize ? 1.0 : 0.0);
      gl.uniform1i(gl.getUniformLocation(this.opaqueProg, 'u_floorType'), FLOOR_TYPE_MAP[params.floorType || 'wood']);
      gl.bindVertexArray(this.opaqueVao);
      gl.drawArrays(gl.TRIANGLES, 0, this.opaqueCount);
    }

    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.transProg);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.transProg, 'u_projView'), false, projView);
    gl.uniform3fv(gl.getUniformLocation(this.transProg, 'u_eyePos'), eye);
    gl.uniform1f(gl.getUniformLocation(this.transProg, 'u_glassRoughness'), params.glassRoughness ?? 0.3);
    gl.uniform1f(gl.getUniformLocation(this.transProg, 'u_glassFrost'), params.glassFrost ?? 0.16);

    if (showEdges && this.lineCount > 0) {
      gl.bindVertexArray(this.lineVao);
      gl.drawArrays(gl.LINES, 0, this.lineCount);
    }

    if (this.transCount > 0) {
      gl.depthMask(false);
      gl.bindVertexArray(this.transVao);
      gl.drawArrays(gl.TRIANGLES, 0, this.transCount);
      gl.depthMask(true);
    }
    gl.bindVertexArray(null);
  }

  public dispose() {
    const { gl } = this;
    gl.deleteBuffer(this.opaqueBuf);
    gl.deleteBuffer(this.lineBuf);
    gl.deleteBuffer(this.transBuf);
    gl.deleteVertexArray(this.opaqueVao);
    gl.deleteVertexArray(this.lineVao);
    gl.deleteVertexArray(this.transVao);
    gl.deleteProgram(this.opaqueProg);
    gl.deleteProgram(this.transProg);
  }
}
