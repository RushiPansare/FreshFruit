import { useState, useEffect } from 'react';
import api, { errorMessage } from '../../api';
import { useToast } from '../../context/ToastContext';

const empty = { name: '', description: '', price_per_kg: '', discount_percent: 0, stock_kg: '' };

export default function AdminProducts() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);

  const load = () => api.get('admin/fruits/').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null); setForm(empty); setFile(null); setOpen(true);
  };

  const openEdit = (f) => {
    setEditing(f.id);
    setForm({
      name: f.name, description: f.description, price_per_kg: f.price_per_kg,
      discount_percent: f.discount_percent, stock_kg: f.stock_kg,
    });
    setFile(null);
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!editing && !file) return toast.error('Please choose an image');
    const fd = new FormData();
    Object.keys(form).forEach((k) => fd.append(k, form[k]));
    if (file) fd.append('image', file);
    try {
      if (editing) await api.patch('admin/fruits/' + editing + '/', fd);
      else await api.post('admin/fruits/', fd);
      toast.success(editing ? 'Product updated successfully' : 'Product added successfully');
      setOpen(false);
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save product'));
    }
  };

  const remove = async (f) => {
    if (!window.confirm('Delete ' + f.name + '?')) return;
    try {
      await api.delete('admin/fruits/' + f.id + '/');
      toast.success(f.name + ' deleted successfully');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete product'));
    }
  };

  const shown = items.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const stockBadge = (s) => {
    s = Number(s);
    if (s <= 0) return <span className='stk stk-out'>Out of stock</span>;
    if (s <= 10) return <span className='stk stk-low'>{s} kg (low)</span>;
    return <span className='stk stk-ok'>{s} kg</span>;
  };

  return (
    <>
      <div className='row' style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Products</h2>
        <div className='row'>
          <input placeholder='Search products...' value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className='btn' onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      <div className='table-wrap' style={{ marginTop: 14 }}>
        <table className='adm-table'>
          <thead>
            <tr><th>Image</th><th>Name</th><th>Price / kg</th><th>Discount</th><th>Selling price</th><th>Stock</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {shown.map((f) => (
              <tr key={f.id}>
                <td><img src={f.image} alt={f.name} className='thumb' /></td>
                <td><b>{f.name}</b></td>
                <td>₹{Number(f.price_per_kg)}</td>
                <td>{f.discount_percent}%</td>
                <td>₹{Number(f.final_price)}</td>
                <td>{stockBadge(f.stock_kg)}</td>
                <td>
                  <button className='btn sm' onClick={() => openEdit(f)}>Edit</button>{' '}
                  <button className='btn sm danger' onClick={() => remove(f)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && <p className='muted'>No products found.</p>}

      {open && (
        <div className='modal-bg' onClick={() => setOpen(false)}>
          <form className='modal' onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h3 style={{ margin: 0 }}>{editing ? 'Edit product' : 'Add product'}</h3>
            <input name='name' placeholder='Fruit name' value={form.name} onChange={change} required />
            <textarea name='description' placeholder='Description' value={form.description} onChange={change} required />
            <div className='row'>
              <input name='price_per_kg' type='number' step='0.01' min='1' placeholder='Price per kg (₹)' value={form.price_per_kg} onChange={change} required />
              <input name='discount_percent' type='number' min='0' max='100' placeholder='Discount %' value={form.discount_percent} onChange={change} required />
            </div>
            <input name='stock_kg' type='number' step='0.5' min='0' placeholder='Stock (kg)' value={form.stock_kg} onChange={change} required />
            <label className='muted'>Image {editing && '(leave empty to keep the current one)'}</label>
            <input type='file' accept='image/*' onChange={(e) => setFile(e.target.files[0])} />
            <div className='row'>
              <button className='btn'>Save</button>
              <button type='button' className='btn-outline' style={{ margin: 0 }} onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}