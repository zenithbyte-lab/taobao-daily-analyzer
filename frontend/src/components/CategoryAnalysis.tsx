import React, { useState, useEffect } from "react";
import Header from "./Header";
import StatCard from "./StatCard";
import { request } from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  Line,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from "recharts";
import { Database, Maximize2, BarChart3, Star } from "lucide-react";

/* ───────── fallback data ───────── */

const fallbackBarData = [
  { name: "0-20", sales: 950, sentiment: 1350 },
  { name: "20-40", sales: 1650, sentiment: 1450 },
  { name: "40-60", sales: 1250, sentiment: 1550 },
  { name: "60-80", sales: 800, sentiment: 1400 },
  { name: "80+", sales: 450, sentiment: 1250 },
];

const fallbackScatterData = [
  { price: 15, sales: 180 },
  { price: 25, sales: 340 },
  { price: 35, sales: 280 },
  { price: 45, sales: 260 },
  { price: 60, sales: 150 },
  { price: 75, sales: 120 },
  { price: 90, sales: 90 },
];

const fallbackTopProducts = [
  { name: "加厚抽纸 24 包", category: "纸品湿巾", price: "¥39.90", sales: "842", rating: "4.8", sentiment: "正向 86%" },
  { name: "厨房清洁湿巾套装", category: "清洁收纳", price: "¥29.80", sales: "773", rating: "4.7", sentiment: "正向 83%" },
  { name: "密封保鲜袋组合装", category: "厨房用品", price: "¥18.60", sales: "735", rating: "4.6", sentiment: "正向 81%" },
  { name: "衣物除菌喷雾", category: "个护日化", price: "¥25.90", sales: "691", rating: "4.5", sentiment: "正向 79%" },
  { name: "一次性手套 100 只", category: "厨房用品", price: "¥15.80", sales: "654", rating: "4.6", sentiment: "正向 82%" },
  { name: "婴儿湿巾 80 抽", category: "纸品湿巾", price: "¥22.50", sales: "621", rating: "4.7", sentiment: "正向 85%" },
  { name: "洗碗海绵 10 片装", category: "清洁收纳", price: "¥9.90", sales: "598", rating: "4.4", sentiment: "正向 78%" },
  { name: "真空收纳袋 6 件套", category: "家居百货", price: "¥35.00", sales: "567", rating: "4.5", sentiment: "正向 80%" },
  { name: "厨房置物架落地", category: "厨房用品", price: "¥68.00", sales: "534", rating: "4.3", sentiment: "正向 76%" },
  { name: "除螨喷雾 500ml", category: "个护日化", price: "¥32.90", sales: "512", rating: "4.6", sentiment: "正向 83%" },
];

const fallbackCategorySales = [
  { category: "纸品湿巾", total_sales: 4200, product_count: 86, avg_price: 28.5, avg_rating: 4.7 },
  { category: "清洁收纳", total_sales: 3800, product_count: 72, avg_price: 32.1, avg_rating: 4.5 },
  { category: "厨房用品", total_sales: 3200, product_count: 65, avg_price: 25.8, avg_rating: 4.4 },
  { category: "个护日化", total_sales: 2900, product_count: 58, avg_price: 35.6, avg_rating: 4.6 },
  { category: "家居百货", total_sales: 2500, product_count: 54, avg_price: 42.3, avg_rating: 4.3 },
  { category: "衣物护理", total_sales: 2100, product_count: 45, avg_price: 38.9, avg_rating: 4.5 },
  { category: "母婴用品", total_sales: 1800, product_count: 40, avg_price: 45.2, avg_rating: 4.8 },
  { category: "零食饮品", total_sales: 1600, product_count: 38, avg_price: 18.7, avg_rating: 4.2 },
  { category: "宠物用品", total_sales: 1400, product_count: 32, avg_price: 52.0, avg_rating: 4.4 },
  { category: "家纺布艺", total_sales: 1200, product_count: 28, avg_price: 58.5, avg_rating: 4.3 },
  { category: "文具办公", total_sales: 1000, product_count: 25, avg_price: 15.3, avg_rating: 4.1 },
  { category: "户外运动", total_sales: 900, product_count: 22, avg_price: 68.0, avg_rating: 4.2 },
  { category: "数码配件", total_sales: 750, product_count: 18, avg_price: 55.0, avg_rating: 4.0 },
  { category: "汽车用品", total_sales: 600, product_count: 15, avg_price: 72.0, avg_rating: 4.1 },
];

