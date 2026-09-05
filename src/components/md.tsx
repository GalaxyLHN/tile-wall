import { useEffect, useRef, type ReactNode } from 'react';

/**
 * @material/web（Lit Web Components）× React 包装器。
 * 统一模式：ref + effect 同步 property（React 对自定义元素只按 attribute 传值，
 * boolean/number 类 property 需要显式写回），原生事件用 addEventListener 挂载。
 */

type MdSliderEl = HTMLElement & { value: number; min: number; max: number; step: number };
export function MdSlider(props: {
  id?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onInput: (v: number) => void;
}) {
  const ref = useRef<MdSliderEl>(null);
  const { value, onInput } = props;
  useEffect(() => {
    const el = ref.current;
    if (el && el.value !== value) el.value = value;
  }, [value]);
  useEffect(() => {
    const el = ref.current!;
    const h = () => onInput(el.value);
    el.addEventListener('input', h);
    return () => el.removeEventListener('input', h);
  }, [onInput]);
  return (
    <md-slider ref={ref} id={props.id} min={props.min} max={props.max} step={props.step} value={value}></md-slider>
  );
}

type MdTextFieldEl = HTMLElement & { value: string; label: string };
export function MdTextField(props: {
  id?: string;
  label: string;
  value: string;
  onChanged: (v: string) => void;
}) {
  const ref = useRef<MdTextFieldEl>(null);
  const valueRef = useRef(props.value);
  valueRef.current = props.value;
  const { value, onChanged } = props;
  useEffect(() => {
    const el = ref.current;
    if (el && el.value !== value) el.value = value;
  }, [value]);
  useEffect(() => {
    const el = ref.current!;
    const h = () => {
      onChanged(el.value);
      // 调用方若未接受该输入（如非法 HEX），下一帧弹回受控值
      requestAnimationFrame(() => {
        if (el.value !== valueRef.current) el.value = valueRef.current;
      });
    };
    el.addEventListener('change', h);
    return () => el.removeEventListener('change', h);
  }, [onChanged]);
  return (
    <md-outlined-text-field ref={ref} id={props.id} label={props.label} value={value}></md-outlined-text-field>
  );
}

type MdChipEl = HTMLElement & { selected: boolean };
export function MdFilterChip(props: {
  id?: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const ref = useRef<MdChipEl>(null);
  const { selected, onClick } = props;
  useEffect(() => {
    const el = ref.current;
    if (el && el.selected !== selected) el.selected = selected;
  }, [selected]);
  return (
    <md-filter-chip id={props.id} ref={ref} onClick={onClick}>
      {props.children}
    </md-filter-chip>
  );
}

type MdCheckboxEl = HTMLElement & { checked: boolean };
export function MdCheckbox(props: { id?: string; checked: boolean; onChanged: (v: boolean) => void }) {
  const ref = useRef<MdCheckboxEl>(null);
  const { checked, onChanged } = props;
  useEffect(() => {
    const el = ref.current;
    if (el && el.checked !== checked) el.checked = checked;
  }, [checked]);
  useEffect(() => {
    const el = ref.current!;
    const h = () => onChanged(el.checked);
    el.addEventListener('change', h);
    return () => el.removeEventListener('change', h);
  }, [onChanged]);
  return <md-checkbox id={props.id} ref={ref} touch-target="none"></md-checkbox>;
}

export function MdOutlinedButton(props: { id?: string; onClick: () => void; children: ReactNode }) {
  return <md-outlined-button id={props.id} onClick={props.onClick}>{props.children}</md-outlined-button>;
}

export function MdFilledButton(props: { id?: string; onClick: () => void; children: ReactNode }) {
  return <md-filled-button id={props.id} onClick={props.onClick}>{props.children}</md-filled-button>;
}

type MdTabsEl = HTMLElement & { activeTabIndex: number };
export function MdTabs(props: {
  index: number;
  onChanged: (i: number) => void;
  children: ReactNode;
}) {
  const ref = useRef<MdTabsEl>(null);
  const { index, onChanged } = props;
  useEffect(() => {
    const el = ref.current;
    if (el && el.activeTabIndex !== index) el.activeTabIndex = index;
  }, [index]);
  useEffect(() => {
    const el = ref.current!;
    const h = () => onChanged(el.activeTabIndex);
    el.addEventListener('change', h);
    return () => el.removeEventListener('change', h);
  }, [onChanged]);
  return (
    <md-tabs ref={ref} id="mobileTabs" active-tab-index={index}>
      {props.children}
    </md-tabs>
  );
}

/** 滑块行：标签 + 输出值 + md-slider */
export function SliderRow(props: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fmt?: (v: number) => string;
  onInput: (v: number) => void;
}) {
  const fmt = props.fmt ?? String;
  return (
    <>
      <div className="sf-row">
        <span className="lbl">{props.label}</span>
        <output>{fmt(props.value)}</output>
      </div>
      <MdSlider
        id={props.id}
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onInput={props.onInput}
      />
    </>
  );
}