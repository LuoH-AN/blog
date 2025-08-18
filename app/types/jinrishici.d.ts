// 今日诗词 SDK 类型声明
declare global {
	interface Window {
		jinrishici: {
			load: (
				callback: (result: {
					status: string
					data: {
						id: string
						content: string
						popularity: number
						origin: {
							title: string
							dynasty: string
							author: string
							content: string[]
							translate: string[]
						}
						matchTags: string[]
						recommendTags: string[]
						cacheAt: string
					}
				}) => void,
				errorCallback?: (error: any) => void
			) => void
		}
	}
}

export {}