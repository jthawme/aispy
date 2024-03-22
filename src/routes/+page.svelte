<script>
	import { pushState } from '$app/navigation';
	import ContentBox from '$lib/components/Compound/ContentBox.svelte';
	import Button from '$lib/components/UI/Button.svelte';
	import TextLink from '$lib/components/UI/TextLink.svelte';

	function onAboutClick(e) {
		e.preventDefault();

		pushState(e.currentTarget.href, {
			aside: true
		});
	}
</script>

<div class="content">
	<ContentBox headerAlign="space">
		<svelte:fragment slot="header">
			<span>High Score: 0</span>
			<TextLink>Welcome back</TextLink>
		</svelte:fragment>

		<Button to="/game" expand>Play</Button>

		<TextLink slot="below" on:click={onAboutClick}>Play what?</TextLink>
	</ContentBox>
</div>

<style lang="scss">
	.content {
		margin: auto;

		width: 100%;
	}
</style>
