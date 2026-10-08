import type { ApiError } from '../types/catalog'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}/api${path}`, {
    headers: {
      Accept: 'application/json',
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
    ...options,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const body = (await response.json()) as T & {
    message?: string
    errors?: Record<string, string[]>
  }

  if (!response.ok) {
    const error = new globalThis.Error(body.message ?? 'Không thể thực hiện yêu cầu.') as ApiError
    error.fields = body.errors
    throw error
  }

  return body
}

export function toQuery(values: Record<string, string | number | undefined>): string {
  const parameters = new URLSearchParams()

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      parameters.set(key, String(value))
    }
  })

  return parameters.size > 0 ? `?${parameters.toString()}` : ''
}
