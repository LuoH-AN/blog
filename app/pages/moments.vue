<script setup lang="ts">
import type { MomentData, MomentItem } from '../types/moments'
import Lightbox from '~/components/popover/Lightbox.vue'
import blogConfig from '../../blog.config'
import { getFavicon } from '../utils/img'

const appConfig = useAppConfig()
useSeoMeta({
	title: '瞬间',
	description: `${appConfig.title}的闲言碎语。`,
})

// --- Login Status ---
const apiAuth = ref(false)
const isLoggedIn = computed(() => apiAuth.value)

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'blog-log', 'poetry'])

// --- API Data ---
interface MomentApiResponse {
	status: number
	message: string
	data: {
		isAuthenticated: boolean
		moments: MomentData
	}
}
const {
	data: apiResponse,
	pending,
	error,
	refresh,
} = await useFetch<MomentApiResponse>('/api/moments')
const momentData = computed(() => apiResponse.value?.data?.moments || [])
apiAuth.value = apiResponse.value?.data?.isAuthenticated || false
watch(apiResponse, (newResponse) => {
	apiAuth.value = newResponse?.data?.isAuthenticated || false
})

// --- Local State ---
interface MomentFormItem {
	id: string
	user: {
		name: string
		avatar: string
		avatarLink: string
	}
	moment: MomentItem
}
const momentForms = ref<MomentFormItem[]>([])
const editingMoment = ref<MomentFormItem | null>(null)

// Watch for data changes to populate local form state
watch(
	momentData,
	(newData) => {
		if (newData) {
			momentForms.value = []
			newData.forEach((user, userIndex) => {
				user.moment_list.forEach((moment, momentIndex) => {
					momentForms.value.push({
						id: `${userIndex}-${momentIndex}`,
						user: {
							name: user.name,
							avatar: user.avatar,
							avatarLink: user.avatarLink || '',
						},
						moment,
					})
				})
			})
			momentForms.value.sort(
				(a, b) =>
					new Date(b.moment.date).getTime() - new Date(a.moment.date).getTime(),
			)
		}
	},
	{ immediate: true },
)

// --- Actions ---
const confirmStates = ref<Record<string, boolean>>({})
const loadingStates = ref<Record<string, boolean>>({})

async function handleProtectedAction(
	id: string,
	action: () => Promise<void> | void,
) {
	if (confirmStates.value[id]) {
		delete confirmStates.value[id]
		loadingStates.value[id] = true
		try {
			await action()
		}
		finally {
			loadingStates.value[id] = false
		}
	}
	else {
		Object.keys(confirmStates.value).forEach(
			key => delete confirmStates.value[key],
		)
		confirmStates.value[id] = true
		setTimeout(() => {
			if (confirmStates.value[id])
				delete confirmStates.value[id]
		}, 2000)
	}
}

async function logout() {
	const authToken = useCookie('auth_token')
	authToken.value = null
	apiAuth.value = false
	navigateTo('/login')
}

function openEditOverlay(form?: MomentFormItem) {
	if (form) {
		editingMoment.value = JSON.parse(JSON.stringify(form))
	}
	else {
		editingMoment.value = {
			id: `new-${Date.now()}`,
			user: {
				name: blogConfig.author.name,
				avatar: blogConfig.author.avatar,
				avatarLink: blogConfig.url,
			},
			moment: {
				content: '',
				date: new Date().toLocaleString('sv-SE').replace('T', ' '),
				tags: [],
				image: [],
				address: '',
			},
		}
	}
	// Ensure tags and image are arrays
	if (editingMoment.value && !editingMoment.value.moment.tags)
		editingMoment.value.moment.tags = []

	if (editingMoment.value && !editingMoment.value.moment.image)
		editingMoment.value.moment.image = []
}

function closeEditOverlay() {
	editingMoment.value = null
}

async function saveEditingMoment() {
	if (!editingMoment.value)
		return
	const isNew = editingMoment.value.id.startsWith('new-')

	const forms = [...momentForms.value]
	if (isNew) {
		forms.unshift(editingMoment.value)
	}
	else {
		const index = forms.findIndex(f => f.id === editingMoment.value!.id)
		if (index !== -1)
			forms[index] = editingMoment.value
	}

	await updateMomentsApi(forms)
	closeEditOverlay()
}

async function deleteMoment(formId: string) {
	const updatedForms = momentForms.value.filter(f => f.id !== formId)
	await updateMomentsApi(updatedForms)
}

