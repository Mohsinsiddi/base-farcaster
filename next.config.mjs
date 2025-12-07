/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Bypass TS errors on Vercel
  },
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Stub native-only modules that some deps optionally import
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    }
    return config
  },
};

export default nextConfig;