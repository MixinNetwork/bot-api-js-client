import HTTP from './http.js';

class OAuth {
  constructor(keystore) {
    this.keystore = keystore || {};
    this.http = new HTTP(this.keystore);
  }

  // List the user's authorizations
  // an optional params "app", which specify the app id
  // will return an array of authorizations or the authorization of the app
  Authorizations() {
    return this.http.request('GET', '/authorizations');
  }

  // body: { "authorization_id": UUID, scopes: [] }
  // user can authorize authorizations for the app.
  Authorize(body) {
    return this.http.request('POST', '/oauth/authorize', body);
  }

  // body: { "client_id": UUID, "code": "", "client_secret": "", "code_verifier": "", "ed25519": "" }
  // After get `authorization_code` from `/oauth/authorize`, you can get the `access_token` from this api.
  // `ed25519` is optional
  // 1. Without `ed25519`, will response an `access_token`, which will expired in 365 days.
  // 2. Recommendation with `ed25519`, you need sign the `authorization_token` every time, but the `access_token`
  //    never expired.
  Token(body) {
    return this.http.request('POST', '/oauth/token', body);
  }

  // Since some app is danger or you don't want the app have access of your information, you can cancel it, through the api.
  Cancel(body) {
    return this.http.request('POST', '/oauth/cancel', body);
  }
}

export default OAuth;
