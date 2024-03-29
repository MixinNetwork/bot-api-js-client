import forge from 'node-forge';
import LittleEndian from 'int64-buffer';
import HTTP from './http';
import Utils from './utils';

class User {
  constructor(keystore) {
    this.keystore = keystore || {};
    this.http = new HTTP(this.keystore);
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

  signEd25519PIN(_iterator) {
    const blockSize = 16;
    let Uint64;

    try {
      if (LittleEndian) Uint64 = LittleEndian.Int64LE;
    } catch (error) {
      console.log(error);
    }

    const sharedkey = this.utils.sharedEd25519Key(this.keystore.pin_token, this.keystore.private_key);

    let iteratorTmp = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer);
    iteratorTmp = forge.util.createBuffer(iteratorTmp);
    let iterator = _iterator || iteratorTmp;
    iterator = iterator.getBytes();
    let time = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer);
    time = forge.util.createBuffer(time);
    time = time.getBytes();

    const pinByte = forge.util.createBuffer(this.keystore.pin, 'utf8');

    const buffer = forge.util.createBuffer();
    buffer.putBytes(pinByte);
    buffer.putBytes(time);
    buffer.putBytes(iterator);
    const paddingLen = blockSize - (buffer.length() % blockSize);
    const padding = forge.util.binary.hex.decode(paddingLen.toString(16));

    for (let i = 0; i < paddingLen; i += 1) {
      buffer.putBytes(padding);
    }
    const iv = forge.random.getBytesSync(16);
    const key = this.utils.hexToBytes(forge.util.binary.hex.encode(sharedkey));
    const cipher = forge.cipher.createCipher('AES-CBC', key);

    cipher.start({
      iv,
    });
    cipher.update(buffer);
    cipher.finish(() => true);

    const pinBuff = forge.util.createBuffer();
    pinBuff.putBytes(iv);
    pinBuff.putBytes(cipher.output.getBytes());

    const encryptedBytes = Buffer.from(pinBuff.getBytes(), 'binary');
    return forge.util.binary.base64.encode(encryptedBytes);
  }
}

export default User;
