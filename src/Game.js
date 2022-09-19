import EventEmitter from './EventEmitter.js';


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
    this._stepsThisSec = 0;
    this._lastFpsUpdate = 0;
    this._paused = false;
    this._blurred = !document.hasFocus();
    this._hidden = document.visibilityState === 'hidden';
    this.canvas = canvas;
    this.events = new EventEmitter();
    this.fps = 1000 / this._fixedTime;

    window.addEventListener('blur', () => {
      this._blurred = true;
      this._stop();
    });
    window.addEventListener('focus', () => {
      this._blurred = false;
      this._start();
    });
    window.addEventListener('visibilitychange', () => {
      const visible = document.visibilityState === 'visible';
      this._hidden = !visible;
      if (visible) {
        this._start();
      } else {
        this._stop();
      }
    });
  }


  start() {
    this._paused = false;
    this._start();
  }


  stop() {
    this._paused = true;
    this._stop();
  }


  _start() {
    if (this._rafID || this._paused || this._blurred || this._hidden) { return; }
    this._lastStep = performance.now();
    this._accumulator = 0;
    this._smoothDelta = this._fixedTime;
    this._nextFpsUpdate = this._lastStep + 1000;
    this._stepsThisSec = 0;
    this._rafID = requestAnimationFrame(now => this.step(now));
    this.events.emit('started');
  }


  _stop() {
    if (this._rafID) {
      this.events.emit('stopped');
      cancelAnimationFrame(this._rafID);
      this._rafID = 0;
    }
  }


  step(now) {
    this._stepsThisSec += 1;
    if (now >= this._lastFpsUpdate + 1000) {
      this.fps = (this._stepsThisSec * 1000) / (now - this._lastFpsUpdate);
      this._stepsThisSec = 0;
      this._lastFpsUpdate = now;
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
      this.fixedUpdate(fixed);
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
