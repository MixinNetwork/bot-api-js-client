
export interface MixinContext {
  currency: string
  immersive: boolean
  appearance: 'light' | 'dark'
  platform: '' | 'Android' | 'iOS' | 'Desktop'
  conversation_id: string
  app_version: string
  locale: string
}

/**
 * @description 获取当前页面的环境是否为 Mixin 的环境
 * 如果不是，则返回 undefined
 * 如果是，则返回相应的 Context 信息
 * @returns {MixinContext | undefined}
 */
export const getContext = (): MixinContext | undefined => {
  let ctx: MixinContext | undefined
  if (
    window.webkit &&
    window.webkit.messageHandlers &&
    window.webkit.messageHandlers.MixinContext
  ) {
    ctx = JSON.parse(prompt('MixinContext.getContext()'))
    ctx.platform = ctx.platform || 'iOS'
  } else if (
    window.MixinContext &&
    typeof window.MixinContext.getContext === 'function'
  ) {
    ctx = JSON.parse(window.MixinContext.getContext())
    ctx.platform = ctx.platform || 'Android'
  }
  return ctx
}

/**
 * @description 获取当前页面的环境是否为 mixin 环境
 * 如果不是的话，则返回 ''
 * 如果是的话，会返回相应的环境变量
 * @returns {string} '' or 'iOS' or 'Android' or 'Desktop'
 */
export const enviroment = (): string => getContext()?.platform || ''

/**
 * @description 检查当前页面是否开启了沉浸式模式，
 * 即使后台开启了沉浸式模式，在非 mixin 环境内也不会生效。
 * 如果期望在非 mixin 环境下自定义一些样式，可以使用此方法
 * @returns {boolean}
 */
export const isImmersive = (): boolean => getContext()?.immersive || false

/**
 * @description 获取当前客户端的版本号
 * @returns 版本号 如：0.31.1
 */
export const getVersion = (): string => getContext()?.app_version || ''

let reg = /Mixin\/([0-9]+)\.([0-9]+)\.([0-9]+)/

/**
 * @description 获取当前客户端 Mixin 的版本号
 * @returns 版本号 如： 0.31.1
 */
export const getMixinVersion = (): string => {
  const [_, a, b, c] = navigator.userAgent.match(reg) || []
  if (!a && !b && !c) return ''
  return [a, b, c].join('.')
}

/**
 * @description 获取当前会话的conversation_id
 * @returns conversation_id
 */
export const getConversationID = (): string => getContext()?.conversation_id || ''

/**
 * @description 获取当前主题颜色
 * @returns 当前主题色值 如 #ffffff
 */
export const getTheme = (): string => {
  const metas = document.getElementsByTagName('meta')
  for (let i = 0; i < metas.length; i++)
    if (metas[i].name === 'theme-color') {
      return metas[i].content || ''
    }
}

/**
 * @description 改变当前页面的主题色
 * @param theme 要改变的颜色 如 #9d00ff
 */
export const changeTheme = (theme: string) => {
  const head = document.getElementsByTagName('head')[0]
  const metas = document.getElementsByTagName('meta')
  for (let i = 0; i < metas.length; i++)
    if (metas[i].name === 'theme-color') {
      head.removeChild(metas[i])
      break
    }
  const meta = document.createElement('meta')
  meta.name = 'theme-color'
  meta.content = theme
  head.appendChild(meta)
  const e = enviroment()
  if (e === 'iOS') window.webkit.messageHandlers.reloadTheme && window.webkit.messageHandlers.reloadTheme.postMessage('')
  else if (e === 'Android') window.MixinContext.reloadTheme && window.MixinContext.reloadTheme()
}



/**
 * @description 检查用户Mixin版本是否高于指定版本
 * @param targetVersion 指定 version
 * @returns {boolean}
 */
export const checkMixinVersionBiggerThanTarget = (targetVersion: string): boolean => {
  const [a, b, c] = getMixinVersion().split('.').map(Number)
  const [ta, tb, tc] = targetVersion.split('.').map(Number)
  if (a > ta) return true
  if (a === ta) {
    if (b > tb) return true
    if (b === tb && c >= tc) return true
  }
  return false
}


/**
 * @description 唤起原生的播放列表，支持后台播放
 * @param audios mp3 字符串数组
 */
export const audiosPlayList = (audios: string[]) => {
  switch (enviroment()) {
    case 'iOS':
      return window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.playlist && window.webkit.messageHandlers.playlist.postMessage(audios)
    case 'Android':
    case 'Desktop':
      return window.MixinContext && (typeof window.MixinContext.playlist === 'function') && window.MixinContext.playlist(audios)
  }
}