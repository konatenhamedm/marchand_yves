import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export const BASE_URL = "https://dev.moomen.pro/api";
export const BASE_URL_LAMBDA = "https://dev.moomen.pro/api";
export const BASE_URL_UPLOAD = "https://dev.moomen.pro/api";

interface ApiFetchOptions extends RequestInit {
  data?: any;
  provenance?: boolean;
  cookies?: ReadonlyRequestCookies;
  useFormData?: boolean;
}

export async function apiFetch(
  url: string,
  options: ApiFetchOptions = {}
): Promise<any> {
  const {
    provenance = true,
    method = 'GET',
    data,
    cookies,
    useFormData = false,
    ...restOptions
  } = options;

  let token = null;

  if (typeof window !== 'undefined') {
    // Essayer de récupérer la session NextAuth directement
    try {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user?.token) {
        token = session.user.token;
      }
    } catch (e) {
      console.error('Error fetching session', e);
    }

    // Fallback sur l'ancien système si pas de token NextAuth
    if (!token) {
      const cookieString = document.cookie;
      const cookiePairs = cookieString.split(';').map(c => c.trim().split('='));
      const cookieObj = Object.fromEntries(cookiePairs);

      if (cookieObj.auth) {
        try {
          const decodedAuth = decodeURIComponent(cookieObj.auth);
          token = JSON.parse(decodedAuth).token;
        } catch (e) {
          console.error('Error parsing auth cookie', e);
        }
      }
    }
  } else if (cookies) {
    const authCookie = cookies.get('auth');
    if (authCookie?.value) {
      try {
        const decodedAuth = decodeURIComponent(authCookie.value);
        token = JSON.parse(decodedAuth).token;
      } catch (e) {
        console.error('Error parsing auth cookie', e);
      }
    }
  }

  const headers: Record<string, string> = {
    ...restOptions.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !useFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const requestOptions: RequestInit = {
    ...restOptions,
    method,
    headers,
  };

  if (data) {
    if (useFormData) {
      if (data instanceof FormData) {
        requestOptions.body = data;
      } else {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          const value = data[key];

          if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
          }
          else if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
            value.forEach(file => formData.append(key, file));
          }
          else if (value !== null && value !== undefined) {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
          }
        });
        requestOptions.body = formData;
      }
    } else {
      requestOptions.body = JSON.stringify(data);
    }
  }

  const baseUrl = provenance ? BASE_URL_LAMBDA : BASE_URL;

  try {
    const response = await fetch(`${baseUrl}${url}`, requestOptions);

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        throw new Error('Unauthorized');
      }
      throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

export async function clientApiFetch(
  url: string,
  provenance = true,
  method: string = 'GET',
  data: any = null,
  options: RequestInit = {}
): Promise<any> {
  return apiFetch(url, {
    provenance,
    method,
    data,
    ...options
  });
}

export async function motPasseOublie(email: string, newPassword: string) {
  try {
    const response = await fetch(`${BASE_URL}/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        newPassword: newPassword
      })
    });

    const responseData = await response.json();
    return true;
  } catch (error) {
    return {
      status: false,
      message: "Veillez réessayer plus tard un probleme est survenu",
    };
  }
}