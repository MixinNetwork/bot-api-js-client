import forge from 'node-forge';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Utils from './utils';

class HTTP {
  constructor(_keystore) {
    const keystore = _keystore || {};
    this.uid = keystore.user_id;
    this.sid = keystore.session_id;
    this.privateKey = keystore.private_key;
    this.host = keystore.host || 'https://mixin-api.zeromesh.net';
    this.utils = Utils;
  }

  setRPCHost(host) {
    this.host = host;
  }

  signAuthenticationToken(_method, uri, _params, scp) {
    const method = _method.toLocaleUpperCase();
    let params;
    if (typeof _params === 'object') {
      params = JSON.stringify(_params);
    } else if (typeof _params !== 'string') {
      params = '';
    } else {
      params = _params;
    }

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;
    const md = forge.md.sha256.create();
    md.update(method + uri + params, 'utf8');
    let payload = {
      uid: this.uid,
      sid: this.sid,
      iat,
      exp,
      jti: uuidv4(),
      sig: md.digest().toHex(),
      scp: scp || 'FULL',
    };

    const header = this.utils.base64RawURLEncode(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' }));
    payload = this.utils.base64RawURLEncode(JSON.stringify(payload));

    const privateKey = this.utils.base64RawURLDecode(this.privateKey);
    const result = [header, payload];
    const signData = forge.pki.ed25519.sign({
      message: result.join('.'),
      encoding: 'utf8',
      privateKey,
    });
    const sign = this.utils.base64RawURLEncode(signData);
    result.push(sign);
    return result.join('.');
  }

  request(method, path, data) {
    const accessToken = this.signAuthenticationToken(
      method,
      path,
      JSON.stringify(data),
    );
    return this.requestByToken(method, path, data, accessToken);
  }

  requestByToken(method, path, data, accessToken) {
    return axios({
      method,
      url: this.host + path,
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}

export default HTTP;