import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, chartRes, ordersRes, topRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/sales-chart?period=7days'),
          api.get('/analytics/recent-orders?limit=5'),
          api.get('/analytics/top-products?limit=5'),
        ]);
        setStats(statsRes.data.data);
        setChartData(chartRes.data.data);
        setRecentOrders(ordersRes.data.data);
        setTopProducts(topRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatMoney = (n) => Number(n || 0).toLocaleString('uz-UZ') + ' so\'m';

  const lineChart = chartData ? {
    labels: chartData.map(d => d.date),
    datasets: [{
      label: 'Daromad',
      data: chartData.map(d => d.revenue),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.4,
    }],
  } : null;

  const orderColumns = [
    { key: 'order_number', label: '№' },
    { key: 'customer_name', label: 'Mijoz', render: v => v || 'Noma\'lum' },
    { key: 'total', label: 'Summa', render: v => formatMoney(v) },
    { key: 'status', label: 'Holat', render: v => (
      <span className={`badge-${v === 'completed' ? 'success' : v === 'pending' ? 'warning' : 'info'}`}>
        {v === 'completed' ? 'Tugallangan' : v === 'pending' ? 'Kutmoqda' : v}
      </span>
    )},
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Bugungi holat</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Bugungi daromad" value={formatMoney(stats?.today?.revenue)} icon="💰" color="green" />
        <StatCard title="Bugungi buyurtma" value={stats?.today?.orders_count || 0} icon="🛒" color="blue" />
        <StatCard title="Oylik daromad" value={formatMoney(stats?.month?.revenue)} icon="📊" color="purple" />
        <StatCard title="Jami mijozlar" value={stats?.customers?.total_customers || 0} icon="👥" color="yellow" />
      </div>

      {/* Chart */}
      {lineChart && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Oxirgi 7 kun savdo</h2>
          <Line data={lineChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      )}

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">So'nggi buyurtmalar</h2>
          <Table columns={orderColumns} data={recentOrders} loading={false} />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Top mahsulotlar</h2>
          <Table
            columns={[
              { key: 'name', label: 'Mahsulot' },
              { key: 'total_sold', label: 'Sotildi' },
              { key: 'total_revenue', label: 'Daromad', render: v => formatMoney(v) },
            ]}
            data={topProducts}
            loading={false}
          />
        </div>
      </div>
    </div>
  );
}
