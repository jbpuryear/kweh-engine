import { RENDERER_CONTEXT_RESTORE } from './Renderer.js';


export default class StaticBatch {
  constructor(renderer, vertexSize, buffer) {
    this.renderer = renderer;
    this.vertexSize = vertexSize;
    this.vertexCount = buffer.byteLength / vertexSize;
    this.enabled = false;
    this._buffer = buffer;
    this._glBuffer = null;

    renderer.on(RENDERER_CONTEXT_RESTORE, this._init, this);

    this._init(renderer);
  }


  flush() {}


  draw() {
    if (!this.enabled) {
      throw new Error('Cannot draw, batch is not enabled');
    }

    const gl = this.renderer.gl;
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
  }


  destroy() {
    this.renderer.off(RENDERER_CONTEXT_RESTORE, this._init, this);
    this.renderer.deleteBuffer(this._glBuffer);
    this._buffer = null;
    this._glBuffer = null;
    this.renderer = null;
  }


  _init(renderer) {
    this._glBuffer = renderer.createBuffer(this._buffer, renderer.gl.STATIC_DRAW);
  }
}
