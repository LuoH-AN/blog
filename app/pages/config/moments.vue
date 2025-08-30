<script setup lang="ts">
import type { MomentData, MomentItem } from '../../types/moments'

const useDoubleClick = (callback: () => void, delay: number = 1500) => {
  const count = ref(0)
  const timeout = ref<NodeJS.Timeout | null>(null)

  const execute = () => {
    count.value++
    if (count.value === 1) {
      timeout.value = setTimeout(() => {
        count.value = 0
      }, delay)
      return
    }

    if (timeout.value) {
      clearTimeout(timeout.value)
      timeout.value = null
    }
    callback()
    count.value = 0
  }

  onUnmounted(() => {
    if (timeout.value) {
      clearTimeout(timeout.value)
    }
  })

  return { execute }
}


const appConfig = useAppConfig()
useSeoMeta({
  title: '瞬间配置',
  description: `${appConfig.title}的瞬间配置。`
})

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'blog-log', 'poetry'])

const { execute: logout } = useDoubleClick(() => {
  document.cookie = 'auth_token=; path=/; max-age=0; secure; samesite=strict'
  navigateTo('/config/login')
})

onMounted(() => {
})

interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
}

const { data: momentData, pending, error, refresh } = await useFetch<MomentData>('/api/moments');

watch(error, (newError) => {
  if (newError && (newError as any).statusCode === 401) {
    navigateTo('/config/login');
  }
});


interface MomentFormItem {
  id: string
  user: {
    name: string
    avatar: string
    avatarLink: string
  }
  moment: {
    content: string
    date: string
    tags: string[]
    image: string[]
    address?: string
  }
}

const momentForms = ref<MomentFormItem[]>([])

const showTagInput = ref<boolean[]>([])
const newTagText = ref<string[]>([])
const tagOverlayVisible = ref<Record<string, any>>({})
const tagInputRef = ref<HTMLInputElement[]>([])

const handleClickOutside = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest('.add-tag-btn')) return

  Object.keys(tagOverlayVisible.value).forEach((key) => {
    if (tagOverlayVisible.value[key] === true) {
      const tagCard = document.querySelector(`[data-tag-key="${key}"]`)
      if (tagCard && !tagCard.contains(event.target as Node)) {
        tagOverlayVisible.value[key] = false
        tagOverlayVisible.value[`${key}-mode`] = undefined
      }
    }
  })

  showTagInput.value.forEach((isVisible, index) => {
    if (isVisible) {
      const tagInputContainer = document.querySelector(`[data-input-index="${index}"]`)
      if (tagInputContainer && !tagInputContainer.contains(event.target as Node)) {
        confirmAddTag(index)
      }
    }
  })
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

interface EditState {
  isEditing: boolean
  hasChanges: boolean
  originalData?: any
  isDeleting?: boolean
  isSaving?: boolean
  executeEdit?: () => void
  executeExit?: () => void
  executeSave?: () => void
  executeDelete?: () => void
}

const editStates = ref<Record<string, EditState>>({})

