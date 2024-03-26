<script>
	import { MAX_IMAGES } from '$lib/constants.js';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import ContentBox from '../Compound/ContentBox.svelte';
	import Button from '../UI/Button.svelte';
	import TextLink from '../UI/TextLink.svelte';
	import Loader from '../UI/Loader.svelte';
	import { getPersistedValue, persistValue } from '$lib/utils.js';

	const dispatch = createEventDispatcher();

	export let maxImageWidth = 600;

	/** @type {number} */
	export let images = 0;

	/** @type {null | HTMLVideoElement} */
	export let video = null;

	/**
	 * @type {MediaStream | null}
	 *
	 * This is the media stream from the webcam
	 */
	export let stream = null;

	/**
	 * @type {boolean}
	 *
	 * A variable to track whether we have done the initial pass
	 */
	let resolving = true;

	/**
	 * @type {MediaDeviceInfo[]}
	 *
	 * An array of applicable video devices
	 */
	let devices = [];

	/**
	 * @type {number}
	 *
	 * The index currently pointing to the device in the `devices` array
	 */
	let deviceIndex = 0;

	function onSwitchMode() {
		dispatch('switch');
	}

	/**
	 * Function to get an initial media stream of
	 *
	 * @returns {Promise<MediaStream>}
	 */
	async function getWebcam() {
		persistValue('camera', devices[deviceIndex].deviceId);
		return navigator.mediaDevices.getUserMedia({
			video: {
				deviceId: devices[deviceIndex].deviceId
			}
		});
	}

	async function getDevices() {
		const list = await navigator.mediaDevices
			.enumerateDevices()
			.then((list) => list.filter((device) => device.kind.includes('video')));

		const previousCamera = getPersistedValue('camera', null);

		if (previousCamera) {
			deviceIndex = list.findIndex((device) => device.deviceId === previousCamera) || 0;
		}

		return list;
	}

	function switchCamera() {
		deviceIndex = (deviceIndex + 1) % devices.length;
		run();
	}

	async function run() {
		try {
			if (resolving) {
				devices = await getDevices();
			}
			stream = await getWebcam();

			dispatch('change', stream);
		} catch (e) {
			console.error(e);

			dispatch('error');
		} finally {
			resolving = false;
		}
	}

	async function takePhoto() {
		if (video) {
			dispatch('snap');

			const w = Math.min(video.videoWidth, maxImageWidth);
			const h = (w / video.videoWidth) * video.videoHeight;

			const getImg = () => {
				if (typeof OffscreenCanvas !== 'undefined') {
					const canvas = new OffscreenCanvas(w, h);
					const ctx = canvas.getContext('2d');

					ctx?.drawImage(video, 0, 0, w, h);

					return canvas.convertToBlob({
						type: 'image/png'
					});
				}

				const canvas = document.createElement('canvas');
				canvas.width = w;
				canvas.height = h;
				const ctx = canvas.getContext('2d');

				ctx?.drawImage(video, 0, 0, w, h);

				return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
			};

			const blob = await getImg();

			const file = new File([blob], 'webcam.png', {
				type: 'image/png'
			});

			dispatch('file', file);
		}
	}

	onMount(() => {
		run();
	});

	onDestroy(() => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
	});
</script>

{#if resolving}
	<ContentBox>
		<p class="color-text-light">
			<Loader /><br />
			Requesting access to webcam
		</p>
	</ContentBox>
{:else}
	<ContentBox headerAlign="space">
		<svelte:fragment slot="header">
			{#if devices.length > 1}
				<TextLink icon="camera" on:click={switchCamera}>Switch Camera</TextLink>
			{:else}
				<span />
			{/if}

			<span class="color-text-light">{images}/{MAX_IMAGES} Photos</span>
		</svelte:fragment>

		<Button expand disabled={images >= MAX_IMAGES || !video} on:click={takePhoto}>Take Photo</Button
		>

		<svelte:fragment slot="footer">
			<TextLink icon="cameraOff" theme="light" on:click={onSwitchMode}>Use Filepicker</TextLink>
		</svelte:fragment>
	</ContentBox>
{/if}
