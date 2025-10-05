import process from 'node:process'
import { createError, defineEventHandler } from 'h3'

const UMAMI_CONFIG = {
	serverUrl: 'https://umami.enltlh.me',
	username: process.env.UMAMI_USERNAME,
	password: process.env.UMAMI_PASSWORD,
	websiteId: 'd755863f-e0ed-4f4b-b30c-f76cc31a4f98',
}

let cachedToken: string | null = null
let tokenExpiry: number | null = null

interface UmamiAuthResponse {
	token: string
	user: {
		id: string
		username: string
		role: string
		createdAt: string
		isAdmin: boolean
	}
}

interface UmamiStatsData {
	pageviews: {
		value: number
		prev: number
	}
	visitors: {
		value: number
		prev: number
	}
	visits: {
		value: number
		prev: number
	}
	bounces: {
		value: number
		prev: number
	}
	totaltime: {
		value: number
		prev: number
	}
}

interface TimeRangeDefinition {
	startAt: number
	endAt: number
}

async function getUmamiToken(): Promise<string> {
	if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
		return cachedToken
	}

	const response = await fetch(`${UMAMI_CONFIG.serverUrl}/api/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify({
			username: UMAMI_CONFIG.username,
			password: UMAMI_CONFIG.password,
		}),
	})

	if (!response.ok) {
		throw new Error(`认证失败: ${response.status} ${response.statusText}`)
	}

	const data: UmamiAuthResponse = await response.json()
	cachedToken = data.token
	tokenExpiry = Date.now() + 60 * 60 * 1000

	return data.token
}

async function verifyToken(token: string): Promise<boolean> {
	try {
		const response = await fetch(`${UMAMI_CONFIG.serverUrl}/api/auth/verify`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json',
			},
		})
		return response.ok
	}
	catch {
		return false
	}
}

async function fetchStatsForDefinedRange(token: string, rangeDef: TimeRangeDefinition): Promise<UmamiStatsData> {
	const { startAt, endAt } = rangeDef

	const response = await fetch(
		`${UMAMI_CONFIG.serverUrl}/api/websites/${UMAMI_CONFIG.websiteId}/stats?startAt=${startAt}&endAt=${endAt}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json',
			},
		},
	)

	if (!response.ok) {
		throw new Error(`获取统计数据失败: ${response.status} ${response.statusText}`)
	}

	return await response.json()
}

export default defineEventHandler(async (_event) => {
	try {
		const token = await getUmamiToken()

		const isValid = await verifyToken(token)
		if (!isValid) {
			cachedToken = null
			tokenExpiry = null
			throw createError({
				status: 401,
				message: '认证失败：密钥错误',
				data: null,
			})
		}

		const totalTimeRange: TimeRangeDefinition = {
			startAt: 0,
			endAt: Date.now(),
		}

		const totalStats = await fetchStatsForDefinedRange(token, totalTimeRange)

		return {
			status: 200,
			message: '成功',
			data: totalStats,
		}
	}
	catch (error: any) {
		throw createError({
			status: 500,
			message: error.message || '获取 Umami 统计数据失败',
			data: null,
		})
	}
})
