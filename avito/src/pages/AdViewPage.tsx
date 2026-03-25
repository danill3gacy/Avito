import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { CATEGORY_LABELS, formatPrice, formatDate, getMissingFields } from '../utils/helpers';
import type { AutoItemParams, RealEstateItemParams, ElectronicsItemParams } from '../types';
import { Alert, Badge, Button, ImagePlaceholder, Spinner } from '../components/ui';

function ParamRow({ label, value }: { label: string; value?: string | number }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', gap: 24, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ width: 140, flexShrink: 0, color: 'var(--color-text-secondary)', fontSize: 14 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export function AdViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['item', id],
    queryFn: ({ signal }) => itemsApi.getItem(id!, signal),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: 60, display: 'flex', justifyContent: 'center' }}>
        <Spinner size={40} />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <Alert variant="error" title="Ошибка загрузки">
          Не удалось загрузить объявление. <Link to="/ads" style={{ color: 'var(--color-primary)' }}>Вернуться к списку</Link>
        </Alert>
      </div>
    );
  }

  const missingFields = getMissingFields(item);
  const params = item.params as Record<string, unknown>;

  const renderParams = () => {
    if (item.category === 'auto') {
      const p = item.params as AutoItemParams;
      return (
        <>
          <ParamRow label="Бренд" value={p.brand} />
          <ParamRow label="Модель" value={p.model} />
          <ParamRow label="Год выпуска" value={p.yearOfManufacture} />
          <ParamRow label="Коробка передач" value={p.transmission === 'automatic' ? 'Автомат' : p.transmission === 'manual' ? 'Механика' : undefined} />
          <ParamRow label="Пробег, км" value={p.mileage} />
          <ParamRow label="Мощность, л.с." value={p.enginePower} />
        </>
      );
    }
    if (item.category === 'real_estate') {
      const p = item.params as RealEstateItemParams;
      const typeLabels = { flat: 'Квартира', house: 'Дом', room: 'Комната' };
      return (
        <>
          <ParamRow label="Тип" value={p.type ? typeLabels[p.type] : undefined} />
          <ParamRow label="Адрес" value={p.address} />
          <ParamRow label="Площадь, м²" value={p.area} />
          <ParamRow label="Этаж" value={p.floor} />
        </>
      );
    }
    if (item.category === 'electronics') {
      const p = item.params as ElectronicsItemParams;
      const typeLabels = { phone: 'Телефон', laptop: 'Ноутбук', misc: 'Другое' };
      return (
        <>
          <ParamRow label="Тип" value={p.type ? typeLabels[p.type] : undefined} />
          <ParamRow label="Бренд" value={p.brand} />
          <ParamRow label="Модель" value={p.model} />
          <ParamRow label="Состояние" value={p.condition === 'new' ? 'Новый' : p.condition === 'used' ? 'Б/У' : undefined} />
          <ParamRow label="Цвет" value={p.color} />
        </>
      );
    }
    return null;
  };

  return (
    <div className="container fade-in" style={{ paddingTop: 32, paddingBottom: 48 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-text-secondary)' }}>
        <Link to="/ads" style={{ color: 'var(--color-primary)' }}>Мои объявления</Link>
        <span>›</span>
        <span>{item.title}</span>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700 }}>{item.title}</h1>
            <Badge variant="neutral">{CATEGORY_LABELS[item.category]}</Badge>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/ads/${item.id}/edit`)}
            icon={<span>✏️</span>}
          >
            Редактировать
          </Button>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 26, fontWeight: 700 }}>{formatPrice(item.price)}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Опубликовано: {formatDate(item.createdAt)}
          </p>
          {item.updatedAt && (
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Отредактировано: {formatDate(item.updatedAt)}
            </p>
          )}
        </div>
      </div>

      {/* Needs revision */}
      {missingFields.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Alert variant="warning" title="Требуются доработки">
            <p style={{ marginBottom: 8 }}>У объявления не заполнены поля:</p>
            <ul style={{ paddingLeft: 16 }}>
              {missingFields.map(f => <li key={f} style={{ marginBottom: 2 }}>{f}</li>)}
            </ul>
          </Alert>
        </div>
      )}

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <ImagePlaceholder height={280} style={{ borderRadius: 'var(--radius-md)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
            {[1, 2, 3, 4].map(i => <ImagePlaceholder key={i} height={70} style={{ borderRadius: 'var(--radius-sm)' }} />)}
          </div>
        </div>

        <div>
          {/* Params */}
          <div style={{
            background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)', padding: '20px 24px',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Характеристики</h3>
            {renderParams()}
          </div>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <div style={{
          marginTop: 32, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)', padding: '20px 24px',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Описание</h3>
          <p style={{ color: 'var(--color-text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{item.description}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Button variant="primary" onClick={() => navigate(`/ads/${item.id}/edit`)} icon={<span>✏️</span>}>
          Редактировать
        </Button>
        <Button variant="secondary" onClick={() => navigate('/ads')}>
          ← К списку
        </Button>
      </div>
    </div>
  );
}
