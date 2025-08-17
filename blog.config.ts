import type { NitroConfig } from 'nitropack'
import type { FeedEntry } from './app/types/feed'
import redirectList from './redirects.json'

export { zhCN as dateLocale } from 'date-fns/locale/zh-CN'

// 存储 nuxt.config 和 app.config 共用的配置
// 此处为启动时需要的配置，启动后可变配置位于 app/app.config.ts
const blogConfig = {
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

	defaultCategory: ['未分类'],

	feed: {
		limit: 50,
	},

	// 在 URL 中隐藏的路径前缀
	hideContentPrefixes: ['/posts'],

	imageDomains: [
		// 自动启用本域名的 Nuxt Image
		// 'www.zhilu.site',
		// '7.isyangs.cn',
	],

	// 禁止搜索引擎收录的路径
	robotsNotIndex: ['/preview', '/previews/*'],

	scripts: [
		// 自己部署的 Umami 统计服务
		{ 'src': 'https://umami.enltlh.me/script.js', 'data-website-id': 'd755863f-e0ed-4f4b-b30c-f76cc31a4f98', 'defer': true },
		// 自己网站的 Cloudflare Insights 统计服务
		{ 'src': 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "6345aad7054b4beb97d8ff650caf169f"}', 'defer': true },
		// Twikoo 评论系统
		{ src: 'https://gcore.jsdelivr.net/npm/twikoo@1.6.44/dist/twikoo.all.min.js', defer: true },
	],

	// 自己部署的 Twikoo 服务
	twikoo: {
		envId: 'https://twikoo.enltlh.me/.netlify/functions/twikoo',
		preload: 'https://twikoo.enltlh.me/.netlify/functions/twikoo',
	},
}

// 用于生成 OPML 和友链页面配置
export const myFeed = <FeedEntry>{
	author: blogConfig.author.name,
	sitenick: '摸鱼处',
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

// 将旧页面永久重定向到新页面
const redirectRouteRules = Object.entries(redirectList)
	.reduce<NitroConfig['routeRules']>((acc, [from, to]) => {
		acc![from] = { redirect: { to, statusCode: 301 } }
		return acc
	}, {})

// https://nitro.build/config#routerules
// @keep-sorted
export const routeRules = <NitroConfig['routeRules']>{
	...redirectRouteRules,
	'/api/stats': { prerender: true, headers: { 'Content-Type': 'application/json' } },
	'/atom.xml': { prerender: true, headers: { 'Content-Type': 'application/xml' } },
	'/favicon.ico': { redirect: { to: blogConfig.favicon } },
	'/luoh.opml': { prerender: true, headers: { 'Content-Type': 'application/xml' } },
}

export default blogConfig
