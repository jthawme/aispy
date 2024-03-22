<script>
	/** @type {'cycle' | 'explode'} */
	export let name = 'explode';
</script>

<div class={`wrapper ${name}`}>
	<div class="box box-red" />
	<div class="box box-green" />
	<div class="box box-yellow" />
</div>

<style lang="scss">
	.wrapper {
		position: absolute;

		width: 100%;
		height: 100%;
	}

	.box {
		position: absolute;

		top: 50%;
		left: 50%;

		transform: translate3d(-50%, -100%, 0) rotate(-45deg);

		width: 70%;
		aspect-ratio: 1 / 1;

		border-style: solid;
		border-width: 1px;

		opacity: 0.5;

		&-red {
			border-color: var(--color-red);
		}

		&-green {
			border-color: var(--color-green);
		}

		&-yellow {
			border-color: var(--color-yellow);
		}
	}

	.cycle .box {
		animation: {
			name: CYCLE;
			iteration-count: infinite;
			duration: 1.5s;
			direction: alternate;
			timing-function: ease-in-out;
		}

		&-red {
			border-color: var(--color-red);
			animation-delay: 0.5s;
		}

		&-green {
			border-color: var(--color-green);
			animation-delay: 1s;
		}

		&-yellow {
			border-color: var(--color-yellow);
			animation-delay: 1.5s;
		}
	}

	@keyframes CYCLE {
		from {
			transform: translate3d(-50%, -100%, 0) rotate(-45deg);
		}

		to {
			transform: translate3d(-50%, 0%, 0) rotate(-45deg);
		}
	}

	.explode .box {
		animation: {
			name: EXPLODE;
			iteration-count: infinite;
			duration: 3s;
			timing-function: ease-in-out;
		}

		&-red {
			width: 100%;
			border-color: var(--color-red);
			animation-delay: 0.1s;
			--box-rotate: 45deg;
		}

		&-green {
			width: 70.5%;
			border-color: var(--color-green);
			animation-delay: 0.2s;
		}

		&-yellow {
			width: 50%;
			border-color: var(--color-yellow);
			animation-delay: 0.3s;
			--box-rotate: 45deg;
		}
	}

	@keyframes EXPLODE {
		from {
			opacity: 0;
			transform: translate3d(-50%, -50%, 0) scale(0) rotate(var(--box-rotate, 0deg));
		}

		20%,
		95% {
			opacity: 1;
			transform: translate3d(-50%, -50%, 0) scale(1) rotate(var(--box-rotate, 0deg));
		}

		100% {
			opacity: 0;
			transform: translate3d(-50%, -50%, 0) scale(1.1) rotate(var(--box-rotate, 0deg));
		}
	}
</style>
