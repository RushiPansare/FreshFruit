import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const Stars = ({ n }) => (
  <span className='stars'>{'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}</span>
);

export default function FruitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = useApp();
    const toast = useToast();

  const [fruit, setFruit] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('fruits/' + id + '/');
      setFruit(data);
    } catch (e) {
      setError('Fruit not found');
    }
  };

  useEffect(() => {
    load();
    setQty(1);
    setAdded(false);
    setMsg('');
  }, [id]);

  if (error) return <p className='page'>{error}</p>;
  if (!fruit) return <p className='page'>Loading...</p>;

  const price = Number(fruit.price_per_kg);
  const final = Number(fruit.final_price);
  const stock = Number(fruit.stock_kg);
  const maxQty = Math.min(stock, 20);
  const total = final * qty;
  const saved = (price - final) * qty;

  const decrease = () => setQty(Math.max(0.5, qty - 0.5));
  const increase = () => setQty(Math.min(maxQty, qty + 0.5));

  const addToCart = async () => {
    try {
      await api.post('cart/', { fruit_id: fruit.id, quantity_kg: qty });
      await refreshCart();
      setAdded(true);
      setMsg(qty + ' kg ' + fruit.name + ' added to your cart');
      toast.success(fruit.name + ' added to cart successfully');
    } catch (e) {
            toast.error(errorMessage(e, 'Could not add to cart'));
    }
  };

  const submitReview = async () => {
    try {
      await api.post('fruits/' + fruit.id + '/review/', { rating, comment });
      setComment('');
      load();
    } catch (e) {
           toast.error(errorMessage(e, 'Could not save review'));
    }
  };

  return (
    <div className='page'>
      <Link to='/home' className='back'>← Back to all fruits</Link>

      <div className='detail'>
        <div className='detail-img'>
          {fruit.discount_percent > 0 && <span className='discount'>{fruit.discount_percent}% OFF</span>}
          <img src={fruit.image} alt={fruit.name} />
        </div>

        <div className='detail-info'>
          <h1 style={{ marginTop: 0 }}>{fruit.name}</h1>
          <div>
            <Stars n={fruit.avg_rating} /> <span className='muted'>{fruit.avg_rating} ({fruit.review_count} reviews)</span>
          </div>

          <div className='price' style={{ fontSize: 28, margin: '14px 0' }}>
            <strong>₹{final}</strong> <span style={{ fontSize: 16 }}>/ kg</span>
            {fruit.discount_percent > 0 && <s className='muted' style={{ marginLeft: 10 }}>₹{price}</s>}
          </div>
          {fruit.discount_percent > 0 && (
            <p style={{ color: '#2e7d32' }}>You save ₹{(price - final).toFixed(2)} per kg</p>
          )}

          <h3>About this fruit</h3>
          <p className='muted' style={{ fontSize: 16, lineHeight: 1.6 }}>{fruit.description}</p>
          <p>
            Availability:{' '}
            {stock > 0
              ? <b style={{ color: '#2e7d32' }}>In stock ({stock} kg)</b>
              : <b style={{ color: '#c62828' }}>Out of stock</b>}
          </p>

          {stock > 0 && (
            <>
              <p style={{ marginBottom: 6 }}>Quantity</p>
              <div className='qty-box'>
                <button onClick={decrease}>−</button>
                <span>{qty} kg</span>
                <button onClick={increase}>+</button>
              </div>

              <div className='detail-total'>
                <div>Total: <b style={{ fontSize: 22 }}>₹{total.toFixed(2)}</b></div>
                {saved > 0 && <div style={{ color: '#2e7d32' }}>You save ₹{saved.toFixed(2)}</div>}
              </div>

              <button className='btn' style={{ width: '100%', padding: 12, fontSize: 17 }} onClick={addToCart}>
                🛒 Add to Cart
              </button>

              {added && (
                <div className='added-box'>
                  <p style={{ margin: '0 0 10px' }}>✅ {msg}</p>
                  <div className='row'>
                    <button className='btn' onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
                    <button className='btn-outline' style={{ margin: 0 }} onClick={() => navigate('/cart')}>View Cart</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className='detail' style={{ marginTop: 24, display: 'block' }}>
        <h2 style={{ marginTop: 0 }}>Customer Reviews</h2>
        {fruit.reviews.length === 0 && <p className='muted'>No reviews yet. Be the first to review!</p>}
        {fruit.reviews.map((r) => (
          <div key={r.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
            <Stars n={r.rating} /> <b>{r.user_name}</b>
            <p style={{ margin: '4px 0' }}>{r.comment}</p>
          </div>
        ))}

        <h3>Write a review</h3>
        <div className='row'>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
          </select>
          <input style={{ flex: 1 }} placeholder='Share your experience' value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className='btn' onClick={submitReview}>Post</button>
        </div>
      </div>
    </div>
  );
}