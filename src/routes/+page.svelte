<script>
	import { pushState } from '$app/navigation';
	import ContentBox from '$lib/components/Compound/ContentBox.svelte';
	import Button from '$lib/components/UI/Button.svelte';
	import TextLink from '$lib/components/UI/TextLink.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let descriptions = [
		'Play single player <em class="color-yellow">I Spy</em>',
		'Find new <em class="color-red">passions</em> for life',
		'Discover whats <em class="color-green">inside</em> you',
		'Unlock the <em class="color-yellow">secrets</em> of life',
		'Never need <em class="color-red">friends</em> again'
	];

	let index = 0;

	let timer;

	$: description = descriptions[index];

	function nextDescription() {
		timer = setTimeout(() => {
			index = Math.floor(Math.random() * descriptions.length);
			nextDescription();
		}, 2000);
	}

	function onAboutClick(e) {
		e.preventDefault();

		pushState(e.currentTarget.href, {
			aside: true
		});
	}

	onMount(() => {
		nextDescription();

		return () => {
			clearTimeout(timer);
		};
	});
</script>

<div class="content">
	<p class="lead">
		<span>Take <em class="color-green">photos</em> around you</span>
		<span class="switcher">
			{#key description}
				<span in:fly={{ y: '100%' }} out:fly={{ y: '-100%' }}>{@html description}</span>
			{/key}
		</span>
	</p>

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

	.lead {
		padding: var(--inner-padding) calc(var(--inner-padding) * 2);
		font-size: 6vw;

		display: flex;

		flex-direction: column;

		> span {
			display: block;

			&:nth-child(2) {
				align-self: flex-end;
				text-align: right;
			}
		}
	}

	.switcher {
		display: grid !important;

		> span {
			display: block;
			grid-column: 1 / -1;
			grid-row: 1;
		}
	}
</style>
