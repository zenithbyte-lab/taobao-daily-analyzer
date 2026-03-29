import React, { useState, useEffect } from "react";
import Header from "./Header";
import { request } from "../api";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Layers,
  DollarSign,
  ThumbsUp,
  Calendar,
  MessageSquare,
  Star,
  Database,
} from "lucide-react";

const COLORS = [
  "#f97316",
  "#ea580c",
  "#0ea5e9",
  "#8b5cf6",
  "#10b981",
  "#f43f5e",
  "#eab308",
  "#6366f1",
];

const fallbackLineData = [
  { name: "03-01", sales: 650, reviews: 200 },
  { name: "03-02", sales: 700, reviews: 220 },
  { name: "03-03", sales: 750, reviews: 240 },
  { name: "03-04", sales: 800, reviews: 280 },
  { name: "03-05", sales: 850, reviews: 300 },
  { name: "03-06", sales: 900, reviews: 310 },
  { name: "03-07", sales: 950, reviews: 320 },
];

const fallbackPieData = [
  { name: "纸品湿巾", value: 400 },
  { name: "清洁收纳", value: 300 },
  { name: "厨房用品", value: 200 },
  { name: "个护日化", value: 100 },
  { name: "家居百货", value: 80 },
  { name: "衣物护理", value: 60 },
];

const fallbackBarData = [
  { name: "杭州", value: 18 },
  { name: "广州", value: 15 },
  { name: "上海", value: 14.5 },
  { name: "深圳", value: 13 },
  { name: "成都", value: 12 },
  { name: "北京", value: 11 },
  { name: "武汉", value: 9 },
  { name: "南京", value: 8 },
];

interface OverviewStats {
  total_products: number;
  total_categories: number;
  avg_price: number;
  positive_rate: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100">
        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name === "sales" ? "销量" : "评论"}: {p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100">
        <p className="text-sm font-semibold text-slate-700">
          {payload[0].name}: {payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100">
        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-teal-700">
          销量: {payload[0].value?.toLocaleString()} 万
        </p>
      </div>
    );
  }
  return null;
};

