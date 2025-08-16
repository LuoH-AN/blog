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
.seasonal {
	position: relative;
	overflow: hidden;
	z-index: 0;

	&::before {
		content: "";
		position: absolute;
		opacity: 0.2;
		inset: 0;
		background: center / cover;
		background-image: var(--seasonal-bg);
		z-index: -1;
	}
	border: none;
	box-shadow: none;
}

.tech-stack-info {
	background-image: linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url('https://cdn2.enltlh.me/pichub/1/2025/b1679340b26e666e.png');
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	padding: 1rem;
	border-radius: 8px;
	color: #333;
	border: none;
	box-shadow: none;
}

.seasonal-emoji::before, .seasonal-emoji::after {
	content: var(--seasonal-emoji, "\1F595");
}
</style>
