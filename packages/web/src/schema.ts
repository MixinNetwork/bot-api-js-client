import { base64encode } from './utils'

/**
 * @description 分享一段文字 给稍后在客户端内指定的会话
 * @param text 分享的文字
 */
export const shareTextToFriend = (text: string) =>
  window.open(`mixin://send?category=text&data=${getEncodeData(text)}`)


/**
 * @description 分享一张图片 给稍后在客户端内指定的会话
 * @param url 要分享的图片的链接
 */
export const shareImageToFriend = (url: string) =>
  window.open(`mixin://send?category=image&data=${getEncodeData({ url })}`)


/**
 * @description 分享一个联系人 给稍后在客户端内指定的会话
 * @param user_id 要分享的联系人 user_id
 */
export const shareContactToFriend = (user_id: string) =>
  window.open(`mixin://send?category=contact&data=${getEncodeData({ user_id })}`)


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
export const shareAppCardToFriend = (appCard: AppCard) =>
  window.open(`mixin://send?category=app_card&data=${getEncodeData(appCard)}`)


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
export const shareLiveToFriend = (liveCard: LiveCard) =>
  window.open(`mixin://send?category=live&data=${getEncodeData(liveCard)}`)


/**
 * @description 分享一个支持 md 的文章 给稍后在客户端内指定的会话
 * @param post markdown 格式的文章
 */
export const sharePostToFriend = (post: any) =>
  window.open(`mixin://send?category=post&data=${getEncodeData(post)}`)


export interface Payment {
  asset: string
  amount: string | number
  memo?: string
  recipient?: string
  trace?: string
  address?: string
}

export const pay = (payment: Payment) => {
  const { asset, amount, recipient } = payment
  if (!asset || !amount || !recipient) throw new Error('asset, amount, recipient are required')
  window.open(`mixin://pay?${queryStringify(payment)}`)
}


// export const checkPayment = (payment: Payment) =>
// window.open(`mixin://check?${queryStringify(payment)}`)



export interface SnapshotParams {
  trace?: string
  snapshot_id?: string
}

export const openSnapshot = (params: SnapshotParams) => {
  if (!params.trace && !params.snapshot_id) throw new Error('snapshot_id or trace is required')
  window.open(`mixin://snapshots${params.trace ? '?' + queryStringify(params) : '/' + params.snapshot_id}`)
}

export interface Address {
  assest: string
  destination: string
  tag?: string
  address?: string
}

export const addAddress = (address: Address) => {
  if (!address.assest || !address.destination) throw new Error('assest and destination is required')
  window.open(`mixin://address?${queryStringify(address)}`)
}

export const removeAddress = (address: Address) => {
  if (!address.address || !address.assest) throw new Error('address and assest is required')
  window.open(`mixin://address?action=delete&${queryStringify(address)}`)
}

export const withdrawal = (payment: Payment) => {
  const { address, asset, amount } = payment
  if (!address || !asset || !amount) throw new Error('address, asset, amount are required')
  window.open(`mixin://withdraw?${queryStringify(payment)}`)
}

function queryStringify(obj: object) {
  return Object.keys(obj).map(key => `${key}=${obj[key]}`).join('&')
}

function getEncodeData(data: string | object) {
  if (typeof data === 'object') data = JSON.stringify(data)
  return encodeURIComponent(base64encode(data))
}

