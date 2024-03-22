<script>
	/** @type {string} */
	export let answer;

	export let showWords = false;
	export let showLetters = false;

	$: firstLetter = answer.charAt(0);

	/** @type {string} */
	$: dummyWords = new Array(showWords ? answer.split(' ').length : 1)
		.fill('wordsmith')
		.join(showWords ? ' ' : '');
	$: letters = (showLetters ? answer.slice(1).split('') : dummyWords.split('')).filter(
		(char) => !(!showWords && char === ' ')
	);
</script>

<div class="hint" class:showWords class:showLetters>
	<span class="letter">
		{firstLetter}
	</span>

	{#each letters as letter}
		<span class="letter" class:space={letter === ' '} />
	{/each}
</div>

<style lang="scss">
	.hint {
		display: flex;

		color: var(--color-text-light);
		font-size: var(--font-size-small);
	}

	.letter {
		min-width: 1ch;
		height: 1.6ch;

		&:not(:first-child) {
			border-bottom: 1px solid currentColor;
		}
	}

	.showLetters .letter {
		min-width: 0.8ch;
		margin: 0 0.1ch;
	}

	.showWords .letter.space {
		border-bottom: none;
	}
</style>
