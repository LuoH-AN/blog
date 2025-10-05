import { Buffer } from 'node:buffer'
import process from 'node:process'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { createError, defineEventHandler, defineLazyEventHandler, getCookie } from 'h3'
import jwt from 'jsonwebtoken'
import { initR2Client, R2_FILE_NAME } from '../utils/r2'

const JWT_SECRET = process.env.JWT_SECRET

function isAuthenticated(event: any): boolean {
	const token = getCookie(event, 'auth_token')
	if (!token) {
		return false
	}
	try {
		jwt.verify(token, JWT_SECRET!)
		return true
	}
	catch {
		return false
	}
}

export default defineLazyEventHandler(async () => {
	const r2Client = initR2Client()

	return defineEventHandler(async (event) => {
		if (event.method !== 'GET') {
			throw createError({
				status: 405,
				message: `方法 ${event.method} 不允许`,
				data: null,
			})
		}

		// We don't throw error for GET, just return empty array if not authenticated
		// Let client side handle the display logic
		// if (!isAuthenticated(event)) {
		//   return []
		// }

		try {
			const command = new GetObjectCommand({
				Bucket: process.env.R2_BUCKET_NAME!,
				Key: R2_FILE_NAME,
			})

			const response = await r2Client.send(command)
			const data = await streamToString(response.Body)
			const moments = JSON.parse(data)

			return {
				status: 200,
				message: '成功',
				data: {
					isAuthenticated: isAuthenticated(event),
					moments,
				},
			}
		}
		catch (error: any) {
			if (error.name === 'NoSuchKey') {
				return {
					status: 200,
					message: '成功',
					data: {
						isAuthenticated: isAuthenticated(event),
						moments: [],
					},
				}
			}
			throw error
		}
	})
})

async function streamToString(stream: any): Promise<string> {
	const chunks = []
	for await (const chunk of stream) {
		chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
	}
	return Buffer.concat(chunks).toString('utf-8')
}
