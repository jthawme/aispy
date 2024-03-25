<script>
	import { onMount, onDestroy, getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { PUBLIC_GOOGLE_RECAPTCHA_KEY } from '$env/static/public';

	import { api } from '$lib/api.js';
	import ContentBox from '$lib/components/Compound/ContentBox.svelte';
	import Button from '$lib/components/UI/Button.svelte';
	import TextLink from '$lib/components/UI/TextLink.svelte';
	import { MEDIA_TYPE, MAX_IMAGES } from '$lib/constants.js';
	import { shuffle } from '$lib/utils.js';
	import Loader from '$lib/components/UI/Loader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Camera from '$lib/components/Files/Camera.svelte';
	import Picker from '$lib/components/Files/Picker.svelte';

	const game = getContext('game');

	/**
	 * @type {HTMLVideoElement | null}
	 *
	 * This is the video tag in which we will attach the webcam stream
	 */
	let videoEl = null;

	/**
	 * @type {boolean}
	 *
	 * Whether we have at least once resolved the webcam
	 */
	let webcamResolved = false;

	/**
	 * @type {string}
	 *
	 * This object lets us determine if we are in webcam view or file picker view
	 */
	let type = MEDIA_TYPE.WEBCAM;

	/**
	 * @type {boolean}
	 *
	 * There is a scenario in which the webcam is not a choice, and that the user
	 * does not have a webcam or has blocked permission. This is true until it is
	 * not
	 */
	let canUseWebcam = true;

	/**
	 * @type {boolean}
	 *
	 * A variable to track that we are calling the API for the image labels
	 */
	let imageProcessing = false;

	/**
	 * @type {boolean}
	 *
	 * Whether the request for webcam resolved in either yes or no
	 */
	let permissionResolved = false;

	/**
	 * @type {boolean}
	 *
	 * A variable to allow us to display a faux on screen flash
	 */
	let snap = false;

	/**
	 * @type {Array<string | null>}
	 *
	 * Creates an array at the maximum size, with current images or null if nothing yet, so
	 * we have a fully padded array
	 */
	$: thumbnails = new Array(MAX_IMAGES).fill(0).map((_, idx) => $game.images?.[idx] ?? null);

	/**
	 *
	 * @param {{detail: MediaStream}} evt
	 */
	function onChangeStream({ detail: stream }) {
		webcamResolved = true;

		if (videoEl) {
			videoEl.srcObject = stream;
		}
	}

	function onWebcamError() {}

	/**
	 *
	 * @param {{detail: File}} evt
	 */
	async function onWebcamFile({ detail: file }) {
		await game.addImages([file]);
	}

	function onSnap() {
		snap = true;
	}

	function onFlashEnd() {
		snap = false;
	}

	async function onFiles(e) {
		const files = [...e.target.files].slice(0, 4);

		if (files.length <= 0) {
			return;
		}

		e.target.value = '';

		await game.addImages(files);
	}

	function removeThumbnail(idx) {
		game.removeImage(idx);
	}

	/**
	 *
	 * @param {File[]} files
	 */
	async function processImages(files) {
		const { labels } = await api.images.process(files);

		return shuffle(
			labels.flatMap((group, idx) =>
				group.map((text) => ({
					image: $game.images[idx],
					text
				}))
			)
		).slice(0, MAX_IMAGES);
	}

	function switchType() {
		if (type === MEDIA_TYPE.FILE) {
			type = MEDIA_TYPE.WEBCAM;
		} else {
			type = MEDIA_TYPE.FILE;
		}
	}

	async function onAdvance() {
		imageProcessing = true;
		try {
			const answers = await processImages($game.files);

			game.addAnswers(answers);
			game.advance();

			goto('/game/play');
			goto;
		} catch {
			imageProcessing = false;
		}
	}

	$: complete = $game.images.length >= MAX_IMAGES;
</script>

<svelte:head>
	<title>Begin – AI Spy</title>

	<script
		src={`https://www.google.com/recaptcha/api.js?render=${PUBLIC_GOOGLE_RECAPTCHA_KEY}`}
	></script>
</svelte:head>

<div class="content" class:file={type === MEDIA_TYPE.FILE} class:processing={imageProcessing}>
	<div class="media">
		<div
			class:show={type === MEDIA_TYPE.WEBCAM && canUseWebcam && webcamResolved && !imageProcessing}
			class="video"
		>
			<div class="video-window">
				{#if snap}
					<div class="screen-flash" on:animationend={onFlashEnd} />
				{/if}

				<video bind:this={videoEl} muted autoplay />

				<span>Take photos from around you</span>
			</div>
		</div>

		{#if webcamResolved}
			<div class="thumbnails">
				{#each thumbnails as thumbnail, idx}
					<div class="thumbnails-item">
						{#if thumbnail}
							<button
								disabled={imageProcessing}
								on:click={() => removeThumbnail(idx)}
								class="thumbnails-item-remove btn-reset"><Icon name="x" /></button
							>
							<img src={thumbnail} alt="" />
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	{#if !imageProcessing}
		<div class="box">
			{#if type === MEDIA_TYPE.WEBCAM}
				<Camera
					images={$game.images.length}
					video={videoEl}
					on:switch={switchType}
					on:change={onChangeStream}
					on:error={onWebcamError}
					on:file={onWebcamFile}
					on:snap={onSnap}
				/>
			{/if}

			{#if type === MEDIA_TYPE.FILE}
				<Picker
					{canUseWebcam}
					on:switch={switchType}
					images={$game.images.length}
					busy={$game.busy}
					on:change={onFiles}
				/>
			{/if}

			<div class="advance">
				<Button disabled={!complete} expand on:click={onAdvance}>Play!</Button>
			</div>
		</div>
	{:else}
		<div class="box">
			<ContentBox>
				<p class="color-text-light">
					<Loader /><br />Processing images<br /><span class="size-small"
						>The AI is "thinking" about what it can "see"</span
					>
				</p>
			</ContentBox>
		</div>
	{/if}
</div>

<style lang="scss">
	.content {
		display: flex;

		flex-direction: column;

		align-items: center;
		margin: auto;

		width: 100%;

		:global(p) {
			text-align: center;

			font-size: var(--font-size-large);
		}

		@include large-mobile {
			padding: 4em 0;
		}
	}

	.screen-flash {
		position: absolute;

		top: 0;
		right: 0;

		width: 100%;
		height: 100%;

		background-color: white;

		z-index: 1000;

		pointer-events: none;

		animation: {
			name: FLASH;
			iteration-count: 1;
			fill-mode: forwards;
			duration: 1s;
		}
	}

	@keyframes FLASH {
		0% {
			opacity: 1;
		}

		20% {
			opacity: 0.2;
		}

		100% {
			opacity: 0;
		}
	}

	.video {
		display: none;
		padding: var(--outer-padding);

		@include large-mobile {
			width: 100%;
			max-width: 500px;
		}

		&.show {
			display: block;
		}

		&-window {
			position: relative;

			aspect-ratio: 4/3;

			background-color: var(--color-text);

			line-height: 1;

			border-radius: 20px;
			isolation: isolate;
			overflow: hidden;

			span {
				position: absolute;

				bottom: 10px;
				left: 50%;

				transform: translate3d(-50%, 0, 0);

				text-align: center;

				color: var(--color-white);

				z-index: 2;

				font-size: var(--font-size-small);

				mix-blend-mode: difference;
			}
		}

		video {
			width: 100%;
			height: 100%;

			object-fit: contain;
		}
	}

	.thumbnails {
		display: grid;

		grid-template-columns: repeat(4, 1fr);

		gap: 10px;

		padding: 0 var(--outer-padding);
		width: 100%;

		&-item {
			position: relative;

			aspect-ratio: 16/9;

			border-radius: 10px;
			overflow: hidden;
			isolation: isolate;

			&-remove {
				position: absolute;

				top: 5px;
				right: 5px;

				padding: 3px;

				background-color: var(--color-white);

				display: inline-flex;

				border-radius: 100%;

				font-size: var(--font-size-small);

				&:disabled {
					color: var(--color-text-light);
				}

				@include hover {
					background-color: var(--color-bg);
				}
			}

			&:nth-child(1) {
				background-color: var(--color-blue);
			}

			&:nth-child(2) {
				background-color: var(--color-red);
			}

			&:nth-child(3) {
				background-color: var(--color-green);
			}

			&:nth-child(4) {
				background-color: var(--color-yellow);
			}

			img {
				width: 100%;
				height: 100%;

				object-fit: contain;
			}
		}

		.file & {
			grid-template-columns: repeat(2, 1fr);
		}

		@include large-mobile {
			grid-template-columns: 1fr;
			padding: var(--outer-padding) 0;
			max-width: 500px;

			.processing & {
				grid-template-columns: repeat(4, 1fr);
				max-width: 100%;
			}

			&-item {
				aspect-ratio: 16/12;
			}
		}
	}

	.media {
		width: 100%;

		@include large-mobile {
			display: grid;

			grid-template-columns: 1fr 80px;

			align-items: flex-start;
			max-width: 500px;

			.processing &,
			.file & {
				grid-template-columns: 1fr;
			}
		}
	}

	.advance {
		padding: 0 var(--inner-padding);
	}

	.box {
		display: flex;

		flex-direction: column;

		gap: 10px;

		width: 100%;

		@include large-mobile {
			max-width: 300px;
		}
	}
</style>
