import * as asset from './asset'
import * as browser from './browser'
import { mixinRequest, mixinSchema } from './http'
import * as message from './message'
import * as network from './network'
import * as user from './user'
import * as userWithToken from './userWithToken'
export const Mixin = {
  mixinRequest,
  mixinSchema,
  ...browser,
  ...message,
  ...asset,
  ...network,
  ...user,
  ...userWithToken,
}
export default Mixin