<script>
	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import TextLink from '../UI/TextLink.svelte';

	function onAboutClick(e) {
		e.preventDefault();

		pushState(e.currentTarget.href, {
			aside: true
		});
	}

	$: shareText = `Finally, a game of I Spy I can play with no friends. AI Spy - single player`;
	$: shareUrl = `https://twitter.com/intent/tweet?url=${$page.url.origin}&text=${shareText}&related=jthawme`;

	function onShare(e) {
		if ('share' in navigator) {
			e.preventDefault();

			navigator.share({
				title: 'AI Spy',
				url: $page.url.origin,
				text: shareText
			});
		}
	}
</script>

<div class="links">
	{#if $page.url.pathname.startsWith('/about')}
		<TextLink theme="light" to="/">Home</TextLink>
	{:else}
		<TextLink theme="light" to="/about" on:click={onAboutClick}>Information</TextLink>
	{/if}

	<TextLink theme="light" to="https://jthaw.me?ref=aispy"
		>Made by <span class="color-red">JT</span></TextLink
	>

	<TextLink to={shareUrl} theme="light" icon="share" reverse on:click={onShare}>Share</TextLink>
</div>

<style lang="scss">
	.links {
		display: flex;

		align-items: center;
		justify-content: space-between;

		padding: 0 var(--inner-padding) var(--outer-padding);
	}
</style>
