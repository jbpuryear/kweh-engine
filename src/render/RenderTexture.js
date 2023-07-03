import Texture from './Texture.js';


export default class RenderTexture extends Texture {
  constructor(renderer, width, height, depth = false) {
    super(renderer, null, width, height);
    this.framebuffer = null;
    this.depth = depth;
    this.glDepth = null;

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
    const gl = renderer.gl;
    let zBuffer = null;
    if (this.depth) {
      zBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, zBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
      this.glDepth = zBuffer;
    }
    this.framebuffer = renderer.createFramebuffer(this.glTexture, zBuffer);
  }
}
