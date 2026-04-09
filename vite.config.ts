import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin that injects preload for the first hero image, defers non-critical CSS,
// and removes modulepreload for heavy lazy chunks (maplibre, supabase, pdfjs)
function buildOptimizationPlugin(): Plugin {
    let heroImageDesktop = '';
    let heroImageMobile = '';
    return {
        name: 'build-optimization',
        generateBundle(_options, bundle) {
            for (const fileName of Object.keys(bundle)) {
                if (fileName.includes('Prima-pagina-foto-2-mobile') && fileName.endsWith('.webp')) {
                    heroImageMobile = '/assets/' + fileName.replace('assets/', '');
                }
                if (fileName.includes('Prima-pagina-foto-2') && !fileName.includes('mobile') && fileName.endsWith('.webp')) {
                    heroImageDesktop = '/assets/' + fileName.replace('assets/', '');
                }
            }
        },
        transformIndexHtml(html) {
            // Inject responsive hero image preload (mobile gets smaller file)
            const preloads: string[] = [];
            if (heroImageMobile) {
                preloads.push(`<link rel="preload" as="image" type="image/webp" href="${heroImageMobile}" media="(max-width: 767px)" fetchpriority="high">`);
            }
            if (heroImageDesktop) {
                preloads.push(`<link rel="preload" as="image" type="image/webp" href="${heroImageDesktop}" media="(min-width: 768px)" fetchpriority="high">`);
            }
            if (preloads.length > 0) {
                html = html.replace('</head>', `  ${preloads.join('\n  ')}\n</head>`);
            }
            // Make non-critical CSS non-blocking using media="print" trick
            html = html.replace(
                /(<link rel="stylesheet" crossorigin href="([^"]*(?:lightbox|CertificationsPage)[^"]*\.css)">)/g,
                '<link rel="stylesheet" crossorigin href="$2" media="print" onload="this.media=\'all\'">'
            );
            // Remove modulepreload for heavy lazy chunks — browser will load them on demand
            // This saves unnecessary downloads on initial page load
            html = html.replace(
                /<link rel="modulepreload" crossorigin href="[^"]*(?:maplibre|react-map|supabase|pdf-core|react-pdf)[^"]*\.js">\n?/g,
                ''
            );
            return html;
        },
    };
}

export default defineConfig({
    plugins: [react(), buildOptimizationPlugin()],
    resolve: {
        tsconfigPaths: true,
    },
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
                    if (id.includes('pdfjs-dist')) return 'pdf-core';
                    if (id.includes('react-pdf')) return 'react-pdf';
                    if (id.includes('maplibre-gl')) return 'maplibre-core';
                    if (id.includes('react-map-gl')) return 'react-map';
                    if (id.includes('@supabase')) return 'supabase';
                    if (id.includes('yet-another-react-lightbox')) return 'lightbox';
                    if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'forms';
                    if (id.includes('react-phone-number-input')) return 'phone-input';
                    if (id.includes('gsap') || id.includes('lenis')) return 'motion';
                },
            },
        },
    },
});
