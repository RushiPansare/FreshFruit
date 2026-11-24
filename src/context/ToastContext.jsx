import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const Ctx = createContext();
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = (id) => setToasts((list) => list.filter((t) => t.id !== id));

  const show = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, type, message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3500);
  }, []);

  const value = useMemo(() => ({
    success: (message) => show('success', message),
    error: (message) => show('error', message),
  }), [show]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className='toasts'>
        {toasts.map((t) => (
          <div key={t.id} className={'toast-item ' + t.type}>
            <span className='toast-icon'>{t.type === 'success' ? '✓' : '✕'}</span>
            <span className='toast-msg'>{t.message}</span>
            <button className='toast-x' onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}