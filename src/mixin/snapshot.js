import HTTP from './http';

class Snapshot {
  constructor(keystore) {
    this.keystore = keystore || {};
    this.http = new HTTP(this.keystore);
  }

  // List the user's snapshots
  Index() {
    return this.http.request('GET', '/snapshots');
  }

  // List the information of users snapshot
  Show(id) {
    return this.http.request('GET', `/snapshots/${id}`);
  }
}

export default Snapshot;
