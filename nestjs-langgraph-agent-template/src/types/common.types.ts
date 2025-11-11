/**
 * Common types and interfaces used across the application
 */

/**
 * Pagination parameters for list operations
 */
export interface PaginationParams {
  skip: number;
  take: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

/**
 * Repository cursor for pagination
 */
export interface PageCursor {
  skip: number;
  take: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}
