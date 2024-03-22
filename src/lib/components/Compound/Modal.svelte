<script>
	import { createEventDispatcher } from 'svelte';

	export let open = false;

	/** @type {HTMLDialogElement | null} */
	let dialogEl = null;

	function toggleDialog(_open) {
		if (_open) {
			dialogEl?.showModal();
		} else {
			dialogEl?.close();
		}
	}

	$: toggleDialog(open);
</script>

<dialog bind:this={dialogEl} on:close>
	<slot />
</dialog>

<style lang="scss">
	dialog {
		display: none;

		border: none;
		padding: 0;
		margin: auto;

		background-color: transparent;
	}

	dialog[open] {
		display: flex;
	}

	dialog::backdrop {
		background-color: rgba(var(--color-blue-rgb), 0);
	}

	dialog[open]::backdrop {
		background-color: rgba(var(--color-blue-rgb), 0.85);
	}
</style>
