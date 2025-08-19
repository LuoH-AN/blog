<script setup lang="ts">
const blogLog = [
	{ date: '2025-08-17', content: '加入 萌ICP备 雾ICP备' },
	{ date: '2025-08-16', content: '加入 揪蝉' },
	{ date: '2024-04-19', content: '发布第一篇文章' },
	{ date: '2024-04-10', content: '迁移至 Nuxt' },
	{ date: '2023-04-23', content: '迁移至 Hexo 使用 Anzhiyu 主题' },
	{ date: '2023-04-21', content: '博客建立' },
]
</script>

<template>
<ZWidget card title="更新日志">
	<ul class="timeline">
		<li v-for="(item, index) in blogLog" :key="index" class="timeline-item">
			<span class="date">{{ item.date }}</span>
			<p class="content">
				{{ item.content }}
			</p>
		</li>
	</ul>
</ZWidget>
</template>

<style lang="scss" scoped>

.timeline {
	--line-color: #C9C9C9;
	--c-text-2: var(--custom-c-text-2, #374151);
	--c-text-3: var(--custom-c-text-3, #9CA3AF);
	--font-monospace: var(--custom-font-monospace, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
}

.dark .timeline {
	--line-color: #4B5563;
	--c-text-2: var(--custom-dark-c-text-2, #D1D5DB);
	--c-text-3: var(--custom-dark-c-text-3, #9CA3AF);
}

.timeline {
	position: relative;
	margin: 0 0 0 0.8rem;
	padding: 0.2rem 0;
	list-style: none;
}

.timeline-item {
	position: relative;
	margin-bottom: 1.5rem;
	padding-left: 1.25rem;
}

.timeline-item:last-child {
	margin-bottom: 0;
}

.timeline-item::after {
	content: "";
	position: absolute;
	top: 0.5rem;
	left: 0.25rem;
	width: 1px;
	height: 100%;
	background-color: var(--line-color);
	transform: translateX(-50%);
	z-index: 0;
}

.timeline-item:last-child::after {
	height: calc(100% - 0.75rem);
}

.timeline-item::before {
	content: "";
	position: absolute;
	top: 0.5rem;
	left: 0.25rem;
	width: 0.5rem;
	height: 0.5rem;
	border-radius: 50%;
	background-color: var(--c-text-2);
	transform: translateY(-50%) translateX(-50%);
	transition: transform 0.3s ease, box-shadow 0.3s ease;
	z-index: 1;
}

.timeline-item:hover::before {
	box-shadow: 0 0 8px var(--c-text-2);
	transform: translateY(-50%) translateX(-50%) scale(1.5);
}

.date {
	display: block;
	margin-bottom: 0.3rem;
	font-family: var(--font-monospace);
	font-size: 0.875rem;
	color: var(--c-text-3);
}

.content {
	margin: 0;
	font-size: 0.875rem;
	line-height: 1.5;
	color: var(--c-text-2);
}
</style>
