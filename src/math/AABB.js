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
    return this;
  }


  contains(x, y) { return AABB.contains(this, x, y); }
  copy(aabb) { return AABB.copy(aabb, this); }
  overlaps(aabb) { return AABB.overlaps(this, aabb); }
  set(x, y, w, h) { return AABB.set(this, x, y, w, h); }
}
