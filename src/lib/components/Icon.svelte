<script>
	import { icons } from './icons.js';

	/** @type {keyof icons}*/
	export let name;

	$: icon = icons[name];
</script>

<span class="icon">
	<svelte:component this={icon} />
</span>

<style lang="scss">
	.icon {
		display: inline-flex;

		width: var(--icon-size, 1em);
		height: var(--icon-size, 1em);

		line-height: 1;
	}
</style>
