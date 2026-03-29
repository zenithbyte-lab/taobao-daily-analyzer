import React from "react";
import Header from "./Header";
import {
  RefreshCw,
  Download,
  Settings2,
  CheckCircle2,
  ClipboardList,
  FileDown,
  UserCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ──────────────── static data ──────────────── */

const taskRecords = [
  {
    id: "TB-20260309-01",
    type: "全量采集",
    count: "8,216",
    status: "完成",
    time: "2026-03-09 08:30",
  },
  {
    id: "TB-20260308-02",
    type: "评论更新",
    count: "2,438",
    status: "完成",
    time: "2026-03-08 18:00",
  },
  {
    id: "TB-20260308-01",
    type: "价格巡检",
    count: "8,216",
    status: "运行中",
    time: "2026-03-08 10:00",
  },
  {
    id: "TB-20260307-03",
    type: "异常复抓",
    count: "126",
    status: "待复核",
    time: "2026-03-07 22:15",
  },
  {
    id: "TB-20260307-01",
    type: "全量采集",
    count: "7,982",
    status: "完成",
    time: "2026-03-07 08:30",
  },
  {
    id: "TB-20260306-02",
    type: "评论更新",
    count: "1,870",
    status: "失败",
    time: "2026-03-06 18:00",
  },
];

const exportFiles = [
  { name: "类目统计表", file: "analysis_category_summary.csv" },
  { name: "销量预测表", file: "forecast_sales_output.csv" },
  { name: "评论情感表", file: "comment_sentiment_result.csv" },
];

const pieData = [
  { name: "完成", value: 22 },
  { name: "运行中", value: 2 },
  { name: "待复核", value: 1 },
  { name: "失败", value: 1 },
];
const PIE_COLORS = ["#22c55e", "#f97316", "#eab308", "#ef4444"];

const loadData = [
  { day: "03-23", cpu: 32, memory: 58 },
  { day: "03-24", cpu: 45, memory: 62 },
  { day: "03-25", cpu: 38, memory: 60 },
  { day: "03-26", cpu: 52, memory: 67 },
  { day: "03-27", cpu: 41, memory: 63 },
  { day: "03-28", cpu: 48, memory: 70 },
  { day: "03-29", cpu: 36, memory: 65 },
];

const systemLogs = [
  {
    time: "2026-03-29 09:12:03",
    level: "INFO",
    message: "采集任务 TB-20260309-01 已完成，共写入 8,216 条记录",
  },
  {
    time: "2026-03-29 09:10:47",
    level: "INFO",
    message: "评论情感分析模块加载成功，模型版本 v2.3.1",
  },
  {
    time: "2026-03-29 08:58:21",
    level: "WARN",
    message: "API 请求速率接近限流阈值 (82/100 req/min)，建议降低并发数",
  },
  {
    time: "2026-03-29 08:45:09",
    level: "ERROR",
    message: "任务 TB-20260306-02 评论抓取超时，已触发自动重试 (1/3)",
  },
  {
    time: "2026-03-29 08:30:00",
    level: "INFO",
    message: "定时全量采集任务已启动，目标类目: 女装/运动鞋/数码配件",
  },
  {
    time: "2026-03-29 08:00:12",
    level: "WARN",
    message: "磁盘使用率 78%，建议清理 /tmp/cache 下过期导出文件",
  },
];

/* ──────────────── stat card with icon ──────────────── */

const statCards = [
  {
    title: "任务成功率",
    value: "96.3%",
    bg: "bg-amber-50/50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    Icon: CheckCircle2,
  },
  {
    title: "待复核记录",
    value: "37 条",
    bg: "bg-rose-50/50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    Icon: ClipboardList,
  },
  {
    title: "导出文件",
    value: "12 份",
    bg: "bg-blue-50/50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    Icon: FileDown,
  },
  {
    title: "活跃管理员",
    value: "2 人",
    bg: "bg-emerald-50/50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    Icon: UserCheck,
  },
];

/* ──────────────── helpers ──────────────── */

const statusStyle = (status: string) => {
  switch (status) {
    case "完成":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "运行中":
      return "bg-orange-50 text-orange-600 border-orange-100";
    case "待复核":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "失败":
      return "bg-red-50 text-red-600 border-red-100";
    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
  }
};

const logLevelStyle = (level: string) => {
  switch (level) {
    case "INFO":
      return "bg-emerald-500/15 text-emerald-400";
    case "WARN":
      return "bg-amber-500/15 text-amber-400";
    case "ERROR":
      return "bg-red-500/15 text-red-400";
    default:
      return "bg-slate-500/15 text-slate-400";
  }
};

/* ──────────────── custom pie label ──────────────── */

const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.45;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text
      x={x}
      y={y}
      fill="#475569"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs"
    >
      {name} {(percent * 100).toFixed(0)}%
    </text>
  );
};

