<script>
	/** @type {'center' | 'space' | 'end'} */
	export let headerAlign = 'center';

	/** @type {'center' | 'space' | 'end'} */
	export let footerAlign = 'center';
</script>

<div class={`wrapper header-${headerAlign} footer-${footerAlign}`}>
	{#if $$slots.above}
		<div class="above">
			<slot name="above" />
		</div>
	{/if}
	<section class="box">
		{#if $$slots.header}
			<header class="color-text-light box-header">
				<slot name="header" />
			</header>
		{/if}

		<div class="box-content">
			<slot />
		</div>

		{#if $$slots.footer}
			<footer class="color-text-light box-footer">
				<slot name="footer" />
			</footer>
		{/if}
	</section>
	{#if $$slots.below}
		<div class="below">
			<slot name="below" />
		</div>
	{/if}
</div>

<style lang="scss">
	.wrapper {
		display: flex;

		flex-direction: column;

		gap: 10px;

		margin: var(--outer-padding);
	}

	.box {
		background-color: var(--color-white);
		border-radius: 20px;

		display: flex;

		flex-direction: column;

		gap: 10px;

		padding: 15px 10px;

		&-header,
		&-footer {
			display: flex;

			align-items: center;

			padding: 0 10px;

			font-size: var(--font-size-small);
		}

		&-header {
			justify-content: var(--header-section-justify, center);
		}

		&-footer {
			justify-content: var(--footer-section-justify, center);
		}
	}

	.header-space {
		--header-section-justify: space-between;
	}

	.header-end {
		--header-section-justify: flex-end;
	}

	.footer-space {
		--footer-section-justify: space-between;
	}

	.footer-end {
		--footer-section-justify: flex-end;
	}

	.below,
	.above {
		display: flex;

		justify-content: center;
	}
</style>
