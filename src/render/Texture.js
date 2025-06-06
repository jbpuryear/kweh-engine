import { RENDERER_CONTEXT_RESTORE } from './Renderer.js';
import Frame from './Frame.js';


export default class Texture {
  constructor(renderer, source, width, height, nearestMin = false, nearestMag = false, nearestMip = false) {
    this.renderer = renderer;
    this.source = source;
    this.width = source?.width ?? width;
    this.height = source?.height ?? height;
    this.glTexture = null;
    this.glUnit = -1;
    this.frames = new Map();
    this.key = '';
    this._nearestMin = nearestMin;
    this._nearestMag = nearestMag;
    this._nearestMip = nearestMip;

    renderer.on(RENDERER_CONTEXT_RESTORE, this._init, this);

    this._init(renderer);
  }


  destroy() {
    const renderer = this.renderer;
    if (this.glUnit !== -1) { renderer.unbindTexture(this.glUnit); }
    renderer.off(RENDERER_CONTEXT_RESTORE, this._init, this);
    renderer.deleteTexture(this.glTexture);
    this.source = null;
    this.width = 0;
    this.height = 0;
    this.glTexture = null;
    this.glUnit = -1;
    this.frames.clear();
  }


  addFrame(key, x, y, width, height, offsetX = 0, offsetY = 0, sourceWidth = width, sourceHeight = height) {
    const frame = new Frame(this, x, y, width, height, offsetX, offsetY, sourceWidth, sourceHeight);
    this.frames.set(key, frame);
    return frame;
  }


  _init(renderer) {
    this.glTexture = renderer.createTexture(this.source, this.width, this.height,
      this._nearestMin, this._nearestMag, this._nearestMip);
    this.glUnit = -1;
  }
}
