# 淘宝日用品数据分析平台 - 后端服务

本后端服务负责淘宝采集数据的存储、查询与统计分析，基于Flask框架构建RESTful API，为前端提供完整的数据接口支持。

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Python | 3.9+ | 运行环境 |
| Flask | 3.0.0 | Web 框架 |
| Flask-CORS | 4.0.0 | 跨域请求支持 |
| Flask-JWT-Extended | 4.6.0 | JWT 认证与授权 |
| Werkzeug | 3.0.1 | WSGI 工具库（密码哈希） |
| SQLite | 3 | 轻量级嵌入式数据库 |

---

## 目录结构

```
backend/
├── run.py                    # 应用启动入口
├── config.py                 # 配置文件（密钥、数据库路径等）
├── requirements.txt          # Python 依赖清单
├── init_data.py              # 淘宝采集数据初始化脚本
├── README.md                 # 后端文档
├── data/                     # 数据目录
│   └── taobao.db             # SQLite 数据库文件
└── app/                      # 应用模块
    ├── __init__.py            # Flask 应用工厂（create_app）
    ├── models.py              # 数据库表结构定义与初始化
    ├── utils.py               # 公共工具函数（数据库连接、响应封装）
    ├── auth/                  # 认证模块
    │   ├── __init__.py
    │   └── routes.py          # 登录/注册/用户资料/密码管理
    ├── products/              # 商品模块
    │   ├── __init__.py
    │   └── routes.py          # 商品查询/收藏/浏览记录
    ├── stats/                 # 统计分析模块
    │   ├── __init__.py
    │   └── routes.py          # 统计/预测/关键词分析
    └── user/                  # 用户数据模块
        ├── __init__.py
        └── routes.py          # 收藏/历史/用户统计
```

---

## 安装与启动

### 1. 环境准备

确保已安装 Python 3.9 或更高版本：

```bash
python --version
```

### 2. 创建虚拟环境

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 启动服务

```bash
python run.py
```

服务启动后：
- 运行地址：`http://localhost:5001`
- 自动创建 `data/taobao.db` 数据库
- 自动初始化表结构
- 自动导入初始采集数据与默认管理员账户 `admin / admin123`

### 5. 导入完整采集数据（可选）

如需导入完整规模的淘宝采集数据（约 8000+ 商品、30000+ 评论），运行：

```bash
python init_data.py
```

> 注意：该脚本会清空已有数据后重新导入完整数据集。

---

## API 接口文档

所有接口统一返回格式：

```json
{
  "code": 200,
  "data": {},
  "message": "success"
}
```

认证方式：在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

---

### 认证模块

蓝图前缀：`/api/auth`

#### POST `/api/auth/register` - 用户注册

- 鉴权：否
- 请求体：

```json
{
  "username": "string (必填)",
  "password": "string (必填, >= 6位)",
  "email": "string (选填)"
}
```

- 成功响应：

```json
{
  "code": 200,
  "data": {
    "token": "jwt_token_string",
    "user": { "id": 1, "username": "xxx", "email": "xxx", "role": "user" }
  },
  "message": "register success"
}
```

---

#### POST `/api/auth/login` - 用户登录

- 鉴权：否
- 请求体：

```json
{
  "username": "string (必填)",
  "password": "string (必填)"
}
```

- 成功响应：

```json
{
  "code": 200,
  "data": {
    "token": "jwt_token_string",
    "user": { "id": 1, "username": "xxx", "email": "xxx", "avatar": "", "role": "admin", "created_at": "..." }
  },
  "message": "login success"
}
```

---

#### GET `/api/auth/profile` - 获取个人信息

- 鉴权：是
- 响应字段：`id`, `username`, `email`, `avatar`, `role`, `created_at`

---

#### PUT `/api/auth/profile` - 更新个人信息

- 鉴权：是
- 请求体：

