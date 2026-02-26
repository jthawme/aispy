import { sveltekit } from '@sveltejs/kit/vite';
import svg from '@poppanator/sveltekit-svg';
import { defineConfig } from 'vite';
import BuildManifest from './tools/BuildManifest.js';

export default defineConfig({
	plugins: [
		sveltekit(),
		svg({
			includePaths: ['./src/lib/icons/'],
			svgoOptions: {
				multipass: true,
				plugins: [
					{
						name: 'preset-default'
					},
					{
						name: 'convertColors',
						params: {
							currentColor: true
						}
					},
					{ name: 'removeAttrs', params: { attrs: '(width|height)' } }
				]
			}
		}),
		svg({
			includePaths: ['./src/lib/assets/'],
			svgoOptions: {
				multipass: true,
				plugins: [
					{
						name: 'preset-default'
					},
					{ name: 'removeAttrs', params: { attrs: '(width|height)' } }
				]
			}
		}),
		BuildManifest({
			manifest: {
				name: 'AI Spy',
				short_name: 'AI Spy'
			}
		})
	],
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern',
				additionalData: `@use '$lib/styles/parts/mixins' as *;`
			}
		}
	}
});
