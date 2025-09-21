import type { Nav, NavItem } from '~/types/nav'
import blogConfig from '~~/blog.config'
import { version } from '~~/package.json'

// 图标查询：https://yesicon.app/ph
// 图标插件：https://marketplace.visualstudio.com/items?itemName=antfu.iconify

// @keep-sorted
export default defineAppConfig({
	// 将 blog.config 中的配置项复制到 appConfig，方便调用
	...blogConfig,

	component: {
		alert: {
			/** 默认使用卡片风格还是扁平风格 */
			defaultStyle: 'card' as 'card' | 'flat',
		},
		codeblock: {
			/** 代码块触发折叠的行数 */
			triggerRows: 32,
			/** 代码块折叠后的行数 */
			collapsedRows: 16,
		},

		excerpt: {
			animation: true,
			caret: '_',
		},

		stats: {
			/** 归档页面每年标题对应的年龄 */
			birthYear: 2011,
			/** blog-stats widget 的预置文本 */
			wordCount: '约10万',
		},
	},

	// @keep-sorted
	footer: {
		/** 页脚版权信息，支持 <br> 换行等 HTML 标签 */
		copyright: `© ${new Date().getFullYear()} ${blogConfig.author.name}`,
		/** 侧边栏底部图标导航 */
		iconNav: [
			{ icon: 'ph:house-bold', text: '主页', url: blogConfig.author.homepage },
			{ icon: 'ph:github-logo-bold', text: 'GitHub: LuoH-AN', url: 'https://github.com/LuoH-AN' },
			{ icon: 'ph:rss-simple-bold', text: '订阅', url: '/atom.xml' },
			{ icon: 'game-icons:cigale', text: '揪蝉', url: 'https://jiuchan.org/' },
			{ icon: 'ph:subway-bold', text: '开往', url: 'https://www.travellings.cn/go.html' },
		] satisfies NavItem[],
		/** 页脚站点地图 */
		nav: [
			{
				title: '探索',
				items: [
					{ icon: 'ph:rss-simple-bold', text: '订阅', url: '/atom.xml' },
					{ icon: 'game-icons:cigale', text: '揪蝉', url: 'https://jiuchan.org/' },
					{ icon: 'ph:subway-bold', text: '开往', url: 'https://www.travellings.cn/go.html' },
				],
			},
			{
				title: '社交',
				items: [
					{ icon: 'ph:github-logo-bold', text: 'LuoH-AN', url: 'https://github.com/LuoH-AN' },
					{ icon: 'ph:envelope-simple-bold', text: blogConfig.author.email, url: `mailto:${blogConfig.author.email}` },
				],
			},
			{
				title: '信息',
				items: [
					{ icon: 'simple-icons:nuxtdotjs', text: `主题: Clarity ${version}`, url: 'https://github.com/L33Z22L11/blog-v3' },
					{ icon: 'ph:certificate-bold', text: '萌ICP备20250355号', url: 'https://icp.gov.moe/?keyword=20250355' },
					{ icon: 'ph:certificate-bold', text: '雾ICP备20110419号', url: 'https://icp.wudu.ltd/id.php?keyword=20110419' },
				],
			},
		] satisfies Nav,
	},

	/** 左侧栏顶部 Logo */
	header: {
		logo: 'https://cdn2.enltlh.me/pichub/1/2025/2231d2da22a739df.jpg',
		/** 展示标题文本，否则展示纯 Logo */
		showTitle: true,
		subtitle: blogConfig.subtitle,
		emojiTail: ['😝', '😸', '🍃'],
	},

	/** 左侧栏导航 */
	nav: [
		{
			title: '',
			items: [
				{ icon: 'ph:files-bold', text: '文章', url: '/' },
				{ icon: 'ph:link-bold', text: '友链', url: '/link' },
				{ icon: 'ph:archive-bold', text: '归档', url: '/archive' },
				{ icon: 'ph:tag-bold', text: '标签', url: '/tags' },
				{ icon: 'ph:chat-centered-dots-bold', text: '瞬间', url: '/moments' },
				{ icon: 'ph:user-bold', text: '关于', url: '/about' },
			],
		},
	] satisfies Nav,

	pagination: {
		perPage: 10,
		/** 默认排序方式，需要是 this.article.order 中的键名 */
		sortOrder: 'date' as const,
		/** 允许（普通/预览/归档）文章列表正序，开启后排序方式左侧图标可切换顺序 */
		allowAscending: false,
	},

	themes: {
		light: {
			icon: 'ph:sun-bold',
			tip: '浅色模式',
		},
		system: {
			icon: 'ph:monitor-bold',
			tip: '跟随系统',
		},
		dark: {
			icon: 'ph:moon-bold',
			tip: '深色模式',
		},
	},
})
