import { SliderRow } from './md';

export function SizeSection(props: {
  cols: number;
  rows: number;
  tile: number;
  grout: number;
  onPatch: (p: Partial<{ cols: number; rows: number; tile: number; grout: number }>) => void;
}) {
  const { cols, rows, tile, grout, onPatch } = props;
  return (
    <div className="slidergrid">
      <SliderRow id="cols" label="列数" value={cols} min={5} max={60} step={1} onInput={(v) => onPatch({ cols: v })} />
      <SliderRow id="rows" label="行数" value={rows} min={5} max={40} step={1} onInput={(v) => onPatch({ rows: v })} />
      <SliderRow id="tile" label="瓷砖边长" value={tile} min={10} max={80} step={1} fmt={(v) => `${v}px`} onInput={(v) => onPatch({ tile: v })} />
      <SliderRow id="grout" label="砖缝宽度" value={grout} min={0} max={20} step={1} fmt={(v) => `${v}px`} onInput={(v) => onPatch({ grout: v })} />
    </div>
  );
}