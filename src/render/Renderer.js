import EventEmitter from '../EventEmitter.js';


export default class Renderer extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.gl;
    this.contextLost = false;
    this._batch = null;
    this._shader = null;
    this._vbo = null;
    this._program = null;
    this._attributes = null;
    this._activeAttributes = new Set();

    canvas.addEventListener('webglcontextlost', (e) => {
      this.contextLost = true;
      e.preventDefault();
    });
    canvas.addEventListener('webglcontextrestored', () => {
      this.contextLost = false;
      this._init();
      this.emit('webglcontextrestored', this);
    });

    this._init();
  }


  destroy() {
    this.clear();
    this.gl = null;
    this._batch = null;
    this._shader = null;
    this._vbo = null;
    this._program = null;
    this._attributes = null;
  }


  createVertexBuffer(dataOrSize, usage) {
    const gl = this.gl;
    const prev = this._vbo;
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, dataOrSize, usage);
    gl.bindBuffer(gl.ARRAY_BUFFER, prev);
    return vbo;
  }


  deleteVertexBuffer(vbo) {
    this.gl.deleteBuffer(vbo);
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


  enableBatch(batch, shader) {
    if (shader.vertexSize > batch.vertexSize) {
      throw new Error('Incompatible Batch and Shader vertex size.');
    }
    const gl = this.gl;

    if (this._batch) {
      this._batch.flush();
      this._batch._enabled = false;
    }

    let setPointers = false;
    if (this._vbo !== batch.vbo) {
      gl.bindBuffer(gl.ARRAY_BUFFER, batch.vbo);
      setPointers = true;
    }

    if (this._program !== shader.program) {
      gl.useProgram(shader.program);
      setPointers = true;
    }

    if (setPointers) {
      this._activeAttributes.clear();
      for (const attrib of shader.attributes) {
        gl.enableVertexAttribArray(attrib.location);
        gl.vertexAttribPointer(attrib.location, attrib.size, attrib.type, attrib.normalized,
          batch.vertexSize, attrib.offset);
        this._activeAttributes.add(attrib.location);
      }

      if (this._attributes) {
        for (const oldAttrib of this._attributes) {
          if (!this._activeAttributes.has(oldAttrib.location)) {
            gl.disableVertexAttribPointer(oldAttrib.location);
          }
        }
      }
    }

    this._batch = batch;
    this._shader = shader;
    this._vbo = batch.vbo;
    this._program = shader.program;
    this._attributes = shader.attributes;

    this._batch._enabled = true;
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
    this.gl = gl;

    if (this._batch) {
      this._batch.enabled = false;
    }
    this._batch = null;
    this._shader = null;
    this._activeAttributes.clear();
  }


  _draw(buffer, count, topology) {
    const gl = this.gl;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, buffer);
    gl.drawArrays(topology, 0, count);
  }
}
