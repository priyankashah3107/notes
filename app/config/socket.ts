export const getSocketUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  
  if (isProduction && vercelUrl) {
    // Use WSS in production
    return `wss://${vercelUrl}`;
  }
  
  // Default to localhost in development
  return 'http://localhost:3001';
}; 