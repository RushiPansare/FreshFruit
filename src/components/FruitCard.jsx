import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Stars = ({ n }) => (
  <span className='stars'>{'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}</span>
);

export default function FruitCard({ fruit, onAdd, onChanged }) {
  const [qty, setQty] = useState(1);
  const [showReviews, setShowReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const price = Number(fruit.price_per_kg);
  const final = Number(fruit.final_price);

  const submitReview = async () => {
    try {
      await api.post('fruits/' + fruit.id + '/review/', { rating, comment });
      setComment('');
      onChanged();
    } catch (e) {
            alert((e.response && e.response.data && e.response.data.error) || 'Could not save review');
    }
  };

  return (
    <div className='card'>
      {fruit.discount_percent > 0 && <span className='discount'>{fruit.discount_percent}% OFF</span>}

      <Link to={'/fruit/' + fruit.id}>
        <img src={fruit.image} alt={fruit.name} className='clickable' />
      </Link>

      <div className='card-body'>
        <Link to={'/fruit/' + fruit.id} className='card-title'>
          <h3>{fruit.name}</h3>
        </Link>
        <div>
          <Stars n={fruit.avg_rating} /> <span className='muted'>({fruit.review_count} reviews)</span>
        </div>
        <p className='muted'>{fruit.description}</p>

        <div className='price'>
          <strong>₹{final}</strong> / kg
          {fruit.discount_percent > 0 && <s className='muted'> ₹{price}</s>}
        </div>

        <div className='row'>
          <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
            {[0.5, 1, 1.5, 2, 3, 5].map((k) => <option key={k} value={k}>{k} kg</option>)}
          </select>
                   {Number(fruit.stock_kg) > 0
            ? <button className='btn' onClick={() => onAdd(fruit, qty)}>Add to Cart</button>
            : <span className='out'>Out of stock</span>}
        </div>

        <Link to={'/fruit/' + fruit.id} className='link'>View details →</Link>
        <br />
        <button className='link' onClick={() => setShowReviews(!showReviews)}>
          {showReviews ? 'Hide reviews' : 'See / write reviews'}
        </button>

        {showReviews && (
          <div className='reviews'>
            {fruit.reviews.length === 0 && <p className='muted'>No reviews yet.</p>}
            {fruit.reviews.map((r) => (
              <p key={r.id}><Stars n={r.rating} /> <b>{r.user_name}</b>: {r.comment}</p>
            ))}
            <div className='row'>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
              <input placeholder='Write a review' value={comment} onChange={(e) => setComment(e.target.value)} />
              <button className='btn' onClick={submitReview}>Post</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}