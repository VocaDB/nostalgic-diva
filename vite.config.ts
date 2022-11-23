import pkg from './package.json' assert { type: 'json' };
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
	plugins: [
		dts({
			insertTypesEntry: true,
		}),
		react({
			jsxRuntime: 'classic',
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			formats: [
				'es',
				'cjs',
			],
			fileName: (format) => `index.${format}.js`,
		},
		rollupOptions: {
			external: [
				...Object.keys(pkg.peerDependencies ?? []),
				...Object.keys(pkg.dependencies ?? []),
			],
		},
		sourcemap: true,
	},
});
