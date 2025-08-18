<script setup lang="ts">
import type { CSSProperties } from 'vue'

const appConfig = useAppConfig()

const contentStyle = computed<CSSProperties>(() => ({
	'--seasonal-bg': appConfig.seasonal.widgetBackground
		? `url(${appConfig.seasonal.widgetBackground})`
		: undefined,
	'--seasonal-emoji': appConfig.seasonal.emoji,
}))
</script>

<template>
<ZWidget
	card
	title="可访问性"
	content-class="seasonal"
	:style="contentStyle"
>
	<p class="tech-stack-info">
		🔗 域名 续费至2026年 <br>
		📑 博客 由 Nuxt Content 进行驱动 <br>
		📷 图片 托管于 落憾图床 <br>
		⚡ 部署 由 Vercel 提供支持 <br>
	</p>
</ZWidget>
</template>

<style lang="scss" scoped>
:deep(.seasonal) {
	position: relative;
	overflow: hidden;
	border: none;
	box-shadow: none;
	z-index: 0;

	&::before {
		content: "";
		position: absolute;
		opacity: 0.2;
		inset: 0;
		border-radius: 0.8rem;
		z-index: -1;
	}
}

.tech-stack-info {
	padding: 1rem;
	border: none;
	border-radius: 8px;
	box-shadow: none;
	color: #333;
	transition: background-color 0.3s, color 0.3s; /* 添加平滑过渡效果 */
}

.seasonal-emoji::before, .seasonal-emoji::after {
	content: var(--seasonal-emoji, "\1F595");
}

.dark .tech-stack-info {
	color: #E6E6E6; /* 浅灰色文字 */
}
</style>