watch(
  momentData,
  (newData) => {
    if (newData) {
      momentForms.value = []
      editStates.value = {}
      showTagInput.value = []
      newTagText.value = []
      tagOverlayVisible.value = {}

      for (let userIndex = 0; userIndex < newData.length; userIndex++) {
        const user = newData[userIndex]
        if (user) {
          for (let momentIndex = 0; momentIndex < user.moment_list.length; momentIndex++) {
            const moment = user.moment_list[momentIndex]
            if (moment) {
              const id = `${userIndex}-${momentIndex}`
              const formIndex = momentForms.value.length
              momentForms.value.push({
                id,
                user: {
                  name: user.name,
                  avatar: user.avatar,
                  avatarLink: user.avatarLink || ''
                },
                moment: {
                  content: moment.content,
                  date: moment.date,
                  tags: [...(moment.tags || [])],
                  image: [...(moment.image || [])],
                  address: moment.address || ''
                }
              })

              showTagInput.value[formIndex] = false
              newTagText.value[formIndex] = ''

              const { execute: executeEdit } = useDoubleClick(() => {
                const editState = editStates.value[id]
                if (editState) {
                  editState.isEditing = true
                  editState.hasChanges = true
                  const form = momentForms.value.find((f) => f.id === id)
                  if (form) {
                    editState.originalData = JSON.parse(JSON.stringify(form))
                  }
                }
              })

              const { execute: executeExit } = useDoubleClick(() => {
                const editState = editStates.value[id]
                if (editState) {
                  editState.isEditing = false
                  editState.hasChanges = false
                }
              })

              const { execute: executeSave } = useDoubleClick(async () => {
                const editState = editStates.value[id]
                if (!editState) return

                try {
                  editState.isSaving = true

                  const newData: MomentData = []

                  momentForms.value.forEach((formItem) => {
                    if (!formItem) return

                    let userEntry = newData.find((u) => u.name === formItem.user.name)
                    if (!userEntry) {
                      userEntry = {
                        name: formItem.user.name,
                        avatar: formItem.user.avatar,
                        avatarLink: formItem.user.avatarLink || undefined,
                        moment_list: []
                      }
                      newData.push(userEntry)
                    }

                    const momentItem: MomentItem = {
                      content: formItem.moment.content,
                      date: formItem.moment.date,
                      tags: [...formItem.moment.tags],
                      image: [...formItem.moment.image],
                      address: formItem.moment.address
                    }
                    userEntry.moment_list.push(momentItem)
                  })

                  const response = await $fetch<ApiResponse>('/api/moments', {
                    method: 'POST',
                    body: newData,
                  })

                  if (response.success) {
                    if (editStates.value[id]) {
                      editStates.value[id].hasChanges = false
                      const form = momentForms.value.find((f) => f.id === id)
                      if (form) {
                        editStates.value[id].originalData = JSON.parse(JSON.stringify(form))
                      }
                    }
                    await refresh()
                  }
                } catch (err) {
                  console.error('保存数据时出错:', err)
                  if ((err as any).statusCode === 401) {
                    navigateTo('/config/login');
                  }
                } finally {
                  if (editStates.value[id]) {
                    editStates.value[id].isSaving = false
                  }
                }
              })

              const { execute: executeDelete } = useDoubleClick(async () => {
                const editState = editStates.value[id]
                if (!editState) return

                try {
                  editState.isDeleting = true

                  const newData: MomentData = []

                  momentForms.value.forEach((formItem, i) => {
                    const currentForm = momentForms.value[i]
                    if (currentForm && currentForm.id !== id) {
                      let userEntry = newData.find((u) => u.name === currentForm.user.name)
                      if (!userEntry) {
                        userEntry = {
                          name: currentForm.user.name,
                          avatar: currentForm.user.avatar,
                          avatarLink: currentForm.user.avatarLink || undefined,
                          moment_list: []
                        }
                        newData.push(userEntry)
                      }

                      const momentItem: MomentItem = {
                        content: currentForm.moment.content,
                        date: currentForm.moment.date,
                        tags: [...currentForm.moment.tags],
                        image: [...currentForm.moment.image],
                        address: currentForm.moment.address
                      }
                      userEntry.moment_list.push(momentItem)
                    }
                  })

                  const response = await $fetch<ApiResponse>('/api/moments', {
                    method: 'POST',
                    body: newData,
                  })

                  if (response.success) {
                    await refresh()
                  }
                } catch (err) {
                  console.error('删除数据时出错:', err)
                  if ((err as any).statusCode === 401) {
                    navigateTo('/config/login');
                  }
                } finally {
                  if (editStates.value[id]) {
                    editStates.value[id].isDeleting = false
                  }
                }
              })

              editStates.value[id] = {
                isEditing: false,
                hasChanges: false,
                originalData: JSON.parse(
                  JSON.stringify({
                    user: {
                      name: user.name,
                      avatar: user.avatar,
                      avatarLink: user.avatarLink || ''
                    },
                    moment: {
                      content: moment.content,
                      date: moment.date,
                      tags: [...(moment.tags || [])],
                      image: [...(moment.image || [])],
                      address: moment.address || ''
                    }
                  })
                ),
                executeEdit,
                executeExit,
                executeSave,
                executeDelete
              }
            }
          }
        }
      }

      momentForms.value.sort((a, b) => new Date(b.moment.date).getTime() - new Date(a.moment.date).getTime())
    }
  },
  { immediate: true }
)

const addImageInput = (formIndex: number) => {
  const form = momentForms.value[formIndex]
  if (form) form.moment.image.push('')
}

const removeImageInput = (formIndex: number, index: number) => {
  const form = momentForms.value[formIndex]
  if (form) form.moment.image.splice(index, 1)
}

const addTagInput = (formIndex: number) => {
  showTagInput.value[formIndex] = true
  newTagText.value[formIndex] = ''

  nextTick(() => {
    if (tagInputRef.value[formIndex]) tagInputRef.value[formIndex].focus()
  })
}

const confirmAddTag = (formIndex: number) => {
  const tagText = newTagText.value[formIndex]?.trim()
  if (tagText) {
    const form = momentForms.value[formIndex]
    if (form) form.moment.tags.push(tagText)
  }
  showTagInput.value[formIndex] = false
  newTagText.value[formIndex] = ''
}

