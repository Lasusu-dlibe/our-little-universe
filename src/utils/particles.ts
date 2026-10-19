export function isMobile(): boolean {
  return window.innerWidth < 768;
}

export function getParticleCount(base: number): number {
  return isMobile() ? Math.floor(base * 0.4) : base;
}
