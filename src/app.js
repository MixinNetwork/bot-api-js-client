import HTTP from './http';

class APP {
  constructor(_keystore) {
    const keystore = _keystore || {};
    this.http = new HTTP(keystore);
  }

  // Create an app, only valid bot can use it.
  // body: {
  //   name: '', description: '', icon_base64: '', redirect_uri: '', home_uri: '',
  //   category: '', redirect_uri: '', home_uri: '', capabilities: '', resource_patterns:  ''
  // }
  create(body) {
    return this.http.request('POST', '/apps', body);
  }

  // Update an app informations, body is similar with app.
  update(id, body) {
    return this.http.request('POST', `/apps/${id}`, body);
  }

  // secret will be used when user OAuth.
  secret(id) {
    return this.http.request('POST', `/apps/${id}/secret`);
  }

  // Update app's pin
  // body: { pin: '', session_secret: ''}
  session(id, body) {
    return this.http.request('POST', `/apps/${id}/session`, body);
  }

  // Favorite an app
  favorite(id) {
    return this.http.request('POST', `/apps/${id}/favorite`);
  }

  // Remove a favorited app
  unfavorite(id) {
    return this.http.request('POST', `/apps/${id}/unfavorite`);
  }

  // Fetch property, it's not a special app.
  // it will return app price and the count of creating app.
  property() {
    return this.http.request('GET', '/apps/property');
  }

  // Get an informations of an app
  show(id) {
    return this.http.request('GET', `/apps/${id}`);
  }
}

export default APP;
