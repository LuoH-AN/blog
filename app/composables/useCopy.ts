/**
 * 点击触发元素时，将文本复制到剪贴板，并在触发元素上显示提示信息。
 * @param target - 提供复制文本、目标元素或组件实例。可为字符串、输入框（复制其 `value`）或其他 HTMLElement（复制其文本内容）。
 */
export default function (
	target: MaybeRefOrGetter<{ $el: Element } | HTMLInputElement | Element | null> | string,
) {
	const getText = () => {
		const el = (toValue(target) as any)?.$el ?? toValue(target)

		if (typeof target === 'string') return target
		if (el instanceof HTMLInputElement) return el.value
		return el?.textContent || ''
	}

	return useClipboard({ source: getText, legacy: true })
}

/**
 * 生成文章内容的图片并下载
 * @param title - 文章标题，用于下载文件名
 */
export function useImageShare(title: string = '文章分享') {
	// 工具函数：创建消息元素
	const createMessage = (text: string, bgColor: string, duration = 0) => {
		const msg = document.createElement('div')
		msg.textContent = text
		msg.style.cssText = `
			position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
			background: ${bgColor}; color: white; padding: 10px 20px;
			border-radius: 5px; z-index: 9999;
		`
		document.body.appendChild(msg)
		if (duration) setTimeout(() => msg.remove(), duration)
		return msg
	}

	// 转换图片为base64
	const convertImageToBase64 = async (url: string): Promise<string> => {
		if (url.startsWith('data:')) return url

		const img = new Image()
		img.crossOrigin = 'anonymous'

		return new Promise((resolve, reject) => {
			img.onload = () => {
				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')!
				canvas.width = img.naturalWidth
				canvas.height = img.naturalHeight
				ctx.drawImage(img, 0, 0)
				resolve(canvas.toDataURL('image/png', 0.9))
			}
			img.onerror = () => reject(new Error('图片加载失败'))
			img.src = url
		})
	}

	// 提取文章数据
	const extractPostData = async () => {
		try {
			const getText = (selector: string) => {
				const el = document.querySelector(selector)
				return el?.textContent?.trim() || ''
			}

			const title = getText('h1.post-title') || '无题'
			const summary = getText('.md-excerpt')

			// 处理头图
			const headerImg = document.querySelector('.post-cover') as HTMLImageElement
			let headerImage = ''
			if (headerImg?.src) {
				const url = headerImg.src.startsWith('http') || headerImg.src.startsWith('data:')
					? headerImg.src
					: new URL(headerImg.src, window.location.origin).href
				headerImage = await convertImageToBase64(url)
			}

			// 提取正文内容
			const contentEl = document.querySelector('.article')
			let content = ''
			if (contentEl) {
				const texts = Array.from(contentEl.querySelectorAll('p, li, blockquote'))
					.slice(0, 4)
					.map(p => p.textContent?.trim())
					.filter(Boolean)
					.join('\n')
				content = texts.length > 200 ? texts.substring(0, 200) + '...' : texts
			}

			// 组合内容
			const finalContent = summary
				? (content && content !== summary ? `${summary}\n\n${content}` : summary)
				: content

			return { title, headerImage, content: finalContent, hasSummary: !!summary }
		} catch {
			return { title: '无题', headerImage: '', content: '暂无内容', hasSummary: false }
		}
	}

	// 处理文本换行
	const processText = (text: string): string[] => {
		if (!text) return ['暂无内容']
		const lines: string[] = []
		text.split(/[\n\r]/)
			.filter(p => p.trim())
			.forEach(p => {
				if (p.length > 26) {
					for (let i = 0; i < p.length; i += 26) {
						lines.push(p.substring(i, i + 26))
					}
				} else {
					lines.push(p)
				}
			})
		return lines.slice(0, 10)
	}

	// 创建SVG
	const createSVG = (data: { title: string; headerImage: string; content: string; hasSummary?: boolean }) => {
		const { title, headerImage, content, hasSummary } = data
		const contentLines = processText(content)

		// 分离摘要和正文
		let summaryLines: string[] = []
		let bodyLines = contentLines

		if (hasSummary && content.includes('\n\n')) {
			const parts = content.split('\n\n')
			if (parts.length >= 2) {
				summaryLines = processText(parts[0])
				bodyLines = processText(parts.slice(1).join('\n\n'))
			}
		}

		// 计算布局
		const headerHeight = 280
		const lineHeight = 28
		const bottomPadding = 60
		const minTotalHeight = 500

		// 新的布局参数 - 调整间距
		const summaryTopMargin = 20 // 摘要距离图片的间距（减小）
		const summaryBodySpacing = 25 // 摘要与正文的间距（增大）

		// 计算内容区域总高度
		const contentTotalLines = summaryLines.length + bodyLines.length
		const contentHeight = contentTotalLines * lineHeight + (summaryLines.length > 0 ? summaryTopMargin + summaryBodySpacing : 0)

		// 确保最小总高度
		const totalHeight = Math.max(minTotalHeight, headerHeight + contentHeight + bottomPadding)

		// 垂直居中：计算起始Y位置
		const availableContentHeight = totalHeight - headerHeight - bottomPadding
		const centeredStartY = headerHeight + Math.max(summaryTopMargin, (availableContentHeight - contentHeight) / 2)

		// SVG模板
		const headerBg = headerImage
			? `<image href="${headerImage}" x="0" y="0" width="375" height="${headerHeight}" preserveAspectRatio="xMidYMid meet"/>`
			: `<rect x="0" y="0" width="375" height="${headerHeight}" fill="linear-gradient(45deg, #667eea 0%, #764ba2 100%)"/>`

		// 计算文本居中位置的函数
		const getCenteredX = (text: string, fontSize: number, fontWeight: number = 400): number => {
			// 更精确的字符宽度估算
			let totalWidth = 0
			for (let i = 0; i < text.length; i++) {
				const char = text.charAt(i)
				if (char >= '\u4e00' && char <= '\u9fff') {
					// 中文字符
					totalWidth += fontSize * 0.95
				} else if (char >= '\uff00' && char <= '\uffef') {
					// 全角标点符号
					totalWidth += fontSize * 0.8
				} else if (char === ' ') {
					// 空格
					totalWidth += fontSize * 0.3
				} else {
					// 英文字母和数字
					totalWidth += fontSize * 0.5
				}
			}
			return Math.max(30, (375 - totalWidth) / 2) // 最小左边距30，确保不会太靠边
		}

		const titleText = `<text x="30" y="230" fill="white" font-size="24" font-family="KaiTi, SimKai, serif" font-weight="700" filter="url(#textShadow)">${title}</text>`

		// 生成内容文本
		let contentText = ''
		if (summaryLines.length > 0) {
			// 摘要左对齐 - 距离图片更近
			const summaryStartY = centeredStartY + summaryTopMargin
			summaryLines.forEach((line, i) => {
				contentText += `<text x="30" y="${summaryStartY + i * lineHeight}" font-family="KaiTi, SimKai, serif" font-size="16" fill="#555" font-weight="500" font-style="italic">${line}</text>`
			})
			// 正文内容居中 - 与摘要有更大的间距
			const bodyStartY = summaryStartY + summaryLines.length * lineHeight + summaryBodySpacing
			bodyLines.forEach((line, i) => {
				const lineX = getCenteredX(line, 16, 400)
				contentText += `<text x="${lineX}" y="${bodyStartY + i * lineHeight}" font-family="KaiTi, SimKai, serif" font-size="16" fill="#333" font-weight="400">${line}</text>`
			})
		} else {
			// 没有摘要时，正文内容居中
			bodyLines.forEach((line, i) => {
				const lineX = getCenteredX(line, 16, 400)
				contentText += `<text x="${lineX}" y="${centeredStartY + i * lineHeight}" font-family="KaiTi, SimKai, serif" font-size="16" fill="#333" font-weight="400">${line}</text>`
			})
		}

		return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="375" height="${totalHeight}" viewBox="0 0 375 ${totalHeight}">
  <defs>
    <linearGradient id="headerGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="black" stop-opacity="0"/>
    </linearGradient>
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
    </filter>
  </defs>
  ${headerBg}
  <rect x="0" y="${headerHeight}" width="375" height="${totalHeight - headerHeight}" fill="white"/>
  ${titleText}
  ${contentText}
</svg>`
	}

	// SVG转PNG
	const svgToPng = async (svg: string): Promise<string> => {
		// 验证SVG基本结构
		if (!svg.includes('<svg') || !svg.includes('</svg>')) {
			throw new Error('Invalid SVG structure')
		}

		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')!

		const heightMatch = svg.match(/height="(\d+)"/)
		const svgHeight = heightMatch ? parseInt(heightMatch[1]) : 812

		// 确保合理的尺寸
		if (svgHeight < 100 || svgHeight > 2000) {
			throw new Error(`Invalid SVG height: ${svgHeight}`)
		}

		canvas.width = 750
		canvas.height = svgHeight * 2

		return new Promise((resolve, reject) => {
			const img = new Image()
			img.onload = () => {
				ctx.fillStyle = 'white'
				ctx.fillRect(0, 0, canvas.width, canvas.height)
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
				resolve(canvas.toDataURL('image/png', 0.9))
			}
			img.onerror = () => reject(new Error('SVG图片加载失败'))

			const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
			const url = URL.createObjectURL(blob)
			img.src = url
			setTimeout(() => URL.revokeObjectURL(url), 100)
		})
	}

	// 下载PNG
	const downloadPng = (dataUrl: string, filename: string) => {
		const link = Object.assign(document.createElement('a'), {
			href: dataUrl,
			download: `${filename}.png`
		})
		link.click()
	}

	// 主函数：生成图片
	return async (closeMenu?: () => void) => {
		try {
			if (closeMenu) closeMenu()

			const loadingMsg = createMessage('正在生成图片...', 'rgba(0, 0, 0, 0.7)')
			const postData = await extractPostData()

			if (!postData.title && !postData.content) {
				loadingMsg.remove()
				createMessage('生成图片失败，请重试', 'rgba(255, 0, 0, 0.7)', 3000)
				return
			}

			const svg = createSVG(postData)
			const pngDataUrl = await svgToPng(svg)

			loadingMsg.remove()
			downloadPng(pngDataUrl, title)
			createMessage('保存成功', 'rgba(0, 128, 0, 0.7)', 2000)
		} catch (error) {
			console.error('生成PNG图片失败:', error)
			createMessage('生成图片失败，请重试', 'rgba(255, 0, 0, 0.7)', 3000)
		}
	}
}

