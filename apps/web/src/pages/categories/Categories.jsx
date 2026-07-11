import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ name: '', description: '', is_active: true });

  const load = async () => {
    setLoading(true);
    const r = await api.get('/categories');
    setItems(r.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modal.mode === 'create') {
      await api.post('/categories', form);
      toast.success('Kategoriya qo\'shildi');
    } else {
      await api.put(`/categories/${modal.data.id}`, form);
      toast.success('Yangilandi');
    }
    setModal({ open: false });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('O\'chirildi');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik');
    }
  };

  const columns = [
    { key: 'name', label: 'Nomi' },
    { key: 'description', label: 'Tavsif', render: v => v || '—' },
    { key: 'is_active', label: 'Holat', render: v => v ? <span className="badge-success">Faol</span> : <span className="badge-danger">Nofaol</span> },
    { key: 'actions', label: '', render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => { setForm(row); setModal({ open: true, mode: 'edit', data: row }); }} className="text-blue-600 hover:underline text-sm">Tahrir</button>
        <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:underline text-sm">O'chir</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kategoriyalar</h1>
        <button onClick={() => { setForm({ name: '', description: '', is_active: true }); setModal({ open: true, mode: 'create' }); }} className="btn-primary">+ Qo'shish</button>
      </div>
      <div className="card">
        <Table columns={columns} data={items} loading={loading} />
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'create' ? 'Kategoriya qo\'shish' : 'Tahrirlash'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nomi *</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tavsif</label>
            <textarea className="input" rows={3} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
            <span className="text-sm">Faol</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">Saqlash</button>
            <button type="button" onClick={() => setModal({ open: false })} className="btn-secondary flex-1">Bekor</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
