<script>
	import Icon from '../Icon.svelte';
	import { icons } from '../icons.js';

	/** @type {null | string} */
	export let to = null;

	export let theme = 'standard';
	export let size = 'standard';

	export let reverse = false;
	export let pill = false;

	/** @type {keyof icons | null}*/
	export let icon = null;

	$: tag = to ? 'a' : 'button';
	$: tagProps = to
		? {
				href: to,
				target: to.startsWith('http') ? '_blank' : undefined
			}
		: {};
</script>

<svelte:element
	this={tag}
	class={`button btn-reset std theme-${theme} size-${size}`}
	class:reverse
	class:pill
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
		color: var(--text-link-color, var(--internal-text-link-color));

		font-size: var(--text-link-font-size, var(--internal-text-link-font-size, inherit));

		margin: var(--text-link-margin, var(--internal-text-link-margin));

		width: var(--text-link-width, var(--internal-text-link-width, auto));

		vertical-align: middle;

		&-inner {
			display: inline-flex;

			align-items: center;

			gap: 0.4em;

			padding: var(--text-link-padding, var(--internal-text-link-padding));
			line-height: 1;

			.reverse & {
				flex-direction: row-reverse;
			}
		}

		&-icon {
			display: flex;
		}
	}

	.pill {
		border: 2px solid currentColor;
		border-radius: 20px;

		--internal-text-link-padding: 0.2em 0.6em;
	}

	.theme-standard {
		--internal-text-link-color: inherit;
	}

	.theme-red {
		--internal-text-link-color: var(--color-red);
	}

	.theme-green {
		--internal-text-link-color: var(--color-green);
	}

	.theme-yellow {
		--internal-text-link-color: var(--color-yellow);
	}

	.theme-light {
		--internal-text-link-color: var(--color-text-light);
	}

	.theme-white {
		--internal-text-link-color: var(--color-white);
	}

	.size-standard {
		--internal-text-link-font-size: var(--font-size-small);
	}

	.size-medium {
		--internal-text-link-font-size: var(--font-size-normal);
	}
</style>
