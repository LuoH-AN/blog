import type { FeedGroup } from '~/types/feed'
import { getGhAvatar } from './utils/img'

export default [{
	name: '网上邻居',
	desc: '',
	entries: [{
		author: '梦爱吃鱼',
		sitenick: '',
		title: '梦爱吃鱼',
		desc: '不负心灵，不负今生。',
		link: 'https://blog.bsgun.cn/',
		feed: 'https://blog.bsgun.cn/atom.xml',
		icon: 'https://unavatar.webp.se/blog.bsgun.cn?w',
		avatar: 'https://oss-cdn.bsgun.cn/logo/avatar.256.png',
		archs: [],
		date: '2025-08-17',
		comment: '',
	}, {
		author: '纸鹿本鹿',
		sitenick: '',
		title: '纸鹿摸鱼处',
		desc: '纸鹿至麓不知路，支炉制露不止漉',
		link: 'https://blog.zhilu.site/',
		feed: 'https://blog.zhilu.site/atom.xml',
		icon: 'https://unavatar.webp.se/blog.zhilu.site?w',
		avatar: 'https://www.zhilu.site/api/avatar.png',
		archs: [],
		date: '2025-08-17',
		comment: '',
	}]
}] satisfies FeedGroup[]