async function updateMomentsApi(forms: MomentFormItem[]) {
	try {
		const newDataToSave: MomentData = []
		forms.forEach((formItem) => {
			let userEntry = newDataToSave.find(u => u.name === formItem.user.name)
			if (!userEntry) {
				userEntry = { ...formItem.user, moment_list: [] }
				newDataToSave.push(userEntry)
			}
			userEntry.moment_list.push(formItem.moment)
		})

		await $fetch('/api/moments', { method: 'POST', body: newDataToSave })
		await refresh()
	}
	catch (err) {
		console.error('更新数据时出错:', err)
		if ((err as any).response?.status === 401)
			navigateTo('/login')
	}
}

// --- Form Helpers ---
const showTagInput = ref(false)
const newTagText = ref('')
const tagInputRef = ref<HTMLInputElement | null>(null)
const tagOverlayVisible = ref<Record<string, any>>({})
const tagClickTimeout = ref<Record<string, number>>({})
const tagClickCount = ref<Record<string, number>>({})

function handleClickOutside(event: MouseEvent) {
	if ((event.target as HTMLElement).closest('.add-tag-btn'))
		return

	Object.keys(tagOverlayVisible.value).forEach((key) => {
		if (tagOverlayVisible.value[key] === true) {
			const tagCard = document.querySelector(`[data-tag-key="${key}"]`)
			if (tagCard && !tagCard.contains(event.target as Node)) {
				tagOverlayVisible.value[key] = false
				tagOverlayVisible.value[`${key}-mode`] = undefined
			}
		}
	})

	if (showTagInput.value) {
		const tagInputContainer = document.querySelector('.tag-input-container')
		if (
			tagInputContainer
			&& !tagInputContainer.contains(event.target as Node)
		) {
			confirmAddTag()
		}
	}
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
})

function addTagInput() {
	showTagInput.value = true
	nextTick(() => tagInputRef.value?.focus())
}
function confirmAddTag() {
	if (editingMoment.value && newTagText.value.trim()) {
		if (!editingMoment.value.moment.tags)
			editingMoment.value.moment.tags = []
		editingMoment.value.moment.tags.push(newTagText.value.trim())
	}
	newTagText.value = ''
	showTagInput.value = false
}

function handleTagClick(tagIndex: number) {
	const key = `${tagIndex}`
	tagClickCount.value[key] = (tagClickCount.value[key] || 0) + 1

	if (tagClickCount.value[key] === 1) {
		tagClickTimeout.value[key] = window.setTimeout(() => {
			showTagEditOverlay(tagIndex)
			tagClickCount.value[key] = 0
		}, 300)
	}
	else if (tagClickCount.value[key] === 2) {
		clearTimeout(tagClickTimeout.value[key])
		showTagDeleteOverlay(tagIndex)
		tagClickCount.value[key] = 0
	}
}

function showTagEditOverlay(tagIndex: number) {
	const key = `${tagIndex}`
	tagOverlayVisible.value[key] = true
	tagOverlayVisible.value[`${key}-mode`] = 'edit'
}

function showTagDeleteOverlay(tagIndex: number) {
	const key = `${tagIndex}`
	tagOverlayVisible.value[key] = true
	tagOverlayVisible.value[`${key}-mode`] = 'delete'
}

function editTag(tagIndex: number) {
	if (editingMoment.value?.moment.tags) {
		const currentTag = editingMoment.value.moment.tags[tagIndex]
		showTagInput.value = true
		newTagText.value = currentTag || ''
		editingMoment.value.moment.tags.splice(tagIndex, 1)
		nextTick(() => {
			tagInputRef.value?.focus()
		})
	}
	const key = `${tagIndex}`
	tagOverlayVisible.value[key] = false
}

function deleteTag(tagIndex: number) {
	if (editingMoment.value?.moment.tags) {
		editingMoment.value.moment.tags.splice(tagIndex, 1)
	}
	const key = `${tagIndex}`
	tagOverlayVisible.value[key] = false
}
function addImageInput() {
	if (editingMoment.value) {
		if (!editingMoment.value.moment.image)
			editingMoment.value.moment.image = []
		editingMoment.value.moment.image.push('')
	}
}
function removeImageInput(index: number) {
	if (editingMoment.value?.moment.image)
		editingMoment.value.moment.image.splice(index, 1)
}
function setCurrentDateTime() {
	if (editingMoment.value) {
		editingMoment.value.moment.date = new Date()
			.toLocaleString('sv-SE')
			.replace('T', ' ')
	}
}

