import {
  applyTheme,
  argbFromHex,
  themeFromSourceColor,
} from '@material/material-color-utilities';

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

/**
 * 用种子色生成整套 Material 3 主题并应用到页面。
 * 亮/暗跟随操作系统设置（prefers-color-scheme）。
 * 注意 0.4.0 的 applyTheme 不写 surface-container-* 容器角色，
 * 那几档的颜色默认由 style.css 的 @media (prefers-color-scheme) 兜底。
 */
export function applyThemeFromSeed(
  seedHex: string,
  dark: boolean = darkQuery.matches,
): void {
  const theme = themeFromSourceColor(argbFromHex(seedHex));
  applyTheme(theme, { dark, target: document.documentElement });
  // 让原生控件（滚动条/输入框等）也跟随亮暗
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

/** 监听系统亮暗切换；seedHex 返回当前种子色，切换时用同一种子重新生成另一套 scheme。 */
export function watchSystemScheme(seedHex: () => string): void {
  darkQuery.addEventListener('change', (e) =>
    applyThemeFromSeed(seedHex(), e.matches),
  );
}