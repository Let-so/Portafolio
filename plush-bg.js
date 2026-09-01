/* <plush-bg> — plush fur background, one full-screen fragment-shader pass.
   Per pixel the fur volume is marched tip→root (22 steps) and stops at the
   first fibre crossed. Zero cost at rest: draws once, then only on resize and
   while the cursor moves (the light follows it and the rAF cancels itself). */
(function () {
  'use strict';

  const CONFIG = {
    density: 320,   // fibras a lo ancho (más = más fino)
    fur: 0.030,     // largo del pelo, fracción del alto
    depth: 0.30,    // contraste base↔punta (más alto pelea con el texto)
    swirl: 0.60,    // remolinos / mechones
    base: [0.878, 0.874, 0.862],
    lightFollowsCursor: true
  };

  const VS = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';

  const FS = `
precision highp float;
uniform vec2 uRes; uniform vec2 uLight;
uniform float uDensity, uFur, uDepth, uSwirl;
uniform vec3 uBase;
const int STEPS = 22;
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f);
  return mix(mix(hash21(i), hash21(i+vec2(1,0)), f.x),
             mix(hash21(i+vec2(0,1)), hash21(i+vec2(1,1)), f.x), f.y);
}
float fiberHeight(vec2 sp, out float seed){
  seed = hash21(floor(sp * uDensity));
  float clump = vnoise(sp * uDensity * 0.055);
  return clamp(0.22 + 0.95 * seed * mix(0.68, 1.18, clump), 0.0, 1.0);
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes.y;
  vec2 c = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 view = c * 0.62;
  float a = vnoise(uv * 1.9) * 6.2831;
  vec2 drift = vec2(cos(a), sin(a)) * uSwirl;
  float hit = -1.0, seed = 0.0, s = 0.0;
  for(int i = 0; i < STEPS; i++){
    float t = 1.0 - float(i) / float(STEPS - 1);
    vec2 sp = uv + (view + drift) * uFur * t;
    float h = fiberHeight(sp, s);
    if(h >= t){ hit = t; seed = s; break; }
  }
  float d = max(hit, 0.0);
  float shade = mix(1.0 - uDepth, 1.0, pow(d, 0.75));
  vec2 lp = (uLight - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float fall = 1.0 - 0.30 * clamp(length(c - lp) * 0.85, 0.0, 1.0);
  float rim = 0.05 * pow(d, 3.0);
  vec3 col = uBase * shade * fall + rim;
  col += (seed - 0.5) * 0.022;
  col *= 1.0 - 0.09 * pow(length(c) * 0.78, 2.2);
  gl_FragColor = vec4(col, 1.0);
}`;

  class PlushBg extends HTMLElement {
    connectedCallback() {
      this.style.cssText = 'position:absolute;inset:0;display:block;background:#E0DFDB';
      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'width:100%;height:100%;display:block';
      this.appendChild(canvas);
      this._canvas = canvas;

      const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false });
      if (!gl) return;                       // CSS fallback colour stays
      this._gl = gl;

      const compile = (type, src) => {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src); gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
        return sh;
      };
      const prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog, 'aPos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const U = n => gl.getUniformLocation(prog, n);
      const num = (n, v) => gl.uniform1f(U(n), v);
      const attr = (n, d) => { const v = parseFloat(this.getAttribute(n)); return isNaN(v) ? d : v; };
      num('uDensity', attr('density', CONFIG.density));
      num('uFur', attr('fur', CONFIG.fur));
      num('uDepth', attr('depth', CONFIG.depth));
      num('uSwirl', attr('swirl', CONFIG.swirl));
      gl.uniform3f(U('uBase'), CONFIG.base[0], CONFIG.base[1], CONFIG.base[2]);
      this._uRes = U('uRes'); this._uLight = U('uLight');

      this._light = { x: 0.42, y: 0.62 };
      const target = { x: 0.42, y: 0.62 };
      let queued = false;

      const draw = () => {
        queued = false;
        gl.uniform2f(this._uRes, canvas.width, canvas.height);
        gl.uniform2f(this._uLight, this._light.x, this._light.y);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(draw); } };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        const w = this.clientWidth || window.innerWidth;
        const h = this.clientHeight || window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        schedule();
      };
      this._onResize = () => { clearTimeout(this._t); this._t = setTimeout(resize, 120); };
      window.addEventListener('resize', this._onResize);
      resize();

      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (CONFIG.lightFollowsCursor && !still) {
        let raf = 0;
        this._onMove = e => {
          const r = this.getBoundingClientRect();
          target.x = (e.clientX - r.left) / Math.max(1, r.width);
          target.y = 1 - (e.clientY - r.top) / Math.max(1, r.height);
          if (!raf) raf = requestAnimationFrame(function ease() {
            const L = this._light;
            L.x += (target.x - L.x) * 0.07;
            L.y += (target.y - L.y) * 0.07;
            draw();
            raf = (Math.abs(target.x - L.x) + Math.abs(target.y - L.y) > 0.002)
              ? requestAnimationFrame(ease.bind(this)) : 0;
          }.bind(this));
        };
        window.addEventListener('pointermove', this._onMove, { passive: true });
      }
    }

    disconnectedCallback() {
      if (this._onResize) window.removeEventListener('resize', this._onResize);
      if (this._onMove) window.removeEventListener('pointermove', this._onMove);
      const ext = this._gl && this._gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
  }

  if (!customElements.get('plush-bg')) customElements.define('plush-bg', PlushBg);
})();
