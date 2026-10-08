import { apiRequest, toQuery } from './client'
import type { Category, PaginatedResponse, StatusFilter } from '../types/catalog'

type CategoryPayload = {
  name: string
  description: string
  status: boolean
}

export function getCategories(filters: { search: string; status: StatusFilter; page: number; perPage?: number }) {
  return apiRequest<PaginatedResponse<Category>>(`/categories${toQuery({
    search: filters.search,
    status: filters.status === 'all' ? undefined : filters.status,
    page: filters.page,
    per_page: filters.perPage ?? 10,
  })}`)
}

export function saveCategory(payload: CategoryPayload, categoryId?: number) {
  return apiRequest(categoryId ? `/categories/${categoryId}` : '/categories', {
    method: categoryId ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteCategory(categoryId: number) {
  return apiRequest<void>(`/categories/${categoryId}`, { method: 'DELETE' })
}
