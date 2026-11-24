import { useState, useEffect } from 'react';
import api, { errorMessage } from '../api';
import FruitCard from '../components/FruitCard';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const HOME_LIMIT = 12; // 3 rows x 4 fruits

export default function Home() {
  const [fruits, setFruits] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const { refreshCart } = useApp();
  const toast = useToast();

  const load = async () => {
    try {
      const { data } = await api.get('fruits/');
      setFruits(data);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not load fruits'));
    }
    setLoaded(true);
  };

  useEffect(() => { load(); }, []);

  const term = search.trim().toLowerCase();

  // Oldest first, so the fruits on the home page stay the same when new ones are added
  const sorted = [...fruits].sort((a, b) => a.id - b.id);

  // No search: first 12 only. With a search: look through ALL fruits.
  const results = term
    ? sorted.filter((f) => f.name.toLowerCase().includes(term))
    : sorted.slice(0, HOME_LIMIT);

  const notFound = loaded && term !== '' && results.length === 0;

  // Red notification when the searched fruit does not exist (after the user stops typing)
  useEffect(() => {
    if (!notFound) return;
    const t = setTimeout(() => {
      toast.error('Sorry, “' + search.trim() + '” does not exist in our store');
    }, 700);
    return () => clearTimeout(t);
  }, [notFound, search]);

  const addToCart = async (fruit, qty) => {
    try {
      await api.post('cart/', { fruit_id: fruit.id, quantity_kg: qty });
      await refreshCart();
      toast.success(fruit.name + ' added to cart successfully');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add to cart'));
    }
  };

  return (
    <div className='page'>
      <div className='row'>
        <h2>{term ? 'Search results' : 'Fresh Fruits'}</h2>
        <div className='search-box'>
          <input
            className='search'
            placeholder='Search fruits...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className='search-clear' onClick={() => setSearch('')}>×</button>}
        </div>
      </div>

      {term && results.length > 0 && (
        <p className='muted'>
          {results.length} {results.length === 1 ? 'fruit' : 'fruits'} found for “{search.trim()}”
        </p>
      )}

      {!loaded && <p className='muted'>Loading fruits...</p>}

      {loaded && fruits.length === 0 && !term && (
        <div className='empty'>
          <div className='empty-icon'>🍎</div>
          <h3>No fruits available yet</h3>
          <p className='muted'>Please check back soon.</p>
        </div>
      )}

      {notFound && (
        <div className='empty'>
          <div className='empty-icon'>🔍</div>
          <h3>“{search.trim()}” does not exist in our store</h3>
          <p className='muted'>Check the spelling or try another fruit name.</p>
          <button className='btn' onClick={() => setSearch('')}>Clear search</button>
        </div>
      )}

      <div className='grid'>
        {results.map((f) => (
          <FruitCard key={f.id} fruit={f} onAdd={addToCart} onChanged={load} />
        ))}
      </div>

      {!term && fruits.length > HOME_LIMIT && (
        <p className='more-hint'>
          Looking for something else? Use the search box to find any of our {fruits.length} fruits.
        </p>
      )}
    </div>
  );
}