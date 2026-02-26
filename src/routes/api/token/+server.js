import { JWT_SALT } from '$env/static/private';
import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

/** @type {import('./$types').RequestHandler} */
export async function POST() {
	return json({
		token: jwt.sign({ time: new Date().getTime() }, JWT_SALT, { expiresIn: 60 * 5 })
	});
}
