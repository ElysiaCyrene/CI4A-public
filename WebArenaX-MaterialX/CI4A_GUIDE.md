# MUI CI4A 组件库使用指南

## 1. 概述

MUI CI4A 是基于 Material UI v9.2.0 改造的组件库。每个交互组件被包裹了一层 **Agent API Registry**，在浏览器中暴露 `window.__ci4a__` 全局对象，使外部 Agent 可以通过 JavaScript 以编程方式操控页面上的组件。

```
┌──────────────────────────────────────────────────────┐
│  window.__ci4a__                                     │
│  ├─ register(type, actions) → { data-cid }           │
│  ├─ unregister(id)                                   │
│  ├─ call(id, action, params) → {success, data, error}│
│  └─ exportSchema() → [{componentId, componentType,    │
│                         actions: [{name, params}]}]   │
└──────────────────────────────────────────────────────┘
```

## 2. CI4A API 参考

### 2.1 获取所有已注册组件

```js
const schema = window.__ci4a__.exportSchema()
// [
//   { componentId: "button_l8k2", componentType: "button",
//     actions: [{ name: "clickButton", params: [] }, { name: "getButtonStatus", params: [] }] },
//   { componentId: "select_m3x1", componentType: "select",
//     actions: [{ name: "getSelectStatus", params: [] }, { name: "setValue", params: [{ name: "value" }] }] },
//   ...
// ]
```

### 2.2 调用组件操作

```js
// 点击 Button #0
const schema = window.__ci4a__.exportSchema()
const button = schema.find(c => c.componentType === 'button')
await window.__ci4a__.call(button.componentId, 'clickButton')

// 设置 TextField 的值
const input = schema.find(c => c.componentType === 'input')
await window.__ci4a__.call(input.componentId, 'setValue', { value: 'Hello!' })

// 读取 Select 状态
const select = schema.find(c => c.componentType === 'select')
const status = await window.__ci4a__.call(select.componentId, 'getSelectStatus')
// status.data → { value: 'option1', options: [...], open: false }
```

### 2.3 返回格式

```ts
{
  success: boolean
  data?: any           // 操作返回值
  error?: {            // 失败时
    code: 'COMPONENT_NOT_FOUND' | 'ACTION_NOT_FOUND' | 'COMPONENT_DISABLED' | 'EXECUTION_ERROR'
    message: string
    details?: any
  }
  metadata: {
    componentId: string
    actionName: string
    timestamp: number
  }
}
```

## 3. 各组件 API

### 3.1 Button (`componentType: "button"`)

| Action | 参数 | 说明 |
|---|---|---|
| `clickButton` | — | 触发 onClick |
| `getButtonStatus` | — | 返回 `{ text, disabled, loading, variant, color }` |
| `setValue` | `{ text }` | 设置按钮文本 |

### 3.2 TextField (`componentType: "input"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getInputStatus` | — | 返回 `{ value, placeholder, disabled, readOnly, focused }` |
| `setValue` | `{ value }` | 设置输入值（触发 onChange） |

### 3.3 Select (`componentType: "select"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getSelectStatus` | — | 返回 `{ value, options: string[], open, disabled }` |
| `setValue` | `{ value }` | 设置选中值 |
| `openOptions` | — | 展开下拉 |
| `closeOptions` | — | 收起下拉 |

### 3.4 Autocomplete (`componentType: "autocomplete"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getAutocompleteStatus` | — | 返回 `{ value, options, inputValue, open, disabled }` |
| `setValue` | `{ value: { label, value } }` | 选中选项 |

### 3.5 Checkbox (`componentType: "checkbox"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getCheckboxStatus` | — | 返回 `{ checked, disabled, indeterminate }` |
| `setValue` | `{ checked }` | 设置勾选状态 |

### 3.6 Switch (`componentType: "switch"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getSwitchStatus` | — | 返回 `{ checked, disabled }` |
| `setValue` | `{ checked }` | 设置开关状态 |

### 3.7 RadioGroup (`componentType: "radiogroup"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getRadioGroupStatus` | — | 返回 `{ value, options: string[] }` |
| `setValue` | `{ value }` | 选中指定值 |