// --- Display Helpers ---
function scrollToComment(content: string) {
	const commentSection = document.getElementById('comment-section')
	if (commentSection) {
		commentSection.scrollIntoView({ behavior: 'smooth' })
		const textarea = commentSection.querySelector(
			'.tk-submit textarea',
		) as HTMLTextAreaElement | null
		if (textarea) {
			textarea.focus()
			textarea.value = `> ${content}\n\n`
			textarea.dispatchEvent(new Event('input', { bubbles: true }))
		}
	}
}
function getFaviconUrl(url: string): string {
	try {
		const domain = new URL(url).hostname
		return getFavicon(domain, { provider: 'google', size: 32 })
	}
	catch (e) {
		console.error('Invalid URL for favicon:', url, e)
		return ''
	}
}
const lightboxEl = ref<HTMLImageElement>()
const isLightboxOpening = ref(false)
function openLightbox(e: MouseEvent) {
	if (e.target instanceof HTMLImageElement) {
		lightboxEl.value = e.target
		isLightboxOpening.value = true
	}
}
function closeLightbox() {
	isLightboxOpening.value = false
}
</script>

<template>
<div class="talk-container">
	<!-- Header Card -->
	<div v-if="isLoggedIn" class="moment-header-card">
		<h1>瞬间管理</h1>
		<div class="header-actions">
			<button
				class="header-action-btn"
				:class="{ 'is-confirming': confirmStates.logout }"
				:title="confirmStates.logout ? '确认退出' : '退出登录'"
				@click="handleProtectedAction('logout', logout)"
			>
				<Icon v-if="loadingStates.logout" name="svg-spinners:180-ring" />
				<Icon
					v-else
					:name="confirmStates.logout ? 'ph:check-bold' : 'ph:sign-out-bold'"
					class="action-icon"
				/>
			</button>
			<button
				class="header-action-btn"
				:class="{ 'is-confirming': confirmStates.add }"
				:title="confirmStates.add ? '确认添加' : '添加新瞬间'"
				@click="handleProtectedAction('add', () => openEditOverlay())"
			>
				<Icon
					:name="confirmStates.add ? 'ph:check-bold' : 'ph:plus-circle-bold'"
					class="action-icon"
				/>
			</button>
		</div>
	</div>

	<!-- Floating Edit Card -->
	<div
		v-if="editingMoment"
		class="edit-overlay"
		@click.self="closeEditOverlay"
	>
		<div class="moment-edit-card floating">
			<div class="card-top-actions">
				<h2>
					{{ editingMoment.id.startsWith("new-") ? "新增瞬间" : "编辑瞬间" }}
				</h2>
				<div class="action-buttons">
					<button
						class="control-btn exit-btn"
						:class="{ 'is-confirming': confirmStates.exit }"
						title="取消"
						@click="handleProtectedAction('exit', closeEditOverlay)"
					>
						<Icon
							:name="
								confirmStates.exit ? 'ph:check-bold' : 'ph:x-circle-bold'
							"
							class="action-icon"
						/>
					</button>
					<button
						class="control-btn save-btn"
						:class="{ 'is-confirming': confirmStates.save }"
						title="保存"
						@click="handleProtectedAction('save', saveEditingMoment)"
					>
						<Icon v-if="loadingStates.save" name="svg-spinners:180-ring" />
						<Icon
							v-else
							:name="
								confirmStates.save ? 'ph:check-bold' : 'ph:floppy-disk-bold'
							"
							class="action-icon"
						/>
					</button>
				</div>
			</div>
			<div class="form-group">
				<label>内容:</label>
				<textarea
					v-model="editingMoment.moment.content"
					class="form-textarea"
					placeholder="瞬间内容"
				/>
			</div>
			<div class="form-group">
				<label>日期:</label>
				<div class="date-input-group">
					<input
						v-model="editingMoment.moment.date"
						type="text"
						class="form-input date-input"
						placeholder="yyyy-mm-ddTHH:mm:ssZ"
					>
					<button
						class="time-btn"
						title="设置当前时间"
						@click="setCurrentDateTime"
					>
						<Icon name="ph:clock-bold" />
					</button>
				</div>
			</div>
			<div class="form-group">
				<label>地址:</label>
				<input
					v-model="editingMoment.moment.address"
					type="text"
					class="form-input"
					placeholder="地址"
				>
			</div>
			<div class="form-group">
				<div class="card-header">
					<label>标签:</label>
					<button class="add-tag-btn" title="添加标签" @click="addTagInput">
						<Icon name="ph:plus-circle-bold" />
					</button>
				</div>
				<div class="tags-card editable">
					<div class="tags-container">
						<div v-if="showTagInput" class="tag-input-container">
							<input
								ref="tagInputRef"
								v-model="newTagText"
								type="text"
								class="form-input tag-new-input"
								placeholder="输入标签"
								@keyup.enter="confirmAddTag"
							>
						</div>
						<template v-if="editingMoment.moment.tags">
							<div
								v-for="(tag, tagIndex) in editingMoment.moment.tags"
								:key="tagIndex"
								class="tag-card editable"
								:data-tag-key="tagIndex"
								@click="handleTagClick(tagIndex)"
							>
								{{ tag }}
								<div
									v-if="tagOverlayVisible[tagIndex]"
									class="tag-overlay"
								>
									<div class="tag-overlay-actions">
										<button
											v-if="tagOverlayVisible[`${tagIndex}-mode`] === 'edit'"
											class="tag-edit-btn"
											title="编辑"
											@click.stop="editTag(tagIndex)"
										>
											<Icon name="ph:note-pencil-bold" />
										</button>
										<button
											v-if="
												tagOverlayVisible[`${tagIndex}-mode`] === 'delete'
											"
											class="tag-delete-btn"
											title="删除"
											@click.stop="deleteTag(tagIndex)"
										>
											<Icon name="ph:trash-bold" />
										</button>
									</div>
								</div>
							</div>
						</template>
						<div
							v-if="
								!editingMoment.moment.tags
									|| (editingMoment.moment.tags.length === 0 && !showTagInput)
							"
							class="empty-tags"
						>
							暂无标签
						</div>
					</div>
				</div>
			</div>
			<div class="form-group">
				<div class="card-header">
					<label>图片:</label>
					<button
						class="add-image-btn"
						title="添加图片"
						@click="addImageInput"
					>
						<Icon name="ph:plus-circle-bold" />
					</button>
				</div>
				<div class="images-card">
					<div class="images-input">
						<template v-if="editingMoment.moment.image">
							<div
								v-for="(img, imgIndex) in editingMoment.moment.image"
								:key="imgIndex"
								class="image-input-group"
							>
								<input
									v-model="editingMoment.moment.image[imgIndex]"
									type="text"
									class="form-input image-input"
									placeholder="图片URL"
								>
								<button
									class="remove-btn"
									:class="{
										'is-confirming': confirmStates[`image-${imgIndex}`],
									}"
									title="删除图片"
									@click="
										handleProtectedAction(`image-${imgIndex}`, () =>
											removeImageInput(imgIndex),
										)
									"
								>
									<Icon
										:name="
											confirmStates[`image-${imgIndex}`]
												? 'ph:check-bold'
												: 'ph:minus-circle-bold'
										"
										class="action-icon"
									/>
								</button>
							</div>
						</template>
						<div
							v-if="
								!editingMoment.moment.image
									|| editingMoment.moment.image.length === 0
							"
							class="empty-images"
						>
							暂无图片
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Moments List -->
	<div v-if="pending" class="loading">
		加载中...
	</div>
	<div v-else-if="error" class="error">
		加载失败: {{ error.message }}
	</div>
	<template v-else-if="momentForms.length > 0">
		<div
			v-for="(form, index) in momentForms"
			:key="form.id"
			class="talk-item"
			:style="{ '--delay': `${index * 0.1}s` }"
		>
			<div v-if="isLoggedIn" class="talk-item-actions">
				<button
					class="icon-action-btn"
					:class="{ 'is-confirming': confirmStates[`edit-${form.id}`] }"
					title="编辑"
					@click="
						handleProtectedAction(`edit-${form.id}`, () =>
							openEditOverlay(form),
						)
					"
				>
					<Icon
						:name="
							confirmStates[`edit-${form.id}`]
								? 'ph:check-bold'
								: 'ph:note-pencil-bold'
						"
						class="action-icon"
					/>
				</button>
				<button
					class="icon-action-btn"
					:class="{ 'is-confirming': confirmStates[`delete-${form.id}`] }"
					title="删除"
					@click="
						handleProtectedAction(`delete-${form.id}`, () =>
							deleteMoment(form.id),
						)
					"
				>
					<Icon
						v-if="loadingStates[`delete-${form.id}`]"
						name="svg-spinners:180-ring"
					/>
					<Icon
						v-else
						:name="
							confirmStates[`delete-${form.id}`]
								? 'ph:check-bold'
								: 'ph:trash-bold'
						"
						class="action-icon"
					/>
				</button>
			</div>
			<div class="talk-meta">
				<a :href="form.user.avatarLink" class="avatar-link">
					<img :src="form.user.avatar" class="avatar">
				</a>
				<div class="info">
					<div class="talk-nick">
						{{ form.user.name }}
						<Icon name="i-material-symbols:verified" class="verified" />
					</div>
					<div class="talk-date">
						{{ form.moment.date }}
					</div>
				</div>
			</div>
			<div class="talk-content">
				<p class="content-text">
					{{ form.moment.content }}
				</p>
				<div
					v-if="form.moment.image && form.moment.image.length > 0"
					class="image-grid"
					@click="openLightbox"
				>
					<img
						v-for="(img, imgIndex) in form.moment.image"
						:key="imgIndex"
						:src="img"
						class="grid-img"
					>
				</div>
				<a
					v-if="form.moment.link"
					:href="form.moment.link.url"
					target="_blank"
					rel="noopener noreferrer"
					class="link-card"
				>
					<img
						:src="getFaviconUrl(form.moment.link.url)"
						alt="Favicon"
						class="link-favicon"
						@error="
							(e) => ((e.target as HTMLImageElement).style.display = 'none')
						"
					>
					<span class="link-text">{{ form.moment.link.text }}</span>
					<Icon
						v-if="form.moment.link.icon"
						:name="form.moment.link.icon"
						class="link-arrow"
					/>
				</a>
			</div>
			<div class="talk-bottom">
				<div class="talk-meta-info">
					<div
						v-if="form.moment.tags && form.moment.tags.length > 0"
						class="talk-tags-wrapper"
					>
						<span v-for="tag in form.moment.tags" :key="tag" class="tag-card">
							<Icon name="i-ph:tag-bold" /> {{ tag }}
						</span>
					</div>
					<div v-if="form.moment.address" class="talk-address-wrapper">
						<a
							v-tip="{ content: `搜索: ${form.moment.address}` }"
							:href="`https://www.bing.com/maps?q=${encodeURIComponent(form.moment.address)}`"
							target="_blank"
							rel="noopener noreferrer"
							class="address-card"
						>
							<Icon name="i-ph:map-pin-bold" /> {{ form.moment.address }}
						</a>
					</div>
				</div>
				<button
					class="comment-btn"
					@click="scrollToComment(form.moment.content)"
				>
					<Icon name="i-ph:chats-bold" />
				</button>
			</div>
		</div>
	</template>
	<div v-else class="no-data">
		暂无瞬间数据
	</div>

	<PostComment id="comment-section" />
