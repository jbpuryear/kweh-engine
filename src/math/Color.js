export function fromRGBA(r, g, b, a) {
  return (r << 24) | (g << 16) | (b << 8) | a;
}


export function getR(c) {
  return c >>> 24;
}


export function getG(c) {
  return (c & 0xff0000) >>> 16;
}


export function getB(c) {
  return (c & 0xff00) >>> 8;
}


export function getA(c) {
  return c & 0xff;
}


export function setR(c, r) {
  return (c & 0x00ffffff) | (r << 24);
}


export function setG(c, g) {
  return (c & 0xff00ffff) | (g << 16);
}


export function setB(c, b) {
  return (c & 0xffff00ff) | (b << 8);
}


export function setA(c, a) {
  return (c & 0xffffff00) | a;
}


export function mix(c1, c2, t) {
  const r = getR(c1) * (1 - t) + getR(c2) * t;
  const g = getG(c1) * (1 - t) + getG(c2) * t;
  const b = getB(c1) * (1 - t) + getB(c2) * t;
  const a = getA(c1) * (1 - t) + getR(c2) * t;
  return fromRGBA(r, g, b, a);
}
