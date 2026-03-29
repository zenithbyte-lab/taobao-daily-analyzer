# 淘宝日用品数据分析平台 - 前端应用

基于React 19构建的数据分析可视化前端，展示从淘宝平台采集的日用品商品数据，提供多维度统计图表、商品浏览、类目分析等交互功能。

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19.0 | UI 框架 |
| TypeScript | 5.8 | 类型安全的 JavaScript 超集 |
| Vite | 6.2 | 下一代前端构建工具 |
| Tailwind CSS | 4.1 | 原子化 CSS 框架 |
| Recharts | 3.8 | 基于 React 的图表可视化库 |
| React Router | 7.13 | 声明式路由管理 |
| Lucide React | 0.546 | 精美图标库 |
| Motion | 12.23 | 动画库 |
| clsx / tailwind-merge | - | 类名合并工具 |

---

## 页面功能

### 公开页面

| 页面 | 路由 | 组件 | 说明 |
|------|------|------|------|
| 登录 | `/login` | `LoginPage` | 用户名密码登录，支持跳转注册 |
| 注册 | `/register` | `RegisterPage` | 新用户注册，支持邮箱填写 |

### 需要登录的页面

| 页面 | 路由 | 组件 | 说明 |
|------|------|------|------|
| 总览看板 | `/dashboard` | `OverviewDashboard` | 核心指标概览，包含商品数、销量、均价、好评率等多维统计卡片与趋势图表 |
| 采集任务 | `/dashboard/collection` | `CollectionTasks` | 数据源管理与采集批次展示 |
| 数据处理 | `/dashboard/processing` | `DataProcessing` | 数据清洗与特征工程流程可视化 |
| 类目分析 | `/dashboard/category` | `CategoryAnalysis` | 分类销量对比柱状图、价格区间分布、地域热力分析、评论关键词云 |
| 销量预测 | `/dashboard/prediction` | `SalesPrediction` | 基于历史数据的线性回归销量预测，展示实际值与预测趋势线 |
| 管理中心 | `/dashboard/management` | `ManagementCenter` | 采集任务管理与数据导出功能 |
| 商品列表 | `/products` | `ProductListPage` | 支持关键词搜索、分类筛选、价格区间过滤、多维排序和分页浏览 |
| 商品详情 | `/products/:id` | `ProductDetailPage` | 商品完整信息、评论列表（含情感标签）、收藏操作 |
| 个人中心 | `/profile` | `ProfilePage` | 个人资料编辑、密码修改、收藏管理、浏览历史查看 |

### 布局结构

- **侧边栏导航**：深色背景，分为"数据分析"和"功能"两个导航分区，底部显示当前用户信息与登出按钮
- **主内容区**：浅灰色背景，响应式内容区域
- **路由守卫**：未登录用户自动重定向至登录页面

---

## 开发命令

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认运行在 `http://localhost:3000`，支持热模块替换（HMR）。

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

### 类型检查

```bash
npm run lint
```

执行 TypeScript 类型检查（`tsc --noEmit`）。

### 清理构建产物

```bash
npm run clean
```

删除 `dist/` 目录。

---

## API 连接配置

### API 基础路径

API 请求的基础路径在 `src/api.ts` 中配置：

```typescript
const BASE_URL = 'http://localhost:5001/api';
```

如需修改后端地址，直接编辑该常量即可。

### 跨域说明

后端已配置 CORS 允许来自以下地址的请求：

- `http://localhost:3000`（前端开发服务器默认端口）
- `http://localhost:5173`（Vite 默认端口备选）

---

## 状态管理

### AuthContext

位于 `src/context/AuthContext.tsx`，提供全局认证状态管理：

- **状态**：`user`（当前用户信息）、`loading`（加载状态）
- **方法**：`login()`（登录并存储 Token）、`logout()`（登出并清除 Token）
- **持久化**：Token 存储在 `localStorage` 中，页面刷新后自动恢复登录状态
- **使用方式**：通过 `useAuth()` Hook 在任意组件中获取认证状态

### API 封装

位于 `src/api.ts`，统一封装所有后端请求：

- 自动从 `localStorage` 读取 Token 并注入请求头
- 统一错误处理（非 200 状态码抛出异常）
- 统一 JSON 解析与数据提取
