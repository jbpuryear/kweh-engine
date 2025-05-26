import { linear } from './math/Ease.js';


export class ActionManager {
  constructor() {
    this.actions = new Set();
  }


  start(action) {
    action.reset();
    this.actions.add(action);
  }


  stop(action) {
    this.actions.delete(action);
  }


  stopAll() {
    this.actions.clear();
  }


  update(dt) {
    for (const action of this.actions) {
      if (action.update(dt)) {
        this.actions.delete(action);
      }
    }
  }
}


export class Action {
  constructor() {
    this.complete = false;
  }


  update(dt) {
    return this.complete = true;
  }


  reset() {
    this.complete = false;
  }
}


export class All extends Action {
  constructor(actions) {
    super();
    this.actions = actions;
  }


  update(dt) {
    let complete = true;
    for (const action of this.actions) {
      if (!action.complete && !action.update(dt)) {
        complete = false;
      }
    }
    this.complete = complete;
    return complete;
  }


  reset() {
    super.reset();
    for (const action of this.actions) {
      action.reset();
    }
  }
}


export class Animation extends Action {
  constructor(target, property, conf = null, loop = false) {
    super();
    this.target = target;
    this.property = property;
    this.loop = loop;
    this._conf = conf;
    this._accumulator = 0;
    this._index = 0;
  }


  play(conf, loop = false, restart = false) {
    if (!this.complete && conf === this._conf && !restart) {
      return;
    }
    this.loop = loop;
    this.complete = false;
    this._conf = conf;
    this._accumulator = 0;
    this._index = 0;
  }


  update(dt) {
    if (this.complete) {
      return true;
    }

    const conf = this._conf;
    const frameCount = conf.frames.length;
    const loop = this.loop;
    let i = this._index;
    let t = this._accumulator + dt;
    while (t >= conf.durations[i]) {
      t -= conf.durations[i];
      i += 1;
      if (i >= frameCount) {
        if (loop) {
          i = i % frameCount;
        } else {
          i = frameCount - 1;
          this.complete = true;
          break;
        }
      }
    }

    this._accumulator = t;
    this._index = i;
    this.target[this.property] = conf.frames[i];

    return this.complete;
  }


  reset() {
    super.reset();
    this._accumulator = 0;
    this._index = 0;
  }
}


export class AnimationConf {
  constructor(frames = [], durations = []) {
    this.frames = frames;
    this.durations = durations;
    this.key = '';
  }
}


export class Assign extends Action {
  constructor(target, property, value) {
    super();
    this.target = target;
    this.property = property;
    this.value = value;
  }


  update(dt) {
    this.target[this.property] = this.value;
    return this.complete = true;
  }
}


export class Callback extends Action {
  constructor(fn, args = null, ctx = null) {
    super();
    this.func = fn;
    this.args = args;
    this.context = ctx;
  }


  update(dt) {
    this.func.apply(this.context, this.args);
    return this.complete = true;
  }
}


export class AsyncCallback extends Action {
  constructor(fn, args = null, ctx = null) {
    super();
    this.func = fn;
    this.args = args;
    this.context = ctx;
    this.pending = null;
  }


  update(dt) {
    if (!this.pending) {
      this.pending = this.func.apply(this.context, this.args);
      this.pending.finally(() => this.complete = true);
    }
    return this.complete;
  }
}


export class Delay extends Action {
  constructor(t) {
    super();
    this.time = t;
    this.timer = t;
  }


  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0) {
      return this.complete = true;
    }
    return false;
  }


  reset() {
    super.reset();
    this.timer = this.time;
  }
}


export class Repeat extends Action {
  constructor(count, action) {
    super();
    this.count = count || -1;
    this.action = action;
    this.counter = count;

    this.action.reset();
  }


  update(dt) {
    if (this.action.update(dt)) {
      this.count -= 1;
      if (this.count === 0) {
        return this.complete = true;
      }
      this.action.reset();
      return false;
    }
  }


  reset() {
    super.reset();
    this.counter = this.count;
    this.action.reset();
  }
}


export class Sequence extends Action {
  constructor(actions) {
    if (!Array.isArray(actions)) {
      throw new Error('Actions is not an array');
    }
    super();
    this.index = 0;
    this.actions = actions;
  }


  update(dt) {
    const actions = this.actions;
    let i = this.index;
    let action = actions[i];
    while(action && action.update(dt)) {
      i += 1;
      action = actions[i];
    }
    this.index = i;
    if (i >= actions.length) {
      return this.complete = true;
    }
    return false;
  }


  reset() {
    super.reset();
    for (const action of this.actions) {
      action.reset();
    }
    this.index = 0;
  }
}


export class Tween extends Action {
  constructor(target, property, start, end, time, ease = linear) {
    super();
    this.target = target;
    this.property = property;
    this.start = start;
    this.end = end;
    this.time = Math.max(time, 0);
    this.ease = ease;
    this.clock = 0;
  }


  update(dt) {
    if (this.time === 0) {
      this.target[this.property] = this.end;
      return this.complete = true;
    }

    this.clock = Math.min(this.clock + dt, this.time);
    this.target[this.property] = this.start + (this.end - this.start) * this.ease(this.clock / this.time);
    if (this.clock === this.time) {
      return this.complete = true;
    }
    return false;
  }


  reset() {
    super.reset();
    this.clock = 0;
  }
}


export class TweenCallback extends Action {
  constructor(time, callback, ease = linear) {
    super();
    this.time = Math.max(time, 0);
    this.callback = callback;
    this.ease = ease;
    this.clock = 0;
  }


  update(dt) {
    this.clock = Math.min(this.clock + dt, this.time);
    this.callback(this.ease(this.clock / this.time));
    if (this.clock === this.time) {
      return this.complete = true;
    }
    return false;
  }


  reset() {
    super.reset();
    this.clock = 0;
  }
}
