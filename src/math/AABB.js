// Contains, overlaps fails with negative widths, heights
export default class AABB {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }


  static contains(aabb, x, y) {
    return (
      aabb.x <= x &&
      aabb.x + aabb.width > x &&
      aabb.y <= y &&
      aabb.y + aabb.height > y
    );
  }


  static copy(aabb, out) {
    out.x = aabb.x;
    out.y = aabb.y;
    out.width = aabb.width;
    out.height = aabb.height;
    return out;
  }


  static expand(aabb, x, y, out) {
    out.x = aabb.x - x;
    out.y = aabb.y - y;
    out.width = aabb.width + x * 2;
    out.height = aabb.height + y * 2;
    return out;
  }


  static getRandomPoint(aabb, out) {
    out.x = aabb.x + Math.random() * aabb.width;
    out.y = aabb.y + Math.random() * aabb.height;
    return out;
  }


  static merge(a, b, out) {
    out.x = Math.min(a.x, b.x);
    out.y = Math.min(a.y, b.y);
    out.width = Math.max(a.x + a.width, b.x + b.width) - out.x;
    out.height = Math.max(a.y + a.height, b.y + b.height) - out.y;
    return out;
  }


  static mergePoint(aabb, x, y, out) {
    const x0 = Math.min(aabb.x, x);
    const x1 = Math.max(aabb.x + aabb.width, x);
    const y0 = Math.min(aabb.y, y);
    const y1 = Math.max(aabb.y + aabb.height, y);
    return AABB.set(out, x0, y0, x1 - x0, y1 - y0);
  }


  static overlaps(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }


  static set(aabb, x, y, w, h) {
    aabb.x = x;
    aabb.y = y;
    aabb.width = w;
    aabb.height = h;
    return aabb;
  }


  contains(x, y) { return AABB.contains(this, x, y); }
  copy(aabb) { return AABB.copy(aabb, this); }
  expand(x, y) { return AABB.expand(this, x, y, this); }
  getRandomPoint(v) { return AABB.getRandomPoint(this, v); }
  overlaps(aabb) { return AABB.overlaps(this, aabb); }
  merge(aabb) { return AABB.merge(this, aabb, this); }
  mergePoint(x, y) { return AABB.mergePoint(this, x, y, this); }
  set(x, y, w, h) { return AABB.set(this, x, y, w, h); }

  left() { return this.x; }
  right() { return this.x + this.width; }
  top() { return this.y; }
  bottom() { return this.y + this.height }
}