export default function OverviewDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [lineData, setLineData] = useState(fallbackLineData);
  const [pieData, setPieData] = useState(fallbackPieData);
  const [barData, setBarData] = useState(fallbackBarData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overview, daily, categorySales, regionHeat] = await Promise.allSettled([
          request('/stats/overview'),
          request('/stats/daily-trend'),
          request('/stats/category-sales'),
          request('/stats/region-heat'),
        ]);
        if (overview.status === 'fulfilled') {
          const o = overview.value;
          setStats({ total_products: o.total_products, total_categories: o.category_count, avg_price: o.avg_price, positive_rate: o.positive_rate });
        }
        if (daily.status === 'fulfilled' && Array.isArray(daily.value) && daily.value.length > 0) {
          setLineData(daily.value.map((d: any) => ({ name: d.date?.slice(5), sales: d.total_sales, reviews: d.review_count })));
        }
        if (categorySales.status === 'fulfilled' && Array.isArray(categorySales.value) && categorySales.value.length > 0) {
          setPieData(categorySales.value.slice(0, 6).map((c: any) => ({ name: c.category, value: c.total_sales })));
        }
        if (regionHeat.status === 'fulfilled' && Array.isArray(regionHeat.value) && regionHeat.value.length > 0) {
          setBarData(regionHeat.value.slice(0, 8).map((r: any) => ({ name: r.region, value: Math.round(r.total_sales / 10000) })));
        }
      } catch {
        // use fallback data
      }
    };
    fetchData();
  }, []);

  const totalProducts = stats ? stats.total_products.toLocaleString() : "8,216";
  const totalCategories = stats ? `${stats.total_categories} 类` : "14 类";
  const avgPrice = stats ? `¥${stats.avg_price.toFixed(1)}` : "¥36.8";
  const positiveRate = stats ? `${stats.positive_rate}%` : "81.6%";

  const statCards = [
    {
      title: "有效商品数",
      value: totalProducts,
      trend: "+12.3%",
      trendUp: true,
      icon: ShoppingBag,
      accent: "from-orange-500 to-amber-400",
      bg: "bg-orange-50/60",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "覆盖类目",
      value: totalCategories,
      trend: "+2",
      trendUp: true,
      icon: Layers,
      accent: "from-emerald-500 to-teal-400",
      bg: "bg-emerald-50/60",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "平均价格",
      value: avgPrice,
      trend: "-3.2%",
      trendUp: false,
      icon: DollarSign,
      accent: "from-blue-500 to-cyan-400",
      bg: "bg-blue-50/60",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "情感正向率",
      value: positiveRate,
      trend: "+1.8%",
      trendUp: true,
      icon: ThumbsUp,
      accent: "from-rose-500 to-pink-400",
      bg: "bg-rose-50/60",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
  ];

  const pieTotal = pieData.reduce((sum, d) => sum + d.value, 0);

  const summaryItems = [
    {
      icon: Calendar,
      label: "最新批次日期",
      value: "2026-03-09",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      icon: MessageSquare,
      label: "评论总量",
      value: lineData.reduce((s, d) => s + (d.reviews || 0), 0).toLocaleString() + " 条",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Star,
      label: "平均评分",
      value: "4.3 / 5.0",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: Database,
      label: "数据字段",
      value: "12 个核心维度",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: Layers,
      label: "文本处理",
      value: "已完成分词与情感标注",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <Header
        title="淘宝日用品数据总览"
        subtitle="整合采集数据、热销类目、评论反馈与区域热度，用于展示平台整体运行效果"
        sampleSize={totalProducts}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`relative overflow-hidden p-5 rounded-2xl ${card.bg} border border-white/60 shadow-sm transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                  <Icon size={18} className={card.iconColor} />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    card.trendUp
                      ? "bg-emerald-100/80 text-emerald-700"
                      : "bg-red-100/80 text-red-600"
                  }`}
                >
                  {card.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {card.trend}
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">{card.value}</div>
              <div className="text-xs font-medium text-slate-500">{card.title}</div>
              {/* Decorative accent bar */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accent}`}
              />
            </div>
          );
        })}
      </div>

      {/* Charts 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top-left: Area Chart - 近30日销量趋势 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-800">近30日销量趋势</h3>
            <p className="text-xs text-slate-400 mt-1">
              展示抓取批次中销量变化与评论数量的同步走势
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={lineData}
                margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradReviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  dy={8}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#ea580c"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradSales)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#ea580c" }}
                />
                <Area
                  type="monotone"
                  dataKey="reviews"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradReviews)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#0ea5e9" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 rounded bg-orange-500 inline-block" />
              <span className="text-xs text-slate-500">销量</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 rounded bg-sky-500 inline-block" />
              <span className="text-xs text-slate-500">评论数</span>
            </div>
          </div>
        </div>

        {/* Top-right: Full Donut Chart - 热销类目占比 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-800">热销类目占比</h3>
            <p className="text-xs text-slate-400 mt-1">
              按销量对主要类目做聚合分布分析
            </p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {pieData.map((item, index) => {
              const pct = pieTotal > 0 ? ((item.value / pieTotal) * 100).toFixed(1) : "0";
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-slate-600 truncate">{item.name}</span>
                  <span className="text-xs text-slate-400 ml-auto flex-shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom-left: Horizontal Bar Chart - 区域热度排行 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-800">区域热度排行</h3>
            <p className="text-xs text-slate-400 mt-1">
              统计核心城市在销量上的综合热度（单位：万）
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#475569" }}
                  width={48}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(241,245,249,0.6)" }} />
                <Bar
                  dataKey="value"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                >
                  {barData.map((_entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={index === 0 ? "#ea580c" : index === 1 ? "#f97316" : "#fdba74"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom-right: Data Summary Card - 数据概览 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-800">数据概览</h3>
            <p className="text-xs text-slate-400 mt-1">
              系统运行状态与数据处理进度摘要
            </p>
          </div>
          <div className="space-y-3">
            {summaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${item.bg} flex-shrink-0`}>
                    <Icon size={16} className={item.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div className="text-sm font-semibold text-slate-700 truncate">{item.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
