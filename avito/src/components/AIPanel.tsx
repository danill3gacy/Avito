import React, { useState } from 'react';
import { generateDescription, suggestPrice, chatWithAI } from '../api/llm';
import type { Item, ChatMessage } from '../types';
import { Button, Spinner } from './ui';

interface AISuggestProps {
  item: Partial<Item>;
  type: 'description' | 'price';
  onApply: (text: string) => void;
  hasDescription: boolean;
}

export function AISuggest({ item, type, onApply, hasDescription }: AISuggestProps) {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shown, setShown] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    setError('');
    setResult('');
    setShown(true);
    try {
      const res = type === 'description'
        ? await generateDescription(item)
        : await suggestPrice(item);
      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка запроса к AI';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (type === 'description') {
      onApply(result);
    } else {
      // Extract first number from price suggestion
      const match = result.match(/\d[\d\s]*/);
      if (match) {
        const num = match[0].replace(/\s/g, '');
        onApply(num);
      }
    }
    setShown(false);
  };

  const btnLabel = type === 'description'
    ? (hasDescription ? '✨ Улучшить описание' : '✨ Придумать описание')
    : '💰 Узнать рыночную цену';

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={handleRequest} loading={loading}>
        {btnLabel}
      </Button>

      {shown && (
        <div style={{
          marginTop: 12, background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', padding: '16px', position: 'relative',
          boxShadow: 'var(--shadow-md)',
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Ответ AI:</p>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', fontSize: 14 }}>
              <Spinner size={16} /> Генерирую...
            </div>
          )}

          {error && (
            <p style={{ color: 'var(--color-danger)', fontSize: 14 }}>
              {error.includes('API key') || error.includes('401')
                ? 'Не настроен API ключ. Укажите VITE_ANTHROPIC_API_KEY в .env'
                : error}
            </p>
          )}

          {result && (
            <>
              <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{result}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" onClick={handleApply}>Применить</Button>
                <Button size="sm" variant="secondary" onClick={() => setShown(false)}>Закрыть</Button>
                <Button size="sm" variant="ghost" onClick={handleRequest} loading={loading}>Повторить запрос</Button>
              </div>
            </>
          )}

          {!loading && !result && !error && (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Ожидание ответа...</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── AI Chat ────────────────────────────────────────────────────────────────
interface AIChatProps { item: Partial<Item>; }

export function AIChat({ item }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const reply = await chatWithAI(item, newMessages);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Ошибка. Проверьте настройки API.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          fontSize: 14, fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer',
          fontFamily: 'var(--font)',
        }}
      >
        <span>💬</span> Чат с AI-ассистентом
        <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: 16,
        }}>
          <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
            {messages.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                Задайте вопрос об этом объявлении
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface-2)',
                color: m.role === 'user' ? '#fff' : 'var(--color-text)',
                padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.5,
              }}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 6, padding: '10px 14px', background: 'var(--color-surface-2)', borderRadius: 12 }}>
                <Spinner size={14} />
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Думаю...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Спросите что-нибудь об объявлении..."
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
                color: 'var(--color-text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
            <Button size="sm" onClick={send} loading={loading} disabled={!input.trim()}>
              Отправить
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
