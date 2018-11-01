'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _nodeForge = require('node-forge');

var _nodeForge2 = _interopRequireDefault(_nodeForge);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _int64Buffer = require('int64-buffer');

var _int64Buffer2 = _interopRequireDefault(_int64Buffer);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function Mixin() {}

Mixin.prototype = {
  signAuthenticationToken: function signAuthenticationToken(uid, sid, privateKey, method, uri, params) {
    if ((typeof params === 'undefined' ? 'undefined' : _typeof(params)) === "object") {
      params = JSON.stringify(params);
    } else {
      params = "";
    }

    var expire = _moment2.default.utc().add(30, 'minutes').unix();
    var md = _nodeForge2.default.md.sha256.create();
    md.update(method + uri + params);
    var payload = {
      uid: uid,
      sid: sid,
      iat: _moment2.default.utc().unix(),
      exp: expire,
      jti: (0, _v2.default)(),
      sig: md.digest().toHex()
    };
    return _jsonwebtoken2.default.sign(payload, privateKey, { algorithm: 'RS512' });
  },

  signEncryptedPin: function signEncryptedPin(pin, pinToken, sessionId, privateKey, iterator) {
    var blockSize = 16;
    var Uint64LE = _int64Buffer2.default.Int64BE;

    pinToken = new Buffer(pinToken, 'base64');
    privateKey = _nodeForge2.default.pki.privateKeyFromPem(privateKey);
    var pinKey = privateKey.decrypt(pinToken, 'RSA-OAEP', {
      md: _nodeForge2.default.md.sha256.create(),
      label: sessionId
    });
    var time = new Uint64LE(_moment2.default.utc().unix());
    time = [].concat(_toConsumableArray(time.toBuffer())).reverse();
    if (iterator == undefined || iterator === "") {
      iterator = Date.now() * 1000000;
    }
    iterator = new Uint64LE(iterator);
    iterator = [].concat(_toConsumableArray(iterator.toBuffer())).reverse();
    pin = Buffer.from(pin, 'utf8');
    var buf = Buffer.concat([pin, Buffer.from(time), Buffer.from(iterator)]);
    var padding = blockSize - buf.length % blockSize;
    var paddingArray = [];
    for (var i = 0; i < padding; i++) {
      paddingArray.push(padding);
    }
    buf = Buffer.concat([buf, new Buffer(paddingArray)]);

    var iv16 = _crypto2.default.randomBytes(16);
    var cipher = _crypto2.default.createCipheriv('aes-256-cbc', this.hexToBytes(_nodeForge2.default.util.binary.hex.encode(pinKey)), iv16);
    cipher.setAutoPadding(false);
    var encrypted_pin_buff = cipher.update(buf, 'utf-8');
    encrypted_pin_buff = Buffer.concat([iv16, encrypted_pin_buff]);
    return Buffer.from(encrypted_pin_buff).toString('base64');
  },

  hexToBytes: function hexToBytes(hex) {
    var bytes = [];
    for (var c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
  }
};

exports.default = Mixin;