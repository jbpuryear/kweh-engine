export default class Batch {
  constructor(renderer, vertexSize, useSharedBuffer = true, bufferSize = 2**16) {
    this.renderer = renderer;
    this.vertexSize = vertexSize;
    this.maxVertices = 0;
    this.vertexCount = 0;
    this.buffer = null;
    this.enabled = false;
    this._sharedBuffer = useSharedBuffer;
    this._glBuffer = null;

    renderer.on('webglcontextrestored', this._init, this);

    if (useSharedBuffer) {
      this.buffer = renderer._getBuffer();
    } else {
      this.buffer = new ArrayBuffer(bufferSize);
    }

    this._init(renderer);
  }


  flush() {
    if (!this.enabled) {
      throw new Error('Cannot flush, batch is not enabled');
    }

    const count = this.vertexCount;
    if (count === 0) { return false; }
    this.vertexCount = 0;

    this.renderer._draw(count, this.vertexSize, this.buffer);
    return true;
  }


  shouldFlush(vertCount) {
    return this.vertexCount + vertCount > this.maxVertices;
  }


  destroy() {
    this.renderer.off('webglcontextrestored', this._init, this);
    this.buffer = null;
    if (!this._sharedBuffer) {
      this.renderer.deleteBuffer(this._glBuffer);
      this._glBuffer = null;
    }
    this.renderer = null;
  }


  _init(renderer) {
    if (this._sharedBuffer) {
      this._glBuffer = renderer._getGlBuffer();
    } else {
      this._glBuffer = renderer.createBuffer(this.buffer.byteLength);
    }
    this.maxVertices = Math.floor(this.buffer.byteLength / this.vertexSize);
    this.vertexCount = 0;
  }
}