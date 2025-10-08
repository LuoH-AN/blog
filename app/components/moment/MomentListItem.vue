<script setup lang="ts">
import { ref } from 'vue'
import type { MomentFormItem } from '~/types/moments'
import { getFavicon } from '~/utils/img'

const props = defineProps<{
  form: MomentFormItem
  isLoggedIn: boolean
  index: number
  confirmStates: Record<string, boolean>
  loadingStates: Record<string, boolean>
}>()

const emit = defineEmits(['edit-moment', 'delete-moment', 'scroll-to-comment', 'open-lightbox'])


async function requestEditMoment() {
  emit('edit-moment', props.form)
  // Add a small delay to show the loading state
  await new Promise(resolve => setTimeout(resolve, 100))
}

function requestDeleteMoment() {
  emit('delete-moment', props.form.id)
}

function requestScrollToComment() {
  emit('scroll-to-comment', props.form.moment.content)
}

function requestOpenLightbox(e: MouseEvent) {
  emit('open-lightbox', e)
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
</script>

<template>
  <div class="talk-item" :style="{ '--delay': `${index * 0.1}s` }">
    <div v-if="isLoggedIn" class="talk-item-actions">
      <button
        class="icon-action-btn"
        :class="{ 'is-confirming': confirmStates[`edit-${form.id}`] }"
        :title="confirmStates[`edit-${form.id}`] ? '确认编辑' : '编辑'"
        @click="requestEditMoment"
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
        :title="confirmStates[`delete-${form.id}`] ? '确认删除' : '删除'"
        @click="requestDeleteMoment"
      >
        <Icon v-if="loadingStates[`delete-${form.id}`]" name="svg-spinners:180-ring" />
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
        @click="requestOpenLightbox"
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
      <button class="comment-btn" @click="requestScrollToComment">
        <Icon name="i-ph:chats-bold" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.action-icon {
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}

.icon-action-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
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
</style>
