import Asset from './mixin/asset';
import APP from './mixin/app';
import Code from './mixin/code';
import Conversation from './mixin/conversation';
import OAuth from './mixin/oauth';
import Transfer from './mixin/transfer';
import User from './mixin/user';
import Snapshot from './mixin/snapshot';
import HTTP from './mixin/http';
import Utils from './mixin/utils';

class Mixin {
  constructor(keystore) {
    this.asset = new Asset(keystore);
    this.app = new APP(keystore);
    this.code = new Code(keystore);
    this.conversation = new Conversation(keystore);
    this.oauth = new OAuth(keystore);
    this.transfer = new Transfer(keystore);
    this.user = new User(keystore);
    this.http = new HTTP(keystore);
    this.snapshot = new Snapshot(keystore);
    this.utils = Utils;
  }
}

export default Mixin;
