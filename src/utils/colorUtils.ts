// Color utility functions

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorInfo {
  hex: string;
  hsl: HSL;
  rgb: RGB;
  name?: string;
  locked: boolean;
  id: string;
}

export type HarmonyMode =
  | 'random'
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'
  | 'monochromatic';

export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

export function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function randomHue(): number {
  return Math.floor(Math.random() * 360);
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function makeColor(h: number, s: number, l: number, locked = false): ColorInfo {
  const hex = hslToHex(h, s, l);
  const rgb = hexToRgb(hex);
  return { hex, hsl: { h, s, l }, rgb, locked, id: generateId() };
}

export function generatePalette(count: number, mode: HarmonyMode, existing?: ColorInfo[]): ColorInfo[] {
  const baseHue = randomHue();
  const baseSat = randomInRange(55, 80);

  switch (mode) {
    case 'complementary': {
      const hues = [baseHue, (baseHue + 180) % 360];
      return Array.from({ length: count }, (_, i) => {
        if (existing?.[i]?.locked) return existing[i];
        const hue = hues[i % 2];
        const l = randomInRange(35, 70);
        return makeColor(hue, baseSat, l);
      });
    }

    case 'analogous': {
      return Array.from({ length: count }, (_, i) => {
        if (existing?.[i]?.locked) return existing[i];
        const hue = (baseHue + i * 30) % 360;
        const l = randomInRange(40, 70);
        return makeColor(hue, baseSat, l);
      });
    }

    case 'triadic': {
      const hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
      return Array.from({ length: count }, (_, i) => {
        if (existing?.[i]?.locked) return existing[i];
        const hue = hues[i % 3];
        const l = randomInRange(35, 70);
        return makeColor(hue, baseSat, l);
      });
    }

    case 'tetradic': {
      const hues = [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
      return Array.from({ length: count }, (_, i) => {
        if (existing?.[i]?.locked) return existing[i];
        const hue = hues[i % 4];
        const l = randomInRange(35, 70);
        return makeColor(hue, baseSat, l);
      });
    }

    case 'split-complementary': {
      const hues = [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360];
      return Array.from({ length: count }, (_, i) => {
        if (existing?.[i]?.locked) return existing[i];
        const hue = hues[i % 3];
        const l = randomInRange(35, 70);
        return makeColor(hue, baseSat, l);
      });
    }

    case 'monochromatic': {
      return Array.from({ length: count }, (_, i) => {
        if (existing?.[i]?.locked) return existing[i];
        const l = 20 + Math.round((i / (count - 1)) * 60);
        return makeColor(baseHue, baseSat, l);
      });
    }

    default: {
      return Array.from({ length: count }, (_, i) => {
        if (existing?.[i]?.locked) return existing[i];
        const h = randomHue();
        const s = randomInRange(50, 85);
        const l = randomInRange(35, 70);
        return makeColor(h, s, l);
      });
    }
  }
}

export function getContrastColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  // Relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1a1a2e' : '#ffffff';
}

export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}