</div>
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
.action-icon {
	transition:
		opacity 0.3s ease-in-out,
		transform 0.3s ease-in-out;
}

.icon-action-btn,
.header-action-btn,
.remove-btn,
.control-btn {
	position: relative;
	overflow: hidden;
	transition: all 0.2s ease;
}

.icon-action-btn.is-confirming,
.header-action-btn.is-confirming,
.remove-btn.is-confirming,
.control-btn.is-confirming {
	background-color: #FFE0E0;
	color: #D9534F;
}

.dark .icon-action-btn.is-confirming,
.dark .header-action-btn.is-confirming,
.dark .remove-btn.is-confirming,
.dark .control-btn.is-confirming {
	background-color: rgb(255 100 100 / 20%);
	color: #FF8C8C;
}

.tag-card.is-confirming-tag {
	background-color: #FFE0E0;
	color: #D9534F;
}

.dark .tag-card.is-confirming-tag {
	background-color: rgb(255 100 100 / 20%);
	color: #FF8C8C;
}

.talk-container {
	max-width: 800px;
	margin: 2rem auto;
	padding: 0 15px;
}

.talk-item {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
	position: relative;
	margin-bottom: 0.5rem;
	padding: 0.8rem;
	border: 1px solid #E0E0E0;
	border-radius: 15px;
	animation: float-in 0.3s backwards;
	animation-delay: var(--delay);
}

