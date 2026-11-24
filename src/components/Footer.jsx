import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { token } = useApp();

  return (
    <footer className='footer'>
      <div className='footer-grid'>
        <div>
          <h3>🍎 FreshFruits</h3>
          <p>Fresh, juicy fruits delivered from the farm to your door at the best prices.</p>
          <p>Facebook &nbsp;•&nbsp; Instagram &nbsp;•&nbsp; Twitter &nbsp;•&nbsp; YouTube</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <Link to={token ? '/home' : '/'}>Home</Link>
          <Link to='/page/about-us'>About Us</Link>
          <Link to='/page/contact-us'>Contact Us</Link>
          <Link to='/page/faq'>FAQ</Link>
        </div>

        <div>
          <h4>My Account</h4>
          {token ? (
            <>
              <Link to='/profile'>My Profile</Link>
              <Link to='/edit-profile'>Edit Details</Link>
              <Link to='/change-password'>Change Password</Link>
              <Link to='/cart'>My Cart</Link>
            </>
          ) : (
            <>
              <Link to='/login'>Login</Link>
              <Link to='/register'>Register</Link>
              <Link to='/forgot-password'>Forgot Password</Link>
            </>
          )}
        </div>

        <div>
          <h4>Help & Policies</h4>
          <Link to='/page/shipping-delivery'>Shipping & Delivery</Link>
          <Link to='/page/returns-refunds'>Returns & Refunds</Link>
          <Link to='/page/privacy-policy'>Privacy Policy</Link>
          <Link to='/page/terms'>Terms & Conditions</Link>
        </div>

        <div>
          <h4>Contact</h4>
          <p>📍 Pune, Maharashtra, India</p>
          <p>📞 +91 7498554659</p>
          <p>✉ rushispansare@gmail.com</p>
          <p>🕘 Mon to Sat, 9 AM to 7 PM</p>
        </div>
      </div>
      <div className='footer-bottom'>
        © {new Date().getFullYear()} FreshFruits. All rights reserved.
      </div>
    </footer>
  );
}