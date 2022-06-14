import Attribute from './Attribute.js';


export default class Pipeline {
  constructor(renderer, vSource, fSource, vertexSize, attributes) {
    this.renderer = renderer;
    this.vertexSource = vSource;
    this.fragmentSource = fSource;
    this.program = null;
    this.attributes = attributes.map(attrib => Object.assign(new Attribute(), attrib));
    this.vertexSize = vertexSize;
    this.maxVertices = 0;
    this.vertexCount = 0;
    this.bufferViews = null;

    renderer.on('webglcontextrestored', this._init, this);

    this._init(renderer);
  }


  destroy() {
    this.renderer.deleteProgram(this.program);
    this.renderer = null;
    this.program = null;
  }


  flush() {
    if (!this.bufferViews) {
      throw new Error('Cannot flush, batch is not enabled');
    }

    const count = this.vertexCount;
    if (count === 0) { return false; }
    this.vertexCount = 0;

    this.renderer._draw(count, this.vertexSize);
    return true;
  }


  shouldFlush(vertCount) {
    return this.vertexCount + vertCount > this.maxVertices;
  }


  _init(renderer) {
    const program = renderer.createProgram(this.vertexSource, this.fragmentSource);
    this.program = program;

    for (const attrib of this.attributes) {
      attrib.location = renderer.gl.getAttribLocation(program, attrib.name);
    }

    this.maxVertices = Math.floor(renderer._buffer.byteLength / this.vertexSize);
    this.vertexCount = 0;
  }
}
