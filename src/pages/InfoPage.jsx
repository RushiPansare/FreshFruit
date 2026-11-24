import { useParams, Link } from 'react-router-dom';

const pages = {
  'about-us': {
    title: 'About Us',
    body: [
      'FreshFruits is an online fruit store that brings fresh, seasonal fruits straight from trusted farms to your home.',
      'We believe healthy food should be easy to get and fairly priced. Every fruit is hand-picked, checked for quality and packed with care.',
      'Our mission is simple: fresh fruits, honest prices and on-time delivery.',
    ],
  },
  'contact-us': {
    title: 'Contact Us',
    body: [
      'We would love to hear from you. Reach us using the details below.',
      'Address: FreshFruits, Pune, Maharashtra, India',
      'Phone: +91 7498554659',
      'Email: rushispansare@gmail.com',
      'Working hours: Monday to Saturday, 9 AM to 7 PM',
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    body: [
      'How do I place an order? Login, add fruits to your cart, go to checkout, fill in your delivery details and place the order.',
      'Can I change the quantity? Yes. You can change the quantity in kg on the fruit page or in the cart.',
      'How do I get my receipt? After placing an order, click Download Receipt on the success page.',
      'I forgot my password. What should I do? Click Forgot password on the login page and set a new password.',
    ],
  },
  'shipping-delivery': {
    title: 'Shipping & Delivery',
    body: [
      'We deliver within 1 to 2 days in the cities we serve.',
      'Orders are packed fresh on the same day they are shipped.',
      'Delivery charges, if any, are shown at checkout before you pay.',
    ],
  },
  'returns-refunds': {
    title: 'Returns & Refunds',
    body: [
      'Fresh fruits are perishable, so please check your order on delivery.',
      'If any fruit is damaged or not fresh, contact us within 24 hours with a photo and we will replace it or refund you.',
      'Approved refunds are processed within 5 to 7 working days.',
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    body: [
      'We collect only the details needed to run your account and deliver your orders, such as your name, email, phone and address.',
      'Your password is stored in a secure, encrypted form. We never share your personal data with third parties for marketing.',
      'You can update your details at any time from the Edit Details page.',
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    body: [
      'By using FreshFruits you agree to provide correct information and to use the website lawfully.',
      'Prices and availability can change without notice. We may cancel an order if an item is out of stock.',
      'Please keep your login details private. You are responsible for activity on your account.',
    ],
  },
};

export default function InfoPage() {
  const { slug } = useParams();
  const page = pages[slug];

  if (!page) {
    return (
      <div className='page'>
        <h2>Page not found</h2>
        <Link to='/'>Go to home</Link>
      </div>
    );
  }

  return (
    <div className='page' style={{ maxWidth: 800 }}>
      <div className='box' style={{ maxWidth: 'none', margin: '30px 0' }}>
        <h1 style={{ marginTop: 0 }}>{page.title}</h1>
        {page.body.map((text, i) => (
          <p key={i} style={{ lineHeight: 1.7 }}>{text}</p>
        ))}
      </div>
    </div>
  );
}