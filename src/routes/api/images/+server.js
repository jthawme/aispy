import { json } from '@sveltejs/kit';
import vision from '@google-cloud/vision';
import jwt from 'jsonwebtoken';
import {
	JWT_SALT,
	PRIVATE_CREDENTIALS_AUTH_PROVIDER_X509_CERT_URL,
	PRIVATE_CREDENTIALS_AUTH_URI,
	PRIVATE_CREDENTIALS_CLIENT_EMAIL,
	PRIVATE_CREDENTIALS_CLIENT_X509_CERT_URL,
	PRIVATE_CREDENTIALS_PRIVATE_KEY,
	PRIVATE_CREDENTIALS_PRIVATE_KEY_ID,
	PRIVATE_CREDENTIALS_PROJECT_ID,
	PRIVATE_CREDENTIALS_TOKEN_URI,
	PRIVATE_CREDENTIALS_TYPE,
	PRIVATE_CREDENTIALS_UNIVERSE_DOMAIN
} from '$env/static/private';

/**
 *
 * @param {string} token
 * @returns {boolean}
 */
const validateToken = (token) => {
	try {
		const { time } = jwt.verify(token, JWT_SALT);

		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};

/**
 *
 * @param {string[]} urls
 */
const annotateImages = async (urls) => {
	const client = new vision.ImageAnnotatorClient({
		credentials: {
			type: PRIVATE_CREDENTIALS_TYPE,
			project_id: PRIVATE_CREDENTIALS_PROJECT_ID,
			private_key_id: PRIVATE_CREDENTIALS_PRIVATE_KEY_ID,
			private_key: PRIVATE_CREDENTIALS_PRIVATE_KEY.split('_').join('\n'),
			client_email: PRIVATE_CREDENTIALS_CLIENT_EMAIL,
			auth_uri: PRIVATE_CREDENTIALS_AUTH_URI,
			token_uri: PRIVATE_CREDENTIALS_TOKEN_URI,
			auth_provider_x509_cert_url: PRIVATE_CREDENTIALS_AUTH_PROVIDER_X509_CERT_URL,
			client_x509_cert_url: PRIVATE_CREDENTIALS_CLIENT_X509_CERT_URL,
			universe_domain: PRIVATE_CREDENTIALS_UNIVERSE_DOMAIN
		}
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

export async function POST({ request }) {
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

	const validated = await validateToken(token);

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
