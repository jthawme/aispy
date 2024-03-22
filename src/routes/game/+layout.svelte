<script>
	import { MAX_IMAGES, STARTING_SCORE } from '$lib/constants.js';
	import { fileToUrl, imageResize } from '$lib/utils.js';
	import { setContext } from 'svelte';
	import { derived, writable } from 'svelte/store';

	const gameStore = writable({
		/** @type {string[]} */
		images: [],
		/** @type {File[]} */
		files: [],

		/** @type {Array<{ image: string, text: string }>}*/
		answers: [],

		currentIndex: -1,
		muted: false,
		score: STARTING_SCORE,
		total: 0,

		busy: false
	});

	const game = {
		...gameStore,

		reset() {
			gameStore.update((state) => {
				state.images = [];
				state.files = [];
				state.answers = [];
				state.currentIndex = -1;
				state.score = STARTING_SCORE;
				state.total = 0;
				return state;
			});
		},

		/**
		 *
		 * @param {boolean} val
		 */
		setBusy(val) {
			gameStore.update((state) => {
				state.busy = val;
				return state;
			});
		},

		/**
		 *
		 * @param {boolean} val
		 */
		setMute(val) {
			gameStore.update((state) => {
				state.muted = val;
				return state;
			});
		},

		/**
		 *
		 * @param {number} val
		 */
		addScore(val) {
			gameStore.update((state) => {
				state.score = Math.max(state.score + val, 0);
				return state;
			});
		},

		/**
		 *
		 * @param {number} val
		 */
		addTotal(val) {
			gameStore.update((state) => {
				state.total = state.total + val;
				return state;
			});
		},

		/**
		 *
		 * @param {File[]} files
		 */
		async addImages(files) {
			game.setBusy(true);

			try {
				const urls = await Promise.all(files.map(fileToUrl));
				const images = await Promise.all(urls.map((url) => imageResize(url, 800)));

				gameStore.update((state) => {
					state.files = [...state.files, ...files].slice(0, MAX_IMAGES);
					state.images = [...state.images, ...images].slice(0, MAX_IMAGES);
					return state;
				});
			} catch (e) {
				console.error(e);
			} finally {
				game.setBusy(false);
			}
		},

		/**
		 *
		 * @param {number} index
		 */
		async removeImage(index) {
			gameStore.update((state) => {
				const files = state.files.slice();
				const images = state.images.slice();

				files.splice(index, 1);
				images.splice(index, 1);

				state.files = files;
				state.images = images;

				return state;
			});
		},

		/**
		 *
		 * @param {Array<{image: string, text: string}>} answers
		 */
		addAnswers(answers) {
			gameStore.update((state) => {
				state.currentIndex = -1;
				state.answers = answers;
				return state;
			});
		},

		advance() {
			gameStore.update((state) => {
				state.score = STARTING_SCORE;
				state.currentIndex = state.currentIndex + 1;
				return state;
			});
		}
	};

	const answer = derived([game], ([$game]) => {
		return $game.answers[$game.currentIndex] ?? null;
	});

	setContext('game', game);
	setContext('answer', answer);
</script>

<slot />
