import forge from 'node-forge';
import LittleEndian from 'int64-buffer';
import { sharedKey } from 'curve25519-js';
import HTTP from './http';
import Utils from './utils';

class User {
  constructor(_keystore) {
    const keystore = _keystore || {};
    this.uid = keystore.user_id;
    this.sid = keystore.session_id;
    this.privateKey = keystore.private_key;
    this.pin = keystore.pin;
    this.pinToken = keystore.pin_token;
    this.http = new HTTP(keystore);
    this.utils = Utils;
  }

  me() {
    return this.http.request('GET', '/me').then((res) => res.data);
  }

  fetch(id) {
    return this.http.request('GET', `/users/${id}`).then((res) => res.data);
  }

  fetchUsers(ids) {
    return this.http.request('POST', '/users/fetch', ids).then((res) => res.data);
  }

  updateMe(body) {
    return this.http.request('POST', '/me', body).then((res) => res.data);
  }

  updatePreference(body) {
    return this.http.request('POST', '/me/preferences', body).then((res) => res.data);
  }

  rotateCode() {
    return this.http.request('GET', '/me/code').then((res) => res.data);
  }

  createBareUser(fullName) {
    const { publicKey, privateKey } = this.utils.generateED25519Keypair();
    const data = {
      session_secret: publicKey,
      full_name: fullName,
    };

    return this.http.request('POST', '/users', data).then(
      (res) => {
        const user = res.data;
        const userData = {
          user,
          privateKey,
        };
        return userData;
      },
    );
  }

  setupPin() {
    const encryptedPIN = this.encryptPin();

    return this.updatePin(
      '',
      encryptedPIN,
    );
  }

  updatePin(oldEncryptedPin, encryptedPin) {
    const data = {
      old_pin: oldEncryptedPin,
      pin: encryptedPin,
    };
    return this.http.request('POST', '/pin/update', data).then((res) => res.data);
  }

  verifyPin() {
    const encryptedPin = this.signEd25519PIN();
    const data = {
      pin: encryptedPin,
    };
    return this.http.request('POST', '/pin/verify', data).then((res) => res.data);
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

  sharedEd25519Key(_pinToken, _privateKey) {
    const pinToken = Buffer.from(_pinToken, 'base64');
    let privateKey = Buffer.from(_privateKey, 'base64');
    privateKey = this.privateKeyToCurve25519(privateKey);

    return sharedKey(privateKey, pinToken);
  }

  hexToBytes(hex) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
  }

  signEd25519PIN(_iterator) {
    const blockSize = 16;
    let Uint64;

    try {
      if (LittleEndian) Uint64 = LittleEndian.Int64LE;
      if (Uint64BE) Uint64 = Uint64LE;
    } catch (error) {}

    const sharedkey = this.sharedEd25519Key(this.pinToken, this.privateKey);

    let iteratorTmp = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer);
    iteratorTmp = forge.util.createBuffer(iteratorTmp);
    let iterator = _iterator || iteratorTmp;
    iterator = iterator.getBytes();
    let time = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer);
    time = forge.util.createBuffer(time);
    time = time.getBytes();

    const pinByte = forge.util.createBuffer(this.pin, 'utf8');

    const buffer = forge.util.createBuffer();
    buffer.putBytes(pinByte);
    buffer.putBytes(time);
    buffer.putBytes(iterator);
    const paddingLen = blockSize - (buffer.length() % blockSize);
    const padding = forge.util.hexToBytes(paddingLen.toString(16));

    for (let i = 0; i < paddingLen; i += 1) {
      buffer.putBytes(padding);
    }
    const iv = forge.random.getBytesSync(16);
    const key = this.hexToBytes(forge.util.binary.hex.encode(sharedkey));
    const cipher = forge.cipher.createCipher('AES-CBC', key);

    cipher.start({
      iv,
    });
    cipher.update(buffer);
    cipher.finish(() => true);

    const pinBuff = forge.util.createBuffer();
    pinBuff.putBytes(iv);
    pinBuff.putBytes(cipher.output.getBytes());

    const encryptedBytes = pinBuff.getBytes();
    return forge.util.encode64(encryptedBytes);
  }
}

export default User;
