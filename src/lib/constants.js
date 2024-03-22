export const STARTING_SCORE = 1000;

export const COST = Object.freeze({
	CHARACTERS: -200,
	WORDS: -200,
	IMAGE: -200,
	WRONG: -50,
	SKIP: STARTING_SCORE * -1
});

export const MEDIA_TYPE = Object.freeze({
	WEBCAM: 'webcam',
	FILE: 'file'
});

export const MAX_IMAGES = 4;
