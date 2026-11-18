/* High-resolution hair-only wind motion. If WebGL is unavailable, keep the original still portrait. */
(() => {
  const figure = document.querySelector('.portrait');
  const img = figure?.querySelector('img');
  if (!figure || !img) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'hair-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  let gl;
  try {
    gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'low-power'
    });
  } catch {
    return;
  }
  if (!gl) return;

  let frame = 0;
  let visible = true;
  let ready = false;
  let lost = false;
  let time = 0;
  let last = 0;
  let program;
  let buffer;
  let texture;
  let clock;
  let attribute;

  const vertex = `attribute vec2 a;varying vec2 uv;void main(){uv=vec2((a.x+1.0)*.5,(1.0-a.y)*.5);gl_Position=vec4(a,0.,1.);}`;
  const fragment = `precision mediump float;
  varying vec2 uv;uniform sampler2D picture;uniform float t;
  float patch(vec2 p,vec2 c,vec2 r){return 1.-smoothstep(.45,1.,length((p-c)/r));}
  void main(){
    vec2 p=uv;
    float left=patch(p,vec2(.235,.485),vec2(.195,.182));
    float boundary=.265+.22*smoothstep(.44,.60,p.y);
    left*=1.-smoothstep(boundary-.025,boundary+.015,p.x);
    left*=smoothstep(.28,.43,p.y)*(1.-smoothstep(.615,.657,p.y));
    float right=patch(p,vec2(.75,.417),vec2(.105,.125));
    right*=smoothstep(.66,.705,p.x)*smoothstep(.285,.39,p.y)*(1.-smoothstep(.475,.515,p.y));
    float breeze=sin(t*6.283185/6.4);
    float other=sin(t*6.283185/5.7+1.4);
    vec2 shift=vec2((.019*breeze+.004*sin(t*1.75+p.y*15.))*left,.0055*sin(t*.9817+.7)*left);
    shift+=vec2(.015*other,.0045*sin(t*1.102+2.))*right;
    gl_FragColor=texture2D(picture,p-shift);
  }`;

  function compile(type, source) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Unable to allocate WebGL shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message || 'WebGL shader compilation failed');
    }
    return shader;
  }

  function initializeContext() {
    try {
      const nextProgram = gl.createProgram();
      const vertexShader = compile(gl.VERTEX_SHADER, vertex);
      const fragmentShader = compile(gl.FRAGMENT_SHADER, fragment);
      if (!nextProgram) throw new Error('Unable to allocate WebGL program');
      gl.attachShader(nextProgram, vertexShader);
      gl.attachShader(nextProgram, fragmentShader);
      gl.linkProgram(nextProgram);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(nextProgram) || 'WebGL program linking failed');
      }

      const nextBuffer = gl.createBuffer();
      const nextTexture = gl.createTexture();
      if (!nextBuffer || !nextTexture) throw new Error('Unable to allocate WebGL image resources');
      gl.useProgram(nextProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, nextBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      const nextAttribute = gl.getAttribLocation(nextProgram, 'a');
      gl.enableVertexAttribArray(nextAttribute);
      gl.vertexAttribPointer(nextAttribute, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, nextTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      program = nextProgram;
      buffer = nextBuffer;
      texture = nextTexture;
      attribute = nextAttribute;
      clock = gl.getUniformLocation(program, 't');
      ready = true;
      lost = false;
      figure.append(canvas);
      resizeCanvas();
      sync();
    } catch {
      ready = false;
      figure.classList.remove('hair-active');
    }
  }

  function resizeCanvas() {
    if (!ready || lost) return;
    const box = figure.getBoundingClientRect();
    if (!box.width || !box.height || !img.naturalWidth || !img.naturalHeight) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    const width = Math.min(box.width, box.height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = width / ratio + 'px';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.max(1, Math.min(img.naturalWidth, Math.round(width * dpr)));
    const pixelHeight = Math.max(1, Math.round(pixelWidth / ratio));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1f(clock, time);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function tick(now) {
    frame = 0;
    if (!ready || lost || reduced.matches || document.hidden || !visible) return;
    if (last) time += Math.min((now - last) / 1000, .05);
    last = now;
    gl.uniform1f(clock, time);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    const active = ready && !lost && !reduced.matches;
    figure.classList.toggle('hair-active', active);
    if (active && !document.hidden && visible) frame = requestAnimationFrame(tick);
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    ready = false;
    cancelAnimationFrame(frame);
    frame = 0;
    figure.classList.remove('hair-active');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    initializeContext();
  });

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(figure);
  new ResizeObserver(resizeCanvas).observe(figure);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => cancelAnimationFrame(frame), { once: true });

  if (img.complete && img.naturalWidth) initializeContext();
  else img.addEventListener('load', initializeContext, { once: true });
})();
