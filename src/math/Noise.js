export function simple1D(t, speed = 1) {
  return (Math.sin(speed * 22 * t) + 0.3 * Math.sin(speed * 64.325 * Math.E * t) + 0.5 * Math.sin(speed * 28.467 * Math.PI * t)) / 1.8;
}
