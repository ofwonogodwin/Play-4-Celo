/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };
        return config;
    },
    env: {
        NEXT_PUBLIC_QUIZ_POOL_ADDRESS: process.env.NEXT_PUBLIC_QUIZ_POOL_ADDRESS,
        NEXT_PUBLIC_CUSD_ADDRESS: process.env.NEXT_PUBLIC_CUSD_ADDRESS,
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
        NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    },
};

module.exports = nextConfig;
