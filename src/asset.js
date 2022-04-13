import HTTP from './http';
import Utils from './utils';

class Asset {
  constructor(keystore) {
    this.keystore = keystore || {};
    this.utils = Utils;
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
