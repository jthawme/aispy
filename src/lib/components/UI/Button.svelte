<script>
	import Icon from '../Icon.svelte';
	import { icons } from '../icons.js';

	/** @type {null | string} */
	export let to = null;

	export let theme = 'standard';
	export let size = 'standard';

	export let reverse = false;
	export let expand = false;
	export let disabled = false;

	export let dummy = false;

	/** @type {keyof icons | null}*/
	export let icon = null;

	/**
	 *
	 * @param {string | null} t
	 * @param {boolean} d
	 */
	function getTag(t, d) {
		if (d) {
			return 'span';
		}

		if (t) {
			return 'a';
		}

		return 'button';
	}

	$: tag = getTag(to, dummy);
	$: tagProps = to
		? {
				href: to
			}
		: {};
</script>

<svelte:element
	this={tag}
	class={`button btn-reset theme-${theme} size-${size}`}
	class:reverse
	class:expand
	class:disabled
	{disabled}
	role={tag === 'button' ? 'button' : 'link'}
	tabindex="0"
	on:click
	{...tagProps}
	{...$$restProps}
>
	<span class="button-inner">
		{#if icon}
			<span class="button-icon">
				<Icon name={icon} />
			</span>
		{/if}

		<slot />
	</span>
</svelte:element>

<style lang="scss">
	.button {
		display: inline-flex;
		justify-content: center;

		text-decoration: none;

		background-color: var(--button-bg, var(--internal-button-bg));
		color: var(--button-fg, var(--internal-button-fg));

		font-size: var(--button-font-size, var(--internal-button-font-size, inherit));

		border-radius: 50px;

		margin: var(--button-margin, var(--internal-button-margin));

		width: var(--button-width, var(--internal-button-width, auto));

		vertical-align: middle;

		&-inner {
			display: inline-flex;

			align-items: center;

			gap: 0.4em;

			padding: var(--button-padding, var(--internal-button-padding, 0.35em 1em 0.4em));
			line-height: 1;

			.reverse & {
				flex-direction: row-reverse;
			}
		}

		&-icon {
			display: flex;
		}

		@include hover(':not(.disabled):not(:active)') {
			--internal-button-bg: var(--internal-button-bg-hover);
			--internal-button-fg: var(--internal-button-fg-hover);
		}

		&.disabled {
			--internal-button-bg: var(--internal-button-bg-disabled);
			--internal-button-fg: var(--internal-button-fg-disabled);
		}

		&:not(.disabled):active {
			--internal-button-bg: var(--internal-button-bg-active);
			--internal-button-fg: var(--internal-button-fg-active);
		}
	}

	.expand {
		--internal-button-width: 100%;
	}

	.theme-standard {
		--internal-button-bg: var(--color-blue);
		--internal-button-fg: var(--color-white);
		--internal-button-bg-hover: var(--color-text);
		--internal-button-fg-hover: var(--color-white);
		--internal-button-bg-active: var(--color-green);
		--internal-button-fg-active: var(--color-white);
		--internal-button-bg-disabled: var(--color-text-light);
		--internal-button-fg-disabled: var(--color-white);
	}

	.size-standard {
		--internal-button-font-size: var(--font-size-large);
	}
</style>
