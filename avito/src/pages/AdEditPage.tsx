import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../api/items';
import { getDraftKey, CATEGORY_LABELS } from '../utils/helpers';
import type { Category, ItemUpdateIn, AutoItemParams, RealEstateItemParams, ElectronicsItemParams } from '../types';
import { Alert, Button, Input, Select, Spinner, Textarea } from '../components/ui';
import { AISuggest, AIChat } from '../components/AIPanel';

type FormData = {
  category: Category;
  title: string;
  price: string;
  description: string;
  // Auto
  brand?: string;
  model?: string;
  yearOfManufacture?: string;
  transmission?: string;
  mileage?: string;
  enginePower?: string;
  // Real estate
  reType?: string;
  address?: string;
  area?: string;
  floor?: string;
  // Electronics
  elType?: string;
  condition?: string;
  color?: string;
};

function toFormData(item: Awaited<ReturnType<typeof itemsApi.getItem>>): FormData {
  const p = item.params as Record<string, unknown>;
  return {
    category: item.category,
    title: item.title,
    price: String(item.price),
    description: item.description || '',
    brand: p.brand as string || '',
    model: p.model as string || '',
    yearOfManufacture: p.yearOfManufacture ? String(p.yearOfManufacture) : '',
    transmission: p.transmission as string || '',
    mileage: p.mileage ? String(p.mileage) : '',
    enginePower: p.enginePower ? String(p.enginePower) : '',
    reType: p.type as string || '',
    address: p.address as string || '',
    area: p.area ? String(p.area) : '',
    floor: p.floor ? String(p.floor) : '',
    elType: p.type as string || '',
    condition: p.condition as string || '',
    color: p.color as string || '',
  };
}

function buildUpdatePayload(form: FormData): ItemUpdateIn {
  let params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams = {};

  if (form.category === 'auto') {
    params = {
      brand: form.brand || undefined,
      model: form.model || undefined,
      yearOfManufacture: form.yearOfManufacture ? Number(form.yearOfManufacture) : undefined,
      transmission: (form.transmission as AutoItemParams['transmission']) || undefined,
      mileage: form.mileage ? Number(form.mileage) : undefined,
      enginePower: form.enginePower ? Number(form.enginePower) : undefined,
    };
  } else if (form.category === 'real_estate') {
    params = {
      type: (form.reType as RealEstateItemParams['type']) || undefined,
      address: form.address || undefined,
      area: form.area ? Number(form.area) : undefined,
      floor: form.floor ? Number(form.floor) : undefined,
    };
  } else if (form.category === 'electronics') {
    params = {
      type: (form.elType as ElectronicsItemParams['type']) || undefined,
      brand: form.brand || undefined,
      model: form.model || undefined,
      condition: (form.condition as ElectronicsItemParams['condition']) || undefined,
      color: form.color || undefined,
    };
  }

  return {
    category: form.category,
    title: form.title,
    price: Number(form.price),
    description: form.description || undefined,
    params,
  };
}

