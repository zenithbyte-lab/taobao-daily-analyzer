import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { request } from '../api';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Lock,
  Heart,
  Clock,
  Calendar,
  Save,
  Trash2,
  ShoppingBag,
  Star,
} from 'lucide-react';

interface FavoriteItem {
  id: number;
  product_id: number;
  title: string;
  price: number;
  sales: number;
  created_at: string;
}

interface HistoryItem {
  id: number;
  product_id: number;
  title: string;
  price: number;
  viewed_at: string;
}

interface ProfileStats {
  favorites_count: number;
  history_count: number;
  join_date: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'favorites' | 'history'>('info');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [infoError, setInfoError] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<ProfileStats>({ favorites_count: 0, history_count: 0, join_date: '' });
  const [loadingFav, setLoadingFav] = useState(false);
  const [loadingHist, setLoadingHist] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [histPage, setHistPage] = useState(1);
  const [favPage, setFavPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    request('/user/stats')
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'favorites') {
      setLoadingFav(true);
      request('/user/favorites')
        .then((data) => setFavorites(data || []))
        .catch(() => setFavorites([]))
        .finally(() => setLoadingFav(false));
    }
    if (activeTab === 'history') {
      setLoadingHist(true);
      request('/user/history')
        .then((data) => setHistory(data || []))
        .catch(() => setHistory([]))
        .finally(() => setLoadingHist(false));
    }
  }, [activeTab]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMsg('');
    setInfoError('');
    setSavingInfo(true);
    try {
      await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ username, email }),
      });
      setInfoMsg('个人信息更新成功');
    } catch (err: any) {
      setInfoError(err.message || '更新失败');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdError('');
    if (newPassword !== confirmPassword) {
      setPwdError('两次输入的密码不一致');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('新密码长度不能少于6位');
      return;
    }
    setSavingPwd(true);
    try {
      await request('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      setPwdMsg('密码修改成功');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.message || '密码修改失败');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleRemoveFavorite = async (productId: number) => {
    try {
      await request(`/products/${productId}/favorite`, { method: 'DELETE' });
      setFavorites((prev) => prev.filter((f) => f.product_id !== productId));
    } catch {
      // silently fail
    }
  };

  const tabs = [
    { id: 'info' as const, label: '个人信息', icon: User },
    { id: 'favorites' as const, label: '我的收藏', icon: Heart },
    { id: 'history' as const, label: '浏览记录', icon: Clock },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="animate-in fade-in duration-500"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">个人中心</h1>
          <p className="text-sm text-slate-500">管理您的账户信息、收藏和浏览记录</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="p-6 rounded-2xl bg-orange-50/50 border border-white/40 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Heart size={16} className="text-orange-500" />
            <h3 className="text-xs font-medium text-slate-500">我的收藏</h3>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.favorites_count}</div>
        </div>
        <div className="p-6 rounded-2xl bg-blue-50/50 border border-white/40 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Clock size={16} className="text-blue-500" />
            <h3 className="text-xs font-medium text-slate-500">浏览记录</h3>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.history_count}</div>
        </div>
        <div className="p-6 rounded-2xl bg-emerald-50/50 border border-white/40 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Calendar size={16} className="text-emerald-500" />
            <h3 className="text-xs font-medium text-slate-500">注册日期</h3>
          </div>
          <div className="text-xl font-bold text-slate-800">{(stats.join_date || user?.created_at || '').slice(0, 10) || '--'}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Update Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-1">基本信息</h3>
            <p className="text-xs text-slate-500 mb-6">更新您的用户名和邮箱地址</p>

            {infoMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-600">
                {infoMsg}
              </div>
            )}
            {infoError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600">
                {infoError}
              </div>
            )}

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User size={14} className="inline mr-1" />
                  用户名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail size={14} className="inline mr-1" />
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={savingInfo}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm disabled:opacity-60"
              >
                <Save size={16} />
                {savingInfo ? '保存中...' : '保存修改'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-1">修改密码</h3>
            <p className="text-xs text-slate-500 mb-6">定期更换密码以保障账户安全</p>

            {pwdMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-600">
                {pwdMsg}
              </div>
            )}
            {pwdError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600">
                {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Lock size={14} className="inline mr-1" />
                  当前密码
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                  placeholder="请输入当前密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  新密码
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                  placeholder="请输入新密码（至少6位）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  确认新密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                  placeholder="请再次输入新密码"
                />
              </div>
              <button
                type="submit"
                disabled={savingPwd}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm disabled:opacity-60"
              >
                <Lock size={16} />
                {savingPwd ? '修改中...' : '修改密码'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-1">我的收藏</h3>
          <p className="text-xs text-slate-500 mb-6">您收藏的商品列表</p>

          {loadingFav ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-sm">暂无收藏商品</p>
              <p className="text-slate-300 text-xs mt-1">浏览商品时点击收藏按钮即可添加</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {favorites.slice((favPage - 1) * pageSize, favPage * pageSize).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                        <ShoppingBag size={18} className="text-orange-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-800">{item.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-orange-500 font-medium">¥{item.price}</span>
                          <span className="text-xs text-slate-400">销量 {item.sales}</span>
                          <span className="text-xs text-slate-400">收藏于 {item.created_at?.slice(0, 10)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(item.product_id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="取消收藏"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {favorites.length > pageSize && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button onClick={() => setFavPage(p => Math.max(1, p - 1))} disabled={favPage <= 1}
                    className="px-4 py-2 bg-white text-slate-600 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors disabled:opacity-40 text-sm">上一页</button>
                  <span className="text-xs text-slate-400">第 {favPage} / {Math.ceil(favorites.length / pageSize)} 页，共 {favorites.length} 条</span>
                  <button onClick={() => setFavPage(p => Math.min(Math.ceil(favorites.length / pageSize), p + 1))} disabled={favPage >= Math.ceil(favorites.length / pageSize)}
                    className="px-4 py-2 bg-white text-slate-600 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors disabled:opacity-40 text-sm">下一页</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-1">浏览记录</h3>
          <p className="text-xs text-slate-500 mb-6">您最近查看过的商品</p>

          {loadingHist ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16">
              <Clock size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-sm">暂无浏览记录</p>
              <p className="text-slate-300 text-xs mt-1">浏览商品详情时会自动记录</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {history.slice((histPage - 1) * pageSize, histPage * pageSize).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Clock size={18} className="text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-800">{item.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-orange-500 font-medium">¥{item.price}</span>
                          <span className="text-xs text-slate-400">浏览于 {item.viewed_at?.slice(0, 16)}</span>
                        </div>
                      </div>
                    </div>
                    <Star size={16} className="text-slate-300" />
                  </div>
                ))}
              </div>
              {history.length > pageSize && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button onClick={() => setHistPage(p => Math.max(1, p - 1))} disabled={histPage <= 1}
                    className="px-4 py-2 bg-white text-slate-600 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors disabled:opacity-40 text-sm">上一页</button>
                  <span className="text-xs text-slate-400">第 {histPage} / {Math.ceil(history.length / pageSize)} 页，共 {history.length} 条</span>
                  <button onClick={() => setHistPage(p => Math.min(Math.ceil(history.length / pageSize), p + 1))} disabled={histPage >= Math.ceil(history.length / pageSize)}
                    className="px-4 py-2 bg-white text-slate-600 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors disabled:opacity-40 text-sm">下一页</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
