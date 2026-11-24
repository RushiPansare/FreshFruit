import { useState, useEffect, useRef } from 'react';
import api, { errorMessage } from '../api';
import { useApp } from '../context/AppContext';

const BOT_NAME = 'FreshBot';
const MAX_LEN = 300;
const STORE_KEY = 'freshbot_chat';
const GREETING = 'Hi! I am FreshBot, your FreshFruits assistant. Ask me how to use the website, about fruits and prices, or your orders.';
const QUICK = [
  'How do I place an order?',
  'How do I download my receipt?',
  'I forgot my password',
  'Where is my order?',
  'What fruits do you have?',
];

function loadSaved() {
  try {
    const s = JSON.parse(sessionStorage.getItem(STORE_KEY));
    return Array.isArray(s) ? s : [];
  } catch (e) {
    return [];
  }
}

export default function ChatBot() {
  const { token } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadSaved);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const first = useRef(true);

  // new chat whenever someone logs in or out (keeps order details private)
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setMessages([]);
  }, [token]);

  useEffect(() => {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-30))); } catch (e) {}
  }, [messages]);

  useEffect(() => {
    if (open && endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  const send = async (given) => {
    const msg = (typeof given === 'string' ? given : text).trim();
    if (!msg || loading) return;

    const history = messages.filter((m) => !m.error).slice(-10).map((m) => ({ role: m.role, text: m.text }));
    setMessages((list) => [...list, { role: 'user', text: msg }]);
    setText('');
    setLoading(true);
    try {
      const { data } = await api.post('chat/', { message: msg, history });
      setMessages((list) => [...list, { role: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages((list) => [...list, {
        role: 'bot', error: true,
        text: errorMessage(err, 'Sorry, something went wrong. Please try again.'),
      }]);
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button className='bot-fab' onClick={() => setOpen(true)} aria-label='Open chat'>
        <span className='bot-fab-icon'>💬</span>
        <span>Ask {BOT_NAME}</span>
      </button>
    );
  }

  return (
    <div className='bot-window'>
      <div className='bot-head'>
        <div className='bot-avatar'>🍎</div>
        <div className='bot-title'>
          <b>{BOT_NAME}</b>
          <small>FreshFruits assistant</small>
        </div>
        <button className='bot-icon-btn' title='Clear chat' onClick={() => setMessages([])}>↺</button>
        <button className='bot-icon-btn' title='Close' onClick={() => setOpen(false)}>✕</button>
      </div>

      <div className='bot-body'>
        <div className='bot-msg bot'>{GREETING}</div>

        {messages.length === 0 && (
          <div className='bot-chips'>
            {QUICK.map((q) => (
              <button key={q} className='bot-chip' onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={'bot-msg ' + m.role + (m.error ? ' error' : '')}>{m.text}</div>
        ))}

        {loading && (
          <div className='bot-typing'><span /><span /><span /></div>
        )}
        <div ref={endRef} />
      </div>

      <form className='bot-form' onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input
          placeholder='Type your question...'
          value={text}
          maxLength={MAX_LEN}
          onChange={(e) => setText(e.target.value)}
        />
        <button className='bot-send' disabled={loading || !text.trim()}>➤</button>
      </form>
      <div className='bot-note'>
        {text.length > 240 ? text.length + '/' + MAX_LEN + ' characters. ' : ''}
        {BOT_NAME} can make mistakes. Never share passwords or card details here.
      </div>
    </div>
  );
}