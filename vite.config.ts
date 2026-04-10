import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin that injects preload for the first hero image, defers non-critical CSS,
// and removes modulepreload for heavy lazy chunks (maplibre, supabase, pdfjs)
function buildOptimizationPlugin(): Plugin {
    let heroImageDesktop = '';
    let heroImageMobile = '';
    return {
        name: 'build-optimization',
        enforce: 'post',
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
        transformIndexHtml: {
            order: 'post',
            handler(html) {
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
                // Remove non-critical modulepreloads that are only needed for admin/forms/lightbox flows.
                html = html.replace(
                    /\s*<link rel="modulepreload" crossorigin href="[^"]*(?:forms|lightbox|AuthContext)[^"]*">\s*/g,
                    '\n'
                );
                return html;
            },
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
        modulePreload: {
            resolveDependencies: (_url, deps) =>
                deps.filter(
                    (dep) =>
                        !/(?:maplibre|react-map|supabase|pdf-core|react-pdf|motion|lenis|gsap|ScrollTrigger)/.test(dep)
                ),
        },
        // Target modern browsers for smaller output
        target: 'es2020',
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Increase chunk warning limit (maplibre-gl is intentionally large)
        chunkSizeWarningLimit: 1100,
        rollupOptions: {
            output: {
                // Keep only truly cross-route libraries in named chunks.
                // Route-local heavy libs like maplibre/pdfjs/gsap/supabase are
                // better left to Vite so they stay attached to the lazy routes
                // that actually need them.
                manualChunks: (id) => {
                    if (id.includes('yet-another-react-lightbox')) return 'lightbox';
                    if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'forms';
                    if (id.includes('react-phone-number-input')) return 'phone-input';
                },
            },
        },
    },
});
