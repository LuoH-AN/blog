<script setup lang="ts">
import type { MomentData, MomentItem } from "../types/moments";
import { getFavicon } from "../utils/img";
import Lightbox from "~/components/popover/Lightbox.vue";
import blogConfig from "../../blog.config";

// --- Login Status ---
const apiAuth = ref(false);
const isLoggedIn = computed(() => apiAuth.value);

const layoutStore = useLayoutStore();
layoutStore.setAside(["blog-stats", "blog-tech", "blog-log", "poetry"]);

// --- API Data ---
interface MomentApiResponse {
  isAuthenticated: boolean;
  moments: MomentData;
}
const {
  data: apiResponse,
  pending,
  error,
  refresh,
} = await useFetch<MomentApiResponse>("/api/moments");
const momentData = computed(() => apiResponse.value?.moments || []);
apiAuth.value = apiResponse.value?.isAuthenticated || false;
watch(apiResponse, (newResponse) => {
  apiAuth.value = newResponse?.isAuthenticated || false;
});

// --- Local State ---
interface MomentFormItem {
  id: string;
  user: {
    name: string;
    avatar: string;
    avatarLink: string;
  };
  moment: MomentItem;
}
const momentForms = ref<MomentFormItem[]>([]);
const editingMoment = ref<MomentFormItem | null>(null);

// Watch for data changes to populate local form state
watch(
  momentData,
  (newData) => {
    if (newData) {
      momentForms.value = [];
      newData.forEach((user, userIndex) => {
        user.moment_list.forEach((moment, momentIndex) => {
          momentForms.value.push({
            id: `${userIndex}-${momentIndex}`,
            user: {
              name: user.name,
              avatar: user.avatar,
              avatarLink: user.avatarLink || "",
            },
            moment,
          });
        });
      });
      momentForms.value.sort(
        (a, b) =>
          new Date(b.moment.date).getTime() - new Date(a.moment.date).getTime()
      );
    }
  },
  { immediate: true }
);

// --- Actions ---
const confirmStates = ref<Record<string, boolean>>({});
const loadingStates = ref<Record<string, boolean>>({});

async function handleProtectedAction(
  id: string,
  action: () => Promise<void> | void
) {
  if (confirmStates.value[id]) {
    delete confirmStates.value[id];
    loadingStates.value[id] = true;
    try {
      await action();
    } finally {
      loadingStates.value[id] = false;
    }
  } else {
    Object.keys(confirmStates.value).forEach(
      (key) => delete confirmStates.value[key]
    );
    confirmStates.value[id] = true;
    setTimeout(() => {
      if (confirmStates.value[id]) delete confirmStates.value[id];
    }, 2000);
  }
}

async function logout() {
  const authToken = useCookie("auth_token");
  authToken.value = null;
  apiAuth.value = false;
  navigateTo("/login");
}

function openEditOverlay(form?: MomentFormItem) {
  if (form) {
    editingMoment.value = JSON.parse(JSON.stringify(form));
  } else {
    editingMoment.value = {
      id: `new-${Date.now()}`,
      user: {
        name: blogConfig.author.name,
        avatar: blogConfig.author.avatar,
        avatarLink: blogConfig.url,
      },
      moment: {
        content: "",
        date: new Date().toLocaleString("sv-SE").replace("T", " "),
        tags: [],
        image: [],
        address: "",
      },
    };
  }
  // Ensure tags and image are arrays
  if (editingMoment.value && !editingMoment.value.moment.tags)
    editingMoment.value.moment.tags = [];

  if (editingMoment.value && !editingMoment.value.moment.image)
    editingMoment.value.moment.image = [];
}

function closeEditOverlay() {
  editingMoment.value = null;
}

async function saveEditingMoment() {
  if (!editingMoment.value) return;
  const isNew = editingMoment.value.id.startsWith("new-");

  let forms = [...momentForms.value];
  if (isNew) {
    forms.unshift(editingMoment.value);
  } else {
    const index = forms.findIndex((f) => f.id === editingMoment.value!.id);
    if (index !== -1) forms[index] = editingMoment.value;
  }

  await updateMomentsApi(forms);
  closeEditOverlay();
}

