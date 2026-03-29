import React from "react";
import Header from "./Header";
import {
  Filter,
  Database,
  Wand2,
  Layers,
  CheckCircle2,
  Type,
  AlertTriangle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ───────────── static data ───────────── */

const cleaningSteps = [
  {
    step: "去重处理",
    result: "8,742 → 8,216",
    desc: "按商品编号与店铺组合去重",
    status: "done",
  },
  {
    step: "价格标准化",
    result: "100%",
    desc: "去除促销符号并统一为数值型",
    status: "done",
  },
  {
    step: "销量转换",
    result: "97.8%",
    desc: '将"1万+"等文本转换为整型',
    status: "done",
  },
  {
    step: "评论文本分词",
    result: "12.8万条",
    desc: "生成情感与关键词结果",
    status: "done",
  },
];

const processingChain = [
  { name: "ODS 原始表", status: "已完成" },
  { name: "DWD 清洗表", status: "已完成" },
  { name: "DWS 统计表", status: "已完成" },
  { name: "ADS 展示表", status: "待最新批次写入" },
];

const featureOutput = [
  {
    field: "price_band",
    meaning: "价格带特征",
    usage: "0-20 / 20-40 / 40-60 等区间",
  },
  {
    field: "sentiment_score",
    meaning: "情感得分",
    usage: "依据评论情绪生成正负向分值",
  },
  {
    field: "region_weight",
    meaning: "地区热度",
    usage: "结合销量与评论活跃度计算",
  },
  { field: "sales_ma7", meaning: "七日均值", usage: "用于短期销量预测模型" },
];

const qualityData = [
  { name: "完整数据", value: 7846 },
  { name: "缺失值", value: 132 },
  { name: "异常值", value: 37 },
  { name: "重复数据", value: 105 },
];
const QUALITY_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"];

const fieldTypeData = [
  { name: "数值型", count: 8 },
  { name: "文本型", count: 4 },
  { name: "日期型", count: 2 },
  { name: "分类型", count: 4 },
];
const FIELD_COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"];

/* ───────────── helpers ───────────── */

const statusBadge = (status: string) => {
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
        <CheckCircle2 size={12} /> 完成
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
      处理中
    </span>
  );
};

/* ───────────── component ───────────── */

export default function DataProcessing() {
  return (
    <div className="animate-in fade-in duration-500">
      <Header
        title="数据处理与特征工程页"
        subtitle="展示清洗、中间表构建和特征工程结果，用于论文中说明数据存储与处理模块实现"
        sampleSize="8,216"
      />

      {/* ── Row 1: Stat Cards ── */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {[
          {
            icon: <Layers size={18} className="text-amber-500" />,
            title: "中间表数量",
            value: "6 张",
            bg: "bg-amber-50/50",
          },
          {
            icon: <CheckCircle2 size={18} className="text-emerald-500" />,
            title: "字段标准化",
            value: "97.8%",
            bg: "bg-emerald-50/50",
          },
          {
            icon: <Type size={18} className="text-blue-500" />,
            title: "文本分词",
            value: "12.8 万条",
            bg: "bg-blue-50/50",
          },
          {
            icon: <AlertTriangle size={18} className="text-rose-500" />,
            title: "异常字段",
            value: "37 项",
            bg: "bg-rose-50/50",
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl ${card.bg} border border-white/40 shadow-sm`}
          >
            <div className="flex items-center gap-2 mb-3">
              {card.icon}
              <h3 className="text-xs font-medium text-slate-500">
                {card.title}
              </h3>
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Table + Timeline ── */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Cleaning Steps Table */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <Filter size={16} />
          </button>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            清洗处理步骤
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            对应论文中从原始抓取结果到分析中间表的处理过程说明
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg w-[5%]">
                    #
                  </th>
                  <th className="px-4 py-3 font-medium w-[20%]">步骤</th>
                  <th className="px-4 py-3 font-medium w-[18%]">处理结果</th>
                  <th className="px-4 py-3 font-medium w-[42%]">说明</th>
                  <th className="px-4 py-3 font-medium rounded-tr-lg w-[15%] text-center">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody>
                {cleaningSteps.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-50 last:border-0 hover:bg-orange-50/30 transition-colors"
                  >
                    <td className="px-4 py-4 text-slate-400 font-mono text-xs">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      {row.step}
                    </td>
                    <td className="px-4 py-4 font-mono text-orange-600 font-semibold">
                      {row.result}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{row.desc}</td>
                    <td className="px-4 py-4 text-center">
                      {statusBadge(row.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Processing Chain — Vertical Timeline */}
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <Database size={16} />
          </button>
          <h3 className="text-lg font-bold text-slate-800 mb-1">处理链监控</h3>
          <p className="text-xs text-slate-500 mb-6">
            展示处理模块不是黑箱，而是有清晰的批次状态和质量记录
          </p>

          <div className="relative pl-6">
            {/* vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />

            {processingChain.map((item, index) => {
              const done = item.status === "已完成";
              return (
                <div key={index} className="relative flex items-start mb-6 last:mb-0">
                  {/* dot */}
                  <div
                    className={`absolute -left-6 top-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
                      done
                        ? "border-orange-400 bg-orange-400"
                        : "border-amber-400 bg-white"
                    }`}
                  >
                    {done && <CheckCircle2 size={12} className="text-white" />}
                    {!done && (
                      <span className="block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>

                  {/* content */}
                  <div className="ml-3">
                    <span className="text-sm font-mono font-semibold text-slate-700">
                      {item.name}
                    </span>
                    <span
                      className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        done
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Charts ── */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Data Quality Donut */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            数据质量分布
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            清洗后各质量类型数据的占比情况
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={qualityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {qualityData.map((_, i) => (
                  <Cell key={i} fill={QUALITY_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                  fontSize: "13px",
                }}
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} 条`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-slate-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Field Type Horizontal Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            字段类型占比
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            各数据类型字段的数量分布
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={fieldTypeData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 13, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                  fontSize: "13px",
                }}
                formatter={(value: number) => [`${value} 个字段`, "数量"]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                {fieldTypeData.map((_, i) => (
                  <Cell key={i} fill={FIELD_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 4: Feature Output Table ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
        <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
          <Wand2 size={16} />
        </button>
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          特征工程输出表
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          说明销量预测和价格带分析依赖的核心特征字段
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg w-[5%]">
                  #
                </th>
                <th className="px-4 py-3 font-medium w-[22%]">字段名</th>
                <th className="px-4 py-3 font-medium w-[22%]">字段含义</th>
                <th className="px-4 py-3 font-medium rounded-tr-lg w-[51%]">
                  在页面中的用途
                </th>
              </tr>
            </thead>
            <tbody>
              {featureOutput.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-50 last:border-0 hover:bg-orange-50/30 transition-colors"
                >
                  <td className="px-4 py-4 text-slate-400 font-mono text-xs">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 font-mono text-orange-600 bg-orange-50/30 font-semibold">
                    {row.field}
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-800">
                    {row.meaning}
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
