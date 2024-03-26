<script>
	import { pushState } from '$app/navigation';
	import ContentBox from '$lib/components/Compound/ContentBox.svelte';
	import Button from '$lib/components/UI/Button.svelte';
	import TextLink from '$lib/components/UI/TextLink.svelte';
	import { STORAGE } from '$lib/constants.js';
	import { getPersistedValue } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	/**
	 * @type {number}
	 *
	 * This is populated via local storage on subsequent visits
	 */
	let highScore = 0;

	/**
	 * @type {string[]}
	 *
	 * A list of descriptions to cycle through
	 */
	let descriptions = [
		'Play single player <em class="color-yellow">I Spy</em>',
		'Find new <em class="color-red">passions</em> for life',
		'Discover whats <em class="color-green">inside</em> you',
		'Unlock the <em class="color-yellow">secrets</em> of life',
		'Never need <em class="color-red">friends</em> again'
	];

	/**
	 * @type {number}
	 *
	 * An index for which description to use
	 */
	let descriptionIndex = 0;

	/** @type {ReturnType<setTimeout>} */
	let timer;

	/**
	 * @type {string}
	 *
	 * The current description phrase to display
	 */
	$: description = descriptions[descriptionIndex];

	function nextDescription(initial = false) {
		timer = setTimeout(
			() => {
				descriptionIndex = Math.floor(Math.random() * descriptions.length);
				nextDescription();
			},
			initial ? 5000 : 2000
		);
	}

	function onAboutClick(e) {
		e.preventDefault();

		pushState(e.currentTarget.href, {
			aside: true
		});
	}

	onMount(() => {
		nextDescription(true);

		// Get a possible high score from
		highScore = getPersistedValue(STORAGE.HIGH_SCORE, 0, (v) => parseInt(v));

		return () => {
			clearTimeout(timer);
		};
	});
</script>

<svelte:head>
	<title>AI Spy</title>
</svelte:head>

<div class="content">
	<p class="lead">
		<span>Take <em class="color-green">photos</em> around you</span>
		<span class="switcher">
			{#key description}
				<span in:fly={{ y: '100%' }} out:fly={{ y: '-100%' }}>{@html description}</span>
			{/key}
		</span>
	</p>

	<div class="box">
		<ContentBox headerAlign="space">
			<svelte:fragment slot="header">
				<span>High Score: {highScore}</span>
				<TextLink>Welcome back</TextLink>
			</svelte:fragment>

			<Button to="/game" expand>Play</Button>

			<TextLink slot="below" to="/about" on:click={onAboutClick}>Play what?</TextLink>
		</ContentBox>
	</div>
</div>

<style lang="scss">
	.content {
		margin: auto;

		width: 100%;

		@include large-mobile {
			display: flex;

			flex-direction: column;

			align-items: center;

			padding-top: 2em;
		}
	}

	.lead {
		padding: 0 calc(var(--inner-padding) * 2) var(--inner-padding);
		margin-top: 0;

		font-size: Min(6vw, 48px);

		display: flex;

		flex-direction: column;

		width: 100%;

		> span {
			display: block;

			&:nth-child(2) {
				align-self: flex-end;
				text-align: right;
			}
		}

		@include large-mobile {
			margin: 0;
			max-width: 900px;
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

	.box {
		@include large-mobile {
			max-width: 300px;
			width: 100%;
		}
	}
</style>