const tagClickTimeout = ref<Record<string, number>>({})
const tagClickCount = ref<Record<string, number>>({})

const handleTagClick = (formIndex: number, tagIndex: number) => {
  const form = momentForms.value[formIndex]
  if (!form || !editStates.value[form.id]?.isEditing) return

  const key = `${formIndex}-${tagIndex}`

  tagClickCount.value[key] = (tagClickCount.value[key] || 0) + 1

  if (tagClickCount.value[key] === 1) {
    tagClickTimeout.value[key] = window.setTimeout(() => {
      showTagEditOverlay(formIndex, tagIndex)
      tagClickCount.value[key] = 0
    }, 300)
  } else if (tagClickCount.value[key] === 2) {
    clearTimeout(tagClickTimeout.value[key])
    showTagDeleteOverlay(formIndex, tagIndex)
    tagClickCount.value[key] = 0
  }
}

const showTagEditOverlay = (formIndex: number, tagIndex: number) => {
  const key = `${formIndex}-${tagIndex}`
  tagOverlayVisible.value[key] = true
  tagOverlayVisible.value[`${key}-mode`] = 'edit'
}

const showTagDeleteOverlay = (formIndex: number, tagIndex: number) => {
  const key = `${formIndex}-${tagIndex}`
  tagOverlayVisible.value[key] = true
  tagOverlayVisible.value[`${key}-mode`] = 'delete'
}

const editTag = (formIndex: number, tagIndex: number) => {
  const form = momentForms.value[formIndex]
  if (form) {
    const currentTag = form.moment.tags[tagIndex]
    showTagInput.value[formIndex] = true
    newTagText.value[formIndex] = currentTag || ''

    form.moment.tags.splice(tagIndex, 1)

    nextTick(() => {
      if (tagInputRef.value[formIndex]) tagInputRef.value[formIndex].focus()
    })
  }

  const key = `${formIndex}-${tagIndex}`
  tagOverlayVisible.value[key] = false
}

const deleteTag = (formIndex: number, tagIndex: number) => {
  const form = momentForms.value[formIndex]
  if (form) {
    form.moment.tags.splice(tagIndex, 1)
  }

  const key = `${formIndex}-${tagIndex}`
  tagOverlayVisible.value[key] = false
}

const saveMomentData = async (formIndex: number) => {
  const formToSave = momentForms.value[formIndex]
  if (!formToSave) return

  const formId = formToSave.id
  if (editStates.value[formId]) {
    const editState = editStates.value[formId]
    if (!editState) return

    try {
      editState.isSaving = true

      const newData: MomentData = []

      momentForms.value.forEach((formItem) => {
        if (!formItem) return

        let userEntry = newData.find((u) => u.name === formItem.user.name)
        if (!userEntry) {
          userEntry = {
            name: formItem.user.name,
            avatar: formItem.user.avatar,
            avatarLink: formItem.user.avatarLink || undefined,
            moment_list: []
          }
          newData.push(userEntry)
        }

        const momentItem: MomentItem = {
          content: formItem.moment.content,
          date: formItem.moment.date,
          tags: [...formItem.moment.tags],
          image: [...formItem.moment.image],
          address: formItem.moment.address
        }
        userEntry.moment_list.push(momentItem)
      })

      const response = await $fetch<ApiResponse>('/api/moments', {
        method: 'POST',
        body: newData,
      })

      if (response.success) {
        if (editStates.value[formId]) {
          editStates.value[formId].hasChanges = false
          editStates.value[formId].originalData = JSON.parse(JSON.stringify(formToSave))
        }
        await refresh()
      }
    } catch (err) {
      console.error('保存数据时出错:', err)
      if ((err as any).statusCode === 401) {
        navigateTo('/config/login');
      }
    } finally {
      if (editStates.value[formId]) {
        editStates.value[formId].isSaving = false
      }
    }
  }
}