### 3.8 Radio (`componentType: "radio"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getRadioStatus` | — | 返回 `{ value, checked, disabled }` |
| `setValue` | — | 选中此 radio |

### 3.9 Rating (`componentType: "rating"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getRatingStatus` | — | 返回 `{ value, max, disabled, readOnly }` |

### 3.10 Slider (`componentType: "slider"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getSliderStatus` | — | 返回 `{ value, min, max, step, disabled }` |

### 3.11 Breadcrumbs (`componentType: "breadcrumb"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getBreadcrumbStatus` | — | 返回 `{ items: string[], keys: string[] }` |
| `navigateTo` | `{ key }` | 点击指定 key 的面包屑项 |

### 3.12 Pagination (`componentType: "pagination"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getPaginationStatus` | — | 返回 `{ page, count, disabled }` |
| `goToPage` | `{ page }` | 跳转到指定页 |

### 3.13 Menu (`componentType: "menu"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getMenuStatus` | — | 返回 `{ open, items: string[], keys: string[] }` |
| `navigateTo` | `{ key }` | 点击指定 key 的菜单项 |

### 3.14 Table (`componentType: "table"`)

| Action | 参数 | 说明 |
|---|---|---|
| `getTableStatus` | — | 返回 `{ columns, rows, selectedRows, selectAll }` |
| `selectRow` | `{ key }` | 切换指定行选中状态 |
| `selectAllRows` | — | 切换全选/取消全选 |

## 4. 在新项目中使用 MUI CI4A

### 4.1 前置条件

- Node.js ≥ 22
- pnpm ≥ 10（包管理器）

### 4.2 步骤概览

```
1. 从 monorepo 打包 8 个 .tgz
2. 创建 Vite + React 项目
3. 安装 .tgz + 外部依赖
4. 修复 version/index.ts（process.env）
5. 在 main.jsx 中初始化 ApiComponentRegistry
6. 像普通 MUI 一样使用组件
```

### 4.3 打包 MUI CI4A

```bash
# 1. 进入 demo 项目（或任何装了 @babel/core + @babel/preset-react 的环境）
cd your-project
pnpm add -D @babel/core @babel/preset-react

# 2. 运行打包脚本
node pack-mui.mjs
```

打包脚本核心逻辑：

```js
import { transformSync } from '@babel/core';
import { execSync } from 'child_process';

const MONOREPO = '../MaterialX/packages';
const packages = ['mui-types','mui-utils','mui-private-theming','mui-styled-engine',
                   'mui-system','mui-core-downloads-tracker','mui-material','mui-icons-material'];

for (const pkg of packages) {
  // a) 复制 src/ 到临时目录（mui-icons-material 用 lib/ → src/）
  // b) Babel 编译所有 .js 文件（@babel/preset-react, runtime:automatic）
  // c) Patch version/index.ts 替换 process.env.* 为字面量
  // d) 修改 package.json: workspace:^ → 实际版本号
  // e) pnpm pack → packages/<name>-<version>.tgz
}
```

### 4.4 项目配置

**package.json**（关键部分）:

```json
{
  "dependencies": {
    "@mui/material": "file:packages/mui-material-9.2.0.tgz",
    "@mui/icons-material": "file:packages/mui-icons-material-9.2.0.tgz",
    "@mui/system": "file:packages/mui-system-9.2.0.tgz",
    "@mui/utils": "file:packages/mui-utils-9.2.0.tgz",
    "@mui/private-theming": "file:packages/mui-private-theming-9.2.0.tgz",
    "@mui/styled-engine": "file:packages/mui-styled-engine-9.1.1.tgz",
    "@mui/types": "file:packages/mui-types-9.1.1.tgz",
    "@mui/core-downloads-tracker": "file:packages/mui-core-downloads-tracker-9.2.0.tgz",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.0",
    "vite": "^8.0.0"
  }
}
```

**vite.config.js**:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

### 4.5 必须的初始化代码

**src/main.jsx** 最顶部——在 React 挂载之前：

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ⚠️ 必须！初始化 CI4A 注册中心
// Vite/Rolldown 预打包会 drop 掉 @mui/material 入口文件的副作用导入，
// 所以必须在这里显式初始化。
class ApiComponentRegistry {
  constructor() {
    this.components = new Map();
    this.timestamp = 0;
  }
  // ... 完整实现见项目 src/main.jsx ...
  register(component, actions) { /* ... */ }
  async call(id, actionName, params) { /* ... */ }
  exportSchema() { /* ... */ }
}

