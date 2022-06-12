export default class AbstractBatch {
  constructor(renderer, vertexSize, maxVertices = 2048 * 6) {
    this.vbo = null;
    this.renderer = renderer;
    this.vertexSize = vertexSize;
    this.maxVertices = maxVertices;
    this.vertexData = new ArrayBuffer(maxVertices * vertexSize);
    this.vertexCount = 0;
    this._enabled = false;

    renderer.on('webglcontextrestored', this._init, this);

    this._init(renderer);
  }


  destroy() {
    this.renderer.deleteVertexBuffer(this.vbo);
    this.renderer = null;
    this.vbo = null;
    this.vertexData = null;
  }


  flush() {
    if (!this._enabled) {
      throw new Error('Cannot flush, batch is not enabled');
    }

    const count = this.vertexCount;
    if (count === 0) { return false; }
    this.vertexCount = 0;

    if (count >= this.maxVertices) {
      this.renderer._draw(this.vertexData, count, this.renderer.gl.TRIANGLES);
    } else {
      const subArray = new Uint8Array(this.vertexData, 0, count * this.vertexSize);
      this.renderer._draw(subArray, count, this.renderer.gl.TRIANGLES);
    }

    return true;
  }


  shouldFlush(vertCount) {
    return this.vertexCount + vertCount > this.maxVertices;
  }


  _init(renderer) {
    this.renderer = renderer;
    this.vbo = renderer.createVertexBuffer(this.vertexData.byteLength, renderer.gl.DYNAMIC_DRAW);
  }
}
