import React from "react";
import Header from "./Header";
import {
  RefreshCw,
  ShieldCheck,
  Maximize2,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

/* ── static data ── */

const batchData = [
  {
    id: "CR-20260309-01",
    type: "商品列表抓取",
    count: "1,800",
    status: "完成",
    time: "03-09 08:30",
  },
  {
    id: "CR-20260309-02",
    type: "详情页补抓",
    count: "2,520",
    status: "完成",
    time: "03-09 09:10",
  },
  {
    id: "CR-20260309-03",
    type: "评论采集",
    count: "3,896",
    status: "运行中",
    time: "03-09 09:45",
  },
  {
    id: "CR-20260309-04",
    type: "异常重试",
    count: "142",
    status: "待复核",
    time: "03-09 10:00",
  },
];

const fieldData = [
  { group: "商品标题", type: "结构化", usage: "用于分类、词频和相似商品比对" },
  {
    group: "价格/销量/评分",
    type: "结构化",
    usage: "用于统计图、价格带与预测特征",
  },
  { group: "评论正文", type: "半结构化", usage: "用于情感分析、关键词提取" },
  {
    group: "地区与店铺信息",
    type: "结构化",
    usage: "用于区域热度分析和店铺差异分析",
  },
];

const categoryBarData = [
  { name: "纸品湿巾", value: 682 },
  { name: "清洁工具", value: 541 },
  { name: "收纳用品", value: 623 },
  { name: "厨房用品", value: 478 },
  { name: "卫浴配件", value: 512 },
  { name: "垃圾袋", value: 435 },
  { name: "洗衣用品", value: 598 },
  { name: "一次性用品", value: 647 },
];

const timelineData = [
  { date: "03-03", count: 980 },
  { date: "03-04", count: 1250 },
  { date: "03-05", count: 1120 },
  { date: "03-06", count: 1480 },
  { date: "03-07", count: 1350 },
  { date: "03-08", count: 1680 },
  { date: "03-09", count: 1356 },
];

const statCards = [
  {
    title: "总样本量",
    value: "8,216",
    bg: "bg-orange-50/60",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    Icon: Database,
  },
  {
    title: "成功任务",
    value: "26 次",
    bg: "bg-emerald-50/60",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-500",
    Icon: CheckCircle2,
  },
  {
    title: "异常重试",
    value: "142 条",
    bg: "bg-rose-50/60",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-500",
    Icon: AlertTriangle,
  },
  {
    title: "更新周期",
    value: "6 小时",
    bg: "bg-sky-50/60",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
    Icon: Clock,
  },
];

/* ── component ── */

export default function CollectionTasks() {
  return (
    <div className="animate-in fade-in duration-500">
      <Header
        title="数据采集与爬虫任务页"
        subtitle="展示淘宝日用品项目的采集批次、数据源结构和异常重试信息，用于论文运行截图"
        sampleSize="8,216"
      />

      {/* ── Row 1: Stat Cards ── */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`${card.bg} border border-white/40 shadow-sm rounded-2xl p-6 flex items-start gap-4`}
          >
            <div
              className={`${card.iconBg} ${card.iconColor} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}
            >
              <card.Icon size={20} />
            </div>
            <div>
              <h3 className="text-xs font-medium text-slate-500 mb-1.5">
                {card.title}
              </h3>
              <div className="text-2xl font-bold text-slate-800">
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Batch Table + Collection Description ── */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Batch Status Table */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <RefreshCw size={16} />
          </button>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            采集批次状态
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            按任务类型展示采集、详情补抓、评论抓取和异常重试状态
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">
                    批次号
                  </th>
                  <th className="px-4 py-3 font-medium">任务类型</th>
                  <th className="px-4 py-3 font-medium">记录数</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium rounded-tr-lg">
                    触发时间
                  </th>
                </tr>
              </thead>
              <tbody>
                {batchData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 font-mono text-slate-600">
                      {row.id}
                    </td>
                    <td className="px-4 py-4 text-slate-800">{row.type}</td>
                    <td className="px-4 py-4 text-slate-600">{row.count}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                          row.status === "完成"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : row.status === "运行中"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Collection Description */}
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <ShieldCheck size={16} />
          </button>
          <h3 className="text-lg font-bold text-slate-800 mb-1">采集说明</h3>
          <p className="text-xs text-slate-500 mb-6">
            在论文中用来展示多源数据采集和批次管理的组织方式
          </p>

          <div className="space-y-3">
            <div className="flex items-center p-3 border border-slate-100 rounded-xl">
              <span className="text-sm text-slate-500 w-24 shrink-0">
                采集范围
              </span>
              <span className="text-sm text-slate-800 font-medium">
                纸品湿巾、清洁收纳、厨房用品等{" "}
                <span className="font-bold">14</span> 类
              </span>
            </div>
            <div className="flex items-center p-3 border border-slate-100 rounded-xl">
              <span className="text-sm text-slate-500 w-24 shrink-0">
                字段数量
              </span>
              <span className="text-sm text-slate-800 font-medium">
                商品字段 <span className="font-bold">12</span> 项，评论字段{" "}
                <span className="font-bold">6</span> 项
              </span>
            </div>
            <div className="flex items-center p-3 border border-slate-100 rounded-xl">
              <span className="text-sm text-slate-500 w-24 shrink-0">
                异常策略
              </span>
              <span className="text-sm text-slate-800 font-medium">
                超时重试、空字段记录、批次回滚
              </span>
            </div>
            <div className="flex items-center p-3 border border-slate-100 rounded-xl">
              <span className="text-sm text-slate-500 w-24 shrink-0">
                结果输出
              </span>
              <span className="text-sm text-slate-800 font-medium">
                原始 JSON、清洗 CSV、SQLite 入库
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Two Charts ── */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Bar Chart - 各类目采集量 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            各类目采集量
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            按商品类目统计已采集数据条数
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={categoryBarData}
              margin={{ top: 4, right: 12, left: -8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(251,146,60,0.06)" }}
              />
              <Bar
                dataKey="value"
                name="采集量"
                fill="#fb923c"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart - 采集时间线 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            采集时间线
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            近7日每日采集数据量趋势
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={timelineData}
              margin={{ top: 4, right: 12, left: -8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="采集量"
                stroke="#14b8a6"
                strokeWidth={2.5}
                fill="url(#tealGradient)"
                dot={{ r: 4, fill: "#14b8a6", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#14b8a6", strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 4: Field Types Table ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
        <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
          <Maximize2 size={16} />
        </button>
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          源数据字段类型
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          展示结构化、半结构化和文本类数据如何进入后续分析链
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg w-16">
                  序号
                </th>
                <th className="px-4 py-3 font-medium w-1/5">字段组</th>
                <th className="px-4 py-3 font-medium w-1/5">数据类型</th>
                <th className="px-4 py-3 font-medium rounded-tr-lg">
                  在系统中的用途
                </th>
              </tr>
            </thead>
            <tbody>
              {fieldData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-[11px] font-medium text-slate-500">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-800">
                    {row.group}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                        row.type === "结构化"
                          ? "bg-orange-50 text-orange-600 border-orange-100"
                          : "bg-violet-50 text-violet-600 border-violet-100"
                      }`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{row.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
