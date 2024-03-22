import { json } from '@sveltejs/kit';
import vision from '@google-cloud/vision';
import { PRIVATE_GOOGLE_RECAPTCHA_SECRET } from '$env/static/private';
import credentials from '$lib/credentials.json';

/**
 *
 * @param {fetch} fetch
 * @param {string} token
 * @returns {Promise<boolean>}
 */
const validateToken = (fetch, token) => {
	return fetch(
		`https://www.google.com/recaptcha/api/siteverify?secret=${PRIVATE_GOOGLE_RECAPTCHA_SECRET}&response=${token}`,
		{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}
	)
		.then((resp) => resp.json())
		.then((result) => result.success);
};

/**
 *
 * @param {string[]} urls
 */
const annotateImages = async (urls) => {
	const client = new vision.ImageAnnotatorClient({
		credentials
	});

	const results = await Promise.all(
		urls.map((imageUri) =>
			client.labelDetection({
				image: {
					content: imageUri
				}
			})
		)
	);

	return results.map((result) =>
		result.flatMap((item) => item.labelAnnotations?.map((annotation) => annotation.description))
	);
};

/**
 *
 * @param {File} file
 */
const getDataUri = async (file) => {
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	// return `data:${file.type};base64,${buffer.toString('base64')}`;
	return buffer.toString('base64');
};

export async function POST({ request, fetch }) {
	const body = await request.formData();

	const files = Array.from(body.getAll('file'));
	const token = body.get('token');

	if (
		!files ||
		!files.every((file) => file instanceof File) ||
		!token ||
		typeof token !== 'string'
	) {
		return json({
			error: true,
			message: 'Incorrect params'
		});
	}

	const validated = await validateToken(fetch, token);

	if (!validated) {
		return json({
			error: true,
			message: 'Recaptcha error'
		});
	}

	const urls = await Promise.all(files.map(getDataUri));

	// // @ts-ignore
	const labels = await annotateImages(urls);

	/** @type {(string | null | undefined)[][]} */
	const cached = [];
	const unique = labels.map((group, idx, arr) => {
		const pool = cached.slice(0, idx).flat();

		const safe = group.filter((item) => !pool.includes(item ?? '')).slice(0, 3);

		cached.push(safe);

		return safe;
	});

	return json({
		labels: unique
	});
}
