import forge from 'node-forge';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import uuid from 'uuid/v4';
import LittleEndian from "int64-buffer";
import crypto from 'crypto';

function Mixin() {
}

Mixin.prototype = {
  generateSessionKeypair: function () {
    let keypair = forge.pki.rsa.generateKeyPair({bits: 2048, e: 0x10001});
    let body = forge.asn1.toDer(forge.pki.publicKeyToAsn1(keypair.publicKey)).getBytes();
    let public_key = forge.util.encode64(body, 64);
    let private_key = forge.pki.privateKeyToPem(keypair.privateKey);
    return {public: public_key, private: private_key}
  },

  signAuthenticationToken: function (uid, sid, privateKey, method, uri, params, scp) {
    if (typeof (params) === "object") {
      params = JSON.stringify(params);
    } else if (typeof (params) !== "string") {
      params = ""
    }

    let expire = moment.utc().add(30, 'minutes').unix();
    let md = forge.md.sha256.create();
    md.update(forge.util.encodeUtf8(method + uri + params));
    let payload = {
      uid: uid,
      sid: sid,
      iat: moment.utc().unix(),
      exp: expire,
      jti: uuid(),
      sig: md.digest().toHex(),
      scp: scp
    };
    return jwt.sign(payload, privateKey, {algorithm: 'RS512'});
  },

  signEncryptedPin: function (pin, pinToken, sessionId, privateKey, iterator) {
    const blockSize = 16;
    let Uint64LE = LittleEndian.Int64BE;

    pinToken = new Buffer(pinToken, 'base64');
    privateKey = forge.pki.privateKeyFromPem(privateKey);
    let pinKey = privateKey.decrypt(pinToken, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      label: sessionId
    });
    let time = new Uint64LE(moment.utc().unix());
    time = [...time.toBuffer()].reverse();
    if (iterator == undefined || iterator === "") {
      iterator = Date.now() * 1000000;
    }
    iterator = new Uint64LE(iterator);
    iterator = [...iterator.toBuffer()].reverse();
    pin = Buffer.from(pin, 'utf8');
    let buf = Buffer.concat([pin, Buffer.from(time), Buffer.from(iterator)]);
    let padding = blockSize - buf.length % blockSize;
    let paddingArray = [];
    for (let i = 0; i < padding; i++) {
      paddingArray.push(padding);
    }
    buf = Buffer.concat([buf, new Buffer(paddingArray)]);

    let iv16 = forge.random.getBytesSync(16);
    let key = this.hexToBytes(forge.util.binary.hex.encode(pinKey));
    let cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv16});
    cipher.update(buf)
    cipher.finish();
    let encrypted_pin_buff = cipher.output;
    encrypted_pin_buff = Buffer.concat([iv16, encrypted_pin_buff]);
    return Buffer.from(encrypted_pin_buff).toString('base64');
  },

  hexToBytes: function (hex) {
    var bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
  },

  environment: function () {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.MixinContext) {
      return 'iOS'
    }
    if (window.MixinContext && window.MixinContext.getContext) {
      return 'Android'
    }
    return undefined
  },

  getMixinContext: function () {
    let ctx;
    switch (this.environment()) {
      case 'iOS':
        ctx = prompt('MixinContext.getContext()')
        return JSON.parse(ctx)
      case 'Android':
        ctx = window.MixinContext.getContext()
        return JSON.parse(ctx)
      default:
        return undefined
    }
  },

  conversationId: function () {
    const ctx = this.getMixinContext()
    if (ctx) {
      return ctx.conversation_id
    }
  },

  reloadTheme: function () {
    switch (this.environment()) {
      case 'iOS':
        window.webkit.messageHandlers.reloadTheme.postMessage('');
        return
      case 'Android':
        window.MixinContext.reloadTheme()
        return
    }
  }
};

export default Mixin;