const deleteMomentData = async (formIndex: number) => {
  const formToDelete = momentForms.value[formIndex]
  if (!formToDelete) return

  const formId = formToDelete.id
  if (editStates.value[formId]) {
    const editState = editStates.value[formId]
    if (!editState) return

    try {
      editState.isDeleting = true

      const newData: MomentData = []

      momentForms.value.forEach((formItem, i) => {
        if (i !== formIndex) {
          if (!formItem) return

          let userEntry = newData.find((u) => u.name === formItem.user.name)
          if (!userEntry) {
            userEntry = {
              name: formItem.user.name,
              avatar: formItem.user.avatar,
              avatarLink: formItem.user.avatarLink || undefined,
              moment_list: []
            }
            newData.push(userEntry)
          }

          const momentItem: MomentItem = {
            content: formItem.moment.content,
            date: formItem.moment.date,
            tags: [...formItem.moment.tags],
            image: [...formItem.moment.image],
            address: formItem.moment.address
          }
          userEntry.moment_list.push(momentItem)
        }
      })

      const response = await $fetch<ApiResponse>('/api/moments', {
        method: 'POST',
        body: newData,
      })

      if (response.success) {
        await refresh()
      }
    } catch (err) {
      console.error('删除数据时出错:', err)
      if ((err as any).statusCode === 401) {
        navigateTo('/config/login');
      }
    } finally {
      if (editStates.value[formId]) {
        editStates.value[formId].isDeleting = false
      }
    }
  }
}

