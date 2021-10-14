import { request } from "./http"
import { Asset, Conversation, NetworkTicker, Snapshot, SnapshotQuery, Transaction, User } from "../types"
export class Client {
  request: (string) => Promise<any>
  constructor(token: string) {
    this.request = request(token)
  }

  readAssets(): Promise<Asset[]> {
    return this.request("/assets")
  }

  readAsset(id: string): Promise<Asset> {
    return this.request(`/assets/${id}`)
  }

  readFriends(): Promise<User[]> {
    return this.request("/friends")
  }

  readBlockingUser(): Promise<User[]> {
    return this.request("/blocking_users")
  }

  readSnapshots(): Promise<Snapshot[]> {
    return this.request("/snapshots")
  }

  readSnapshot(id: string): Promise<Snapshot> {
    return this.request(`/snapshots/${id}`)
  }

  readConversation(id: string): Promise<Conversation> {
    return this.request(`/conversations/${id}`)
  }
}