<script setup lang="ts">
import Lightbox from '~/components/popover/Lightbox.vue'

const appConfig = useAppConfig()

const lightboxEl = ref<HTMLImageElement>()
const isLightboxOpening = ref(false)

function openLightbox(e: Event) {
        const target = e.target as HTMLElement
        if (target.tagName === 'IMG' && target.closest('.tk-content')) {
                lightboxEl.value = target as HTMLImageElement
                isLightboxOpening.value = true
        }
}

function closeLightbox() {
        isLightboxOpening.value = false
}

// Removed the setAnonymousComment function

onMounted(() => {
        window.twikoo?.init({
                envId: appConfig.twikoo?.envId,
                el: '#twikoo',
        })
        const twikooEl = document.getElementById('twikoo')
        if (twikooEl)
                twikooEl.addEventListener('click', openLightbox)
})

onUnmounted(() => {
        const twikooEl = document.getElementById('twikoo')
        if (twikooEl)
                twikooEl.removeEventListener('click', openLightbox)
})
</script>

<template>
<section id="comment-section" class="z-comment">
        <div class="comment-header">
                <h3 class="text-creative">
                        评论区
                </h3>
                <!-- Removed the anonymous-btn button -->
        </div>
        <div id="twikoo">
                <p>评论加载中...</p>
        </div>
</section>
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
.z-comment {
        margin: 3rem 1rem;

        > h3 {
                margin-top: 3rem;
                font-size: 1.25rem;
        }
}

.comment-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.5rem;

        // Adjusted for when the button is removed,
        // if only h3 is left, no need for space-between
        justify-content: flex-start;
}

/* Removed the .anonymous-btn style block */

:deep(#twikoo) {
        margin: 2em 0;

        .tk-admin-container {
                position: fixed;
                z-index: 1;
        }

        .tk-time {
                color: var(--c-text-3);
        }

        .tk-main {
                margin-top: -0.1rem;
        }

        .tk-content {
                margin-top: 0.1rem;

                a {
                        display: inline;
                        background-image: linear-gradient(to right, var(--c-text-3) / 30%, var(--c-text-3) / 30%);
                        background-position: left bottom;
                        background-repeat: no-repeat;
                        background-size: 0% 2px;
                        vertical-align: baseline;
                        text-decoration: none;
                        color: var(--c-primary);
                        transition: background-size 0.3s ease-out, color 0.3s ease-out;

                        &:hover {
                                background-size: 100% 2px;
                                color: var(--c-primary);
                        }
                }
        }

        .tk-comments-title, .tk-nick > strong {
                font-family: var(--font-creative);
        }

        .tk-owo-emotion {
                width: auto;
                height: 1.4em;
                vertical-align: text-bottom;
        }

        .tk-extras, .tk-footer {
                font-size: 0.7rem;
                color: var(--c-text-3);
        }

        .tk-replies:not(.tk-replies-expand) {
                mask-image: linear-gradient(var(--c-bg) 50%, transparent);
        }

        .tk-expand {
                border-radius: 0.5rem;
                background-color: var(--c-bg-2);
                color: var(--c-text-1);
                transition: background-color 0.1s;

                &:hover {
                        background-color: var(--c-bg-3);
                }
        }

        :deep(:where(.tk-preview-container,.tk-content)) {
                pre {
                        border-radius: 0.5rem;
                        font-size: 0.8125rem;
                        background-color: var(--c-bg-1);
                        border: 1px solid var(--c-border);
                        color: var(--c-text-1);
                }

                p {
                        margin: 0.2em 0;
                }

                img {
                        border-radius: 0.5em;
                }

                menu, ol, ul {
                        margin: 0.5em 0;
                        padding-inline-start: 1.5em;
                }
        }

        .tk-submit {
                .tk-col {
                        display: flex;
                        flex-direction: column;
                }

                .tk-input {
                        order: 1;
                }

                .tk-meta-input {
                        order: 2;
                        margin-top: 0.75rem;
                        margin-bottom: 0;
                }
        }

        /* stylelint-disable-next-line selector-class-pattern */
        .el-textarea__inner,
        .tk-meta-input .el-input-group {
                border: 1.5px solid var(--c-border);
                border-radius: 12px;
                background-color: var(--c-bg-2);
                color: var(--c-text-1);
                transition: border-color 0.2s, box-shadow 0.2s;
        }

        /* stylelint-disable-next-line selector-class-pattern */
        .el-textarea__inner {
                min-height: 120px;
                padding: 1rem;
        }

        .tk-meta-input .el-input-group {
                overflow: hidden;
                background-color: transparent;
        }

        /* stylelint-disable-next-line selector-class-pattern */
        .tk-meta-input .el-input-group__prepend {
                padding: 0 1.25rem;
                border: none;
                background-color: var(--c-bg-1);
                color: var(--c-text-2);
        }

        /* stylelint-disable-next-line selector-class-pattern */
        .tk-meta-input .el-input__inner {
                border: none;
                background-color: var(--c-bg-2);
                color: var(--c-text-1);
        }

        /* stylelint-disable-next-line selector-class-pattern */
        .el-textarea__inner:focus,
        .tk-meta-input .el-input-group:focus-within {
                border-color: var(--c-primary);
                box-shadow: 0 0 0 1px var(--c-primary);
        }

        .tk-preview,
        .tk-cancel {
                border-radius: 8px;
                background-color: var(--c-bg-2);
                color: var(--c-text-1);
                border: 1px solid var(--c-border);

                &:hover {
                        background-color: var(--c-bg-3);
                        border-color: var(--c-primary);
                }
        }

        .tk-send {
                border-radius: 8px;
                background-color: #409EFF;
                color: white;
                border: 1px solid #409EFF;

                &:hover {
                        background-color: #007BFF;
                        border-color: #007BFF;
                }

                .dark & {
                        background-color: #3A8FE6;
                        border-color: #3A8FE6;

                        &:hover {
                                background-color: #2E7FCC;
                                border-color: #2E7FCC;
                        }
                }
        }
}

</style>
