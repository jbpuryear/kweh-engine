import AABB from '../math/AABB.js';


export default class BVH extends AABB {
  constructor(entries, boundsFunc = AABB.copy, splitHorizontal = true) {
    super();

    this.value = null;
    this.left = null;
    this.right = null;

    boundsFunc(entries[0], this);
    const tmp = new AABB;
    for (let i = 1; i < entries.length; i += 1) {
      this.merge(boundsFunc(entries[i], tmp));
    }

    if (entries.length === 1) {
      this.value = entries[0];
      return;
    }

    if (splitHorizontal) {
      entries.sort((a, b) => (a.x + a.width/2) - (b.x + b.width/2));
      entries.sort((a, b) => (a.y + a.height/2) - (b.y + b.height/2));
    } else {
      entries.sort((a, b) => (a.y + a.height/2) - (b.y + b.height/2));
      entries.sort((a, b) => (a.x + a.width/2) - (b.x + b.width/2));
    }
    const split = Math.ceil(entries.length / 2);
    this.left = new BVH(entries.slice(0, split), !splitHorizontal);
    this.right = new BVH(entries.slice(split), !splitHorizontal);
  }


  forEach(func) {
    if (this.value) {
      func(this.value);
    } else {
      this.right.forEach(func);
      this.left.forEach(func);
    }
  }


  forOverlaps(aabb, func) {
    if (this.overlaps(aabb)) {
      if (this.value) {
        func(this.value);
      } else {
        this.left.forOverlaps(aabb, func);
        this.right.forOverlaps(aabb, func);
      }
    }
  }


  firstOverlaps(aabb, func) {
    if (this.overlaps(aabb)) {
      if (this.value) {
        return func(this.value);
      } else {
        return this.left.firstOverlaps(aabb, func) || this.right.firstOverlaps(aabb, func);
      }
    }
    return null;
  }


  forContains(x, y, func) {
    if (this.contains(x, y)) {
      if (this.value) {
        func(this.value);
      } else {
        this.left.forContains(x, y, func);
        this.right.forContains(x, y, func);
      }
    }
  }


  firstContains(x, y, func) {
    if (this.contains(x, y)) {
      if (this.value) {
        return func(this.value);
      } else {
        return this.left.this.firstContains(x, y, func) || this.right.firstContains(x, y, func);
      }
    }
    return null;
  }
}