.dark .talk-item {
	border-color: #3D3D3D;
	background-color: #2B2B2B;
}

.talk-item-actions {
	display: flex;
	gap: 8px;
	position: absolute;
	top: 10px;
	right: 10px;
	z-index: 10;
}

.icon-action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border: none;
	border-radius: 50%;
	background: rgb(128 128 128 / 10%);
	font-size: 16px;
	color: gray;
	cursor: pointer;

	&:hover {
		background: rgb(128 128 128 / 20%);
		color: #333;
	}
}

.dark .icon-action-btn {
	background: rgb(255 255 255 / 10%);
	color: #CCC;

	&:hover {
		background: rgb(255 255 255 / 20%);
		color: white;
	}
}

.talk-meta {
	display: flex;
	align-items: center;
	margin-bottom: 0.5rem;

	.avatar {
		width: 48px;
		height: 48px;
		margin-right: 1rem;
		border-radius: 35%;
		object-fit: cover;
	}

	.info {
		display: flex;
		flex-direction: column;
	}

	.talk-nick {
		display: flex;
		align-items: center;
		font-weight: 600;
		color: #333;
	}

	.dark .talk-nick {
		color: #E0E0E0;
	}

	.talk-nick .verified {
		margin-left: 0.25rem;
		font-size: 1.1em;
		vertical-align: text-bottom;
		color: #4E9DF8;
	}

	.talk-date {
		font-family: var(--font-monospace);
		font-size: 0.75rem;
		color: #888;
	}
}

