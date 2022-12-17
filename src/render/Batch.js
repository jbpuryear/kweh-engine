export default class Batch {
  constructor(renderer, vertexSize, useSharedBuffer = true, bufferSize = 2**16) {
    this.renderer = renderer;
    this.vertexSize = vertexSize;
    this.maxVertices = 0;
    this.vertexCount = 0;
    this.buffer = null;
    this.enabled = false;
    this._sharedBuffer = useSharedBuffer;
    this._bufferSize = bufferSize;
    this._glBuffer = null;

    renderer.on('webglcontextrestored', this._init, this);

    this._init(renderer);
  }


  flush() {
    this.draw();
    this.vertexCount = 0;
  }


  draw() {
    if (!this.enabled) {
      throw new Error('Cannot draw, batch is not enabled');
    }

    if (this.vertexCount > 0) {
      this.renderer._draw(this.vertexCount, this.vertexSize, this.buffer);
    }
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
      this.buffer = renderer._getBuffer();
      this._glBuffer = renderer._getGlBuffer();
    } else {
      this.buffer = new ArrayBuffer(this._bufferSize);
      this._glBuffer = renderer.createBuffer(this.buffer.byteLength);
    }
    this.maxVertices = Math.floor(this.buffer.byteLength / this.vertexSize);
    this.vertexCount = 0;
  }
}
