import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Event Photo Gallery',
    short_name: 'Gallery',
    description: 'A platform to share and view event photos in real-time.',
    start_url: '/',
    display: 'standalone',
    background_color: '#171717',
    theme_color: '#d4af37',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
