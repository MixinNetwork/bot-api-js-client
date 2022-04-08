import User from './user'
import Util from './util'
import HTTP from './http'

const mixin = {
  user: new User(),
  util: new Util(),
  http: new HTTP(),
}

export default mixin;
