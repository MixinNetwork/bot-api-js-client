import forge from 'node-forge'
import LittleEndian from 'int64-buffer'
import { sharedKey } from 'curve25519-js';
import Client from './client'
import Util from './util'

class User {
  constructor() {
    this.client = new Client();
    this.util = new Util();
  }

  generateSessionKeypair() {
    let keypair = forge.pki.ed25519.generateKeyPair()
    let public_key = this.util.base64RawURLEncode(keypair.publicKey);
    let private_key = this.util.base64RawURLEncode(keypair.privateKey);
    return { public: public_key, private: private_key }
  }

  encryptPin(pin, pinToken, sessionId, privateKey, iterator) {
    const blockSize = 16
    let Uint64

    try {
      if (LittleEndian) Uint64 = LittleEndian.Int64LE
      if (Uint64BE) Uint64 = Uint64LE
    } catch (error) {}

    privateKey = forge.pki.privateKeyFromPem(privateKey)
    let pinKey = privateKey.decrypt(forge.util.decode64(pinToken), 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      label: sessionId,
    })

    let _iterator = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer)
    _iterator = forge.util.createBuffer(_iterator)
    iterator = iterator || _iterator
    iterator = iterator.getBytes()
    let time = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer)

    time = forge.util.createBuffer(time)
    time = time.getBytes()

    let pinByte = forge.util.createBuffer(pin, 'utf8')

    let buffer = forge.util.createBuffer()
    buffer.putBytes(pinByte)
    buffer.putBytes(time)
    buffer.putBytes(iterator)
    let paddingLen = blockSize - (pinByte.length() % blockSize)
    let padding = forge.util.hexToBytes(paddingLen.toString(16))

    while (paddingLen > 0) {
      paddingLen--
      buffer.putBytes(padding)
    }

    let iv = forge.random.getBytesSync(16)
    let key = this.hexToBytes(forge.util.binary.hex.encode(pinKey))
    let cipher = forge.cipher.createCipher('AES-CBC', key)

    cipher.start({
      iv: iv,
    })
    cipher.update(buffer)

    cipher.finish(() => true)

    let pin_buff = forge.util.createBuffer()
    pin_buff.putBytes(iv)
    pin_buff.putBytes(cipher.output.getBytes())

    const encryptedBytes = pin_buff.getBytes()
    return forge.util.encode64(encryptedBytes)
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
    pinToken = Buffer.from(pinToken, 'base64')
    privateKey = Buffer.from(privateKey, 'base64')
    privateKey = this.privateKeyToCurve25519(privateKey)

    return sharedKey(privateKey, pinToken);
  }

  signEd25519PIN(pin, pinToken, sessionId, privateKey, iterator) {
    const blockSize = 16
    let Uint64

    try {
      if (LittleEndian) Uint64 = LittleEndian.Int64LE
      if (Uint64BE) Uint64 = Uint64LE
    } catch (error) {}

    const sharedKey = this.sharedEd25519Key(pinToken, privateKey)

    let _iterator = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer)
    _iterator = forge.util.createBuffer(_iterator)
    iterator = iterator || _iterator
    iterator = iterator.getBytes()
    let time = new Uint8Array(new Uint64(Math.floor((new Date()).getTime() / 1000)).buffer)
    time = forge.util.createBuffer(time)
    time = time.getBytes()

    let pinByte = forge.util.createBuffer(pin, 'utf8')

    let buffer = forge.util.createBuffer()
    buffer.putBytes(pinByte)
    buffer.putBytes(time)
    buffer.putBytes(iterator)
    let paddingLen = blockSize - (buffer.length() % blockSize)
    let padding = forge.util.hexToBytes(paddingLen.toString(16))

    for (let i=0; i < paddingLen; i++) {
      buffer.putBytes(padding)
    }
    let iv = forge.random.getBytesSync(16)
    let key = this.hexToBytes(forge.util.binary.hex.encode(sharedKey))
    let cipher = forge.cipher.createCipher('AES-CBC', key)

    cipher.start({
      iv: iv,
    })
    cipher.update(buffer)
    cipher.finish(() => true)

    let pin_buff = forge.util.createBuffer()
    pin_buff.putBytes(iv)
    pin_buff.putBytes(cipher.output.getBytes())

    const encryptedBytes = pin_buff.getBytes()
    return forge.util.encode64(encryptedBytes)
  }

  hexToBytes(hex) {
    const bytes = []
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16))
    }
    return bytes
  }


  createUser(fullName, uid, sid, mainPrivateKey, callback) {
    const keyPair = this.generateSessionKeypair()
    const sessionSecret = keyPair.public
    const sessionKey = keyPair.private
    const data = {
      session_secret: sessionSecret,
      full_name: fullName,
    }

    const client = new Client()
    return client.request(uid, sid, mainPrivateKey, 'POST', '/users', data).then(
      (res) => {
        const user = res.data
        const userData = {
          user,
          sessionKey,
        }
        if (callback) {
          callback(userData)
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
    }
    return this.client.request(uid, sid, sessionKey, 'POST', '/pin/update', data).then(
      (res) => {
        if (callback) {
          callback(res.data)
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
    )

    return this.updatePin(
      '',
      encryptedPIN,
      user.user_id,
      user.session_id,
      sessionKey,
      callback
    )
  }

  verifyPin(pin, pinToken, uid, sid, sessionKey, callback) {
    const encryptedPin = this.signEd25519PIN(pin, pinToken, sid, sessionKey);
    const data = {
      pin: encryptedPin,
    }
    return this.client.request(uid, sid, sessionKey, 'POST', '/pin/verify', data).then(
      (res) => {
        if (callback) {
          callback(res.data)
        } else {
          return res.data
        }
      }
    )
  }

  environment() {
    const ctx = this.getMixinContext()
    return ctx.platform
  }

  getMixinContext() {
    let ctx = {}
    if (
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.MixinContext
    ) {
      ctx = JSON.parse(prompt('MixinContext.getContext()'))
      ctx.platform = ctx.platform || 'iOS'
    } else if (
      window.MixinContext &&
      typeof window.MixinContext.getContext === 'function'
    ) {
      ctx = JSON.parse(window.MixinContext.getContext())
      ctx.platform = ctx.platform || 'Android'
    }
    return ctx
  }

  conversationId() {
    const ctx = this.getMixinContext()
    return ctx.conversation_id
  }

  reloadTheme() {
    switch (this.environment()) {
      case 'iOS':
        window.webkit &&
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers.reloadTheme &&
          window.webkit.messageHandlers.reloadTheme.postMessage('')
        return
      case 'Android':
      case 'Desktop':
        window.MixinContext &&
          typeof window.MixinContext.reloadTheme === 'function' &&
          window.MixinContext.reloadTheme()
        return
    }
  }
}

export default User;
