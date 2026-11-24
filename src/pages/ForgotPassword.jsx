import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useToast } from '../context/ToastContext';
import PasswordInput from '../components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';
import { emailError, passwordMessage } from '../utils/validators';

export default function ForgotPassword() {
  const [form, setForm] = useState({ email: '', new_password: '', confirm_password: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const toast = useToast();

  const errors = {
    email: emailError(form.email),
    new_password: passwordMessage(form.new_password),
    confirm_password: form.confirm_password !== form.new_password ? 'New password and confirm password do not match' : '',
  };
  const show = (f) => touched[f] && errors[f];

  const change = (e) => {
    const v = e.target.name === 'email' ? e.target.value.replace(/\s/g, '') : e.target.value;
    setForm({ ...form, [e.target.name]: v });
  };
  const blur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, new_password: true, confirm_password: true });
    if (errors.email || errors.new_password || errors.confirm_password) return;
    try {
      await api.post('auth/forgot-password/', {
        email: form.email.trim().toLowerCase(),
        new_password: form.new_password,
        confirm_password: form.confirm_password,
      });
      toast.success('Password updated successfully');
      setDone(true);
    } catch (err) {
      setError(errorMessage(err, 'Could not update password'));
    }
  };

  if (done) {
    return (
      <div className='auth-box' style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>✅</h1>
        <h2>Password updated successfully</h2>
        <p className='muted'>You can now log in with your new password.</p>
        <Link to='/login' className='btn'>Go to Login</Link>
      </div>
    );
  }

  return (
    <form className='auth-box' onSubmit={submit} noValidate>
      <h2>Forgot password</h2>
      <p className='muted'>Enter your registered email and choose a new password.</p>
      {error && <p className='error'>{error}</p>}

      <input name='email' type='email' placeholder='Registered email' value={form.email} onChange={change} onBlur={blur}
        className={show('email') ? 'invalid' : ''} maxLength={254} />
      {show('email') && <p className='field-error'>{errors.email}</p>}

      <PasswordInput name='new_password' placeholder='New password' value={form.new_password} onChange={change} onBlur={blur}
        className={form.new_password && errors.new_password ? 'invalid' : ''} maxLength={64} />
      <PasswordStrength password={form.new_password} />
      {touched.new_password && !form.new_password && <p className='field-error'>New password is required</p>}

      <PasswordInput name='confirm_password' placeholder='Confirm new password' value={form.confirm_password} onChange={change} onBlur={blur}
        className={show('confirm_password') ? 'invalid' : ''} maxLength={64} />
      {show('confirm_password') && <p className='field-error'>{errors.confirm_password}</p>}

      <button className='btn'>Update Password</button>
      <p className='muted'><Link to='/login'>← Back to login</Link></p>
    </form>
  );
}