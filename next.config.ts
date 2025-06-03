
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgyukle.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.hizliresim.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Added for Firebase Storage
        port: '',
        pathname: '/**',
      }
    ],
  },
  // async redirects() { // Oturum yönetimi için AuthContext ve sayfa içi useEffect kullanılacak
  //   return [
  //     {
  //       source: '/login',
  //       has: [
  //         {
  //           type: 'cookie',
  //           key: 'user-authenticated', // Bu cookie AuthContext tarafından yönetilecek
  //           value: 'true',
  //         },
  //       ],
  //       permanent: false,
  //       destination: '/',
  //     },
  //      {
  //       source: '/signup',
  //       has: [
  //         {
  //           type: 'cookie',
  //           key: 'user-authenticated', 
  //           value: 'true',
  //         },
  //       ],
  //       permanent: false,
  //       destination: '/',
  //     },
  //     // TODO: Add redirects for protected routes if user is not authenticated
  //   ];
  // },
};

export default nextConfig;
