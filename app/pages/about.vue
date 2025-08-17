<script setup lang="ts">
const appConfig = useAppConfig()
useSeoMeta({
	title: '关于',
	description: `关于 ${appConfig.author.name} 以及这个博客的一切。`,
})

const layoutStore = useLayoutStore()

layoutStore.setAside([])

const birthYear = appConfig.stats.birthYear
const age = new Date().getFullYear() - birthYear
</script>

<template>
<div class="about-page">
  <header class="about-header">
    <h1>关于我</h1>
    <p>落人间，破三弦，忆李仙。</p>
  </header>

  <div class="cards-grid">
    <!-- Card 1: Intro -->
    <div class="card intro-card">
      <p>你好, 很高兴认识你👋</p>
      <h2>我叫 {{ appConfig.author.name }}</h2>
      <p>是一名 学生、开发者、博主</p>
      <Icon name="ph:rocket-launch-bold" class="card-bg-icon" />
    </div>

    <!-- Card 2: Born -->
    <div class="card info-card">
      <div class="info-item special-info-item">
        <span class="label">生于</span>
        <span class="value text-blue">{{ birthYear }}</span>
      </div>
      <div class="info-item special-info-item">
        <span class="label">当前</span>
        <span class="value text-purple">{{ age }} 岁 👨‍🎓</span>
      </div>
      <Icon name="ph:calendar-blank-bold" class="card-bg-icon" />
    </div>

    <!-- Card 3: Motto -->
    <div class="card motto-card">
      <span class="label">座右铭</span>
      <p>人生须尽欢</p>
      <p>莫使空对月</p>
      <Icon name="ph:heart-bold" class="card-bg-icon" />
    </div>

    <!-- Card 4: Tech -->
    <div class="card tech-card">
      <span class="label">关注偏好</span>
      <h3>数码科技</h3>
      <p>手机、电脑软硬件</p>
      <Icon name="ph:desktop-tower-bold" class="card-bg-icon" />
    </div>

    <!-- Card 5: Music -->
    <div class="card music-card">
      <span class="label">音乐偏好</span>
      <h3>周杰伦，周深</h3>
      <Icon name="ph:music-notes-simple-bold" class="card-bg-icon" />
    </div>

    <!-- Card 6: Personality -->
    <div class="card info-card personality-card">
      <span class="label">性格</span>
      <div class="content-center">
        <span class="value text-gray">调停者</span>
        <span class="value-small text-gray">INFP-T</span>
      </div>
      <a href="https://www.16personalities.com/" target="_blank" rel="noopener noreferrer" class="card-link">在 16personalities 了解更多</a>
      <Icon name="ph:user-focus-bold" class="card-bg-icon" />
    </div>

    <!-- Card 7: Specialty -->
    <div class="card specialty-card">
      <span class="label">特长</span>
      <p class="specialty-text">
        稳稳当当的 <span class="highlight">“高冷”者</span>
      </p>
      <p class="specialty-text">
        英语指数 <span class="highlight">MAX</span>
      </p>
      <Icon name="ph:game-controller-bold" class="card-bg-icon" />
    </div>

    <!-- Card 8: Contact -->
    <div class="card contact-card">
      <span class="label">联系我</span>
      <div class="contact-links">
        <a href="https://github.com/LuoH-AN" target="_blank" rel="noopener noreferrer" title="GitHub:LuoH-AN">
          <Icon name="ph:github-logo-fill" />
        </a>
        <a href="mailto:enltlh@gmail.com" target="_blank" rel="noopener noreferrer" title="Email:enltlh@gmail.com">
          <Icon name="ph:envelope-simple-fill" />
        </a>
        <a href="https://qm.qq.com/q/9sljinl6rC" target="_blank" rel="noopener noreferrer" title="QQ:1412219758">
          <Icon name="ri:qq-fill" />
        </a>
      </div>
      <Icon name="ph:address-book-bold" class="card-bg-icon" />
    </div>
  </div>
</div>
</template>

<style lang="scss" scoped>
.about-page {
  padding: 2rem 1rem;
  max-width: 1000px;
  margin: 0 auto;
  animation: float-in 0.3s backwards;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
  }
  p {
    font-size: 1.2rem;
    color: var(--c-text-2);
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  border-radius: 1.5rem;
  padding: 2rem 1.5rem; // Increased padding for content spacing
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 220px; // Slightly increased height
  transition: none !important;

  &:hover {
    transform: none !important;
  }

  .label {
    position: absolute;
    top: 1rem;
    left: 1.5rem;
    font-size: 0.8rem; // Smaller label
    margin: 0;
    opacity: 0.8;
  }

  .card-bg-icon {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    font-size: 5rem;
    opacity: 0.1;
    pointer-events: none;
  }
}

