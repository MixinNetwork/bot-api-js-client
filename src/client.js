import forge from 'node-forge'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

class Client {
  constructor() {
  }

  signAuthenticationToken(uid, sid, privateKey, method, uri, params, scp) {
    method = method.toLocaleUpperCase()
    if (typeof params === 'object') {
      params = JSON.stringify(params)
    } else if (typeof params !== 'string') {
      params = ''
    }

    let iat = Math.floor(Date.now() / 1000)
    let exp = iat + 3600
    let md = forge.md.sha256.create()
    md.update(method + uri + params, 'utf8')
    let payload = {
      uid: uid,
      sid: sid,
      iat: iat,
      exp: exp,
      jti: uuidv4(),
      sig: md.digest().toHex(),
      scp: scp || 'FULL',
    }

    let header = Buffer.from(JSON.stringify({ alg: "EdDSA", typ: "JWT" }), 'utf8').toString('base64')

    let result = [header, payload]
    let sign = this.util.base64RawURLEncode(forge.pki.ed25519.sign({
      message: result.join('.'),
      encoding: 'utf8',
      privateKey
    }))
    result.push(sign)
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
    )
    return requestByToken(method. path, data, accessToken)
  }

  requestByToken(method, path, data, accessToken) {
    return axios({
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

export default Client;
