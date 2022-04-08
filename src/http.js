import forge from 'node-forge'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

class HTTP {
  constructor(uid, sid, privateKey, host) {
    this.uid = uid;
    this.sid = sid;
    this.privateKey = privateKey;
    this.host = host || 'https://mixin-api.zeromesh.net';
  }

  setRPCHost(host) {
    this.host = host;
  }

  signAuthenticationToken(method, uri, params, scp) {
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
      uid: this.uid,
      sid: this.sid,
      iat: iat,
      exp: exp,
      jti: uuidv4(),
      sig: md.digest().toHex(),
      scp: scp || 'FULL',
    }

    let header = this.util.base64RawURLEncode(JSON.stringify({ alg: "EdDSA", typ: "JWT" }));
    payload = this.util.base64RawURLEncode(JSON.stringify(payload));

    let privateKey = forge.util.decode64(this.privateKey);
    let result = [header, payload]
    let sign = this.util.base64RawURLEncode(forge.pki.ed25519.sign({
      message: result.join('.'),
      encoding: 'utf8',
      privateKey
    }))
    result.push(sign)
    return result.join('.')
  }

  request(method, path, data) {
    const m = method;
    const accessToken = this.signAuthenticationToken(
      method,
      path,
      JSON.stringify(data)
    )
    return this.requestByToken(method, path, data, accessToken)
  }

  requestByToken(method, path, data, accessToken) {
    return axios({
      method,
      url: this.host + path,
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
    })
  }
}

export default HTTP;