.talk-content {
	.content-text {
		margin: 0 0 0.5rem;
		line-height: 1.6;
		white-space: pre-wrap;
		color: #333;
	}

	.dark .content-text {
		color: #E0E0E0;
	}
}

.image-grid {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: flex-start;
	gap: 8px;
}

.grid-img {
	display: block;
	width: auto;
	height: auto;
	max-width: 100%;
	max-height: 200px;
	border-radius: 8px;
	cursor: zoom-in;
	object-fit: contain;
}

.talk-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 0.5rem;
	font-size: 0.9rem;
	color: #888;
}

.talk-meta-info {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}

.talk-tags-wrapper {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
}

.tag-card {
	display: inline-flex;
	align-items: center;
	gap: 0.2rem;
	padding: 0.15rem 0.6rem;
	border-radius: 6px;
	background-color: #EEE;
	font-size: 0.75rem;
	white-space: nowrap;
	color: #888;
}

.talk-address-wrapper {
	display: flex;
	align-items: center;
}

.address-card {
	display: inline-flex;
	align-items: center;
	gap: 0.2rem;
	padding: 0.15rem 0.6rem;
	border-radius: 6px;
	background-color: #EEE;
	font-size: 0.75rem;
	white-space: nowrap;
	color: #3B82F6;
}

.dark .tag-card {
	background-color: #3A3A3C;
	color: #AAA;
}

.dark .address-card {
	background-color: #3A3A3C;
}

.comment-btn {
	border: none;
	background: none;
	font-size: 1.1rem;
	color: #888;
	transition: color 0.2s ease;
	cursor: pointer;

	&:hover {
		color: #3B82F6;
	}
}

.link-card {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-top: 10px;
	padding: 10px 15px;
	border: 1px solid #D0D0D0;
	border-radius: 10px;
	background-color: #E0E0E0;
	text-decoration: none;
	color: #333;
	transition: background-color 0.2s ease;

	&:hover {
		border-color: #C0C0C0;
		background-color: #D0D0D0;
	}

	.dark & {
		border: 1px solid #5A5A5C;
		background-color: #4A4A4C;
		color: #EEE;

		&:hover {
			border-color: #6A6A6C;
			background-color: #5A5A5C;
		}
	}
}

.link-favicon {
	flex-shrink: 0;
	width: 24px;
	height: 24px;
	border-radius: 4px;
	object-fit: contain;
}

.link-text {
	flex-grow: 1;
	font-size: 0.95rem;
	font-weight: 500;
}

.link-arrow {
	flex-shrink: 0;
	font-size: 1.1rem;
	color: #888;
}

/* --- Admin/Edit Styles --- */
.moment-header-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
	padding: 16px 20px;
	border: 1px solid #E0E0E0;
	border-radius: 20px;
	background-color: #FFF;
}

.dark .moment-header-card {
	border-color: #3D3D3D;
	background-color: #2B2B2B;
}

