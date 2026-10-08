import { apiRequest, toQuery } from './client'
import type { PaginatedResponse, Product, StatusFilter } from '../types/catalog'

type ProductPayload = {
  category_id: number
  name: string
  sku: string
  description: string
  price: number
  stock: number
  image: string | null
  status: boolean
}

export function getProducts(filters: { search: string; categoryId: string; status: StatusFilter; page: number }) {
  return apiRequest<PaginatedResponse<Product>>(`/products${toQuery({
    search: filters.search,
    category_id: filters.categoryId,
    status: filters.status === 'all' ? undefined : filters.status,
    page: filters.page,
    per_page: 10,
  })}`)
}

export function saveProduct(payload: ProductPayload, productId?: number) {
  return apiRequest(productId ? `/products/${productId}` : '/products', {
    method: productId ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteProduct(productId: number) {
  return apiRequest<void>(`/products/${productId}`, { method: 'DELETE' })
}
