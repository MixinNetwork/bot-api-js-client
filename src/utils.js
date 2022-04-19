import forge from 'node-forge';
import JsSHA from 'jssha';
import { sharedKey } from 'curve25519-js';

class Utils {
  static base64RawURLEncode(_buffer) {
    let buffer;
    if (_buffer instanceof forge.util.ByteBuffer) {
      buffer = Buffer.from(_buffer.bytes(), 'binary');
    } else if (_buffer instanceof Buffer) {
      buffer = _buffer;
    } else {
      buffer = Buffer.from(forge.util.createBuffer(_buffer).bytes());
    }
    if (!buffer) {
      return '';
    }
    return forge.util.binary.base64.encode(buffer).replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_');
  }

  static base64RawURLDecode(_data) {
    let data = _data.replaceAll('-', '+').replaceAll('_', '/');
    if (data.length % 4 === 2) {
      data += '==';
    }
    const privateKey = forge.util.binary.base64.decode(data);
    return privateKey;
  }

  static environment() {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.MixinContext) {
      return 'iOS';
    }
    if (window.MixinContext && window.MixinContext.getContext) {
      return 'Android';
    }
    return undefined;
  }

  static conversationId() {
    let ctx;
    switch (this.environment()) {
      case 'iOS':
        ctx = prompt('MixinContext.getContext()');
        return JSON.parse(ctx).conversation_id;
      case 'Android':
        ctx = window.MixinContext.getContext();
        return JSON.parse(ctx).conversation_id;
      default:
        return ctx;
    }
  }

  static fetchChallenge() {
    const key = forge.random.getBytesSync(32);
    const verifier = this.base64RawURLEncode(key);

    const md = forge.md.sha256.create();
    md.update(key);
    const challenge = this.base64RawURLEncode(md.digest().getBytes());
    // window.localStorage.setItem('verifier', verifier);
    return { challenge, verifier };
  }

  static getMixinContext() {
    let ctx = {};
    if (
      window.webkit
      && window.webkit.messageHandlers
      && window.webkit.messageHandlers.MixinContext
    ) {
      ctx = JSON.parse(prompt('MixinContext.getContext()'));
      ctx.platform = ctx.platform || 'iOS';
    } else if (
      window.MixinContext
      && typeof window.MixinContext.getContext === 'function'
    ) {
      ctx = JSON.parse(window.MixinContext.getContext());
      ctx.platform = ctx.platform || 'Android';
    }
    return ctx;
  }

  static generateED25519Keypair() {
    const keypair = forge.pki.ed25519.generateKeyPair();
    const publicKey = this.base64RawURLEncode(keypair.publicKey);
    const privateKey = this.base64RawURLEncode(keypair.privateKey);
    return { publicKey, privateKey };
  }

  static hashMembers(ids) {
    const key = ids.sort().join('');
    const sha = new JsSHA('SHA3-256', 'TEXT', { encoding: 'UTF8' });
    sha.update(key);
    return sha.getHash('HEX');
  }

  static hexToBytes(hex) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
  }

  static privateKeyToCurve25519(privateKey) {
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

  static sharedEd25519Key(_pinToken, _privateKey) {
    const pinToken = Buffer.from(_pinToken, 'base64');
    let privateKey = Buffer.from(_privateKey, 'base64');
    privateKey = this.privateKeyToCurve25519(privateKey);

    return sharedKey(privateKey, pinToken);
  }
}

export default Utils;