.moment-header-card h1 {
	margin: 0;
	font-size: 22px;
	font-weight: 600;
	letter-spacing: 0.5px;
	color: #333;
}

.dark .moment-header-card h1 {
	color: #E0E0E0;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 12px;
}

.header-action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border: none;
	border-radius: 8px;
	background-color: rgb(128 128 128 / 10%);
	font-size: 18px;
	color: gray;
	cursor: pointer;
}

.dark .header-action-btn {
	background-color: rgb(128 128 128 / 20%);
	color: #CCC;
}

.header-action-btn:hover {
	background-color: rgb(128 128 128 / 20%);
}

.edit-overlay {
	display: flex;
	align-items: flex-start;
	justify-content: center;
	position: fixed;
	inset: 0;
	padding-top: 5vh;
	background-color: rgb(0 0 0 / 50%);
	backdrop-filter: blur(4px);
	z-index: 1000;
}

.moment-edit-card.floating {
	position: relative;
	overflow-y: auto;
	width: 90%;
	max-width: 700px;
	max-height: 90vh;
	padding: 12px 20px;
	border: 1px solid #E0E0E0;
	border-radius: 20px;
	background-color: #FFF;
}

.dark .moment-edit-card.floating {
	border-color: #3D3D3D;
	background-color: #2B2B2B;
}

.card-top-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid #F0F0F0;
}

.dark .card-top-actions {
	border-bottom-color: #3D3D3D;
}

.card-top-actions h2 {
	margin: 0;
	font-size: 1.2rem;
}

.action-buttons {
	display: flex;
	align-items: center;
	gap: 12px;
}

.control-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border: none;
	border-radius: 10px;
	font-size: 18px;
	cursor: pointer;
}

.exit-btn {
	background-color: rgb(245 166 35 / 10%);
	color: #F5A623;

	&:hover {
		background-color: rgb(245 166 35 / 20%);
	}
}

.dark .exit-btn {
	background-color: rgb(255 193 7 / 10%);
	color: #FFC107;

	&:hover {
		background-color: rgb(255 193 7 / 20%);
	}
}

.save-btn {
	background-color: rgb(92 184 92 / 10%);
	color: #5CB85C;

	&:hover {
		background-color: rgb(92 184 92 / 20%);
	}
}

.dark .save-btn {
	background-color: rgb(102 187 106 / 10%);
	color: #66BB6A;

	&:hover {
		background-color: rgb(102 187 106 / 20%);
	}
}

.form-group {
	margin-bottom: 12px;
}

.form-group label {
	display: block;
	margin-bottom: 4px;
	font-size: 14px;
	font-weight: 500;
	color: #555;
}

.dark .form-group label {
	color: #B0B0B0;
}

.form-input,
.form-textarea {
	width: 100%;
	padding: 8px 12px;
	border: 1px solid #DDD;
	border-radius: 12px;
	box-sizing: border-box;
	background-color: #F9F9F9;
	font-size: 14px;
}

.dark .form-input,
.dark .form-textarea {
	border-color: #4A4A4A;
	background-color: #3A3A3A;
	color: #E0E0E0;
}

.form-input:focus,
.form-textarea:focus {
	border-color: #999;
	outline: none;
	background-color: #FFF;
}

.dark .form-input:focus,
.dark .form-textarea:focus {
	border-color: #666;
	background-color: #3A3A3A;
}

.form-textarea {
	min-height: 80px;
	resize: vertical;
}

.date-input-group {
	display: flex;
	gap: 8px;
}

.date-input {
	flex: 1;
}

.time-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border: none;
	border-radius: 12px;
	background-color: rgb(128 128 128 / 10%);
	font-size: 14px;
	color: gray;
	cursor: pointer;
}

.dark .time-btn {
	background-color: rgb(128 128 128 / 20%);
	color: #CCC;
}

.images-input {
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 6px;
}

.image-input-group {
	display: inline-flex;
	align-items: center;
	gap: 4px;
}

.remove-btn {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border: none;
	border-radius: 12px;
	background-color: rgb(128 128 128 / 10%);
	color: gray;
	cursor: pointer;
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
}

.card-header label {
	margin-bottom: 0;
}

.tags-card,
.images-card {
	margin-top: 0;
	padding: 8px;
	border: 1px solid #E0E0E0;
	border-radius: 12px;
	background-color: #F9F9F9;
	cursor: default;
}

.dark .tags-card,
.dark .images-card {
	border-color: #4A4A4A;
	background-color: #3A3A3A;
}

