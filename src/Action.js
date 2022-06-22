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


  update(dt) {
    for (const action of this.actions) {
      if (action.run(dt)) {
        this.actions.delete(action);
      }
    }
  }
}


export class Action {
  constructor() {
    this.complete = false;
  }


  run(dt) {
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


  run(dt) {
    let complete = true;
    for (const action of this.actions) {
      if (!action.complete && !action.run(dt)) {
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
  constructor(target, property, frames, durations) {
    super();
    this.target = target;
    this.property = property;
    this.frames = frames;
    this.durations = Array.isArray(durations) ? durations : new Array(frames.length).fill(durations);
    this.accumulator = 0;
    this.index = 0;
  }


  run(dt) {
    const frameCount = this.frames.length;
    let t = this.accumulator + dt;
    let i = this.index;
    while (i < frameCount && t >= this.durations[i]) {
      t -= this.durations[i];
      i += 1;
    }

    if (i >= frameCount) {
      if (frameCount > 0) {
        this.target[this.property] = this.frames[frameCount - 1];
      }
      return this.complete = true;
    }

    this.accumulator = t;
    this.index = i;
    this.target[this.property] = this.frames[i];

    return false;
  }


  reset() {
    super.reset();
    this.accumulator = 0;
    this.index = 0;
  }
}


export class Assign extends Action {
  constructor(target, property, value) {
    super();
    this.target = target;
    this.property = property;
    this.value = value;
  }


  run(dt) {
    this.target[this.property] = this.value;
    return this.complete = true;
  }
}


export class CallFunc extends Action {
  constructor(fn, args = null, ctx = null) {
    super();
    this.func = fn;
    this.args = args;
    this.context = ctx;
  }


  run(dt) {
    this.func.apply(this.context, this.args);
    return this.complete = true;
  }
}


export class Delay extends Action {
  constructor(t) {
    super();
    this.time = t;
    this.timer = t;
  }


  run(dt) {
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


  run(dt) {
    if (this.action.run(dt)) {
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


  run(dt) {
    const actions = this.actions;
    let i = this.index;
    let action = actions[i];
    while(action && action.run(dt)) {
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


  run(dt) {
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
