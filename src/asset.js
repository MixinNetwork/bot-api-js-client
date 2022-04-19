import HTTP from './http';

class Asset {
  constructor(keystore) {
    this.keystore = keystore || {};
    this.http = new HTTP(this.keystore);
  }

  // List the user's assets
  // For messenger user and app user, all chain assets will be listed, even they don't have.
  // For network user, assets balance greater than 0 will be listed only.
  Index() {
    return this.http.request('GET', '/assets');
  }

  // List the information of users asset, if user don't have the address of the asset, it will create automatically.
  Show(id) {
    return this.http.request('GET', `/assets/${id}`);
  }

  // List the transactions of the asset.
  Snapshots(id) {
    return this.http.request('GET', `/assets/${id}/snapshots`);
  }
}

export default Asset;