async function deleteMoment(formId: string) {
  const updatedForms = momentForms.value.filter((f) => f.id !== formId);
  await updateMomentsApi(updatedForms);
}

async function updateMomentsApi(forms: MomentFormItem[]) {
  try {
    const newDataToSave: MomentData = [];
    forms.forEach((formItem) => {
      let userEntry = newDataToSave.find((u) => u.name === formItem.user.name);
      if (!userEntry) {
        userEntry = { ...formItem.user, moment_list: [] };
        newDataToSave.push(userEntry);
      }
      userEntry.moment_list.push(formItem.moment);
    });

    await $fetch("/api/moments", { method: "POST", body: newDataToSave });
    await refresh();
  } catch (err) {
    console.error("更新数据时出错:", err);
    if ((err as any).response?.status === 401) navigateTo("/login");
  }
}

// --- Form Helpers ---
const showTagInput = ref(false);
const newTagText = ref("");
const tagInputRef = ref<HTMLInputElement | null>(null);
const tagOverlayVisible = ref<Record<string, any>>({});
const tagClickTimeout = ref<Record<string, number>>({});
const tagClickCount = ref<Record<string, number>>({});

const handleClickOutside = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest(".add-tag-btn")) return;

  Object.keys(tagOverlayVisible.value).forEach((key) => {
    if (tagOverlayVisible.value[key] === true) {
      const tagCard = document.querySelector(`[data-tag-key="${key}"]`);
      if (tagCard && !tagCard.contains(event.target as Node)) {
        tagOverlayVisible.value[key] = false;
        tagOverlayVisible.value[`${key}-mode`] = undefined;
      }
    }
  });

  if (showTagInput.value) {
    const tagInputContainer = document.querySelector(".tag-input-container");
    if (
      tagInputContainer &&
      !tagInputContainer.contains(event.target as Node)
    ) {
      confirmAddTag();
    }
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const addTagInput = () => {
  showTagInput.value = true;
  nextTick(() => tagInputRef.value?.focus());
};
const confirmAddTag = () => {
  if (editingMoment.value && newTagText.value.trim()) {
    if (!editingMoment.value.moment.tags) editingMoment.value.moment.tags = [];
    editingMoment.value.moment.tags.push(newTagText.value.trim());
  }
  newTagText.value = "";
  showTagInput.value = false;
};

const handleTagClick = (tagIndex: number) => {
  const key = `${tagIndex}`;
  tagClickCount.value[key] = (tagClickCount.value[key] || 0) + 1;

  if (tagClickCount.value[key] === 1) {
    tagClickTimeout.value[key] = window.setTimeout(() => {
      showTagEditOverlay(tagIndex);
      tagClickCount.value[key] = 0;
    }, 300);
  } else if (tagClickCount.value[key] === 2) {
    clearTimeout(tagClickTimeout.value[key]);
    showTagDeleteOverlay(tagIndex);
    tagClickCount.value[key] = 0;
  }
};

const showTagEditOverlay = (tagIndex: number) => {
  const key = `${tagIndex}`;
  tagOverlayVisible.value[key] = true;
  tagOverlayVisible.value[`${key}-mode`] = "edit";
};

const showTagDeleteOverlay = (tagIndex: number) => {
  const key = `${tagIndex}`;
  tagOverlayVisible.value[key] = true;
  tagOverlayVisible.value[`${key}-mode`] = "delete";
};

const editTag = (tagIndex: number) => {
  if (editingMoment.value?.moment.tags) {
    const currentTag = editingMoment.value.moment.tags[tagIndex];
    showTagInput.value = true;
    newTagText.value = currentTag || "";
    editingMoment.value.moment.tags.splice(tagIndex, 1);
    nextTick(() => {
      tagInputRef.value?.focus();
    });
  }
  const key = `${tagIndex}`;
  tagOverlayVisible.value[key] = false;
};

const deleteTag = (tagIndex: number) => {
  if (editingMoment.value?.moment.tags) {
    editingMoment.value.moment.tags.splice(tagIndex, 1);
  }
  const key = `${tagIndex}`;
  tagOverlayVisible.value[key] = false;
};
const addImageInput = () => {
  if (editingMoment.value) {
    if (!editingMoment.value.moment.image)
      editingMoment.value.moment.image = [];
    editingMoment.value.moment.image.push("");
  }
};
const removeImageInput = (index: number) => {
  if (editingMoment.value?.moment.image)
    editingMoment.value.moment.image.splice(index, 1);
};
const setCurrentDateTime = () => {
  if (editingMoment.value)
    editingMoment.value.moment.date = new Date()
      .toLocaleString("sv-SE")
      .replace("T", " ");
};

// --- Display Helpers ---
function scrollToComment(content: string) {
  const commentSection = document.getElementById("comment-section");
  if (commentSection) {
    commentSection.scrollIntoView({ behavior: "smooth" });
    const textarea = commentSection.querySelector(
      ".tk-submit textarea"
    ) as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.focus();
      textarea.value = `> ${content}\n\n`;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}
function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return getFavicon(domain, { provider: "google", size: 32 });
  } catch (e) {
    console.error("Invalid URL for favicon:", url, e);
    return "";
  }
}
const lightboxEl = ref<HTMLImageElement>();
const isLightboxOpening = ref(false);
function openLightbox(e: MouseEvent) {
  if (e.target instanceof HTMLImageElement) {
    lightboxEl.value = e.target;
    isLightboxOpening.value = true;
  }
}
function closeLightbox() {
  isLightboxOpening.value = false;
}
</script>

