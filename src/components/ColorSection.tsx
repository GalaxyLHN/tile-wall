import { hslToHex, hexToHsl } from '../tile';
import { MdCheckbox, MdOutlinedButton, MdTextField } from './md';

/** 骰子图标（24 坐标系） */
const DICE_ICON =
  'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5z';

/**
 * 取色器 swatch。
 * 不能用「隐藏 input + 按钮手动 .click()」触发（Safari/iOS 逼真实手势、
 * Chromium 对 hidden 元素弹取色器到左上角）。做法是让真实 <input type="color">
 * 绝对定位透明铺满整个色块，直接接收点击/触摸，原生打开取色器。
 */
function SwatchButton(props: {
  id: string;
  title: string;
  value: string; // color input 的合法值（#rrggbb）
  transparent: boolean; // 砖缝透明时显示透明棋盘底
  onChange: (v: string) => void;
}) {
  return (
    <div
      id={props.id}
      className="relative h-[46px] w-[46px] flex-none rounded-lg border border-[var(--md-sys-color-outline-variant)] p-[5px]"
    >
      <span
        className={`block h-full w-full rounded-[5px] ${props.transparent ? 'transparent' : ''}`}
        style={props.transparent ? undefined : { background: props.value }}
      ></span>
      <input
        type="color"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        aria-label={props.title}
        title={props.title}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
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

  return (
    <>
      <div className="seedrow">
        <SwatchButton
          id="btnSwatch"
          title="选择颜色"
          value={hslToHex(...hexToHsl(baseHex))}
          transparent={false}
          onChange={props.onBaseHex}
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
          value={transparent ? lastGroutHex : groutColor}
          transparent={transparent}
          onChange={props.onGroutColor}
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
      </div>

      <label className="groutcheck">
        <MdCheckbox id="chkGroutTransparent" checked={transparent} onChanged={(v) => props.onGroutColor(v ? 'transparent' : lastGroutHex)} />
        <span>砖缝透明</span>
      </label>
    </>
  );
}