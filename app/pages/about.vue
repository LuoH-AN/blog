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
			<p>你好, 很高兴认识你</p>
			<h2>我叫 {{ appConfig.author.name }}</h2>
			<p>是一名 学生</p>
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
		</div>

		<div class="card motto-card">
			<span class="label">座右铭</span>
			<p>人生得意须尽欢</p>
		</div>

		<div class="card tech-card">
			<span class="label">关注</span>
			<h3>科技，诗词</h3>
		</div>

		<div class="card music-card">
			<span class="label">音乐</span>
			<h3>周杰伦，周深</h3>
		</div>

		<div class="card info-card personality-card">
			<span class="label">性格</span>
			<div class="content-center">
				<span class="value">调停者</span>
				<span class="value-small">INFP-T</span>
			</div>
			<a href="https://www.16personalities.com/" target="_blank" rel="noopener noreferrer" class="card-link">在
				16personalities 了解更多</a>
		</div>

		<div class="card specialty-card">
			<span class="label">特长</span>
			<p class="specialty-text">
				英语指数 <span class="highlight">MAX</span>
			</p>
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
		</div>

		<div class="card stats-card">
			<span class="label">统计</span>
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
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.about-page {
	max-width: 1000px;
	margin: 0 auto;
	padding: 2rem 1rem;
}

.about-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 3rem;
	padding: 1rem 0;
	text-align: left;

	.left-content {
		h1 {
			margin-bottom: 0.5rem;
			font-size: 2.5rem;
			font-weight: 800;
		}

		p {
			margin: 0;
			font-size: 1.2rem;
			color: var(--c-text-2);
		}
	}

	.right-content {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-frame {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		width: 120px;
		height: 120px;
		border: 3px solid var(--c-border);
		border-radius: 20px;
		background-color: var(--c-bg-soft);
	}

	.avatar-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
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
	padding: 0.5rem 0.8rem;
	border-radius: 0.8rem;
	box-shadow: none;
	background-color: var(--ld-bg-card);
	text-align: center;
	transform: none;
	transition: none;
}

.card:hover {
	box-shadow: none;
	transform: none;
	transition: none;
}

.label {
	position: absolute;
	opacity: 0.8;
	top: 1rem;
	left: 1.2rem;
	margin: 0;
	font-size: 0.8rem;
	color: var(--c-text-2);
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
		right: 0.8rem;
		bottom: 0.5rem;
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
		font-size: 2.5rem;
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
	text-shadow: none;
	color: var(--c-text-1);

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

			&:hover {
				color: var(--c-primary);
			}
		}
	}
}

.stats-card {
	grid-column: 1 / -1;
	margin-bottom: 1.5rem;
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
		margin-bottom: 1rem;
		font-size: 1.5rem;
		color: var(--c-text-1);
	}
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 1rem;
	margin-bottom: 0;

	@media (min-width: 768px) {
		grid-template-columns: repeat(4, 1fr);
	}
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0.5rem;
}

.stat-value {
	margin-bottom: 0.25rem;
	font-size: 2rem;
	font-weight: bold;
	color: var(--c-text-1);
}

.stat-label {
	opacity: 0.9;
	font-size: 0.9rem;
	color: var(--c-text-2);
}

.stats-loading,
.stats-error {
	padding: 2rem;
	font-size: 1.1rem;
	text-align: center;
	color: var(--c-text-1);
}

.stats-error {
	color: var(--c-danger);
}

:root {
	--c-bg-soft: #F5F5F5;
	--c-border: #E0E0E0;
	--c-text-1: #333;
	--c-text-2: #666;
	--c-primary: #007BFF;
	--c-danger: #DC3545;
}

.dark {
	--c-bg-dark-soft: #282828;
	--c-border-dark: #444;
	--c-text-dark-1: #E0E0E0;
	--c-text-dark-2: #B0B0B0;
	--c-primary-dark: #6AF;
	--c-danger-dark: #FF8C8C;

	.card {
		background-color: var(--c-bg-2);
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

	.label {
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
