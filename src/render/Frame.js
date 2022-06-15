export default class Frame {
  constructor(texture, x, y, width, height) {
    const sWidth = texture.source.width;
    const sHeight = texture.source.height;
    this.texture = texture;
    this.u0 = x / sWidth;
    this.v0 = y / sHeight;
    this.u1 = (x + width) / sWidth;
    this.v1 = (y + height) / sHeight;
    this._sourceWidth = sWidth;
    this._sourceHeight = sHeight;
  }


  set(x, y, width, height) {
    this.u0 = x / this._sourceWidth;
    this.v0 = y / this._sourceHeight;
    this.u1 = (x + width) / this._sourceWidth;
    this.v1 = (y + height) / this._sourceHeight;
  }


  setUV(u0, v0, u1, v1) {
    this.u0 = u0;
    this.v0 = v0;
    this.u1 = u1;
    this.v1 = v1;
  }


  get x() {
    return this.u0 * this._sourceWidth;
  }


  set x(val) {
    this.u0 = val / this._sourceWidth;
  }


  get y() {
    return this.v0 * this._sourceHeight;
  }


  set y(val) {
    this.v0 = val / this._sourceHeight;
  }


  get width() {
    return (this.u1 - this.u0) * this._sourceWidth;
  }


  set width(val) {
    this.u1 = this.u0 + val / this._sourceWidth;
  }


  get height() {
    return (this.v1 - this.v0) * this._sourceHeight;
  }


  set height(val) {
    this.v1 = this.v0 + val / this._sourceHeight;
  }
}
