function mapDeadzone(val, low, high) {
  val = Math.min(val, high);
  val =  val < low ? 0 : (val - low) / (high - low)
  return val;
}


export class InputManager {
  constructor(padCount) {
    this.inputs = new Map();
    this.axes = new Map();
    this.sticks = new Map();
    this._gamepads = new Array(padCount);

    this._gamepads.fill(null);
  }


  update(dt) {
    const time = performance.now();
    const padCount = this._gamepads.length;
    for (let i = 0; i < padCount; i += 1) {
      this._gamepads[i] = navigator.getGamepads?.()[i] || null;
    }
    for (const input of this.inputs.values()) {
      input.update(dt, time);
    }
  }


  rumble(index, duration, strongMag, weakMag) {
    const pad = this._getGamepad(index);
    pad?.vibrationActuator?.playEffect('dual-rumble', {
      duration: duration,
      strongMagnitude: strongMag,
      weakMagnitude: weakMag,
    });
  }


  _getGamepad(index) {
    return this._gamepads[index] ?? null;
  }
}


export class Input {
  constructor(triggers=[], bufferTime = 0) {
    this._bufferTime = bufferTime;
    this._buffer = 0;
    this._wasDown = false;
    this._strength = 0;
    this.triggers = triggers;
    this.time = 0;
  }

  update(dt, time) {
    this._buffer -= dt;

    const trigs = this.triggers;
    let max = 0;
    for (let i = 0; i < trigs.length; i += 1) {
      const strength = trigs[i].getStrength();
      max = max >= strength ? max : strength;
    }
    this._strength = max;

    if (this.justDown()) {
      this._buffer = this._bufferTime;
      this.time = time;
    }

    this._wasDown = this._strength > 0;
  }

  getStrength() {
    return this._strength;
  }

  isDown() {
    return this._strength > 0;
  }

  isBuffered() {
    return this._buffer > 0;
  }

  justDown() {
    return !this._wasDown && this._strength > 0;
  }

  justUp() {
    return this._wasDown && !this._strength > 0;
  }

  consume() {
    const isDown = this._buffer > 0;
    this._buffer = 0;
    return isDown;
  }
}


export class Trigger {
  constructor(manager) {
    this.manager = manager;
  }

  getStrength() { return 0; }
}


export class Key extends Trigger {
  constructor(manager, code, target=window) {
    super(manager);
    this._strength = 0;

    target.addEventListener('keydown', (e) => {
      if (e.code === code) {
        this._strength = 1;
      }
    });

    target.addEventListener('keyup', (e) => {
      if (e.code === code) {
        this._strength = 0;
      }
    });
  }
  
  getStrength() {
    return this._strength;
  }
}


export class Button extends Trigger {
  constructor(manager, padIndex, button, deadzoneLow = 0.05, deadzoneHigh = 1) {
    super(manager);
    this._padIndex = padIndex;
    this._button = button;
    this.deadzoneLow = deadzoneLow;
    this.deadzoneHigh = deadzoneHigh;
  }
  
  getStrength() {
    const pad = this.manager._getGamepad(this._padIndex);
    if (!pad) { return 0; }
    const button = pad.buttons[this._button];
    if (button) {
      const val  = button.value;
      return mapDeadzone(val, this.deadzoneLow, this.deadzoneHigh);
    }
    return 0;
  }
}


export class AxisPositive extends Trigger {
  constructor(manager, padIndex, axis, deadzoneLow = 0.1, deadzoneHigh = 1) {
    super(manager);
    this._padIndex = padIndex;
    this._axis = axis;
    this.deadzoneLow = deadzoneLow;
    this.deadzoneHigh = deadzoneHigh;
  }

  getStrength() {
    const pad = this.manager._getGamepad(this._padIndex);
    if (!pad) { return 0; }
    const val = Math.max(0, pad.axes[this._axis]);
    return mapDeadzone(val, this.deadzoneLow, this.deadzoneHigh);
  }
}


export class AxisNegative extends Trigger {
  constructor(manager, padIndex, axis, deadzoneLow = 0.1, deadzoneHigh = 1) {
    super(manager);
    this._padIndex = padIndex;
    this._axis = axis;
    this.deadzoneLow = deadzoneLow;
    this.deadzoneHigh = deadzoneHigh;
  }

  getStrength() {
    const pad = this.manager._getGamepad(this._padIndex);
    if (!pad) { return 0; }
    const val = Math.min(0, pad.axes[this._axis]);
    return mapDeadzone(-val, this.deadzoneLow, this.deadzoneHigh);
  }
}


export class Axis {
  constructor(negative, positive, mode = 'newest') {
    this._negativeAction = negative;
    this._positiveAction = positive;
    this.mode = mode;
  }

  getValue() {
    const pos = this._positiveAction;
    const neg = this._negativeAction;
    const sp = pos.getStrength();
    const sn = neg.getStrength();
    if (this.mode === 'sum' || !(sp && sn)) {
      return sp - sn;
    }
    return pos.time > neg.time ? sp : -sn;
  }
}


export class Stick {
  constructor(x, y, deadzoneLow = 0.2, deadzoneHigh = 0.95) {
    this._xAxis = x;
    this._yAxis = y;
    this.deadzoneLow = deadzoneLow;
    this.deadzoneHigh = deadzoneHigh;
  }

  getValue(out) {
    const low = this.deadzoneLow;
    const high = this.deadzoneHigh;
    let x = this._xAxis.getValue();
    let y = this._yAxis.getValue();

    let mag = Math.sqrt(x*x + y*y);
    if (mag < low) {
      out.x = 0;
      out.y = 0;
    } else {
      x /= mag;
      y /= mag;
      mag = mag > high ? high : mag;
      const scale = (mag - low) / (high - low);
      out.x = x * scale;
      out.y = y * scale;
    }

    return out;
  }

  getAngle() {
    return Math.atan2(this._yAxis.getValue(), this._xAxis.getValue());
  }
}
