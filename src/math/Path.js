import Vec2 from './Vec2.js';


export default class Path {
  constructor(points = []) {
    this.points = points;
    this.length = 0;
    this._intervals = [];

    for (let i = 1; i < points.length; i += 1) {
      this.length += Vec2.distance(points[i - 1], points[i]);
    }

    this._intervals.push(0);
    for (let i = 1, t = 0; i < points.length; i += 1) {
      t += Vec2.distance(points[i - 1], points[i]) /  this.length;
      this._intervals.push(t);
    }
    // Guard against floating point errors
    this._intervals[this.points.length - 1] = 1;
  }


  interpolate(t, out) {
    t = Math.min(1, Math.max(-1, t));
    const points = this.points;
    const ints = this._intervals;

    if (t < 0) {
      t = -t;
    }

    let i = 0;
    while (t >= ints[i + 1]) {
      i += 1;
    }

    t -= ints[i];
    return Vec2.lerp(points[i], points[i + 1], t / (ints[i + 1] - ints[i]), out);
  }
}
