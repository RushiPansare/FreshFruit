import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';

const money = (n) => '₹' + Number(n).toFixed(2);
const tabs = ['ALL', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sel, setSel] = useState(null);
  const [status, setStatus] = useState('');

  const load = () => {
    api.get('admin/orders/', {
      params: { status: tab === 'ALL' ? undefined : tab, q: search || undefined },
    }).then((r) => setOrders(r.data));
  };

  useEffect(() => { load(); }, [tab, search]);

  const openOrder = async (id) => {
    const { data } = await api.get('admin/orders/' + id + '/');
    setSel(data);
    setStatus(data.status);
  };

  const saveStatus = async () => {
    try {
      await api.patch('admin/orders/' + sel.id + '/', { status });
      toast.success('Order #' + sel.id + ' marked as ' + status);
      setSel(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the order'));
    }
  };

  return (
    <>
      <div className='row' style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Orders</h2>
        <input placeholder='Search name, email, phone or order no.' value={search} onChange={(e) => setSearch(e.target.value)} style={{ minWidth: 280 }} />
      </div>

      <div className='tabs'>
        {tabs.map((t) => (
          <button key={t} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className='table-wrap'>
        <table className='adm-table'>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>City</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                                           <td>
                  {o.user_id
                    ? <Link to={'/admin/customers/' + o.user_id} className='cust-link'>{o.customer}</Link>
                    : <><b>{o.customer}</b> <span className='stk stk-out'>Deleted</span></>}
                  <br /><span className='muted'>{o.email}</span>
                </td>
                <td>{o.city}</td>
                <td>{o.items_count}</td>
                <td>{money(o.total)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td>{new Date(o.created).toLocaleDateString()}</td>
                <td><button className='btn sm' onClick={() => openOrder(o.id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && <p className='muted'>No orders found.</p>}

      {sel && (
        <div className='modal-bg' onClick={() => setSel(null)}>
          <div className='modal' style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0 }}>Order #{sel.id} <StatusBadge status={sel.status} /></h3>
            <p className='muted' style={{ margin: 0 }}>{new Date(sel.created).toLocaleString()}</p>
            <div>
              <b>{sel.customer}</b> ({sel.email})<br />
              Phone: {sel.phone}<br />
              {sel.address}, {sel.city} - {sel.pincode}
            </div>

            <table className='adm-table'>
              <thead><tr><th>Fruit</th><th>Qty</th><th>Price / kg</th><th>Amount</th></tr></thead>
              <tbody>
                {sel.items.map((it, n) => (
                  <tr key={n}>
                    <td>{it.name}</td>
                    <td>{it.quantity_kg} kg</td>
                    <td>{money(it.price_per_kg)}</td>
                    <td>{money(it.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 style={{ margin: 0, textAlign: 'right' }}>Total: {money(sel.total)}</h3>

            <label className='muted'>Update status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={sel.status === 'CANCELLED'}>
              {tabs.slice(1).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <p className='muted' style={{ margin: 0 }}>Choosing CANCELLED returns the fruits to stock. A cancelled order cannot be reopened.</p>
            <div className='row'>
              <button className='btn' onClick={saveStatus} disabled={sel.status === 'CANCELLED'}>Save status</button>
              <button className='btn-outline' style={{ margin: 0 }} onClick={() => setSel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}