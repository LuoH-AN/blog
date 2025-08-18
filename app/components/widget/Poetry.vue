<script setup lang="ts">
const poetryData = ref<{
	content: string
	author: string
	dynasty: string
	title: string
} | null>(null)

const error = ref<string | null>(null)

onMounted(() => {
	// 确保 jinrishici SDK 已加载
	if (typeof window.jinrishici !== 'undefined') {
		window.jinrishici.load((result) => {
			try {
				poetryData.value = {
					content: result.data.content,
					author: result.data.origin.author,
					dynasty: result.data.origin.dynasty,
					title: result.data.origin.title,
				}
			}
			catch (err) {
				console.error('解析诗词数据失败:', err)
				error.value = '诗词数据解析失败'
			}
		}, (err) => {
			console.error('获取诗词失败:', err)
			error.value = '获取诗词失败'
		})
	}
	else {
		error.value = '今日诗词 SDK 未加载'
	}
})
</script>

<template>
<ZWidget card title="今日诗词">
	<div v-if="error" class="error">
		{{ error }}
	</div>
	<div v-else-if="poetryData" class="poetry-content">
		<div class="sentence">
			{{ poetryData.content }}
		</div>
		<div class="info">
			【{{ poetryData.dynasty }}】{{ poetryData.author }}《{{ poetryData.title }}》
		</div>
	</div>
	<div v-else class="loading">
		正在加载今日诗词....
	</div>
</ZWidget>
</template>

<style lang="scss" scoped>
.poetry-content {
	.sentence {
		font-size: 1.2em;
		line-height: 1.6;
		text-align: center;
		margin-bottom: 1em;
	}

	.info {
		text-align: right;
		font-size: 0.9em;
		color: var(--c-text-2);
	}
}

.loading, .error {
	text-align: center;
	padding: 1em;
	color: var(--c-text-2);
}
</style>