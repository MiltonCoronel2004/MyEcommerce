import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Package, ShoppingCart, DollarSign, TrendingUp, Activity, Clock } from "lucide-react";

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  // Mock data para estadísticas
  const stats = [
    { label: "Total Orders", value: "24", icon: ShoppingCart, change: "+12%", color: "emerald" },
    { label: "Total Spent", value: "$2,847", icon: DollarSign, change: "+8%", color: "blue" },
    { label: "Products Purchased", value: "47", icon: Package, change: "+23%", color: "purple" },
    { label: "Avg. Order Value", value: "$118", icon: TrendingUp, change: "+5%", color: "amber" },
  ];

  // Datos para gráfico de línea (gastos mensuales)
  const monthlyData = [
    { month: "Jan", amount: 245 },
    { month: "Feb", amount: 312 },
    { month: "Mar", amount: 189 },
    { month: "Apr", amount: 428 },
    { month: "May", amount: 389 },
    { month: "Jun", amount: 521 },
  ];

  // Datos para gráfico de barras (pedidos por categoría)
  const categoryData = [
    { category: "Electronics", orders: 12 },
    { category: "Clothing", orders: 8 },
    { category: "Home", orders: 15 },
    { category: "Sports", orders: 6 },
    { category: "Books", orders: 10 },
  ];

  // Datos para gráfico circular (estado de pedidos)
  const orderStatusData = [
    { name: "Delivered", value: 18, color: "#10b981" },
    { name: "In Transit", value: 4, color: "#3b82f6" },
    { name: "Processing", value: 2, color: "#f59e0b" },
  ];

  // Actividad reciente
  const recentActivity = [
    { action: "Order placed", item: "Wireless Headphones", time: "2 hours ago" },
    { action: "Order delivered", item: "Smart Watch", time: "1 day ago" },
    { action: "Review submitted", item: "USB-C Cable", time: "3 days ago" },
    { action: "Order placed", item: "Laptop Stand", time: "5 days ago" },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-lg">
            Welcome back, <span className="text-emerald-400 font-medium">{user?.firstName}</span>!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${stat.color}-500/10 rounded-lg`}>
                  <stat.icon className={`text-${stat.color}-400`} size={24} />
                </div>
                <span className="text-emerald-400 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-slate-400 text-sm mb-1">{stat.label}</h3>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={20} />
              Monthly Spending
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="text-emerald-400" size={20} />
              Orders by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="orders" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="text-emerald-400" size={20} />
              Order Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {orderStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-300 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="text-emerald-400" size={20} />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <ShoppingCart className="text-emerald-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-slate-400 text-sm">{activity.item}</p>
                  </div>
                  <span className="text-slate-500 text-sm">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
