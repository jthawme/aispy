<script>
	import { onMount } from 'svelte';

	import '$lib/styles/global.scss';
	import Head from '$lib/components/Head.svelte';
	import FooterLinks from '$lib/components/Compound/FooterLinks.svelte';
	import { page } from '$app/stores';
	import Logo from '$lib/components/UI/Logo.svelte';
	import Animation from '$lib/components/Animation.svelte';
	import AboutContent from '$lib/components/AboutContent.svelte';
	import TextLink from '$lib/components/UI/TextLink.svelte';
	import { fade } from 'svelte/transition';
	import { onNavigate } from '$app/navigation';

	/** @type {import('./$types').LayoutData} */
	export let data;

	async function checkServiceWorker() {
		const registration = await navigator.serviceWorker.getRegistration();

		if (registration) {
			registration.addEventListener('updatefound', () => {
				console.log('Service Worker update found!');
			});
		}
	}

	onMount(() => {
		checkServiceWorker();
	});

	function onReturn() {
		history.back();
	}

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	$: asideOpen = $page.state.aside;
	$: inGame =
		$page.url.pathname.startsWith('/game/begin') || $page.url.pathname.startsWith('/game/play');
	$: explodeAnimation = $page.url.pathname.includes('/game/results');
</script>

<Head />

<svelte:head>
	<script defer data-domain="aispy.io" src="https://plausible.io/js/script.js"></script>
</svelte:head>

<aside class:asideOpen>
	<div class="close">
		<TextLink icon="x" theme="red" on:click={onReturn}>Close</TextLink>
	</div>

	<AboutContent>
		<div class="aside-logo"><Logo /></div>
	</AboutContent>
</aside>

<div class="backdrop" class:asideOpen />

<main class:asideOpen class:inGame>
	<div class="logo">
		<Logo />
	</div>

	{#if asideOpen}
		<button transition:fade class="btn-reset click-back" on:click={onReturn} />
	{/if}

	<div class="animation-wrap">
		{#key explodeAnimation}
			{#if explodeAnimation}
				<div in:fade={{ delay: 500 }} out:fade class="animation">
					<Animation name="explode" />
				</div>
			{:else}
				<div in:fade={{ delay: 500 }} out:fade class="animation">
					<Animation name="cycle" />
				</div>
			{/if}
		{/key}
	</div>

	<div class="content">
		<slot />
	</div>

	<footer>
		<FooterLinks />
	</footer>
</main>

<style lang="scss">
	main,
	aside {
		will-change: transform;

		transition: {
			duration: 0.5s;
			timing-function: var(--standard-easing);
		}
	}

	main {
		position: relative;

		min-height: 100dvh;

		display: flex;

		flex-direction: column;

		&.asideOpen {
			transform: translateX(calc(100vw - var(--inner-padding)));

			@include large-mobile {
				transform: none;
			}
		}
	}

	.logo {
		position: relative;
		z-index: 2;

		margin: var(--outer-padding);

		display: flex;

		width: calc(100% - (2 * var(--outer-padding)));

		transition: {
			duration: 0.35s;
			timing-function: var(--standard-easing);
			property: width, transform;
		}

		:global(a) {
			flex-grow: 1;
		}

		.inGame & {
			width: 160px;
		}

		@include large-mobile {
			position: fixed;

			top: var(--inner-padding);
			left: 50%;

			transform: translate3d(-50%, 0, 0);

			width: 250px;

			z-index: 5;

			.inGame & {
				width: 100px;

				transform: translate3d(-50%, calc(var(--outer-padding) * -1), 0);
			}
		}
	}

	.content {
		position: relative;

		display: flex;

		flex-grow: 1;

		z-index: 2;
	}

	footer {
		position: fixed;

		bottom: 0;
		left: 50%;

		width: 100%;
		max-width: 500px;

		transform: translateX(-50%);

		z-index: 5;
	}

	.click-back {
		position: fixed;

		top: 0;
		right: 0;
		bottom: 0;
		left: 0;

		width: 100%;
		height: 100%;

		z-index: 100;
		-webkit-tap-highlight-color: transparent;

		@include large-mobile {
			z-index: 10;
			background-color: rgba(255, 255, 255, 0.8);
		}
	}

	aside {
		position: fixed;

		top: 0;
		left: 0;

		width: calc(100vw - var(--inner-padding));
		height: 100dvh;

		background-color: var(--color-white);

		transform: translateX(-100%);

		display: flex;

		:global(> *) {
			margin: auto 0;
		}

		.close {
			position: absolute;

			top: var(--outer-padding);
			right: var(--outer-padding);
		}

		&.asideOpen {
			transform: translateX(0);
		}

		@include large-mobile {
			transition-property: opacity, visibility;

			opacity: 0;
			visibility: hidden;

			max-width: 500px;
			height: auto;

			top: 50%;
			left: 50%;

			z-index: 10;

			transform: translate3d(-50%, -50%, 0);

			border-radius: 20px;
			border: 1px solid var(--color-blue);

			&.asideOpen {
				opacity: 1;
				visibility: visible;
				transform: translate3d(-50%, -50%, 0);
			}
		}
	}

	.aside-logo {
		width: 120px;

		margin: 0 0 1em;
	}

	.animation {
		position: absolute;

		inset: 50px;

		z-index: 1;

		pointer-events: none;

		&-wrap {
			position: fixed;

			z-index: 1;

			inset: 0;
			overflow: hidden;
		}
	}
</style>
