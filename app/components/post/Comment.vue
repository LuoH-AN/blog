<script setup lang="ts">
const appConfig = useAppConfig()

onMounted(() => {
	// @ts-expect-error windows上有twikoo实例
	window.twikoo?.init?.({
		envId: appConfig.twikoo?.envId,
		el: '#twikoo',
	})
})
</script>

<template>
<section id="comment-section" class="z-comment">
	<h3 class="text-creative">
		评论区
	</h3>
	<div id="twikoo">
		<p>评论加载中...</p>
	</div>
</section>
</template>

<style lang="scss">

.z-comment {
	margin: 3rem 1rem;

	> h3 {
		margin-top: 3rem;
		font-size: 1.25rem;
	}
}

.toolbar {
	color: #ccc;
}

.copy-to-clipboard-button {
	height: 20px;
}

#twikoo {
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

        // 新增的a标签样式，只作用于.tk-content内部的a标签
        a {
            color: #409eff; // 字体颜色设定为天蓝色
            text-decoration: none; // 移除默认的下划线
            display: inline; // 确保链接文本可以正常换行，这是关键
            vertical-align: baseline; // 确保行内元素对齐，避免影响行高

            // 使用 background-image 模拟底部线条，并实现从左到右的动画
            background-image: linear-gradient(to right, rgba(128, 128, 128, 0.3), rgba(128, 128, 128, 0.3));
            background-size: 0% 2px; // 默认不显示，宽度为0，高度2px
            background-repeat: no-repeat;
            background-position: left bottom; // 将背景定位在左下角
            transition: background-size 0.3s ease-out, color 0.3s ease-out; // 过渡动画

            // 鼠标悬停时
            &:hover {
                color: #007bff; // 悬停时改变颜色，增加互动性
                background-size: 100% 2px; // 悬停时背景宽度变为100%，实现从左到右展开
            }
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

    .el-textarea__inner,
    .tk-meta-input .el-input-group {
        border-radius: 12px !important;
        background-color: #e3e3e382;
        transition: border-color 0.2s, box-shadow 0.2s;
        border: 1px solid var(--c-border, #dcdfe6);
    }

    .el-textarea__inner {
        min-height: 120px;
        padding: 1rem;
    }

    .tk-meta-input .el-input-group {
        overflow: hidden;
        background-color: transparent;
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

.dark #twikoo {
    .el-textarea__inner,
    .tk-meta-input .el-input-group {
        background-color: #1e1e1e;
        border-color: #404040;
        color: #e0e0e0;
    }

    .tk-meta-input .el-input-group__prepend {
        background-color: #2c2c2e;
        color: #ccc;
        border-right: 1px solid #404040;
    }

    .tk-meta-input .el-input__inner {
        background-color: #1e1e1e;
        color: #e0e0e0;
    }
}
</style>
