import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../api';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Heart,
  Star,
  ShoppingCart,
  Store,
  Tag,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Share2,
  TrendingUp,
  MapPin,
  Inbox,
} from 'lucide-react';

interface ProductDetail {
  id: number;
  title: string;
  price: number;
  original_price: number;
  sales: number;
  monthly_sales?: number;
  rating: number;
  review_count?: number;
  shop_name: string;
  shop_location?: string;
  category: string;
  sub_category?: string;
  tags: string | string[];
  created_at?: string;
}

interface Comment {
  id: number;
  user_name: string;
  content: string;
  rating: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  created_at: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      request(`/products/${id}`),
      request(`/products/${id}/comments`).catch(() => []),
    ])
      .then(([prod, cmts]) => {
        setProduct(prod);
        setComments(cmts || []);
        setIsFavorite(prod.is_favorite || false);
      })
      .catch(() => {
        setProduct(null);
      })
      .finally(() => setLoading(false));

    request(`/products/${id}/view`, { method: 'POST' }).catch(() => {});
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!id || favoriting) return;
    setFavoriting(true);
    try {
      if (isFavorite) {
        await request(`/products/${id}/favorite`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        await request(`/products/${id}/favorite`, { method: 'POST' });
        setIsFavorite(true);
      }
    } catch {
      // silently fail
    } finally {
      setFavoriting(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'positive') return <ThumbsUp size={14} className="text-emerald-500" />;
    if (sentiment === 'negative') return <ThumbsDown size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const getSentimentLabel = (sentiment: string) => {
    if (sentiment === 'positive') return '正向';
    if (sentiment === 'negative') return '负向';
    return '中性';
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (sentiment === 'negative') return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">加载商品详情...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-32">
        <Inbox size={56} className="mx-auto text-slate-200 mb-4" />
        <p className="text-slate-400 text-sm">商品不存在或已下架</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600 transition-colors"
        >
          返回商品列表
        </button>
      </div>
    );
  }

  const discount = product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const parsedTags = typeof product.tags === 'string'
    ? product.tags.split(',').filter(Boolean)
    : (product.tags || []);

  const positiveCount = comments.filter(c => c.sentiment === 'positive').length;
  const neutralCount = comments.filter(c => c.sentiment === 'neutral').length;
  const negativeCount = comments.filter(c => c.sentiment === 'negative').length;
  const positiveRate = comments.length > 0 ? Math.round(positiveCount / comments.length * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        返回商品列表
      </button>

      {/* Title + Category */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-[11px] font-medium rounded-lg border border-orange-100">
                {product.category}
              </span>
              {product.sub_category && (
                <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[11px] font-medium rounded-lg border border-slate-100">
                  {product.sub_category}
                </span>
              )}
              {discount > 0 && (
                <span className="px-2.5 py-1 bg-rose-50 text-rose-500 text-[11px] font-medium rounded-lg border border-rose-100">
                  -{discount}% 折扣
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-800 leading-relaxed">
              {product.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleFavorite}
              disabled={favoriting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isFavorite
                  ? 'bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100'
                  : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25'
              }`}
            >
              <Heart size={16} className={isFavorite ? 'fill-rose-500' : ''} />
              {isFavorite ? '已收藏' : '收藏'}
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
              <Share2 size={16} />
              分享
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-orange-50/50 border border-white/40 shadow-sm">
          <h3 className="text-xs font-medium text-slate-500 mb-2">当前价格</h3>
          <div className="text-2xl font-bold text-orange-500">¥{product.price}</div>
          {product.original_price > product.price && (
            <div className="text-xs text-slate-400 line-through mt-1">¥{product.original_price}</div>
          )}
        </div>
        <div className="p-5 rounded-2xl bg-emerald-50/50 border border-white/40 shadow-sm">
          <h3 className="text-xs font-medium text-slate-500 mb-2">总销量</h3>
          <div className="text-2xl font-bold text-slate-800">{product.sales.toLocaleString()}</div>
          {product.monthly_sales && (
            <div className="text-xs text-slate-400 mt-1">月销 {product.monthly_sales.toLocaleString()}</div>
          )}
        </div>
        <div className="p-5 rounded-2xl bg-amber-50/50 border border-white/40 shadow-sm">
          <h3 className="text-xs font-medium text-slate-500 mb-2">商品评分</h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-800">{product.rating}</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} className={i < Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
            ))}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-blue-50/50 border border-white/40 shadow-sm">
          <h3 className="text-xs font-medium text-slate-500 mb-2">评论数</h3>
          <div className="text-2xl font-bold text-slate-800">{comments.length}</div>
          <div className="text-xs text-emerald-500 mt-1">好评率 {positiveRate}%</div>
        </div>
        <div className="p-5 rounded-2xl bg-rose-50/50 border border-white/40 shadow-sm">
          <h3 className="text-xs font-medium text-slate-500 mb-2">节省金额</h3>
          <div className="text-2xl font-bold text-slate-800">
            ¥{product.original_price > product.price ? (product.original_price - product.price).toFixed(0) : '0'}
          </div>
          <div className="text-xs text-slate-400 mt-1">{discount > 0 ? `折扣 ${discount}%` : '暂无优惠'}</div>
        </div>
      </div>

      {/* Shop & Tags Row */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Shop Info */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4">店铺信息</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Store size={14} className="text-orange-500" />
                <span className="text-sm text-slate-500">店铺名称</span>
              </div>
              <span className="text-sm font-medium text-slate-800">{product.shop_name}</span>
            </div>
            {product.shop_location && (
              <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-orange-500" />
                  <span className="text-sm text-slate-500">所在地区</span>
                </div>
                <span className="text-sm font-medium text-slate-800">{product.shop_location}</span>
              </div>
            )}
            {product.created_at && (
              <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-orange-500" />
                  <span className="text-sm text-slate-500">上架时间</span>
                </div>
                <span className="text-sm font-medium text-slate-800">{product.created_at.slice(0, 10)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags & Sentiment Summary */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4">标签与评价概览</h3>
          {parsedTags.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={13} className="text-slate-400" />
                <span className="text-xs text-slate-500">商品标签</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedTags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-600 text-xs rounded-lg border border-slate-100">{tag}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={13} className="text-slate-400" />
            <span className="text-xs text-slate-500">情感分布</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-emerald-50/50 rounded-xl">
              <ThumbsUp size={16} className="text-emerald-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-emerald-600">{positiveCount}</div>
              <div className="text-[10px] text-slate-400">正向</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <Minus size={16} className="text-slate-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-slate-600">{neutralCount}</div>
              <div className="text-[10px] text-slate-400">中性</div>
            </div>
            <div className="text-center p-3 bg-rose-50/50 rounded-xl">
              <ThumbsDown size={16} className="text-rose-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-rose-600">{negativeCount}</div>
              <div className="text-[10px] text-slate-400">负向</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">用户评论</h3>
            <p className="text-xs text-slate-500">
              共 {comments.length} 条评论，含情感分析标注
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {['positive', 'neutral', 'negative'].map((s) => {
              const count = comments.filter((c) => c.sentiment === s).length;
              return (
                <div key={s} className="flex items-center gap-1.5">
                  {getSentimentIcon(s)}
                  <span className="text-slate-500">
                    {getSentimentLabel(s)} {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">暂无评论数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center text-xs font-medium text-orange-600">
                      {comment.user_name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {comment.user_name}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < comment.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getSentimentColor(comment.sentiment)}`}>
                      {getSentimentIcon(comment.sentiment)}
                      {getSentimentLabel(comment.sentiment)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {comment.created_at?.slice(0, 10)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-11">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
