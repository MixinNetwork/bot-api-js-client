import { Payment, PaymentParmas } from '../types'
import { mixinRequest, mixinSchema } from './http'
import { queryStringify } from './utils'

export interface SnapshotParams {
  trace?: string
  snapshot_id?: string
}

export const pay = (payment: PaymentParmas) => {
  const { asset, amount, recipient } = payment
  if (!asset || !amount || !recipient) throw new Error('asset, amount, recipient are required')
  mixinSchema('pay', payment)
}

export const checkIsPaid = async (p: Payment) =>
  mixinRequest("/payments", {}, "post", p)

export const openSnapshot = (params: SnapshotParams) => {
  if (!params.trace && !params.snapshot_id) throw new Error('snapshot_id or trace is required')
  window.open(`mixin://snapshots${params.trace ? '?' + queryStringify(params) : '/' + params.snapshot_id}`)
  if (params.trace) mixinSchema(`snapshots`, params)
  else if (params.snapshot_id) mixinSchema(`snapshots/${params.snapshot_id}`)
}

export const openTransfer = (user_id: string) =>
  mixinSchema(`transfer/${user_id}`)

export interface Address {
  assest: string
  destination: string
  tag?: string
  address?: string
}

export const addAddress = (address: Address) => {
  if (!address.assest || !address.destination) throw new Error('assest and destination is required')
  mixinSchema('address', address)
}

export const removeAddress = (address: Address) => {
  if (!address.address || !address.assest) throw new Error('address and assest is required')
  mixinSchema('address', { ...address, action: 'delete' })
}

export const withdrawal = (payment: PaymentParmas) => {
  const { address, asset, amount } = payment
  if (!address || !asset || !amount) throw new Error('address, asset, amount are required')
  mixinSchema('withdraw', payment)
}

