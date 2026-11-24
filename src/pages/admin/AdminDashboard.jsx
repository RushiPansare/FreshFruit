import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';

const money = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmt = (n) => (n >= 1000 ? '₹' + (n / 1000).toFixed(1).replace('.0', '') + 'k' : '₹' + Math.round(n));
const ranges = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '1 year', value: 365 },
];

export default function AdminDashboard() {
  const [d, setD] = useState(null);
  const [days, setDays] = useState(30);
  const [series, setSeries] = useState([]);
  const [tip, setTip] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get('admin/dashboard/').then((r) => setD(r.data));
  }, []);

  useEffect(() => {
    api.get('admin/revenue/', { params: { days } }).then((r) => setSeries(r.data));
  }, [days]);

  // open the chart at the latest day (scroll left to see past days)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [series, d]);

  if (!d) return <p>Loading...</p>;

  const top = Math.max(...series.map((x) => x.revenue), 0) || 100;
  const total = series.reduce((s, x) => s + x.revenue, 0);
  const orderCount = series.reduce((s, x) => s + x.orders, 0);
  const avg = series.length ? total / series.length : 0;
  const best = series.reduce((b, x) => (x.revenue > b.revenue ? x : b), { revenue: 0, full_date: '-' });

  const showTip = (e, day) => {
    const bar = e.currentTarget.firstChild.getBoundingClientRect();
    setTip({ x: bar.left + bar.width / 2, y: bar.top, day });
  };

  const cards = [
    { label: 'Total Revenue', value: money(d.revenue), icon: '💰', to: '/admin/orders' },
    { label: 'Total Orders', value: d.orders, icon: '📦', to: '/admin/orders' },
    { label: 'Orders To Deliver', value: d.pending_orders, icon: '🚚', to: '/admin/orders' },
    { label: 'Customers', value: d.customers, icon: '👥', to: '/admin/customers' },
    { label: 'Products', value: d.products, icon: '🍎', to: '/admin/products' },
    { label: 'Low Stock Items', value: d.low_stock_count, icon: '⚠️', to: '/admin/products' },
  ];

  return (
    <>
      <h2>Dashboard</h2>

      <div className='stat-grid'>
        {cards.map((c) => (
          <Link to={c.to} className='stat' key={c.label}>
            <div className='stat-icon'>{c.icon}</div>
            <div>
              <div className='stat-val'>{c.value}</div>
              <div className='muted'>{c.label}</div>
            </div>
            <span className='stat-go'>›</span>
          </Link>
        ))}
      </div>

      <div className='panel'>
        <div className='rev-head'>
          <h3>Revenue overview</h3>
          <div className='range'>
            {ranges.map((r) => (
              <button key={r.value} className={r.value === days ? 'active' : ''} onClick={() => setDays(r.value)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className='rev-sum'>
          <div>Total revenue<b>{money(total)}</b></div>
          <div>Orders<b>{orderCount}</b></div>
          <div>Daily average<b>{money(avg)}</b></div>
          <div>Best day<b>{money(best.revenue)}</b>{best.revenue > 0 && best.full_date}</div>
        </div>

        <div className='chart-wrap'>
          <div className='y-axis'>
            {[1, 0.75, 0.5, 0.25, 0].map((f) => <span key={f}>{fmt(top * f)}</span>)}
          </div>
          <div className='chart-scroll' ref={scrollRef} onScroll={() => setTip(null)}>
            <div className='chart-inner' style={{ minWidth: series.length * 46 }}>
              {series.map((x, idx) => (
                <div className='bcol' key={x.full_date}>
                  <div className='bcol-area' onMouseEnter={(e) => showTip(e, x)} onMouseLeave={() => setTip(null)}>
                    <div
                      className={'bcol-bar' + (idx === series.length - 1 ? ' today' : '') + (x.revenue === 0 ? ' zero' : '')}
                      style={{ height: Math.max((x.revenue / top) * 100, 2) + '%' }}
                    />
                  </div>
                  <span className='bcol-lbl'>{x.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className='muted' style={{ margin: '8px 0 0' }}>Hover on a bar to see the revenue. Scroll left to see past days.</p>
      </div>

      {tip && (
        <div className='chart-tip' style={{ left: tip.x, top: tip.y }}>
          <b>{tip.day.full_date}</b>
          <div>Revenue: {money(tip.day.revenue)}</div>
          <div>Orders: {tip.day.orders}</div>
        </div>
      )}

      <div className='adm-two'>
        <div className='panel'>
          <h3>Recent orders</h3>
          <div className='table-wrap'>
            <table className='adm-table'>
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {d.recent_orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                                                         <td>
                      {o.user_id
                        ? <Link to={'/admin/customers/' + o.user_id} className='cust-link'>{o.customer}</Link>
                        : <>{o.customer} <span className='stk stk-out'>Deleted</span></>}
                    </td>                    <td>{o.items_count}</td>
                    <td>{money(o.total)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td>{new Date(o.created).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {d.recent_orders.length === 0 && <p className='muted'>No orders yet.</p>}
          <Link to='/admin/orders' className='link'>View all orders →</Link>
        </div>

        <div className='panel'>
          <h3>Low stock alert</h3>
          {d.low_stock.length === 0 && <p className='muted'>All products are well stocked.</p>}
          {d.low_stock.map((f) => (
            <div className='low-row' key={f.id}>
              <span>{f.name}</span>
              <span className={f.stock_kg <= 0 ? 'stk stk-out' : 'stk stk-low'}>
                {f.stock_kg <= 0 ? 'Out of stock' : f.stock_kg + ' kg left'}
              </span>
            </div>
          ))}
          <Link to='/admin/products' className='link'>Manage products →</Link>
        </div>
      </div>
    </>
  );
}