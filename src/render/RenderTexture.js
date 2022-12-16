import Texture from './Texture.js';


export default class RenderTexture extends Texture {
  constructor(renderer, width, height) {
    super(renderer, null, width, height);
    this.framebuffer = null;

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
    super._init(renderer);
    this.framebuffer = renderer.createFramebuffer(this.glTexture);
  }
}
