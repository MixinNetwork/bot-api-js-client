import forge from 'node-forge'
import LittleEndian from 'int64-buffer'
import { sharedKey } from 'curve25519-js';
import HTTP from './http'
import Utils from './utils'

class User {
  constructor(keystore) {
    keystore = keystore || {};
    this.uid = keystore.user_id;
    this.sid = keystore.session_id;
    this.privateKey = keystore.private_key;
    this.pin = keystore.pin;
    this.pinToken = keystore.pin_token;
    this.http = new HTTP(keystore);
    this.utils = Utils;
  }

  createUser(fullName, callback) {
    const {publicKey, privateKey} = this.utils.generateED25519Keypair();
    const data = {
      session_secret: publicKey,
      full_name: fullName,
    };

    return this.http.request('POST', '/users', data).then(
      (res) => {
        const user = res.data
        const userData = {
          user,
          privateKey,
        }
        if (callback) {
          callback(userData)
        } else {
          return userData
        }
      }
    );
  }

  setupPin(callback) {
    const encryptedPIN = this.encryptPin();

    return this.updatePin(
      '',
      encryptedPIN,
      callback,
    )
  }

  updatePin(oldEncryptedPin, encryptedPin, callback) {
    const data = {
      old_pin: oldEncryptedPin,
      pin: encryptedPin,
    }
    return this.http.request('POST', '/pin/update', data).then(
      (res) => {
        if (callback) {
          callback(res.data)
        } else {
          return res.data
        }
      }
    )
  }

  verifyPin(callback) {
    const encryptedPin = this.signEd25519PIN();
    const data = {
      pin: encryptedPin,
    };
    return this.http.request('POST', '/pin/verify', data).then(
      (res) => {
        if (callback) {
          callback(res.data)
        } else {
          return res.data
        }
      }
    )
  }

  privateKeyToCurve25519(privateKey) {
    const seed = privateKey.subarray(0, 32);
    const md = forge.md.sha512.create();
    md.update(seed.toString('binary'));
    const digestx = md.digest();
    const digest = Buffer.from(digestx.getBytes(), 'binary');

    digest[0] &= 248;
    digest[31] &= 127;
    digest[31] |= 64;
    return digest.subarray(0, 32);
  }

  sharedEd25519Key(pinToken, privateKey) {
    pinToken = Buffer.from(pinToken, 'base64');
    privateKey = Buffer.from(privateKey, 'base64');
    privateKey = this.privateKeyToCurve25519(privateKey);

    return sharedKey(privateKey, pinToken);
  }

  hexToBytes(hex) {
    const bytes = []
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16))
    }
    return bytes
  }

  signEd25519PIN(iterator) {
    const blockSize = 16;
    let Uint64;

    try {
      if (LittleEndian) Uint64 = LittleEndian.Int64LE;
      if (Uint64BE) Uint64 = Uint64LE;
    } catch (error) {}

    const sharedKey = this.sharedEd25519Key(this.pinToken, this.privateKey);

    let _iterator = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer);
    _iterator = forge.util.createBuffer(_iterator);
    iterator = iterator || _iterator;
    iterator = iterator.getBytes();
    let time = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer);
    time = forge.util.createBuffer(time);
    time = time.getBytes();

    let pinByte = forge.util.createBuffer(this.pin, 'utf8');

    let buffer = forge.util.createBuffer();
    buffer.putBytes(pinByte);
    buffer.putBytes(time);
    buffer.putBytes(iterator);
    let paddingLen = blockSize - (buffer.length() % blockSize);
    let padding = forge.util.hexToBytes(paddingLen.toString(16));

    for (let i=0; i < paddingLen; i++) {
      buffer.putBytes(padding);
    }
    let iv = forge.random.getBytesSync(16);
    let key = this.hexToBytes(forge.util.binary.hex.encode(sharedKey));
    let cipher = forge.cipher.createCipher('AES-CBC', key);

    cipher.start({
      iv: iv,
    });
    cipher.update(buffer);
    cipher.finish(() => true);

    let pin_buff = forge.util.createBuffer();
    pin_buff.putBytes(iv);
    pin_buff.putBytes(cipher.output.getBytes());

    const encryptedBytes = pin_buff.getBytes();
    return forge.util.encode64(encryptedBytes);
  }
}

export default User;
