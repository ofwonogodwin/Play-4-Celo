import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { WalletProvider } from '@/providers/WalletProvider';

export default function App({ Component, pageProps }: AppProps) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WalletProvider>
            <QueryClientProvider client={queryClient}>
                <Component {...pageProps} />
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            iconTheme: {
                                primary: '#35D07F',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </QueryClientProvider>
        </WalletProvider>
    );
}
