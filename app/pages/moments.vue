<script setup lang="ts">
import { getFavicon } from '../utils/img'

const appConfig = useAppConfig()
useSeoMeta({
	title: '瞬间',
	description: `记录 ${appConfig.author.name} 的瞬间想法和生活片段。`,
})

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'blog-log', 'poetry'])

interface MomentListItem {
  content: string;
  date: string;
  image?: string[];
  address?: string;
  tags?: string[];
  link?: {
    url: string;
    text: string;
    icon?: string;
  };
}

interface Moment {
  name: string;
  avatar: string;
  avatarLink: string;
  moment_list: MomentListItem[];
}


const { data: momentData } = await useFetch<Moment[]>('/api/moments.get')

function scrollToComment(content: string) {
  const commentSection = document.getElementById('comment-section')
  if (commentSection) {
    commentSection.scrollIntoView({ behavior: 'smooth' })

    const textarea = commentSection.querySelector('.tk-submit textarea') as HTMLTextAreaElement | null
    if (textarea) {
      textarea.focus()
      textarea.value = `> ${content}\n\n`

      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return getFavicon(domain, { provider: 'google', size: 32 });
  } catch (e) {
    console.error("Invalid URL for favicon:", url, e);
    return '';
  }
}
</script>

<template>
  <div class="talk-container">
    <div v-for="moment in momentData" :key="moment.name" class="talk-group">
      <div v-for="(item, index) in moment.moment_list" :key="index" class="talk-item" :style="{ '--delay': `${index * 0.1}s` }">
        <div class="talk-meta">
          <a :href="moment.avatarLink" class="avatar-link">
            <img :src="moment.avatar" class="avatar" />
          </a>
          <div class="info">
            <div class="talk-nick">
              {{ moment.name }}
              <Icon name="i-material-symbols:verified" class="verified" />
            </div>
            <div class="talk-date">{{ item.date }}</div>
          </div>
        </div>
        <div class="talk-content">
          <p class="content-text">{{ item.content }}</p>
          <div v-if="item.image && item.image.length > 0" class="image-grid">
            <a
              v-for="(img, imgIndex) in item.image"
              :key="imgIndex"
              :href="img"
              target="_blank"
              class="grid-item"
              data-fancybox="gallery"
            >
              <img :src="img" class="grid-img" />
            </a>
          </div>

          <a v-if="item.link" :href="item.link.url" target="_blank" rel="noopener noreferrer" class="link-card">
            <img :src="getFaviconUrl(item.link.url)" alt="Favicon" class="link-favicon" @error="e => (e.target as HTMLImageElement).style.display='none'" />
            <span class="link-text">{{ item.link.text }}</span>
            <Icon v-if="item.link.icon" :name="item.link.icon" class="link-arrow" />
          </a>

        </div>
        <div class="talk-bottom">
          <div class="talk-meta-info">
            <div v-if="item.tags && item.tags.length > 0" class="talk-tags-wrapper">
              <span v-for="tag in item.tags" :key="tag" class="tag-card">
                <Icon name="i-ph:tag-bold" /> {{ tag }}
              </span>
            </div>
            <div v-if="item.address" class="talk-address-wrapper">
              <a
                v-tip="{ content: `搜索: ${item.address}` }"
                :href="`https://www.bing.com/maps?q=${encodeURIComponent(item.address)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="address-card"
              >
                <Icon name="i-ph:map-pin-bold" /> {{ item.address }}
              </a>
            </div>
          </div>
          <button class="comment-btn" @click="scrollToComment(item.content)">
            <Icon name="i-ph:chats-bold" />
          </button>
        </div>
      </div>
    </div>
    <PostComment />
  </div>
</template>

<style lang="scss" scoped>
.talk-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 15px;
}

.talk-item {
    animation: float-in .3s backwards;
    animation-delay: var(--delay);
    border-radius: 15px;
    border: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: 0.5rem;
    padding: .8rem;
}

.talk-meta {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 1rem;
    object-fit: cover;
  }

  .info {
    display: flex;
    flex-direction: column;
  }

  .talk-nick {
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
  }

  .talk-nick .verified {
    margin-left: 0.25rem;
    color: #4e9df8;
    font-size: 1.1em;
    vertical-align: text-bottom;
  }

  .talk-date {
    font-size: 0.85rem;
    color: #888;
  }
}

.talk-content {
  .content-text {
    margin: 0 0 0.5rem 0;
    color: #333;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
  align-items: flex-start;
}

.grid-item {
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
}

.grid-img {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
}


.talk-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #888;
}

.talk-meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.talk-tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.tag-card {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background-color: #eeeeee;
  padding: 0.15rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #888;
  white-space: nowrap;
}

.talk-address-wrapper {
  display: flex;
  align-items: center;
}

.address-card {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  background-color: #eeeeee;
  padding: 0.15rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #3b82f6;
  white-space: nowrap;
}

.dark .tag-card {
  background-color: #3a3a3c;
  color: #aaa;
}

.dark .address-card {
  background-color: #3a3a3c;
}


.comment-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #888;
  transition: color 0.2s ease;

  &:hover {
    color: #3b82f6;
  }
}

.link-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #e0e0e0;
  padding: 10px 15px;
  border-radius: 10px;
  margin-top: 10px;
  text-decoration: none;
  color: #333;
  transition: background-color 0.2s ease;
  border: 1px solid #d0d0d0;

  &:hover {
    background-color: #d0d0d0;
    border-color: #c0c0c0;
  }

  .dark & {
    background-color: #4a4a4c;
    color: #eee;
    border: 1px solid #5a5a5c;
    &:hover {
      background-color: #5a5a5c;
      border-color: #6a6a6c;
    }
  }
}

.link-favicon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 4px;
  object-fit: contain;
}

.link-text {
  flex-grow: 1;
  font-size: 0.95rem;
  font-weight: 500;
}

.link-arrow {
  font-size: 1.1rem;
  color: #888;
  flex-shrink: 0;
}
</style>
