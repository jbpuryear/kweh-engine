import EventEmitter from '../EventEmitter.js';

export const RENDERER_PRE_CONTEXT_RESTORE = Symbol('renderer context restore');
export const RENDERER_CONTEXT_RESTORE = Symbol('renderer context restore');
export const RENDERER_POST_CONTEXT_RESTORE = Symbol('renderer context restore');


export default class Renderer extends EventEmitter {
  constructor(canvas, bufferSize = 2**16) {
    super();
    this.canvas = canvas;
    this.gl = null;
    this.contextLost = false;
    this.maxTextures = 0;
    this._bufferSize = bufferSize;
    this._buffer = null;
    this._framebuffer = null;
    this._glBuffer = null;
    this._batch = null;
    this._shader = null;
    this._activeAttributes = new Set();
    this._activeTexture = -1;
    this._boundTextures = null;

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.contextLost = true;
    });

    canvas.addEventListener('webglcontextrestored', (e) => {
      e.preventDefault();
      this.contextLost = false;
      this._init();
      this.emit(RENDERER_PRE_CONTEXT_RESTORE, this);
      this.emit(RENDERER_CONTEXT_RESTORE, this);

      const batch = this._batch;
      const shader = this._shader;
      if (batch) {
        this._batch.enabled = false;
        this._batch = null;
        this._shader = null;
        this.bindPipeline(batch, shader);
      }

      for (let i = 0; i < this._boundTextures.length; i += 1) {
        const tex = this._boundTextures[i];
        if (tex) {
          this.bindTexture(tex, i);
        }
      }

      this.emit(RENDERER_POST_CONTEXT_RESTORE, this);
    });

    this._init();
  }


  destroy() {
    this.gl.deleteBuffer(this._glBuffer);
    this._glBuffer = null;
    this._buffer = null;
    this._framebuffer = null;
    if (this._batch) {
      this._batch.enabled = null;
      this._batch = null;
    }
    this._boundTextures = null;
    this._shader = null;
    this.gl = null;
  }


  clearColor(color) {
    this.gl.clearColor(
      (color >>> 24) / 255,
      ((color & 0xff0000) >>> 16) / 255,
      ((color & 0xff00) >>> 8) / 255,
      (color & 0xff) / 255
    );
  }


  clear(color = true, depth = false, stencil = false) {
    const gl = this.gl;
    const mask = (color ? gl.COLOR_BUFFER_BIT : 0) | (depth ? gl.DEPTH_BUFFER_BIT : 0) | (stencil ? gl.STENCIL_BUFFER_BIT : 0);
    gl.clear(mask);
  }


  createProgram(vert, frag) {
    const gl = this.gl;
    const program = gl.createProgram();
    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vs, vert);
    gl.shaderSource(fs, frag);
    gl.compileShader(vs);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        throw new Error('Vertex Shader failed:\n' + gl.getShaderInfoLog(vs));
    }

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        throw new Error('Fragment Shader failed:\n' + gl.getShaderInfoLog(fs));
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('Link Program failed:\n' + gl.getProgramInfoLog(program));
    }

    gl.detachShader(program, vs);
    gl.detachShader(program, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    return program;
  }


  deleteProgram(program) {
    this.gl.deleteProgram(program);
  }


  createBuffer(sizeOrData, usage = this.gl.DYNAMIC_DRAW) {
    const gl = this.gl;
    const glBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
    return glBuffer;
  }


  deleteBuffer(buffer) {
    this.gl.deleteBuffer(buffer);
  }


  createFramebuffer(glColor, glDepth = null, glStencil = null) {
    const gl = this.gl;
    const fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glColor, 0);

    if (glDepth && glStencil) {
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, glDepth);
    } else if (glDepth) {
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, glDepth);
    }

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Framebuffer error: ${status}`);
    }

    this.gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

    return fb;
  }


  deleteFramebuffer(framebuffer) {
    this.gl.deleteFramebuffer(framebuffer);
  }


  activeTexture(unit) {
    if (unit < 0 || unit > this.maxTextures - 1) {
      console.error(`Unit ${unit} out of range`);
      return false;
    }

    if (this._activeTexture !== unit) {
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this._activeTexture = unit;
    }
    return true;
  }


  createTexture(source, width, height, nearestMin = false, nearestMag = false, nearestMip = false) {
    width = source?.width ?? width;
    height = source?.height ?? height;
    const gl = this.gl;
    const glTexture = gl.createTexture();
    const isPowerOf2 = (width & (width - 1) === 0) && (height & (height - 1 === 0));
    const prev = this._boundTextures[this._activeTexture];

    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    if (source) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }

    if (isPowerOf2) {
      gl.generateMipmap(gl.TEXTURE_2D);
      if (nearestMip) {
        const filter = nearestMin ? gl.NEAREST_MIPMAP_NEAREST : gl.NEAREST_MIPMAP_LINEAR;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      } else {
        const filter = nearestMin ? gl.LINEAR_MIPMAP_NEAREST : gl.NEAREST_MIPMAP_LINEAR;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      }
    } else {
      const filter = nearestMin ? gl.NEAREST : gl.LINEAR;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const magFilter = nearestMag ? gl.NEAREST : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

    gl.bindTexture(gl.TEXTURE_2D, (prev?.glTexture ?? null));
    return glTexture;
  }


  deleteTexture(glTexture) {
    this.gl.deleteTexture(glTexture);
  }


  bindTexture(texture, unit = 0) {
    const gl = this.gl;
    const prev = this._boundTextures[unit];

    if (!this.activeTexture(unit)) {
      return false;
    }

    if (texture !== prev) {
      this._boundTextures[unit] = texture;
      if (texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
        texture.glUnit = unit;
      } else {
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
      if (prev) {
        prev.glUnit = -1;
      }
    }
    return true;
  }


  unbindTexture(unit) {
    this.bindTexture(null, unit);
  }


  bindRenderTarget(renderTarget, setViewport = true) {
    if (this._batch) {
      this._batch.flush();
    }

    const gl = this.gl;
    if (renderTarget) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget.framebuffer);
      if (setViewport) {
        gl.viewport(0, 0, renderTarget.width, renderTarget.height);
      }
      this._framebuffer = renderTarget.framebuffer;
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (setViewport) {
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      }
      this._framebuffer = null;
    }
  }


  bindPipeline(batch, shader) {
    const gl = this.gl;
    const prevBatch = this._batch;
    const prevShader = this._shader;

    if (prevBatch) {
      prevBatch.flush();
      prevBatch.enabled = false;
    }

    if (prevBatch?._glBuffer !== batch._glBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, batch._glBuffer);
    }

    if (prevShader?.program !== shader.program) {
      gl.useProgram(shader.program);

      this._activeAttributes.clear();
      for (const attrib of shader.attributes) {
        gl.enableVertexAttribArray(attrib.location);
        gl.vertexAttribPointer(attrib.location, attrib.size, attrib.type, attrib.normalized,
          batch.vertexSize, attrib.offset);
        this._activeAttributes.add(attrib.location);
      }

      if (prevShader) {
        for (const oldAttrib of prevShader.attributes) {
          if (!this._activeAttributes.has(oldAttrib.location)) {
            gl.disableVertexAttribArray(oldAttrib.location);
          }
        }
      }
    }

    this._batch = batch;
    this._shader = shader;
    batch.enabled = true;
  }


  uniform(name, v0, v1, v2, v3) {
    const uniform = this._shader.uniforms.get(name);
    if (uniform) {
      const loc = uniform.location;
      const func = uniform.func;
      switch (func.length) {
        case 2: return func.call(this.gl, loc, v0);
        case 3: return func.call(this.gl, loc, v0, v1);
        case 4: return func.call(this.gl, loc, v0, v1, v2);
        case 5: return func.call(this.gl, loc, v0, v1, v2, v3);
      }
    }
  }


  uniformv(name, value) {
    const uniform = this._shader.uniforms.get(name);
    if (uniform) {
      return uniform.funcv.call(this.gl, uniform.location, value);
    }
  }


  _init() {
    const gl = this.canvas.getContext('webgl', { depth: false, });
    if (!gl || gl.isContextLost()) {
      this.contextLost = true;
      throw new Error('Failed to initialize renderer');
    }
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    this.gl = gl;
    this.contextLost = false;
    this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this._buffer = null;
    this._framebuffer = null;
    this._glBuffer = null;
    this._activeTexture = -1;
    this._boundTextures = new Array(this.maxTextures);

    this._boundTextures.fill(null);
    this._activeAttributes.clear();
  }


  _draw(count, vertexSize, buffer) {
    const gl = this.gl;
    const bytes = count * vertexSize;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, buffer, 0, bytes);
    gl.drawArrays(gl.TRIANGLES, 0, count);
  }


  _initSharedBuffers() {
    if (!this._buffer) {
      this._buffer = new ArrayBuffer(this._bufferSize);
      this._glBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._glBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, this._bufferSize, this.gl.DYNAMIC_DRAW);
    }
  }


  _getBuffer() {
    this._initSharedBuffers();
    return this._buffer;
  }


  _getGlBuffer() {
    this._initSharedBuffers();
    return this._glBuffer;
  }
}
