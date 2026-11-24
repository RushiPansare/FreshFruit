import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useApp } from '../context/AppContext';

const slides = ['/slides/1.jpg', '/slides/2.jpg', '/slides/3.jpg'];

const features = [
  { icon: '🚚', title: 'Fast Delivery', text: 'Fresh fruits at your door in 1 to 2 days' },
  { icon: '🌿', title: 'Farm Fresh', text: 'Hand-picked and quality checked daily' },
  { icon: '💰', title: 'Best Prices', text: 'Honest per kg rates with daily discounts' },
  { icon: '🔒', title: 'Secure Checkout', text: 'Your details are always safe with us' },
];

const categories = [
  { icon: '🍎', name: 'Apples' },
  { icon: '🍊', name: 'Citrus' },
  { icon: '🍌', name: 'Tropical' },
  { icon: '🍇', name: 'Grapes & Berries' },
  { icon: '🥭', name: 'Seasonal' },
];

const steps = [
  { n: 1, title: 'Choose your fruits', text: 'Browse fresh fruits with photos, prices per kg and reviews.' },
  { n: 2, title: 'Add to cart', text: 'Pick the quantity you need in kg and check out in a minute.' },
  { n: 3, title: 'Get it delivered', text: 'We pack it fresh and deliver it to your doorstep.' },
];

const reviews = [
  { name: 'Anita S.', text: 'The mangoes were sweet and perfectly ripe. Delivery was very quick!' },
  { name: 'Rahul P.', text: 'Great prices and really fresh quality. I order every week now.' },
  { name: 'Meera K.', text: 'Easy to use website and the receipt download is very handy.' },
];

export default function Landing() {
  const { token } = useApp();
  const [i, setI] = useState(0);
  const [fruits, setFruits] = useState([]);
  const shopLink = token ? '/home' : '/register';

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get('fruits/').then((r) => setFruits(r.data.slice(0, 4))).catch(() => {});
  }, []);

  const prev = () => setI((i - 1 + slides.length) % slides.length);
  const next = () => setI((i + 1) % slides.length);

  return (
    <div className='landing'>
      {/* ---------- Slider ---------- */}
      <section className='slider'>
        {slides.map((src, n) => (
          <img key={src} src={src} alt='Fresh fruits' className={n === i ? 'slide show' : 'slide'} />
        ))}
        <button className='arrow left' onClick={prev}>‹</button>
        <button className='arrow right' onClick={next}>›</button>
        <div className='dots'>
          {slides.map((_, n) => (
            <span key={n} className={n === i ? 'dot active' : 'dot'} onClick={() => setI(n)} />
          ))}
        </div>
      </section>

      {/* ---------- Intro ---------- */}
      <section className='intro'>
        <h1>Fresh Fruits, <span>Delivered to Your Door</span></h1>
        <p>Farm fresh, hand-picked and fairly priced. Order by the kg and enjoy the taste of freshness every day.</p>
        <div className='row' style={{ justifyContent: 'center' }}>
          <Link to={shopLink} className='btn big'>Shop Now</Link>
          {!token && <Link to='/login' className='btn-outline big' style={{ margin: 0 }}>Login</Link>}
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className='l-section'>
        <div className='feature-grid'>
          {features.map((f) => (
            <div className='feature' key={f.title}>
              <div className='feature-icon'>{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className='l-section'>
        <h2 className='l-title'>Shop by Category</h2>
        <p className='l-sub'>Find your favourite fruits quickly</p>
        <div className='cat-grid'>
          {categories.map((c) => (
            <Link to={shopLink} className='cat' key={c.name}>
              <span>{c.icon}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Featured fruits (from your database) ---------- */}
      {fruits.length > 0 && (
        <section className='l-section'>
          <h2 className='l-title'>Fresh Picks for You</h2>
          <p className='l-sub'>A taste of what is in our store today</p>
          <div className='pick-grid'>
            {fruits.map((f) => (
              <Link to={'/fruit/' + f.id} className='pick' key={f.id}>
                <div className='pick-img'>
                  {f.discount_percent > 0 && <span className='pick-off'>{f.discount_percent}% OFF</span>}
                  <img src={f.image} alt={f.name} />
                </div>
                <div className='pick-body'>
                  <h4>{f.name}</h4>
                  <p>
                    <b>₹{Number(f.final_price)}</b> / kg
                    {f.discount_percent > 0 && <s> ₹{Number(f.price_per_kg)}</s>}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to={shopLink} className='btn-outline' style={{ margin: 0 }}>View all fruits →</Link>
          </div>
        </section>
      )}

      {/* ---------- Offer banner ---------- */}
      <section className='l-section'>
        <div className='offer'>
          <div>
            <h2>Seasonal fruits at special prices</h2>
            <p>Register today and enjoy fresh fruits with daily discounts. Fast delivery and easy returns.</p>
          </div>
          <Link to={shopLink} className='btn light'>Start Shopping</Link>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className='l-section'>
        <h2 className='l-title'>How It Works</h2>
        <p className='l-sub'>Three easy steps to fresh fruits</p>
        <div className='step-grid'>
          {steps.map((s) => (
            <div className='step' key={s.n}>
              <div className='step-no'>{s.n}</div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className='l-section'>
        <h2 className='l-title'>Loved by Our Customers</h2>
        <p className='l-sub'>Real words from happy shoppers</p>
        <div className='review-grid'>
          {reviews.map((r) => (
            <div className='review-card' key={r.name}>
              <div className='stars'>★★★★★</div>
              <p>"{r.text}"</p>
              <b>{r.name}</b>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Final call to action ---------- */}
      {!token && (
        <section className='l-section'>
          <div className='cta'>
            <h2>Ready to taste the freshness?</h2>
            <p>Create your free account and place your first order in minutes.</p>
            <Link to='/register' className='btn big'>Create Account</Link>
          </div>
        </section>
      )}
    </div>
  );
}