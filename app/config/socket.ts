export const getSocketUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  
  if (isProduction) {
    // In production, use the same domain as the app
    return typeof window !== 'undefined' 
      ? window.location.origin
      : `https://${vercelUrl}`;
  }
  
  // In development, use localhost
  return 'http://localhost:3001';
}; 