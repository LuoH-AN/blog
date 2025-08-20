import { defineEventHandler, getQuery, createError } from 'h3'

const UMAMI_CONFIG = {

  serverUrl: 'https://umami.enltlh.me',

  username: process.env.UMAMI_USERNAME,
  password: process.env.UMAMI_PASSWORD,

  websiteId: 'd755863f-e0ed-4f4b-b30c-f76cc31a4f98'
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

interface UmamiStats {
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

interface TimeRange {
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
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      username: UMAMI_CONFIG.username,
      password: UMAMI_CONFIG.password
    })
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
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    return response.ok
  } catch {
    return false
  }
}

async function fetchStats(token: string, range: TimeRange): Promise<UmamiStats> {
  const { startAt, endAt } = range
  
  const response = await fetch(
    `${UMAMI_CONFIG.serverUrl}/api/websites/${UMAMI_CONFIG.websiteId}/stats?startAt=${startAt}&endAt=${endAt}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error(`获取统计数据失败: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

function getTimeRange(range: string): TimeRange {
  const now = Date.now()
  let startAt = now
  
  switch (range) {
    case 'day':
      startAt = now - 24 * 60 * 60 * 1000
      break
    case 'week':
      startAt = now - 7 * 24 * 60 * 60 * 1000
      break
    case 'month':
      startAt = now - 30 * 24 * 60 * 60 * 1000
      break
    case 'year':
      startAt = now - 365 * 24 * 60 * 60 * 1000
      break
    default:
      startAt = now - 30 * 24 * 60 * 60 * 1000
  }
  
  return { startAt, endAt: now }
}

export default defineEventHandler(async (event) => {

  const query = getQuery(event)
  const range = query.range as string || 'month'
  
  try {

    const token = await getUmamiToken()

    const isValid = await verifyToken(token)
    if (!isValid) {
      cachedToken = null
      tokenExpiry = null
      throw createError({
        statusCode: 401,
        statusMessage: '无效的认证令牌'
      })
    }

    const timeRange = getTimeRange(range)

    const stats = await fetchStats(token, timeRange)
    
    return {
      success: true,
      data: stats
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取 Umami 统计数据失败'
    })
  }
})