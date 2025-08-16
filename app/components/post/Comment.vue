<script setup lang="ts">
const appConfig = useAppConfig()

onMounted(() => {
	// @ts-expect-error windows上有twikoo实例
	window.twikoo?.init?.({
		envId: appConfig.twikoo?.envId,
		// twikoo 会把挂载后的元素变为 #twikoo
		el: '#twikoo',
		// 已移除自定义 placeholder 配置
	})
})
</script>

<template>
<section class="z-comment">
	<h3 class="text-creative">
		评论区
	</h3>
	<div id="twikoo">
		<p>评论加载中...</p>
	</div>
</section>
</template>

<style lang="scss" scoped>
.z-comment {
	margin: 3rem 1rem;

	> h3 {
		margin-top: 3rem;
		font-size: 1.25rem;
	}
}

:deep(#twikoo) {
	/* --- 您原有的样式 (保留) --- */
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

		img {
			border-radius: 0.5em;
		}
	}

	.tk-comments-title, .tk-nick > strong {
		font-family: var(--font-creative);
	}

	pre {
		border-radius: 0.5rem;
		font-size: 0.8125rem;
	}

	p {
		margin: 0.2em 0;
	}

	menu, ol, ul {
		margin: 0.5em 0;
		padding: 0 0 0 1.5em;
		list-style: revert;

		> li {
			margin: 0.2em 0;

			&::marker {
				font-size: 0.8em;
				color: var(--c-primary);
			}
		}
	}

	blockquote {
		margin: 0.5em 0;
		padding: 0.2em 0.5em;
		border-left: 4px solid var(--c-border);
		border-radius: 4px;
		background-color: var(--c-bg-2);
		font-size: 0.9rem;

		> .z-codeblock {
			margin: 0 -0.8rem;
		}
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
		mask-image: linear-gradient(#FFF 50%, transparent);
	}

	.tk-expand {
		border-radius: 0.5rem;
		transition: background-color 0.1s;
	}

    .tk-submit {
        .tk-avatar {
            display: none;
        }
        .tk-main,
        .tk-row.actions {
            margin-left: 0;
        }
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

    .el-textarea__inner {
        border-radius: 12px !important;
        background-color: #e3e3e382;
        min-height: 120px;
        padding: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .tk-meta-input .el-input-group {
        border-radius: 12px;
        overflow: hidden;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .tk-meta-input .el-input-group__prepend {
        background-color: #FFFFFF;
        border: none;
        color: #555;
        padding: 0 1.25rem;
    }

    .tk-meta-input .el-input__inner {
        background-color: #e3e3e382;
        border: none;
    }

    .el-textarea__inner:focus,
    .tk-meta-input .el-input-group:focus-within {
        border-color: #409EFF !important;
        box-shadow: 0 0 0 1px #409EFF;
    }

    .tk-preview,
    .tk-send {
        border-radius: 8px !important;
    }
}
</style>
