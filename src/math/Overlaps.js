export function aabb(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}


export function circle(a, b) {
  const r = a.radius + b.radius;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return r*r >= dx*dx + dy*dy;
}


export function aabbToCircle(b, c) {
  const bcx = b.x + b.width / 2;
  const bcy = b.y + b.height / 2;
  const dx = Math.abs(c.x - bcx);
  const dy = Math.abs(c.y - bcy);

  if (dx > b.width / 2 + c.radius) { return false; }
  if (dy > b.height / 2 + c.radius) { return false; }

  if (dx <= b.width / 2) { return true; }
  if (dy <= b.height / 2) { return true; }

  const cornerDx = dx - b.width / 2;
  const cornerDy = dy - b.height / 2;
  return cornerDx * cornerDx + cornerDy * cornerDy <= c.radius * c.radius;
}
