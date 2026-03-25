import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { useStore } from '../store';
import { CATEGORY_LABELS, formatPrice } from '../utils/helpers';
import type { Category } from '../types';
import {
  Badge, Button, Card, ImagePlaceholder, Input,
  Pagination, Select, SkeletonCard, Toggle, Alert,
} from '../components/ui';

const PAGE_SIZE = 10;
const CATEGORIES: Category[] = ['auto', 'real_estate', 'electronics'];

export function AdsPage() {
  const navigate = useNavigate();
  const {
    search, setSearch, categories, toggleCategory, needsRevision, setNeedsRevision,
    sortColumn, sortDirection, setSort, page, setPage, layout, setLayout, resetFilters,
  } = useStore();
  const abortRef = useRef<AbortController | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['items', { search, categories, needsRevision, sortColumn, sortDirection, page }],
    queryFn: ({ signal }) => itemsApi.getItems({
      q: search || undefined,
      categories: categories.length ? categories : undefined,
      needsRevision: needsRevision || undefined,
      sortColumn,
      sortDirection,
      limit: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }, signal),
    placeholderData: (prev) => prev,
  });

  const sortOptions = [
    { value: 'createdAt|desc', label: 'По новизне (сначала новые)' },
    { value: 'createdAt|asc', label: 'По новизне (сначала старые)' },
    { value: 'title|asc', label: 'По названию (А-Я)' },
    { value: 'title|desc', label: 'По названию (Я-А)' },
  ];

  const handleSort = (v: string) => {
    const [col, dir] = v.split('|');
    setSort(col as 'title' | 'createdAt', dir as 'asc' | 'desc');
  };

  const currentSort = `${sortColumn}|${sortDirection}`;
  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Мои объявления</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
          {isLoading ? 'Загрузка...' : `${total} объявлений`}
        </p>
      </div>

      {/* Search + controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <Input
            placeholder="Найти объявление..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            prefix={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            }
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Layout toggle */}
          <button
            onClick={() => setLayout('grid')}
            title="Сетка"
            style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--color-border)', background: layout === 'grid' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: layout === 'grid' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >⊞</button>
          <button
            onClick={() => setLayout('list')}
            title="Список"
            style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--color-border)', background: layout === 'list' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: layout === 'list' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >☰</button>
          <Select
            options={sortOptions}
            value={currentSort}
            onChange={e => handleSort(e.target.value)}
            style={{ width: 250 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar Filters */}
        <aside style={{
          width: 220, flexShrink: 0,
          background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)', padding: '20px 16px',
          position: 'sticky', top: 80,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Фильтры</h3>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10 }}>Категория</p>
            {CATEGORIES.map(cat => (
              <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }}
                />
                <span style={{ fontSize: 14 }}>{CATEGORY_LABELS[cat]}</span>
              </label>
            ))}
          </div>

          <div style={{ paddingTop: 16, borderTop: '1px solid var(--color-border)', marginBottom: 16 }}>
            <Toggle
              checked={needsRevision}
              onChange={setNeedsRevision}
              label="Только требующие доработок"
            />
          </div>

          <button
            onClick={resetFilters}
            style={{
              width: '100%', padding: '8px', fontSize: 13, fontWeight: 600,
              border: 'none', background: 'none', color: 'var(--color-text-secondary)',
              cursor: 'pointer', textAlign: 'center', borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            Сбросить фильтры
          </button>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isError && (
            <Alert variant="error" title="Ошибка загрузки">
              Не удалось загрузить объявления. Проверьте соединение с сервером.
            </Alert>
          )}

          {isLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fill, minmax(200px, 1fr))' : '1fr',
              gap: 16,
            }}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Объявления не найдены</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>Попробуйте изменить фильтры или поисковый запрос</p>
              <Button variant="secondary" style={{ marginTop: 16 }} onClick={resetFilters}>Сбросить фильтры</Button>
            </div>
          ) : (
            <>
              <div
                className="fade-in"
                style={{
                  display: 'grid',
                  gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fill, minmax(200px, 1fr))' : '1fr',
                  gap: 16,
                }}
              >
                {items.map(item => (
                  <Card
                    key={item.id}
                    hoverable
                    onClick={() => navigate(`/ads/${item.id}`)}
                    style={layout === 'list' ? { display: 'flex', alignItems: 'stretch' } : undefined}
                  >
                    {layout === 'grid' ? (
                      <>
                        <ImagePlaceholder height={160} style={{ borderRadius: 0 }} />
                        <div style={{ padding: '12px 14px' }}>
                          <div style={{ marginBottom: 6 }}>
                            <Badge variant="neutral">{CATEGORY_LABELS[item.category]}</Badge>
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{item.title}</p>
                          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{formatPrice(item.price)}</p>
                          {item.needsRevision && (
                            <div style={{ marginTop: 8 }}>
                              <Badge variant="warning">Требует доработок</Badge>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <ImagePlaceholder width={120} height={90} style={{ borderRadius: 0, flexShrink: 0, height: 'auto' }} />
                        <div style={{ padding: '14px 16px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                          <div>
                            <div style={{ marginBottom: 4 }}><Badge variant="neutral">{CATEGORY_LABELS[item.category]}</Badge></div>
                            <p style={{ fontSize: 15, fontWeight: 600 }}>{item.title}</p>
                            {item.needsRevision && <div style={{ marginTop: 6 }}><Badge variant="warning">Требует доработок</Badge></div>}
                          </div>
                          <p style={{ fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap' }}>{formatPrice(item.price)}</p>
                        </div>
                      </>
                    )}
                  </Card>
                ))}
              </div>
              <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
