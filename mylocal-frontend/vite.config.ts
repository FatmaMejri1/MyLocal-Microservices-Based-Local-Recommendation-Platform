import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api/users': {
                target: 'http://localhost:8001',
                changeOrigin: true,
                rewrite: (path) => {
                    // Rewrite /api/users to /api/users (Symfony controller route)
                    // The controller is already at /api/users, so just pass through
                    return path;
                }
            },
            '/api/content': {
                target: 'http://localhost:8002',
                changeOrigin: true,
                rewrite: (path) => {
                    // Rewrite /api/content/places to /api/places
                    // API Platform uses /api prefix, so we remove /content
                    return path.replace(/^\/api\/content/, '/api');
                }
            },
            '/api/media': {
                target: 'http://localhost:8003',
                changeOrigin: true,
                rewrite: (path) => {
                    // Rewrite /api/media/upload to /api/photos
                    // Rewrite /api/media/photos to /api/photos
                    // PhotoController uses /api/photos route
                    if (path.includes('/upload')) {
                        return '/api/photos';
                    }
                    return path.replace(/^\/api\/media/, '/api');
                }
            }
        }
    }
})
