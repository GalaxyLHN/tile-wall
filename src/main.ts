import '@material/web/typography/md-typescale-styles.css';
import './style.css';

// Material Web 组件
import '@material/web/slider/slider.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';

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
  groutColor: '#0B0D11',
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

let lastGroutHex = '#0B0D11';

function setGroutColor(c: string): void {
  state.groutColor = c;
  const transparent = c === 'transparent';
  // 单一事实来源：state.groutColor；checkbox 选中态只做同步
  (byId('chkGroutTransparent') as unknown as { checked: boolean }).checked = transparent;
  const fill = byId('groutFill') as HTMLElement;
  fill.className = transparent ? 'transparent' : '';
  fill.style.background = transparent ? '' : c;
  if (!transparent) {
    lastGroutHex = c.toUpperCase();
    (byId('groutHex') as unknown as { value: string }).value = lastGroutHex;
  }
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
      // 随机换色：色相全域 0–360°，饱和度与明度均 30–70%
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

  // 砖缝颜色 / 透明
  byId('btnGroutPick').addEventListener('click', () =>
    (byId('groutColor') as HTMLInputElement).click(),
  );
  byId('groutColor').addEventListener('input', (e) =>
    setGroutColor((e.target as HTMLInputElement).value),
  );
  byId('groutHex').addEventListener('change', (e) => {
    const target = e.target as unknown as { value: string };
    const m = /^#?([0-9a-fA-F]{6})$/.exec(target.value.trim());
    if (m) setGroutColor('#' + m[1]);
    else target.value = state.groutColor === 'transparent' ? lastGroutHex : state.groutColor;
  });
  byId('chkGroutTransparent').addEventListener('change', (e) => {
      const checked = (e.target as unknown as { checked: boolean }).checked;
      setGroutColor(checked ? 'transparent' : lastGroutHex);
    });
  setGroutColor(state.groutColor); // 初始化砖缝色 UI

  // 窄屏功能 Tab
  const tabs = byId('mobileTabs') as HTMLElement & { activeTabIndex: number };
  const activateTab = (idx: number) => {
    // md-tabs 升级前 activeTabIndex 可能是 -1/NaN，兜底成 0
    const safe = Number.isInteger(idx) && idx >= 0 ? idx : 0;
    document.querySelectorAll<HTMLElement>('.tabpanel').forEach((p, i) =>
      p.classList.toggle('active', i === safe),
    );
  };
  tabs.addEventListener('change', () => activateTab(tabs.activeTabIndex));
  // 用静态 attribute 初始化，避免依赖组件升级时序
  activateTab(Number(tabs.getAttribute('active-tab-index') ?? 0));

  // 操作
  byId('regenerate').addEventListener('click', regenerate);
  byId('download').addEventListener('click', download);
  byId('downloadPng').addEventListener('click', downloadPNG);
}

function download(): void {
  const svg = exportSVG(curGrid, state);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download =
    `tile-wall-${state.cols}x${state.rows}-${state.baseHex.replace('#', '')}-seed${state.seed.toString(16)}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function downloadPNG(): void {
  const a = document.createElement('a');
  a.download =
    `tile-wall-${state.cols}x${state.rows}-${state.baseHex.replace('#', '')}-seed${state.seed.toString(16)}.png`;
  // 预览 canvas 就是当前参数渲染的成品，直接按原分辨率导出
  canvas.toBlob((blob) => {
    if (!blob) return;
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, 'image/png');
}

// ============ 启动 ============
applyHex('#2E6F8E');
bind();
watchSystemScheme(() => state.baseHex);
setChip('noise');