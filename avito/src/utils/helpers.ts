import type { Category, Item, AutoItemParams, RealEstateItemParams, ElectronicsItemParams } from '../types';

export const CATEGORY_LABELS: Record<Category, string> = {
  auto: 'Авто',
  real_estate: 'Недвижимость',
  electronics: 'Электроника',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  auto: '#e8f4fd',
  real_estate: '#f0fdf4',
  electronics: '#fef3c7',
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function getMissingFields(item: Item): string[] {
  const missing: string[] = [];
  if (!item.description) missing.push('Описание');

  const cat = item.category;
  const params = item.params as Record<string, unknown>;

  if (cat === 'auto') {
    const autoLabels: Record<keyof AutoItemParams, string> = {
      brand: 'Бренд', model: 'Модель', yearOfManufacture: 'Год выпуска',
      transmission: 'Коробка передач', mileage: 'Пробег', enginePower: 'Мощность двигателя',
    };
    for (const [key, label] of Object.entries(autoLabels)) {
      if (!params[key]) missing.push(label);
    }
  } else if (cat === 'real_estate') {
    const reLabels: Record<keyof RealEstateItemParams, string> = {
      type: 'Тип', address: 'Адрес', area: 'Площадь', floor: 'Этаж',
    };
    for (const [key, label] of Object.entries(reLabels)) {
      if (!params[key]) missing.push(label);
    }
  } else if (cat === 'electronics') {
    const elLabels: Record<keyof ElectronicsItemParams, string> = {
      type: 'Тип', brand: 'Бренд', model: 'Модель', condition: 'Состояние', color: 'Цвет',
    };
    for (const [key, label] of Object.entries(elLabels)) {
      if (!params[key]) missing.push(label);
    }
  }

  return missing;
}

export function getDraftKey(id: string): string {
  return `avito-draft-${id}`;
}
