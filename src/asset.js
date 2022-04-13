import HTTP from './http';

class Asset {
  constructor(keystore) {
    this.keystore = keystore || {};
    this.http = new HTTP(this.keystore);
  }

  Index() {
    return this.http.request('GET', '/assets');
  }

  Show(id) {
    return this.http.request('GET', `/assets/${id}`);
  }

  Snapshots(id) {
    return this.http.request('GET', `/assets/${id}/snapshots`);
  }
}

export default Asset;
