<script>
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import EphemeralPill from '$lib/components/Compound/EphemeralPill.svelte';
	import Modal from '$lib/components/Compound/Modal.svelte';
	import SpeakAndShow from '$lib/components/SpeakAndShow.svelte';
	import GuessForm from '$lib/components/UI/GuessForm.svelte';
	import Hint from '$lib/components/UI/Hint.svelte';
	import TextLink from '$lib/components/UI/TextLink.svelte';
	import { COST } from '$lib/constants.js';
	import { timer } from '$lib/utils.js';
	import { getContext, onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import { fly } from 'svelte/transition';

	/**
	 * @type {Record<'CHARACTERS' | 'CORRECT' | 'WORDS' | 'IMAGE' | 'WRONG' | 'NO_GUESSES' | 'LOSE', Array<(answer: string) => string>>}
	 */
	const SPEECH = Object.freeze({
		CHARACTERS: [(val) => `The answer has ${val.split(' ').join('').length} characters total`],
		WORDS: [
			(val) => {
				const w = val.split(' ').length;
				return `The answer has ${w} word${w > 1 ? 's' : ''} total`;
			}
		],
		IMAGE: [
			(val) => `Here is the image the answer is in`,
			(val) => `Take a look at the photo with the answer`
		],
		WRONG: [
			(val) => `Not quite! The first letter is correct though.`,
			(val) => `Not sure what that is, but it isn't right`,
			(val) => `Nope! Now you're really just guessing`,
			(val) => `Correct... Oh wait no, not correct sorry`,
			(val) => `I wish it was that, but you only got the first letter correct`
		],
		CORRECT: [
			(val) => `You got it! It was ${val}`,
			(val) => `There it is, you are correct, it was ${val}`,
			(val) => `Wow, I have some competition, that was correct, it was ${val}`
		],
		NO_GUESSES: [
			(val) => `No more guesses I'm afraid! The answer was ${val}`,
			(val) => `You did not get it, the answer was ${val}`,
			(val) => `You've used up your guesses, the answer was ${val}`
		],
		LOSE: [
			(val) => `A-ha! Foiled again, the answer was ${val}`,
			(val) => `AI is far superiorororor. The answer was ${val}`,
			(val) => `That's embarassing for you, the answer was ${val}`,
			(val) => `You won't like it, but the answer was ${val}`
		]
	});

	/**
	 *
	 * @param {keyof SPEECH} key
	 * @param {string} [value]
	 */
	function getRandomSpeech(key, value = '') {
		return SPEECH[key][Math.floor(SPEECH[key].length * Math.random())](value);
	}

	// We grab the store from /game/layout.svelte that is controlling a lot of the shared state
	const game = getContext('game');

	/**
	 * @type {import('svelte/store').Readable<{text: string, image: string} | null>}
	 */
	const answer = getContext('answer');

	// This is a convenience function for reactivity, to determine when an answer changes
	const answerText = derived([answer], ([$answer]) => $answer?.text || '');

	// This dict keeps a readable version of what the state the game is currently in
	const GAME_STATE = {
		PLAY: 0,
		CORRECT: 1,
		SKIP: 2,
		GUESS: 3
	};

	// Whether onMount has run ultimately, to do some on display animation
	let mount = false;

	// A variable to track temporarily whether a guess was wrong
	let wrongGuess = false;

	// These variables monitor our lifelines in game
	let showCharacters = false;
	let showWords = false;
	let showImage = false;
	let showImageModal = false;

	// This variable is the source of truth of what state the game is in
	let gameState = GAME_STATE.PLAY;

	// This text is what the 'computer' is currently needing to say
	let displayText = '';

	// And this is tracking whether it is currently speaking it. Muted or not
	let speaking = false;

	// To display the ephemeral pill component with the correct penalty for a skipped
	// answer, we keep track of it via this variable. Initialised as the full penalty
	let skippedScore = COST.SKIP;

	function onUseCharacters() {
		if (showCharacters) {
			return;
		}

		game.addScore(COST.CHARACTERS);
		displayText = getRandomSpeech('CHARACTERS', $answer?.text);
		showCharacters = true;
	}

	function onUseWords() {
		if (showWords) {
			return;
		}

		game.addScore(COST.WORDS);
		displayText = getRandomSpeech('WORDS', $answer?.text);
		showWords = true;
	}

	function onUseImage() {
		if (!showImage) {
			game.addScore(COST.IMAGE);
			displayText = getRandomSpeech('IMAGE');
			showImage = true;
		}

		showImageModal = true;
	}

	function onImageModalClose() {
		showImageModal = false;
	}

	/**
	 *
	 * @param {string} guess
	 */
	async function onSubmit(guess) {
		if (guess.toLowerCase() === $answer?.text.toLowerCase()) {
			displayText = getRandomSpeech('CORRECT', $answer?.text);
			gameState = GAME_STATE.CORRECT;
			game.addTotal($game.score);
		} else {
			game.addScore(COST.WRONG);
			gameState = GAME_STATE.GUESS;

			if ($game.score <= 0) {
				onSkip(true);
			} else {
				wrongGuess = true;
				displayText = getRandomSpeech('WRONG');
			}
		}
	}

	function onSpeechStart() {
		speaking = true;
	}

	function onToggleMuted() {
		game.setMute(!$game.muted);
	}

	async function onSpeechEnd() {
		speaking = false;

		if (gameState === GAME_STATE.CORRECT || gameState === GAME_STATE.SKIP) {
			await timer(1000);

			if ($game.currentIndex === $game.answers.length - 1) {
				goto('/game/results');
			} else {
				gameState = GAME_STATE.PLAY;
				game.advance();
			}
		} else if (gameState === GAME_STATE.GUESS) {
			gameState = GAME_STATE.PLAY;
			displayText = `Try again`;
		}
	}

	/**
	 *
	 * @param {string} _answer
	 */
	function beginGame(_answer) {
		if (!_answer) {
			return;
		}

		showCharacters = false;
		showImage = false;
		showWords = false;

		displayText = `I Spy with my digi-eye something beginning with ${_answer.charAt(0)}`;
	}

	function onSkip(forced) {
		skippedScore = $game.score * -1;
		game.addScore(COST.SKIP);
		gameState = GAME_STATE.SKIP;

		displayText =
			forced === true
				? getRandomSpeech('NO_GUESSES', $answer?.text)
				: getRandomSpeech('LOSE', $answer?.text);
	}

	onMount(() => {
		if ($game.answers.length === 0) {
			goto('/game');
		} else {
			timer(150).then(() => {
				mount = true;
			});
		}
	});

	$: disabled = speaking || gameState !== GAME_STATE.PLAY;

	$: browser && mount && beginGame($answerText);
</script>

<svelte:head>
	<title>Play – AI Spy</title>
</svelte:head>

{#if $answer}
	<Modal open={showImageModal} on:close={onImageModalClose}>
		<div class="preview">
			<div class="preview-image">
				<img src={$answer.image} alt="" />
			</div>

			<div class="preview-close">
				<TextLink on:click={onImageModalClose} theme="white" icon="x">Close</TextLink>
			</div>
		</div>
	</Modal>

	<div class:mount class="play-area">
		<div class="score">Score {$game.total + $game.score}</div>

		<div class="game-area">
			<SpeakAndShow
				on:start={onSpeechStart}
				on:end={onSpeechEnd}
				text={displayText}
				muted={$game.muted}
			/>

			<div class="rounds color-text-light">
				{$game.currentIndex + 1}/{$game.answers.length}
			</div>

			<div class="volume">
				<TextLink
					on:click={onToggleMuted}
					theme="red"
					icon={$game.muted ? 'volumeOn' : 'volumeOff'}
					size="large"
				/>
			</div>

			{#if showImage}
				<button on:click={onUseImage} in:fly={{ y: '50%' }} class="thumbnail btn-reset">
					<div class="preview-image">
						<img src={$answer.image} alt="" />
					</div>
				</button>
			{/if}
		</div>

		<section class="answer-area">
			<header class="answer-area-header helpers">
				<div class="helpers-item">
					{#if showCharacters}
						<div class="helpers-item-pill">
							<EphemeralPill theme="red">{COST.CHARACTERS}</EphemeralPill>
						</div>
					{/if}
					<TextLink
						{disabled}
						on:click={onUseCharacters}
						theme={showCharacters ? 'red' : 'light'}
						icon="char">Characters</TextLink
					>
				</div>
				<div class="helpers-item">
					{#if showWords}
						<div class="helpers-item-pill">
							<EphemeralPill theme="red">{COST.WORDS}</EphemeralPill>
						</div>
					{/if}
					<TextLink
						{disabled}
						on:click={onUseWords}
						theme={showWords ? 'green' : 'light'}
						icon="layers">Words</TextLink
					>
				</div>
				<div class="helpers-item">
					{#if showImage}
						<div class="helpers-item-pill">
							<EphemeralPill theme="red">{COST.IMAGE}</EphemeralPill>
						</div>
					{/if}
					<TextLink
						{disabled}
						on:click={onUseImage}
						theme={showImage ? 'yellow' : 'light'}
						icon="image">Image</TextLink
					>
				</div>
			</header>

			<div class="answer-area-content answers">
				<div class="answers-hint">
					<Hint showLetters={showCharacters} {showWords} answer={$answer.text} /><br />
				</div>

				<div class="answers-form">
					{#if wrongGuess || gameState === GAME_STATE.SKIP}
						<span class="answers-form-pill">
							{#if wrongGuess}
								<EphemeralPill theme="red" on:end={() => (wrongGuess = false)}
									>{COST.WRONG}</EphemeralPill
								>
							{/if}
							{#if gameState === GAME_STATE.SKIP}
								<EphemeralPill theme="red">{skippedScore}</EphemeralPill>
							{/if}
						</span>
					{/if}
					<GuessForm
						submit={onSubmit}
						on:skip={onSkip}
						prefix={$answer.text.charAt(0)}
						{disabled}
					/>
				</div>
			</div>
		</section>
	</div>
{/if}

<style lang="scss">
	.play-area {
		display: flex;

		flex-direction: column;

		width: 100%;

		padding: var(--outer-padding) var(--outer-padding) 0;
	}

	.game-area,
	.answer-area {
		flex-grow: 1;
		flex-shrink: 0;
		flex-basis: 50%;
	}

	.game-area {
		position: relative;

		display: flex;

		align-items: center;
		justify-content: center;

		font-size: var(--font-size-medium);
		color: var(--color-text);

		text-align: center;

		.volume,
		.rounds {
			position: absolute;

			bottom: 10px;
		}

		.volume {
			right: 10px;
		}

		.rounds {
			left: 10px;
			font-size: var(--font-size-small);
		}
	}

	.score {
		position: absolute;

		bottom: calc(100% + 1em);
		right: var(--inner-padding);

		font-size: var(--font-size-normal);
		color: var(--color-red);
	}

	.answer-area {
		position: relative;

		z-index: 5;
		display: flex;

		flex-direction: column;
		gap: 15px;

		border-radius: 20px 20px 0 0;

		background-color: var(--color-white);

		padding: 0 var(--outer-padding);

		transform: translate3d(0, 100%, 0);

		transition: {
			duration: 0.35s;
			property: var(--standard-easing);
		}

		.mount & {
			transform: translate3d(0, 0, 0);
		}

		&-header {
		}

		&-content {
			display: flex;

			flex-grow: 1;

			flex-direction: column;
		}
	}

	.helpers {
		display: flex;

		padding: 15px 20px;

		border-bottom: 1px solid var(--color-bg);

		&-item {
			position: relative;

			flex-grow: 1;

			display: flex;

			justify-content: center;

			&-pill {
				position: absolute;

				left: 50%;
				bottom: calc(100% + 1em);

				transform: translate3d(-50%, 0, 0);
			}
		}
	}

	.answers {
		&-hint {
			display: flex;

			justify-content: center;
		}

		&-form {
			position: relative;

			display: flex;

			flex-direction: column;

			align-items: center;
			justify-content: center;

			flex-grow: 1;

			padding-bottom: 30px;

			&-pill {
				position: absolute;

				top: 0;
				left: 50%;

				transform: translate3d(-50%, 0, 0);
			}
		}
	}

	.preview {
		display: flex;

		flex-direction: column;

		align-items: center;

		width: 100%;
		max-width: 300px;

		padding: var(--inner-padding);

		&-image {
			padding: 10px;
			line-height: 1;

			background-color: var(--color-green);

			border-radius: 10px;

			transform: rotate(-5deg);
		}

		&-close {
			position: relative;

			z-index: 5;

			margin-top: 2em;
		}
	}

	.thumbnail {
		position: absolute;

		bottom: 0;
		left: 50%;

		transform: translate3d(-50%, 65%, 0);

		width: 100px;

		.preview-image {
			padding: 5px;
			transform: none;
		}

		@include hover {
			.preview-image {
				transform: translateY(-25%);
			}
		}
	}
</style>
