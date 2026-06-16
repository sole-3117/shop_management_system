import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../features/products/productsSlice';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';

const defaultForm = { name: '', description: '', price: '', cost_price: '', stock: '', unit: 'dona', category_id: '', barcode: '', is_active: true };

export default function Products() {
  const dispatch = useDispatch();
  const { items, pagination, isLoading } = useSelector(s => s.products);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts({ page, search }));
    api.get('/categories').then(r => setCategories(r.data.data));
  }, [page, search]);

  const openCreate = () => { setForm(defaultForm); setModal({ open: true, mode: 'create' }); };
  const openEdit = (product) => { setForm({ ...product, price: product.price, cost_price: product.cost_price || '' }); setModal({ open: true, mode: 'edit', data: product }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, price: parseFloat(form.price), cost_price: parseFloat(form.cost_price) || 0, stock: parseInt(form.stock) || 0 };
    if (modal.mode === 'create') {
      await dispatch(createProduct(data));
      toast.success('Mahsulot qo\'shildi');
    } else {
      await dispatch(updateProduct({ id: modal.data.id, data }));
      toast.success('Mahsulot yangilandi');
    }
    setModal({ open: false });
  };

  const handleDelete = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    await dispatch(deleteProduct(id));
    toast.success('Mahsulot o\'chirildi');
  };

  const columns = [
    { key: 'name', label: 'Nomi' },
    { key: 'category_name', label: 'Kategoriya', render: v => v || '—' },
    { key: 'price', label: 'Narx', render: v => Number(v).toLocaleString() + ' so\'m' },
    { key: 'stock', label: 'Ombor', render: (v, row) => (
      <span className={v <= 10 ? 'badge-danger' : 'badge-success'}>{v} {row.unit}</span>
    )},
    { key: 'is_active', label: 'Holat', render: v => v ? <span className="badge-success">Faol</span> : <span className="badge-danger">Nofaol</span> },
    { key: 'actions', label: 'Amallar', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(row)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Tahrirlash</button>
        <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">O'chirish</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mahsulotlar</h1>
        <button onClick={openCreate} className="btn-primary">+ Qo'shish</button>
      </div>

      <div className="card">
        <div className="mb-4">
          <input
            className="input max-w-xs"
            placeholder="🔍 Qidirish..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Table columns={columns} data={items} loading={isLoading} />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Mahsulot qo\'shish' : 'Mahsulotni tahrirlash'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nomi *</label>
              <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategoriya</label>
              <select className="input" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                <option value="">Tanlang</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sotish narxi *</label>
              <input type="number" className="input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kelish narxi</label>
              <input type="number" className="input" value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})} min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Miqdor *</label>
              <input type="number" className="input" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">O'lchov birligi</label>
              <select className="input" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                {['dona', 'kg', 'g', 'l', 'ml', 'm', 'sm', 'juft'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tavsif</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Shtrix-kod</label>
            <input className="input" value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
            <span className="text-sm">Faol</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Saqlash</button>
            <button type="button" onClick={() => setModal({ open: false })} className="btn-secondary flex-1">Bekor qilish</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
