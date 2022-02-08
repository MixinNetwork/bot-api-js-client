import Client from './client'

const client = new Client();

test('sign authentication token', () => {
  const appId = '';
  const sessionId = '';
  const privateKey = '';
  const method = 'GET';
  const uri = '/me';
  const token = client.signAuthenticationToken(appId, sessionId, privateKey, method, uri);
  console.log(token);
});