<template>
  <div class="talk-container">
    <!-- Header Card -->
    <div v-if="isLoggedIn" class="moment-header-card">
      <h1>瞬间管理</h1>
      <div class="header-actions">
        <button
          class="header-action-btn"
          :class="{ 'is-confirming': confirmStates.logout }"
          :title="confirmStates.logout ? '确认退出' : '退出登录'"
          @click="handleProtectedAction('logout', logout)"
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
          @click="handleProtectedAction('add', () => openEditOverlay())"
        >
          <Icon
            :name="confirmStates.add ? 'ph:check-bold' : 'ph:plus-circle-bold'"
            class="action-icon"
          />
        </button>
      </div>
    </div>

    <!-- Floating Edit Card -->
    <div
      v-if="editingMoment"
      class="edit-overlay"
      @click.self="closeEditOverlay"
    >
      <div class="moment-edit-card floating">
        <div class="card-top-actions">
          <h2>
            {{ editingMoment.id.startsWith("new-") ? "新增瞬间" : "编辑瞬间" }}
          </h2>
          <div class="action-buttons">
            <button
              class="control-btn exit-btn"
              :class="{ 'is-confirming': confirmStates.exit }"
              title="取消"
              @click="handleProtectedAction('exit', closeEditOverlay)"
            >
              <Icon
                :name="
                  confirmStates.exit ? 'ph:check-bold' : 'ph:x-circle-bold'
                "
                class="action-icon"
              />
            </button>
            <button
              class="control-btn save-btn"
              :class="{ 'is-confirming': confirmStates.save }"
              title="保存"
              @click="handleProtectedAction('save', saveEditingMoment)"
            >
              <Icon v-if="loadingStates.save" name="svg-spinners:180-ring" />
              <Icon
                v-else
                :name="
                  confirmStates.save ? 'ph:check-bold' : 'ph:floppy-disk-bold'
                "
                class="action-icon"
              />
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>内容:</label>
          <textarea
            v-model="editingMoment.moment.content"
            class="form-textarea"
            placeholder="瞬间内容"
          />
        </div>
        <div class="form-group">
          <label>日期:</label>
          <div class="date-input-group">
            <input
              v-model="editingMoment.moment.date"
              type="text"
              class="form-input date-input"
              placeholder="yyyy-mm-ddTHH:mm:ssZ"
            />
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
            v-model="editingMoment.moment.address"
            type="text"
            class="form-input"
            placeholder="地址"
          />
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
                />
              </div>
              <template v-if="editingMoment.moment.tags">
                <div
                  v-for="(tag, tagIndex) in editingMoment.moment.tags"
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
                  !editingMoment.moment.tags ||
                  (editingMoment.moment.tags.length === 0 && !showTagInput)
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
              <template v-if="editingMoment.moment.image">
                <div
                  v-for="(img, imgIndex) in editingMoment.moment.image"
                  :key="imgIndex"
                  class="image-input-group"
                >
                  <input
                    v-model="editingMoment.moment.image[imgIndex]"
                    type="text"
                    class="form-input image-input"
                    placeholder="图片URL"
                  />
                  <button
                    class="remove-btn"
                    :class="{
                      'is-confirming': confirmStates[`image-${imgIndex}`],
                    }"
                    title="删除图片"
                    @click="
                      handleProtectedAction(`image-${imgIndex}`, () =>
                        removeImageInput(imgIndex)
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
                  !editingMoment.moment.image ||
                  editingMoment.moment.image.length === 0
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

    <!-- Moments List -->
    <div v-if="pending" class="loading">加载中...</div>
    <div v-else-if="error" class="error">加载失败: {{ error.message }}</div>
    <template v-else-if="momentForms.length > 0">
      <div
        v-for="(form, index) in momentForms"
        :key="form.id"
        class="talk-item"
        :style="{ '--delay': `${index * 0.1}s` }"
      >
        <div v-if="isLoggedIn" class="talk-item-actions">
          <button
            class="icon-action-btn"
            :class="{ 'is-confirming': confirmStates[`edit-${form.id}`] }"
            title="编辑"
            @click="
              handleProtectedAction(`edit-${form.id}`, () =>
                openEditOverlay(form)
              )
            "
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
            title="删除"
            @click="
              handleProtectedAction(`delete-${form.id}`, () =>
                deleteMoment(form.id)
              )
            "
          >
            <Icon
              v-if="loadingStates[`delete-${form.id}`]"
              name="svg-spinners:180-ring"
            />
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
            <img :src="form.user.avatar" class="avatar" />
          </a>
          <div class="info">
            <div class="talk-nick">
              {{ form.user.name }}
              <Icon name="i-material-symbols:verified" class="verified" />
            </div>
            <div class="talk-date">{{ form.moment.date }}</div>
          </div>
        </div>
        <div class="talk-content">
          <p class="content-text">{{ form.moment.content }}</p>
          <div
            v-if="form.moment.image && form.moment.image.length > 0"
            class="image-grid"
            @click="openLightbox"
          >
            <img
              v-for="(img, imgIndex) in form.moment.image"
              :key="imgIndex"
              :src="img"
              class="grid-img"
            />
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
            />
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
          <button
            class="comment-btn"
            @click="scrollToComment(form.moment.content)"
          >
            <Icon name="i-ph:chats-bold" />
          </button>
        </div>
      </div>
    </template>
    <div v-else class="no-data">暂无瞬间数据</div>

    <PostComment id="comment-section" />
  </div>
  <ClientOnly>
    <Lightbox
      v-if="lightboxEl"
      :el="lightboxEl"
      :is-opening="isLightboxOpening"
      @close="closeLightbox"
    />
  </ClientOnly>
</template>

<style lang="scss" scoped>
.action-icon {
  transition:
    opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}

.icon-action-btn,
.header-action-btn,
.remove-btn,
.control-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
}

