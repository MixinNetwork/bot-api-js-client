import forge from 'node-forge';
import jsSHA from 'jssha';

class Utils {
  base64RawURLEncode(_buffer) {
    let buffer;
    if (_buffer instanceof forge.util.ByteBuffer) {
      buffer = _buffer.bytes();
    } else if (_buffer instanceof Buffer) {
      buffer = forge.util.createBuffer(_buffer.toString('binary')).bytes();
    } else {
      buffer = _buffer;
    }
    if (!buffer) {
      return '';
    }
    return forge.util.encode64(buffer).replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_');
  }

  base64RawURLDecode(_data) {
    let data = _data.replaceAll('-', '+').replaceAll('_', '/');
    if (data.length % 4 === 2) {
      data += '==';
    }
    const privateKey = forge.util.decode64(data);
    return privateKey;
  }

  environment() {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.MixinContext) {
      return 'iOS';
    }
    if (window.MixinContext && window.MixinContext.getContext) {
      return 'Android';
    }
    return undefined;
  }

  conversationId() {
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

  fetchChallenge() {
    const key = forge.random.getBytesSync(32);
    const verifier = this.base64RawURLEncode(key);

    const md = forge.md.sha256.create();
    md.update(key);
    const challenge = this.base64RawURLEncode(md.digest().getBytes());
    // window.localStorage.setItem('verifier', verifier);
    return { challenge, verifier };
  }

  getMixinContext() {
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

  generateED25519Keypair() {
    const keypair = forge.pki.ed25519.generateKeyPair();
    const publicKey = this.base64RawURLEncode(keypair.publicKey);
    const privateKey = this.base64RawURLEncode(keypair.privateKey);
    return { publicKey, privateKey };
  }

  hashMembers(ids) {
    const key = ids.sort().join('');
    const sha = new jsSHA('SHA3-256', 'TEXT', { encoding: 'UTF8' })
    sha.update(key);
    return sha.getHash('HEX');
  }
}

export default new Utils();
