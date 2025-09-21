import type { FeedEntry } from './app/types/feed'

export { zhCN as dateLocale } from 'date-fns/locale/zh-CN'

const basicConfig = {
	title: '落憾',
	subtitle: '落人间，破三弦，忆李仙',
	// 长 description 利好于 SEO
	description: '建此博客，以示吾思。话天篆地，自由吾心。',
	author: {
		name: '落憾_EnLtLH',
		avatar: 'https://cdn2.enltlh.me/pichub/1/2025/2231d2da22a739df.jpg',
		email: 'enltlh@gmail.com',
		homepage: 'https:/blog.enltlh.me/',
	},
	copyright: {
		abbr: 'CC BY-NC-SA 4.0',
		name: '署名-非商业性使用-相同方式共享 4.0 国际',
		url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans',
	},
	favicon: 'https://cdn2.enltlh.me/pichub/1/2025/19e0fab452a27b75.png',
	language: 'zh-CN',
	timeEstablished: '2024-04-19',
	timezone: 'Asia/Shanghai',
	url: 'https://blog.enltlh.me/',
	defaultCategory: '未分类',
}

// 存储 nuxt.config 和 app.config 共用的配置
// 此处为启动时需要的配置，启动后可变配置位于 app/app.config.ts
// @keep-sorted
const blogConfig = {
	...basicConfig,

	article: {
		categories: {
			[basicConfig.defaultCategory]: { icon: 'ph:folder-dotted-bold' },
			诗词: { icon: 'ph:notepad-bold', color: 'rgba(0, 221, 147, 1)' },
		},
		defaultCategoryIcon: 'ph:folder-bold',
		/** 分类排序方式，键为排序字段，值为显示名称 */
		order: {
			date: '创建日期',
			updated: '更新日期',
			// title: '标题',
		},
	},
	/** 博客 Atom 订阅源 */
	feed: {
		/** 订阅源最大文章数量 */
		limit: 50,
		/** 订阅源是否启用XSLT样式 */
		enableStyle: true,
	},
	/** 隐藏基于文件路由（不是自定义链接）的 URL /post 路径前缀 */
	hidePostPrefix: true,
	/** 禁止搜索引擎收录的路径 */
	robotsNotIndex: ['/preview', '/previews/*'],
	/** 向 <head> 中添加脚本 */
	scripts: [
		// 自己部署的 Umami 统计服务
		{ 'src': 'https://umami.enltlh.me/script.js', 'data-website-id': 'd755863f-e0ed-4f4b-b30c-f76cc31a4f98', 'defer': true },
		// 自己网站的 Cloudflare Insights 统计服务
		{ 'src': 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "6345aad7054b4beb97d8ff650caf169f"}', 'defer': true },
		// Twikoo 评论系统
		{ src: 'https://lib.baomitu.com/twikoo/1.6.44/twikoo.min.js', defer: true },
		// 今日诗词 SDK
		{ src: 'https://sdk.jinrishici.com/v2/browser/jinrishici.js', defer: true },
	],
	/** 自己部署的 Twikoo 服务 */
	twikoo: {
		envId: 'https://twikoo.enltlh.me/',
		preload: 'https://twikoo.enltlh.me/',
	},
	/** 使用 pnpm new 新建文章时自动生成自定义链接（permalink/abbrlink） */
	useRandomPremalink: false,
}

/** 用于生成 OPML 和友链页面配置 */
export const myFeed: FeedEntry = {
	author: blogConfig.author.name,
	sitenick: '友链',
	title: blogConfig.title,
	desc: blogConfig.subtitle || blogConfig.description,
	link: blogConfig.url,
	feed: new URL('/atom.xml', blogConfig.url).toString(),
	icon: blogConfig.favicon,
	avatar: blogConfig.author.avatar,
	archs: ['Nuxt', 'Vercel'],
	date: blogConfig.timeEstablished,
	comment: '这是我自己',
}

export default blogConfig
