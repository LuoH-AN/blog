<script setup lang="ts">
import type { MomentData, MomentFormItem, MomentItem } from '../types/moments'
import Lightbox from '~/components/popover/Lightbox.vue'
import blogConfig from '../../blog.config'
import MomentHeader from '~/components/moment/MomentHeader.vue'
import MomentEditOverlay from '~/components/moment/MomentEditOverlay.vue'
import MomentListItem from '~/components/moment/MomentListItem.vue'

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
const momentForms = ref<MomentFormItem[]>([])
const editingMoment = ref<MomentFormItem | null>(null)
const confirmStates = ref<Record<string, boolean>>({})
const loadingStates = ref<Record<string, boolean>>({})

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
async function handleProtectedAction(
	id: string,
	action: () => Promise<void> | void,
) {
	if (confirmStates.value[id]) {
		delete confirmStates.value[id]
		loadingStates.value[id] = true
		try {
			await action()
		} finally {
			loadingStates.value[id] = false
		}
	} else {
		confirmStates.value[id] = true
		setTimeout(() => {
			delete confirmStates.value[id]
		}, 3000)
	}
}

function handleLogout() {
	apiAuth.value = false
}

function handleOpenEditOverlay(form?: MomentFormItem) {
	if (form) {
		const formId = form.id
		if (confirmStates.value[`edit-${formId}`]) {
			// Second click - actually open edit overlay
			openEditOverlay(form)
		} else {
			// First click - show confirmation
			confirmStates.value[`edit-${formId}`] = true
			setTimeout(() => {
				delete confirmStates.value[`edit-${formId}`]
			}, 3000)
		}
	} else {
		// New moment - no confirmation needed
		openNewEditOverlay()
	}
}

function openEditOverlay(form: MomentFormItem) {
	editingMoment.value = JSON.parse(JSON.stringify(form))
	delete confirmStates.value[`edit-${form.id}`]
	// Ensure tags and image are arrays
	if (editingMoment.value && !editingMoment.value.moment.tags)
		editingMoment.value.moment.tags = []

	if (editingMoment.value && !editingMoment.value.moment.image)
		editingMoment.value.moment.image = []
}

function openNewEditOverlay() {
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
	// Ensure tags and image are arrays
	if (editingMoment.value && !editingMoment.value.moment.tags)
		editingMoment.value.moment.tags = []

	if (editingMoment.value && !editingMoment.value.moment.image)
		editingMoment.value.moment.image = []
}

function handleCloseEditOverlay() {
	editingMoment.value = null
}

async function handleSaveEditingMoment(momentToSave: MomentFormItem) {
	if (!momentToSave)
		return
	const isNew = momentToSave.id.startsWith('new-')

	const forms = [...momentForms.value]
	if (isNew) {
		forms.unshift(momentToSave)
	}
	else {
		const index = forms.findIndex(f => f.id === momentToSave!.id)
		if (index !== -1)
			forms[index] = momentToSave
	}

	await updateMomentsApi(forms)
}

function handleDeleteMoment(formId: string) {
	if (confirmStates.value[`delete-${formId}`]) {
		// Second click - actually delete
		deleteConfirmAndExecute(formId)
	} else {
		// First click - show confirmation
		confirmStates.value[`delete-${formId}`] = true
		setTimeout(() => {
			delete confirmStates.value[`delete-${formId}`]
		}, 3000)
	}
}

async function deleteConfirmAndExecute(formId: string) {
	loadingStates.value[`delete-${formId}`] = true
	try {
		const updatedForms = momentForms.value.filter(f => f.id !== formId)
		await updateMomentsApi(updatedForms)
		delete confirmStates.value[`delete-${formId}`]
	} finally {
		loadingStates.value[`delete-${formId}`] = false
	}
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

const { lightboxEl, isLightboxOpening, openLightbox, closeLightbox } = useLightbox()
</script>

<template>
<div class="talk-container">
	<MomentHeader
		:is-logged-in="isLoggedIn"
		@logout="handleLogout"
		@add-moment="handleOpenEditOverlay()"
	/>

	<MomentEditOverlay
		:editing-moment="editingMoment"
		:save-function="handleSaveEditingMoment"
		@close="handleCloseEditOverlay"
	/>

	<!-- Moments List -->
	<div v-if="pending" class="loading">
		加载中...
	</div>
	<div v-else-if="error" class="error">
		加载失败: {{ error.message }}
	</div>
	<template v-else-if="momentForms.length > 0">
		<MomentListItem
			v-for="(form, index) in momentForms"
			:key="form.id"
			:form="form"
			:is-logged-in="isLoggedIn"
			:index="index"
			:confirm-states="confirmStates"
			:loading-states="loadingStates"
			@edit-moment="handleOpenEditOverlay"
			@delete-moment="handleDeleteMoment"
			@scroll-to-comment="scrollToComment"
			@open-lightbox="openLightbox"
		/>
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
.talk-container {
	max-width: 800px;
	margin: 2rem auto;
	padding: 0 15px;
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
