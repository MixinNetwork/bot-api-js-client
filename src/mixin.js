import forge from 'node-forge'
import moment from 'moment'
import jwt from 'jsonwebtoken'
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
      scp: scp,
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

  signEncryptedPin(pin, pinToken, sessionId, privateKey, iterator) {
    const blockSize = 16
    let Uint64

    try {
      if (LittleEndian) Uint64 = LittleEndian.Int64BE
      if (Uint64BE) Uint64 = Uint64BE
    } catch (error) {}

    privateKey = forge.pki.privateKeyFromPem(privateKey)
    let pinKey = privateKey.decrypt(forge.util.decode64(pinToken), 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      label: sessionId,
    })

    let _iterator = new Uint8Array(
      new Uint64(moment.utc().unix() * 1000000000).buffer
    )
    _iterator = forge.util.createBuffer(_iterator)
    iterator = iterator || _iterator.getBytes()
    let time = new Uint8Array(
      new Uint64(moment.utc().unix() * 1000000000).buffer
    )
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
    let cipher = forge.cipher.createCipher('AES-CBC', pinKey)
    cipher.start({
      iv: iv,
    })
    cipher.update(buffer)
    cipher.finish()

    return forge.util.encode64(cipher.output.getBytes())
  }

  hexToBytes(hex) {
    var bytes = []
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16))
    }
    return bytes
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
