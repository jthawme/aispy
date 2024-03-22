<script>
	import { onMount } from 'svelte';

	import '$lib/styles/global.scss';
	import Head from '$lib/components/Head.svelte';
	import FooterLinks from '$lib/components/Compound/FooterLinks.svelte';
	import { page } from '$app/stores';
	import Logo from '$lib/components/UI/Logo.svelte';
	import Animation from '$lib/components/Animation.svelte';
	import AboutPage from './about/+page.svelte';
	import TextLink from '$lib/components/UI/TextLink.svelte';
	import { fade } from 'svelte/transition';

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

	$: asideOpen = $page.state.aside;
	$: inGame =
		$page.url.pathname.startsWith('/game/begin') || $page.url.pathname.startsWith('/game/play');
	$: explodeAnimation = $page.url.pathname.includes('/game/results');
</script>

<Head />

<aside class:asideOpen>
	<div class="close">
		<TextLink icon="x" theme="red" on:click={onReturn}>Close</TextLink>
	</div>

	<AboutPage>
		<div class="aside-logo"><Logo /></div>
	</AboutPage>
</aside>

<main class:asideOpen class:inGame>
	<div class="logo">
		<Logo />
	</div>

	{#if asideOpen}
		<button class="btn-reset click-back" on:click={onReturn} />
	{/if}

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
			property: width;
		}

		:global(a) {
			flex-grow: 1;
		}

		.inGame & {
			width: 160px;
		}

		@include tablet {
			position: fixed;

			top: var(--inner-padding);
			left: 50%;

			transform: translate3d(-50%, 0, 0);

			width: 250px;
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
		left: 0;

		width: 100%;

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
	}

	.aside-logo {
		width: 120px;

		margin: 0 0 1em;
	}

	.animation {
		position: fixed;

		inset: 50px;

		z-index: 1;

		pointer-events: none;
	}
</style>
