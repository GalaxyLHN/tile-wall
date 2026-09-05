# tile-wall · 瓷砖墙生成器

> 港铁风格的方形瓷砖墙生成器 —— 用**一个种子颜色**，生成整面色差细微、错落有致的瓷砖墙，并导出 SVG / PNG。

灵感来自港铁站台那面经典的彩色瓷砖墙：等大的方砖、细微的色差、规律的砌法。这个工具让你在浏览器里复刻、定制并下载它。

---

## ✨ 特性

- **单一种子色驱动整面墙**：每个瓷砖在种子色的基础上做轻微色相 / 饱和度 / 明度偏移，看起来是"一面墙"而不是"一堆色块"。
- **两种砌法**：
  - **港铁风格**：等大方砖 + 细缝，接缝如发丝，连续马赛克质感（默认）。
  - **工字形**：隔行错缝半砖 + 可调"纹样强度"，模拟砌砖层次。
- **主题色随种子动态适配**：基于种子色用 Material 3 算法生成整套界面主题，亮 / 暗自动跟随系统。
- **自由调节**：墙身尺寸（列 / 行 / 砖边长 / 砖缝宽度）、色差幅度（色相 / 饱和 / 明度偏移）、随机取色。
- **砖缝颜色可定制**：任意 HEX，或设为透明露出页面背景。
- **导出 SVG / PNG**，文件名自动带上当前参数（尺寸 - 种子色 - seed）。
- **响应式**：桌面端左侧面板全展开；窄屏预览在上、5 个功能 tab 在下。

---

## 🚀 快速开始

需要 [Node.js](https://nodejs.org/) 18+ 与 [pnpm](https://pnpm.io/)。

```bash
pnpm install        # 安装依赖
pnpm dev            # 本地开发 http://localhost:5173
pnpm build          # 产物输出到 dist/
pnpm preview        # 预览构建结果
```

## 🎨 使用

| 分区 | 作用 |
| --- | --- |
| **色彩** | 砖块颜色、砖缝颜色（可透明）、随机换色（色相全域，饱和/明度 30–70%） |
| **尺寸** | 列数 5–60、行数 5–40、瓷砖边长 10–80px、砖缝宽度 0–20px |
| **色差** | 色相偏移 ±0–60°、饱和度偏移 ±0–60%、明度偏移 ±0–80% |
| **布局** | 港铁风格 / 工字形、纹样强度（仅工字形生效）、换个砌法 |
| **导出** | 导出 SVG、导出 PNG |

右上角 🎲 / 任一调节都会实时重绘整面墙。

---

## 🧱 技术栈

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [@material/web](https://github.com/material-components/material-web)（Material Design 3 组件）
- [material-color-utilities](https://github.com/material-foundation/material-color-utilities)（动态主题）

---

## 📦 目录结构

```
src/
├── main.tsx                  # React 入口
├── App.tsx                   # 根组件：参数状态 + 重绘 / 主题
├── tile.ts                   # 核心算法：颜色矩阵、画布渲染、SVG 导出
├── theme.ts                  # Material 3 动态主题 + 系统亮暗
├── custom-elements.d.ts      # @material/web 组件的 TS 声明
└── components/               # 面板各分区组件 + M3 组件封装层
```

---

## 📝 许可证

[MIT](./LICENSE)

---

## 👤 作者

**Galaxy Ling** — 用于探索前端组件化与动态主题的练习项目。
