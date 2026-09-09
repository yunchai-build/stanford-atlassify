export function offsetFor(objIndex, frameIndex) {
  const t = frameIndex / 10;
  const base = objIndex === 0 ? { x: 150, y: 118 } : { x: 90, y: 148 };
  const dx = objIndex === 0 ? 68 : -28;
  const dy = objIndex === 0 ? -28 : 18;
  return { x: base.x + t * dx, y: base.y + t * dy };
}
