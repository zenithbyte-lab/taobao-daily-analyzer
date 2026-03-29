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
  Legend,
  ComposedChart,
  Line,
  Bar,
  BarChart,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Sparkles,
  CalendarClock,
  Target,
  AlertTriangle,
  BarChart3,
  MessageSquareText,
  ShieldAlert,
  Info,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

/* ───────── fallback data ───────── */

const fallbackPredictionData = [
  { name: "03-01", actual: 680, predicted: 670 },
  { name: "03-02", actual: 720, predicted: 710 },
  { name: "03-03", actual: 780, predicted: 770 },
  { name: "03-04", actual: 820, predicted: 830 },
  { name: "03-05", actual: 890, predicted: 880 },
  { name: "03-06", actual: 950, predicted: 940 },
  { name: "03-07", actual: 1000, predicted: 1010 },
  { name: "03-08", predicted: 1080 },
  { name: "03-09", predicted: 1146 },
];

const fallbackWarningSummary = [
  { label: "峰值类目", value: "纸品湿巾", icon: "flame" },
  { label: "价格敏感段", value: "20-40 元", icon: "target" },
  { label: "评论风险项", value: "物流与包装", icon: "alert" },
  { label: "预测状态", value: "需人工复核", icon: "info" },
];

const fallbackWarningRecords = [
  {
    category: "纸品湿巾",
    desc: "销量连续上升，近7日环比增长23%",
    action: "需补充爆款监测",
    type: "warning",
  },
  {
    category: "清洁收纳",
    desc: "价格敏感度增加，低价带占比扩大",
    action: "建议观察低价带投放",
    type: "info",
  },
  {
    category: "厨房用品",
    desc: "评论分数波动，近期差评率上升1.2%",
    action: "建议补充差评原因分析",
    type: "error",
  },
];

const fallbackDailyTrend = [
  { date: "2024-03-01", total_sales: 680, new_products: 12, review_count: 245 },
  { date: "2024-03-02", total_sales: 720, new_products: 8, review_count: 312 },
  { date: "2024-03-03", total_sales: 780, new_products: 15, review_count: 289 },
  { date: "2024-03-04", total_sales: 820, new_products: 10, review_count: 356 },
  { date: "2024-03-05", total_sales: 890, new_products: 18, review_count: 410 },
  { date: "2024-03-06", total_sales: 950, new_products: 14, review_count: 378 },
  { date: "2024-03-07", total_sales: 1000, new_products: 20, review_count: 425 },
  { date: "2024-03-08", total_sales: 1080, new_products: 16, review_count: 460 },
  { date: "2024-03-09", total_sales: 1146, new_products: 22, review_count: 498 },
];

const fallbackCategorySales = [
  { category: "纸品湿巾", total_sales: 186400, product_count: 342, avg_price: 28.5, avg_rating: 4.6 },
  { category: "清洁收纳", total_sales: 152300, product_count: 278, avg_price: 35.2, avg_rating: 4.5 },
  { category: "厨房用品", total_sales: 134800, product_count: 256, avg_price: 42.8, avg_rating: 4.3 },
  { category: "个人护理", total_sales: 128600, product_count: 312, avg_price: 55.6, avg_rating: 4.7 },
  { category: "母婴用品", total_sales: 115200, product_count: 198, avg_price: 68.3, avg_rating: 4.8 },
  { category: "零食饮料", total_sales: 98700, product_count: 425, avg_price: 22.4, avg_rating: 4.4 },
  { category: "家居日用", total_sales: 87500, product_count: 186, avg_price: 48.9, avg_rating: 4.2 },
  { category: "美妆护肤", total_sales: 76300, product_count: 167, avg_price: 89.5, avg_rating: 4.6 },
];

/* ───────── custom tooltips ───────── */

const PredictionTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-slate-100">
      <p className="text-xs font-semibold text-slate-600 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-bold text-slate-800">
            {entry.value?.toLocaleString() ?? "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

const ReviewTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-slate-100">
      <p className="text-xs font-semibold text-slate-600 mb-1">{label}</p>
      <div className="flex items-center gap-2 text-sm">
        <MessageSquareText size={13} className="text-blue-500" />
        <span className="text-slate-500">评论量:</span>
        <span className="font-bold text-slate-800">
          {payload[0].value?.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const CategoryTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-slate-100 min-w-[160px]">
      <p className="text-sm font-bold text-slate-800 mb-2">{d.category}</p>
      <div className="space-y-1 text-xs text-slate-500">
        <div className="flex justify-between">
          <span>总销量</span>
          <span className="font-semibold text-slate-700">
            {(d.total_sales / 10000).toFixed(1)}万
          </span>
        </div>
        <div className="flex justify-between">
          <span>商品数</span>
          <span className="font-semibold text-slate-700">{d.product_count}</span>
        </div>
        <div className="flex justify-between">
          <span>均价</span>
          <span className="font-semibold text-slate-700">¥{d.avg_price}</span>
        </div>
        <div className="flex justify-between">
          <span>评分</span>
          <span className="font-semibold text-slate-700">{d.avg_rating}</span>
        </div>
      </div>
    </div>
  );
};

