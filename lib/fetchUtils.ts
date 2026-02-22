/**
 * Safely parse JSON from a Response object
 * Handles empty responses and non-JSON content gracefully
 */
export async function safeJsonParse<T = any>(response: Response): Promise<T | null> {
  try {
    // Check if response has content
    const text = await response.text();
    
    // If empty, return null
    if (!text || text.trim() === '') {
      return null;
    }
    
    // Try to parse as JSON
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}

/**
 * Fetch with automatic JSON parsing and error handling
 */
export async function fetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; response: Response }> {
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
        response
      };
    }
    
    return {
      data,
      error: null,
      response
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
      response: new Response(null, { status: 0 })
    };
  }
}