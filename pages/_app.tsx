import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { SocketProvider } from '@/components/SocketProvider';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </SessionProvider>
  );
} 