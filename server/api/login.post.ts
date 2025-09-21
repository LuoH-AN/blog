import type { H3Event } from 'h3'
import process from 'node:process'
import { createError, defineLazyEventHandler, readBody, setCookie } from 'h3'
import jwt from 'jsonwebtoken'

const LOGIN_AUTH_KEY = process.env.LOGIN_AUTH_KEY
const JWT_SECRET = process.env.JWT_SECRET

const missingEnvVars: string[] = []
if (!JWT_SECRET) {
	missingEnvVars.push('JWT_SECRET')
}
if (!LOGIN_AUTH_KEY) {
	missingEnvVars.push('LOGIN_AUTH_KEY')
}
if (missingEnvVars.length > 0) {
	throw new Error(
		`Missing required environment variables: ${missingEnvVars.join(', ')}. Please set them.`,
	)
}

async function authenticateLogin(event: H3Event) {
	const body = await readBody(event)
	const { authKey: providedKey } = body

	if (!providedKey || providedKey !== LOGIN_AUTH_KEY!) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Invalid authentication key',
		})
	}

	const payload = {
		userId: 'admin',
		role: 'editor',
	}

	const token = jwt.sign(payload, JWT_SECRET!, {
		expiresIn: '7d',
	})

	setCookie(event, 'auth_token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	})

	return { success: true }
}

export default defineLazyEventHandler(async () => {
	return defineEventHandler(async (event) => {
		if (event.method !== 'POST') {
			throw createError({
				statusCode: 405,
				statusMessage: `Method ${event.method} not allowed`,
			})
		}

		return await authenticateLogin(event)
	})
})
