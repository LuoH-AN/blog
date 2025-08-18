<script setup lang="ts">
const appConfig = useAppConfig()
useSeoMeta({
	title: '关于',
	description: `关于 ${appConfig.author.name} 以及这个博客的一切。`,
})

const layoutStore = useLayoutStore()

layoutStore.setAside([])

const birthYear = appConfig.stats.birthYear
const age = new Date().getFullYear() - birthYear
</script>

<template>
<div class="about-page">
	<header class="about-header">
		<h1>关于我</h1>
		<p>落人间，破三弦，忆李仙。</p>
	</header>

	<div class="cards-grid">
		<!-- Card 1: Intro -->
		<div class="card intro-card">
			<p>你好, 很高兴认识你👋</p>
			<h2>我叫 {{ appConfig.author.name }}</h2>
			<p>是一名 学生、开发者、博主</p>
			<Icon name="ph:rocket-launch-bold" class="card-bg-icon" />
		</div>

		<!-- Card 2: Born -->
		<div class="card info-card">
			<div class="info-item special-info-item">
				<span class="label">生于</span>
				<span class="value text-blue">{{ birthYear }}</span>
			</div>
			<div class="info-item special-info-item">
				<span class="label">当前</span>
				<span class="value text-purple">{{ age }} 岁 👨‍🎓</span>
			</div>
			<Icon name="ph:calendar-blank-bold" class="card-bg-icon" />
		</div>

		<!-- Card 3: Motto -->
		<div class="card motto-card">
			<span class="label">座右铭</span>
			<p>人生须尽欢</p>
			<p>莫使空对月</p>
			<Icon name="ph:heart-bold" class="card-bg-icon" />
		</div>

		<!-- Card 4: Tech -->
		<div class="card tech-card">
			<span class="label">关注偏好</span>
			<h3>数码科技</h3>
			<p>手机、电脑软硬件</p>
			<Icon name="ph:desktop-tower-bold" class="card-bg-icon" />
		</div>

		<!-- Card 5: Music -->
		<div class="card music-card">
			<span class="label">音乐偏好</span>
			<h3>周杰伦，周深</h3>
			<Icon name="ph:music-notes-simple-bold" class="card-bg-icon" />
		</div>

		<!-- Card 6: Personality -->
		<div class="card info-card personality-card">
			<span class="label">性格</span>
			<div class="content-center">
				<span class="value text-gray">调停者</span>
				<span class="value-small text-gray">INFP-T</span>
			</div>
			<a href="https://www.16personalities.com/" target="_blank" rel="noopener noreferrer" class="card-link">在 16personalities 了解更多</a>
			<Icon name="ph:user-focus-bold" class="card-bg-icon" />
		</div>

		<!-- Card 7: Specialty -->
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

		<!-- Card 8: Contact -->
		<div class="card contact-card">
			<span class="label">联系我</span>
			<div class="contact-links">
				<a href="https://github.com/LuoH-AN" target="_blank" rel="noopener noreferrer" title="GitHub:LuoH-AN">
					<Icon name="ph:github-logo-fill" />
				</a>
				<a href="mailto:enltlh@gmail.com" target="_blank" rel="noopener noreferrer" title="Email:enltlh@gmail.com">
					<Icon name="ph:envelope-simple-fill" />
				</a>
				<a href="https://qm.qq.com/q/9sljinl6rC" target="_blank" rel="noopener noreferrer" title="QQ:1412219758">
					<Icon name="ri:qq-fill" />
				</a>
			</div>
			<Icon name="ph:address-book-bold" class="card-bg-icon" />
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
	margin-bottom: 3rem;
	text-align: center;

	h1 {
		font-size: 2.5rem;
		font-weight: 800;
	}

	p {
		font-size: 1.2rem;
		color: var(--c-text-2);
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
	min-height: 220px; // Slightly increased height
	padding: 2rem 1.5rem; // Increased padding for content spacing
	border-radius: 1.5rem;
	text-align: center;
	transition: none;

	&:hover {
		transform: none;
	}

	.label {
		position: absolute;
		opacity: 0.8;
		top: 1rem;
		left: 1.5rem;
		margin: 0;
		font-size: 0.8rem; // Smaller label
	}

	.card-bg-icon {
		position: absolute;
		opacity: 0.1;
		right: 1rem;
		bottom: 1rem;
		font-size: 5rem;
		pointer-events: none;
	}
}