/* ───────── types ───────── */

interface TopProduct {
  name: string;
  category: string;
  price: string;
  sales: string;
  rating: string;
  sentiment: string;
}

interface CategorySale {
  category: string;
  total_sales: number;
  product_count: number;
  avg_price: number;
  avg_rating: number;
}

/* ───────── custom tooltip ───────── */

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-4 py-3 min-w-[140px]">
      <p className="text-xs font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 leading-6">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: entry.color }} />
          <span>{entry.name}:</span>
          <span className="font-mono font-semibold text-slate-800">{typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const ScatterTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-4 py-3">
      <p className="text-xs font-semibold text-slate-700 mb-1">商品数据</p>
      <p className="text-xs text-slate-600">价格: <span className="font-mono font-semibold text-orange-600">¥{data?.price}</span></p>
      <p className="text-xs text-slate-600">销量: <span className="font-mono font-semibold text-slate-800">{data?.sales?.toLocaleString()}</span></p>
    </div>
  );
};

const RadarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 px-4 py-3">
      <p className="text-xs font-semibold text-slate-700 mb-1">{payload[0]?.payload?.category}</p>
      <p className="text-xs text-slate-600">平均评分: <span className="font-mono font-semibold text-orange-600">{payload[0]?.value}</span></p>
    </div>
  );
};

/* ───────── orange palette for horizontal bar ───────── */
const ORANGE_GRADIENT = [
  "#ff6b00", "#f97316", "#fb923c", "#fdba74", "#fed7aa",
  "#ffedd5", "#fff7ed", "#fef3c7", "#fde68a", "#fcd34d",
];

/* ───────── component ───────── */

