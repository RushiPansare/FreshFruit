import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useToast } from '../context/ToastContext';
import PasswordInput from '../components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';
import { nameError, emailError, passwordMessage, cleanName } from '../utils/validators';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const errors = {
    name: nameError(form.name, 'Full name'),
    email: emailError(form.email),
    password: passwordMessage(form.password),
  };
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
    setTouched({ name: true, email: true, password: true });
    if (errors.name || errors.email || errors.password) return;
    try {
      await api.post('auth/register/', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      toast.success('Account created successfully. Please login.');
      navigate('/login');
    } catch (err) {
      setError(errorMessage(err, 'Registration failed'));
    }
  };

  return (
    <form className='auth-box' onSubmit={submit} noValidate>
      <h2>Create account</h2>
      {error && <p className='error'>{error}</p>}

      <input name='name' placeholder='Full name' value={form.name} onChange={change} onBlur={blur}
        className={show('name') ? 'invalid' : ''} maxLength={50} />
      {show('name') && <p className='field-error'>{errors.name}</p>}

      <input name='email' type='email' placeholder='Email' value={form.email} onChange={change} onBlur={blur}
        className={show('email') ? 'invalid' : ''} maxLength={254} />
      {show('email') && <p className='field-error'>{errors.email}</p>}

      <PasswordInput name='password' placeholder='Password' value={form.password} onChange={change} onBlur={blur}
        className={form.password && errors.password ? 'invalid' : ''} maxLength={64} />
      <PasswordStrength password={form.password} />
      {touched.password && !form.password && <p className='field-error'>Password is required</p>}

      <button className='btn'>Register</button>
      <p className='muted'>Already have an account? <Link to='/login'>Login</Link></p>
    </form>
  );
}