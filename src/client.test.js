import Client from './client'

const client = new Client();

test('sign authentication token', () => {
  const appId = '';
  const sessionId = '';
  const privateKey = '';
  const method = 'GET';
  const uri = '/stickers/albums/a528b839-b5fd-4089-9043-06cbd8b0083a';
  const token = client.signAuthenticationToken(appId, sessionId, privateKey, method, uri);
  console.log(token);
});
