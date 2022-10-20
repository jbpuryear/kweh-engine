import { equal as fuzzyEquals } from './Fuzzy.js';


export default class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }


  static add(a, b, out) {
    out.x = a.x + b.x;
    out.y = a.y + b.y;
    return out;
  }


  static angle(v) {
    return Math.atan2(v.y, v.x);
  }


  static angleTo(a, b) {
    const x1 = a.x;
    const x2 = b.x;
    const y1 = a.y;
    const y2 = b.y;
    const mag = Math.sqrt(x1*x1 + y1*y1) * Math.sqrt(x2*x2 + y2*y2);
    const cos = mag && (x1 * x2 + y1 * y2) / mag;    //short circuits if mag == 0
    return Math.acos(Math.min(Math.max(cos, -1), 1));
  }


  static clamp(v, min, max, out) {
    out.x = Math.min(Math.max(v.x, min), max);
    out.y = Math.min(Math.max(v.y, min), max);
    return out;
  }


  static clone(v) {
    return new Vec2(v.x, v.y);
  }


  static copy(v, out) {
    out.x = v.x;
    out.y = v.y;
    return out;
  }


  static cross(a, b, out) {
    out.x = 0;
    out.y = 0;
    out.z = a.x * b.y - a.y * b.x;
    return out;
  }


  static distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }


  static distanceSq(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx*dx + dy*dy;
  }


  static divide(a, b, out) {
    out.x = a.x / b.x;
    out.y = a.y / b.y;
    return out;
  }


  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }


  static equals(a, b) {
    return a.x === b.x && a.y === b.y;
  }


  static fuzzyEquals(a, b) {
    return fuzzyEquals(a.x, b.x) && fuzzyEquals(a.y, b.y);
  }


  static getRandomPoint(v, out) {
    out.x = v.x;
    out.y = v.y;
    return out;
  }


  static length(v) {
    return Math.hypot(v.x, v.y);
  }


  static lengthSq(v) {
    return v.x*v.x + v.y*v.y;
  }


  static lerp(a, b, t, out) {
    out.x = a.x + t * (b.x - a.x);
    out.y = a.y + t * (b.y - a.y);
    return out;
  }


  static limit(v, max, out) {
    const len = Vec2.length(v);
    if (len && len > max) {
      Vec2.scale(v, max / len, out);
    }
    return out;
  }


  static multiply(a, b, out) {
    out.x = a.x * b.x;
    out.y = a.y * b.y;
    return out;
  }


  static normalize(v, out) {
    let len = Vec2.length(v);
    if (len > 0) {
      len = 1 / len;
    }
    out.x = v.x * len;
    out.y = v.y * len;
    return out;
  }


  static round(v, out) {
    out.x = Math.round(v.x);
    out.y = Math.round(v.y);
    return out;
  }


  static scale(v, s, out) {
    out.x = v.x * s;
    out.y = v.y * s;
    return out;
  }


  static scaleAdd(a, b, s, out) {
    out.x = a.x + b.x * s;
    out.y = a.y + b.y * s;
    return out;
  }


  static set(x, y, out) {
    out.x = x;
    out.y = y;
    return out;
  }


  static setLength(v, length, out) {
    Vec2.normalize(v, out);
    Vec2.scale(out, length, out);
    return out;
  }


  static subtract(a, b, out) {
    out.x = a.x - b.x;
    out.y = a.y - b.y;
    return out;
  }


  add(v) { return Vec2.add(this, v, this); }
  angle() { return Math.atan2(this.y, this.x); }
  angleTo(v) { return Vec2.angleTo(this, v); }
  clamp(min, max) { return Vec2.clamp(this, min, max, this); }
  clone() { return new Vec2(this.x, this.y); }
  copy(v) { return Vec2.copy(v, this); }
  cross(v, out) { return Vec2.cross(this, v, out); }
  distance(v) { return Vec2.distance(this, v); }
  distanceSq(v) { return Vec2.squaredDistance(this, v); }
  divide(v) { return Vec2.divide(this, v, this); }
  dot(v) { return Vec2.dot(this, v); }
  equals(v) { return Vec2.equals(this, v); }
  fuzzyEquals(v) { return Vec2.fuzzyEquals(this, v); }
  getRandomPoint(out) { return Vec2.getRandomPoint(this, out, out); }
  length() { return Math.hypot(this.x, this.y); }
  lengthSq() { return Vec2.squaredLength(this); }
  lerp(v, t) { return Vec2.lerp(this, v, t, this); }
  limit(max) { return Vec2.limit(this, max, this); }
  multiply(v) { return Vec2.multiply(this, v, this); }
  normalize() { return Vec2.normalize(this, this); }
  round() { return Vec2.round(this, this); }
  scale(s) { return Vec2.scale(this, s, this); }
  scaleAdd(s) { return Vec2.scaleAdd(this, v, s, this); }
  set(x, y) { return Vec2.set(x, y, this); }
  setLength(length) { return Vec2.setLength(this, length, this); }
  subtract(v) { return Vec2.subtract(this, v, this); }
}
