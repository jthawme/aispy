<script>
	import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';

	const game = getContext('game');

	onMount(() => {
		game.reset();

		goto('/game/begin', {
			replaceState: true
		});
	});
</script>
