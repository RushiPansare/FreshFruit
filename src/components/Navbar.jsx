import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { token, user, cartCount, logout } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState(false);   // profile dropdown
  const [menu, setMenu] = useState(false);   // mobile menu
  const navigate = useNavigate();

  // To add another tab later (for example FAQ), add one line here
  const links = [
    { to: token ? '/home' : '/', label: 'Home' },
    { to: '/page/about-us', label: 'About Us' },
    { to: '/page/contact-us', label: 'Contact Us' },
  ];

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header className='navbar'>
      <div className='nav-left'>
        <Link to={token ? '/home' : '/'} className='logo'>🍎 FreshFruits</Link>
        <div className={menu ? 'nav-links open' : 'nav-links'}>
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              end
              onClick={() => setMenu(false)}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className='nav-right'>
        {!token ? (
          <>
            <Link to='/login' className='btn-outline' style={{ margin: 0 }}>Login</Link>
            <Link to='/register' className='btn'>Register</Link>
          </>
        ) : (
          <>
            {user && user.is_admin ? (
              <Link to='/admin' className='btn'>⚙ Admin Panel</Link>
            ) : (
              <button className='btn cart-btn' onClick={() => navigate('/cart')}>
                🛒 Add to Cart {cartCount > 0 && <span className='badge'>{cartCount}</span>}
              </button>
            )}
            <div className='profile'>
              <button className='avatar' onClick={() => setOpen(!open)}>👤</button>
              {open && (
                <div className='dropdown'>
                  <p className='muted' style={{ margin: 0 }}><b>{user ? user.name : ''}</b></p>
                  <hr style={{ width: '100%', border: 0, borderTop: '1px solid #eee' }} />
                  {user && user.is_admin && <Link to='/admin' onClick={() => setOpen(false)}>Admin Panel</Link>}
                  <Link to='/profile' onClick={() => setOpen(false)}>My Profile</Link>
                  <Link to='/edit-profile' onClick={() => setOpen(false)}>Edit Details</Link>
                  <Link to='/change-password' onClick={() => setOpen(false)}>Change Password</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </>
        )}
        <button className='burger' onClick={() => setMenu(!menu)}>{menu ? '✕' : '☰'}</button>
      </div>
    </header>
  );
}