import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { user } = useApp();
  if (!user) return <p className='page'>Loading...</p>;

  return (
    <div className='auth-box'>
      <h1 style={{ textAlign: 'center', margin: 0 }}>👤</h1>
      <h2 style={{ textAlign: 'center', margin: 0 }}>{user.name}</h2>
      <p style={{ textAlign: 'center' }}>{user.email}</p>
      <p className='muted' style={{ textAlign: 'center' }}>
        Member since {new Date(user.joined).toLocaleDateString()}
      </p>
      <Link to='/edit-profile' className='btn' style={{ textAlign: 'center' }}>Edit Details</Link>
      <Link to='/change-password' className='btn-outline' style={{ textAlign: 'center', margin: 0 }}>Change Password</Link>
    </div>
  );
}