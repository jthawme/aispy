<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import TextLink from '../UI/TextLink.svelte';
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import { timer } from '$lib/utils.js';

	export let delay = 1000;

	const dispatch = createEventDispatcher();

	let mount = false;

	onMount(() => {
		if (browser) {
			mount = true;
		}
	});

	async function onTransitionEnd() {
		if (mount) {
			await timer(delay);
			mount = false;
		}
	}

	function onOutroEnd() {
		dispatch('end');
	}
</script>

{#if mount}
	<span
		in:fly={{ y: '100%' }}
		out:fly={{ y: '-100%' }}
		on:introend={onTransitionEnd}
		on:outroend={onOutroEnd}
	>
		<TextLink pill {...$$restProps}><slot /></TextLink>
	</span>
{/if}

<style lang="scss">
	span {
		display: block;
	}
</style>
