<script>
	import { getContext, onMount } from 'svelte';
	import ContentBox from '$lib/components/Compound/ContentBox.svelte';
	import Button from '$lib/components/UI/Button.svelte';
	import TextLink from '$lib/components/UI/TextLink.svelte';
	import { clamp, doubleRaf, getPersistedValue, persistValue } from '$lib/utils.js';
	import { STARTING_SCORE, STORAGE } from '$lib/constants.js';

	const game = getContext('game');

	let mount = false;
	let highScore = false;

	const text = [
		{
			title: 'Uh Oh',
			tweet: `Which btw is terrible`,
			description: 'Wow, that was really bad'
		},
		{
			title: "Okay, okay, let's go",
			tweet: `I'll get it next time`,
			description: 'You did pretty good against a computer!'
		},
		{
			title: 'Congrats',
			tweet: `Wow thats pretty good`,
			description: 'You can identify things that are around you!'
		}
	];

	/**
	 *
	 * @param {number} total
	 * @param {number} images
	 */
	const getScoreBarrier = (total, images) => {
		const perc = total / (STARTING_SCORE * images);

		if (perc < 0.05) {
			return 0;
		} else if (perc > 0.95) {
			return 2;
		} else {
			return 1;
		}
	};

	$: textIndex = getScoreBarrier($game.total, $game.images.length);

	$: shareText = `I scored ${$game.total} at single player AI Spy. ${text[textIndex].tweet}`;
	$: shareUrl = `https://twitter.com/intent/tweet?url=${window.location.origin}&text=${shareText}&related=jthawme`;

	function onShare(e) {
		if ('share' in navigator) {
			e.preventDefault();

			navigator.share({
				title: 'AI Spy',
				url: window.location.origin,
				text: shareText
			});
		}
	}

	onMount(async () => {
		const previous = getPersistedValue(STORAGE.HIGH_SCORE, 0, (v) => parseInt(v));

		if (previous < $game.total) {
			highScore = true;
			persistValue(STORAGE.HIGH_SCORE, $game.total);
		}

		await doubleRaf();

		mount = true;
	});
</script>

<svelte:head>
	<title>Results – AI Spy</title>
</svelte:head>

<div class="content" class:mount>
	<div class="score">
		<span class="score-top">{text[textIndex].title}</span>
		<span class="score-value">{$game.total}</span>
		{#if highScore}
			<span class="score-bottom">
				<span>New</span>
				<span>High</span>
				<span>Score</span>
			</span>
		{/if}
	</div>

	<span class="box">
		<ContentBox>
			<svelte:fragment slot="header">
				<span>{text[textIndex].description}</span>
			</svelte:fragment>

			<Button to="/game" expand>Play again!</Button>

			<TextLink to={shareUrl} slot="below" on:click={onShare}>Share your result</TextLink>
		</ContentBox>
	</span>
</div>

<style lang="scss">
	.content {
		margin: auto;

		width: 100%;

		@include large-mobile {
			display: flex;

			flex-direction: column;

			align-items: center;
		}
	}

	.score-top,
	.score-value,
	.score-bottom,
	.box {
		opacity: 0;

		transition: {
			duration: 1s;
			property: opacity;
		}
	}

	.box {
		width: 100%;
		transition-delay: 4s;

		@include large-mobile {
			max-width: 300px;
		}
	}

	.score {
		padding: var(--inner-padding);

		display: flex;

		flex-direction: column;
		align-items: center;

		&-top {
			transition-delay: 1s;
		}

		&-value {
			transition-delay: 2s;
			font-size: Max(64px, 15vw);

			color: var(--color-red);
		}

		&-bottom {
			transition-delay: 3s;
			font-style: italic;
			font-size: var(--font-size-small);

			animation: {
				name: PULSE;
				iteration-count: infinite;
				duration: 0.5s;
				direction: alternate;
			}

			span:nth-child(1) {
				color: var(--color-green);
			}
			span:nth-child(2) {
				color: var(--color-yellow);
			}
			span:nth-child(3) {
				color: var(--color-blue);
			}
		}
	}

	.mount {
		.score-top,
		.score-value,
		.score-bottom,
		.box {
			opacity: 1;
		}
	}

	@keyframes PULSE {
		to {
			transform: scale(1.1);
		}
	}
</style>
