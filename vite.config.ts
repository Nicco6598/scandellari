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
    },
    build: {
        outDir: 'build',
    },
});
