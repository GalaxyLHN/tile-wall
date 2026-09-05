import '@material/web/typography/md-typescale-styles.css';
import './style.css';

// Material Web 组件
import '@material/web/slider/slider.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/textfield/outlined-text-field.js';

import {
  type ChipMode,
  type TileParams,
  buildGrid,
  exportSVG,
  hexToHsl,
  hslToHex,
  renderToCanvas,
} from './tile';
import { applyThemeFromSeed, watchSystemScheme } from './theme';

// ============ 状态 ============
const state: TileParams = {
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
};

// ============ DOM 辅助 ============
const byId = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

type MdSlider = HTMLElement & { value: number; min: number; max: number };
/** md-slider 是自定义元素，id 在标签属性里，必须用 querySelector，不能用 getElementById。 */
const slider = (id: string): MdSlider =>
  document.querySelector<MdSlider>(`md-slider#${id}`)!;

const canvas = byId('tileCanvas') as HTMLCanvasElement;
let curGrid: string[][] = [];

// ============ 读取参数 → 绘制 ============
function readParams(): void {
  state.hue = slider('hueR').value;
  state.sat = slider('satR').value;
  state.liq = slider('liqR').value;
  state.motif = slider('motifAmp').value;
  state.cols = slider('cols').value;
  state.rows = slider('rows').value;
  state.tile = slider('tile').value;
  state.grout = slider('grout').value;
}

function updateOutputs(): void {
  byId('vHue').textContent = `±${state.hue}°`;
  byId('vSat').textContent = `±${state.sat}%`;
  byId('vLiq').textContent = `±${state.liq}%`;
  byId('vMotif').textContent = String(state.motif);
  byId('vCols').textContent = String(state.cols);
  byId('vRows').textContent = String(state.rows);
  byId('vTile').textContent = String(state.tile);
  byId('vGrout').textContent = String(state.grout);
}

function updateMeta(): void {
  byId('meta').innerHTML =
    `<b>${state.cols}×${state.rows}</b> = <b>${state.cols * state.rows}</b> 块瓷砖 ｜ 种子 <b>#${state.seed.toString(16).padStart(8, '0')}</b> ｜ 基准色 <b>${state.baseHex}</b>`;
}

/** 读完所有参数 → 重建矩阵 → 重绘。每次交互都走这里，避免用到旧 state。 */
function repaint(): void {
  readParams();
  updateOutputs();
  curGrid = buildGrid(state);
  renderToCanvas(canvas, curGrid, state);
  updateMeta();
}

function setChip(mode: ChipMode): void {
  state.chip = mode;
  (byId('chipNoise') as unknown as { selected: boolean }).selected = mode === 'noise';
  (byId('chipGrid') as unknown as { selected: boolean }).selected = mode === 'grid';
  // 纹样强度只在「工字形」下有作用，其它时候隐藏
  (byId('motifWrap') as HTMLElement).style.display = mode === 'grid' ? '' : 'none';
  repaint();
}

function regenerate(): void {
  state.seed = (state.seed + Math.floor(Math.random() * 1e6) + 7919) | 0;
  repaint();
}

function applyHex(h: string): void {
  state.baseHex = h.toUpperCase();
  (byId('seedHex') as unknown as { value: string }).value = state.baseHex;
  (byId('seedColor') as HTMLInputElement).value = state.baseHex;
  (byId('swatchFill') as HTMLElement).style.background = hslToHex(...hexToHsl(state.baseHex));
  applyThemeFromSeed(state.baseHex); // 页面主题跟随种子色
  regenerate();
}

// ============ 事件绑定 ============
function bind(): void {
  // 颜色
  byId('btnSwatch').addEventListener('click', () =>
    (byId('seedColor') as HTMLInputElement).click(),
  );
  byId('seedColor').addEventListener('input', (e) =>
    applyHex((e.target as HTMLInputElement).value),
  );
  byId('btnRandom').addEventListener('click', () => {
    // 随机取色：色相全域 0–360°，饱和度与明度均 30–70%
    const h = Math.random() * 360;
    const s = (30 + Math.random() * 40) / 100;
    const l = (30 + Math.random() * 40) / 100;
    applyHex(hslToHex(h, s, l));
  });
  byId('seedHex').addEventListener('change', (e) => {
    const target = e.target as unknown as { value: string };
    const m = /^#?([0-9a-fA-F]{6})$/.exec(target.value.trim());
    if (m) applyHex('#' + m[1]);
    else target.value = state.baseHex;
  });

  // 滑块（md-slider 会重发内部 range input 的 input/change 事件）
  (['hueR', 'satR', 'liqR', 'motifAmp', 'cols', 'rows', 'tile', 'grout'] as const).forEach((id) =>
    slider(id).addEventListener('input', repaint),
  );

  // 砌法 chips
  byId('chipNoise').addEventListener('click', () => setChip('noise'));
  byId('chipGrid').addEventListener('click', () => setChip('grid'));

  // 操作
  byId('regenerate').addEventListener('click', regenerate);
  byId('download').addEventListener('click', download);
}

function download(): void {
  const svg = exportSVG(curGrid, state);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download =
    `mtr-wall-${state.cols}x${state.rows}-${state.baseHex.replace('#', '')}-seed${state.seed.toString(16)}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ============ 启动 ============
applyHex('#2E6F8E');
bind();
watchSystemScheme(() => state.baseHex);
setChip('noise');