.empty-tags,
.empty-images {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	padding: 16px 0;
	font-size: 14px;
	font-style: italic;
	text-align: center;
	color: #999;
}

.dark .empty-tags,
.dark .empty-images {
	color: #888;
}

.add-tag-btn,
.add-image-btn {
	display: flex;
	align-items: center;
	align-self: flex-start;
	justify-content: center;
	width: 40px;
	height: 40px;
	border: none;
	border-radius: 8px;
	background-color: rgb(128 128 128 / 10%);
	font-size: 16px;
	color: gray;
	cursor: pointer;
}

.dark .add-tag-btn,
.dark .add-image-btn {
	background-color: rgb(128 128 128 / 20%);
	color: #CCC;
}

.tags-container {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
	min-height: 36px;
}

.tag-new-input {
	min-width: 120px;
}

.tag-card.editable {
	position: relative;
	cursor: pointer;

	&:hover {
		background-color: #E0E0E0;
	}
}

.dark .tag-card.editable:hover {
	background-color: #5A5A5A;
}

.tag-overlay {
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	inset: 0;
	border: 1px solid rgb(255 255 255 / 18%);
	border-radius: 12px;
	box-shadow: 0 8px 32px 0 rgb(31 38 135 / 15%);
	background: rgb(255 255 255 / 25%);
	backdrop-filter: blur(8px);
	animation: overlayFadeIn 0.3s ease-out forwards;
}

@keyframes overlayFadeIn {
	0% {
		opacity: 0;
		backdrop-filter: blur(0);
	}

	100% {
		opacity: 1;
		backdrop-filter: blur(8px);
	}
}

.tag-overlay-actions {
	display: flex;
	gap: 8px;
}

.tag-edit-btn,
.tag-delete-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	width: 28px;
	height: 28px;
	border: none;
	border-radius: 6px;
	background-color: rgb(255 255 255 / 90%);
	font-size: 14px;
	transform: scale(0);
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	cursor: pointer;
}

.tag-overlay-actions .tag-edit-btn,
.tag-overlay-actions .tag-delete-btn {
	animation: buttonPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.tag-overlay-actions .tag-edit-btn {
	animation-delay: 0.1s;
}

.tag-overlay-actions .tag-delete-btn {
	animation-delay: 0.2s;
}

@keyframes buttonPopIn {
	0% {
		opacity: 0;
		transform: scale(0) rotate(-10deg);
	}

	50% {
		opacity: 0.8;
		transform: scale(1.1) rotate(5deg);
	}

	100% {
		opacity: 1;
		transform: scale(1) rotate(0deg);
	}
}

.tag-edit-btn {
	color: #4A90E2;
}

.tag-edit-btn:hover {
	background-color: rgb(74 144 226 / 20%);
}

.tag-delete-btn {
	color: #D9534F;
}

.tag-delete-btn:hover {
	background-color: rgb(217 83 79 / 20%);
}

.dark .tag-overlay {
	border: 1px solid rgb(61 61 61 / 18%);
	box-shadow: 0 8px 32px 0 rgb(0 0 0 / 15%);
	background: rgb(43 43 43 / 25%);
}

.dark .tag-edit-btn,
.dark .tag-delete-btn {
	background-color: rgb(60 60 60 / 90%);
	color: #CCC;
}

.dark .tag-edit-btn {
	color: #6DA2E9;
}

.dark .tag-edit-btn:hover {
	background-color: rgb(109 162 233 / 20%);
}

.dark .tag-delete-btn {
	color: #EF5350;
}

.dark .tag-delete-btn:hover {
	background-color: rgb(239 83 80 / 20%);
}

.loading,
.error,
.no-data {
	margin-bottom: 16px;
	padding: 40px 20px;
	border: 1px solid #E0E0E0;
	border-radius: 20px;
	background-color: #F9F9F9;
	font-size: 16px;
	text-align: center;
}

.loading {
	color: #666;
}

.error {
	border-color: #FFE0E0;
	background-color: #FFF5F5;
	color: #D9534F;
}

.no-data {
	color: #888;
}

.dark .loading,
.dark .error,
.dark .no-data {
	border-color: #3D3D3D;
	background-color: #2B2B2B;
	color: #CCC;
}

.dark .error {
	border-color: #5A3A3A;
	background-color: #3A2A2A;
	color: #FF8C8C;
}
</style>