const { execute: addNewMomentForm } = useDoubleClick(() => {
  const newId = `new-${Date.now()}`
  const formIndex = momentForms.value.length
  momentForms.value.push({
    id: newId,
    user: {
      name: '',
      avatar: '',
      avatarLink: ''
    },
    moment: {
      content: '',
      date: new Date().toISOString().split('T')[0] || '',
      tags: [],
      image: [],
      address: ''
    }
  })

  showTagInput.value[formIndex] = false
  newTagText.value[formIndex] = ''

  const { execute: executeEdit } = useDoubleClick(() => {
    const editState = editStates.value[newId]
    if (editState) {
      editState.isEditing = true
      editState.hasChanges = true
      const form = momentForms.value.find((f) => f.id === newId)
      if (form) {
        editState.originalData = JSON.parse(JSON.stringify(form))
      }
    }
  })

  const { execute: executeExit } = useDoubleClick(() => {
    const editState = editStates.value[newId]
    if (editState) {
      editState.isEditing = false
      editState.hasChanges = false
    }
  })

  const { execute: executeSave } = useDoubleClick(async () => {
    const editState = editStates.value[newId]
    if (!editState) return

    try {
      editState.isSaving = true

      const newData: MomentData = []

      momentForms.value.forEach((formItem) => {
        if (!formItem) return

        let userEntry = newData.find((u) => u.name === formItem.user.name)
        if (!userEntry) {
          userEntry = {
            name: formItem.user.name,
            avatar: formItem.user.avatar,
            avatarLink: formItem.user.avatarLink || undefined,
            moment_list: []
          }
          newData.push(userEntry)
        }

        const momentItem: MomentItem = {
          content: formItem.moment.content,
          date: formItem.moment.date,
          tags: [...formItem.moment.tags],
          image: [...formItem.moment.image],
          address: formItem.moment.address
        }
        userEntry.moment_list.push(momentItem)
      })

      const response = await $fetch<ApiResponse>('/api/moments', {
        method: 'POST',
        body: newData,
      })

      if (response.success) {
        if (editStates.value[newId]) {
          editStates.value[newId].hasChanges = false
          const form = momentForms.value.find((f) => f.id === newId)
          if (form) {
            editStates.value[newId].originalData = JSON.parse(JSON.stringify(form))
          }
        }
        await refresh()
      }
    } catch (err) {
      console.error('保存数据时出错:', err)
      if ((err as any).statusCode === 401) {
        navigateTo('/config/login');
      }
    } finally {
      if (editStates.value[newId]) {
        editStates.value[newId].isSaving = false
      }
    }
  })

  const { execute: executeDelete } = useDoubleClick(async () => {
    const editState = editStates.value[newId]
    if (!editState) return

    try {
      editState.isDeleting = true

      const newData: MomentData = []

      momentForms.value.forEach((formItem, i) => {
        const currentForm = momentForms.value[i]
        if (currentForm && currentForm.id !== newId) {
          let userEntry = newData.find((u) => u.name === currentForm.user.name)
          if (!userEntry) {
            userEntry = {
              name: currentForm.user.name,
              avatar: currentForm.user.avatar,
              avatarLink: currentForm.user.avatarLink || undefined,
              moment_list: []
            }
            newData.push(userEntry)
          }

          const momentItem: MomentItem = {
            content: currentForm.moment.content,
            date: currentForm.moment.date,
            tags: [...currentForm.moment.tags],
            image: [...currentForm.moment.image],
            address: currentForm.moment.address
          }
          userEntry.moment_list.push(momentItem)
        }
      })

      const response = await $fetch<ApiResponse>('/api/moments', {
        method: 'POST',
        body: newData,
      })

      if (response.success) {
        await refresh()
      }
    } catch (err) {
      console.error('删除数据时出错:', err)
      if ((err as any).statusCode === 401) {
        navigateTo('/config/login');
      }
    } finally {
      if (editStates.value[newId]) {
        editStates.value[newId].isDeleting = false
      }
    }
  })

  editStates.value[newId] = {
    isEditing: true,
    hasChanges: true,
    originalData: JSON.parse(
      JSON.stringify({
        user: {
          name: '',
          avatar: '',
          avatarLink: ''
        },
        moment: {
          content: '',
          date: new Date().toISOString().split('T')[0] || '',
          tags: [],
          image: [],
          address: ''
        }
      })
    ),
    executeEdit,
    executeExit,
    executeSave,
    executeDelete
  }

  nextTick(() => {
    const element = document.getElementById(newId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  })
})

const setCurrentDateTime = (formIndex: number) => {
  const form = momentForms.value[formIndex]
  if (form) {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    form.moment.date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}

const enterEditMode = (formId: string) => {
  if (editStates.value[formId]) {
    const editState = editStates.value[formId]
    if (editState) {
      editState.isEditing = true
      editState.hasChanges = true
      const form = momentForms.value.find((f) => f.id === formId)
      if (form) {
        editState.originalData = JSON.parse(JSON.stringify(form))
      }
    }
  }
}

const exitEditMode = (formId: string) => {
  if (editStates.value[formId]) {
    const editState = editStates.value[formId]
    if (editState) {
      editState.isEditing = false
      editState.hasChanges = false
    }
  }
}

</script>

<template>
  <div class="moment-page">
    <div class="moment-header-card">
      <h1>瞬间配置</h1>
      <div class="header-actions">
        <button
          @click="logout"
          class="logout-btn"
          title="退出登录"
        >
          <Icon name="ph:sign-out-bold" />
        </button>
        <button @click="addNewMomentForm" class="add-moment-btn" title="添加新瞬间">
          <Icon name="ph:plus-circle-bold" />
        </button>
      </div>
    </div>

    <div v-if="pending" class="loading">加载中...</div>

    <div v-else-if="error && (error as any).statusCode === 401" class="error">
      未认证，请<NuxtLink to="/config/login">登录</NuxtLink>。
    </div>
    <div v-else-if="error" class="error">加载失败: {{ error.message }}</div>

    <template v-else-if="momentData && momentForms.length > 0">
      <div v-for="(form, index) in momentForms" :key="form.id" :id="form.id" class="moment-edit-card">
        <div class="card-top-actions">
          <div class="action-buttons">
            <button
              v-if="!editStates[form.id]?.isEditing"
              @click="editStates[form.id]?.executeEdit"
              class="edit-btn"
              title="编辑"
            >
              <Icon name="ph:note-pencil-bold" />
            </button>
            <button
              v-else
              @click="editStates[form.id]?.executeExit"
              class="exit-btn"
              title="退出编辑"
            >
              <Icon name="ph:sign-out-bold" />
            </button>

            <button
                v-if="editStates[form.id]?.isEditing && editStates[form.id]?.hasChanges"
                @click="editStates[form.id]?.executeSave"
                class="save-btn"
                title="保存"
                :disabled="editStates[form.id]?.isSaving"
              >
                <Icon v-if="!editStates[form.id]?.isSaving" name="ph:floppy-disk-bold" />
                <div v-else class="loading-spinner"></div>
              </button>

            <button
              @click="editStates[form.id]?.executeDelete"
              class="delete-btn"
              
              title="删除"
              :disabled="editStates[form.id]?.isDeleting"
            >
              <Icon v-if="!editStates[form.id]?.isDeleting" name="ph:trash-bold" />
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>用户名:</label>
          <input
            v-model="form.user.name"
            type="text"
            class="form-input"
            placeholder="用户名"
            :disabled="!editStates[form.id]?.isEditing"
          />
        </div>

        <div class="form-group">
          <label>头像:</label>
          <input
            v-model="form.user.avatar"
            type="text"
            class="form-input"
            placeholder="头像URL"
            :disabled="!editStates[form.id]?.isEditing"
          />
        </div>

        <div class="form-group">
          <label>主页:</label>
          <input
            v-model="form.user.avatarLink"
            type="text"
            class="form-input"
            placeholder="主页"
            :disabled="!editStates[form.id]?.isEditing"
          />
        </div>

        <div class="form-group">
          <label>内容:</label>
          <textarea
            v-model="form.moment.content"
            class="form-textarea"
            placeholder="瞬间内容"
            :disabled="!editStates[form.id]?.isEditing"
          ></textarea>
        </div>

        <div class="form-group">
          <label>日期:</label>
          <div class="date-input-group">
            <input
              v-model="form.moment.date"
              type="text"
              class="form-input date-input"
              placeholder="yyyy:mm:dd tt:mm:ss"
              :disabled="!editStates[form.id]?.isEditing"
            />
            <button
              @click="setCurrentDateTime(index)"
              class="time-btn"
              title="设置当前时间"
              :disabled="!editStates[form.id]?.isEditing"
            >
              <Icon name="ph:clock-bold" />
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>地址:</label>
          <input
            v-model="form.moment.address"
            type="text"
            class="form-input"
            placeholder="地址"
            :disabled="!editStates[form.id]?.isEditing"
          />
        </div>

        <div class="form-group">
          <div class="card-header">
            <label>标签:</label>
            <button
              @click="addTagInput(index)"
              class="add-tag-btn"
              title="添加标签"
              :disabled="!editStates[form.id]?.isEditing"
            >
              <Icon name="ph:plus-circle-bold" />
            </button>
          </div>
          <div class="tags-card" :class="{ editable: editStates[form.id]?.isEditing }">
            <div class="tags-container">
              <div v-if="showTagInput[index]" class="tag-input-container" :data-input-index="index">
                <input
                  v-model="newTagText[index]"
                  type="text"
                  class="form-input tag-new-input"
                  placeholder="输入标签"
                  @keyup.enter="confirmAddTag(index)"
                  ref="tagInputRef"
                />
              </div>

              <div
                v-for="(tag, tagIndex) in form.moment.tags"
                :key="tagIndex"
                class="tag-card"
                :class="{ editable: editStates[form.id]?.isEditing }"
                :data-tag-key="`${index}-${tagIndex}`"
                @click="handleTagClick(index, tagIndex)"
              >
                {{ tag }}

                <div v-if="tagOverlayVisible[`${index}-${tagIndex}`]" class="tag-overlay">
                  <div class="tag-overlay-actions">
                    <button
                      v-if="tagOverlayVisible[`${index}-${tagIndex}-mode`] === 'edit'"
                      @click.stop="editTag(index, tagIndex)"
                      class="tag-edit-btn"
                      title="编辑"
                    >
                      <Icon name="ph:note-pencil-bold" />
                    </button>
                    <button
                      v-if="tagOverlayVisible[`${index}-${tagIndex}-mode`] === 'delete'"
                      @click.stop="deleteTag(index, tagIndex)"
                      class="tag-delete-btn"
                      title="删除"
                    >
                      <Icon name="ph:trash-bold" />
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="form.moment.tags.length === 0 && !showTagInput[index]" class="empty-tags">
                暂无标签
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="card-header">
            <label>图片:</label>
            <button
              @click="addImageInput(index)"
              class="add-image-btn"
              title="添加图片"
              :disabled="!editStates[form.id]?.isEditing"
            >
              <Icon name="ph:plus-circle-bold" />
            </button>
          </div>
          <div class="images-card">
            <div class="images-input">
              <div v-for="(img, imgIndex) in form.moment.image" :key="imgIndex" class="image-input-group">
                <input
                  v-model="form.moment.image[imgIndex]"
                  type="text"
                  class="form-input image-input"
                  placeholder="图片URL"
                  :disabled="!editStates[form.id]?.isEditing"
                />
                <button
                  @click="removeImageInput(index, imgIndex)"
                  class="remove-btn"
                  title="删除图片"
                  :disabled="!editStates[form.id]?.isEditing"
                >
                  <Icon name="ph:minus-circle-bold" />
                </button>
              </div>

              <div v-if="form.moment.image.length === 0" class="empty-images">
                暂无图片
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="no-data">暂无瞬间数据</div>
  </div>
</template>

<style scoped>
.moment-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

@keyframes iphone-shake {
  0% { transform: translateX(0) rotate(0deg); }
  10% { transform: translateX(-4px) rotate(-2deg); }
  20% { transform: translateX(4px) rotate(2deg); }
  30% { transform: translateX(-4px) rotate(-2deg); }
  40% { transform: translateX(4px) rotate(2deg); }
  50% { transform: translateX(-4px) rotate(-2deg); }
  60% { transform: translateX(4px) rotate(2deg); }
  70% { transform: translateX(-2px) rotate(-1deg); }
  80% { transform: translateX(2px) rotate(1deg); }
  90% { transform: translateX(-1px) rotate(-0.5deg); }
  100% { transform: translateX(0) rotate(0deg); }
}



.moment-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background-color: #fff;
}

.moment-header-card h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.logout-btn,
.add-moment-btn {
  color: gray;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(128, 128, 128, 0.1);
}

.logout-btn:hover {
  background-color: rgba(217, 83, 79, 0.2);
  color: #d9534f;
}

.moment-edit-card {
  padding: 6px 28px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  margin-bottom: 16px;
  background-color: #fff;
  position: relative;
}

.card-top-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid #f0f0f0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.edit-btn,
.exit-btn,
.save-btn,
.delete-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.edit-btn,
.exit-btn,
.save-btn,
.delete-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.logout-btn:active,
.add-moment-btn:active,
.edit-btn:active,
.exit-btn:active,
.save-btn:active,
.delete-btn:active {
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: 1;
}

.logout-btn:active,
.add-moment-btn:active,
.edit-btn:active,
.exit-btn:active,
.save-btn:active,
.delete-btn:active {
  animation-name: iphone-shake;
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
}

.edit-btn {
  color: #4a90e2;
  background-color: rgba(74, 144, 226, 0.1);
}

.edit-btn:hover {
  background-color: rgba(74, 144, 226, 0.2);
}

.exit-btn {
  color: #f5a623;
  background-color: rgba(245, 166, 35, 0.1);
}

.exit-btn:hover {
  background-color: rgba(245, 166, 35, 0.2);
}

.save-btn {
  color: #5cb85c;
  background-color: rgba(92, 184, 92, 0.1);
}

.save-btn:hover {
  background-color: rgba(92, 184, 92, 0.2);
}

.delete-btn {
  color: #d9534f;
  background-color: rgba(217, 83, 79, 0.1);
}

.delete-btn:hover {
  background-color: rgba(217, 83, 79, 0.2);
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-sizing: border-box;
  font-size: 14px;
  background-color: #f9f9f9;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #999;
  background-color: #fff;
}

.form-input:disabled,
.form-textarea:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.7;
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
  color: gray;
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background-color: rgba(128, 128, 128, 0.1);
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.images-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.tag-input-group,
.image-input-group {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.tag-input {
  width: auto;
  flex-grow: 1;
}

.remove-btn {
  color: gray;
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(128, 128, 128, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-header label {
  margin-bottom: 0;
}

.tags-card,
.images-card {
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #f9f9f9;
  margin-top: 0;
  cursor: default;
}

.tags-card:not(.editable):has(.tag-card) {
  cursor: not-allowed;
}

.empty-tags,
.empty-images {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #999;
  font-size: 14px;
  font-style: italic;
  width: 100%;
  padding: 16px 0;
  font-style: italic;
}

.add-tag-btn,
.add-image-btn {
  align-self: flex-start;
  color: gray;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 16px;
  background-color: rgba(128, 128, 128, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 36px;
}

.tag-input-container {
  margin-bottom: 8px;
}

.tag-new-input {
  min-width: 120px;
}

.tag-card {
  position: relative;
  padding: 4px 10px;
  background-color: #f0f0f0;
  border-radius: 10px;
  transition: all 0.2s ease;
  display: inline-block;
  font-size: 13px;
  color: #333;
  user-select: none;
}

.tag-card.editable {
  cursor: pointer;
}

.tag-card.editable:hover {
  background-color: #e0e0e0;
}

.tag-card:not(.editable) {
  cursor: not-allowed;
  opacity: 0.6;
}

.tag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  animation: overlayFadeIn 0.3s ease-out forwards;
}

@keyframes overlayFadeIn {
  0% {
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
  }
  100% {
    opacity: 1;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}

.tag-overlay-actions {
  display: flex;
  gap: 8px;
}

.tag-edit-btn,
.tag-delete-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background-color: rgba(255, 255, 255, 0.9);
  transform: scale(0);
  opacity: 0;
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
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.tag-edit-btn {
  color: #4a90e2;
}

.tag-edit-btn:hover {
  background-color: rgba(74, 144, 226, 0.2);
}

.tag-delete-btn {
  color: #d9534f;
}

.tag-delete-btn:hover {
  background-color: rgba(217, 83, 79, 0.2);
}

.add-tag-btn:disabled,
.add-image-btn:disabled,
.remove-btn:disabled,
.time-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading,
.error,
.no-data {
  text-align: center;
  padding: 40px 20px;
  font-size: 16px;
  border-radius: 20px;
  margin-bottom: 16px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
}

.loading {
  color: #666;
}

.error {
  color: #888;
  background-color: #fff5f5;
  border-color: #ffe0e0;
}

.no-data {
  color: #888;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(92, 184, 92, 0.3);
  border-radius: 50%;
  border-top-color: #5cb85c;
  animation: spin 0.8s ease-in-out infinite;
}

.delete-btn .loading-spinner {
  border: 2px solid rgba(217, 83, 79, 0.3);
  border-top-color: #d9534f;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .moment-page {
    padding: 12px;
  }

  .moment-header-card {
    padding: 14px 16px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }

  .moment-header-card h1 {
    font-size: 20px;
    margin-right: auto;
  }

  .add-moment-btn,
  .logout-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .moment-edit-card {
    padding: 14px 16px;
  }

  .form-group {
    margin-bottom: 10px;
  }

  .card-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .card-header label {
    margin-right: auto;
  }

  .add-tag-btn,
  .add-image-btn,
  .remove-btn,
  .time-btn {
    width: 36px;
    height: 36px;
  }
}

/* Dark mode styles */
.dark .moment-header-card {
  background-color: #2b2b2b;
  border-color: #3d3d3d;
}

.dark .moment-header-card h1 {
  color: #e0e0e0;
}

.dark .logout-btn,
.dark .add-moment-btn {
  background-color: rgba(128, 128, 128, 0.2);
  color: #ccc;
}

.dark .logout-btn:hover {
  background-color: rgba(217, 83, 79, 0.3);
  color: #ff8c8c;
}

.dark .moment-edit-card {
  background-color: #2b2b2b;
  border-color: #3d3d3d;
}

.dark .card-top-actions {
  border-bottom-color: #3d3d3d;
}

.dark .edit-btn,
.dark .exit-btn,
.dark .save-btn,
.dark .delete-btn {
  background-color: rgba(128, 128, 128, 0.2);
  color: #ccc;
}

.dark .edit-btn {
  color: #6da2e9;
}
.dark .edit-btn:hover {
  background-color: rgba(109, 162, 233, 0.2);
}

.dark .exit-btn {
  color: #ffc107;
}
.dark .exit-btn:hover {
  background-color: rgba(255, 193, 7, 0.2);
}

.dark .save-btn {
  color: #66bb6a;
}
.dark .save-btn:hover {
  background-color: rgba(102, 187, 106, 0.2);
}

.dark .delete-btn {
  color: #ef5350;
}
.dark .delete-btn:hover {
  background-color: rgba(239, 83, 80, 0.2);
}

.dark .form-group label {
  color: #b0b0b0;
}

.dark .form-input,
.dark .form-textarea {
  background-color: #3a3a3a;
  border-color: #4a4a4a;
  color: #e0e0e0;
}

.dark .form-input:focus,
.dark .form-textarea:focus {
  border-color: #666;
  background-color: #3a3a3a;
}

.dark .form-input:disabled,
.dark .form-textarea:disabled {
  background-color: #333;
  color: #777;
}

.dark .time-btn {
  background-color: rgba(128, 128, 128, 0.2);
  color: #ccc;
}

.dark .tags-card,
.dark .images-card {
  background-color: #3a3a3a;
  border-color: #4a4a4a;
}

.dark .empty-tags,
.dark .empty-images {
  color: #888;
}

.dark .add-tag-btn,
.dark .add-image-btn {
  background-color: rgba(128, 128, 128, 0.2);
  color: #ccc;
}

.dark .tag-card {
  background-color: #4a4a4a;
  color: #e0e0e0;
}

.dark .tag-card.editable:hover {
  background-color: #5a5a5a;
}

.dark .tag-overlay {
  background: rgba(43, 43, 43, 0.25);
  border: 1px solid rgba(61, 61, 61, 0.18);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
}

.dark .tag-edit-btn,
.dark .tag-delete-btn {
  background-color: rgba(60, 60, 60, 0.9);
  color: #ccc;
}

.dark .tag-edit-btn {
  color: #6da2e9;
}
.dark .tag-edit-btn:hover {
  background-color: rgba(109, 162, 233, 0.2);
}

.dark .tag-delete-btn {
  color: #ef5350;
}
.dark .tag-delete-btn:hover {
  background-color: rgba(239, 83, 80, 0.2);
}

.dark .loading,
.dark .error,
.dark .no-data {
  background-color: #2b2b2b;
  border-color: #3d3d3d;
  color: #ccc;
}

.dark .error {
  background-color: #3a2a2a;
  border-color: #5a3a3a;
  color: #ff8c8c;
}

.dark .loading-spinner {
  border: 2px solid rgba(102, 187, 106, 0.3);
  border-top-color: #66bb6a;
}

.dark .delete-btn .loading-spinner {
  border: 2px solid rgba(239, 83, 80, 0.3);
  border-top-color: #ef5350;
}
</style>
