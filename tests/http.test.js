import forge from 'node-forge'
import Utils from '../src/utils'

describe('Tests for utils', () => {

  test('base64RawURLEncode should be url safe', () => {
    let buffer = forge.util.createBuffer('base64RawURLEncode should be url safe.', 'utf8');
   console.log(buffer.toString());
    // expect(Utils.base64RawURLEncode()).toBe(undefined);
  });

});
