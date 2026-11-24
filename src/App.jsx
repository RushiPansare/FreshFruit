import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import FruitDetail from './pages/FruitDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import InfoPage from './pages/InfoPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail';
import AdminReviews from './pages/admin/AdminReviews';
import ChatBot from './components/ChatBot';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const inAdmin = pathname.startsWith('/admin');

  return (
    <div className='app'>
      <ScrollToTop />
      {!inAdmin && <Navbar />}
      <main className='main'>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/page/:slug' element={<InfoPage />} />

          <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path='/fruit/:id' element={<ProtectedRoute><FruitDetail /></ProtectedRoute>} />
          <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path='/success/:orderId' element={<ProtectedRoute><Success /></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/edit-profile' element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path='/change-password' element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

          <Route path='/admin' element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path='products' element={<AdminProducts />} />
            <Route path='orders' element={<AdminOrders />} />
            <Route path='customers' element={<AdminCustomers />} />
                        <Route path='customers/:id' element={<AdminCustomerDetail />} />
            <Route path='reviews' element={<AdminReviews />} />
          </Route>
        </Routes>
      </main>
      {!inAdmin && <Footer />}
            {!inAdmin && <ChatBot />}
    </div>
  );
}