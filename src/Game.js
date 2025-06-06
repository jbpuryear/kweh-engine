import EventEmitter from './EventEmitter.js';


export const GAME_START = Symbol('game start');
export const GAME_STOP = Symbol('game stop');
export const GAME_PAUSE = Symbol('game pause');
export const GAME_RESUME = Symbol('game resume');


class Time {
  constructor() {
    this.total = 0;
    this.delta = 0;
    this.frameFract = 0;
    this.gameTotal = 0;
    this.gameDelta = 0;
    this.gameFrameFract = 0;
  }
}


export default class Game {
  constructor(width = 400, height = 300) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    this._time = new Time();
    this._acc = 0;
    this._rafID = 0;
    this._fixedStep = 1 / 60;
    this._maxFrameTime = this._fixedStep * 10;
    this._lastStep = 0;
    this._accumulator = 0;
    this._stopped = true;
    this._paused = false;
    this._reqPause = false;
    this._reqResume = false;
    this._blurred = !document.hasFocus();
    this._hidden = document.visibilityState === 'hidden';
    this.canvas = canvas;
    this.events = new EventEmitter();
    this.fps = 1 / this._fixedStep;

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
    this._stopped = false;
    this._start();
  }


  stop() {
    this._stopped = true;
    this._stop();
  }


  pause() {
    this._reqPause = true;
  }


  resume() {
    this._reqResume = true;
  }


  isPaused() {
    return this._paused || this._pauseReq;
  }


  _start() {
    if (this._rafID || this._stopped || this._blurred || this._hidden) { return; }
    this._lastStep = performance.now();
    this._accumulator = 0;
    this._stepsThisSec = 0;
    this._rafID = requestAnimationFrame(now => this._tick(now));
    this.events.emit(GAME_START);
  }


  _stop() {
    if (this._rafID) {
      this.events.emit(GAME_STOP);
      cancelAnimationFrame(this._rafID);
      this._rafID = 0;
    }
  }


  _tick(now) {
    let dt = (now - this._lastStep) / 1000;
    this._lastStep = now;

    this.fps = 1 / dt * 0.1 + this.fps * 0.9;

    // We can get negative time deltas from things like losing and returning focus,
    // pausing in the debug panel, alerts, and prompts.
    dt = Math.max(0, Math.min(dt, this._maxFrameTime));
    this.step(dt);

    this._rafID = requestAnimationFrame(now => this._tick(now));
  }


  step(dt) {
    if (this._reqPause) {
      if (!this._paused) {
        this.events.emit(GAME_PAUSE);
        this._paused = true;
      }
      this._reqPause = false;
    }
    if (this._reqResume) {
      if (this._paused) {
        this.events.emit(GAME_RESUME);
        this._paused = false;
      }
      this._reqResume = false;
    }
    const time = this._time;
    const fixed = this._fixedStep;
    const gameScale = this._paused ? 0 : 1;

    time.total += dt;
    time.gameTotal += dt * gameScale;

    let acc = this._acc + dt;
    time.delta = fixed;
    time.gameDelta = fixed * gameScale;
    while (acc >= fixed) {
      this.fixedUpdate(time);
      acc -= fixed;
    }
    this._acc = acc;

    time.delta = dt;
    time.gameDelta = dt * gameScale;
    time.frameFract = acc / fixed;
    if (!this._paused) {
      time.gameFrameFract = time.frameFract;
    }

    this.update(time);
    this.render(time);
  }


  fixedUpdate(time) {
  }


  update(time) {
  }


  render(time) {
  }
}
