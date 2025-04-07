import EventEmitter from './EventEmitter.js';


export default class Game {
  constructor(width = 400, height = 300) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    this._rafID = 0;
    this._fixedTime = 1 / 60;
    this._maxFrameTime = this._fixedTime * 10;
    this._lastStep = 0;
    this._accumulator = 0;
    this._paused = true;
    this._blurred = !document.hasFocus();
    this._hidden = document.visibilityState === 'hidden';
    this._totalTime = 0;
    this._totalFixedTime = 0;
    this.canvas = canvas;
    this.events = new EventEmitter();
    this.fps = 1 / this._fixedTime;

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

    let dt = (now - this._lastStep) / 1000;
    this._lastStep = now;

    this.fps = 1 / dt * 0.1 + this.fps * 0.9;

    // We can get negative time deltas from things like losing and returning focus,
    // pausing in the debug panel, alerts, and prompts.
    dt = Math.max(0, Math.min(dt, this._maxFrameTime));
    this._totalTime += dt;
    let acc = this._accumulator + dt;
    while (acc >= fixed) {
      this._totalFixedTime += fixed;
      this.fixedUpdate(fixed, this._totalFixedTime);
      acc -= fixed;
    }
    this._accumulator = acc;

    this.update(dt, this._totalTime);
    this.render(dt, this._totalTime, acc/fixed);

    this._rafID = requestAnimationFrame(now => this.step(now));
  }


  fixedUpdate(dt, time) {
  }


  update(dt, time) {
  }


  render(dt, time, lerp) {
  }
}