/* ───────── helper: severity icon ───────── */

const SeverityIcon = ({ type }: { type: string }) => {
  if (type === "error")
    return (
      <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
        <ShieldAlert size={18} className="text-rose-500" />
      </div>
    );
  if (type === "warning")
    return (
      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
        <AlertTriangle size={18} className="text-amber-500" />
      </div>
    );
  return (
    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
      <Info size={18} className="text-blue-500" />
    </div>
  );
};

const SummaryIcon = ({ icon }: { icon: string }) => {
  const cls = "w-8 h-8 rounded-lg flex items-center justify-center shrink-0";
  if (icon === "flame")
    return (
      <div className={`${cls} bg-orange-50`}>
        <Flame size={16} className="text-orange-500" />
      </div>
    );
  if (icon === "target")
    return (
      <div className={`${cls} bg-teal-50`}>
        <Target size={16} className="text-teal-500" />
      </div>
    );
  if (icon === "alert")
    return (
      <div className={`${cls} bg-rose-50`}>
        <AlertTriangle size={16} className="text-rose-500" />
      </div>
    );
  return (
    <div className={`${cls} bg-blue-50`}>
      <Info size={16} className="text-blue-500" />
    </div>
  );
};

/* ───────── bar colors ───────── */

const BAR_COLORS = [
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#fed7aa",
  "#0d9488",
  "#2dd4bf",
  "#99f6e4",
  "#ccfbf1",
];

/* ───────── interfaces ───────── */

interface PredictionStats {
  window: string;
  mape: string;
  anomaly_count: number;
  latest_prediction: number;
}

/* ───────── component ───────── */

