<script setup lang="ts">
import { ref } from 'vue'

const appConfig = useAppConfig()
useSeoMeta({
	title: '瞬间',
	description: `记录 ${appConfig.author.name} 的瞬间想法和生活片段。`,
})

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'connectivity', 'blog-log'])

interface MomentListItem {
  content: string;
  date: string;
  image?: string[];
  address?: string;
  tags?: string[];
}

interface Moment {
  name: string;
  avatar: string;
  avatarLink: string;
  moment_list: MomentListItem[];
}


const momentData = ref<Moment[]>([
  {
    "name": "落憾",
    "avatar": "https://cdn2.enltlh.me/pichub/1/2025/2231d2da22a739df.jpg",
    "avatarLink": "/about/",
    "moment_list": [
      {
        "content": "终于把瞬间搞好了😋",
        "date": "2025-08-18",
        "tags": ["技术"]
      }
    ]
  }, {
    "name": "落憾",
    "avatar": "https://cdn2.enltlh.me/pichub/1/2025/2231d2da22a739df.jpg",
    "avatarLink": "/about/",
    "moment_list": [
      {
        "content": "快把以前的文章转移完了😋",
        "date": "2025-08-18 19:23",
        "tags": ["生活"]
      }
    ]
  }
])

function formatISODate(dateString?: string) {
	if (!dateString) return ''
	return new Date(dateString).toISOString()
}

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
        </div>
        <div class="talk-bottom">
          <div class="talk-meta-info">
            <div v-if="item.tags && item.tags.length > 0" class="talk-tags">
              <span v-for="tag in item.tags" :key="tag" class="tag">
                <Icon name="i-ph:tag-bold" /> {{ tag }}
              </span>
            </div>
            <div v-if="item.address" class="talk-address">
              <a
                v-tip="{ content: `搜索: ${item.address}` }"
                :href="`https://www.bing.com/maps?q=${encodeURIComponent(item.address)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="address"
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
    box-shadow: 0 0 0 1px var(--c-bg-soft);
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
    color: var(--text-color-strong);
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
    color: var(--text-color-light);
  }
}

.talk-content {
  .content-text {
    margin: 0 0 0.5rem 0;
    color: var(--text-color-main);
    line-height: 1.6;
    white-space: pre-wrap;
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;

  .grid-item {
    overflow: hidden;
    border-radius: 8px;
  }

  .grid-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.talk-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--c-text-3, #888);
}

.talk-bottom {
  .meta-info {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  .tag, .address {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    background-color: var(--c-bg-lighter, #eeeeee);
    padding: 0.15rem 0.4rem;
    border-radius: 6px;
    font-size: 0.75rem;
  }

  .tag {
    color: #888;
  }

  .address {
    color: #3b82f6;
  }

  .dark & .tag {
    background-color: #3a3a3c;
    color: #aaa;
  }

  .dark & .address {
    background-color: #3a3a3c;
  }
}

.comment-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--text-color-light);
  transition: color 0.2s ease;

  &:hover {
    color: var(--primary-color);
  }
}
</style>
