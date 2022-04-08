import forge from 'node-forge'
import jsSHA from 'jssha';

class Utils {
  constructor() {
  }

  base64RawURLEncode(buffer) {
    if (buffer instanceof forge.util.ByteBuffer) {
      buffer = buffer.bytes();
    } else if (buffer instanceof Buffer) {
      buffer = forge.util.createBuffer(buffer.toString('binary')).bytes();
    }
    if (!buffer) {
      return '';
    }
    return forge.util.encode64(buffer).replaceAll(/\=/g, '').replaceAll(/\+/g, '-').replaceAll(/\//g, '_');
  }

  base64RawURLDecode(data) {
    data = data.replaceAll('-', '+').replaceAll('_', '/');
    if (data.length % 4 === 2) {
      data += '==';
    }
    let privateKey = forge.util.decode64(data);
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

  challenge() {
    let key = forge.random.getBytesSync(32);
    let verifier = this.base64RawURLEncode(key);

    let md = forge.md.sha256.create();
    md.update(key);
    let challenge = this.base64RawURLEncode(md.digest().getBytes());
    // window.localStorage.setItem('verifier', verifier);
    return {challenge, verifier};
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

  generateED25519Keypair() {
    let keypair = forge.pki.ed25519.generateKeyPair()
    let publicKey = this.base64RawURLEncode(keypair.publicKey);
    let privateKey = this.base64RawURLEncode(keypair.privateKey);
    return { publicKey, privateKey };
  }

  hashMembers(ids) {
    let key = ids.sort().join('');
    let sha = new jsSHA('SHA3-256', 'TEXT', { encoding: 'UTF8' })
    sha.update(key);
    return sha.getHash('HEX');
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

export default new Utils;