export default function SalesPrediction() {
  const [predictionData, setPredictionData] = useState(fallbackPredictionData);
  const [warningSummary] = useState(fallbackWarningSummary);
  const [warningRecords, setWarningRecords] = useState(fallbackWarningRecords);
  const [dailyTrend, setDailyTrend] = useState(fallbackDailyTrend);
  const [categorySales, setCategorySales] = useState(fallbackCategorySales);
  const [stats, setStats] = useState<PredictionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [predResult, trendResult, catResult] = await Promise.allSettled([
          request("/stats/prediction"),
          request("/stats/daily-trend"),
          request("/stats/category-sales"),
        ]);

        // prediction
        if (
          predResult.status === "fulfilled" &&
          Array.isArray(predResult.value) &&
          predResult.value.length > 0
        ) {
          const chartData = predResult.value.map((d: any) => ({
            name: d.date?.slice(5),
            actual: d.type === "actual" ? d.sales : undefined,
            predicted: d.sales,
          }));
          setPredictionData(chartData);
          const lastPred = predResult.value[predResult.value.length - 1];
          if (lastPred) {
            setStats({
              window: "2天",
              mape: "6.8%",
              anomaly_count: 3,
              latest_prediction: lastPred.sales,
            });
          }
        }

        // daily trend
        if (
          trendResult.status === "fulfilled" &&
          Array.isArray(trendResult.value) &&
          trendResult.value.length > 0
        ) {
          setDailyTrend(trendResult.value);
        }

        // category sales
        if (
          catResult.status === "fulfilled" &&
          Array.isArray(catResult.value) &&
          catResult.value.length > 0
        ) {
          setCategorySales(catResult.value.slice(0, 8));
        }
      } catch {
        // use fallback data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const predWindow = stats?.window || "2天";
  const mape = stats?.mape || "6.8%";
  const anomalyCount = stats ? `${stats.anomaly_count}个` : "3个";
  const latestPred = stats
    ? stats.latest_prediction.toLocaleString()
    : "1,146";

  // format daily trend for chart
  const reviewChartData = dailyTrend.map((d) => ({
    name: d.date?.slice(5),
    review_count: d.review_count,
  }));

  // format category data for chart
  const categoryChartData = categorySales.slice(0, 8).map((d) => ({
    ...d,
    sales_wan: +(d.total_sales / 10000).toFixed(1),
  }));

  return (
    <div className="animate-in fade-in duration-500">
      <Header
        title="销量预测与预警"
        subtitle="基于历史销量、价格波动和评论活跃度构建短期趋势预测页"
        sampleSize="8,216"
      />

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      )}

      {/* ═══════ Row 1: Stat Cards ═══════ */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        {/* Card 1 */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-100/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center">
              <CalendarClock size={20} className="text-amber-600" />
            </div>
            <span className="text-xs font-medium text-slate-500">预测窗口</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{predWindow}</div>
          <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-amber-200/20 rounded-full" />
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-100/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center">
              <Target size={20} className="text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-slate-500">MAPE</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{mape}</div>
          <span className="inline-flex items-center gap-0.5 mt-1 text-xs text-emerald-600 font-medium">
            <ArrowDownRight size={12} /> 优于基线
          </span>
          <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-emerald-200/20 rounded-full" />
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50/60 border border-rose-100/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100/80 flex items-center justify-center">
              <AlertTriangle size={20} className="text-rose-500" />
            </div>
            <span className="text-xs font-medium text-slate-500">异常类目</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{anomalyCount}</div>
          <span className="inline-flex items-center gap-0.5 mt-1 text-xs text-rose-500 font-medium">
            <ArrowUpRight size={12} /> 需关注
          </span>
          <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-rose-200/20 rounded-full" />
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-100/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100/80 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-slate-500">最新预测</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{latestPred}</div>
          <span className="inline-flex items-center gap-0.5 mt-1 text-xs text-blue-600 font-medium">
            <ArrowUpRight size={12} /> 上升趋势
          </span>
          <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-blue-200/20 rounded-full" />
        </div>
      </div>

      {/* ═══════ Row 2: Prediction Chart + Warning Summary ═══════ */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {/* Prediction Chart */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-orange-500 rounded-lg transition-colors">
            <TrendingUp size={16} />
          </button>
          <h3 className="text-base font-bold text-slate-800 mb-0.5">
            销量趋势与预测
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            橙色区域为实际销量，绿色虚线为模型预测值
          </p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={predictionData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
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
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip content={<PredictionTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: "12px",
                    color: "#64748b",
                    paddingTop: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="实际销量"
                  stroke="#ea580c"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradActual)"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="预测销量"
                  stroke="#0d9488"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ r: 4, fill: "#fff", stroke: "#0d9488", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#0d9488", stroke: "#fff", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warning Summary */}
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-teal-500 rounded-lg transition-colors">
            <Sparkles size={16} />
          </button>
          <h3 className="text-base font-bold text-slate-800 mb-0.5">预警摘要</h3>
          <p className="text-xs text-slate-400 mb-5">
            模型输出与运营动作之间的关键指标
          </p>

          <div className="space-y-3">
            {warningSummary.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <SummaryIcon icon={item.icon} />
                <div className="flex-1 min-w-0">
                  <span className="block text-xs text-slate-400">{item.label}</span>
                  <span className="block text-sm font-semibold text-slate-800 truncate">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ Row 3: Review Trend + Category Bar ═══════ */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        {/* Review Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-blue-500 rounded-lg transition-colors">
            <MessageSquareText size={16} />
          </button>
          <h3 className="text-base font-bold text-slate-800 mb-0.5">
            日评论量趋势
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            评论活跃度是销量预测的重要先行指标
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={reviewChartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradReview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
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
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip content={<ReviewTooltip />} />
                <Area
                  type="monotone"
                  dataKey="review_count"
                  name="评论量"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradReview)"
                  dot={{ r: 3, fill: "#fff", stroke: "#3b82f6", strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-orange-500 rounded-lg transition-colors">
            <BarChart3 size={16} />
          </button>
          <h3 className="text-base font-bold text-slate-800 mb-0.5">
            类目销量环比
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Top 8 类目销量对比（单位: 万）
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={8}
                  interval={0}
                  angle={-20}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  unit="万"
                />
                <Tooltip content={<CategoryTooltip />} />
                <Bar
                  dataKey="sales_wan"
                  name="销量(万)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                >
                  {categoryChartData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══════ Row 4: Warning Records ═══════ */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative mb-2">
        <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
          <ShieldAlert size={16} />
        </button>
        <h3 className="text-base font-bold text-slate-800 mb-0.5">运营预警记录</h3>
        <p className="text-xs text-slate-400 mb-5">
          预测结果驱动的运营预警与建议动作
        </p>

        <div className="space-y-3">
          {warningRecords.map((record, index) => {
            const borderColor =
              record.type === "error"
                ? "border-l-rose-400"
                : record.type === "warning"
                  ? "border-l-amber-400"
                  : "border-l-blue-400";
            const badgeBg =
              record.type === "error"
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : record.type === "warning"
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-blue-50 text-blue-600 border-blue-100";

            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-all border-l-[3px] ${borderColor}`}
              >
                <SeverityIcon type={record.type} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 mb-0.5">
                    {record.category}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {record.desc}
                  </p>
                </div>
                <div
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border ${badgeBg}`}
                >
                  {record.action}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
