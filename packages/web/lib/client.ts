import { AxiosInstance } from "axios"
import { request } from "./http"

export class Client {
  request: AxiosInstance
  constructor(token: string) {
    this.request = request(token)
  }

  readAssets() {
    return this.request.get("/assets")
  }

  readAsset(id: string) {
    return this.request.get(`/assets/${id}`)
  }

  readFriends() {
    return this.request.get("/friends")
  }

  readBlockingUser() {
    return this.request.get("/blocking_users")
  }

  readSnapshots() {
    return this.request.get("/snapshots")
  }

  readSnapshot(id: string) {
    return this.request.get(`/snapshots/${id}`)
  }

  readConversation(id: string) {
    return this.request.get(`/conversations/${id}`)
  }
}