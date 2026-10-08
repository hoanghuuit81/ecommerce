export type StatusFilter = 'all' | '1' | '0'

export type Category = {
  id: number
  name: string
  slug: string
  description: string | null
  status: boolean
  products_count?: number
}

export type Product = {
  id: number
  category_id: number
  name: string
  sku: string
  description: string | null
  price: string
  stock: number
  image: string | null
  status: boolean
  category?: Category
}

export type PaginationMeta = {
  current_page: number
  last_page: number
  total: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

export type ApiError = globalThis.Error & {
  fields?: Record<string, string[]>
}
