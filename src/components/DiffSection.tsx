import { SliderRow } from './md';

export function DiffSection(props: {
  hue: number;
  sat: number;
  liq: number;
  onPatch: (p: Partial<{ hue: number; sat: number; liq: number }>) => void;
}) {
  const { hue, sat, liq, onPatch } = props;
  return (
    <div className="slidergrid">
      <SliderRow id="hueR" label="色相偏移" value={hue} min={0} max={60} step={1} fmt={(v) => `±${v}°`} onInput={(v) => onPatch({ hue: v })} />
      <SliderRow id="satR" label="饱和度偏移" value={sat} min={0} max={60} step={1} fmt={(v) => `±${v}%`} onInput={(v) => onPatch({ sat: v })} />
      <SliderRow id="liqR" label="明度偏移" value={liq} min={0} max={80} step={1} fmt={(v) => `±${v}%`} onInput={(v) => onPatch({ liq: v })} />
    </div>
  );
}