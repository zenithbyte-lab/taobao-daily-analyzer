import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  ScanLine,
  Database,
  BarChart2,
  TrendingUp,
  Settings,
  Sparkles,
  ShoppingBag,
  User,
  LogOut,
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import OverviewDashboard from "./components/OverviewDashboard";
import CollectionTasks from "./components/CollectionTasks";
import DataProcessing from "./components/DataProcessing";
import CategoryAnalysis from "./components/CategoryAnalysis";
import SalesPrediction from "./components/SalesPrediction";
import ManagementCenter from "./components/ManagementCenter";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ProductListPage from "./components/ProductListPage";
import ProductDetailPage from "./components/ProductDetailPage";
import ProfilePage from "./components/ProfilePage";

const dashboardNavItems = [
  {
    id: "overview",
    path: "/dashboard",
    label: "总览看板",
    subLabel: "多维指标概览",
    icon: LayoutDashboard,
  },
  {
    id: "collection",
    path: "/dashboard/collection",
    label: "采集任务",
    subLabel: "源数据与批次",
    icon: ScanLine,
  },
  {
    id: "processing",
    path: "/dashboard/processing",
    label: "数据处理",
    subLabel: "清洗与特征工程",
    icon: Database,
  },
  {
    id: "category",
    path: "/dashboard/category",
    label: "类目分析",
    subLabel: "价格与销量联动",
    icon: BarChart2,
  },
  {
    id: "prediction",
    path: "/dashboard/prediction",
    label: "销量预测",
    subLabel: "趋势与预警",
    icon: TrendingUp,
  },
  {
    id: "management",
    path: "/dashboard/management",
    label: "管理中心",
    subLabel: "采集任务与导出",
    icon: Settings,
  },
];

const extraNavItems = [
  {
    id: "products",
    path: "/products",
    label: "商品浏览",
    subLabel: "搜索与筛选商品",
    icon: ShoppingBag,
  },
  {
    id: "profile",
    path: "/profile",
    label: "个人中心",
    subLabel: "账户与收藏管理",
    icon: User,
  },
];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f3f4f6]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const allNavItems = [...dashboardNavItems, ...extraNavItems];

  const getActiveId = () => {
    const path = location.pathname;
    if (path.startsWith("/products")) return "products";
    if (path === "/profile") return "profile";
    for (const item of dashboardNavItems) {
      if (item.path === path) return item.id;
    }
    if (path.startsWith("/dashboard")) return "overview";
    return "overview";
  };

  const activeId = getActiveId();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1d24] text-slate-400 flex flex-col h-full shrink-0">
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Taobao Insight
            </div>
            <div className="text-white font-semibold text-lg tracking-wide">
              日用品分析平台
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {/* Dashboard Section */}
          <div className="px-4 mb-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
              数据分析
            </span>
          </div>
          {dashboardNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 text-left ${
                  isActive
                    ? "bg-white text-slate-800 shadow-sm"
                    : "hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-orange-500" : "text-slate-500"}
                />
                <div>
                  <div
                    className={`font-medium text-sm ${isActive ? "text-slate-800" : "text-slate-300"}`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`text-[10px] ${isActive ? "text-slate-500" : "text-slate-500"}`}
                  >
                    {item.subLabel}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Divider */}
          <div className="pt-4 pb-2 px-4">
            <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
              功能
            </span>
          </div>
          {extraNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 text-left ${
                  isActive
                    ? "bg-white text-slate-800 shadow-sm"
                    : "hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-orange-500" : "text-slate-500"}
                />
                <div>
                  <div
                    className={`font-medium text-sm ${isActive ? "text-slate-800" : "text-slate-300"}`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`text-[10px] ${isActive ? "text-slate-500" : "text-slate-500"}`}
                  >
                    {item.subLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 mb-4 mx-4 bg-[#232730] rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-200 truncate">
                {user?.username || "用户"}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {user?.email || ""}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors shrink-0"
              title="退出登录"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Decorative dots top left */}
        <div className="absolute top-6 left-8 flex gap-1.5 z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-12">
          <Routes>
            <Route path="/dashboard" element={<OverviewDashboard />} />
            <Route path="/dashboard/collection" element={<CollectionTasks />} />
            <Route path="/dashboard/processing" element={<DataProcessing />} />
            <Route path="/dashboard/category" element={<CategoryAnalysis />} />
            <Route path="/dashboard/prediction" element={<SalesPrediction />} />
            <Route path="/dashboard/management" element={<ManagementCenter />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
