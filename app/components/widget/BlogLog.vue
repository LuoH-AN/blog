<script setup lang="ts">
const appConfig = useAppConfig()
const timeEstablished = appConfig.timeEstablished

const blogLog = [
	{ date: '2024-04-19', content: '发布第一篇文章' },
	{ date: '2024-04-10', content: '迁移至 Nuxt' },
	{ date: '2023-4-23', content: '迁移至 Hexo 使用 Anzhiyu 主题' },
	{ date: '2023-4-21', content: '博客建立' },
]
</script>

<template>
<ZWidget card title="更新日志">
	<!-- TODO: 优化时间线样式 -->
	<ul>
		<li v-for="(item, index) in blogLog" :key="index">
			<small>{{ item.date }}</small><br>
			{{ item.content }}
		</li>
	</ul>
</ZWidget>
</template>
