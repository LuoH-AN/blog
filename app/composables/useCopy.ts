import html2canvas from 'html2canvas'

/**
 * 点击触发元素时，将文本复制到剪贴板，并在触发元素上显示提示信息。
 * @param target - 提供复制文本、目标元素或组件实例。可为字符串、输入框（复制其 `value`）或其他 HTMLElement（复制其文本内容）。
 */
export default function (
	target: MaybeRefOrGetter<{ $el: Element } | HTMLInputElement | Element | null> | string,
) {
	const getEl = (element: any) => element?.$el ?? element
	const getText = () => {
		const el = getEl(toValue(target))

		if (typeof target === 'string')
			return target
		if (el instanceof HTMLInputElement)
			return el.value
		return el?.textContent as string || ''
	}

	return useClipboard({ source: getText, legacy: true })
}

/**
 * 生成文章内容的图片并下载
 * @param title - 文章标题，用于下载文件名
 */
export function useImageShare(title: string = '文章分享') {
	/**
	 * 创建消息提示元素
	 * @param text - 提示文本
	 * @param bgColor - 背景颜色
	 * @returns 创建的消息元素
	 */
	const createMessageElement = (text: string, bgColor: string) => {
		const message = document.createElement('div')
		message.textContent = text
		message.style.position = 'fixed'
		message.style.top = '50%'
		message.style.left = '50%'
		message.style.transform = 'translate(-50%, -50%)'
		message.style.backgroundColor = bgColor
		message.style.color = 'white'
		message.style.padding = '10px 20px'
		message.style.borderRadius = '5px'
		message.style.zIndex = '9999'
		return message
	}

	/**
	 * 显示加载提示
	 * @returns 创建的加载提示元素
	 */
	const showLoadingMessage = () => {
		const loadingMessage = createMessageElement('正在生成图片...', 'rgba(0, 0, 0, 0.7)')
		document.body.appendChild(loadingMessage)
		return loadingMessage
	}

	/**
	 * 显示错误提示
	 */
	const showErrorMessage = () => {
		const errorMessage = createMessageElement('生成图片失败，请重试', 'rgba(255, 0, 0, 0.7)')
		document.body.appendChild(errorMessage)

		// 3秒后移除错误提示
		setTimeout(() => {
			if (document.body.contains(errorMessage)) {
				document.body.removeChild(errorMessage)
			}
		}, 3000)
	}

	/**
	 * 创建临时容器
	 */
	const createTempContainer = () => {
		const tempContainer = document.createElement('div')
		tempContainer.style.position = 'absolute'
		tempContainer.style.left = '-9999px'
		tempContainer.style.top = '-9999px'
		tempContainer.style.width = '800px'
		tempContainer.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--c-bg-2') || '#ffffff'
		tempContainer.style.padding = '20px'
		tempContainer.style.borderRadius = '8px'
		tempContainer.style.fontFamily = getComputedStyle(document.body).fontFamily

		// 克隆文章头部
		const postHeader = document.querySelector('.post-header')
		if (postHeader) {
			const headerClone = postHeader.cloneNode(true) as HTMLElement
			// 移除分享菜单，避免在图片中显示
			const shareMenu = headerClone.querySelector('.share-menu')
			if (shareMenu) {
				shareMenu.remove()
			}
			tempContainer.appendChild(headerClone)
		}

		// 克隆文章摘要（如果存在）
		const postExcerpt = document.querySelector('.md-excerpt')
		if (postExcerpt) {
			const excerptClone = postExcerpt.cloneNode(true) as HTMLElement
			tempContainer.appendChild(excerptClone)
		}

		// 克隆文章正文
		const articleContent = document.querySelector('.article')
		if (articleContent) {
			const articleClone = articleContent.cloneNode(true) as HTMLElement
			tempContainer.appendChild(articleClone)
		}

		return tempContainer
	}

	/**
	 * 移除所有图标
	 */
	const removeIcons = (container: HTMLElement) => {
		const iconElements = container.querySelectorAll('.iconify, [data-icon], .icon')
		iconElements.forEach((icon) => {
			if (icon instanceof HTMLElement) {
				icon.remove()
			}
		})
	}

	/**
	 * 生成canvas
	 */
	const generateCanvas = async (container: HTMLElement) => {
		return await html2canvas(container, {
			scale: 2, // 提高图片质量
			useCORS: true, // 允许跨域图片
			allowTaint: true,
			backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--c-bg-2') || '#ffffff',
			width: 800,
			height: container.scrollHeight,
		})
	}

	/**
	 * 下载图片
	 */
	const downloadImage = (canvas: HTMLCanvasElement, filename: string) => {
		canvas.toBlob((blob) => {
			if (!blob)
				return

			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `${filename}.png`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)
		})
	}

	/**
	 * 生成并下载文章图片
	 * @param closeMenu - 关闭菜单的回调函数
	 */
	const generateImage = async (closeMenu?: () => void) => {
		try {
			// 关闭菜单
			if (closeMenu)
				closeMenu()

			// 显示加载提示
			const loadingMessage = showLoadingMessage()

			// 创建临时容器，只包含文章头部和正文内容
			const tempContainer = createTempContainer()

			// 将临时容器添加到页面
			document.body.appendChild(tempContainer)

			// 去除所有图标，避免在图片中显示问题
			removeIcons(tempContainer)

			// 生成图片
			const canvas = await generateCanvas(tempContainer)

			// 移除临时容器和加载提示
			document.body.removeChild(tempContainer)
			document.body.removeChild(loadingMessage)

			// 下载图片
			downloadImage(canvas, title)
		}
		catch (error) {
			console.error('生成图片失败:', error)
			showErrorMessage()
		}
	}

	return generateImage
}
