
import { mixinSchema } from './http'
import { base64encode } from './utils'


const shareMsg = (category: string, data: string | object) =>
  mixinSchema('send', { category, data: getEncodeData(data) })

/**
* @description 分享一段文字 给稍后在客户端内指定的会话
* @param text 分享的文字
*/
export const shareTextToFriend = (text: string) => shareMsg('text', { text })

/**
* @description 分享一张图片 给稍后在客户端内指定的会话
* @param url 要分享的图片的链接
*/
export const shareImageToFriend = (url: string) => shareMsg('image', url)

/**
* @description 分享一个联系人 给稍后在客户端内指定的会话
* @param user_id 要分享的联系人 user_id
*/
export const shareContactToFriend = (user_id: string) => shareMsg('contact', { user_id })

export interface AppCard {
  app_id: string
  title: string
  description: string
  icon_url: string
  action: string
}


/**
* @description 分享一个应用卡片 给稍后在客户端内指定的会话
* @param appCard 分享的应用卡片
*/
export const shareAppCardToFriend = (appCard: AppCard) => shareMsg('app_card', appCard)

export interface LiveCard {
  url: string
  width: number
  height: number
  thumb_url?: string
}

/**
* @description 分享一个直播 给稍后在客户端内指定的会话
* @param liveCard 分享的直播卡片
*/
export const shareLiveToFriend = (liveCard: LiveCard) => shareMsg('live', liveCard)

/**
* @description 分享一个支持 md 的文章 给稍后在客户端内指定的会话
* @param post markdown 格式的文章
*/
export const sharePostToFriend = (post: any) => shareMsg('post', post)

function getEncodeData(data: string | object) {
  if (typeof data === 'object') data = JSON.stringify(data)
  return encodeURIComponent(base64encode(data))
}

