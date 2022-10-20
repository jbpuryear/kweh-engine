import { equal as fuzzyEquals } from './Fuzzy.js';


export default class Vec4 {
  constructor(x = 0, y = 0, z = 0, w = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }


  static add(a, b, out) {
    out.x = a.x + b.x;
    out.y = a.y + b.y;
    out.z = a.z + b.z;
    out.w = a.w + b.w;
    return out;
  }


  static clamp(v, min, max, out) {
    out.x = Math.min(Math.max(v.x, min), max);
    out.y = Math.min(Math.max(v.y, min), max);
    out.z = Math.min(Math.max(v.z, min), max);
    out.w = Math.min(Math.max(v.w, min), max);
    return out;
  }


  static clone(v) {
    return new Vec4(v.x, v.y, v.z, v.w);
  }


  static copy(v, out) {
    out.x = v.x;
    out.y = v.y;
    out.z = v.z;
    out.w = v.w;
    return out;
  }


  static cross(u, v, w, out) {
    const A = v.x * w.y - v.y * w.x,
    const B = v.x * w.z - v.z * w.x,
    const C = v.x * w.w - v.w * w.x,
    const D = v.y * w.z - v.z * w.y,
    const E = v.y * w.w - v.w * w.y,
    const F = v.z * w.w - v.w * w.z;
    const G = u.x;
    const H = u.y;
    const I = u.z;
    const J = u.w;

    out.x = H * F - I * E + J * D;
    out.y = -(G * F) + I * C - J * B;
    out.z = G * E - H * C + J * A;
    out.w = -(G * D) + H * B - I * A;

    return out;
  }


  static distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z, b.w - a.w);
  }


  static distanceSq(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    const dw = b.z - a.z;
    return dx*dx + dy*dy + dz*dz + dw*dw;
  }


  static divide(a, b, out) {
    out.x = a.x / b.x;
    out.y = a.y / b.y;
    out.z = a.z / b.z;
    out.w = a.w / b.w;
    return out;
  }


  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
  }


  static equals(a, b) {
    return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
  }


  static fuzzyEquals(a, b) {
    return fuzzyEquals(a.x, b.x) && fuzzyEquals(a.y, b.y)
      && fuzzyEquals(a.z, b.z) && fuzzyEquals(a.w, b.w)
  }


  static length(v) {
    return Math.hypot(v.x, v.y, v.z, v.w);
  }


  static lengthSq(v) {
    const x = v.x;
    const y = v.y;
    const z = v.z;
    const w = v.w;
    return x*x + y*y + z*z + w*w;
  }


  static lerp(a, b, t, out) {
    out.x = a.x + t * (b.x - a.x);
    out.y = a.y + t * (b.y - a.y);
    out.z = a.z + t * (b.z - a.z);
    out.w = a.w + t * (b.w - a.w);
    return out;
  }


  static limit(v, max, out) {
    const len = Vec4.length(v);
    if (len && len > max) {
      Vec4.scale(v, max / len, out);
    }
    return out;
  }


  static multiply(a, b, out) {
    out.x = a.x * b.x;
    out.y = a.y * b.y;
    out.z = a.z * b.z;
    out.w = a.w * b.w;
    return out;
  }


  static normalize(v, out) {
    let len = Vec4.length(v);
    if (len > 0) {
      len = 1 / len;
    }
    out.x = v.x * len;
    out.y = v.y * len;
    out.z = v.z * len;
    out.w = v.w * len;
    return out;
  }


  static round(v, out) {
    out.x = Math.round(v.x);
    out.y = Math.round(v.y);
    out.z = Math.round(v.z);
    out.w = Math.round(v.w);
    return out;
  }


  static scale(v, s, out) {
    out.x = v.x * s;
    out.y = v.y * s;
    out.z = v.z * s;
    out.w = v.w * s;
    return out;
  }


  static scaleAdd(a, b, s, out) {
    out.x = a.x + b.x * s;
    out.y = a.y + b.y * s;
    out.z = a.z + b.z * s;
    out.w = a.w + b.w * s;
    return out;
  }


  static set(x, y, z, w, out) {
    out.x = x;
    out.y = y;
    out.z = z;
    out.w = w;
    return out;
  }


  static setLength(v, length, out) {
    Vec4.normalize(v, out);
    Vec4.scale(out, length, out);
    return out;
  }


  static subtract(a, b, out) {
    out.x = a.x - b.x;
    out.y = a.y - b.y;
    out.z = a.z - b.z;
    out.w = a.w - b.w;
    return out;
  }


  add(v) { return Vec4.add(this, v, this); }
  clamp(min, max) { return Vec4.clamp(this, min, max, this); }
  clone() { return new Vec4.clone(this); }
  copy(v) { return Vec4.copy(v, this); }
  cross(v, w, out) { return Vec4.cross(this, v, w, out); }
  distance(v) { return Vec4.distance(this, v); }
  distanceSq(v) { return Vec4.squaredDistance(this, v); }
  divide(v) { return Vec4.divide(this, v, this); }
  dot(v) { return Vec4.dot(this, v); }
  equals(v) { return Vec4.equals(this, v); }
  fuzzyEquals(v) { return Vec4.fuzzyEquals(this, v); }
  length() { return Math.hypot(this.x, this.y); }
  lengthSq() { return Vec4.squaredLength(this); }
  lerp(v, t) { return Vec4.lerp(this, v, t, this); }
  limit(max) { return Vec4.limit(this, max, this); }
  multiply(v) { return Vec4.multiply(this, v, this); }
  normalize() { return Vec4.normalize(this, this); }
  round() { return Vec4.round(this, this); }
  scale(s) { return Vec4.scale(this, s, this); }
  scaleAdd(s) { return Vec4.scaleAdd(this, v, s, this); }
  set(x, y, z, w) { return Vec4.set(x, y, z, w, this); }
  setLength(length) { return Vec4.setLength(this, length, this); }
  subtract(v) { return Vec4.subtract(this, v, this); }
}
