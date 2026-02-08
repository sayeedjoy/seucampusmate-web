/**
 * Data utilities - Unified module for data fetching and caching patterns
 */

export {
    fetchWithCache,
    fetchDynamic,
    fetchSWR,
    fetchWithRetry,
    createApiResponse,
    createErrorResponse,
    type FetchResult,
    type FetchOptions,
} from './fetching';
