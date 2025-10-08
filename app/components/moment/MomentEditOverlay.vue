<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { MomentFormItem } from '~/types/moments'
import blogConfig from '../../blog.config'

const props = defineProps<{
  editingMoment: MomentFormItem | null
  saveFunction: (moment: MomentFormItem) => Promise<void>
}>()

const emit = defineEmits(['close'])

const localEditingMoment = ref<MomentFormItem | null>(null)

watch(
  () => props.editingMoment,
  (newVal) => {
    if (newVal) {
      localEditingMoment.value = JSON.parse(JSON.stringify(newVal))
      if (!localEditingMoment.value?.moment.tags)
        localEditingMoment.value!.moment.tags = []
      if (!localEditingMoment.value?.moment.image)
        localEditingMoment.value!.moment.image = []
    }
    else {
      localEditingMoment.value = null
    }
  },
  { immediate: true, deep: true },
)

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

function closeEditOverlay() {
  emit('close')
}

async function saveEditingMoment() {
  if (localEditingMoment.value) {
    await props.saveFunction(localEditingMoment.value)
    emit('close')
  }
}

function setCurrentDateTime() {
  if (localEditingMoment.value) {
    localEditingMoment.value.moment.date = new Date()
      .toLocaleString('sv-SE')
      .replace('T', ' ')
  }
}

// --- Tag Management ---
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
  if (localEditingMoment.value && newTagText.value.trim()) {
    if (!localEditingMoment.value.moment.tags)
      localEditingMoment.value.moment.tags = []
    localEditingMoment.value.moment.tags.push(newTagText.value.trim())
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
  if (localEditingMoment.value?.moment.tags) {
    const currentTag = localEditingMoment.value.moment.tags[tagIndex]
    showTagInput.value = true
    newTagText.value = currentTag || ''
    localEditingMoment.value.moment.tags.splice(tagIndex, 1)
    nextTick(() => {
      tagInputRef.value?.focus()
    })
  }
  const key = `${tagIndex}`
  tagOverlayVisible.value[key] = false
}

function deleteTag(tagIndex: number) {
  if (localEditingMoment.value?.moment.tags) {
    localEditingMoment.value.moment.tags.splice(tagIndex, 1)
  }
  const key = `${tagIndex}`
  tagOverlayVisible.value[key] = false
}

// --- Image Management ---
function addImageInput() {
  if (localEditingMoment.value) {
    if (!localEditingMoment.value.moment.image)
      localEditingMoment.value.moment.image = []
    localEditingMoment.value.moment.image.push('')
  }
}

function removeImageInput(index: number) {
  if (localEditingMoment.value?.moment.image)
    localEditingMoment.value.moment.image.splice(index, 1)
}
</script>

<template>
  <div v-if="editingMoment" class="edit-overlay" @click.self="closeEditOverlay">
    <div class="moment-edit-card floating">
      <div class="card-top-actions">
        <h2>
          {{ editingMoment.id.startsWith("new-") ? "新增瞬间" : "编辑瞬间" }}
        </h2>
        <div class="action-buttons">
          <button
            class="control-btn exit-btn"
            title="取消"
            @click="closeEditOverlay"
          >
            <Icon name="ph:x-circle-bold" class="action-icon" />
          </button>
          <button
            class="control-btn save-btn"
            :class="{ 'is-confirming': confirmStates.save }"
            :title="confirmStates.save ? '确认保存' : '保存'"
            @click="handleProtectedAction('save', saveEditingMoment)"
          >
            <Icon v-if="loadingStates.save" name="svg-spinners:180-ring" class="action-icon" />
            <Icon
              v-else
              :name="confirmStates.save ? 'ph:check-bold' : 'ph:floppy-disk-bold'"
              class="action-icon"
            />
          </button>
        </div>
      </div>
      <div class="form-group">
        <label>内容:</label>
        <textarea
          v-model="localEditingMoment!.moment.content"
          class="form-textarea"
          placeholder="瞬间内容"
        />
      </div>
      <div class="form-group">
        <label>日期:</label>
        <div class="date-input-group">
          <input
            v-model="localEditingMoment!.moment.date"
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
          v-model="localEditingMoment!.moment.address"
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
            <template v-if="localEditingMoment!.moment.tags">
              <div
                v-for="(tag, tagIndex) in localEditingMoment!.moment.tags"
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
                !localEditingMoment!.moment.tags
                || (localEditingMoment!.moment.tags.length === 0 && !showTagInput)
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
            <template v-if="localEditingMoment!.moment.image">
              <div
                v-for="(img, imgIndex) in localEditingMoment!.moment.image"
                :key="imgIndex"
                class="image-input-group"
              >
                <input
                  v-model="localEditingMoment!.moment.image[imgIndex]"
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
                !localEditingMoment!.moment.image
                || localEditingMoment!.moment.image.length === 0
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
</template>

<style lang="scss" scoped>
.action-icon {
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}

.control-btn .action-icon {
  transition: transform 0.3s ease-in-out;
}


.icon-action-btn,
.header-action-btn,
.remove-btn,
.control-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
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

  &:hover {
    background-color: rgb(128 128 128 / 20%);
  }
}


/* --- Admin/Edit Styles --- */
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
  border: 1px solid var(--c-border);
  border-radius: 20px;
  background-color: var(--c-bg);
}

.card-top-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--c-border);
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
  background-color: var(--c-primary-soft);
  color: var(--c-primary);

  &:hover {
    background-color: var(--c-primary-soft);
  }
}

.save-btn {
  background-color: var(--c-primary-soft);
  color: var(--c-primary);

  &:hover {
    background-color: var(--c-primary-soft);
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
  color: var(--c-text-1);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  box-sizing: border-box;
  background-color: var(--c-bg-1);
  font-size: 14px;
  color: var(--c-text);
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--c-text-2);
  outline: none;
  background-color: var(--c-bg);
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
  color: var(--c-text-2);
  cursor: pointer;

  &:hover {
    background-color: rgb(128 128 128 / 20%);
  }
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
  color: var(--c-text-2);
  cursor: pointer;

  &:hover {
    background-color: rgb(128 128 128 / 20%);
  }
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
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background-color: var(--c-bg-1);
  cursor: default;
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
  color: var(--c-text-2);
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
  color: var(--c-text-2);
  cursor: pointer;

  &:hover {
    background-color: rgb(128 128 128 / 20%);
  }
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
    background-color: var(--c-bg-2);
  }
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
  background: var(--c-bg-soft);
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
  color: var(--c-primary);
  background-color: var(--c-bg-1);

  &:hover {
    background-color: var(--c-bg-2);
  }
}

.tag-delete-btn {
  color: var(--c-primary);
  background-color: var(--c-bg-1);

  &:hover {
    background-color: var(--c-bg-2);
  }
}
</style>
