import { useState, useEffect } from 'react';
import api, { errorMessage } from '../../api';
import { useToast } from '../../context/ToastContext';

export default function AdminReviews() {
  const toast = useToast();
  const [list, setList] = useState([]);

  const load = () => api.get('admin/reviews/').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const remove = async (r) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete('admin/reviews/' + r.id + '/');
      toast.success('Review deleted successfully');
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete review'));
    }
  };

  return (
    <>
      <h2>Reviews</h2>
      <div className='table-wrap'>
        <table className='adm-table'>
          <thead>
            <tr><th>Fruit</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td><b>{r.fruit}</b></td>
                <td>{r.user}</td>
                <td className='stars'>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                <td>{r.comment}</td>
                <td>{new Date(r.created).toLocaleDateString()}</td>
                <td><button className='btn sm danger' onClick={() => remove(r)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <p className='muted'>No reviews yet.</p>}
    </>
  );
}