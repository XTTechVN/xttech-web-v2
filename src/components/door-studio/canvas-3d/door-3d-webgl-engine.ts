import {
  Door3DMeshCollector,
  mat4LookAt,
  mat4Multiply,
  mat4Perspective,
  Vec3,
} from './door-3d-math';

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

out vec4 outColor;

void main() {
  vec3 N = normalize(v_normal);
  vec3 V = normalize(u_eyePos - v_pos);
  // Two-sided normal support
  if (dot(N, V) < 0.0) {
    N = -N;
  }

  vec3 baseColor = v_color;

  // Material 1: Procedural Wood-grain (Vân gỗ nhôm)
  if (v_matId > 0.5 && v_matId < 1.5) {
    float grain = sin(v_pos.y * 95.0 + sin(v_pos.x * 55.0 + v_pos.z * 40.0) * 3.2) * 0.5 + 0.5;
    float fine = sin((v_pos.x + v_pos.y) * 260.0) * 0.5 + 0.5;
    baseColor = mix(baseColor * 0.76, baseColor * 1.12, grain * 0.75 + fine * 0.25);
  }

  // 3-Point Studio Lighting + Sky/Ground Hemisphere Ambient
  vec3 L1 = normalize(vec3(0.55, 0.78, 0.68));
  vec3 L2 = normalize(vec3(-0.65, 0.45, -0.58));
  vec3 L3 = normalize(vec3(-0.2, -0.7, 0.5));

  float diff1 = max(dot(N, L1), 0.0);
  float diff2 = max(dot(N, L2), 0.0);
  float diff3 = max(dot(N, L3), 0.0);

  // Hemisphere ambient (sky blue-white above, warm neutral below)
  float hemi = N.y * 0.5 + 0.5;
  vec3 ambient = mix(vec3(0.42, 0.44, 0.48), vec3(0.74, 0.77, 0.82), hemi);

  vec3 H1 = normalize(L1 + V);
  vec3 H2 = normalize(L2 + V);

  float specPower = 38.0;
  float specStrength = 0.28;
  if (v_matId > 3.5) {
    // Hardware (Tay nắm, Bản lề, Ray Inox): Độ bóng kim loại cao
    specPower = 64.0;
    specStrength = 0.45;
  } else if (v_matId > 1.5 && v_matId < 3.5) {
    // Roan cao su / Tường giả lập: Độ bóng thấp
    specPower = 12.0;
    specStrength = 0.05;
  }

  float spec1 = pow(max(dot(N, H1), 0.0), specPower) * specStrength;
  float spec2 = pow(max(dot(N, H2), 0.0), specPower) * (specStrength * 0.55);
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.2) * (specStrength * 0.45);

  vec3 litColor = baseColor * (ambient * 0.58 + diff1 * 0.52 + diff2 * 0.28 + diff3 * 0.12)
                + vec3(1.0, 0.99, 0.97) * (spec1 + spec2 + fresnel);

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

out vec4 outColor;

void main() {
  float nLen = length(v_normal);
  if (nLen < 0.1) {
    // Wireframe Line or Contact Shadow
    outColor = vec4(v_color, v_alpha);
    return;
  }

  // Architectural Glass with Fresnel & Sky Reflection Band
  vec3 N = normalize(v_normal);
  vec3 V = normalize(u_eyePos - v_pos);
  if (dot(N, V) < 0.0) {
    N = -N;
  }

  vec3 L = normalize(vec3(0.5, 0.8, 0.65));
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 96.0) * 0.65;
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.8);

  // Subtle diagonal reflection sheen across glass surface
  float sheenBand = smoothstep(0.42, 0.5, sin((v_pos.x * 3.2 + v_pos.y * 2.4) * 3.14159)) * 0.08;

  vec3 glassRgb = mix(v_color, vec3(0.94, 0.98, 1.0), fresnel * 0.55 + spec + sheenBand);
  float finalAlpha = clamp(v_alpha + fresnel * 0.26 + spec * 0.45 + sheenBand, 0.12, 0.82);

  outColor = vec4(glassRgb, finalAlpha);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function createProgram(gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string): WebGLProgram {
  const p = gl.createProgram()!;
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return p;
}

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
    const gl = canvas.getContext('webgl2', {
      antialias: true,
      alpha: false,
      powerPreference: 'default',
    });
    if (!gl) {
      throw new Error('Trình duyệt không hỗ trợ WebGL2');
    }
    this.gl = gl;

    this.opaqueProg = createProgram(gl, OPAQUE_VS, OPAQUE_FS);
    this.transProg = createProgram(gl, TRANS_VS, TRANS_FS);

    // 1. Opaque VAO (10 floats/vertex: pos3, norm3, col3, matId1)
    this.opaqueVao = gl.createVertexArray()!;
    this.opaqueBuf = gl.createBuffer()!;
    gl.bindVertexArray(this.opaqueVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.opaqueBuf);
    const stride10 = 10 * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride10, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride10, 3 * 4);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride10, 6 * 4);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride10, 9 * 4);

    // 2. Line VAO (7 floats/vertex: pos3, col3, alpha1; normal = 0,0,0)
    this.lineVao = gl.createVertexArray()!;
    this.lineBuf = gl.createBuffer()!;
    gl.bindVertexArray(this.lineVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuf);
    const stride7 = 7 * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride7, 0);
    gl.disableVertexAttribArray(1);
    gl.vertexAttrib3f(1, 0, 0, 0);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride7, 3 * 4);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride7, 6 * 4);

    // 3. Transparent VAO (10 floats/vertex: pos3, norm3, col3, alpha1)
    this.transVao = gl.createVertexArray()!;
    this.transBuf = gl.createBuffer()!;
    gl.bindVertexArray(this.transVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.transBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride10, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride10, 3 * 4);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride10, 6 * 4);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride10, 9 * 4);

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
  }) {
    const { gl } = this;
    const { width, height, eye, target, showEdges } = params;

    gl.viewport(0, 0, width, height);
    gl.clearColor(0.945, 0.96, 0.976, 1.0); // #F1F5F9 soft slate studio backdrop
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = Math.max(0.1, width / Math.max(1, height));
    const proj = mat4Perspective((38 * Math.PI) / 180, aspect, 0.05, 50.0);
    const view = mat4LookAt(eye, target, [0, 1, 0]);
    const projView = mat4Multiply(proj, view);

    // Pass 1: Opaque aluminum, wall, gasket & hardware geometry
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
      gl.bindVertexArray(this.opaqueVao);
      gl.drawArrays(gl.TRIANGLES, 0, this.opaqueCount);
    }

    gl.disable(gl.POLYGON_OFFSET_FILL);

    // Pass 2: Crisp CAD joint & wireframe lines + Floor Grid
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.transProg);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.transProg, 'u_projView'), false, projView);
    gl.uniform3fv(gl.getUniformLocation(this.transProg, 'u_eyePos'), eye);

    if (showEdges && this.lineCount > 0) {
      gl.bindVertexArray(this.lineVao);
      gl.drawArrays(gl.LINES, 0, this.lineCount);
    }

    // Pass 3: Translucent Glass, Screen Mesh & Contact Shadows (depth write off)
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