```json
{
  "username": "string (选填)",
  "email": "string (选填)",
  "avatar": "string (选填)"
}
```

---

#### PUT `/api/auth/password` - 修改密码

- 鉴权：是
- 请求体：

```json
{
  "old_password": "string (必填)",
  "new_password": "string (必填, >= 6位)"
}
```

---

### 商品模块

蓝图前缀：`/api`

#### GET `/api/products` - 商品列表

- 鉴权：否
- 查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | int | 1 | 页码 |
| `page_size` | int | 20 | 每页数量 |
| `keyword` | string | - | 搜索关键词（匹配标题和标签） |
| `category` | string | - | 分类筛选 |
| `min_price` | float | - | 最低价格 |
| `max_price` | float | - | 最高价格 |
| `sort_by` | string | - | 排序方式：`price` / `price_desc` / `sales` / `rating` |

- 响应：分页商品列表

---

#### GET `/api/products/:id` - 商品详情

- 鉴权：否
- 路径参数：`id` - 商品 ID
- 响应：商品完整信息 + 最近 50 条评论

---

#### GET `/api/categories` - 分类列表

- 鉴权：否
- 响应：各分类名称及对应商品数量

---

#### GET `/api/products/:id/comments` - 商品评论

- 鉴权：否
- 响应：该商品最近 50 条评论

---

#### POST `/api/products/:id/view` - 记录浏览

- 鉴权：可选（已登录时记录）
- 说明：访问商品详情时调用，自动记录浏览历史

---

#### POST `/api/products/:id/favorite` - 收藏商品

- 鉴权：是
- 说明：将商品加入收藏，重复收藏不报错

---

#### DELETE `/api/products/:id/favorite` - 取消收藏

- 鉴权：是
- 说明：从收藏中移除指定商品

---

### 统计分析模块

蓝图前缀：`/api/stats`

#### GET `/api/stats/overview` - 总览数据

- 鉴权：否
- 响应字段：

| 字段 | 说明 |
|------|------|
| `total_products` | 商品总数 |
| `avg_price` | 平均价格 |
| `total_sales` | 总销量 |
| `category_count` | 分类数量 |
| `positive_rate` | 好评率（百分比） |
| `total_comments` | 评论总数 |

---

#### GET `/api/stats/price-distribution` - 价格区间分布

- 鉴权：否
- 响应：按价格区间（0-20, 20-40, 40-60, 60-80, 80+）统计商品数、销量、情感分布

---

#### GET `/api/stats/category-sales` - 分类销量

- 鉴权：否
- 响应：各分类的总销量、商品数、平均价格、平均评分

---

#### GET `/api/stats/region-heat` - 地域热力

- 鉴权：否
- 响应：各地区的销量、商品数、平均价格（TOP 20）

---

#### GET `/api/stats/daily-trend` - 每日趋势

- 鉴权：否
- 响应：近 30 天每日销量、新增商品数、评论数

---

#### GET `/api/stats/top-products` - 热销排行

- 鉴权：否
- 查询参数：`n` (int, 默认 10) - 返回数量
- 响应：销量 TOP N 商品列表

---

#### GET `/api/stats/prediction` - 销量预测

- 鉴权：否
- 响应：近 7 天实际销量 + 未来 2 天线性回归预测值

---

#### GET `/api/stats/keyword-cloud` - 关键词云

- 鉴权：否
- 响应：评论中出现频率最高的 80 个关键词及其计数

---

### 用户数据模块

蓝图前缀：`/api/user` 及 `/api`

#### GET `/api/user/stats` - 用户统计

- 鉴权：是
- 响应：收藏数量、浏览记录数量、注册日期

---

#### GET `/api/user/favorites` - 用户收藏列表

- 鉴权：是
- 响应：用户收藏的商品列表（含商品信息）

---

#### DELETE `/api/user/favorites/:product_id` - 移除收藏

- 鉴权：是
- 路径参数：`product_id` - 商品 ID

