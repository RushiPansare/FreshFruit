import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api';
import { useToast } from '../../context/ToastContext';

export default function AdminCustomers() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [target, setTarget] = useState(null);   // customer waiting for delete confirmation
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api.get('admin/customers/', { params: { q: search || undefined } }).then((r) => setList(r.data));
  };

  useEffect(() => { load(); }, [search]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete('admin/customers/' + target.id + '/');
      toast.success(target.name + ' deleted successfully');
      setTarget(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete customer'));
    }
    setDeleting(false);
  };

  return (
    <>
      <div className='row' style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Customers</h2>
        <input placeholder='Search name or email' value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className='table-wrap' style={{ marginTop: 14 }}>
        <table className='adm-table'>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Joined</th><th>Last login</th><th>Orders</th><th>Total spent</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td><Link to={'/admin/customers/' + c.id} className='cust-link'>{c.name}</Link></td>
                <td>{c.email}</td>
                <td>{new Date(c.joined).toLocaleDateString()}</td>
                <td>
                  {c.last_login
                    ? new Date(c.last_login).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
                    : <span className='muted'>Never</span>}
                </td>
                <td>{c.orders}</td>
                <td>₹{Number(c.spent).toFixed(2)}</td>
                <td>{c.is_active ? <span className='stk stk-ok'>Active</span> : <span className='stk stk-out'>Blocked</span>}</td>
                <td>
                  <button className='btn sm danger' onClick={() => setTarget(c)}>🗑 Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <p className='muted'>No customers found.</p>}

      {target && (
        <div className='modal-bg' onClick={() => !deleting && setTarget(null)}>
          <div className='modal' style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, color: '#c62828' }}>Delete customer?</h3>
            <p style={{ margin: 0 }}>
              You are about to permanently delete <b>{target.name}</b> ({target.email}).
            </p>
                      <div className='warn-box'>
              This will delete:
              <ul>
                <li>their account and login</li>
                <li>their cart and all their reviews</li>
              </ul>
              Their {target.orders} {target.orders === 1 ? 'order stays' : 'orders stay'} in your records, and the revenue is not reduced.
              <br /><b>This cannot be undone.</b>
            </div>
            <div className='row'>
              <button className='btn danger' onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, delete permanently'}
              </button>
              <button className='btn-outline' style={{ margin: 0 }} onClick={() => setTarget(null)} disabled={deleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}