.icon-action-btn.is-confirming,
.header-action-btn.is-confirming,
.remove-btn.is-confirming,
.control-btn.is-confirming {
  background-color: #ffe0e0;
  color: #d9534f;
}
.dark .icon-action-btn.is-confirming,
.dark .header-action-btn.is-confirming,
.dark .remove-btn.is-confirming,
.dark .control-btn.is-confirming {
  background-color: rgba(255, 100, 100, 0.2);
  color: #ff8c8c;
}

.tag-card.is-confirming-tag {
  background-color: #ffe0e0;
  color: #d9534f;
}
.dark .tag-card.is-confirming-tag {
  background-color: rgba(255, 100, 100, 0.2);
  color: #ff8c8c;
}

.talk-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 15px;
}

.talk-item {
  position: relative;
  animation: float-in 0.3s backwards;
  animation-delay: var(--delay);
  border-radius: 15px;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
  padding: 0.8rem;
}

.dark .talk-item {
  border-color: #3d3d3d;
  background-color: #2b2b2b;
}

.talk-item-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.icon-action-btn {
  background: rgba(128, 128, 128, 0.1);
  border: none;
  color: gray;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background: rgba(128, 128, 128, 0.2);
    color: #333;
  }
}
.dark .icon-action-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ccc;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
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
    border-radius: 35%;
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
  .dark .talk-nick {
    color: #e0e0e0;
  }

  .talk-nick .verified {
    margin-left: 0.25rem;
    color: #4e9df8;
    font-size: 1.1em;
    vertical-align: text-bottom;
  }

  .talk-date {
    font-size: 0.75rem;
    font-family: var(--font-monospace);
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
  .dark .content-text {
    color: #e0e0e0;
  }
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
  align-items: flex-start;
}

