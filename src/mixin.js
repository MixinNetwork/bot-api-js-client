import forge from 'node-forge'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import LittleEndian from 'int64-buffer'

class Mixin {
  generateSessionKeypair() {
    let keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 })
    let body = forge.asn1
      .toDer(forge.pki.publicKeyToAsn1(keypair.publicKey))
      .getBytes()
    let public_key = forge.util.encode64(body, 64)
    let private_key = forge.pki.privateKeyToPem(keypair.privateKey)
    return { public: public_key, private: private_key }
  }

  signAuthenticationToken(uid, sid, privateKey, method, uri, params, scp) {
    if (typeof params === 'object') {
      params = JSON.stringify(params)
    } else if (typeof params !== 'string') {
      params = ''
    }

    let expire = moment.utc().add(30, 'minutes').unix()
    let md = forge.md.sha256.create()
    md.update(forge.util.encodeUtf8(method + uri + params))
    let payload = {
      uid: uid,
      sid: sid,
      iat: moment.utc().unix(),
      exp: expire,
      jti: uuidv4(),
      sig: md.digest().toHex(),
      scp: scp || 'FULL',
    }
    if (process.browser)
      return KJUR.jws.JWS.sign(
        'RS512',
        JSON.stringify({ algorithm: 'RS512' }),
        JSON.stringify(payload),
        privateKey
      )
    return jwt.sign(payload, privateKey, { algorithm: 'RS512' })
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

    let _iterator = new Uint8Array(new Uint64(moment.utc().unix()).buffer)
    _iterator = forge.util.createBuffer(_iterator)
    iterator = iterator || _iterator
    iterator = iterator.getBytes()
    let time = new Uint8Array(new Uint64(moment.utc().unix()).buffer)

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

  hexToBytes(hex) {
    const bytes = []
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16))
    }
    return bytes
  }

  request(uid, sid, sessionKey, method, path, data, callback) {
    const accessToken = this.signAuthenticationToken(
      uid,
      sid,
      sessionKey,
      method,
      path,
      JSON.stringify(data)
    )
    return axios({
      method,
      url: 'https://mixin-api.zeromesh.net' + path,
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
    }).then((res) => {
      if (callback) {
        callback(res.data)
      } else {
        return res.data
      }
    })
  }

  createUser(fullName, uid, sid, mainPrivateKey, callback) {
    const keyPair = this.generateSessionKeypair()

    const publicKey = keyPair.public
    const privateKey = keyPair.private

    if (publicKey.indexOf('-----') !== -1) {
      publicKey = publicKey.split('-----')[2].replace(/\r?\n|\r/g, '')
    }

    let sessionSecret = publicKey
    let sessionKey = privateKey

    const data = {
      session_secret: sessionSecret,
      full_name: fullName,
    }
    return this.request(uid, sid, mainPrivateKey, 'POST', '/users', data).then(
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
    return this.request(uid, sid, sessionKey, 'POST', '/pin/update', data).then(
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

export default Mixin
