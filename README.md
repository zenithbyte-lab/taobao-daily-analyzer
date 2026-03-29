<div align="center">

# 淘宝日用品数据分析与可视化平台

**本系统基于Python爬虫技术，从淘宝平台采集日用品商品数据，结合Flask后端与React前端，实现数据的存储、分析与可视化展示。系统提供商品浏览、多维统计、类目分析、销量预测等功能，助力商家精准掌握日用品市场趋势。**

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3.8-FF6384?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [默认账户](#默认账户)
- [数据规模](#数据规模)
- [API 文档概览](#api-文档概览)
- [许可证](#许可证)

---

## 功能特性

| 序号 | 模块 | 功能说明 |
|------|------|---------|
| 1 | 用户认证 | 注册、登录、JWT Token 鉴权、密码修改 |
| 2 | 总览看板 | 商品总数、平均价格、总销量、好评率等核心指标一览，趋势图表展示 |
| 3 | 商品浏览 | 关键词搜索、分类筛选、价格区间过滤、多维排序、分页展示 |
| 4 | 商品详情 | 商品信息展示、评论列表、情感分析标签、收藏功能 |
| 5 | 采集任务 | 数据源管理与采集批次展示，查看爬虫任务执行状态 |
| 6 | 数据处理 | 数据清洗与特征工程流程可视化，展示NLP情感分析处理链路 |
| 7 | 类目分析 | 分类销量对比、价格分布、地域热力分析、评论关键词云 |
| 8 | 销量预测 | 基于线性回归的未来销量趋势预测与可视化 |
| 9 | 管理中心 | 采集任务管理、数据导出功能 |
| 10 | 个人中心 | 个人资料编辑、收藏管理、浏览历史记录 |
| 11 | 情感分析 | 基于NLP的评论情感自动分类（正面/中性/负面） |
| 12 | 数据导出 | 支持将分析结果导出为CSV格式 |

---

## 技术栈

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Python | 3.9+ | 运行环境 |
| Flask | 3.0 | Web 框架 |
| Flask-JWT-Extended | 4.6.0 | JWT 认证与授权 |
| Flask-CORS | 4.0.0 | 跨域请求支持 |
| SQLite | 3 | 轻量级嵌入式数据库 |
| Werkzeug | 3.0.1 | WSGI 工具库（密码哈希） |

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.8 | 类型安全 |
| Vite | 6 | 构建工具 |
| Tailwind CSS | 4 | 原子化 CSS |
| Recharts | 3.8 | 图表可视化 |
| React Router | 7 | 路由管理 |
| Lucide React | - | 图标库 |
| Motion | - | 动画库 |

---

## 项目结构

```
taobao-analyzer/
├── README.md                         # 项目总文档
├── backend/                          # 后端服务
│   ├── run.py                        # 启动入口
│   ├── config.py                     # 配置文件（密钥、数据库路径等）
│   ├── requirements.txt              # Python 依赖
│   ├── init_data.py                  # 淘宝采集数据初始化脚本
│   ├── README.md                     # 后端文档
│   ├── data/                         # SQLite 数据库文件目录
│   │   └── taobao.db                 # 数据库文件
│   └── app/                          # 应用模块
│       ├── __init__.py               # Flask 应用工厂（create_app）
│       ├── models.py                 # 数据库模型与表结构定义
│       ├── utils.py                  # 工具函数（数据库连接、响应封装）
│       ├── auth/                     # 认证模块
│       │   ├── __init__.py
│       │   └── routes.py             # 登录/注册/用户管理接口
│       ├── products/                 # 商品模块
│       │   ├── __init__.py
│       │   └── routes.py             # 商品查询/收藏/浏览接口
│       ├── stats/                    # 统计分析模块
│       │   ├── __init__.py
│       │   └── routes.py             # 统计/预测/关键词接口
│       └── user/                     # 用户数据模块
│           ├── __init__.py
│           └── routes.py             # 收藏/历史/统计接口
├── frontend/                         # 前端应用
│   ├── package.json                  # Node.js 依赖配置
│   ├── vite.config.ts                # Vite 构建配置
│   ├── tsconfig.json                 # TypeScript 配置
│   ├── index.html                    # HTML 入口
│   ├── README.md                     # 前端文档
│   └── src/                          # 源代码
│       ├── main.tsx                  # 应用入口
│       ├── App.tsx                   # 根组件与路由配置
│       ├── api.ts                    # API 请求封装
│       ├── index.css                 # 全局样式
│       ├── context/                  # React Context
│       │   └── AuthContext.tsx        # 认证状态管理
│       └── components/               # 页面组件
│           ├── LoginPage.tsx                 # 登录页
│           ├── RegisterPage.tsx              # 注册页
│           ├── OverviewDashboard.tsx         # 总览看板
│           ├── CollectionTasks.tsx           # 采集任务
│           ├── DataProcessing.tsx            # 数据处理
│           ├── CategoryAnalysis.tsx          # 类目分析
│           ├── SalesPrediction.tsx           # 销量预测
│           ├── ManagementCenter.tsx          # 管理中心
│           ├── ProductListPage.tsx           # 商品列表
│           ├── ProductDetailPage.tsx         # 商品详情
│           ├── ProfilePage.tsx              # 个人中心
│           ├── Header.tsx                   # 头部组件
│           └── StatCard.tsx                 # 统计卡片组件
```

---

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 18+
- npm 9+

### 第一步：克隆项目

```bash
git clone <repository-url>
cd taobao-analyzer
```

### 第二步：启动后端服务

```bash
cd backend

# 创建并激活虚拟环境（推荐）
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务（默认端口 5001）
python run.py
```

启动后，后端服务运行在 `http://localhost:5001`，数据库自动初始化并加载采集数据。

### 第三步：导入完整采集数据（可选）

如需导入完整规模的淘宝采集数据（约 8000+ 商品、30000+ 评论），运行：

```bash
python init_data.py
```

> 注意：该脚本会清空已有数据后重新导入完整数据集。

### 第四步：启动前端应用

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器（默认端口 3000）
npm run dev
```

启动后，在浏览器打开 `http://localhost:3000` 即可访问平台。

---

## 默认账户

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | `admin` | `admin123` | 系统默认管理员账户 |
| 普通用户 | `user1` | `123456` | 可通过注册页面自行创建 |

---

## 数据规模

以下数据均采集自淘宝平台：

| 数据项 | 数量 | 说明 |
|--------|------|------|
| 商品数据 | 约 8,120 条 | 采集自淘宝平台，覆盖日用品全品类 |
| 评论数据 | 约 32,000 条 | 采集自淘宝平台，含情感分析标签与评分 |
| 商品分类 | 14 个 | 个人护理、家庭清洁、纸品湿巾、洗衣用品、厨房用品等 |
| 店铺地域 | 20 个 | 覆盖杭州、上海、广州、深圳、北京等主要电商城市 |

---

## API 文档概览

所有接口基础路径：`http://localhost:5001/api`

### 认证模块 (`/api/auth`)

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 否 |
| POST | `/api/auth/login` | 用户登录 | 否 |
| GET | `/api/auth/profile` | 获取个人信息 | 是 |
| PUT | `/api/auth/profile` | 更新个人信息 | 是 |
| PUT | `/api/auth/password` | 修改密码 | 是 |

### 商品模块 (`/api`)

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/api/products` | 商品列表（支持搜索、筛选、排序、分页） | 否 |
| GET | `/api/products/:id` | 商品详情（含评论） | 否 |
| GET | `/api/categories` | 分类列表 | 否 |
| GET | `/api/products/:id/comments` | 商品评论列表 | 否 |
| POST | `/api/products/:id/view` | 记录商品浏览 | 可选 |
| POST | `/api/products/:id/favorite` | 收藏商品 | 是 |
| DELETE | `/api/products/:id/favorite` | 取消收藏 | 是 |

### 统计分析模块 (`/api/stats`)

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/api/stats/overview` | 总览数据（商品数、均价、销量、好评率） | 否 |
| GET | `/api/stats/price-distribution` | 价格区间分布 | 否 |
| GET | `/api/stats/category-sales` | 分类销量统计 | 否 |
| GET | `/api/stats/region-heat` | 地域热力数据 | 否 |
| GET | `/api/stats/daily-trend` | 每日趋势（近30天） | 否 |
| GET | `/api/stats/top-products` | 热销商品排行 | 否 |
| GET | `/api/stats/prediction` | 销量预测数据 | 否 |
| GET | `/api/stats/keyword-cloud` | 评论关键词云 | 否 |

### 用户数据模块 (`/api/user`)

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | `/api/user/stats` | 用户统计（收藏数、浏览数） | 是 |
| GET | `/api/user/favorites` | 收藏列表 | 是 |
| DELETE | `/api/user/favorites/:id` | 移除收藏 | 是 |
| GET | `/api/user/history` | 浏览历史 | 是 |
| GET | `/api/favorites` | 收藏列表（分页） | 是 |
| POST | `/api/favorites` | 添加收藏 | 是 |
| DELETE | `/api/favorites/:id` | 删除收藏 | 是 |
| GET | `/api/history` | 浏览历史（分页） | 是 |
| POST | `/api/history` | 记录浏览 | 是 |

> 完整 API 文档请参阅 [backend/README.md](./backend/README.md)

---

## 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

```
MIT License

Copyright (c) 2024 Taobao Analyzer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
