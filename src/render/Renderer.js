import EventEmitter from '../EventEmitter.js';


export default class Renderer extends EventEmitter {
  constructor(canvas, bufferSize = 2**16) {
    super();
    this.canvas = canvas;
    this.gl = null;
    this.contextLost = false;
    this._pipeline = null;
    this._activeAttributes = new Set();
    this._buffer = new ArrayBuffer(bufferSize);
    this._glBuffer = null;
    this._lastBoundTexture = null;
    this._views = new Map([
      [ 'Int8', new Int8Array(this._buffer) ],
      [ 'Uint8', new Uint8Array(this._buffer) ],
      [ 'Uint8Clamped', new Uint8ClampedArray(this._buffer) ],
      [ 'Int16', new Int16Array(this._buffer) ],
      [ 'Uint16', new Uint16Array(this._buffer) ],
      [ 'Int32', new Int32Array(this._buffer) ],
      [ 'Uint32', new Uint32Array(this._buffer) ],
      [ 'Float32', new Float32Array(this._buffer) ],
    ]);

    canvas.addEventListener('webglcontextlost', (e) => {
      this.contextLost = true;
      e.preventDefault();
    });

    canvas.addEventListener('webglcontextrestored', () => {
      this.contextLost = false;
      this._init();
      this.emit('webglcontextrestored', this);

      const pipeline = this._pipeline;
      if (pipeline) {
        pipeline.bufferViews = null;
        this._pipeline = null;
        this.bindPipeline(pipeline);
      }
    });

    this._init();
  }


  destroy() {
    this.clear();
    this.gl.deleteBuffer(this._glBuffer);
    this._buffer = null;
    this._pipeline = null;
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


  createTexture(source) {
    const gl = this.gl;
    const glTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    // Are dimensions powers of 2?
    if ((source.width & (source.width - 1) === 0) && (source.height & (source.height - 1 === 0))) {
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


  bindPipeline(pipeline) {
    const gl = this.gl;

    if (this._pipeline) {
      this._pipeline.flush();
      this._pipeline.bufferViews = null;
    }

    if (this._pipeline?.program !== pipeline.program) {
      gl.useProgram(pipeline.program);

      this._activeAttributes.clear();
      for (const attrib of pipeline.attributes) {
        gl.enableVertexAttribArray(attrib.location);
        gl.vertexAttribPointer(attrib.location, attrib.size, attrib.type, attrib.normalized,
          pipeline.vertexSize, attrib.offset);
        this._activeAttributes.add(attrib.location);
      }

      if (this._pipeline) {
        for (const oldAttrib of this._pipeline.attributes) {
          if (!this._activeAttributes.has(oldAttrib.location)) {
            gl.disableVertexAttribPointer(oldAttrib.location);
          }
        }
      }
    }

    this._pipeline = pipeline;
    pipeline.bufferViews = this._views;
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

    this._glBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._glBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this._buffer.byteLength, gl.DYNAMIC_DRAW);

    this.gl = gl;
    this._activeAttributes.clear();
  }


  _draw(count, vertexSize) {
    const gl = this.gl;
    const bytes = count * vertexSize;
    if (bytes === this._buffer.byteLength) {
      gl.bufferData(gl.ARRAY_BUFFER, 0, this._buffer);
    } else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._buffer, 0, bytes);
    }
    gl.drawArrays(gl.TRIANGLES, 0, count);
  }
}
