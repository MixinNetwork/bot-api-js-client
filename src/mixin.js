import Asset from './asset';
import APP from './app';
import Code from './code';
import Conversation from './conversation';
import OAuth from './oauth';
import Transfer from './transfer';
import User from './user';
import Snapshot from './snapshot';
import HTTP from './http';
import Utils from './utils';

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
