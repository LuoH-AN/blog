<script setup lang="ts">
import type ArticleProps from '~/types/article'
import { getPostTypeClassName } from '~/composables/useArticle'
import { useImageShare } from '~/composables/useCopy'
import { formatNumber } from '~/utils/str'
import { getIsoDatetime, getLocaleDatetime, getPostDate, isTimeDiffSignificant } from '~/utils/time'

defineOptions({ inheritAttrs: false })
const props = defineProps<ArticleProps>()

const appConfig = useAppConfig()

const categoryLabel = computed(() => props.categories?.[0])
const categoryIcon = computed(() => getCategoryIcon(categoryLabel.value))

const shareText = `【${appConfig.title}】${props.title}\n\n${
	props.description ? `${props.description}\n\n` : ''}${
	new URL(props.path!, appConfig.url).href}`

const { copy, copied } = useCopy(shareText)

// 使用图片分享功能
const generateImage = useImageShare(props.title || '文章分享')

// 控制分享菜单显示状态
const showShareMenu = ref(false)

// 文字分享功能
function handleTextShare() {
	copy()
	showShareMenu.value = false
}

// 图片分享功能
async function handleImageShareWrapper() {
	generateImage(() => {
		showShareMenu.value = false
	})
}
</script>

<template>
<div class="post-header" :class="{ 'has-cover': image, 'text-revert': meta?.coverRevert }">
	<NuxtImg v-if="image" class="post-cover" :src="image" :alt="title" />
	<div class="post-nav">
		<div class="operations">
			<div class="share-container">
				<ZButton
					class="share-button-glass"
					:icon="copied ? 'ph:check-bold' : 'ph:share-bold' "
					@click="showShareMenu = !showShareMenu"
				>
					分享
				</ZButton>
				<div v-if="showShareMenu" class="share-menu">
					<div class="share-option" @click="handleTextShare">
						<Icon name="ph:text-align-left-bold" />
						<span>文字分享</span>
					</div>
					<div class="share-option" @click="handleImageShareWrapper">
						<Icon name="ph:image-bold" />
						<span>图片分享</span>
					</div>
				</div>
			</div>
		</div>

		<div v-if="!meta?.hideInfo" class="post-info">
			<time
				v-if="date"
				v-tip="`创建于 ${getLocaleDatetime(props.date)}`"
				:datetime="getIsoDatetime(date)"
			>
				<Icon name="ph:calendar-dots-bold" />
				{{ getPostDate(props.date) }}
			</time>

			<time
				v-if="isTimeDiffSignificant(date, updated, .999)"
				v-tip="`修改于 ${getLocaleDatetime(props.updated)}`"
				:datetime="getIsoDatetime(updated)"
			>
				<Icon name="ph:calendar-plus-bold" />
				{{ getPostDate(props.updated) }}
			</time>

			<span v-if="categoryLabel">
				<Icon :name="categoryIcon" />
				{{ categoryLabel }}
			</span>

			<span>
				<Icon name="ph:paragraph-bold" />
				{{ formatNumber(readingTime?.words) }} 字
			</span>
		</div>
	</div>

	<h1 class="post-title" :class="getPostTypeClassName(type)">
		{{ title }}
	</h1>
</div>
</template>

<style lang="scss" scoped>
.post-header {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: 1rem;
	margin: 0.5rem;
	border-radius: 1rem;
	background-color: var(--c-bg-2);
	color: var(--c-text);

	@media (max-width: $breakpoint-mobile) {
		margin: 0;
		border-radius: 0;
	}

	&:hover .operations {
		opacity: 1;
	}

	&.has-cover {
		position: relative;
		overflow: hidden;
		overflow: clip;
		min-height: 256px;
		max-height: 320px;
		color: white;
		transition: font-size 0.2s;

		&:hover {
			font-size: 0.8em;
		}

		.post-info > * {
			display: inline-flex;
			align-items: center;
			gap: 0.4em;
			padding: 0.25em 0.75em;
			border: 1px solid rgb(255 255 255 / 20%);
			border-radius: 8px;
			background: transparent;
			backdrop-filter: blur(8px);
			transition: all 0.2s;
		}

		.post-title {
			background-image: linear-gradient(transparent, #0003, #0005);
			text-shadow: 0 1px 1px #0003, 0 1px 2px #0003;

			&.text-story {
				text-align: center;
			}
		}

		&.text-revert {
			text-shadow: 0 0 2px #FFF, 0 1px 0.5em #FFF;
			color: #333;

			.post-title {
				background-image: linear-gradient(transparent, #FFF3, #FFF5);
			}
		}
	}
}

.operations {
	position: absolute;
	opacity: 0;
	inset-inline-end: 1em;
	color: var(--c-text-1);
	transition: opacity 0.2s;
	z-index: 1;
}

.share-container {
	position: relative;
}

.share-menu {
	position: absolute;
	overflow: hidden;
	top: 100%;
	right: 0;
	min-width: 120px;
	margin-top: 0.5rem;
	border: 1px solid var(--c-border);
	border-radius: 0.5rem;
	box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
	background-color: var(--c-bg-2);
	z-index: 10;
}

.share-option {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	transition: background-color 0.2s;
	cursor: pointer;

	&:hover {
		background-color: var(--c-bg-1);
	}

	span {
		font-size: 0.9rem;
	}
}

.post-cover {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	z-index: 0;
}

.post-title {
	padding: 0.8em 1rem;
	font-size: 1.6em;
	line-height: 1.2;
	z-index: 1;
}

.post-nav {
	position: relative;
	padding: 0.8em 1rem;
	z-index: 1;

	>* {
		font-size: 0.8rem;
	}

	.post-info {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6em;
	}
}
</style>
