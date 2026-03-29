import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api';
import { motion } from 'motion/react';
import {
  Search,
  SlidersHorizontal,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Store,
  Inbox,
  ChevronRight as ChevronRightSmall,
} from 'lucide-react';

interface Product {
  id: number;
  title: string;
  price: number;
  original_price: number;
  sales: number;
  rating: number;
  shop_name: string;
  category: string;
  image_url: string;
}

interface PageData {
  items: Product[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const CATEGORIES = [
  '全部', '纸品湿巾', '清洁收纳', '厨房用品', '个护日化',
  '洗衣用品', '家居整理', '一次性用品', '驱虫除螨',
  '衣物护理', '香薰除味', '卫浴用品', '居家拖鞋', '毛巾浴巾', '垃圾处理',
];

const SORT_OPTIONS = [
  { value: 'sales', label: '按销量' },
  { value: 'price', label: '价格升序' },
  { value: 'price_desc', label: '价格降序' },
  { value: 'rating', label: '按评分' },
];

export default function ProductListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('全部');
  const [sort, setSort] = useState('sales');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const size = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('page_size', String(size));
      if (keyword) params.set('keyword', keyword);
      if (category && category !== '全部') params.set('category', category);
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      if (sort) params.set('sort_by', sort);

      const data = await request(`/products?${params.toString()}`);
      setProducts(data.list || data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || data.pages || 1);
    } catch {
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, category, sort, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(searchInput);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const handlePriceFilter = () => {
    setPage(1);
    fetchProducts();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="animate-in fade-in duration-500"
    >
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">商品浏览</h1>
          <p className="text-sm text-slate-500">
            浏览和搜索淘宝日用品数据，共 <span className="font-bold text-orange-500">{total.toLocaleString()}</span> 件商品
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索商品名称、店铺..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium shadow-sm flex items-center gap-2"
          >
            <Search size={16} />
            搜索
          </button>
        </div>
      </form>

      {/* Category Tabs */}
      <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-500">类目筛选</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-4 mb-6">
        {/* Sort */}
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-slate-100">
          <ArrowUpDown size={14} className="text-slate-400" />
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="text-sm text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-100">
          <span className="text-xs text-slate-400">价格</span>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="最低"
            className="w-20 text-sm px-2 py-1 rounded-lg border border-slate-100 bg-slate-50/50 focus:outline-none focus:border-orange-300 text-slate-700"
          />
          <span className="text-slate-300">-</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="最高"
            className="w-20 text-sm px-2 py-1 rounded-lg border border-slate-100 bg-slate-50/50 focus:outline-none focus:border-orange-300 text-slate-700"
          />
          <button
            onClick={handlePriceFilter}
            className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors border border-orange-100"
          >
            筛选
          </button>
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400">加载商品中...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-2xl shadow-sm border border-slate-100">
          <Inbox size={56} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 text-sm">暂无匹配的商品</p>
          <p className="text-slate-300 text-xs mt-1">尝试调整搜索条件或筛选项</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {/* List Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 text-xs font-medium text-slate-400">
            <div className="col-span-5">商品信息</div>
            <div className="col-span-2 text-right">价格</div>
            <div className="col-span-2 text-center">销量</div>
            <div className="col-span-2 text-center">评分</div>
            <div className="col-span-1"></div>
          </div>

          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              onClick={() => navigate(`/products/${product.id}`)}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 cursor-pointer hover:shadow-md hover:border-orange-100 transition-all group"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Product Info: Title + Category + Shop */}
                <div className="col-span-5 min-w-0">
                  <h3 className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors mb-1.5">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.category && (
                      <span className="inline-flex px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-medium rounded-md border border-orange-100">
                        {product.category}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Store size={11} className="text-slate-300 shrink-0" />
                      <span className="truncate max-w-[140px]">{product.shop_name}</span>
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-2 text-right">
                  <span className="text-lg font-bold text-orange-500">
                    ¥{product.price}
                  </span>
                  {product.original_price > product.price && (
                    <div className="text-[11px] text-slate-400 line-through mt-0.5">
                      ¥{product.original_price}
                    </div>
                  )}
                </div>

                {/* Sales */}
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ShoppingCart size={13} className="text-slate-300" />
                    <span className="text-sm font-semibold text-slate-700">{product.sales.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">月销</span>
                </div>

                {/* Rating */}
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-slate-700">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={9}
                        className={
                          i < Math.round(product.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="col-span-1 flex justify-end">
                  <ChevronRightSmall size={16} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-4 py-2 bg-white text-slate-600 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            <ChevronLeft size={16} />
            上一页
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    page === pageNum
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-4 py-2 bg-white text-slate-600 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            下一页
            <ChevronRight size={16} />
          </button>

          <span className="ml-3 text-xs text-slate-400">
            第 {page} / {totalPages} 页，共 {total} 件
          </span>
        </div>
      )}
    </motion.div>
  );
}
