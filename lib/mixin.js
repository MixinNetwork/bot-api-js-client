var Mixin = (function (forge, LittleEndian, uuid, axios, jsSHA) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var forge__default = /*#__PURE__*/_interopDefaultLegacy(forge);
  var LittleEndian__default = /*#__PURE__*/_interopDefaultLegacy(LittleEndian);
  var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
  var jsSHA__default = /*#__PURE__*/_interopDefaultLegacy(jsSHA);

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _readOnlyError(name) {
    throw new TypeError("\"" + name + "\" is read-only");
  }

  var Util = /*#__PURE__*/function () {
    function Util() {
      _classCallCheck(this, Util);
    }

    _createClass(Util, [{
      key: "environment",
      value: function environment() {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.MixinContext) {
          return 'iOS';
        }

        if (window.MixinContext && window.MixinContext.getContext) {
          return 'Android';
        }

        return undefined;
      }
    }, {
      key: "conversationId",
      value: function conversationId() {
        var ctx;

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
    }, {
      key: "challenge",
      value: function challenge() {
        var key = forge__default["default"].random.getBytesSync(32);
        var verifier = this.base64RawURLEncode(key);
        var md = forge__default["default"].md.sha256.create();
        md.update(key);
        var challenge = this.base64RawURLEncode(md.digest().getBytes());
        window.localStorage.setItem('verifier', verifier);
        return challenge;
      }
    }, {
      key: "base64RawURLEncode",
      value: function base64RawURLEncode(buffer) {
        return buffer.toString('base64').replace(/\=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      }
    }, {
      key: "hashMembers",
      value: function hashMembers(ids) {
        var key = ids.sort().join('');
        var shaObj = new jsSHA__default["default"]('SHA3-256', 'TEXT', {
          encoding: 'UTF8'
        });
        shaObj.update(key);
        return shaObj.getHash('HEX');
      }
    }]);

    return Util;
  }();

  var Buffer = require('buffer/').Buffer;

  var Client = /*#__PURE__*/function () {
    function Client() {
      _classCallCheck(this, Client);

      this.util = new Util();
    }

    _createClass(Client, [{
      key: "signAuthenticationToken",
      value: function signAuthenticationToken(uid, sid, privateKey, method, uri, params, scp) {
        privateKey = Buffer.from(privateKey, 'base64');
        method = method.toLocaleUpperCase();

        if (_typeof(params) === 'object') {
          params = JSON.stringify(params);
        } else if (typeof params !== 'string') {
          params = '';
        }

        var iat = Math.floor(Date.now() / 1000);
        var exp = iat + 3600;
        var md = forge__default["default"].md.sha256.create();
        md.update(method + uri + params, 'utf8');
        var payload = {
          uid: uid,
          sid: sid,
          iat: iat,
          exp: exp,
          jti: uuid.v4(),
          sig: md.digest().toHex(),
          scp: scp || 'FULL'
        };
        var header = this.util.base64RawURLEncode(Buffer.from(JSON.stringify({
          alg: "EdDSA",
          typ: "JWT"
        }), 'utf8'));
        payload = this.util.base64RawURLEncode(Buffer.from(JSON.stringify(payload), 'utf8'));
        var result = [header, payload];
        var sign = this.util.base64RawURLEncode(forge__default["default"].pki.ed25519.sign({
          message: result.join('.'),
          encoding: 'utf8',
          privateKey: privateKey
        }));
        result.push(sign);
        return result.join('.');
      }
    }, {
      key: "request",
      value: function request(uid, sid, privateKey, method, path, data) {
        var accessToken = this.signAuthenticationToken(uid, sid, privateKey, method, path, JSON.stringify(data));
        return requestByToken(method.path, data, accessToken);
      }
    }, {
      key: "requestByToken",
      value: function requestByToken(method, path, data, accessToken) {
        return axios__default["default"]({
          method: method,
          url: 'https://mixin-api.zeromesh.net' + path,
          data: data,
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken
          }
        });
      }
    }]);

    return Client;
  }();

  var User = /*#__PURE__*/function () {
    function User() {
      _classCallCheck(this, User);

      this.client = new Client();
    }

    _createClass(User, [{
      key: "generateSessionKeypair",
      value: function generateSessionKeypair() {
        var keypair = forge__default["default"].pki.rsa.generateKeyPair({
          bits: 2048,
          e: 0x10001
        });
        var body = forge__default["default"].asn1.toDer(forge__default["default"].pki.publicKeyToAsn1(keypair.publicKey)).getBytes();
        var public_key = forge__default["default"].util.encode64(body, 64);
        var private_key = forge__default["default"].pki.privateKeyToPem(keypair.privateKey);
        return {
          "public": public_key,
          "private": private_key
        };
      }
    }, {
      key: "encryptPin",
      value: function encryptPin(pin, pinToken, sessionId, privateKey, iterator) {
        var blockSize = 16;
        var Uint64;

        try {
          if (LittleEndian__default["default"]) Uint64 = LittleEndian__default["default"].Int64LE;
          if (Uint64BE) Uint64 = Uint64LE;
        } catch (error) {}

        privateKey = forge__default["default"].pki.privateKeyFromPem(privateKey);
        var pinKey = privateKey.decrypt(forge__default["default"].util.decode64(pinToken), 'RSA-OAEP', {
          md: forge__default["default"].md.sha256.create(),
          label: sessionId
        });

        var _iterator = new Uint8Array(new Uint64(Math.floor(new Date().getTime() / 1000)).buffer);

        _iterator = forge__default["default"].util.createBuffer(_iterator);
        iterator = iterator || _iterator;
        iterator = iterator.getBytes();
        var time = new Uint8Array(new Uint64(Math.floor(new Date().getTime() / 1000)).buffer);
        time = forge__default["default"].util.createBuffer(time);
        time = time.getBytes();
        var pinByte = forge__default["default"].util.createBuffer(pin, 'utf8');
        var buffer = forge__default["default"].util.createBuffer();
        buffer.putBytes(pinByte);
        buffer.putBytes(time);
        buffer.putBytes(iterator);
        var paddingLen = blockSize - pinByte.length() % blockSize;
        var padding = forge__default["default"].util.hexToBytes(paddingLen.toString(16));

        while (paddingLen > 0) {
          paddingLen--;
          buffer.putBytes(padding);
        }

        var iv = forge__default["default"].random.getBytesSync(16);
        var key = this.hexToBytes(forge__default["default"].util.binary.hex.encode(pinKey));
        var cipher = forge__default["default"].cipher.createCipher('AES-CBC', key);
        cipher.start({
          iv: iv
        });
        cipher.update(buffer);
        cipher.finish(function () {
          return true;
        });
        var pin_buff = forge__default["default"].util.createBuffer();
        pin_buff.putBytes(iv);
        pin_buff.putBytes(cipher.output.getBytes());
        var encryptedBytes = pin_buff.getBytes();
        return forge__default["default"].util.encode64(encryptedBytes);
      }
    }, {
      key: "hexToBytes",
      value: function hexToBytes(hex) {
        var bytes = [];

        for (var c = 0; c < hex.length; c += 2) {
          bytes.push(parseInt(hex.substr(c, 2), 16));
        }

        return bytes;
      }
    }, {
      key: "createUser",
      value: function createUser(fullName, uid, sid, mainPrivateKey, callback) {
        var keyPair = this.generateSessionKeypair();
        var publicKey = keyPair["public"];
        var privateKey = keyPair["private"];

        if (publicKey.indexOf('-----') !== -1) {
          publicKey.split('-----')[2].replace(/\r?\n|\r/g, ''), _readOnlyError("publicKey");
        }

        var sessionSecret = publicKey;
        var sessionKey = privateKey;
        var data = {
          session_secret: sessionSecret,
          full_name: fullName
        };
        return this.client.request(uid, sid, mainPrivateKey, 'POST', '/users', data).then(function (res) {
          var user = res.data;
          var userData = {
            user: user,
            sessionKey: sessionKey
          };

          if (callback) {
            callback(userData);
          } else {
            return userData;
          }
        });
      }
    }, {
      key: "updatePin",
      value: function updatePin(oldEncryptedPin, encryptedPin, uid, sid, sessionKey, callback) {
        var data = {
          old_pin: oldEncryptedPin,
          pin: encryptedPin
        };
        return this.client.request(uid, sid, sessionKey, 'POST', '/pin/update', data).then(function (res) {
          if (callback) {
            callback(res.data);
          } else {
            return res.data;
          }
        });
      }
    }, {
      key: "setupPin",
      value: function setupPin(pin, user, sessionKey, callback) {
        var encryptedPIN = this.encryptPin(pin, user.pin_token, user.session_id, sessionKey);
        return this.updatePin('', encryptedPIN, user.user_id, user.session_id, sessionKey, callback);
      }
    }, {
      key: "environment",
      value: function environment() {
        var ctx = this.getMixinContext();
        return ctx.platform;
      }
    }, {
      key: "getMixinContext",
      value: function getMixinContext() {
        var ctx = {};

        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.MixinContext) {
          ctx = JSON.parse(prompt('MixinContext.getContext()'));
          ctx.platform = ctx.platform || 'iOS';
        } else if (window.MixinContext && typeof window.MixinContext.getContext === 'function') {
          ctx = JSON.parse(window.MixinContext.getContext());
          ctx.platform = ctx.platform || 'Android';
        }

        return ctx;
      }
    }, {
      key: "conversationId",
      value: function conversationId() {
        var ctx = this.getMixinContext();
        return ctx.conversation_id;
      }
    }, {
      key: "reloadTheme",
      value: function reloadTheme() {
        switch (this.environment()) {
          case 'iOS':
            window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.reloadTheme && window.webkit.messageHandlers.reloadTheme.postMessage('');
            return;

          case 'Android':
          case 'Desktop':
            window.MixinContext && typeof window.MixinContext.reloadTheme === 'function' && window.MixinContext.reloadTheme();
            return;
        }
      }
    }]);

    return User;
  }();

  var mixin = {
    user: new User(),
    util: new Util(),
    client: new Client()
  };

  return mixin;

})(forge, LittleEndian, uuid, axios, jsSHA);
