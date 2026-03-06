import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// Plugin that injects preload for the first hero image and defers non-critical CSS
function buildOptimizationPlugin(): Plugin {
    let heroImagePath = '';
    return {
        name: 'build-optimization',
        generateBundle(_options, bundle) {
            for (const fileName of Object.keys(bundle)) {
                if (fileName.includes('Prima-pagina-foto-2') && fileName.endsWith('.webp')) {
                    heroImagePath = '/' + fileName;
                    break;
                }
            }
        },
        transformIndexHtml(html) {
            // Inject hero image preload
            if (heroImagePath) {
                const preloadTag = `<link rel="preload" as="image" type="image/webp" href="${heroImagePath}" fetchpriority="high">`;
                html = html.replace('</head>', `  ${preloadTag}\n</head>`);
            }
            // Make non-critical CSS (lightbox) non-blocking using media="print" trick
            html = html.replace(
                /(<link rel="stylesheet" crossorigin href="([^"]*lightbox[^"]*\.css)">)/g,
                '<link rel="stylesheet" crossorigin href="$2" media="print" onload="this.media=\'all\'">'
            );
            return html;
        },
    };
}

export default defineConfig({
    plugins: [react(), tsconfigPaths(), buildOptimizationPlugin()],
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
                    if (id.includes('yet-another-react-lightbox')) return 'lightbox';
                    if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'forms';
                    if (id.includes('react-phone-number-input')) return 'phone-input';
                },
            },
        },
    },
});
