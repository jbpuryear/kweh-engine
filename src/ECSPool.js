export default class ECSPool {
  constructor(count) {
    this.deadHead = 1;
    this.aliveHead = 0;
    this.aliveTail = 0;
    this.next = new Uint16Array(count);
    this.prev = new Uint16Array(count);

    // Initialize by linking them all and adding to dead list
    const bn = this.next;
    const bp = this.prev;
    for (let i = 1; i < count; i += 1) {
      bp[i] = i - 1;
      bn[i] = i + 1;
    }
    bn[bn.length - 1] = 0;
  }

  _spawn() {
    const bn = this.next;
    const bp = this.prev;

    let p = this.deadHead;
    if (p !== 0) {
      this.deadHead = bn[p];
    } else {
      p = this.aliveTail;
      this.aliveTail = bp[p];
      bn[this.aliveTail] = 0;
    }

    bn[p] = this.aliveHead;
    bp[p] = 0;
    if (this.aliveHead !== 0) {
      bp[this.aliveHead] = p;
    } else {
      this.aliveTail = p;
    }
    this.aliveHead = p;

    return p
  }


  update(dt) {
    const bn = this.next;
    let p = this.aliveHead;
    while (p !== 0) {
      const next = bn[p];
      this.updateEntity(p, dt);
      p = next;
    }
  }


  forEach(fn) {
    const bn = this.next;
    let p = this.aliveHead;
    while (p !== 0) {
      const next = bn[p];
      fn(this, p);
      p = next;
    }
  }


  kill(p) {
    const bn = this.next;
    const bp = this.prev;
    const next = bn[p];
    const prev = bp[p];
    bn[prev] = next;
    bp[next] = prev;
    if (p === this.aliveHead) {
      this.aliveHead = next;
    }
    if (p === this.aliveTail) {
      this.aliveTail = prev;
    }
    bp[this.deadHead] = p;
    bn[p] = this.deadHead;
    bp[p] = 0;
    this.deadHead = p;
  }


  killAll() {
    const bn = this.next;
    const bp = this.prev;
    bn[this.aliveTail] = this.deadHead;
    bp[this.aliveHead] = 0;
    this.deadHead = this.aliveHead;
    this.aliveHead = 0;
    this.aliveTail = 0;
  }
}
