<script setup lang="ts">
const blogLog = [
	{ date: '2024-04-19', content: '发布第一篇文章' },
	{ date: '2024-04-10', content: '迁移至 Nuxt' },
	{ date: '2023-04-23', content: '迁移至 Hexo 使用 Anzhiyu 主题' },
	{ date: '2023-04-21', content: '博客建立' },
]
</script>

<template>
  <ZWidget card title="更新日志">
    <ul class="timeline">
      <li v-for="(item, index) in blogLog" :key="index" class="timeline-item">
        <span class="date">{{ item.date }}</span>
        <p class="content">{{ item.content }}</p>
      </li>
    </ul>
  </ZWidget>
</template>

<style scoped>
/* 定义基础变量 */
.timeline {
  --line-color: #c9c9c9;
  --c-text-2: var(--custom-c-text-2, #374151);
  --c-text-3: var(--custom-c-text-3, #9ca3af);
  --font-monospace: var(--custom-font-monospace, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
}

/* 暗黑模式变量 */
.dark .timeline {
  --line-color: #4b5563;
  --c-text-2: var(--custom-dark-c-text-2, #d1d5db);
  --c-text-3: var(--custom-dark-c-text-3, #9ca3af);
}

/* 核心布局 */
.timeline {
  position: relative;
  list-style: none;
  padding: 0.2rem 0;
  margin: 0 0 0 0.8rem;
}

/* 时间轴项目 */
.timeline-item {
  position: relative;
  padding-left: 1.25rem;
  margin-bottom: 1.5rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

/* 所有项目的线段（包括最后一个） */
.timeline-item::after {
  content: '';
  position: absolute;
  z-index: 0;
  left: 0.25rem;
  top: 0.5rem;
  transform: translateX(-50%);
  width: 1px;
  height: 100%; /* 默认高度，用于连接下一个节点 */
  background-color: var(--line-color);
}

/* --- 核心修改 --- */
/* 单独为最后一个项目的线段调整高度 */
.timeline-item:last-child::after {
  /*
   * calc(100% - 0.75rem) 是关键
   * 100% 是整个列表项内容的高度
   * 0.75rem 约等于内容文字行高的一半，从底部减去这个值
   * 可以让线的末端在视觉上与最后一行文字的中心对齐
  */
  height: calc(100% - 0.75rem);
}

/* 时间轴圆点 */
.timeline-item::before {
  content: '';
  position: absolute;
  z-index: 1;
  left: 0.25rem;
  top: 0.5rem;
  transform: translateY(-50%) translateX(-50%);
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: var(--c-text-2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* 悬停时的辉光和放大效果 */
.timeline-item:hover::before {
  box-shadow: 0 0 8px var(--c-text-2);
  transform: translateY(-50%) translateX(-50%) scale(1.5);
}

/* 日期样式 */
.date {
  display: block;
  font-family: var(--font-monospace);
  font-size: 0.875rem;
  color: var(--c-text-3);
  margin-bottom: 0.3rem;
}

/* 内容样式 */
.content {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--c-text-2);
}
</style>
