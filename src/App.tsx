import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type ChipMode,
  type TileParams,
  buildGrid,
  exportSVG,
  hslToHex,
  renderToCanvas,
} from './tile';
import { applyThemeFromSeed, watchSystemScheme } from './theme';
import { DEFAULT, readUrlParams, writeUrlParams } from './urlState';
import { MdTabs } from './components/md';
import { ColorSection } from './components/ColorSection';
import { SizeSection } from './components/SizeSection';
import { DiffSection } from './components/DiffSection';
import { LayoutSection } from './components/LayoutSection';
import { ExportSection } from './components/ExportSection';
import { AboutSection } from './components/AboutSection';

/** 窄屏底部功能 Tab（Material Symbols，960 坐标系） */
const TABS: { label: string; path: string }[] = [
  {
    label: '色彩',
    path: 'M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-85 32-158t87.5-127q55.5-54 130-84.5T489-880q79 0 150 26.5T763.5-780q53.5 47 85 111.5T880-527q0 108-63 170.5T650-294h-75q-18 0-31 14t-13 31q0 27 14.5 46t14.5 44q0 38-21 58.5T480-80Zm0-400Zm-198 11q15-15 15-35t-15-35q-15-15-35-15t-35 15q-15 15-15 35t15 35q15 15 35 15t35-15Zm126-170q15-15 15-35t-15-35q-15-15-35-15t-35 15q-15 15-15 35t15 35q15 15 35 15t35-15Zm214 0q15-15 15-35t-15-35q-15-15-35-15t-35 15q-15 15-15 35t15 35q15 15 35 15t35-15Zm131 170q15-15 15-35t-15-35q-15-15-35-15t-35 15q-15 15-15 35t15 35q15 15 35 15t35-15ZM480-140q11 0 15.5-4.5T500-159q0-14-14.5-26T471-238q0-46 30-81t76-35h73q76 0 123-44.5T820-527q0-132-100-212.5T489-820q-146 0-247.5 98.5T140-480q0 141 99.5 240.5T480-140Z',
  },
  {
    label: '尺寸',
    path: 'M140-240q-24 0-42-18t-18-42v-360q0-23 18-41.5t42-18.5h680q24 0 42 18.5t18 41.5v360q0 24-18 42t-42 18H140Zm0-60h680v-360H690v180h-60v-180H510v180h-60v-180H330v180h-60v-180H140v360Zm130-180h60-60Zm180 0h60-60Zm180 0h60-60Zm-150 0Z',
  },
  {
    label: '色差',
    path: 'M427-120v-225h60v83h353v60H487v82h-60Zm-307-82v-60h247v60H120Zm187-166v-82H120v-60h187v-84h60v226h-60Zm120-82v-60h413v60H427Zm166-165v-225h60v82h187v60H653v83h-60Zm-473-83v-60h413v60H120Z',
  },
  {
    label: '布局',
    path: 'M120-260v-440q0-24.75 17.63-42.38Q155.25-760 180-760h600q24.75 0 42.38 17.62Q840-724.75 840-700v440q0 24.75-17.62 42.37Q804.75-200 780-200H180q-24.75 0-42.37-17.63Q120-235.25 120-260Zm270-250h390v-190H390v190Zm229 250h161v-190H619v190Zm-229 0h162v-190H390v190Zm-210 0h150v-440H180v440Z',
  },
  {
    label: '导出',
    path: 'M480-313 287-506l43-43 120 120v-371h60v371l120-120 43 43-193 193ZM220-160q-24 0-42-18t-18-42v-143h60v143h520v-143h60v143q0 24-18 42t-42 18H220Z',
  },
  {
    label: '关于',
    path: 'M453-280h60v-240h-60v240Zm50.5-323.2q9.5-9.2 9.5-22.8 0-14.45-9.48-24.22-9.48-9.78-23.5-9.78t-23.52 9.78Q447-640.45 447-626q0 13.6 9.48 22.8 9.48 9.2 23.5 9.2t23.52-9.2ZM480.27-80q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.23-60Q622-140 721-239.5t99-241Q820-622 721.19-721T480-820q-141 0-240.5 98.81T140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z',
  },
];

