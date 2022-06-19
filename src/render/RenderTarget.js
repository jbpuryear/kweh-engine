export default class RenderTarget {
  constructor(renderer, width, height) {
    this.renderer = renderer;
    this.width = width;
    this.height = height;
    this.framebuffer = null;
    this.texture = null;

    this.renderer.on('webglcontextrestored', this._init, this);

    this._init(renderer);
  }


  destroy() {
    this.renderer.off('webglcontextrestored', this._init, this);
    this.renderer.deleteTexture(this.texture);
    this.renderer.deleteFramebuffer(this.framebuffer);
    this.renderer = null;
    this.texture = null;
    this.framebuffer = null;
  }


  _init(renderer) {
    this.texture = renderer.createTexture(null, this.width, this.height);
    this.framebuffer = renderer.createFramebuffer(this.texture);
  }
}