.grid-img {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  cursor: zoom-in;
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

/* --- Admin/Edit Styles --- */
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
.dark .moment-header-card {
  background-color: #2b2b2b;
  border-color: #3d3d3d;
}

.moment-header-card h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.5px;
}
.dark .moment-header-card h1 {
  color: #e0e0e0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-action-btn {
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
.dark .header-action-btn {
  background-color: rgba(128, 128, 128, 0.2);
  color: #ccc;
}
.header-action-btn:hover {
  background-color: rgba(128, 128, 128, 0.2);
}

.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 5vh;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.moment-edit-card.floating {
  width: 90%;
  max-width: 700px;
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background-color: #fff;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}
.dark .moment-edit-card.floating {
  background-color: #2b2b2b;
  border-color: #3d3d3d;
}

.card-top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}
.dark .card-top-actions {
  border-bottom-color: #3d3d3d;
}
.card-top-actions h2 {
  font-size: 1.2rem;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.exit-btn {
  color: #f5a623;
  background-color: rgba(245, 166, 35, 0.1);
  &:hover {
    background-color: rgba(245, 166, 35, 0.2);
  }
}
.dark .exit-btn {
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
  &:hover {
    background-color: rgba(255, 193, 7, 0.2);
  }
}

.save-btn {
  color: #5cb85c;
  background-color: rgba(92, 184, 92, 0.1);
  &:hover {
    background-color: rgba(92, 184, 92, 0.2);
  }
}
.dark .save-btn {
  color: #66bb6a;
  background-color: rgba(102, 187, 106, 0.1);
  &:hover {
    background-color: rgba(102, 187, 106, 0.2);
  }
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
.dark .form-group label {
  color: #b0b0b0;
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
.dark .form-input,
.dark .form-textarea {
  background-color: #3a3a3a;
  border-color: #4a4a4a;
  color: #e0e0e0;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #999;
  background-color: #fff;
}
.dark .form-input:focus,
.dark .form-textarea:focus {
  border-color: #666;
  background-color: #3a3a3a;
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
.dark .time-btn {
  background-color: rgba(128, 128, 128, 0.2);
  color: #ccc;
}

.images-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.image-input-group {
  display: inline-flex;
  gap: 4px;
  align-items: center;
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
.dark .tags-card,
.dark .images-card {
  background-color: #3a3a3a;
  border-color: #4a4a4a;
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
}
.dark .empty-tags,
.dark .empty-images {
  color: #888;
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
.dark .add-tag-btn,
.dark .add-image-btn {
  background-color: rgba(128, 128, 128, 0.2);
  color: #ccc;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 36px;
}

.tag-new-input {
  min-width: 120px;
}

.tag-card.editable {
  position: relative;
  cursor: pointer;
  &:hover {
    background-color: #e0e0e0;
  }
}
.dark .tag-card.editable:hover {
  background-color: #5a5a5a;
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
  color: #d9534f;
  background-color: #fff5f5;
  border-color: #ffe0e0;
}
.no-data {
  color: #888;
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
</style>
