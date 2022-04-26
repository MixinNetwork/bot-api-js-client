import forge from 'node-forge';
import Utils from '../../src/mixin/utils';

describe('Tests for utils', () => {
  test('base64RawURLEncode should be url safe', () => {
    const buffer = forge.util.createBuffer('base64RawURLEncode should be url safe.', 'utf8');
    expect(Utils.base64RawURLEncode()).toBe('');
    expect(Utils.base64RawURLEncode(buffer)).toBe('YmFzZTY0UmF3VVJMRW5jb2RlIHNob3VsZCBiZSB1cmwgc2FmZS4');
    let decode = forge.util.decode64('YmFzZTY0UmF3VVJMRW5jb2RlIHNob3VsZCBiZSB1cmwgc2FmZS4');
    expect(decode).toMatch('base64RawURLEncode should be url safe.');
    decode = Utils.base64RawURLDecode('UVXRC3f4sWyFMFq2BmutrYWskXJFy6vmkXY_61weQ1VQl_H_oUba4BRh9nDv8BwlovfqmytE6Q8GEaPgEc09YQ');
    expect(forge.util.binary.base64.encode(decode)).toMatch('UVXRC3f4sWyFMFq2BmutrYWskXJFy6vmkXY/61weQ1VQl/H/oUba4BRh9nDv8BwlovfqmytE6Q8GEaPgEc09YQ==');
  });

  test('challenge should return two url safe string', () => {
    const { challenge, verifier } = Utils.fetchChallenge();
    expect(challenge.length).toBe(43);
    expect(verifier.length).toBe(43);
  });

  test('tests for hashMembers', () => {
    let hash = Utils.hashMembers(['965e5c6e-434c-3fa9-b780-c50f43cd955c']);
    expect(hash).toBe('b9f49cf777dc4d03bc54cd1367eebca319f8603ea1ce18910d09e2c540c630d8');
    hash = Utils.hashMembers(['965e5c6e-434c-3fa9-b780-c50f43cd955c', 'd1e9ec7e-199d-4578-91a0-a69d9a7ba048']);
    expect(hash).toBe('6064ec68a229a7d2fe2be652d11477f21705a742e08b75564fd085650f1deaeb');
  });

  test('tests for generateED25519Keypair', () => {
    const { publicKey, privateKey } = Utils.generateED25519Keypair();
    expect(publicKey.length).toBe(43);
    expect(privateKey.length).toBe(86);
  });
});
