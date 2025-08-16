<script setup lang="ts">
const appConfig = useAppConfig()
const timeEstablished = appConfig.timeEstablished

const blogLog = [
	{ date: '2024-04-19', content: '发布第一篇文章' },
	{ date: '2024-04-10', content: '迁移至 Nuxt' },
	{ date: '2023-04-23', content: '迁移至 Hexo 使用 Anzhiyu 主题' },
	{ date: '2023-04-21', content: '博客建立' },
]
</script>

<template>
  <ZWidget card title="更新日志">
    <div class="timeline">
      <div v-for="(item, index) in blogLog" :key="index" class="timeline-item">
        <span class="timeline-date">{{ item.date }}</span>
        <p class="timeline-content">{{ item.content }}</p>
      </div>
    </div>
  </ZWidget>
</template>

<style scoped>
/* 时间线容器 */
.timeline {
  position: relative;
  /* 在左侧为时间线和点留出空间 */
  padding-left: 1.75rem; /* 28px */
}

/* 垂直的时间线 */
.timeline::before {
  content: '';
  position: absolute;
  top: 0.5rem; /* 从第一个点的顶部之后开始 */
  bottom: 0.5rem; /* 在最后一个点的底部之前结束 */
  left: 0.5rem; /* 8px, 距离容器左侧 */
  width: 2px;
  background-color: #e5e7eb; /* 浅灰色 */
}

.timeline-item {
  position: relative;
}

/* 为除最后一项外的所有项添加底部间距 */
.timeline-item:not(:last-child) {
  margin-bottom: 1.5rem; /* 24px */
}

/* 每个时间项前面的“点” */
.timeline-item::before {
  content: '';
  position: absolute;
  /* 将点定位在线上 */
  /* 计算: left = (线的left值 8px) - (容器的padding-left 28px) + (点宽度 10px / 2) = -15px */
  left: -1.375rem; /* -22px */
  top: 0.35rem; /* 垂直对齐日期文本 */
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #9ca3af; /* 中等灰色 */
}

/* 第一个点的样式，使其更大更突出 */
.timeline-item:first-child::before {
  width: 14px;
  height: 14px;
  background-color: #4b5563; /* 深灰色 */
  /* 为更大的点重新计算left位置 */
  left: -1.5rem; /* -24px */
  top: 0.25rem; /* 调整垂直对齐 */
}

.timeline-date {
  display: block;
  color: #9ca3af; /* 日期的浅色文本 */
  font-size: 0.875rem; /* 14px */
  line-height: 1.25rem; /* 20px */
}

.timeline-content {
  margin: 0.25rem 0 0; /* 4px 顶部外边距 */
  color: #374151; /* 内容的标准文本颜色 */
  font-size: 1rem; /* 16px */
  line-height: 1.5rem; /* 24px */
}
</style>
