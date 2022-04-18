import Asset from './asset.js';
import APP from './app.js';
import Code from './code.js';
import Conversation from './conversation.js';
import OAuth from './oauth.js';
import Transfer from './transfer.js';
import User from './user.js';
import HTTP from './http.js';
import Utils from './utils.js';

class Mixin {
  constructor(keystore) {
    this.asset = new Asset(keystore);
    this.app = new APP(keystore);
    this.code = new Code(keystore);
    this.conversation = new Conversation(keystore);
    this.OAuth = new OAuth(keystore);
    this.transfer = new Transfer(keystore);
    this.user = new User(keystore);
    this.http = new HTTP(keystore);
    this.utils = Utils;
  }
}

export default Mixin;
