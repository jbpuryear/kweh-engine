import { circle as overlaps } from './Overlaps.js';


export default class Circle {
  constructor(x = 0, y = 0, radius = 1) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.length = radius * 2 * Math.PI;
  }


  static contains(circle, x, y) {
    const dx = circle.x - x;
    const dy = circle.y - y;
    return dx*dx + dy*dy <= circle.radius * circle.radius;
  }


  static copy(circle, out) {
    out.x = circle.x;
    out.y = circle.y;
    out.radius = circle.radius;
    return out;
  }


  static getRandomPoint(circle, out) {
    const r = circle.radius * Math.random();
    const theta = Math.random() * 2 * Math.PI;
    out.x = circle.x + r * Math.cos(theta);
    out.y = circle.y + r * Math.sin(theta);
    return out;
  }


  static interpolate(circle, t, out) {
    t = Math.min(1, Math.max(-1, t));
    if (t < 0) {
      t = -t;
    }
    const angle = Math.PI * 2 * t;
    const r = circle.radius;
    out.set(circle.x + Math.cos(angle) * r, circle.y + Math.sin(angle) * r);
    return out;
  }


  static overlaps(a, b) {
    return overlaps(a, b);
  }


  static set(circle, x, y, radius) {
    circle.x = x;
    circle.y = y;
    circle.radius = radius;
    return circle;
  }


  contains(x, y) { return Circle.contains(this, x, y); }
  copy(circle) { return Circle.copy(circle, this); }
  getRandomPoint(v) { return Circle.getRandomPoint(this, v); }
  interpolate(t, out) { return Circle.interpolate(this, t, out); }
  overlaps(circle) { return overlaps(this, circle); }
  set(x, y, radius) { return Circle.set(this, x, y, radius); }

  left() { return this.x - this.radius; }
  right() { return this.x + this.radius; }
  top() { return this.y - this.radius; }
  bottom() { return this.y + this.radius; }
}

