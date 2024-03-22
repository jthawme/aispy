<script>
	import { clamp, listenCb, mapRange, timer } from '$lib/utils.js';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const VOICES_AVOID = [
		'Bad News',
		'Bells',
		'Boing',
		'Bubbles',
		'Cellos',
		'Good News',
		'Superstar',
		'Whisper',
		'Wobble',
		'Zarvox'
	];

	/** @type {string} */
	export let text;

	/** @type {boolean} */
	export let muted = false;

	/**
	 * @param {string} _text
	 * @returns {Promise<void>}
	 */
	function fauxShow(_text) {
		return new Promise((resolve) => {
			const words = _text.split(' ');

			const run = async (idx = 0) => {
				if (idx >= words.length) {
					resolve();
					return;
				}

				currentText = `${currentText}${words[idx]} `;

				const delay =
					words[idx].endsWith('.') || words[idx].endsWith('!') || words[idx].endsWith('?')
						? 800
						: clamp(mapRange(words[idx].length, 3, 30, 200, 600), 200, 600);

				await timer(delay);

				run(idx + 1);
			};

			run();
		});
	}

	/**
	 *
	 * @param {SpeechSynthesisUtteranceEventMap['boundary']} e
	 */
	function onUtteranceBoundary(e) {
		currentText = text.slice(0, e.charIndex + e.charLength);
	}

	/**
	 *
	 * @param {string} _text
	 * @returns {Promise<void>}
	 */
	function speakText(_text) {
		const voices = speechSynthesis
			.getVoices()
			.filter((item) => item.lang.startsWith('en-') && !VOICES_AVOID.includes(item.name));

		const voice = voices.find((item) => item.default) ?? voices[0] ?? null;
		// const voice = voices.find(item => item.localService)

		const utterance = new SpeechSynthesisUtterance(_text);
		// utterance.lang = 'en-UK';
		utterance.rate = 1;
		utterance.voice = voice;

		console.log(utterance);

		// @ts-ignore
		listenCb(utterance, 'boundary', onUtteranceBoundary);

		speechSynthesis.speak(utterance);

		return new Promise((resolve) => {
			utterance.onend = () => resolve();
		});
	}

	/**
	 *
	 * @param {string} _text
	 */
	async function displayText(_text) {
		if (!_text || !_text.trim()) {
			return;
		}

		dispatch('start');

		currentText = '';

		if (muted || typeof SpeechSynthesisUtterance === 'undefined') {
			await fauxShow(_text);
		} else {
			await speakText(_text);
		}

		dispatch('end');
	}

	let currentText = '';

	$: displayText(text);
</script>

<p>{currentText}</p>
