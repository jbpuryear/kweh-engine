export default class Texture {
  constructor(renderer, source) {
    this.renderer = renderer;
    this.source = source;
    this.glTexture = null;

    renderer.on('webglcontextrestored', this._init, this);

    this._init(renderer);
  }


  destroy() {
    this.renderer.off('webglcontextrestored', this._init, this);
    this.renderer.deleteTexture(this.glTexture);
    this.source = null;
  }


  _init(renderer) {
    this.glTexture = renderer.createTexture(this.source);
  }
}
