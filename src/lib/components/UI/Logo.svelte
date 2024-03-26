<script>
	import LogoSvg from '$lib/assets/logo.svg?component';
</script>

<a href="/" aria-label="AI Spy">
	<LogoSvg />
</a>

<style lang="scss">
	a {
		display: block;

		text-decoration: none;

		line-height: 1;

		:global(path:nth-child(1)) {
			fill: var(--logo-color-1, var(--color-blue));
		}

		:global(path:nth-child(2)) {
			fill: var(--logo-color-2, var(--color-red));
		}

		:global(path:nth-child(3)) {
			fill: var(--logo-color-3, var(--color-green));
		}

		:global(path:nth-child(4)) {
			fill: var(--logo-color-4, var(--color-yellow));
		}

		@include hover {
			--logo-color-1: var(--color-yellow);
			--logo-color-2: var(--color-blue);
			--logo-color-3: var(--color-red);
			--logo-color-4: var(--color-green);
		}
	}
</style>
