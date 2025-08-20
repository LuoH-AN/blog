import { ref } from 'vue'

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

export const useUmamiStats = () => {
  const stats = ref<UmamiStats | null>(null)
  const loading = ref<boolean>(true)
  const error = ref<string | null>(null)

  const fetchStats = async (range: 'day' | 'week' | 'month' | 'year' = 'month') => {
    try {
      loading.value = true
      error.value = null

      const response = await fetch(`/api/umami-stats?range=${range}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      stats.value = result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取统计数据失败'
      console.error('获取 Umami 统计数据失败:', err)
    } finally {
      loading.value = false
    }
  }
  
  return {
    stats,
    loading,
    error,
    fetchStats
  }
}