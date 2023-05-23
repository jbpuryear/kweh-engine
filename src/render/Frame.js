export default class Frame {
  constructor(texture, x, y, width, height, offsetX = 0, offsetY = 0, sourceWidth = width, sourceHeight = height) {
    const tWidth = texture.source.width;
    const tHeight = texture.source.height;
    this.texture = texture;
    this.u0 = x / tWidth;
    this.v0 = y / tHeight;
    this.u1 = (x + width) / tWidth;
    this.v1 = (y + height) / tHeight;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.sourceWidth = sourceWidth;
    this.sourceHeight = sourceHeight;
    this._texWidth = tWidth;
    this._texHeight = tHeight;
  }


  set(x, y, width, height) {
    this.u0 = x / this._texWidth;
    this.v0 = y / this._texHeight;
    this.u1 = (x + width) / this._texWidth;
    this.v1 = (y + height) / this._texHeight;
  }


  setUV(u0, v0, u1, v1) {
    this.u0 = u0;
    this.v0 = v0;
    this.u1 = u1;
    this.v1 = v1;
  }


  get x() {
    return this.u0 * this._texWidth;
  }


  set x(val) {
    this.u0 = val / this._texWidth;
  }


  get y() {
    return this.v0 * this._texHeight;
  }


  set y(val) {
    this.v0 = val / this._texHeight;
  }


  get width() {
    return (this.u1 - this.u0) * this._texWidth;
  }


  set width(val) {
    this.u1 = this.u0 + val / this._texWidth;
  }


  get height() {
    return (this.v1 - this.v0) * this._texHeight;
  }


  set height(val) {
    this.v1 = this.v0 + val / this._texHeight;
  }
}
