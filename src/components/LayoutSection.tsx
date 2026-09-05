import { type ChipMode } from '../tile';
import { MdFilterChip, MdOutlinedButton, SliderRow } from './md';

const REFRESH_ICON =
  'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 8.74C4.46 9.97 4 11.43 4 13c0 4.42 3.58 8 8 8v4l5-5-5-5v4z';

export function LayoutSection(props: {
  chip: ChipMode;
  motif: number;
  onChip: (m: ChipMode) => void;
  onMotif: (v: number) => void;
  onRegenerate: () => void;
}) {
  const { chip, motif } = props;
  return (
    <>
      <div className="lbl">风格</div>
      <div className="chips">
        <MdFilterChip id="chipNoise" selected={chip === 'noise'} onClick={() => props.onChip('noise')}>
          港铁风格
        </MdFilterChip>
        <MdFilterChip id="chipGrid" selected={chip === 'grid'} onClick={() => props.onChip('grid')}>
          工字形
        </MdFilterChip>
      </div>
      {chip === 'grid' && (
        <div className="slidergrid" id="motifWrap">
          <SliderRow
            id="motifAmp"
            label="整体色块纹样强度"
            value={motif}
            min={0}
            max={30}
            step={1}
            onInput={props.onMotif}
          />
        </div>
      )}
      <MdOutlinedButton id="regenerate" onClick={props.onRegenerate}>
        <svg slot="icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d={REFRESH_ICON} />
        </svg>
        换个砌法
      </MdOutlinedButton>
    </>
  );
}