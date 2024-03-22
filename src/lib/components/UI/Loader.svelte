<script>
	import Icon from '../Icon.svelte';
</script>

<span class="loader">
	<Icon name="refresh" />
</span>

<style lang="scss">
	.loader {
		display: inline-block;

		line-height: 0;

		animation: {
			duration: 1s;
			name: SPIN;
			timing-function: var(--loader-easing, linear);
			iteration-count: infinite;
		}
	}

	@keyframes SPIN {
		to {
			transform: rotate(360deg);
		}
	}
</style>
