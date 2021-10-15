
export interface Payment {
  trace_id: string
  counter_user_id: string
  asset_id: string
  amount: string
}

export interface Asset {
  asset_id: string
  chain_id: string
  asset_key?: string
  mixin_id?: string
  symbol: string
  name: string
  icon_url: string
  price_btc: string
  change_btc: string
  price_usd: string
  change_usd: string
  balance: string
  destination: string
  tag: string
  confirmations: number
  capitalization?: number
  amount?: string
  fee?: string
  liquidity?: string
  snapshots_count: number
}

export interface NetworkTicker {
  type: 'ticker'
  price_usd: string
  price_btc: string
}

export interface Snapshot {
  type: string
  snapshot_id: string
  trace_id: string
  user_id?: string
  asset_id: string
  created_at: string
  opponent_id?: string
  source: string
  amount: string
  memo: string
  chain_id?: string
  opening_balance?: string
  closing_balance?: string
  sender?: string
  receiver?: string
  transaction_hash?: string

  asset?: Asset
  data?: string
  fee?: {
    amount: string
    asset_id: string
  }
}


export interface SnapshotQuery {
  limit?: number | string
  offset?: string
  asset?: string
  opponent?: string
  tag?: string
  destination?: string // query external transactions
}

export interface Transaction {
  hash?: string
  snapshot?: string
  signatures?: {
    [key: number]: string
  }
  aggregated?: {
    signers: number[]
    signature: string
  }

  version?: number
  asset: string
  inputs?: Input[]
  outputs?: Output[]
  extra: string
}
export interface Input {
  hash?: string
  index?: number
  genesis?: string
  deposit?: DepositData
  mint?: MintData
}

export interface Output {
  type?: number
  amount?: string
  keys?: string[]
  withdrawal?: WithdrawData
  script?: string
  mask?: string
}
export interface DepositData {
  chain: string
  asset: string
  transaction: string
  index: bigint
  amount: number
}
export interface MintData {
  group: string
  batch: bigint
  amount: number
}

export interface WithdrawData {
  chain: string
  asset: string
  address: string
  tag: string
}

export interface PaymentParmas {
  asset: string
  amount: string | number
  memo?: string
  recipient?: string
  trace?: string
  address?: string
}