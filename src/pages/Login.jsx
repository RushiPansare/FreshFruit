import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import PasswordInput from '../components/PasswordInput';
import { emailError, passwordMessage } from '../utils/validators';

const STORE_KEY = 'loginLockUntil';
const formatTime = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [lockUntil, setLockUntil] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const { login } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const emailErr = emailError(email);
  const pwErr = passwordMessage(password);

  useEffect(() => {
    const saved = Number(localStorage.getItem(STORE_KEY));
    if (saved && saved > Date.now()) setLockUntil(saved);
    else localStorage.removeItem(STORE_KEY);
  }, []);

  useEffect(() => {
    if (!lockUntil) return;
    const tick = () => {
      const left = Math.ceil((lockUntil - Date.now()) / 1000);
      if (left <= 0) {
        setLockUntil(null);
        setSecondsLeft(0);
        localStorage.removeItem(STORE_KEY);
        setError('');
        setInfo('You can login now.');
      } else {
        setSecondsLeft(left);
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [lockUntil]);

  const locked = lockUntil !== null;

  const startLock = (seconds) => {
    const until = Date.now() + seconds * 1000;
    localStorage.setItem(STORE_KEY, String(until));
    setLockUntil(until);
    setInfo('');
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (locked) return;
    setError('');
    setInfo('');
    setTouched({ email: true, password: true });
    if (emailErr || !password || pwErr) return;
    try {
      const { data } = await api.post('auth/login/', { username: email.trim().toLowerCase(), password });
      localStorage.removeItem(STORE_KEY);
      login(data.access);
      toast.success('Login successful');
      navigate(data.is_admin ? '/admin' : '/home');
    } catch (err) {
      const res = err.response;
      if (res && res.status === 429) {
        startLock(res.data.retry_after || 60);
      } else if (res && res.status === 401) {
        const left = res.data.attempts_left;
        setError('Invalid email or password. ' + left + (left === 1 ? ' attempt' : ' attempts') + ' left.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <form className='auth-box' onSubmit={submit} noValidate>
      <h2>Login</h2>

      {locked && (
        <div className='lock-box'>
          <p>You reached the limit of 3 wrong attempts. Try again after 1 minute.</p>
          <p className='timer'>Try again in {formatTime(secondsLeft)}</p>
        </div>
      )}
      {!locked && error && <p className='error'>{error}</p>}
      {!locked && info && <p className='success'>{info}</p>}

      <input type='email' placeholder='Email' value={email}
        onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
        onBlur={() => setTouched({ ...touched, email: true })}
        className={touched.email && emailErr ? 'invalid' : ''} maxLength={254} />
      {touched.email && emailErr && <p className='field-error'>{emailErr}</p>}

      <PasswordInput placeholder='Password' value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => setTouched({ ...touched, password: true })}
        className={password && pwErr ? 'invalid' : ''} maxLength={64} />
      {password && pwErr && <p className='field-error'>{pwErr}</p>}
      {touched.password && !password && <p className='field-error'>Password is required</p>}

      <Link to='/forgot-password' className='forgot'>Forgot password?</Link>
      <button className='btn' disabled={locked} style={locked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
        {locked ? 'Login locked' : 'Login'}
      </button>
      <p className='muted'>New here? <Link to='/register'>Create account</Link></p>
    </form>
  );
}