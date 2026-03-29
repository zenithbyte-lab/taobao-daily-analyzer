import React from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
  sampleSize: string;
}

export default function Header({ title, subtitle, sampleSize }: HeaderProps) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <div className="px-4 py-2 bg-white rounded-full text-slate-500 shadow-sm border border-slate-100">
          数据源：淘宝日用品爬虫 / 评论文本 / 月度销量
        </div>
        <div className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full font-medium border border-orange-100">
          本轮样本 <span className="font-bold">{sampleSize}</span> 条
        </div>
      </div>
    </div>
  );
}
