import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';

export function Header() {
  const { theme, toggleTheme } = useStore();
  const location = useLocation();
  const isAds = location.pathname.startsWith('/ads');

  return (
    <header style={{
      background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
      position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60, gap: 16,
      }}>
        <Link to="/ads" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 18 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--color-primary)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16,
          }}>А</div>
          <span style={{ color: 'var(--color-text)' }}>Авито</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 14, fontWeight: 400 }}>/ Продавец</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAds && (
            <Link
              to="/ads"
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600,
                background: 'var(--color-primary-light)', color: 'var(--color-primary)',
              }}
            >
              Мои объявления
            </Link>
          )}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  );
}
