import * as THREE from 'three'

export interface GlassLensRect {
  x: number
  y: number
  width: number
  height: number
  radius: number
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;
varying vec2 vUv;

uniform vec2 uResolution;
uniform vec4 uLenses[4];
uniform float uRadii[4];
uniform int uLensCount;

uniform float uBezel;
uniform float uThickness;
uniform float uIOR;
uniform float uBlur;
uniform float uSpecular;
uniform float uRimGlow;
uniform float uTint;
uniform float uShadow;
uniform sampler2D uBgTex;

float sdRoundedRect(vec2 p, vec2 halfSize, float r) {
  vec2 q = abs(p) - halfSize + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float surfaceHeight(float t) {
  float s = 1.0 - t;
  return pow(1.0 - s * s * s * s, 0.25);
}

vec3 sampleBg(vec2 screenUV) {
  vec2 uv = vec2(screenUV.x, 1.0 - screenUV.y);
  return texture2D(uBgTex, uv).rgb;
}

vec3 sampleBgBlurred(vec2 uv, float radius) {
  if (radius < 0.5) return sampleBg(uv);
  vec3 sum = vec3(0.0);
  vec2 px = 1.0 / uResolution;

  vec2 o[16];
  o[0] = vec2(-0.942, -0.399);
  o[1] = vec2(0.946, -0.769);
  o[2] = vec2(-0.094, -0.929);
  o[3] = vec2(0.345, 0.294);
  o[4] = vec2(-0.916, -0.458);
  o[5] = vec2(-0.815, 0.486);
  o[6] = vec2(-0.383, -0.561);
  o[7] = vec2(-0.127, 0.846);
  o[8] = vec2(0.896, 0.413);
  o[9] = vec2(0.182, -0.300);
  o[10] = vec2(-0.014, -0.160);
  o[11] = vec2(0.596, 0.711);
  o[12] = vec2(0.497, -0.473);
  o[13] = vec2(0.807, 0.046);
  o[14] = vec2(-0.325, -0.040);
  o[15] = vec2(-0.610, 0.066);

  for (int i = 0; i < 16; i++) {
    sum += sampleBg(uv + o[i] * radius * px);
  }
  return sum / 16.0;
}

void main() {
  vec2 screenPx = vec2(vUv.x, 1.0 - vUv.y) * uResolution;

  float minSd = 99999.0;
  vec2 activeCenter = vec2(0.0);
  vec2 activeHalfSize = vec2(0.0);
  float activeRadius = 0.0;

  for (int i = 0; i < 4; i++) {
    if (i >= uLensCount) break;
    vec4 rect = uLenses[i];
    vec2 center = rect.xy;
    vec2 halfSize = rect.zw * 0.5;
    float r = min(uRadii[i], min(halfSize.x, halfSize.y) - 1.0);
    r = max(r, 0.0);

    float sd = sdRoundedRect(screenPx - center, halfSize, r);
    if (sd < minSd) {
      minSd = sd;
      activeCenter = center;
      activeHalfSize = halfSize;
      activeRadius = r;
    }
  }

  if (minSd > 0.0) {
    float shadowFalloff = exp(-minSd * minSd / 800.0);
    gl_FragColor = vec4(0.0, 0.0, 0.0, uShadow * shadowFalloff * 0.6);
    return;
  }

  vec2 p = screenPx - activeCenter;
  float distFromEdge = -minSd;
  float bezel = min(uBezel, min(activeRadius, min(activeHalfSize.x, activeHalfSize.y)) - 1.0);
  bezel = max(bezel, 1.0);

  float t = clamp(distFromEdge / bezel, 0.0, 1.0);
  float h = surfaceHeight(t);
  float dt = 0.001;
  float h2 = surfaceHeight(min(t + dt, 1.0));
  float dh = (h2 - h) / dt;

  float slopeAngle = atan(dh * (uThickness / bezel));
  float sinR = clamp(sin(slopeAngle) / uIOR, -1.0, 1.0);
  float thetaR = asin(sinR);
  float displacement = h * uThickness * (tan(slopeAngle) - tan(thetaR));

  float eps = 0.5;
  vec2 grad = normalize(vec2(
    sdRoundedRect(p + vec2(eps, 0.0), activeHalfSize, activeRadius) - minSd,
    sdRoundedRect(p + vec2(0.0, eps), activeHalfSize, activeRadius) - minSd
  ));

  vec2 offset = -grad * displacement / uResolution;
  vec2 screenUV = screenPx / uResolution;

  vec3 color = sampleBgBlurred(screenUV + offset, uBlur);

  vec2 lightDir = normalize(vec2(0.5, -0.7));
  float rimDot = abs(dot(grad, lightDir));
  float rimFalloff = 1.0 - smoothstep(0.0, bezel * 0.4, distFromEdge);
  float specHighlight = pow(rimDot * rimFalloff, 1.5);
  color += vec3(specHighlight * uSpecular * uRimGlow);

  float innerShadow = 1.0 - smoothstep(0.0, bezel * 0.6, distFromEdge);
  color *= mix(1.0, 0.7, innerShadow * 0.3);

  float edgeLine = 1.0 - smoothstep(0.0, 1.15, distFromEdge);
  color += vec3(edgeLine * uSpecular * 0.34);

  float innerRim = smoothstep(0.35, 1.2, distFromEdge) * (1.0 - smoothstep(1.2, 2.1, distFromEdge));
  color += vec3(innerRim * 0.055 * uSpecular);

  color = mix(color, vec3(1.0), uTint);
  float alpha = smoothstep(0.0, 1.5, distFromEdge);

  gl_FragColor = vec4(color, alpha);
}
`

export class LiquidGlassEngine {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private material: THREE.ShaderMaterial
  private bgTexture: THREE.CanvasTexture
  private bgCanvas: HTMLCanvasElement
  private animId: number = 0

  constructor(canvas: HTMLCanvasElement) {
    this.bgCanvas = document.createElement('canvas')
    this.bgCanvas.width = 512
    this.bgCanvas.height = 512
    this.renderDefaultBackground()

    this.bgTexture = new THREE.CanvasTexture(this.bgCanvas)
    this.bgTexture.minFilter = THREE.LinearFilter
    this.bgTexture.magFilter = THREE.LinearFilter

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      uniforms: {
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uLenses: {
          value: [
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
          ],
        },
        uRadii: { value: [0, 0, 0, 0] },
        uLensCount: { value: 0 },
        uBezel: { value: 48.0 },
        uThickness: { value: 49.0 },
        uIOR: { value: 2.7 },
        uBlur: { value: 5.0 },
        uSpecular: { value: 0.15 },
        uRimGlow: { value: 0.03 },
        uTint: { value: 0.07 },
        uShadow: { value: 0.3 },
        uBgTex: { value: this.bgTexture },
      },
    })

    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material))
    this.loop = this.loop.bind(this)
    this.loop()
  }

  private renderDefaultBackground() {
    const ctx = this.bgCanvas.getContext('2d')!
    const w = this.bgCanvas.width
    const h = this.bgCanvas.height
    ctx.fillStyle = '#0d0d0e'
    ctx.fillRect(0, 0, w, h)

    const grad = ctx.createRadialGradient(w * 0.5, h * 0.8, 10, w * 0.5, h * 0.8, w * 0.7)
    grad.addColorStop(0, 'rgba(55, 65, 81, 0.4)')
    grad.addColorStop(1, 'rgba(13, 13, 14, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }

  public updateLenses(lenses: GlassLensRect[]) {
    const count = Math.min(lenses.length, 4)
    this.material.uniforms.uLensCount.value = count
    for (let i = 0; i < count; i++) {
      const l = lenses[i]
      this.material.uniforms.uLenses.value[i].set(l.x, l.y, l.width, l.height)
      this.material.uniforms.uRadii.value[i] = l.radius
    }
  }

  public updateBackgroundCanvas(sourceCanvas: HTMLCanvasElement) {
    this.bgTexture.image = sourceCanvas
    this.bgTexture.needsUpdate = true
  }

  public resize(width: number, height: number) {
    this.renderer.setSize(width, height)
    this.material.uniforms.uResolution.value.set(width, height)
  }

  private loop() {
    this.renderer.render(this.scene, this.camera)
    this.animId = requestAnimationFrame(this.loop)
  }

  public destroy() {
    cancelAnimationFrame(this.animId)
    this.renderer.dispose()
    this.bgTexture.dispose()
    this.material.dispose()
  }
}
