import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Analytics() {
  const [period, setPeriod] = useState('30days');
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [chartRes, topRes, statsRes] = await Promise.all([
        api.get(`/analytics/sales-chart?period=${period}`),
        api.get('/analytics/top-products?limit=8'),
        api.get('/analytics/dashboard'),
      ]);
      setChartData(chartRes.data.data);
      setTopProducts(topRes.data.data);
      setStats(statsRes.data.data);
      setLoading(false);
    };
    load();
  }, [period]);

  const lineChart = {
    labels: chartData.map(d => d.date),
    datasets: [
      { label: 'Daromad', data: chartData.map(d => d.revenue), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, yAxisID: 'y' },
      { label: 'Buyurtmalar', data: chartData.map(d => d.orders), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: false, tension: 0.4, yAxisID: 'y1' },
    ],
  };

  const barChart = {
    labels: topProducts.map(p => p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name),
    datasets: [{
      label: 'Sotilgan',
      data: topProducts.map(p => p.total_sold),
      backgroundColor: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'],
    }],
  };

  const formatMoney = v => Number(v || 0).toLocaleString('uz-UZ') + ' so\'m';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Statistika</h1>
        <div className="flex gap-2">
          {[['7days', '7 kun'], ['30days', '30 kun'], ['12months', '12 oy']].map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Oylik daromad" value={formatMoney(stats.month?.revenue)} icon="💰" color="green" />
          <StatCard title="Oylik buyurtmalar" value={stats.month?.orders_count || 0} icon="🛒" color="blue" />
          <StatCard title="Mahsulotlar" value={stats.products?.total_products || 0} icon="📦" color="purple" />
          <StatCard title="Jami mijozlar" value={stats.customers?.total_customers || 0} icon="👥" color="yellow" />
        </div>
      )}

      {!loading && (
        <>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Savdo dinamikasi</h2>
            <Line data={lineChart} options={{
              responsive: true,
              interaction: { mode: 'index', intersect: false },
              scales: {
                y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Daromad (so\'m)' } },
                y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Buyurtmalar' }, grid: { drawOnChartArea: false } },
              },
            }} />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Top mahsulotlar (sotilgan miqdor)</h2>
            <Bar data={barChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Top mahsulotlar jadvali</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-gray-600">#</th>
                  <th className="text-left py-2 px-3 text-gray-600">Mahsulot</th>
                  <th className="text-right py-2 px-3 text-gray-600">Sotilgan</th>
                  <th className="text-right py-2 px-3 text-gray-600">Daromad</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                    <td className="py-2 px-3 font-medium">{p.name}</td>
                    <td className="py-2 px-3 text-right">{p.total_sold} dona</td>
                    <td className="py-2 px-3 text-right text-green-600 font-medium">{formatMoney(p.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
