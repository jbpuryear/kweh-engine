import EventEmitter from '../EventEmitter.js';


export default class Renderer extends EventEmitter {
  constructor(canvas, bufferSize = 2**16) {
    super();
    this.canvas = canvas;
    this.gl = null;
    this.contextLost = false;
    this._bufferSize = bufferSize;
    this._buffer = null;
    this._framebuffer = null;
    this._glBuffer = null;
    this._batch = null;
    this._shader = null;
    this._activeAttributes = new Set();
    this._children = new Set();
    this._lastBoundTexture = null;

    canvas.addEventListener('webglcontextlost', (e) => {
      this.contextLost = true;
      e.preventDefault();
    });

    canvas.addEventListener('webglcontextrestored', () => {
      this.contextLost = false;
      this._init();
      this.emit('webglcontextrestored', this);

      const batch = this._batch;
      const shader = this._shader;
      if (batch) {
        this._batch.enabled = false;
        this._batch = null;
        this._shader = null;
        this.bindPipeline(batch, shader);
      }
    });

    this._init();
  }


  destroy() {
    this._children.forEach(child => child.destroy());
    this._children.clear();
    this.gl.deleteBuffer(this._glBuffer);
    this._glBuffer = null;
    this._buffer = null;
    this._framebuffer = null;
    if (this._batch) {
      this._batch.enabled = null;
      this._batch = null;
    }
    this._shader = null;
    this._lastBoundTexture = null;
    this.gl = null;
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


  createBuffer(size) {
    const glBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, size, gl.DYNAMIC_DRAW);
    return glBuffer;
  }


  deleteBuffer(buffer) {
    this.gl.deleteBuffer(buffer);
  }


  createFramebuffer(glTexture) {
    const gl = this.gl;
    const fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, glTexture, 0);

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Framebuffer error: ${status}`);
    }

    this.gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

    return fb;
  }


  deleteFramebuffer() {
    this.gl.deleteFramebuffer(framebuffer);
  }


  createTexture(source, width, height) {
    width = source?.width ?? width;
    width = source?.height ?? height;
    const gl = this.gl;
    const glTexture = gl.createTexture();
    const isPowerOf2 = (width & (width - 1) === 0) && (height & (height - 1 === 0));

    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    if (source) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }

    if (isPowerOf2) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    gl.bindTexture(gl.TEXTURE_2D, this._lastBoundTexture);

    return glTexture;
  }


  deleteTexture(glTexture) {
    this.gl.deleteTexture(glTexture);
  }


  bindRenderTarget(renderTarget) {
    if (this._batch) {
      this._batch.flush();
    }

    const gl = this.gl;
    if (renderTarget) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget.framebuffer);
      gl.viewport(0, 0, renderTarget.width, renderTarget.height);
      this._framebuffer = renderTarget.framebuffer;
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
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
            gl.disableVertexAttribPointer(oldAttrib.location);
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
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    this.gl = gl;
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
      if (this._batch) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._batch._glBuffer);
      }
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
