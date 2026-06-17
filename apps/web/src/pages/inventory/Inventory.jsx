import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, product: null });
  const [stockForm, setStockForm] = useState({ quantity: '', type: 'add' });

  const load = async () => {
    setLoading(true);
    const [allRes, lowRes] = await Promise.all([
      api.get('/products?limit=100'),
      api.get('/products/low-stock?threshold=10'),
    ]);
    setProducts(allRes.data.data);
    setLowStock(lowRes.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    await api.patch(`/products/${modal.product.id}/stock`, {
      quantity: parseInt(stockForm.quantity),
      type: stockForm.type,
    });
    toast.success('Ombor yangilandi');
    setModal({ open: false });
    load();
  };

  const columns = [
    { key: 'name', label: 'Mahsulot' },
    { key: 'category_name', label: 'Kategoriya', render: v => v || '—' },
    { key: 'stock', label: 'Miqdor', render: (v, row) => (
      <span className={`font-semibold ${v <= 0 ? 'text-red-600' : v <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
        {v} {row.unit}
      </span>
    )},
    { key: 'price', label: 'Narx', render: v => Number(v).toLocaleString() + ' so\'m' },
    { key: 'actions', label: '', render: (_, row) => (
      <button onClick={() => { setModal({ open: true, product: row }); setStockForm({ quantity: '', type: 'add' }); }}
        className="text-blue-600 text-sm hover:underline">Yangilash</button>
    )},
  ];

  const totalValue = products.reduce((s, p) => s + (p.price * p.stock), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ombor</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Jami mahsulotlar" value={products.length} icon="📦" color="blue" />
        <StatCard title="Kam qolganlar" value={lowStock.length} icon="⚠️" color="yellow" />
        <StatCard title="Ombor qiymati" value={totalValue.toLocaleString() + ' so\'m'} icon="💰" color="green" />
      </div>

      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-3">⚠️ Kam qolgan mahsulotlar</h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(p => (
              <span key={p.id} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {p.name}: {p.stock} {p.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <Table columns={columns} data={products} loading={loading} />
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title="Omborni yangilash">
        {modal.product && (
          <form onSubmit={handleStockUpdate} className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium">{modal.product.name}</p>
              <p className="text-sm text-gray-500">Joriy miqdor: <span className="font-semibold">{modal.product.stock} {modal.product.unit}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amal turi</label>
              <select className="input" value={stockForm.type} onChange={e => setStockForm({...stockForm, type: e.target.value})}>
                <option value="add">+ Qo'shish</option>
                <option value="subtract">- Ayirish</option>
                <option value="set">= Belgilash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Miqdor *</label>
              <input type="number" className="input" min="0" value={stockForm.quantity}
                onChange={e => setStockForm({...stockForm, quantity: e.target.value})} required />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Saqlash</button>
              <button type="button" onClick={() => setModal({ open: false })} className="btn-secondary flex-1">Bekor</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
