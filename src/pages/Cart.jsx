import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function Cart() {
  const [items, setItems] = useState([]);
  const { refreshCart } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const load = async () => {
    const { data } = await api.get('cart/');
    setItems(data);
    refreshCart();
  };

  useEffect(() => { load(); }, []);

  const changeQty = async (id, q) => {
    if (q < 0.5) return;
    try {
      await api.patch('cart/' + id + '/', { quantity_kg: q });
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update quantity'));
    }
  };

  const remove = async (id, name) => {
    try {
      await api.delete('cart/' + id + '/');
      toast.success(name + ' removed from cart successfully');
      load();
    } catch (err) {
      toast.error('Could not remove item');
    }
  };

  const total = items.reduce((s, i) => s + Number(i.fruit.final_price) * Number(i.quantity_kg), 0);

  return (
    <div className='page'>
      <h2>Your Cart</h2>
      {items.length === 0 && <p className='muted'>Your cart is empty.</p>}
      {items.map((i) => (
        <div className='cart-row' key={i.id}>
          <img src={i.fruit.image} alt={i.fruit.name} />
          <div className='grow'>
            <b>{i.fruit.name}</b>
            <p className='muted'>₹{i.fruit.final_price} / kg</p>
          </div>
          <div className='row'>
            <button onClick={() => changeQty(i.id, Number(i.quantity_kg) - 0.5)}>-</button>
            <span>{Number(i.quantity_kg)} kg</span>
            <button onClick={() => changeQty(i.id, Number(i.quantity_kg) + 0.5)}>+</button>
          </div>
          <b>₹{(Number(i.fruit.final_price) * Number(i.quantity_kg)).toFixed(2)}</b>
          <button className='link' onClick={() => remove(i.id, i.fruit.name)}>Remove</button>
        </div>
      ))}
      {items.length > 0 && (
        <div className='total'>
          <h3>Total: ₹{total.toFixed(2)}</h3>
          <button className='btn' onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
        </div>
      )}
    </div>
  );
}