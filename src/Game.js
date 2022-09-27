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
    this._paused = true;
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
    const fixed = this._fixedTime;

    let dt = now - this._lastStep;
    this._lastStep = now;

    const smooth = Math.pow(0.9, fixed * 60 / 1000);
    this.fps = 1000 / dt * (1 - smooth) + this.fps * smooth;

    // It's possible for the browser to give a negative time delta.
    dt = Math.max(0, Math.min(dt, this._maxFrameTime));

    let acc = this._accumulator + dt;
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
