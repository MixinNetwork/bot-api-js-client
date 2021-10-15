import { request } from "./http"
import { Asset, Conversation, Snapshot, User } from "../types"

export const readAssets = async (token: string): Promise<Asset[]> => request(token)("/assets")

export const readAsset = async (token: string, id: string): Promise<Asset> => request(token)(`/assets/${id}`)

export const readFriends = async (token: string): Promise<User[]> => request(token)("/friends")

export const readBlockingUser = async (token: string): Promise<User[]> => request(token)("/blocking_users")

export const readSnapshots = async (token: string): Promise<Snapshot[]> => request(token)("/snapshots")

export const readSnapshot = async (token: string, id: string): Promise<Snapshot> => request(token)(`/snapshots/${id}`)

export const readConversation = async (token: string, id: string): Promise<Conversation> => request(token)(`/conversations/${id}`)
