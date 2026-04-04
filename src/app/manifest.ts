
import type { MetadataRoute } from 'next';
import data from '@/lib/placeholder-images.json';

export default function manifest(): MetadataRoute.Manifest {
  const icon192 = data.placeholderImages.find(img => img.id === 'app-icon-192')?.imageUrl || 'https://picsum.photos/seed/pulsyvibe-pro-hq-192/192/192';
  const icon512 = data.placeholderImages.find(img => img.id === 'app-icon-512')?.imageUrl || 'https://picsum.photos/seed/pulsyvibe-pro-hq-512/512/512';

  return {
    name: 'PulsyVibe | AI Powered Mood Curations',
    short_name: 'PulsyVibe',
    description: 'Sync your mood with the perfect playlist instantly.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#2a7c6f',
    icons: [
      {
        src: icon192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: icon512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: icon512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }
    ],
  };
}