---

#### GET `/api/user/history` - 浏览历史

- 鉴权：是
- 响应：最近 50 条浏览记录

---

#### GET `/api/favorites` - 收藏列表（分页）

- 鉴权：是
- 查询参数：`page`, `page_size`
- 响应：分页的收藏商品列表

---

#### POST `/api/favorites` - 添加收藏

- 鉴权：是
- 请求体：`{ "product_id": int }`

---

#### DELETE `/api/favorites/:product_id` - 删除收藏

- 鉴权：是

---

#### GET `/api/history` - 浏览历史（分页）

- 鉴权：是
- 查询参数：`page`, `page_size`

---

#### POST `/api/history` - 记录浏览

- 鉴权：是
- 请求体：`{ "product_id": int }`

---

## 数据库结构

### users - 用户表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | 用户 ID |
| `username` | TEXT | UNIQUE NOT NULL | 用户名 |
| `password_hash` | TEXT | NOT NULL | 密码哈希值 |
| `email` | TEXT | - | 邮箱 |
| `avatar` | TEXT | DEFAULT '' | 头像 URL |
| `role` | TEXT | DEFAULT 'user', CHECK IN ('admin','user') | 角色 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 注册时间 |

### products - 商品表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | 商品 ID |
| `title` | TEXT | NOT NULL | 商品标题 |
| `category` | TEXT | NOT NULL | 所属分类 |
| `sub_category` | TEXT | DEFAULT '' | 子分类 |
| `price` | REAL | NOT NULL | 当前价格 |
| `original_price` | REAL | DEFAULT 0 | 原价 |
| `sales` | INTEGER | DEFAULT 0 | 总销量 |
| `monthly_sales` | INTEGER | DEFAULT 0 | 月销量 |
| `rating` | REAL | DEFAULT 5.0 | 评分 |
| `review_count` | INTEGER | DEFAULT 0 | 评论数 |
| `shop_name` | TEXT | DEFAULT '' | 店铺名称 |
| `shop_location` | TEXT | DEFAULT '' | 店铺所在地 |
| `image_url` | TEXT | DEFAULT '' | 商品图片 URL |
| `tags` | TEXT | DEFAULT '' | 标签（逗号分隔） |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 采集时间 |

### comments - 评论表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | 评论 ID |
| `product_id` | INTEGER | NOT NULL, FK -> products(id) CASCADE | 关联商品 |
| `user_name` | TEXT | DEFAULT '' | 评论者名称 |
| `content` | TEXT | NOT NULL | 评论内容 |
| `sentiment` | TEXT | DEFAULT 'neutral', CHECK IN ('positive','neutral','negative') | 情感标签 |
| `sentiment_score` | REAL | DEFAULT 0.5 | 情感得分（0-1） |
| `rating` | REAL | DEFAULT 5.0 | 评分 |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 评论时间 |

### favorites - 收藏表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | 收藏 ID |
| `user_id` | INTEGER | NOT NULL, FK -> users(id) CASCADE | 用户 ID |
| `product_id` | INTEGER | NOT NULL, FK -> products(id) CASCADE | 商品 ID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 收藏时间 |

> UNIQUE 约束：`(user_id, product_id)` 防止重复收藏

### browse_history - 浏览历史表

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | 记录 ID |
| `user_id` | INTEGER | NOT NULL, FK -> users(id) CASCADE | 用户 ID |
| `product_id` | INTEGER | NOT NULL, FK -> products(id) CASCADE | 商品 ID |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 浏览时间 |

### 索引

| 索引名 | 表 | 列 |
|--------|----|----|
| `idx_products_category` | products | category |
| `idx_products_price` | products | price |
| `idx_comments_product_id` | comments | product_id |
| `idx_comments_sentiment` | comments | sentiment |
| `idx_favorites_user_id` | favorites | user_id |
| `idx_browse_history_user_id` | browse_history | user_id |
