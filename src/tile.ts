// ============ 工具函数 ============
export function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type HSL = [number, number, number];

export function hexToHsl(hex: string): HSL {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return [h, s, l];
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) =>
    Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return '#' + to(r) + to(g) + to(b);
}

// ============ 参数 ============
export type ChipMode = 'noise' | 'grid';

export interface TileParams {
  seed: number;
  hue: number;
  sat: number;
  liq: number;
  motif: number;
  chip: ChipMode;
  cols: number;
  rows: number;
  tile: number;
  grout: number;
  baseHex: string;
  /** 砖缝颜色；'transparent' 表示透明 */
  groutColor: string;
}

export const GRID_GRID_BORDER = 5;
export const GRID_NOISE_BORDER = 1;

function gaussPaired(rand: () => number): number {
  const a = rand();
  const b = rand();
  return (a + b - 1) * 0.75;
}

// 用 seed + base 生成整个墙面颜色矩阵（预览与导出共用这份数据）
export function buildGrid(p: TileParams): string[][] {
  const rand = mulberry32(p.seed);
  const [bh, bs, bl] = hexToHsl(p.baseHex);
  const hr = p.hue / 360;
  const motif = p.chip === 'grid' ? p.motif : 0;
  const cells: string[][] = [];
  for (let r = 0; r < p.rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < p.cols; c++) {
      let h = bh + gaussPaired(rand) * hr * 360;
      let s = Math.max(0.02, bs * (1 + gaussPaired(rand) * p.sat / 100));
      let l = Math.max(
        0.02,
        Math.min(0.98, bl + gaussPaired(rand) * p.liq / 100),
      );
      if (motif > 0) {
        const k = motif / 100;
        const m =
          (Math.sin(r * 0.9 + (p.seed % 7)) * Math.cos(c * 0.7 + ((p.seed / 13) % 6)) +
            Math.sin((r - c) * 0.55) * 0.7) *
          0.5 *
          k;
        l = Math.max(0.02, Math.min(0.98, l + m * 0.8));
      }
      row.push(hslToHex(h, s, l));
    }
    cells.push(row);
  }
  return cells;
}

// ============ Canvas 预览 ============
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  cells: string[][],
  p: TileParams,
): void {
  const ctx = canvas.getContext('2d')!;
  const step = p.tile + p.grout;
  const W = p.cols * step + p.grout;
  const H = p.rows * step + p.grout;
  canvas.width = W;
  canvas.height = H;
  const transparent = p.groutColor === 'transparent';
  // 预览底板跟随砖缝透明度，透明时露出页面背景
  canvas.style.background = transparent ? 'transparent' : '#0b0d11';
  ctx.clearRect(0, 0, W, H);
  if (!transparent) {
    ctx.fillStyle = p.groutColor;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.imageSmoothingEnabled = true;

  if (p.chip === 'grid') {
    // 工字形：隔行偏移半块，模拟错缝
    const off = p.tile / 2 + p.grout / 2;
    const rim = GRID_GRID_BORDER;
    for (let r = 0; r < p.rows; r++) {
      const shift = r % 2 === 0 ? 0 : off;
      for (let c = 0; c < p.cols; c++) {
        const x = p.grout + c * step + shift;
        const y = p.grout + r * step;
        ctx.fillStyle = cells[r][c];
        ctx.fillRect(x + rim, y + rim, p.tile - rim * 2, p.tile - rim * 2);
      }
    }
  } else {
    // 港铁风格：等大方砖，只保留 1px 缝
    const rim = GRID_NOISE_BORDER;
    for (let r = 0; r < p.rows; r++) {
      for (let c = 0; c < p.cols; c++) {
        const x = p.grout + c * step;
        const y = p.grout + r * step;
        ctx.fillStyle = cells[r][c];
        ctx.fillRect(x + rim, y + rim, p.tile - rim * 2, p.tile - rim * 2);
      }
    }
  }
}

// ============ 导出 SVG（复用同一份 cells） ============
export function exportSVG(cells: string[][], p: TileParams): string {
  const step = p.tile + p.grout;
  const W = p.cols * step + p.grout;
  const H = p.rows * step + p.grout;
  let rects = '';
  if (p.chip === 'grid') {
    const off = p.tile / 2 + p.grout / 2;
    const rim = GRID_GRID_BORDER;
    const s = p.tile - rim * 2;
    for (let r = 0; r < p.rows; r++) {
      const shift = r % 2 === 0 ? 0 : off;
      const x0 = p.grout + shift;
      for (let c = 0; c < p.cols; c++) {
        const x = x0 + c * step + rim;
        const y = p.grout + r * step + rim;
        rects += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${cells[r][c]}"/>`;
      }
    }
  } else {
    const rim = GRID_NOISE_BORDER;
    const s = p.tile - rim * 2;
    for (let r = 0; r < p.rows; r++) {
      for (let c = 0; c < p.cols; c++) {
        const x = p.grout + c * step + rim;
        const y = p.grout + r * step + rim;
        rects += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${cells[r][c]}"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${
      p.groutColor === 'transparent' ? '' : `<rect width="${W}" height="${H}" fill="${p.groutColor}"/>`
    }${rects}</svg>`;
  }