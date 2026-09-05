import { MdFilledButton, MdOutlinedButton } from './md';

const DL_ICON = 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z';
const IMG_ICON =
  'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z';

export function ExportSection(props: {
  cols: number;
  rows: number;
  seed: number;
  baseHex: string;
  onSVG: () => void;
  onPNG: () => void;
}) {
  const { cols, rows, seed, baseHex, onSVG, onPNG } = props;
  return (
    <>
      <div className="btns">
        <MdFilledButton id="download" onClick={onSVG}>
          <svg slot="icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d={DL_ICON} />
          </svg>
          导出 SVG
        </MdFilledButton>
        <MdOutlinedButton id="downloadPng" onClick={onPNG}>
          <svg slot="icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d={IMG_ICON} />
          </svg>
          导出 PNG
        </MdOutlinedButton>
      </div>
      <div className="meta">
        <b>
          {cols}×{rows}
        </b>{' '}
        = <b>{cols * rows}</b> 块瓷砖 ｜ 种子 <b>#{seed.toString(16).padStart(8, '0')}</b> ｜ 基准色{' '}
        <b>{baseHex}</b>
      </div>
    </>
  );
}