import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api';

const SHOP_NAME = 'FreshFruits';              // <-- change to your shop name
const SHOP_TAGLINE = 'Fresh fruits delivered to your door';
const money = (n) => 'Rs. ' + Number(n).toFixed(2);

export default function Success() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get('orders/' + orderId + '/').then((r) => setOrder(r.data));
  }, [orderId]);

  const downloadReceipt = () => {
    const doc = new jsPDF();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(46, 125, 50);
    doc.text(SHOP_NAME, 14, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(SHOP_TAGLINE, 14, 27);

    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('RECEIPT', 196, 20, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Receipt No: #' + order.id, 196, 27, { align: 'right' });
    doc.text('Date: ' + new Date(order.created).toLocaleString(), 196, 33, { align: 'right' });
    doc.text('Payment: ' + order.status, 196, 39, { align: 'right' });

    doc.setDrawColor(200);
    doc.line(14, 44, 196, 44);

    // Delivery details
    doc.setFont('helvetica', 'bold');
    doc.text('Delivered to', 14, 52);
    doc.setFont('helvetica', 'normal');
    const lines = [
      order.full_name,
      'Phone: ' + order.phone,
      ...doc.splitTextToSize(order.address, 120),
      order.city + ' - ' + order.pincode,
    ];
    doc.text(lines, 14, 58);
    const tableStart = 58 + lines.length * 5 + 6;

    // Items table
    autoTable(doc, {
      startY: tableStart,
      head: [['#', 'Fruit', 'Quantity', 'MRP / kg', 'Price / kg', 'Discount', 'Amount']],
      body: order.items.map((it, n) => [
        n + 1,
        it.name,
        it.quantity_kg + ' kg',
        money(it.mrp_per_kg),
        money(it.price_per_kg),
        money((it.mrp_per_kg - it.price_per_kg) * it.quantity_kg),
        money(it.amount),
      ]),
      headStyles: { fillColor: [46, 125, 50] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 10 },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
      },
    });

    // Totals
    let y = doc.lastAutoTable.finalY + 10;
    if (y > 250) { doc.addPage(); y = 20; }

    doc.setFontSize(11);
    doc.text('Total MRP', 130, y);
    doc.text(money(order.subtotal), 196, y, { align: 'right' });
    y += 7;
    doc.setTextColor(46, 125, 50);
    doc.text('Total Discount', 130, y);
    doc.text('- ' + money(order.total_discount), 196, y, { align: 'right' });
    y += 4;
    doc.setTextColor(0);
    doc.line(130, y, 196, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Grand Total', 130, y);
    doc.text(money(order.total), 196, y, { align: 'right' });

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Thank you for shopping with ' + SHOP_NAME + '!', 105, y + 20, { align: 'center' });

    doc.save('Receipt-' + SHOP_NAME + '-' + order.id + '.pdf');
  };

  if (!order) return <p className='page'>Loading...</p>;

  return (
    <div className='page' style={{ maxWidth: 760 }}>
      <div className='box' style={{ maxWidth: 'none', margin: '30px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>✅</h1>
          <h2>Order placed successfully!</h2>
          <p className='muted'>Order #{order.id}. Your fruits will be delivered soon.</p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#e8f5e9', textAlign: 'left' }}>
              <th style={{ padding: 8 }}>Fruit</th>
              <th>Qty</th>
              <th>Price / kg</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, n) => (
              <tr key={n} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{it.name}</td>
                <td>{it.quantity_kg} kg</td>
                <td>{money(it.price_per_kg)}</td>
                <td style={{ textAlign: 'right' }}>{money(it.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ textAlign: 'right' }}>
          <p>Total MRP: {money(order.subtotal)}</p>
          <p style={{ color: '#2e7d32' }}>Total Discount: - {money(order.total_discount)}</p>
          <h3>Grand Total: {money(order.total)}</h3>
        </div>

        <div className='row' style={{ justifyContent: 'center' }}>
          <button className='btn' onClick={downloadReceipt}>⬇ Download Receipt</button>
          <Link to='/home' className='btn-outline'>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}