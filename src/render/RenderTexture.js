import { RENDERER_CONTEXT_RESTORE } from './Renderer.js';
import Texture from './Texture.js';


export default class RenderTexture extends Texture {
  constructor(renderer, width, height, depth = false, stencil = false) {
    super(renderer, null, width, height);
    this.framebuffer = null;
    this.depth = depth;
    this.stencil = stencil;
    this.glDepth = null;
    this.glStencil = null;

    this.renderer.on(RENDERER_CONTEXT_RESTORE, this._init, this);
    this._init(renderer);
  }


  destroy() {
    this.renderer.off(RENDERER_CONTEXT_RESTORE, this._init, this);
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
    let stencil = null;
    if (this.depth) {
      zBuffer = gl.createRenderbuffer();
      if (this.stencil) {
        stencil = zBuffer;
        gl.bindRenderbuffer(gl.RENDERBUFFER, zBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.width, this.height);
      } else {
        gl.bindRenderbuffer(gl.RENDERBUFFER, zBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
      }
      this.glDepth = zBuffer;
      this.glStencil = stencil;
    }
    this.framebuffer = renderer.createFramebuffer(this.glTexture, zBuffer, stencil);
  }
}
