/**
 * Safely parse JSON from a Response object
 * Handles empty responses and non-JSON content gracefully
 * 
 * @param response - The fetch Response object
 * @returns Parsed JSON data or null if parsing fails
 */
export async function safeJsonParse<T = any>(response: Response): Promise<T | null> {
  try {
    // Get the response text first
    const text = await response.text();
    
    // If empty or whitespace only, return null
    if (!text || text.trim() === '') {
      console.warn('Empty response body received');
      return null;
    }
    
    // Try to parse as JSON
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    return null;
  }
}

/**
 * Wrapper around fetch that safely handles JSON responses
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Object containing data, error, and response
 */
export async function fetchWithSafeJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ 
  data: T | null; 
  error: string | null; 
  response: Response;
  ok: boolean;
}> {
  try {
    const response = await fetch(url, options);
    const data = await safeJsonParse<T>(response);
    
    if (!response.ok) {
      const errorMessage = 
        (data as any)?.message || 
        (data as any)?.error || 
        `Request failed with status ${response.status}`;
      
      return {
        data: null,
        error: errorMessage,
        response,
        ok: false
      };
    }
    
    return {
      data,
      error: null,
      response,
      ok: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    console.error('Fetch error:', errorMessage);
    
    return {
      data: null,
      error: errorMessage,
      response: new Response(null, { status: 0 }),
      ok: false
    };
  }
}

/**
 * Quick fix for existing code: replace response.json() calls
 * 
 * Usage:
 * Instead of: const data = await response.json();
 * Use: const data = await safeResponseJson(response);
 */
export async function safeResponseJson<T = any>(response: Response): Promise<T | null> {
  return safeJsonParse<T>(response);
}