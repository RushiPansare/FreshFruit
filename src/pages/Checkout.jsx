import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  nameError, phoneError, addressError, cityError, pincodeError,
  cleanName, cleanCity, digitsOnly,
} from '../utils/validators';

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', city: '', pincode: '' });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const { refreshCart } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('cart/').then((r) => setItems(r.data));
  }, []);

  const errors = {
    full_name: nameError(form.full_name, 'Full name'),
    phone: phoneError(form.phone),
    address: addressError(form.address),
    city: cityError(form.city),
    pincode: pincodeError(form.pincode),
  };

  const change = (e) => {
    const { name } = e.target;
    let v = e.target.value;
    if (name === 'full_name') v = cleanName(v);
    if (name === 'city') v = cleanCity(v);
    if (name === 'phone') v = digitsOnly(v, 10);
    if (name === 'pincode') v = digitsOnly(v, 6);
    if (name === 'address') v = v.slice(0, 250);
    setForm({ ...form, [name]: v });
  };
  const blur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const field = (name, placeholder, extra = {}) => (
    <>
      <input name={name} placeholder={placeholder} value={form[name]} onChange={change} onBlur={blur}
        className={touched[name] && errors[name] ? 'invalid' : ''} {...extra} />
      {touched[name] && errors[name] && <p className='field-error'>{errors[name]}</p>}
    </>
  );

  const total = items.reduce((s, i) => s + Number(i.fruit.final_price) * Number(i.quantity_kg), 0);

  const pay = async (e) => {
    e.preventDefault();
    setTouched({ full_name: true, phone: true, address: true, city: true, pincode: true });
    if (Object.values(errors).some(Boolean)) {
      toast.error('Please correct the highlighted fields');
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const payload = {
        ...form,
        full_name: form.full_name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
      };
      const { data } = await api.post('orders/create/', payload);
      await refreshCart();
      toast.success('Order placed successfully');
      navigate('/success/' + data.order_id);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not place the order'));
      setLoading(false);
    }
  };

  return (
    <div className='page two-col'>
      <form className='box' onSubmit={pay} noValidate>
        <h2>Delivery details</h2>
        {field('full_name', 'Full name', { maxLength: 50 })}
        {field('phone', 'Mobile number (10 digits)', { maxLength: 10, inputMode: 'numeric' })}

        <textarea name='address' placeholder='Full address (house no, street, area)' value={form.address}
          onChange={change} onBlur={blur} maxLength={250}
          className={touched.address && errors.address ? 'invalid' : ''} />
        {touched.address && errors.address && <p className='field-error'>{errors.address}</p>}

        {field('city', 'City', { maxLength: 60 })}
        {field('pincode', 'Pincode (6 digits)', { maxLength: 6, inputMode: 'numeric' })}

        <button className='btn' disabled={loading}>
          {loading ? 'Processing payment...' : 'Pay ₹' + total.toFixed(2)}
        </button>
      </form>

      <div className='box'>
        <h2>Order summary</h2>
        {items.map((i) => (
          <p key={i.id}>{i.fruit.name} x {Number(i.quantity_kg)} kg
            <b style={{ float: 'right' }}>₹{(Number(i.fruit.final_price) * Number(i.quantity_kg)).toFixed(2)}</b>
          </p>
        ))}
        <hr />
        <h3>Total: ₹{total.toFixed(2)}</h3>
      </div>
    </div>
  );
}