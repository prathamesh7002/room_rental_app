// Environment configuration for React app
export const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  wsBaseUrl: process.env.REACT_APP_WS_BASE_URL || 'ws://localhost:8000/ws',
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  isProduction: process.env.REACT_APP_ENVIRONMENT === 'production',
  isDevelopment: process.env.REACT_APP_ENVIRONMENT === 'development',
};

export default config;
