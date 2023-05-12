import { circle as overlaps } from './Overlaps.js';


export default class Circle {
  constructor(x = 0, y = 0, radius = 1) {
    this.x = x;
    this.y = y;
    this.radius = radius;
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
    const r = circle.radius * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    out.x = circle.x + r * Math.cos(theta);
    out.y = circle.y + r * Math.sin(theta);
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
  overlaps(circle) { return Overlaps.circle(this, circle); }
  set(x, y, radius) { return Circle.set(this, x, y, radius); }
}

