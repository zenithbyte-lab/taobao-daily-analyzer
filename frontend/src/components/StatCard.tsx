import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  bgColor: string;
}

export default function StatCard({ title, value, bgColor }: StatCardProps) {
  return (
    <div
      className={`p-6 rounded-2xl ${bgColor} border border-white/40 shadow-sm`}
    >
      <h3 className="text-xs font-medium text-slate-500 mb-3">{title}</h3>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
    </div>
  );
}
