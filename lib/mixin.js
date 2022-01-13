'use strict';

var forge = require('node-forge');
var LittleEndian = require('int64-buffer');
var uuid = require('uuid');
var axios = require('axios');
var jsSHA = require('jssha');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var forge__default = /*#__PURE__*/_interopDefaultLegacy(forge);
var LittleEndian__default = /*#__PURE__*/_interopDefaultLegacy(LittleEndian);
var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var jsSHA__default = /*#__PURE__*/_interopDefaultLegacy(jsSHA);

class Util {
  environment() {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.MixinContext) {
      return 'iOS';
    }
    if (window.MixinContext && window.MixinContext.getContext) {
      return 'Android';
    }
    return undefined;
  }

  conversationId() {
    let ctx;
    switch (this.environment()) {
      case 'iOS':
        ctx = prompt('MixinContext.getContext()');
        return JSON.parse(ctx).conversation_id;
      case 'Android':
        ctx = window.MixinContext.getContext();
        return JSON.parse(ctx).conversation_id;
      default:
        return ctx;
    }
  }

  challenge() {
    let key = forge__default["default"].random.getBytesSync(32);
    let verifier = this.base64RawURLEncode(key);

    let md = forge__default["default"].md.sha256.create();
    md.update(key);
    let challenge = this.base64RawURLEncode(md.digest().getBytes());
    window.localStorage.setItem('verifier', verifier);
    return challenge;
  }

  base64RawURLEncode(buffer) {
    return forge__default["default"].util.encode64(buffer).replace(/\=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  hashMembers(ids) {
    let key = ids.sort().join('');
    let shaObj = new jsSHA__default["default"]('SHA3-256', 'TEXT', { encoding: 'UTF8' });
    shaObj.update(key);
    return shaObj.getHash('HEX')
  }
}

class Client {
  constructor() {
    this.util = new Util();
  }

  signAuthenticationToken(uid, sid, privateKey, method, uri, params, scp) {
    method = method.toLocaleUpperCase();
    if (typeof params === 'object') {
      params = JSON.stringify(params);
    } else if (typeof params !== 'string') {
      params = '';
    }

    let iat = Math.floor(Date.now() / 1000);
    let exp = iat + 3600;
    let md = forge__default["default"].md.sha256.create();
    md.update(method + uri + params, 'utf8');
    let payload = {
      uid: uid,
      sid: sid,
      iat: iat,
      exp: exp,
      jti: uuid.v4(),
      sig: md.digest().toHex(),
      scp: scp || 'FULL',
    };

    let header = Buffer.from(JSON.stringify({ alg: "EdDSA", typ: "JWT" }), 'utf8').toString('base64');

    let result = [header, payload];
    let sign = this.util.base64RawURLEncode(forge__default["default"].pki.ed25519.sign({
      message: result.join('.'),
      encoding: 'utf8',
      privateKey
    }));
    result.push(sign);
    return result.join('.')
  }

  request(uid, sid, privateKey, method, path, data) {
    const accessToken = this.signAuthenticationToken(
      uid,
      sid,
      privateKey,
      method,
      path,
      JSON.stringify(data)
    );
    return requestByToken(method. path, data, accessToken)
  }

  requestByToken(method, path, data, accessToken) {
    return axios__default["default"]({
      method,
      url: 'https://mixin-api.zeromesh.net' + path,
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
    })
  }
}

class User {
  constructor() {
    this.client = new Client();
  }

  generateSessionKeypair() {
    let keypair = forge__default["default"].pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
    let body = forge__default["default"].asn1
      .toDer(forge__default["default"].pki.publicKeyToAsn1(keypair.publicKey))
      .getBytes();
    let public_key = forge__default["default"].util.encode64(body, 64);
    let private_key = forge__default["default"].pki.privateKeyToPem(keypair.privateKey);
    return { public: public_key, private: private_key }
  }

  encryptPin(pin, pinToken, sessionId, privateKey, iterator) {
    const blockSize = 16;
    let Uint64;

    try {
      if (LittleEndian__default["default"]) Uint64 = LittleEndian__default["default"].Int64LE;
      if (Uint64BE) Uint64 = Uint64LE;
    } catch (error) {}

    privateKey = forge__default["default"].pki.privateKeyFromPem(privateKey);
    let pinKey = privateKey.decrypt(forge__default["default"].util.decode64(pinToken), 'RSA-OAEP', {
      md: forge__default["default"].md.sha256.create(),
      label: sessionId,
    });

    let _iterator = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer);
    _iterator = forge__default["default"].util.createBuffer(_iterator);
    iterator = iterator || _iterator;
    iterator = iterator.getBytes();
    let time = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer);

    time = forge__default["default"].util.createBuffer(time);
    time = time.getBytes();

    let pinByte = forge__default["default"].util.createBuffer(pin, 'utf8');

    let buffer = forge__default["default"].util.createBuffer();
    buffer.putBytes(pinByte);
    buffer.putBytes(time);
    buffer.putBytes(iterator);
    let paddingLen = blockSize - (pinByte.length() % blockSize);
    let padding = forge__default["default"].util.hexToBytes(paddingLen.toString(16));

    while (paddingLen > 0) {
      paddingLen--;
      buffer.putBytes(padding);
    }

    let iv = forge__default["default"].random.getBytesSync(16);
    let key = this.hexToBytes(forge__default["default"].util.binary.hex.encode(pinKey));
    let cipher = forge__default["default"].cipher.createCipher('AES-CBC', key);

    cipher.start({
      iv: iv,
    });
    cipher.update(buffer);

    cipher.finish(() => true);

    let pin_buff = forge__default["default"].util.createBuffer();
    pin_buff.putBytes(iv);
    pin_buff.putBytes(cipher.output.getBytes());

    const encryptedBytes = pin_buff.getBytes();
    return forge__default["default"].util.encode64(encryptedBytes)
  }

  hexToBytes(hex) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes
  }


  createUser(fullName, uid, sid, mainPrivateKey, callback) {
    const keyPair = this.generateSessionKeypair();

    const publicKey = keyPair.public;
    const privateKey = keyPair.private;

    if (publicKey.indexOf('-----') !== -1) {
      publicKey = publicKey.split('-----')[2].replace(/\r?\n|\r/g, '');
    }

    let sessionSecret = publicKey;
    let sessionKey = privateKey;

    const data = {
      session_secret: sessionSecret,
      full_name: fullName,
    };
    return this.client.request(uid, sid, mainPrivateKey, 'POST', '/users', data).then(
      (res) => {
        const user = res.data;
        const userData = {
          user,
          sessionKey,
        };
        if (callback) {
          callback(userData);
        } else {
          return userData
        }
      }
    )
  }

  updatePin(oldEncryptedPin, encryptedPin, uid, sid, sessionKey, callback) {
    const data = {
      old_pin: oldEncryptedPin,
      pin: encryptedPin,
    };
    return this.client.request(uid, sid, sessionKey, 'POST', '/pin/update', data).then(
      (res) => {
        if (callback) {
          callback(res.data);
        } else {
          return res.data
        }
      }
    )
  }

  setupPin(pin, user, sessionKey, callback) {
    const encryptedPIN = this.encryptPin(
      pin,
      user.pin_token,
      user.session_id,
      sessionKey
    );

    return this.updatePin(
      '',
      encryptedPIN,
      user.user_id,
      user.session_id,
      sessionKey,
      callback
    )
  }

  environment() {
    const ctx = this.getMixinContext();
    return ctx.platform
  }

  getMixinContext() {
    let ctx = {};
    if (
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.MixinContext
    ) {
      ctx = JSON.parse(prompt('MixinContext.getContext()'));
      ctx.platform = ctx.platform || 'iOS';
    } else if (
      window.MixinContext &&
      typeof window.MixinContext.getContext === 'function'
    ) {
      ctx = JSON.parse(window.MixinContext.getContext());
      ctx.platform = ctx.platform || 'Android';
    }
    return ctx
  }

  conversationId() {
    const ctx = this.getMixinContext();
    return ctx.conversation_id
  }

  reloadTheme() {
    switch (this.environment()) {
      case 'iOS':
        window.webkit &&
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers.reloadTheme &&
          window.webkit.messageHandlers.reloadTheme.postMessage('');
        return
      case 'Android':
      case 'Desktop':
        window.MixinContext &&
          typeof window.MixinContext.reloadTheme === 'function' &&
          window.MixinContext.reloadTheme();
        return
    }
  }
}

var mixin = {
  user: new User(),
  util: new Util(),
  client: new Client(),
};

module.exports = mixin;
