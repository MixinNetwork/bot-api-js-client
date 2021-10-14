import * as browserObj from './browser'
import { Client } from './client'
import * as schemaObj from './schema'
import * as networkObj from './network'
export const Mixin = {
  ...browserObj,
  ...schemaObj,
  ...networkObj,
  Client
}
export default Mixin