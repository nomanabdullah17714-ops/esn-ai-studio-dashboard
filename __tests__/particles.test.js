const { createParticle, updateParticle } = require('../dashboard');

describe('createParticle', () => {
  const WIDTH = 1280;
  const HEIGHT = 720;

  test('places particle within canvas boundaries', () => {
    for (let i = 0; i < 50; i++) {
      const p = createParticle(WIDTH, HEIGHT);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(WIDTH);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(HEIGHT);
    }
  });

  test('radius is within the expected 1–3 range', () => {
    for (let i = 0; i < 50; i++) {
      const p = createParticle(WIDTH, HEIGHT);
      expect(p.radius).toBeGreaterThanOrEqual(1);
      expect(p.radius).toBeLessThanOrEqual(3);
    }
  });

  test('velocity magnitude is within the ±0.25 range', () => {
    for (let i = 0; i < 50; i++) {
      const p = createParticle(WIDTH, HEIGHT);
      expect(Math.abs(p.vx)).toBeLessThanOrEqual(0.25);
      expect(Math.abs(p.vy)).toBeLessThanOrEqual(0.25);
    }
  });

  test('returns an object with all required fields', () => {
    const p = createParticle(WIDTH, HEIGHT);
    expect(p).toHaveProperty('x');
    expect(p).toHaveProperty('y');
    expect(p).toHaveProperty('vx');
    expect(p).toHaveProperty('vy');
    expect(p).toHaveProperty('radius');
  });
});

describe('updateParticle – normal movement', () => {
  test('advances position by velocity each step', () => {
    const p = { x: 100, y: 200, vx: 0.2, vy: -0.1, radius: 1 };
    updateParticle(p, 1280, 720);
    expect(p.x).toBeCloseTo(100.2);
    expect(p.y).toBeCloseTo(199.9);
  });

  test('does not mutate velocity when particle is mid-canvas', () => {
    const p = { x: 640, y: 360, vx: 0.2, vy: 0.2, radius: 1 };
    updateParticle(p, 1280, 720);
    expect(p.vx).toBeCloseTo(0.2);
    expect(p.vy).toBeCloseTo(0.2);
  });
});

describe('updateParticle – boundary bouncing', () => {
  test('reverses vx when particle crosses left edge (x < 0)', () => {
    const p = { x: -1, y: 360, vx: -0.2, vy: 0, radius: 1 };
    updateParticle(p, 1280, 720);
    expect(p.vx).toBeCloseTo(0.2);
  });

  test('reverses vx when particle crosses right edge (x > width)', () => {
    const p = { x: 1281, y: 360, vx: 0.2, vy: 0, radius: 1 };
    updateParticle(p, 1280, 720);
    expect(p.vx).toBeCloseTo(-0.2);
  });

  test('reverses vy when particle crosses top edge (y < 0)', () => {
    const p = { x: 640, y: -1, vx: 0, vy: -0.2, radius: 1 };
    updateParticle(p, 1280, 720);
    expect(p.vy).toBeCloseTo(0.2);
  });

  test('reverses vy when particle crosses bottom edge (y > height)', () => {
    const p = { x: 640, y: 721, vx: 0, vy: 0.2, radius: 1 };
    updateParticle(p, 1280, 720);
    expect(p.vy).toBeCloseTo(-0.2);
  });

  test('returns the same particle object (mutation in place)', () => {
    const p = { x: 100, y: 100, vx: 0.1, vy: 0.1, radius: 1 };
    const returned = updateParticle(p, 1280, 720);
    expect(returned).toBe(p);
  });
});
