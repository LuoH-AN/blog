<script setup lang="ts">
import Lightbox from '~/components/popover/Lightbox.vue'

const appConfig = useAppConfig()

const lightboxEl = ref<HTMLImageElement>()
const isLightboxOpening = ref(false)

function openLightbox(e: Event) {
	const target = e.target as HTMLElement
	if (target.tagName === 'IMG' && target.closest('.tk-content')) {
		lightboxEl.value = target as HTMLImageElement
		isLightboxOpening.value = true
	}
}

function closeLightbox() {
	isLightboxOpening.value = false
}

function setAnonymousComment() {
	const inputGroups = document.querySelectorAll('.tk-meta-input .el-input-group')
	let nickInput: HTMLInputElement | null = null
	let mailInput: HTMLInputElement | null = null

	for (const group of inputGroups) {
		const prependDiv = group.querySelector('.el-input-group__prepend')
		if (prependDiv) {
			if (prependDiv.textContent?.trim() === '昵称')
				nickInput = group.querySelector('input')
			else if (prependDiv.textContent?.trim() === '邮箱')
				mailInput = group.querySelector('input')
		}
	}

	if (!nickInput || !mailInput)
		return

	const disasters = ['台风', '洪水', '地震', '龙卷风', '火山爆发', '海啸', '沙尘暴', '暴风雪']
	const randomDisaster = disasters[Math.floor(Math.random() * disasters.length)]
	nickInput.value = `路过的${randomDisaster}`
	mailInput.value = 'guest@enltlh.me'

	nickInput.dispatchEvent(new Event('input'))
	mailInput.dispatchEvent(new Event('input'))

	setTimeout(() => {
		const sendButton = document.querySelector('.tk-send') as HTMLButtonElement
		if (sendButton) {
			sendButton.disabled = false
			sendButton.style.cursor = 'pointer'
		}
	}, 100)
}

onMounted(() => {
	window.twikoo?.init({
		envId: appConfig.twikoo?.envId,
		el: '#twikoo',
	})
	const twikooEl = document.getElementById('twikoo')
	if (twikooEl)
		twikooEl.addEventListener('click', openLightbox)
})

onUnmounted(() => {
	const twikooEl = document.getElementById('twikoo')
	if (twikooEl)
		twikooEl.removeEventListener('click', openLightbox)
})
</script>

<template>
<section id="comment-section" class="z-comment">
	<div class="comment-header">
		<h3 class="text-creative">
			评论区
		</h3>
		<button class="anonymous-btn" @click="setAnonymousComment">
			匿名评论
		</button>
	</div>
	<div id="twikoo">
		<p>评论加载中...</p>
	</div>
</section>
<ClientOnly>
	<Lightbox
		v-if="lightboxEl"
		:el="lightboxEl"
		:is-opening="isLightboxOpening"
		@close="closeLightbox"
	/>
</ClientOnly>
</template>

<style lang="scss" scoped>
.z-comment {
	margin: 3rem 1rem;

	> h3 {
		margin-top: 3rem;
		font-size: 1.25rem;
	}
}

.comment-header {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 0.5rem;
}

.anonymous-btn {
	border: none;
	background: none;
	font-size: 0.9rem;
	color: var(--c-text-3);
	transition: color 0.2s;
	cursor: pointer;

	&:hover {
		color: var(--c-primary);
	}
}

:deep(#twikoo) {
	margin: 2em 0;

	.tk-admin-container {
		position: fixed;
		z-index: 1;
	}

	.tk-time {
		color: var(--c-text-3);
	}

	.tk-main {
		margin-top: -0.1rem;
	}

	.tk-content {
		margin-top: 0.1rem;

		a {
			display: inline;
			background-image: linear-gradient(to right, rgb(128 128 128 / 30%), rgb(128 128 128 / 30%));
			background-position: left bottom;
			background-repeat: no-repeat;
			background-size: 0% 2px;
			vertical-align: baseline;
			text-decoration: none;
			color: #409EFF;
			transition: background-size 0.3s ease-out, color 0.3s ease-out;

			&:hover {
				background-size: 100% 2px;
				color: #007BFF;
			}
		}
	}

	.tk-comments-title, .tk-nick > strong {
		font-family: var(--font-creative);
	}

	.tk-owo-emotion {
		width: auto;
		height: 1.4em;
		vertical-align: text-bottom;
	}

	.tk-extras, .tk-footer {
		font-size: 0.7rem;
		color: var(--c-text-3);
	}

	.tk-replies:not(.tk-replies-expand) {
		mask-image: linear-gradient(#FFF 50%, transparent);
	}

	.tk-expand {
		border-radius: 0.5rem;
		transition: background-color 0.1s;
	}

	:deep(:where(.tk-preview-container,.tk-content)) {
		pre {
			border-radius: 0.5rem;
			font-size: 0.8125rem;
		}

		p {
			margin: 0.2em 0;
		}

		img {
			border-radius: 0.5em;
		}

		menu, ol, ul {
			margin: 0.5em 0;
			padding-inline-start: 1.5em;
		}
	}

	.tk-submit {
		.tk-col {
			display: flex;
			flex-direction: column;
		}

		.tk-input {
			order: 1;
		}

		.tk-meta-input {
			order: 2;
			margin-top: 0.75rem;
			margin-bottom: 0;
		}
	}

	/* stylelint-disable-next-line selector-class-pattern */
	.el-textarea__inner,
	.tk-meta-input .el-input-group {
		border: 1px solid var(--c-border, #DCDFE6);
		border-radius: 12px;
		background-color: #E3E3E382;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	/* stylelint-disable-next-line selector-class-pattern */
	.el-textarea__inner {
		min-height: 120px;
		padding: 1rem;
	}

	.tk-meta-input .el-input-group {
		overflow: hidden;
		background-color: transparent;
	}

	/* stylelint-disable-next-line selector-class-pattern */
	.tk-meta-input .el-input-group__prepend {
		padding: 0 1.25rem;
		border: none;
		background-color: #FFF;
		color: #555;
	}

	/* stylelint-disable-next-line selector-class-pattern */
	.tk-meta-input .el-input__inner {
		border: none;
		background-color: #E3E3E382;
	}

	/* stylelint-disable-next-line selector-class-pattern */
	.el-textarea__inner:focus,
	.tk-meta-input .el-input-group:focus-within {
		border-color: #409EFF;
		box-shadow: 0 0 0 1px #409EFF;
	}

	.tk-preview,
	.tk-cancel,
	.tk-send {
		border-radius: 8px;
	}
}

.dark :deep(#twikoo) {
	/* stylelint-disable-next-line selector-class-pattern */
	.el-textarea__inner,
	.tk-meta-input .el-input-group {
		border-color: #404040;
		background-color: #1E1E1E;
		color: #E0E0E0;
	}

	/* stylelint-disable-next-line selector-class-pattern */
	.tk-meta-input .el-input-group__prepend {
		border-right: 1px solid #404040;
		background-color: #2C2C2E;
		color: #CCC;
	}

	/* stylelint-disable-next-line selector-class-pattern */
	.tk-meta-input .el-input__inner {
		background-color: #1E1E1E;
		color: #E0E0E0;
	}
}
</style>
