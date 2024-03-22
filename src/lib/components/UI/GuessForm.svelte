<script>
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';
	import TextLink from './TextLink.svelte';

	const dispatch = createEventDispatcher();

	/** @type {string} */
	export let prefix;

	/** @type {(answer: string) => Promise<void>}*/
	export let submit;

	export let disabled = false;

	$: value = prefix;

	function onInput(e) {
		value = e.target.value;

		if (!value.startsWith(prefix)) {
			value = `${prefix}${value}`;
		}
	}

	async function onSubmit(e) {
		await submit(value);
		value = prefix;
	}

	function onSkip() {
		dispatch('skip');
		value = prefix;
	}
</script>

<form on:submit|preventDefault={onSubmit}>
	<label>
		<input
			name="answer"
			{value}
			on:input={onInput}
			type="text"
			autocomplete="off"
			placeholder="Type..."
			{disabled}
		/>
	</label>

	<Button {disabled} expand>Guess</Button>

	<TextLink theme="light" type="button" on:click={onSkip}>Give up</TextLink>
</form>

<style lang="scss">
	form {
		display: flex;

		flex-direction: column;

		gap: 10px;

		width: 100%;

		label {
			display: block;

			margin: 0;
		}

		input {
			appearance: none;

			border: none;

			border-radius: 50px;

			background-color: var(--color-bg);

			width: 100%;

			padding: 8px 15px;
			font-size: var(--font-size-large);
			color: var(--color-text);

			outline: none;

			text-align: center;

			&:focus {
				background-color: transparent;
			}

			&::placeholder {
				color: var(--color-text-light);
			}
		}
	}
</style>
