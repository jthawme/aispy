import { getRecaptcha } from './utils.js';

/**
 *
 * @param {string} url
 * @param {RequestInit} [opts]
 * @param {typeof fetch} [fetch]
 * @returns {Promise<Response>}
 */
const fetcher = (url, opts, fetch) => {
	const f = fetch ?? window.fetch;

	return f(url, opts);
};

/**
 *
 * @param {Record<string, any>} obj
 * @returns {string}
 */
const paramsToString = (obj) => {
	const params = new URLSearchParams(obj);

	return params.size > 0 ? `?${params.toString()}` : '';
};

export const api = {
	basic: {
		/**
		 *
		 * @param {Record<string, string>} obj
		 * @param {typeof fetch} [fetch]
		 * @returns
		 */
		get(obj, fetch) {
			return fetcher(`/api/basic${paramsToString(obj)}`, {}, fetch).then((resp) => resp.json());
		}
	},

	images: {
		/**
		 *
		 * @param {File[]} files
		 */
		async process(files) {
			// const token = await getRecaptcha();

			const fd = new FormData();
			// fd.append('token', token);
			fd.append('token', 'na');
			files.forEach((file) => fd.append('file', file));

			return fetcher(`/api/images`, {
				method: 'POST',
				body: fd
			}).then((resp) => resp.json());
		}
	}
};
