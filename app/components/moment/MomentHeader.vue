<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isLoggedIn: boolean
}>()

const emit = defineEmits(['logout', 'add-moment'])

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

async function requestLogout() {
  const authToken = useCookie('auth_token')
  authToken.value = null
  emit('logout')  // Still emit to update parent state
  navigateTo('/login')
}

function requestAddMoment() {
  emit('add-moment')
}
</script>

<template>
  <div v-if="isLoggedIn" class="moment-header-card">
    <h1>瞬间管理</h1>
    <div class="header-actions">
      <button
        class="header-action-btn"
        :class="{ 'is-confirming': confirmStates.logout }"
        :title="confirmStates.logout ? '确认退出' : '退出登录'"
        @click="handleProtectedAction('logout', requestLogout)"
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
        @click="handleProtectedAction('add', requestAddMoment)"
      >
        <Icon
          :name="confirmStates.add ? 'ph:check-bold' : 'ph:plus-circle-bold'"
          class="action-icon"
        />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.moment-header-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px 20px;
  border: 1px solid var(--c-border);
  border-radius: 20px;
  background-color: var(--c-bg);
}

.moment-header-card h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--c-text);
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
  background-color: var(--c-bg-1);
  font-size: 18px;
  color: var(--c-text-2);
  cursor: pointer;

  &:hover {
    background-color: var(--c-bg-2);
  }
}

.action-icon {
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}

</style>
