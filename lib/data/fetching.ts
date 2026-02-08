/**
 * Data Fetching Utilities
 * 
 * Provides typed, consistent data fetching patterns with:
 * - Built-in caching support
 * - Error handling
 * - Type safety
 * - SWR-like stale-while-revalidate patterns
 */

export type FetchResult<T> = {
    data: T | null;
    error: string | null;
    status: 'success' | 'error';
};

export type FetchOptions = {
    /** Revalidation time in seconds, or false for no caching */
    revalidate?: number | false;
    /** Cache tags for on-demand revalidation */
    tags?: string[];
    /** Request timeout in milliseconds */
    timeout?: number;
};

const DEFAULT_OPTIONS: FetchOptions = {
    revalidate: 3600, // 1 hour default cache
    timeout: 10000,   // 10 second timeout
};

/**
 * Fetch data with built-in caching and error handling
 */
export async function fetchWithCache<T>(
    url: string,
    options: FetchOptions = {}
): Promise<FetchResult<T>> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout);

        const response = await fetch(url, {
            signal: controller.signal,
            next: {
                revalidate: mergedOptions.revalidate ?? 3600,
                tags: mergedOptions.tags
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return {
                data: null,
                error: `HTTP ${response.status}: ${response.statusText}`,
                status: 'error'
            };
        }

        const data = await response.json() as T;
        return { data, error: null, status: 'success' };
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            return {
                data: null,
                error: 'Request timeout',
                status: 'error'
            };
        }
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'error'
        };
    }
}

/**
 * Fetch data without caching (for dynamic data)
 */
export async function fetchDynamic<T>(url: string): Promise<FetchResult<T>> {
    return fetchWithCache<T>(url, { revalidate: 0 });
}

/**
 * Fetch with stale-while-revalidate pattern
 * Returns cached data immediately while fetching fresh data in background
 */
export async function fetchSWR<T>(
    url: string,
    staleTime: number = 60,
    revalidateTime: number = 3600
): Promise<FetchResult<T>> {
    return fetchWithCache<T>(url, {
        revalidate: staleTime,
        tags: [`swr-${url}`]
    });
}

/**
 * Create a standardized API response with caching headers
 */
export function createApiResponse<T>(
    data: T,
    status = 200,
    cacheOptions?: {
        maxAge?: number;
        sMaxAge?: number;
        staleWhileRevalidate?: number;
    }
): Response {
    const { maxAge = 60, sMaxAge = 300, staleWhileRevalidate = 600 } = cacheOptions || {};

    return Response.json(data, {
        status,
        headers: {
            'Cache-Control': `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
            'Content-Type': 'application/json',
        }
    });
}

/**
 * Create an error API response
 */
export function createErrorResponse(
    message: string,
    status = 500
): Response {
    return Response.json(
        { error: message },
        {
            status,
            headers: {
                'Cache-Control': 'no-store',
                'Content-Type': 'application/json',
            }
        }
    );
}

/**
 * Retry a fetch operation with exponential backoff
 */
export async function fetchWithRetry<T>(
    url: string,
    options: FetchOptions & { retries?: number } = {}
): Promise<FetchResult<T>> {
    const { retries = 3, ...fetchOptions } = options;

    for (let attempt = 0; attempt < retries; attempt++) {
        const result = await fetchWithCache<T>(url, fetchOptions);

        if (result.status === 'success') {
            return result;
        }

        // Don't retry on the last attempt
        if (attempt < retries - 1) {
            // Exponential backoff: 1s, 2s, 4s...
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }

    return {
        data: null,
        error: `Failed after ${retries} retries`,
        status: 'error'
    };
}
