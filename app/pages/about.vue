<script setup lang="ts">
import { onMounted } from 'vue'
import { useUmamiStats } from '~/composables/useUmamiStats'

const appConfig = useAppConfig()
useSeoMeta({
	title: '关于',
	description: `关于 ${appConfig.author.name} 以及这个博客的一切。`,
})

const { stats, loading, error, fetchTotalStats } = useUmamiStats()

onMounted(() => {
	fetchTotalStats()
})

const layoutStore = useLayoutStore()
layoutStore.setAside([])

const birthYear = appConfig.component.stats.birthYear
const age = new Date().getFullYear() - birthYear
</script>

<template>
<div class="about-page">
	<header class="about-header">
		<div class="left-content">
			<h1>关于我</h1>
			<p>落人间，破三弦，忆李仙。</p>
		</div>
		<div class="right-content">
			<div class="avatar-frame">
				<img :src="appConfig.author.avatar" alt="作者头像" class="avatar-image">
			</div>
		</div>
	</header>

	<div class="cards-grid">
		<div class="card intro-card">
			<p>你好, 很高兴认识你👋</p>
			<h2>我叫 {{ appConfig.author.name }}</h2>
			<p>是一名 学生、开发者、博主</p>
			<Icon name="ph:rocket-launch-bold" class="card-bg-icon" />
		</div>

		<div class="card info-card">
			<div class="info-item special-info-item">
				<span class="label">生于</span>
				<span class="value">{{ birthYear }}</span>
			</div>
			<div class="info-item special-info-item">
				<span class="label">当前</span>
				<span class="value">{{ age }} 岁</span>
			</div>
			<Icon name="ph:calendar-blank-bold" class="card-bg-icon" />
		</div>

		<div class="card motto-card">
			<span class="label">座右铭</span>
			<p>人生得意须尽欢</p>
			<Icon name="ph:heart-bold" class="card-bg-icon" />
		</div>

		<div class="card tech-card">
			<span class="label">关注偏好</span>
			<h3>科技，诗词</h3>
			<Icon name="ph:desktop-tower-bold" class="card-bg-icon" />
		</div>

		<div class="card music-card">
			<span class="label">音乐偏好</span>
			<h3>周杰伦，周深</h3>
			<Icon name="ph:music-notes-simple-bold" class="card-bg-icon" />
		</div>

		<div class="card info-card personality-card">
			<span class="label">性格</span>
			<div class="content-center">
				<span class="value">调停者</span>
				<span class="value-small">INFP-T</span>
			</div>
			<a href="https://www.16personalities.com/" target="_blank" rel="noopener noreferrer" class="card-link">在
				16personalities 了解更多</a>
			<Icon name="ph:user-focus-bold" class="card-bg-icon" />
		</div>

		<div class="card specialty-card">
			<span class="label">特长</span>
			<p class="specialty-text">
				稳稳当当的 <span class="highlight">“高冷”者</span>
			</p>
			<p class="specialty-text">
				英语指数 <span class="highlight">MAX</span>
			</p>
			<Icon name="ph:game-controller-bold" class="card-bg-icon" />
		</div>

		<div class="card contact-card">
			<span class="label">联系我</span>
			<div class="contact-links">
				<a href="https://github.com/LuoH-AN" target="_blank" rel="noopener noreferrer" title="GitHub:LuoH-AN">
					<Icon name="ph:github-logo-fill" />
				</a>
				<a
					href="mailto:enltlh@gmail.com" target="_blank" rel="noopener noreferrer"
					title="Email:enltlh@gmail.com"
				>
					<Icon name="ph:envelope-simple-fill" />
				</a>
				<a
					href="https://qm.qq.com/q/9sljinl6rC" target="_blank" rel="noopener noreferrer"
					title="QQ:1412219758"
				>
					<Icon name="ri:qq-fill" />
				</a>
			</div>
			<Icon name="ph:address-book-bold" class="card-bg-icon" />
		</div>

		<div class="card stats-card">
			<span class="label">网站统计</span>
			<div v-if="loading" class="stats-loading">
				加载中...
			</div>
			<div v-else-if="error" class="stats-error">
				{{ error }}
			</div>
			<div v-else-if="stats" class="stats-content">
				<div class="stats-range-section">
					<div class="stats-grid">
						<div class="stat-item">
							<span class="stat-value">{{ stats.pageviews.value }}</span>
							<span class="stat-label">浏览量</span>
						</div>
						<div class="stat-item">
							<span class="stat-value">{{ stats.visitors.value }}</span>
							<span class="stat-label">访客数</span>
						</div>
						<div class="stat-item">
							<span class="stat-value">{{ stats.visits.value }}</span>
							<span class="stat-label">访问次数</span>
						</div>
						<div class="stat-item">
							<span class="stat-value">{{ Math.round(stats.totaltime.value / 60) }}</span>
							<span class="stat-label">分钟停留</span>
						</div>
					</div>
				</div>
			</div>
			<Icon name="ph:chart-line-bold" class="card-bg-icon" />
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.about-page {
	max-width: 1000px;
	margin: 0 auto;
	padding: 2rem 1rem;
	animation: float-in 0.3s backwards;
}