.intro-card {
  background: linear-gradient(to right, rgb(218, 136, 147), rgb(235, 201, 205));
  color: white;
  grid-column: 1 / -1;
  h2 {
    font-size: 3rem; // Larger content text
    font-weight: bold;
    margin: 0.5rem 0;
  }
}

.info-card {
  background: linear-gradient(to right, rgb(178, 235, 201), rgb(231, 195, 114), rgb(227, 101, 105));
  color: #333;
  justify-content: center;
  align-items: stretch;
  padding: 2.5rem 1.5rem; // More vertical padding

  .special-info-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    position: relative;
    flex-grow: 1;

    .label {
      position: static; // Override absolute positioning
      margin-bottom: 0.5rem;
      width: 100%;
      text-align: left;
      flex-shrink: 0;
    }
  }

  .content-center {
    // A wrapper to help center content when label is absolute
  }
  .value {
    font-size: 2.5rem; // Larger content text
    font-weight: bold;
    display: block;
    width: 100%;
    text-align: center;
  }
  .value-small {
    font-size: 2rem; // Larger content text
    font-weight: bold;
    display: block;
    width: 100%;
    text-align: center;
  }
  .text-blue { color: #007bff; }
  .text-purple { color: #6f42c1; }
  .text-gray { color: #6c757d; }
  .card-link {
    position: absolute;
    bottom: 1rem;
    right: 1.5rem;
    font-size: 0.8rem;
    color: #6c757d;
    text-decoration: none;
    &:hover {
      color: #0056b3;
    }
  }
}

.motto-card {
  background: linear-gradient(to right, rgb(21, 108, 165), rgb(89, 193, 230), rgb(230, 230, 230));
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  p {
    font-size: 2.5rem; // Larger content text
    font-weight: bold;
    margin: 0;
    line-height: 1.2;
  }
}

.tech-card {
  background: linear-gradient(to right, rgb(107, 107, 193), rgb(114, 148, 211), rgb(125, 214, 208));
  color: white;
  min-height: 250px;
  display: flex;
  flex-direction: column;

  h3 {
    font-size: 3rem; // Larger content text
    font-weight: bold;
    margin: 0.5rem 0;
  }
  p {
    color: #ccc;
  }
}

.music-card {
    background: linear-gradient(to right, rgb(221, 19, 0), rgb(225, 155, 5));
    color: white;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    min-height: 250px;

    h3 {
        font-size: 2.5rem; // Larger content text
        font-weight: bold;
    }
}

.personality-card {
  background: linear-gradient(to right, rgb(148, 235, 100), rgb(100, 235, 194));
}

.specialty-card {
    background: linear-gradient(to right, rgb(96, 215, 193), rgb(152, 162, 209));
    color: white;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 1.8rem;
    font-weight: bold;
    .specialty-text {
      margin: 0.2em 0;
    }
    .highlight {
        font-size: 2.5rem;
        display: inline-block;
        line-height: 1;
    }
}
.contact-card {
  grid-column: 1 / -1;
  background: linear-gradient(to right, rgb(235, 133, 82), rgb(235, 74, 78));
  color: white;
  .contact-links {
    display: flex;
    gap: 1.5rem;
    a {
      color: white;
      font-size: 2.5rem;
      transition: transform 0.2s;
      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

.dark {
  .intro-card {
    background: linear-gradient(to right, #2c3e50, #4ca1af);
  }
  .info-card {
    background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
    color: #eee;
    .text-blue, .text-purple, .text-gray {
      color: #adadad;
    }
  }
  .motto-card {
    background: linear-gradient(to right, #141e30, #243b55);
  }
  .tech-card {
    background: linear-gradient(to right, #1e1e1e, #2d2d2d);
  }
  .music-card {
    background: linear-gradient(to right, #430000, #7a0000);
  }
  .personality-card {
    background: linear-gradient(to right, #0f340f, #1a531a);
    color: #eee;
    .text-gray {
      color: #adadad;
    }
  }
  .specialty-card {
    background: linear-gradient(to right, #302b63, #24243e);
  }
  .contact-card {
    background: linear-gradient(to right, #4e2f0f, #6a3f14);
    a {
      color: white;
    }
  }
}

</style>
