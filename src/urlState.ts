import type { ChipMode, TileParams } from './tile';

/** 默认状态（也是 URL 缺省值 / 出厂值） */
export const DEFAULT: TileParams = {
  seed: 1234,
  hue: 6,
  sat: 14,
  liq: 16,
  motif: 9,
  chip: 'noise',
  cols: 30,
  rows: 20,
  tile: 34,
  grout: 5,
  baseHex: '#2E6F8E',
  groutColor: '#0B0D11',
};

/**
 * 核心参数（可分享的"配方"）= 颜色 + 砌法。
 * 只同步这三个；尺寸/色差/纹样等当作"微调"不进 URL，保持 URL 简短。
 */
const CORE = ['baseHex', 'groutColor', 'chip'] as const;

/** 从 URL 读出核心参数（非默认值才解析） */
export function readUrlParams(): Partial<TileParams> {
  const sp = new URLSearchParams(location.search);
  const out: Partial<TileParams> = {};
  const c = sp.get('c'); // 砖块色
  if (c && /^[0-9a-fA-F]{6}$/.test(c)) out.baseHex = '#' + c.toUpperCase();
  const g = sp.get('g'); // 砖缝色；'t' = 透明
  if (g === 't') out.groutColor = 'transparent';
  else if (g && /^[0-9a-fA-F]{6}$/.test(g)) out.groutColor = '#' + g.toUpperCase();
  const chip = sp.get('chip'); // 砌法
  if (chip === 'noise' || chip === 'grid') out.chip = chip as ChipMode;
  return out;
}

/** 只把「非默认值」的核心参数写进 URL（replaceState，不污染历史栈） */
export function writeUrlParams(p: TileParams): void {
  const sp = new URLSearchParams();
  if (p.baseHex !== DEFAULT.baseHex) sp.set('c', p.baseHex.slice(1));
  if (p.groutColor === 'transparent') sp.set('g', 't');
  else if (p.groutColor !== DEFAULT.groutColor) sp.set('g', p.groutColor.slice(1));
  if (p.chip !== DEFAULT.chip) sp.set('chip', p.chip);
  const qs = sp.toString();
  const url = qs ? `${location.pathname}?${qs}` : location.pathname;
  history.replaceState(null, '', url);
}

export { CORE };