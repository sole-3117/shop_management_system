import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchOrders, createOrder, updateOrderStatus } from '../../features/orders/ordersSlice';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';

const STATUS_LABELS = { pending: 'Kutmoqda', processing: 'Jarayonda', completed: 'Tugallangan', cancelled: 'Bekor' };
const STATUS_COLORS = { pending: 'warning', processing: 'info', completed: 'success', cancelled: 'danger' };

export default function Orders() {
  const dispatch = useDispatch();
  const { items, pagination, isLoading } = useSelector(s => s.orders);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1, price: 0 }]);
  const [orderForm, setOrderForm] = useState({ customerId: '', paymentMethod: 'cash', discount: 0, notes: '' });
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    dispatch(fetchOrders({ page, status: filter || undefined }));
  }, [page, filter]);

  const openCreate = async () => {
    const [pRes, cRes] = await Promise.all([api.get('/products?limit=100'), api.get('/customers?limit=100')]);
    setProducts(pRes.data.data);
    setCustomers(cRes.data.data);
    setOrderItems([{ productId: '', quantity: 1, price: 0 }]);
    setOrderForm({ customerId: '', paymentMethod: 'cash', discount: 0, notes: '' });
    setModal({ open: true, mode: 'create' });
  };

  const addItem = () => setOrderItems([...orderItems, { productId: '', quantity: 1, price: 0 }]);
  const removeItem = (i) => setOrderItems(orderItems.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...orderItems];
    updated[i] = { ...updated[i], [field]: value };
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) updated[i].price = prod.price;
    }
    setOrderItems(updated);
  };

  const total = orderItems.reduce((s, i) => s + (i.price * i.quantity), 0) - Number(orderForm.discount || 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    const items = orderItems.filter(i => i.productId);
    if (!items.length) return toast.error('Kamida 1 ta mahsulot tanlang');
    const result = await dispatch(createOrder({
      customerId: orderForm.customerId || undefined,
      items: items.map(i => ({ productId: i.productId, quantity: parseInt(i.quantity) })),
      discount: Number(orderForm.discount),
      paymentMethod: orderForm.paymentMethod,
      notes: orderForm.notes,
    }));
    if (createOrder.fulfilled.match(result)) {
      toast.success('Buyurtma yaratildi');
      setModal({ open: false });
      dispatch(fetchOrders({ page: 1 }));
    }
  };

  const handleStatusUpdate = async (order) => {
    const nextStatus = order.status === 'pending' ? 'processing' : order.status === 'processing' ? 'completed' : null;
    if (!nextStatus) return;
    await dispatch(updateOrderStatus({ id: order.id, status: nextStatus, paymentStatus: nextStatus === 'completed' ? 'paid' : undefined }));
    toast.success('Holat yangilandi');
  };

  const columns = [
    { key: 'order_number', label: 'Buyurtma №' },
    { key: 'customer_name', label: 'Mijoz', render: v => v || 'Noma\'lum' },
    { key: 'total', label: 'Summa', render: v => Number(v).toLocaleString() + ' so\'m' },
    { key: 'payment_method', label: 'To\'lov', render: v => v === 'cash' ? '💵 Naqd' : '💳 Karta' },
    { key: 'status', label: 'Holat', render: v => <span className={`badge-${STATUS_COLORS[v]}`}>{STATUS_LABELS[v]}</span> },
    { key: 'payment_status', label: 'To\'lov holati', render: v => <span className={`badge-${v === 'paid' ? 'success' : 'warning'}`}>{v === 'paid' ? 'To\'langan' : 'Kutmoqda'}</span> },
    { key: 'created_at', label: 'Sana', render: v => new Date(v).toLocaleDateString('uz-UZ') },
    { key: 'actions', label: '', render: (_, row) => row.status !== 'completed' && row.status !== 'cancelled' ? (
      <button onClick={() => handleStatusUpdate(row)} className="text-blue-600 text-sm font-medium hover:underline">
        {row.status === 'pending' ? '▶ Jarayonga' : '✅ Tugallash'}
      </button>
    ) : null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Buyurtmalar</h1>
        <button onClick={openCreate} className="btn-primary">+ Yangi buyurtma</button>
      </div>

      <div className="card">
        <div className="mb-4 flex gap-2 flex-wrap">
          {[['', 'Barchasi'], ['pending', 'Kutmoqda'], ['processing', 'Jarayonda'], ['completed', 'Tugallangan'], ['cancelled', 'Bekor']].map(([val, label]) => (
            <button key={val} onClick={() => { setFilter(val); setPage(1); }}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${filter === val ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
              {label}
            </button>
          ))}
        </div>
        <Table columns={columns} data={items} loading={isLoading} />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title="Yangi buyurtma" size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mijoz (ixtiyoriy)</label>
              <select className="input" value={orderForm.customerId} onChange={e => setOrderForm({...orderForm, customerId: e.target.value})}>
                <option value="">Mijoz tanlang</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To'lov usuli</label>
              <select className="input" value={orderForm.paymentMethod} onChange={e => setOrderForm({...orderForm, paymentMethod: e.target.value})}>
                <option value="cash">💵 Naqd</option>
                <option value="card">💳 Karta</option>
                <option value="transfer">🏦 O'tkazma</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Mahsulotlar</label>
              <button type="button" onClick={addItem} className="text-blue-600 text-sm font-medium">+ Qo'shish</button>
            </div>
            <div className="space-y-2">
              {orderItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select className="input flex-1" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} required>
                    <option value="">Mahsulot tanlang</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} — {Number(p.price).toLocaleString()} so'm (Ombor: {p.stock})</option>)}
                  </select>
                  <input type="number" className="input w-24" min="1" value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Miqdor" />
                  <span className="text-sm text-gray-500 w-32 text-right">{(item.price * item.quantity).toLocaleString()} so'm</span>
                  {orderItems.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-500 text-lg leading-none">&times;</button>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Chegirma (so'm)</label>
              <input type="number" className="input" min="0" value={orderForm.discount}
                onChange={e => setOrderForm({...orderForm, discount: e.target.value})} />
            </div>
            <div className="flex items-end">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full text-center">
                <p className="text-sm text-blue-600">Jami to'lov</p>
                <p className="text-xl font-bold text-blue-800">{total.toLocaleString()} so'm</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Izoh</label>
            <textarea className="input" rows={2} value={orderForm.notes} onChange={e => setOrderForm({...orderForm, notes: e.target.value})} />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">Buyurtma yaratish</button>
            <button type="button" onClick={() => setModal({ open: false })} className="btn-secondary flex-1">Bekor qilish</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
