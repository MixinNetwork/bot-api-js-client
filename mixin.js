import Asset from './src/asset.js';
import APP from './src/app.js';
import Code from './src/code.js';
import Conversation from './src/conversation.js';
import OAuth from './src/oauth.js';
import Transfer from './src/transfer.js';
import User from './src/user.js';
import HTTP from './src/http.js';
import Utils from './src/utils.js';

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
