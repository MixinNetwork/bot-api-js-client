const hostURL = ['https://mixin-api.zeromesh.net', 'https://api.mixin.one']
function stringify(obj: Object) {
  let str = ""
  for (var k in obj)
    str += `${k}=${unescape(obj[k])}&`
  return str.slice(0, -1)
};

export const request = (token?: string): (url: string, params?: Object) => Promise<any> => {
  return async (url: string, parmas: any = {}) => {
    const p = stringify(parmas)
    const res = await fetch(hostURL[0] + url + '?' + p, {
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      })
    })
    const data = await res.json()
    return data.data || data.error
  }
}
export const mixinRequest = request("")