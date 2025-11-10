export function placeOnRing(cx: number, cy: number, r: number, i: number, total: number) {
  const angle = (i / Math.max(total, 1)) * Math.PI * 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export const cx = 360, cy = 260, innerR = 180, outerR = 320;
