import forge from 'node-forge';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import serialize from 'serialize-javascript';
import Utils from './utils';

class HTTP {
  constructor(keystore) {
    this.keystore = keystore || {};
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
      params = serialize(_params);
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
      uid: this.keystore.user_id,
      sid: this.keystore.session_id,
      iat,
      exp,
      jti: uuidv4(),
      sig: md.digest().toHex(),
      scp: scp || 'FULL',
    };

    const header = this.utils.base64RawURLEncode(serialize({ alg: 'EdDSA', typ: 'JWT' }));
    payload = this.utils.base64RawURLEncode(serialize(payload));

    const privateKey = this.utils.base64RawURLDecode(this.keystore.private_key);
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
    if (this.keystore.access_token) {
      return this.requestByToken(method, path, data, this.keystore.access_token);
    }
    const body = !data ? '' : serialize(data);
    const accessToken = this.signAuthenticationToken(
      method,
      path,
      body,
    );
    return this.requestByToken(method, path, data, accessToken);
  }

  requestByToken(method, path, data, accessToken) {
    let token = '';
    if (accessToken) {
      token = accessToken;
    }
    return axios({
      method,
      url: this.host + path,
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export default HTTP;
