import { useEffect, useState } from "react";
import useAuthStore from "../../store/authStore";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, Activity, Clock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const DashboardPage = () => {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState([]);
  const [monthlyData, setmonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const [ordersRes, usersRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/orders/admin/all`, { headers }),
          fetch(`${API_URL}/users`, { headers }),
          fetch(`${API_URL}/products`, { headers }),
        ]);

        if (!ordersRes.ok || !usersRes.ok || !productsRes.ok) {
          throw new Error("Failed to fetch all dashboard data");
        }

        const orders = await ordersRes.json();
        const users = await usersRes.json();
        const products = await productsRes.json();

        // 1. Process Stats
        const totalSales = orders.reduce((acc, order) => acc + parseFloat(order.total), 0);
        const totalOrders = orders.length;
        const totalCustomers = users.filter((u) => u.role === "customer").length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        setStats([
          { label: "Ventas Totales", value: `$${totalSales.toFixed(2)}`, icon: DollarSign, color: "emerald" },
          { label: "Pedidos Totales", value: totalOrders, icon: ShoppingCart, color: "blue" },
          { label: "Clientes Totales", value: totalCustomers, icon: Users, color: "purple" },
          { label: "Valor Promedio Pedido", value: `$${avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: "amber" },
        ]);

        // 2. Process Monthly Sales
        const monthlySales = orders.reduce((acc, order) => {
          const d = new Date(order.createdAt);
          const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          acc[month] = (acc[month] || 0) + parseFloat(order.total);
          return acc;
        }, {});

        const monthlyChartData = Object.keys(monthlySales)
          .sort()
          .map((month) => {
            const [year, monthNum] = month.split("-");
            const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            return {
              month: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
              amount: monthlySales[month],
            };
          });

        setmonthlyData(monthlyChartData);

        // 3. Process Orders by Category
        const categories = products.reduce((acc, product) => {
          acc[product.categoryId] = product.Category.name;
          return acc;
        }, {});
        const ordersByCategory = orders
          .flatMap((o) => o.OrderItems)
          .reduce((acc, item) => {
            const categoryId = products.find((p) => p.id === item.productId)?.categoryId;
            if (categoryId) {
              const categoryName = categories[categoryId] || "Unknown";
              acc[categoryName] = (acc[categoryName] || 0) + 1;
            }
            return acc;
          }, {});
        const categoryChartData = Object.keys(ordersByCategory).map((category) => ({ category, orders: ordersByCategory[category] }));
        setCategoryData(categoryChartData);

        // 4. Process Order Status
        const statusCounts = orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});
        const statusChartData = [
          { name: "pending", value: statusCounts.pending || 0, color: "#f59e0b" },
          { name: "shipped", value: statusCounts.shipped || 0, color: "#3b82f6" },
          { name: "delivered", value: statusCounts.delivered || 0, color: "#10b981" },
          { name: "cancelled", value: statusCounts.cancelled || 0, color: "#ef4444" },
        ];
        setOrderStatusData(statusChartData.filter((s) => s.value > 0));

        // 5. Process Recent Orders
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Cargando...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-slate-900 text-red-500 flex items-center justify-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Panel de Control</h1>
          <p className="text-slate-400 text-lg">
            ¡Bienvenido de nuevo, <span className="text-emerald-400 font-medium">{user?.firstName}</span>!
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
              </div>
              <h3 className="text-slate-400 text-sm mb-1">{stat.label}</h3>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Line Chart - Full Width */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-emerald-400" size={20} />
            Ventas Mensuales
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="text-emerald-400" size={20} />
              Pedidos por Categoría
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

          {/* Pie Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="text-emerald-400" size={20} />
              Estado del Pedido
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
                    <span className="text-slate-300 text-sm capitalize">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="text-emerald-400" size={20} />
            Pedidos Recientes
          </h3>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <ShoppingCart className="text-emerald-400" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Pedido #{order.id}</p>
                  <p className="text-slate-400 text-sm">
                    {order.User.firstName} {order.User.lastName} - ${parseFloat(order.total).toFixed(2)}
                  </p>
                </div>
                <span className="text-slate-500 text-sm capitalize">{order.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