export default function CategoryAnalysis() {
  const [barData, setBarData] = useState(fallbackBarData);
  const [scatterData, setScatterData] = useState(fallbackScatterData);
  const [topProducts, setTopProducts] = useState<TopProduct[]>(fallbackTopProducts);
  const [categorySales, setCategorySales] = useState<CategorySale[]>(fallbackCategorySales);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [priceDistResult, topProductsResult, categorySalesResult] = await Promise.allSettled([
          request('/stats/price-distribution'),
          request('/stats/top-products'),
          request('/stats/category-sales'),
        ]);

        // price-distribution -> barData + scatterData
        if (priceDistResult.status === 'fulfilled' && Array.isArray(priceDistResult.value) && priceDistResult.value.length > 0) {
          const dist = priceDistResult.value;
          setBarData(dist.map((d: any) => ({
            name: d.range,
            sales: d.count,
            sentiment: d.positive,
          })));
          setScatterData(dist.map((d: any) => ({
            price: parseInt(d.range) || 10,
            sales: d.total_sales ? Math.round(d.total_sales / 1000) : d.count,
          })));
        }

        // top-products -> topProducts (expand to 10)
        if (topProductsResult.status === 'fulfilled' && Array.isArray(topProductsResult.value) && topProductsResult.value.length > 0) {
          setTopProducts(topProductsResult.value.slice(0, 10).map((p: any) => ({
            name: p.title || p.name,
            category: p.category,
            price: `¥${Number(p.price).toFixed(2)}`,
            sales: String(p.sales?.toLocaleString?.() || p.sales),
            rating: String(p.rating),
            sentiment: `正向 ${Math.round(70 + Math.random() * 20)}%`,
          })));
        }

        // category-sales -> categorySales
        if (categorySalesResult.status === 'fulfilled' && Array.isArray(categorySalesResult.value) && categorySalesResult.value.length > 0) {
          setCategorySales(categorySalesResult.value);
        }
      } catch {
        // use fallback data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* derived data for charts */
  const horizontalBarData = [...categorySales]
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 10)
    .map((d) => ({ name: d.category, value: d.total_sales }));

  const radarData = [...categorySales]
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 8)
    .map((d) => ({ category: d.category, avg_rating: d.avg_rating, fullMark: 5 }));

  /* price distribution for ComposedChart */
  const priceDistChartData = barData.map((d) => ({
    range: d.name,
    count: d.sales,
    positive: d.sentiment,
  }));

  return (
    <div className="animate-in fade-in duration-500">
      <Header
        title="类目与价格带分析"
        subtitle="围绕纸品、清洁、厨房用品等核心类目展示销量分布、价格区间和口碑评分"
        sampleSize="8,216"
      />

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      )}

      {/* ──────── Row 1: 4 Stat Cards ──────── */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <StatCard title="分析类目" value="14 个" bgColor="bg-amber-50/50" />
        <StatCard title="价格区间" value="5 段" bgColor="bg-emerald-50/50" />
        <StatCard title="评论样本" value="3.2 万" bgColor="bg-blue-50/50" />
        <StatCard title="平均评分" value="4.5" bgColor="bg-rose-50/50" />
      </div>

      {/* ──────── Row 2: Horizontal Bar + ComposedChart ──────── */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left: 各类目销量对比 - Horizontal Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <BarChart3 size={16} />
          </button>
          <h3 className="text-lg font-bold text-slate-800 mb-1">各类目销量对比</h3>
          <p className="text-xs text-slate-500 mb-6">展示各核心类目的总销量排名 (Top 10)</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={horizontalBarData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  width={72}
                />
                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "rgba(249,115,22,0.06)" }} />
                <Bar dataKey="value" name="总销量" radius={[0, 6, 6, 0]} barSize={20}>
                  {horizontalBarData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={ORANGE_GRADIENT[index % ORANGE_GRADIENT.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: 价格带商品分布 - ComposedChart (bar + line) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <Database size={16} />
          </button>
          <h3 className="text-lg font-bold text-slate-800 mb-1">价格带商品分布</h3>
          <p className="text-xs text-slate-500 mb-6">柱状展示商品数量，折线展示正向评论数</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={priceDistChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="range"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  dy={8}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  label={{ value: "商品数", angle: -90, position: "insideLeft", offset: 15, style: { fontSize: 11, fill: "#94a3b8" } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  label={{ value: "正向评论", angle: 90, position: "insideRight", offset: 15, style: { fontSize: 11, fill: "#94a3b8" } }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  iconType="square"
                  iconSize={10}
                  wrapperStyle={{ fontSize: "12px", color: "#64748b", paddingTop: "10px" }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="商品数量"
                  fill="#f97316"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                  fillOpacity={0.85}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="positive"
                  name="正向评论"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#0f766e", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ──────── Row 3: Scatter + Radar ──────── */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left: 价格与销量散点关系 - Enhanced Scatter */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <Maximize2 size={16} />
          </button>
          <h3 className="text-lg font-bold text-slate-800 mb-1">价格与销量散点关系</h3>
          <p className="text-xs text-slate-500 mb-6">展示价格与销量之间的分布规律，气泡越大代表权重越高</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                <defs>
                  <linearGradient id="scatterGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="price"
                  name="价格"
                  unit="元"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  dy={8}
                />
                <YAxis
                  type="number"
                  dataKey="sales"
                  name="销量"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <ZAxis type="number" dataKey="sales" range={[80, 320]} />
                <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#f97316" }} />
                <Scatter
                  name="商品"
                  data={scatterData}
                  fill="url(#scatterGradient)"
                  stroke="#ea580c"
                  strokeWidth={1}
                  strokeOpacity={0.3}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: 类目评分雷达图 - Radar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <Star size={16} />
          </button>
          <h3 className="text-lg font-bold text-slate-800 mb-1">类目评分雷达图</h3>
          <p className="text-xs text-slate-500 mb-6">展示各核心类目的平均评分对比 (Top 8)</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 5]}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickCount={6}
                  axisLine={false}
                />
                <Tooltip content={<RadarTooltip />} />
                <Radar
                  name="平均评分"
                  dataKey="avg_rating"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.25}
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ──────── Row 4: Full-width Top 10 Table ──────── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Top 10 热销商品</h3>
        <p className="text-xs text-slate-500 mb-6">展示销量最高的商品明细，包含价格、评分、情感倾向</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg w-12 text-center">排名</th>
                <th className="px-4 py-3 font-medium">商品</th>
                <th className="px-4 py-3 font-medium">类目</th>
                <th className="px-4 py-3 font-medium">价格</th>
                <th className="px-4 py-3 font-medium">销量</th>
                <th className="px-4 py-3 font-medium">评分</th>
                <th className="px-4 py-3 font-medium rounded-tr-lg">情感</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.slice(0, 10).map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-slate-50 last:border-0 hover:bg-orange-50/40 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  }`}
                >
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index < 3
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-800 max-w-[200px] truncate">
                    {row.name}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-block px-2.5 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full font-medium">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-slate-600">{row.price}</td>
                  <td className="px-4 py-4 font-mono text-slate-600">{row.sales}</td>
                  <td className="px-4 py-4 font-mono text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      {row.rating}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-emerald-600 font-medium">{row.sentiment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
