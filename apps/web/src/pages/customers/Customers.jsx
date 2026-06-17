import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchCustomers, createCustomer } from '../../features/customers/customersSlice';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';

const defaultForm = { name: '', phone: '', email: '', address: '', notes: '' };

export default function Customers() {
  const dispatch = useDispatch();
  const { items, pagination, isLoading } = useSelector(s => s.customers);
  const [modal, setModal] = useState({ open: false });
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { dispatch(fetchCustomers({ page, search })); }, [page, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createCustomer(form));
    if (createCustomer.fulfilled.match(result)) {
      toast.success('Mijoz qo\'shildi');
      setModal({ open: false });
      setForm(defaultForm);
    }
  };

  const columns = [
    { key: 'name', label: 'Ismi' },
    { key: 'phone', label: 'Telefon', render: v => v || '—' },
    { key: 'email', label: 'Email', render: v => v || '—' },
    { key: 'total_orders', label: 'Buyurtmalar' },
    { key: 'total_spent', label: 'Jami sarflagan', render: v => Number(v || 0).toLocaleString() + ' so\'m' },
    { key: 'telegram_id', label: 'Telegram', render: v => v ? <span className="badge-info">Ulangan</span> : '—' },
    { key: 'created_at', label: 'Qo\'shilgan', render: v => new Date(v).toLocaleDateString('uz-UZ') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mijozlar</h1>
        <button onClick={() => { setForm(defaultForm); setModal({ open: true }); }} className="btn-primary">+ Qo'shish</button>
      </div>

      <div className="card">
        <div className="mb-4">
          <input className="input max-w-xs" placeholder="🔍 Ism yoki telefon..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Table columns={columns} data={items} loading={isLoading} />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title="Yangi mijoz">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ismi *</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+998 90 000 00 00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Manzil</label>
            <textarea className="input" rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Izoh</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">Saqlash</button>
            <button type="button" onClick={() => setModal({ open: false })} className="btn-secondary flex-1">Bekor</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
