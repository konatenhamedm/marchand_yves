/**
 * Environment Configuration Manager
 * 
 * This module manages API URL configurations for different environments
 * (development and production) with automatic environment detection.
 */

// TypeScript interfaces for environment configuration
export interface EnvironmentUrls {
  BASE_URL: string;
  BASE_URL_LAMBDA: string;
  BASE_URL_UPLOAD: string;
}

export interface EnvironmentConfig {
  development: EnvironmentUrls;
  production: EnvironmentUrls;
}

// Configuration object with development and production settings
const ENVIRONMENT_CONFIG: EnvironmentConfig = {
  development: {
    BASE_URL: "https://dev.moomen.pro/bo",
    BASE_URL_LAMBDA: "https://dev.moomen.pro/api",
    BASE_URL_UPLOAD: "https://dev.moomen.pro"
  },
  production: {
    BASE_URL: "https://api.moomen.pro/bo",
    BASE_URL_LAMBDA: "https://api.moomen.pro/api",
    BASE_URL_UPLOAD: "https://api.moomen.pro"
  }
};

// Environment detection logic
export function detectEnvironment(): 'development' | 'production' {
  // Check for custom environment variable first (highest priority)
  // In Next.js, use NEXT_PUBLIC_ prefix for client-side access
  const customEnv = process.env.NEXT_PUBLIC_APP_ENV || process.env.APP_ENV;
  const nodeEnv = process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV;

  // Debug logging (can be removed in production)
  if (typeof window !== 'undefined') {
    console.log('🔧 Environment Detection:', {
      NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
      APP_ENV: process.env.APP_ENV,
      NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
      NODE_ENV: process.env.NODE_ENV,
      customEnv,
      nodeEnv
    });
  }

  // APP_ENV takes absolute precedence
  if (customEnv === 'production') {
    return 'production';
  }
  if (customEnv === 'development') {
    return 'development';
  }

  // If APP_ENV is not set or invalid, check NODE_ENV
  if (nodeEnv === 'production') {
    return 'production';
  }

  // Default fallback to development (includes NODE_ENV === 'development' or any other value)
  return 'development';
}

// Validate environment configuration completeness
export function validateEnvironmentConfig(config: EnvironmentUrls): boolean {
  const requiredKeys: (keyof EnvironmentUrls)[] = ['BASE_URL', 'BASE_URL_LAMBDA', 'BASE_URL_UPLOAD'];

  return requiredKeys.every(key => {
    const value = config[key];

    // Basic type and length checks
    if (typeof value !== 'string' || value.length === 0) {
      return false;
    }

    // Must start with http:// or https://
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return false;
    }

    // Must have content after the protocol
    const protocolLength = value.startsWith('https://') ? 8 : 7;
    if (value.length <= protocolLength) {
      return false;
    }

    // Try to parse as URL to ensure it's well-formed
    try {
      const url = new URL(value);
      // Must have a hostname
      return url.hostname.length > 0;
    } catch {
      return false;
    }
  });
}

// Get configuration for current environment
export function getEnvironmentConfig(): EnvironmentUrls {
  const currentEnv = detectEnvironment();
  const config = ENVIRONMENT_CONFIG[currentEnv];

  if (!validateEnvironmentConfig(config)) {
    console.warn(`Invalid configuration for environment: ${currentEnv}. Falling back to development.`);
    const fallbackConfig = ENVIRONMENT_CONFIG.development;

    if (!validateEnvironmentConfig(fallbackConfig)) {
      throw new Error('Development environment configuration is also invalid. Please check your configuration.');
    }

    // Return a copy to ensure immutability
    return { ...fallbackConfig };
  }

  // Return a copy to ensure immutability
  return { ...config };
}

// Export current environment URLs
const currentConfig = getEnvironmentConfig();

export const BASE_URL = currentConfig.BASE_URL;
export const BASE_URL_LAMBDA = currentConfig.BASE_URL_LAMBDA;
export const BASE_URL_UPLOAD = currentConfig.BASE_URL_UPLOAD;

// Export configuration object for testing purposes
export { ENVIRONMENT_CONFIG };
