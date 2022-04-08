import User from './user'
import HTTP from './http'
import Utils from './utils'

const Mixin = {
  user: new User(),
  http: new HTTP(),
  utils: Utils,
}

export default Mixin;
