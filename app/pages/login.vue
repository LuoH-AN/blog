<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const appConfig = useAppConfig()
useSeoMeta({
  title: '登录',
  description: `${appConfig.title}的登录。`
})

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'blog-log', 'poetry'])

const router = useRouter()
const authKey = ref('')
const isLoading = ref(false)
const error = ref('')

interface LoginApiResponse {
  success: boolean;
  message?: string;
}

const handleLogin = async () => {
  if (!authKey.value) {
    error.value = '请输入认证密钥'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await $fetch<LoginApiResponse>('/api/login', {
      method: 'POST',
      body: { authKey: authKey.value }
    })

    if (response.success) {
      await router.push('/moments')
    } else {
      error.value = response.message || '登录失败'
    }
  } catch (err: any) {
    console.error('登录错误:', err)
    if (err.statusCode === 401 || err.statusCode === 400) {
      error.value = err.data?.message || '认证失败，请检查密钥'
    } else {
      error.value = '登录失败，请检查网络连接或服务器状态'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>登录</h1>
      <div class="login-form">
        <div class="form-group">
          <label for="authKey">认证密钥</label>
          <input
            id="authKey"
            v-model="authKey"
            type="password"
            class="form-input"
            placeholder="请输入认证密钥"
            @keyup.enter="handleLogin"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button @click="handleLogin" class="login-btn" :disabled="isLoading">
          <span v-if="!isLoading">登录</span>
          <div v-else class="loading-spinner"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  border-radius: 20px;
  background-color: #ffffff;
  border: 1px solid #d0d0d0;
}

.login-card h1 {
  margin: 0 0 24px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #000000;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #333333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #cccccc;
  border-radius: 12px;
  box-sizing: border-box;
  font-size: 16px;
  background-color: #f5f5f5;
  transition: all 0.2s ease;
  color: #000000;
}

.form-input:focus {
  outline: none;
  border-color: #999999;
  background-color: #ffffff;
}

.error-message {
  padding: 12px;
  border-radius: 12px;
  background-color: #f0f0f0;
  color: #666666;
  font-size: 14px;
  text-align: center;
  border: 1px solid #d0d0d0;
}

.login-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background-color: #666666;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
}

.login-btn:hover {
  background-color: #444444;
}

.login-btn:disabled {
  background-color: #aaaaaa;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .login-card {
    margin: 16px;
    padding: 24px;
  }
}

.dark .login-card {
  background-color: #2b2b2b;
  border-color: #3d3d3d;
}

.dark .login-card h1 {
  color: #e0e0e0;
}

.dark .form-group label {
  color: #b0b0b0;
}

.dark .form-input {
  background-color: #3a3a3a;
  border-color: #4a4a4a;
  color: #e0e0e0;
}

.dark .form-input:focus {
  border-color: #666;
  background-color: #3a3a3a;
}

.dark .error-message {
  background-color: #3a2a2a;
  color: #ff8c8c;
  border-color: #5a3a3a;
}

.dark .login-btn {
  background-color: #4a4a4a;
  color: #e0e0e0;
}

.dark .login-btn:hover {
  background-color: #666666;
}

.dark .login-btn:disabled {
  background-color: #333333;
  color: #777777;
}

.dark .loading-spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
}
</style>
