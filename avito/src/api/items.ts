import axios from 'axios';
import type { Item, ItemsGetOut, ItemUpdateIn, ItemsQueryParams } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
});

export const itemsApi = {
  getItems: async (params: ItemsQueryParams, signal?: AbortSignal): Promise<ItemsGetOut> => {
    const query: Record<string, string> = {};
    if (params.q) query.q = params.q;
    if (params.limit !== undefined) query.limit = String(params.limit);
    if (params.skip !== undefined) query.skip = String(params.skip);
    if (params.needsRevision) query.needsRevision = 'true';
    if (params.categories?.length) query.categories = params.categories.join(',');
    if (params.sortColumn) query.sortColumn = params.sortColumn;
    if (params.sortDirection) query.sortDirection = params.sortDirection;

    const { data } = await api.get<ItemsGetOut>('/items', { params: query, signal });
    return data;
  },

  getItem: async (id: string, signal?: AbortSignal): Promise<Item> => {
    const { data } = await api.get<Item>(`/items/${id}`, { signal });
    return data;
  },

  updateItem: async (id: string, body: ItemUpdateIn): Promise<Item> => {
    const { data } = await api.put<Item>(`/items/${id}`, body);
    return data;
  },
};

export default api;
