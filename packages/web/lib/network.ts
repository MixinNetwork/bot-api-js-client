import { mixinRequest } from "./http"
import { Asset, NetworkTicker, Snapshot, SnapshotQuery, Transaction } from "../types"

export const readNetworkChains = (): Promise<Asset[]> => mixinRequest("/network/chains")

// only support limit/offset/asset/order
export const readNetworkSnapshots = (params: SnapshotQuery): Promise<Snapshot[]> => mixinRequest("/network/snapshots", params)

export const readNetworkSnapshot = (id: string): Promise<Snapshot> => mixinRequest(`/network/snapshots/${id}`)

export const readExternalTransactions = (params: SnapshotQuery): Promise<Transaction[]> => mixinRequest("/external/transactions", params)

export const readNetworkAssetsTop = (): Promise<Asset[]> => mixinRequest("/network/assets/top")

export const readNetworkAssetsMultisig = (): Promise<Asset[]> => mixinRequest("/network/assets/multisig")

export const readNetworkAsset = (id: string): Promise<Asset> => mixinRequest(`/network/assets/${id}`)

export const searchNetworkAsset = (assetNameOrSymbol: string): Promise<Asset[]> => mixinRequest(`/network/assets/search/${assetNameOrSymbol}`)

export const readExternalAddressesCheck = (params: SnapshotQuery): Promise<SnapshotQuery> => mixinRequest(`/external/addresses/check`, params)

export const readNetworkTicker = (asset_id: string, offset?: string): Promise<NetworkTicker> => mixinRequest(`/network/ticker`, { asset: asset_id, offset })