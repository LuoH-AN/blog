<script setup lang='ts'>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const appConfig = useAppConfig()
useSeoMeta({
	title: '登录',
	description: `${appConfig.title}的登录。`,
})

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'blog-log', 'poetry'])

const router = useRouter()
const authKey = ref('')
const isLoading = ref(false)
const error = ref('')

watch(authKey, () => {
	if (error.value)
		error.value = ''
})

interface LoginApiResponse {
	status: number
	message: string
	data: {
		success: boolean
	}
}

async function handleLogin() {
	isLoading.value = true
	error.value = ''

	if (!authKey.value) {
		error.value = '请输入认证密钥'
		isLoading.value = false
		return
	}

	try {
		const response = await $fetch<LoginApiResponse>('/api/login', {
			method: 'POST',
			body: { authKey: authKey.value },
		})

		if (response.data.success)
			await router.push('/moments')
		else
			error.value = response.message || '登录失败'
	}
	catch (err: any) {
		console.error('登录错误:', err)
		if (err.status === 401 || err.status === 400)
			error.value = err.data?.message
		else
			error.value = '登录失败，请检查网络或服务器状态'
	}
	finally {
		isLoading.value = false
	}
}
</script>

<template>
<div class="login-page">
	<div class="login-container">
		<ZWidget card class="login-widget">
			<template #title>
				<h1 class="login-title">
					<Icon name="ph:lock-bold" />
					登录
				</h1>
			</template>

			<form class="login-form" @submit.prevent="handleLogin">
				<div class="form-group">
					<label for="authKey" class="form-label">
						<Icon name="ph:key-bold" />
						认证密钥
					</label>
					<input
						id="authKey"
						v-model="authKey"
						type="password"
						class="form-input"
						placeholder="请输入认证密钥"
						:disabled="isLoading"
						@keyup.enter="handleLogin"
					>
				</div>

				<div v-if="error" class="alert-error" role="alert">
					<Icon name="ph:warning-circle-bold" />
					{{ error }}
				</div>

				<div v-if="authKey" class="form-actions">
					<Button
						type="submit"
						primary
						:disabled="isLoading"
						class="login-btn"
					>
						<template v-if="!isLoading">
							登录
						</template>
						<template v-else>
							登录中...
						</template>
					</Button>
				</div>
			</form>
		</ZWidget>

		<div class="login-footer">
			<p class="login-tip">
				<Icon name="ph:info-bold" />
				访问管理功能
			</p>
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.login-page {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100dvh;
	padding: 1rem;
	background-color: var(--c-bg-1);
}

.login-container {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 100%;
	max-width: 400px;
}

.login-widget {
	animation: float-in 0.3s ease-out;
}

.login-title {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	margin: 0;
	font-size: 1.5rem;
	font-weight: 600;
	color: var(--c-text);
}

.login-form {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.form-group {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.form-label {
	display: flex;
	align-items: center;
	gap: 0.3rem;
	font-size: 0.9rem;
	font-weight: 500;
	color: var(--c-text-2);
}

.form-input {
	width: 100%;
	padding: 0.8rem 1rem;
	border: 1px solid var(--c-border);
	border-radius: 0.8rem;
	box-sizing: border-box;
	background-color: var(--c-bg-2);
	font-size: 1rem;
	color: var(--c-text);
	transition: all 0.2s ease;

	&:focus {
		border-color: var(--c-primary);
		box-shadow: 0 0 0 0.2rem var(--c-primary-soft);
		outline: none;
		background-color: var(--c-bg);
	}

	&:disabled {
		background-color: var(--c-bg-3);
		color: var(--c-text-3);
		cursor: not-allowed;
	}

	&::placeholder {
		color: var(--c-text-3);
	}
}

.alert-error {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.8rem 1rem;
	border: 1px solid var(--c-bg-soft);
	border-radius: 0.8rem;
	background-color: var(--c-bg-2);
	font-size: 0.9rem;
	text-align: center;
	color: var(--c-text-2);

	.iconify {
		font-size: 1.1rem;
		color: var(--c-primary);
	}
}

.form-actions {
	display: flex;
	justify-content: center;
	margin-top: 0.5rem;
}

.login-btn {
	width: 100%;
	min-height: 3rem;
	font-size: 1rem;
	font-weight: 500;
}

.loading-spinner {
	width: 1.2rem;
	height: 1.2rem;
	border: 2px solid var(--c-text-3);
	border-top-color: var(--c-text);
	border-radius: 50%;
	animation: spin 0.8s ease-in-out infinite;
}

.login-footer {
	text-align: center;
}

.login-tip {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.3rem;
	margin: 0;
	font-size: 0.85rem;
	color: var(--c-text-3);

	.iconify {
		font-size: 0.9rem;
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@media (max-width: $breakpoint-mobile) {
	.login-container {
		max-width: 100%;
	}
}
</style>
