import Frame from './Frame.js';


export default class Texture {
  constructor(renderer, source) {
    this.renderer = renderer;
    this.source = source;
    this.glTexture = null;
    this.glUnit = -1;
    this.frames = new Map();

    renderer.on('webglcontextrestored', this._init, this);

    this._init(renderer);
  }


  destroy() {
    this.renderer.off('webglcontextrestored', this._init, this);
    this.renderer.deleteTexture(this.glTexture);
    this.source = null;
  }


  addFrame(key, x, y, width, height) {
    const frame = new Frame(this, x, y, width, height);
    this.frames.set(key, frame);
    return frame;
  }


  _init(renderer) {
    this.glTexture = renderer.createTexture(this.source);
    this.glUnit = -1;
  }
}