.about-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 3rem;
	padding: 1rem 0;
	text-align: left;
	.left-content {
		h1 {
			font-size: 2.5rem;
			font-weight: 800;
			margin-bottom: 0.5rem;
		}
		p {
			font-size: 1.2rem;
			color: var(--c-text-2);
			margin: 0;
		}
	}
	.right-content {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.avatar-frame {
		width: 120px;
		height: 120px;
		border-radius: 20px;
		overflow: hidden;
		background-color: var(--c-bg-soft);
		border: 3px solid var(--c-border);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.avatar-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
}

.cards-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 1.5rem;
}

.card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
	min-height: 220px;
	padding: 2rem 1.5rem;
	border-radius: 1.5rem;
	text-align: center;
	transition: none;
	background-color: white;
	border: 1px solid #ccc;
	box-shadow: none;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(135, 206, 235, 0.2);
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		border-radius: 1.5rem;
		z-index: 1;
	}

	>* {
		position: relative;
		z-index: 2;
	}

	&:hover {
		transform: none;
		box-shadow: none;

		&::before {
			opacity: 1;
		}
	}

	.label {
		position: absolute;
		opacity: 0.8;
		top: 1rem;
		left: 1.5rem;
		margin: 0;
		font-size: 0.8rem;
		color: var(--c-text-2);
	}

	.card-bg-icon {
		position: absolute;
		opacity: 0.1;
		right: 1rem;
		bottom: 1rem;
		font-size: 5rem;
		pointer-events: none;
		color: var(--c-text-1);
		z-index: 2;
	}
}

.intro-card {
	grid-column: 1 / -1;
	color: var(--c-text-1);

	h2 {
		margin: 0.5rem 0;
		font-size: 3rem;
		font-weight: bold;
	}
}

.info-card {
	align-items: stretch;
	justify-content: center;
	padding: 2.5rem 1.5rem;
	color: var(--c-text-1);

	.special-info-item {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		align-items: flex-start;
		justify-content: center;
		position: relative;
		width: 100%;

		.label {
			flex-shrink: 0;
			position: static;
			width: 100%;
			margin-bottom: 0.5rem;
			text-align: left;
		}
	}

	.value {
		display: block;
		width: 100%;
		font-size: 2.5rem;
		font-weight: bold;
		text-align: center;
	}

	.value-small {
		display: block;
		width: 100%;
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
	}

	.card-link {
		position: absolute;
		right: 1.5rem;
		bottom: 1rem;
		font-size: 0.8rem;
		text-decoration: none;
		color: var(--c-text-2);

		&:hover {
			color: var(--c-primary);
		}
	}
}

