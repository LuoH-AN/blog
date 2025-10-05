import type { H3Event } from 'h3'
import process from 'node:process'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import {
	createError,
	defineEventHandler,
	defineLazyEventHandler,
	getCookie,
	readBody,
} from 'h3'
import jwt from 'jsonwebtoken'
import { initR2Client, R2_FILE_NAME } from '../utils/r2'

const JWT_SECRET = process.env.JWT_SECRET

const missingEnvVars: string[] = []
if (!JWT_SECRET) {
	missingEnvVars.push('JWT_SECRET')
}
if (missingEnvVars.length > 0) {
	throw new Error(
		`Missing required environment variables: ${missingEnvVars.join(', ')}. Please set them.`,
	)
}

function authenticate(event: H3Event) {
	const token = getCookie(event, 'auth_token')

	if (!token) {
		throw createError({
			status: 401,
			message: '认证失败：未提供密钥',
			data: null,
		})
	}

	try {
		jwt.verify(token, JWT_SECRET!)
	}

	catch (error: any) {
		throw createError({
			status: 401,
			message: `认证失败：密钥错误`,
			data: error,
		})
	}
}

export default defineLazyEventHandler(async () => {
	const r2Client = initR2Client()

	return defineEventHandler(async (event) => {
		if (event.method !== 'POST') {
			throw createError({
				status: 405,
				message: `方法 ${event.method} 不允许`,
				data: null,
			})
		}

		authenticate(event)

		const body = await readBody(event)
		const jsonData = JSON.stringify(body, null, 2)

		const command = new PutObjectCommand({
			Bucket: process.env.R2_BUCKET_NAME!,
			Key: R2_FILE_NAME,
			Body: jsonData,
			ContentType: 'application/json',
		})

		await r2Client.send(command)
		return {
			status: 200,
			message: '成功',
			data: { success: true },
		}
	})
})