/* ──────────────── component ──────────────── */

export default function ManagementCenter() {
  return (
    <div className="animate-in fade-in duration-500">
      <Header
        title="管理中心与任务工作台"
        subtitle="展示采集任务、导出记录和异常复核区，用于支撑论文中的后台实现截图"
        sampleSize="8,216"
      />

      {/* ── Row 1: Stat Cards ── */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`p-6 rounded-2xl ${card.bg} border border-white/40 shadow-sm flex items-center gap-4`}
          >
            <div
              className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}
            >
              <card.Icon size={20} className={card.iconColor} />
            </div>
            <div>
              <h3 className="text-xs font-medium text-slate-500 mb-1">
                {card.title}
              </h3>
              <div className="text-2xl font-bold text-slate-800">
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Task Records + Export ── */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Task Records Table */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <RefreshCw size={16} />
          </button>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            采集任务记录
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            对应系统实现章节中的后台任务列表页面
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg w-10">
                    #
                  </th>
                  <th className="px-4 py-3 font-medium">批次号</th>
                  <th className="px-4 py-3 font-medium">任务类型</th>
                  <th className="px-4 py-3 font-medium">数据量</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium rounded-tr-lg">
                    执行时间
                  </th>
                </tr>
              </thead>
              <tbody>
                {taskRecords.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 text-slate-400 text-xs">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-600">
                      {row.id}
                    </td>
                    <td className="px-4 py-4 text-slate-800">{row.type}</td>
                    <td className="px-4 py-4 text-slate-600">{row.count}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${statusStyle(row.status)}`}
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

        {/* Export & Configuration */}
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
          <button className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <Settings2 size={16} />
          </button>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            导出与配置
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            展示后台对分析结果与预测结果的管理动作
          </p>

          <div className="space-y-4">
            {exportFiles.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs font-mono text-slate-500">
                    {item.file}
                  </p>
                </div>
                <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors border border-orange-100">
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Charts ── */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Pie Chart - Task Status Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            任务执行统计
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            按状态维度统计的采集任务分布
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                label={renderPieLabel}
                stroke="none"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  fontSize: "13px",
                }}
                formatter={(value: number) => [`${value} 个`, "任务数"]}
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

        {/* Line Chart - System Load */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            系统负载趋势
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            近 7 日 CPU 与内存使用率变化
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={loadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  fontSize: "13px",
                }}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === "cpu" ? "CPU 使用率" : "内存使用率",
                ]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="plainline"
                formatter={(value: string) => (
                  <span className="text-xs text-slate-600">
                    {value === "cpu" ? "CPU 使用率" : "内存使用率"}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="cpu"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="memory"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 4: System Logs ── */}
      <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-700/50 mb-6">
        <h3 className="text-lg font-bold text-slate-100 mb-1">系统日志</h3>
        <p className="text-xs text-slate-500 mb-5">
          最近的运行日志与异常告警
        </p>

        <div className="space-y-1">
          {systemLogs.map((log, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800/60 transition-colors font-mono text-[13px]"
            >
              <span className="text-slate-500 shrink-0 tabular-nums">
                {log.time}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${logLevelStyle(log.level)}`}
              >
                {log.level}
              </span>
              <span className="text-slate-300 leading-relaxed">
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