.motto-card {
	display: flex;
	flex-direction: column;
	justify-content: center;
	color: var(--c-text-1);

	p {
		margin: 0;
		font-size: 2.5rem;
		font-weight: bold;
		line-height: 1.2;
	}
}

.tech-card {
	display: flex;
	flex-direction: column;
	min-height: 250px;
	color: var(--c-text-1);

	h3 {
		margin: 0.5rem 0;
		font-size: 3rem;
		font-weight: bold;
	}

	p {
		color: var(--c-text-2);
	}
}

.music-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 250px;
	color: var(--c-text-1);
	text-shadow: none;

	h3 {
		font-size: 2.5rem;
		font-weight: bold;
	}
}

.personality-card {
	color: var(--c-text-1);
}

.specialty-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	font-size: 1.8rem;
	font-weight: bold;
	text-align: center;
	color: var(--c-text-1);

	.specialty-text {
		margin: 0.2em 0;
	}

	.highlight {
		display: inline-block;
		font-size: 2.5rem;
		line-height: 1;
		color: var(--c-primary);
	}
}

.contact-card {
	grid-column: 1 / -1;
	color: var(--c-text-1);

	.contact-links {
		display: flex;
		gap: 1.5rem;

		a {
			font-size: 2.5rem;
			color: var(--c-text-1);
			transition: transform 0.2s;

			&:hover {
				transform: scale(1.1);
				color: var(--c-primary);
			}
		}
	}
}

.stats-card {
	grid-column: 1 / -1;
	color: var(--c-text-1);
}

.stats-card .label {
	color: inherit;
}

.stats-content {
	width: 100%;
}

.stats-range-section {
	margin-bottom: 0;

	h3 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: var(--c-text-1);
	}
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	gap: 1rem;
	margin-bottom: 0;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0.5rem;
}

.stat-value {
	font-size: 2rem;
	font-weight: bold;
	margin-bottom: 0.25rem;
	color: var(--c-text-1);
}

.stat-label {
	font-size: 0.9rem;
	opacity: 0.9;
	color: var(--c-text-2);
}

.stats-loading,
.stats-error {
	text-align: center;
	padding: 2rem;
	font-size: 1.1rem;
	color: var(--c-text-1);
}

.stats-error {
	color: var(--c-danger);
}

:root {
	--c-bg-soft: #f5f5f5;
	--c-border: #e0e0e0;
	--c-text-1: #333;
	--c-text-2: #666;
	--c-primary: #007bff;
	--c-danger: #dc3545;
}

.dark {
	--c-bg-dark-soft: #282828;
	--c-border-dark: #444;
	--c-text-dark-1: #e0e0e0;
	--c-text-dark-2: #b0b0b0;
	--c-primary-dark: #66aaff;
	--c-danger-dark: #ff8c8c;

	.card {
		background-color: var(--c-bg-dark-soft);
		border-color: #666;
		box-shadow: none;
	}

	.card,
	.intro-card,
	.info-card,
	.motto-card,
	.tech-card,
	.music-card,
	.personality-card,
	.specialty-card,
	.contact-card,
	.stats-card {
		color: var(--c-text-dark-1);
	}

	.label,
	.card-bg-icon {
		color: var(--c-text-dark-2);
	}

	.info-card {
		.card-link {
			color: var(--c-text-dark-2);

			&:hover {
				color: var(--c-primary-dark);
			}
		}
	}

	.tech-card p,
	.stat-label {
		color: var(--c-text-dark-2);
	}

	.specialty-card .highlight {
		color: var(--c-primary-dark);
	}

	.contact-card a {
		color: var(--c-text-dark-1);

		&:hover {
			color: var(--c-primary-dark);
		}
	}

	.stats-loading,
	.stats-error {
		color: var(--c-text-dark-1);
	}

	.stats-error {
		color: var(--c-danger-dark);
	}

	a {
		color: var(--c-text-dark-1);
	}
}
</style>