.intro-card {
	grid-column: 1 / -1;
	background: linear-gradient(to right, rgb(218 136 147), rgb(235 201 205));
	color: white;

	h2 {
		margin: 0.5rem 0;
		font-size: 3rem; // Larger content text
		font-weight: bold;
	}
}

.info-card {
	align-items: stretch;
	justify-content: center;
	padding: 2.5rem 1.5rem; // More vertical padding
	background: linear-gradient(to right, rgb(178 235 201), rgb(231 195 114), rgb(227 101 105));
	color: #333;

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
			position: static; // Override absolute positioning
			width: 100%;
			margin-bottom: 0.5rem;
			text-align: left;
		}
	}

	.content-center {
		// A wrapper to help center content when label is absolute
	}

	.value {
		display: block;
		width: 100%;
		font-size: 2.5rem; // Larger content text
		font-weight: bold;
		text-align: center;
	}

	.value-small {
		display: block;
		width: 100%;
		font-size: 2rem; // Larger content text
		font-weight: bold;
		text-align: center;
	}
	.text-blue { color: #007BFF; }
	.text-purple { color: #6F42C1; }
	.text-gray { color: #6C757D; }

	.card-link {
		position: absolute;
		right: 1.5rem;
		bottom: 1rem;
		font-size: 0.8rem;
		text-decoration: none;
		color: #6C757D;

		&:hover {
			color: #0056B3;
		}
	}
}

.motto-card {
	display: flex;
	flex-direction: column;
	justify-content: center;
	background: linear-gradient(to right, rgb(21 108 165), rgb(89 193 230), rgb(230 230 230));
	text-align: center;
	color: white;

	p {
		margin: 0;
		font-size: 2.5rem; // Larger content text
		font-weight: bold;
		line-height: 1.2;
	}
}

.tech-card {
	display: flex;
	flex-direction: column;
	min-height: 250px;
	background: linear-gradient(to right, rgb(107 107 193), rgb(114 148 211), rgb(125 214 208));
	color: white;

	h3 {
		margin: 0.5rem 0;
		font-size: 3rem; // Larger content text
		font-weight: bold;
	}

	p {
		color: #CCC;
	}
}

.music-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 250px;
	background: linear-gradient(to right, rgb(221 19 0), rgb(225 155 5));
	text-align: center;
	text-shadow: 0 2px 4px rgb(0 0 0 / 20%);
	color: white;

	h3 {
		font-size: 2.5rem; // Larger content text
		font-weight: bold;
	}
}

.personality-card {
	background: linear-gradient(to right, rgb(148 235 100), rgb(100 235 194));
}

.specialty-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: linear-gradient(to right, rgb(96 215 193), rgb(152 162 209));
	font-size: 1.8rem;
	font-weight: bold;
	text-align: center;
	color: white;

	.specialty-text {
		margin: 0.2em 0;
	}

	.highlight {
		display: inline-block;
		font-size: 2.5rem;
		line-height: 1;
	}
}

.contact-card {
	grid-column: 1 / -1;
	background: linear-gradient(to right, rgb(235 133 82), rgb(235 74 78));
	color: white;

	.contact-links {
		display: flex;
		gap: 1.5rem;

		a {
			font-size: 2.5rem;
			color: white;
			transition: transform 0.2s;

			&:hover {
				transform: scale(1.1);
			}
		}
	}
}

.dark {
	.intro-card {
		background: linear-gradient(to right, #2C3E50, #4CA1AF);
	}

	.info-card {
		background: linear-gradient(to right, #0F2027, #203A43, #2C5364);
		color: #EEE;

		.text-blue, .text-purple, .text-gray {
			color: #ADADAD;
		}
	}

	.motto-card {
		background: linear-gradient(to right, #141E30, #243B55);
	}

	.tech-card {
		background: linear-gradient(to right, #1E1E1E, #2D2D2D);
	}

	.music-card {
		background: linear-gradient(to right, #430000, #7A0000);
	}

	.personality-card {
		background: linear-gradient(to right, #0F340F, #1A531A);
		color: #EEE;

		.text-gray {
			color: #ADADAD;
		}
	}

	.specialty-card {
		background: linear-gradient(to right, #302B63, #24243E);
	}

	.contact-card {
		background: linear-gradient(to right, #4E2F0F, #6A3F14);

		a {
			color: white;
		}
	}
}
</style>
