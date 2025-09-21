import { ref } from 'vue'

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

export function useUmamiStats() {
	const stats = ref<UmamiStatsData | null>(null)
	const loading = ref<boolean>(true)
	const error = ref<string | null>(null)

	const fetchTotalStats = async () => {
		loading.value = true
		error.value = null
		try {
			const response = await fetch('/api/umami')

			if (!response.ok) {
				const errData = await response.json()
				throw new Error(errData.statusMessage || `HTTP error! status: ${response.status}`)
			}

			const result = await response.json()
			stats.value = result.data as UmamiStatsData
		}
		catch (err: any) {
			error.value = err.message || '获取统计数据失败'
			console.error('获取 Umami 统计数据失败:', err)
		}
		finally {
			loading.value = false
		}
	}

	return {
		stats,
		loading,
		error,
		fetchTotalStats,
	}
}