export function App() {
  const [params, setParams] = useState<TileParams>(
    () => ({ ...DEFAULT, ...readUrlParams() }),
  );
  const [activeTab, setActiveTab] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<string[][]>([]);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const baseHexRef = useRef(params.baseHex);
  baseHexRef.current = params.baseHex;
  const lastGroutHexRef = useRef('#0B0D11');

  const patch = useCallback((p: Partial<TileParams>) => setParams((s) => ({ ...s, ...p })), []);

  const onBaseHex = useCallback((h: string) => patch({ baseHex: h.toUpperCase() }), [patch]);
  const onRandomize = useCallback(() => {
    // 随机换色：色相全域 0–360°，饱和度与明度均 30–70%
    const h = Math.random() * 360;
    const s = (30 + Math.random() * 40) / 100;
    const l = (30 + Math.random() * 40) / 100;
    patch({ baseHex: hslToHex(h, s, l) });
  }, [patch]);
  const onGroutColor = useCallback(
    (c: string) => {
      if (c !== 'transparent') lastGroutHexRef.current = c.toUpperCase();
      patch({ groutColor: c });
    },
    [patch],
  );
  const onChip = useCallback((m: ChipMode) => patch({ chip: m }), [patch]);
  const onRegenerate = useCallback(
    () => setParams((s) => ({ ...s, seed: (s.seed + Math.floor(Math.random() * 1e6) + 7919) | 0 })),
    [],
  );

  // 核心参数（颜色/砌法）变化时同步到 URL（replaceState，默认值省略，不进历史栈）
  const { baseHex, groutColor, chip } = params;
  useEffect(() => {
    writeUrlParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseHex, groutColor, chip]);

  // 重绘（参数变化 → 重建矩阵 → 画 canvas）
  useEffect(() => {
    if (!canvasRef.current) return;
    gridRef.current = buildGrid(params);
    renderToCanvas(canvasRef.current, gridRef.current, params);
  }, [params]);

  // 主题跟随种子色 + 系统亮暗
  useEffect(() => {
    applyThemeFromSeed(params.baseHex);
  }, [params.baseHex]);
  useEffect(() => {
    watchSystemScheme(() => baseHexRef.current);
  }, []);

  const downloadSVG = useCallback(() => {
    const p = paramsRef.current;
    const svg = exportSVG(gridRef.current, p);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tile-wall-${p.cols}x${p.rows}-${p.baseHex.replace('#', '')}-seed${p.seed.toString(16)}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, []);

  const downloadPNG = useCallback(() => {
    const p = paramsRef.current;
    const canvas = canvasRef.current!;
    const a = document.createElement('a');
    a.download = `tile-wall-${p.cols}x${p.rows}-${p.baseHex.replace('#', '')}-seed${p.seed.toString(16)}.png`;
    canvas.toBlob((blob) => {
      if (!blob) return;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, 'image/png');
  }, []);

  return (
    <div className="app">
      <aside className="panel">
        <header className="app-title">
          <h1>瓷砖墙生成器</h1>
        </header>

        <MdTabs index={activeTab} onChanged={setActiveTab}>
          {TABS.map((t) => (
            <md-primary-tab key={t.label} aria-label={t.label}>
              <svg slot="icon" viewBox="0 -960 960 960" width="22" height="22" fill="currentColor">
                <path d={t.path} />
              </svg>
            </md-primary-tab>
          ))}
        </MdTabs>

        <div className="tabpanels">
          <section className={`group tabpanel${activeTab === 0 ? ' active' : ''}`}>
              <h2>色彩</h2>
              <ColorSection
                baseHex={params.baseHex}
                groutColor={params.groutColor}
                lastGroutHex={lastGroutHexRef.current}
                onBaseHex={onBaseHex}
                onRandomize={onRandomize}
                onGroutColor={onGroutColor}
              />
            </section>

          <section className={`group tabpanel${activeTab === 1 ? ' active' : ''}`}>
            <h2>尺寸</h2>
            <SizeSection
              cols={params.cols}
              rows={params.rows}
              tile={params.tile}
              grout={params.grout}
              onPatch={patch}
            />
          </section>

          <section className={`group tabpanel${activeTab === 2 ? ' active' : ''}`}>
            <h2>色差</h2>
            <DiffSection hue={params.hue} sat={params.sat} liq={params.liq} onPatch={patch} />
          </section>

          <section className={`group tabpanel${activeTab === 3 ? ' active' : ''}`}>
            <h2>布局</h2>
            <LayoutSection
              chip={params.chip}
              motif={params.motif}
              onChip={onChip}
              onMotif={(v) => patch({ motif: v })}
              onRegenerate={onRegenerate}
            />
          </section>

          <section className={`group tabpanel${activeTab === 4 ? ' active' : ''}`}>
            <h2>导出</h2>
            <ExportSection
              cols={params.cols}
              rows={params.rows}
              seed={params.seed}
              baseHex={params.baseHex}
              onSVG={downloadSVG}
              onPNG={downloadPNG}
            />
          </section>

          <section className={`group tabpanel${activeTab === 5 ? ' active' : ''}`}>
            <h2>关于</h2>
            <AboutSection />
          </section>
        </div>
      </aside>

      <section className="stage stage-bg">
        <canvas id="tileCanvas" ref={canvasRef}></canvas>
      </section>
    </div>
  );
}