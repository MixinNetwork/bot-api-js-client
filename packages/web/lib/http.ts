import { queryStringify } from './utils'

const hostURL = ['https://mixin-api.zeromesh.net', 'https://api.mixin.one']
export const request = (token?: string): (url: string, params?: Object, method?: string, data?: Object) => Promise<any> => {
  return async (url: string, parmas: any = {}, method = 'get', data: any = {}) => {
    const p = queryStringify(parmas)
    const resp = await fetch(hostURL[0] + url + '?' + p, {
      method,
      body: JSON.stringify(data),
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      })
    })
    const res = await resp.json()
    return res.data || res.error
  }
}
export const mixinRequest = request("")

export const mixinSchema = (url: string, params: Object | string = "") => {
  if (typeof params === 'object') params = queryStringify(params)
  window.open(`mixin://${url}?${params}`)
}