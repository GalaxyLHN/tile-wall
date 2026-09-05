import { useRef } from 'react';
import { hslToHex, hexToHsl } from '../tile';
import { MdCheckbox, MdOutlinedButton, MdTextField } from './md';

/** 骰子图标（24 坐标系） */
const DICE_ICON =
  'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5z';

function SwatchButton(props: { id: string; title: string; onClick: () => void; fill: string; transparent: boolean }) {
  return (
    <button
      id={props.id}
      type="button"
      className="h-[46px] w-[46px] flex-none rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-transparent p-[5px] flex items-center justify-center cursor-pointer hover:border-[var(--md-sys-color-primary)]"
      title={props.title}
      aria-label={props.title}
      onClick={props.onClick}
    >
      <span
        className={`h-full w-full rounded-[5px] ${props.transparent ? 'transparent' : ''}`}
        style={props.transparent ? undefined : { background: props.fill }}
      ></span>
    </button>
  );
}

export function ColorSection(props: {
  baseHex: string;
  groutColor: string;
  lastGroutHex: string;
  onBaseHex: (h: string) => void;
  onRandomize: () => void;
  onGroutColor: (c: string) => void;
}) {
  const { baseHex, groutColor, lastGroutHex } = props;
  const transparent = groutColor === 'transparent';
  const seedColorRef = useRef<HTMLInputElement>(null);
  const groutColorRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="seedrow">
        <SwatchButton
          id="btnSwatch"
          title="选择颜色"
          onClick={() => seedColorRef.current?.click()}
          fill={hslToHex(...hexToHsl(baseHex))}
          transparent={false}
        />
        <MdTextField
          id="seedHex"
          label="砖块颜色"
          value={baseHex}
          onChanged={(v) => {
            const m = /^#?([0-9a-fA-F]{6})$/.exec(v.trim());
            if (m) props.onBaseHex('#' + m[1]);
          }}
        />
        <input
          ref={seedColorRef}
          type="color"
          value={baseHex}
          hidden
          onChange={(e) => props.onBaseHex(e.target.value)}
        />
      </div>

      <MdOutlinedButton id="btnRandom" onClick={props.onRandomize}>
        <svg slot="icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d={DICE_ICON} />
        </svg>
        换个颜色
      </MdOutlinedButton>

      <div className="seedrow">
        <SwatchButton
          id="btnGroutPick"
          title="选择砖缝颜色"
          onClick={() => groutColorRef.current?.click()}
          fill={transparent ? lastGroutHex : groutColor}
          transparent={transparent}
        />
        <MdTextField
          id="groutHex"
          label="砖缝颜色"
          value={transparent ? lastGroutHex : groutColor}
          onChanged={(v) => {
            const m = /^#?([0-9a-fA-F]{6})$/.exec(v.trim());
            if (m) props.onGroutColor('#' + m[1]);
          }}
        />
        <input
          ref={groutColorRef}
          type="color"
          value={transparent ? lastGroutHex : groutColor}
          hidden
          onChange={(e) => props.onGroutColor(e.target.value)}
        />
      </div>

      <label className="groutcheck">
        <MdCheckbox id="chkGroutTransparent" checked={transparent} onChanged={(v) => props.onGroutColor(v ? 'transparent' : lastGroutHex)} />
        <span>砖缝透明</span>
      </label>
    </>
  );
}