if (typeof window !== 'undefined' && !window.__ci4a__) {
  window.__ci4a__ = new ApiComponentRegistry();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

> **为什么不能 `import '@mui/material'` ？**
> Vite 的 Rolldown 预打包器看到 `import './AgentApiRegistry/AgentApiRegistry.js'` 是一个纯副作用导入——没有其他模块引用其 `export class ApiComponentRegistry`——于是直接把它从打包产物里删掉了。`window.__ci4a__` 永远不会被创建。

### 4.6 使用 CI4A 组件

像普通 MUI 一样使用，CI4A 自动生效：

```jsx
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function MyPage() {
  return (
    <div>
      <Button variant="contained" onClick={() => console.log('clicked')}>
        Submit
      </Button>

      <TextField
        label="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <Select value={val} onChange={e => setVal(e.target.value)}>
        <MenuItem value="a">Option A</MenuItem>
        <MenuItem value="b">Option B</MenuItem>
      </Select>
    </div>
  );
}
```

组件挂载后自动向 `window.__ci4a__` 注册，卸载时自动取消注册（`useEffect` cleanup）。

### 4.7 调试

在浏览器控制台：

```js
// 查看所有注册的组件
window.__ci4a__.exportSchema()

// 按类型查找
window.__ci4a__.exportSchema().filter(c => c.componentType === 'button')

// 调用第一个按钮
const btn = window.__ci4a__.exportSchema().find(c => c.componentType === 'button')
await window.__ci4a__.call(btn.componentId, 'clickButton')
```

## 5. 组件列表

以下 MUI 组件已被 CI4A 包裹（`componentType`）：

| componentType | MUI 组件 | 关键操作 |
|---|---|---|
| `button` | Button | clickButton, getButtonStatus |
| `input` | TextField | getInputStatus, setValue |
| `select` | Select | getSelectStatus, setValue |
| `autocomplete` | Autocomplete | getAutocompleteStatus, setValue |
| `checkbox` | Checkbox | getCheckboxStatus, setValue |
| `switch` | Switch | getSwitchStatus, setValue |
| `radiogroup` | RadioGroup | getRadioGroupStatus, setValue |
| `radio` | Radio | getRadioStatus, setValue |
| `rating` | Rating | getRatingStatus |
| `slider` | Slider | getSliderStatus |
| `breadcrumb` | Breadcrumbs | getBreadcrumbStatus, navigateTo |
| `pagination` | Pagination | getPaginationStatus, goToPage |
| `menu` | Menu | getMenuStatus, navigateTo |
| `table` | Table | getTableStatus, selectRow, selectAllRows |

## 6. 目录结构参考

```
your-project/
├── index.html
├── package.json
├── vite.config.js
├── packages/                          # MUI CI4A tarballs
│   ├── mui-material-9.2.0.tgz
│   ├── mui-icons-material-9.2.0.tgz
│   ├── mui-system-9.2.0.tgz
│   ├── mui-utils-9.2.0.tgz
│   ├── mui-private-theming-9.2.0.tgz
│   ├── mui-styled-engine-9.1.1.tgz
│   ├── mui-types-9.1.1.tgz
│   └── mui-core-downloads-tracker-9.2.0.tgz
├── src/
│   ├── main.jsx                       # ← ApiComponentRegistry 初始化
│   └── App.jsx                        # 页面代码
└── node_modules/
```

## 7. 已知限制

1. **必须内联 ApiComponentRegistry** —— Vite/Rolldown 预打包会删除副作用链
2. **`process.env` 不可用** —— `version/index.ts` 需 patch 为字面量
3. **`.js` 源文件含 JSX** —— 打包时必须 Babel 全量编译，不能只编译检测到的文件
4. **mui-icons-material 的 lib/ vs src/** —— 图标源文件在 `lib/`，但 exports 指向 `src/`
5. **Rating 的 setValue 未实现** —— 当前 Rating 组件未暴露 `setValue` action（依赖 onChange 回调签名不匹配）
