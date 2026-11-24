import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { nameError, emailError, cleanName } from '../utils/validators';

export default function EditProfile() {
  const { user, setUser } = useApp();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email });
  }, [user]);

  const errors = { name: nameError(form.name, 'Full name'), email: emailError(form.email) };
  const show = (f) => touched[f] && errors[f];

  const change = (e) => {
    let v = e.target.value;
    if (e.target.name === 'name') v = cleanName(v);
    if (e.target.name === 'email') v = v.replace(/\s/g, '');
    setForm({ ...form, [e.target.name]: v });
  };
  const blur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ name: true, email: true });
    if (errors.name || errors.email) return;
    try {
      const { data } = await api.patch('auth/profile/', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      });
      setUser(data);
      toast.success('Profile updated successfully');
    } catch (err) {
      setError(errorMessage(err, 'Could not update details'));
    }
  };

  if (!user) return <p className='page'>Loading...</p>;

  return (
    <form className='auth-box' onSubmit={submit} noValidate>
      <h2>Edit details</h2>
      {error && <p className='error'>{error}</p>}

      <label className='muted'>Full name</label>
      <input name='name' value={form.name} onChange={change} onBlur={blur}
        className={show('name') ? 'invalid' : ''} maxLength={50} />
      {show('name') && <p className='field-error'>{errors.name}</p>}

      <label className='muted'>Email</label>
      <input name='email' type='email' value={form.email} onChange={change} onBlur={blur}
        className={show('email') ? 'invalid' : ''} maxLength={254} />
      {show('email') && <p className='field-error'>{errors.email}</p>}

      <p className='muted'>If you change your email, use the new email the next time you login.</p>
      <button className='btn'>Save Changes</button>
      <p className='muted'><Link to='/profile'>← Back to profile</Link></p>
    </form>
  );
}