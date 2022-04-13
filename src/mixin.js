import Asset from './asset';
import User from './user';
import HTTP from './http';
import Utils from './utils';

class Mixin {
  constructor(keystore) {
    this.asset = new Asset(keystore);
    this.user = new User(keystore);
    this.http = new HTTP(keystore);
    this.utils = Utils;
  }
}

export default Mixin;
