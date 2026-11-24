import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import PasswordInput from '../components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';
import { passwordMessage } from '../utils/validators';

export default function ChangePassword() {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const { logout } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const errors = {
    old_password: form.old_password ? '' : 'Enter your existing password',
    new_password: passwordMessage(form.new_password)
      || (form.new_password && form.new_password === form.old_password
        ? 'New password must be different from the existing password' : ''),
    confirm_password: form.confirm_password !== form.new_password ? 'New password and confirm password do not match' : '',
  };
  const show = (f) => touched[f] && errors[f];

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const blur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ old_password: true, new_password: true, confirm_password: true });
    if (errors.old_password || errors.new_password || errors.confirm_password) return;
    try {
      await api.post('auth/change-password/', form);
      toast.success('Password updated successfully');
      setDone(true);
    } catch (err) {
      setError(errorMessage(err, 'Could not change password'));
    }
  };

  const loginAgain = () => {
    logout();
    navigate('/login');
  };

  if (done) {
    return (
      <div className='auth-box' style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>✅</h1>
        <h2>Password changed successfully</h2>
        <p className='muted'>Please login again with your new password.</p>
        <button className='btn' onClick={loginAgain}>Login Again</button>
      </div>
    );
  }

  return (
    <form className='auth-box' onSubmit={submit} noValidate>
      <h2>Change password</h2>
      {error && <p className='error'>{error}</p>}

      <PasswordInput name='old_password' placeholder='Existing password' value={form.old_password} onChange={change} onBlur={blur}
        className={show('old_password') ? 'invalid' : ''} maxLength={64} />
      {show('old_password') && <p className='field-error'>{errors.old_password}</p>}

      <PasswordInput name='new_password' placeholder='New password' value={form.new_password} onChange={change} onBlur={blur}
        className={form.new_password && errors.new_password ? 'invalid' : ''} maxLength={64} />
      <PasswordStrength password={form.new_password} />
      {form.new_password && !passwordMessage(form.new_password) && errors.new_password && (
        <p className='field-error'>{errors.new_password}</p>
      )}
      {touched.new_password && !form.new_password && <p className='field-error'>New password is required</p>}

      <PasswordInput name='confirm_password' placeholder='Confirm new password' value={form.confirm_password} onChange={change} onBlur={blur}
        className={show('confirm_password') ? 'invalid' : ''} maxLength={64} />
      {show('confirm_password') && <p className='field-error'>{errors.confirm_password}</p>}

      <button className='btn'>Change Password</button>
      <p className='muted'><Link to='/profile'>← Back to profile</Link></p>
    </form>
  );
}