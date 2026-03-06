import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    define: {
        'process.env': {},
        'global': 'window',
    },
    envPrefix: ['VITE_', 'REACT_APP_'],
    server: {
        port: 3000,
        open: true,
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        },
    },
    build: {
        outDir: 'build',
        // Target modern browsers for smaller output
        target: 'es2020',
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Increase chunk warning limit (maplibre-gl is intentionally large)
        chunkSizeWarningLimit: 1100,
        rollupOptions: {
            output: {
                // Manual chunk splitting to separate heavy vendor libs
                manualChunks: (id) => {
                    // Isola solo le librerie "foglia" senza dipendenze incrociate verso React
                    // per evitare circular chunk che causano errori runtime
                    if (id.includes('pdfjs-dist')) return 'pdfjs';
                    if (id.includes('maplibre-gl') || id.includes('react-map-gl')) return 'maplibre';
                    if (id.includes('@supabase')) return 'supabase';
                },
            },
        },
    },
});
