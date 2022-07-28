export default class AABB {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this._width = width;
    this._height = height;
  }


  get width() { return this._width; }
  set width(w) { this._width = Math.max(0, w); }


  get height() { return this._height; }
  set height(h) { this._height = Math.max(0, h); }


  contains(x, y) {
    return (
      this.x <= x &&
      this.x + this.width >= x &&
      this.y <= y &&
      this.y + this.height >= y
    );
  }


  overlaps(aabb) {
    return (
      this.x <= aabb.x + aabb.width &&
      this.x + this.width >= aabb.x &&
      this.y <= aabb.y + aabb.height &&
      this.y + this.height >= aabb.y
    );
  }


  set(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }
}
