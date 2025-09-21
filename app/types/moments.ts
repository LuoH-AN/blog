export interface MomentLink {
	url: string
	text: string
	icon?: string
}

export interface MomentItem {
	content: string
	date: string
	tags?: string[]
	image?: string[]
	link?: MomentLink
	address?: string
}

export interface MomentUser {
	name: string
	avatar: string
	avatarLink?: string
	moment_list: MomentItem[]
}

export type MomentData = MomentUser[]
