import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { errorMessage } from '../../api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';

const money = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');
const dateTime = (d) => new Date(d).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
});

const ago = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return m + (m === 1 ? ' minute ago' : ' minutes ago');
  const h = Math.floor(m / 60);
  if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
  const dd = Math.floor(h / 24);
  if (dd < 30) return dd + (dd === 1 ? ' day ago' : ' days ago');
  const mo = Math.floor(dd / 30);
  if (mo < 12) return mo + (mo === 1 ? ' month ago' : ' months ago');
  const y = Math.floor(mo / 12);
  return y + (y === 1 ? ' year ago' : ' years ago');
};

const Stars = ({ n }) => (
  <span className='stars'>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
);

// Number that counts up from 0 when it appears or changes
function CountUp({ value, format }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / 700, 1);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{format(n)}</>;
}

const goTo = (sectionId) => {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 1300);
};

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [c, setC] = useState(null);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (manual) => {
    if (manual === true) setRefreshing(true);
    try {
      const { data } = await api.get('admin/customers/' + id + '/');
      setC(data);
      setUpdated(new Date());
      setError('');
      if (manual === true) toast.success('Customer data refreshed');
    } catch (err) {
      if (err.response && err.response.status === 404) setError('Customer not found');
    }
    if (manual === true) setRefreshing(false);
  };

  // load now, and again every 30 seconds
  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [id]);

  const toggle = async () => {
    const action = c.is_active ? 'Block' : 'Unblock';
    if (!window.confirm(action + ' ' + c.name + '?')) return;
    try {
      await api.patch('admin/customers/' + id + '/', { is_active: !c.is_active });
      toast.success(c.name + (c.is_active ? ' blocked successfully' : ' unblocked successfully'));
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update customer'));
    }
  };

  if (error) {
    return (
      <>
        <Link to='/admin/customers' className='back'>← Back to customers</Link>
        <p>{error}</p>
      </>
    );
  }
  if (!c) return <p>Loading...</p>;

  const s = c.stats;
  const recent = c.last_login && Date.now() - new Date(c.last_login).getTime() < 24 * 60 * 60 * 1000;

  const cards = [
    { label: 'Total Orders', value: s.total_orders, format: (n) => Math.round(n), sub: s.cancelled + ' cancelled', icon: '📦', to: 'sec-orders' },
    { label: 'Total Spent', value: s.total_spent, format: (n) => money(n), sub: 'cancelled orders not counted', icon: '💰', to: 'sec-orders' },
    { label: 'Average Order', value: s.avg_order, format: (n) => money(n), sub: 'per order', icon: '🧾', to: 'sec-orders' },
    { label: 'Fruits Bought', value: s.total_kg, format: (n) => (Math.round(n * 100) / 100) + ' kg', sub: c.fruits.length + ' different fruits', icon: '🍎', to: 'sec-fruits' },
    { label: 'Reviews Given', value: s.reviews, format: (n) => Math.round(n), sub: s.reviews ? 'average ' + s.avg_rating + ' ★' : 'no reviews yet', icon: '⭐', to: 'sec-reviews' },
  ];

  return (
    <div className='cdetail'>
      <div className='row' style={{ justifyContent: 'space-between' }}>
        <Link to='/admin/customers' className='back'>← Back to customers</Link>
        <div className='row'>
          <span className='muted'>{updated ? 'Updated ' + updated.toLocaleTimeString() : ''}</span>
          <button className='btn-outline sm-btn' onClick={() => load(true)} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      <div className='cust-head'>
        <div className='avatar-lg'>{c.name ? c.name.charAt(0).toUpperCase() : '?'}</div>
        <div style={{ flex: 1 }}>
          <h2>{c.name}</h2>
          <div className='muted'>{c.email} &nbsp;•&nbsp; Customer since {day(c.joined)}</div>
          <div className='chips'>
            {c.is_active
              ? <span className='stk stk-ok'>Active</span>
              : <span className='stk stk-out'>Blocked</span>}
            <span className={recent ? 'stk stk-ok' : 'stk chip-grey'}>
              {c.last_login ? 'Last login: ' + ago(c.last_login) : 'No login recorded yet'}
            </span>
          </div>
        </div>
        <div className='row'>
          <a href={'mailto:' + c.email} className='btn-outline' style={{ margin: 0 }}>✉ Email</a>
          <button className={c.is_active ? 'btn danger' : 'btn'} onClick={toggle}>
            {c.is_active ? 'Block customer' : 'Unblock customer'}
          </button>
        </div>
      </div>

      <div className='stat-grid'>
        {cards.map((k) => (
          <div className='stat click' key={k.label} onClick={() => goTo(k.to)} title='Click to view details'>
            <div className='stat-icon'>{k.icon}</div>
            <div>
              <div className='stat-val'><CountUp value={k.value} format={k.format} /></div>
              <div className='muted'>{k.label}</div>
              <div className='stat-sub'>{k.sub}</div>
            </div>
            <span className='stat-go'>›</span>
          </div>
        ))}
      </div>

      <div className='adm-two'>
        <div className='stack'>
          <div className='panel' id='sec-orders'>
            <h3>Order history ({c.orders.length})</h3>
            {c.orders.length === 0 ? (
              <p className='muted'>This customer has not placed any orders yet.</p>
            ) : (
              <div className='table-wrap'>
                <table className='adm-table'>
                  <thead>
                    <tr><th>Order</th><th>Date</th><th>Fruits</th><th>City</th><th>Total</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {c.orders.map((o) => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>{day(o.created)}</td>
                        <td style={{ maxWidth: 260 }}>{o.items.join(', ')}</td>
                        <td>{o.city}</td>
                        <td>{money(o.total)}</td>
                        <td><StatusBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className='panel' id='sec-fruits'>
            <h3>Fruits purchased</h3>
            {c.fruits.length === 0 ? (
              <p className='muted'>No fruits purchased yet.</p>
            ) : (
              <div className='table-wrap'>
                <table className='adm-table'>
                  <thead>
                    <tr><th>Fruit</th><th>Times ordered</th><th>Total quantity</th><th>Amount spent</th></tr>
                  </thead>
                  <tbody>
                    {c.fruits.map((f) => (
                      <tr key={f.id}>
                        <td>
                          <div className='fruit-cell'>
                            {f.image && <img src={f.image} alt={f.name} className='thumb' />}
                            <b>{f.name}</b>
                          </div>
                        </td>
                        <td>{f.times}</td>
                        <td>{f.kg} kg</td>
                        <td>{money(f.spent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className='panel' id='sec-reviews'>
            <h3>Reviews by this customer ({c.reviews.length})</h3>
            {c.reviews.length === 0 && <p className='muted'>This customer has not written any reviews.</p>}
            {c.reviews.map((r) => (
              <div className='review-item' key={r.id}>
                <b>{r.fruit}</b> &nbsp;<Stars n={r.rating} /> <span className='muted'>{day(r.created)}</span>
                <div>{r.comment}</div>
              </div>
            ))}
          </div>
        </div>

        <div className='stack'>
          <div className='panel'>
            <h3>Contact details</h3>
            <div className='info-row'><span>Name</span><span>{c.name}</span></div>
            <div className='info-row'><span>Email</span><span>{c.email}</span></div>
            <div className='info-row'><span>Phone</span><span>{c.phone || 'Not available'}</span></div>
            <div className='info-row'><span>Joined</span><span>{dateTime(c.joined)}</span></div>
            <div className='info-row'>
              <span>Last login</span>
              <span>
                {c.last_login
                  ? <>{dateTime(c.last_login)}<br /><span className='muted'>{ago(c.last_login)}</span></>
                  : 'No login recorded yet'}
              </span>
            </div>
            <div className='info-row'><span>Account</span><span>{c.is_active ? 'Active' : 'Blocked'}</span></div>
          </div>

          <div className='panel'>
            <h3>Delivery addresses</h3>
            {c.addresses.length === 0 && <p className='muted'>No addresses yet. They appear after the first order.</p>}
            {c.addresses.map((a, n) => (
              <div className='addr-card' key={n}>
                <b>{a.name}</b><br />
                {a.address}<br />
                {a.city} - {a.pincode}<br />
                <span className='muted'>Phone: {a.phone}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}