export function AdEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const draftKey = getDraftKey(id!);

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['item', id],
    queryFn: ({ signal }) => itemsApi.getItem(id!, signal),
    enabled: !!id,
  });

  const [form, setForm] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saved, setSaved] = useState(false);

  // Load from draft or server
  useEffect(() => {
    if (!item) return;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try { setForm(JSON.parse(draft)); return; } catch { /* ignore */ }
    }
    setForm(toFormData(item));
  }, [item, draftKey]);

  // Auto-save to localStorage
  useEffect(() => {
    if (form) {
      localStorage.setItem(draftKey, JSON.stringify(form));
    }
  }, [form, draftKey]);

  const mutation = useMutation({
    mutationFn: (payload: ItemUpdateIn) => itemsApi.updateItem(id!, payload),
    onSuccess: () => {
      localStorage.removeItem(draftKey);
      queryClient.invalidateQueries({ queryKey: ['item', id] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setSaved(true);
      setTimeout(() => navigate(`/ads/${id}`), 800);
    },
  });

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    if (!form) return false;
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.title.trim()) errs.title = 'Введите название';
    if (!form.price || isNaN(Number(form.price))) errs.price = 'Введите корректную цену';
    if (Number(form.price) <= 0) errs.price = 'Цена должна быть больше 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!form || !validate()) return;
    mutation.mutate(buildUpdatePayload(form));
  };

  const handleCancel = () => {
    localStorage.removeItem(draftKey);
    navigate(`/ads/${id}`);
  };

  if (isLoading || !form) {
    return (
      <div className="container" style={{ paddingTop: 60, display: 'flex', justifyContent: 'center' }}>
        <Spinner size={40} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <Alert variant="error" title="Ошибка">Не удалось загрузить объявление.</Alert>
      </div>
    );
  }

  const itemForAI = { ...buildUpdatePayload(form), id };

  return (
    <div className="container fade-in" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--color-text-secondary)' }}>
        <Link to="/ads" style={{ color: 'var(--color-primary)' }}>Мои объявления</Link>
        <span>›</span>
        <Link to={`/ads/${id}`} style={{ color: 'var(--color-primary)' }}>{item?.title}</Link>
        <span>›</span>
        <span>Редактирование</span>
      </div>

      <div style={{ maxWidth: 680 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Редактирование объявления</h1>

        {saved && <Alert variant="success">Сохранено! Перенаправление...</Alert>}
        {mutation.isError && <Alert variant="error" title="Ошибка сохранения">Не удалось сохранить. Попробуйте снова.</Alert>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Category */}
          <Select
            label="Категория"
            value={form.category}
            onChange={e => setField('category', e.target.value as Category)}
            options={[
              { value: 'auto', label: 'Авто' },
              { value: 'real_estate', label: 'Недвижимость' },
              { value: 'electronics', label: 'Электроника' },
            ]}
          />

          {/* Title */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
              <span style={{ color: 'var(--color-danger)' }}>*</span> Название
            </label>
            <Input
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="Название объявления"
              error={errors.title}
            />
          </div>

          {/* Price */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                  <span style={{ color: 'var(--color-danger)' }}>*</span> Цена
                </label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={e => setField('price', e.target.value)}
                  placeholder="0"
                  error={errors.price}
                />
              </div>
              <div style={{ paddingBottom: errors.price ? 26 : 0 }}>
                <AISuggest
                  item={itemForAI}
                  type="price"
                  hasDescription={!!form.description}
                  onApply={val => setField('price', val)}
                />
              </div>
            </div>
          </div>

          {/* Category-specific params */}
          <div style={{
            background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)', padding: '20px',
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Характеристики</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {form.category === 'auto' && (
                <>
                  <Input label="Бренд" value={form.brand || ''} onChange={e => setField('brand', e.target.value)} placeholder="Toyota" />
                  <Input label="Модель" value={form.model || ''} onChange={e => setField('model', e.target.value)} placeholder="Camry" />
                  <Input label="Год выпуска" type="number" value={form.yearOfManufacture || ''} onChange={e => setField('yearOfManufacture', e.target.value)} placeholder="2020" />
                  <Select
                    label="Коробка передач"
                    value={form.transmission || ''}
                    onChange={e => setField('transmission', e.target.value)}
                    options={[
                      { value: '', label: 'Не указана' },
                      { value: 'automatic', label: 'Автомат' },
                      { value: 'manual', label: 'Механика' },
                    ]}
                  />
                  <Input label="Пробег, км" type="number" value={form.mileage || ''} onChange={e => setField('mileage', e.target.value)} placeholder="50000" />
                  <Input label="Мощность, л.с." type="number" value={form.enginePower || ''} onChange={e => setField('enginePower', e.target.value)} placeholder="150" />
                </>
              )}

              {form.category === 'real_estate' && (
                <>
                  <Select
                    label="Тип"
                    value={form.reType || ''}
                    onChange={e => setField('reType', e.target.value)}
                    options={[
                      { value: '', label: 'Не указан' },
                      { value: 'flat', label: 'Квартира' },
                      { value: 'house', label: 'Дом' },
                      { value: 'room', label: 'Комната' },
                    ]}
                  />
                  <Input label="Адрес" value={form.address || ''} onChange={e => setField('address', e.target.value)} placeholder="ул. Ленина, 1" />
                  <Input label="Площадь, м²" type="number" value={form.area || ''} onChange={e => setField('area', e.target.value)} placeholder="50" />
                  <Input label="Этаж" type="number" value={form.floor || ''} onChange={e => setField('floor', e.target.value)} placeholder="5" />
                </>
              )}

              {form.category === 'electronics' && (
                <>
                  <Select
                    label="Тип"
                    value={form.elType || ''}
                    onChange={e => setField('elType', e.target.value)}
                    options={[
                      { value: '', label: 'Не указан' },
                      { value: 'phone', label: 'Телефон' },
                      { value: 'laptop', label: 'Ноутбук' },
                      { value: 'misc', label: 'Другое' },
                    ]}
                  />
                  <Input label="Бренд" value={form.brand || ''} onChange={e => setField('brand', e.target.value)} placeholder="Apple" />
                  <Input label="Модель" value={form.model || ''} onChange={e => setField('model', e.target.value)} placeholder="iPhone 15" />
                  <Input label="Цвет" value={form.color || ''} onChange={e => setField('color', e.target.value)} placeholder="Чёрный" />
                  <Select
                    label="Состояние"
                    value={form.condition || ''}
                    onChange={e => setField('condition', e.target.value)}
                    options={[
                      { value: '', label: 'Не указано' },
                      { value: 'new', label: 'Новый' },
                      { value: 'used', label: 'Б/У' },
                    ]}
                  />
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Textarea
              label="Описание"
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="Опишите товар подробно..."
              charCount
              rows={6}
            />
            <div style={{ marginTop: 8 }}>
              <AISuggest
                item={itemForAI}
                type="description"
                hasDescription={!!form.description}
                onApply={val => setField('description', val)}
              />
            </div>
          </div>

          {/* Draft indicator */}
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            💾 Черновик автоматически сохраняется в браузере
          </p>

          {/* AI Chat */}
          <AIChat item={itemForAI} />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <Button
              onClick={handleSubmit}
              loading={mutation.isPending}
              disabled={mutation.isPending}
            >
              Сохранить
            </Button>
            <Button variant="secondary" onClick={handleCancel} disabled={mutation.isPending}>
              Отменить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
