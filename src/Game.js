import Renderer from './render/Renderer.js';


export default class Game {
  constructor(width = 400, height = 300) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    this._rafID = 0;
    this._fixedTime = 1000 / 60;
    this._maxFrameTime = 200;
    this._lastStep = 0;
    this._accumulator = 0;
    this._smoothDelta = this._fixedTime;
    this._nextFpsUpdate = 0;
    this._stepsThisSec = 0;
    this.canvas = canvas;
    this.renderer = new Renderer(this.canvas);
    this.fps = 1000 / this._fixedTime;
  }


  start() {
    this._lastStep = performance.now();
    this._accumulator = 0;
    this._smoothDelta = this._fixedTime;
    this._nextFpsUpdate = this._lastStep + 1000;
    this._stepsThisSec = 0;

    this.rafID = requestAnimationFrame(now => this._step(now));
  }


  step(now) {
    this._stepsThisSec += 1;
    if (now >= this._nextFpsUpdate) {
      this.fps = (this._stepsThisSec * 1000) / (now - this._lastStep);
      this._nextFpsUpdate = now + 1000;
    }
    let dt = now - this._lastStep;
    this._lastStep = now;

    // It's possible for the browser to give a negative time delta.
    dt = Math.max(0, dt);

    if (dt > this._maxFrameTime) {
      dt = Math.min(this._smoothDelta, this._maxFrameTime);
    }

    const smooth = dt * 0.2 + this._smoothDelta * 0.8;
    this._smoothDelta = smooth;

    const fixed = this._fixedTime;
    let acc = this._accumulator + smooth;
    while (acc >= fixed) {
      this.fixedUpdate();
      acc -= fixed;
    }
    this._accumulator = acc;

    this.update(dt);
    this.render(dt, acc/fixed);

    this._rafID = requestAnimationFrame(now => this.step(now));
  }


  fixedUpdate(dt) {
  }


  update(dt) {
  }


  render(dt, alpha) {
  }
}
