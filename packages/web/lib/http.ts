import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const hostURL = ['https://mixin-api.zeromesh.net', 'https://api.mixin.one']

export const request = (token?: string): AxiosInstance => {
  const ins = axios.create({
    baseURL: hostURL[0],
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    timeout: 3000,
  })

  ins.interceptors.request.use((config: AxiosRequestConfig) => {
    if (token) config.headers.Authorization = 'Bearer ' + token
    return config
  })

  ins.interceptors.response.use((res: AxiosResponse) => {
    let { data, error } = res.data
    if (error) return error
    return data
  }, async (e: any) => {
    if (['ETIMEDOUT', 'ECONNABORTED'].includes(e.code))
      ins.defaults.baseURL = e.config.baseURL = e.config.baseURL === hostURL[0] ? hostURL[1] : hostURL[0]
    return ins(e.config)
  })
  return ins
}

export const mixinRequest = request()