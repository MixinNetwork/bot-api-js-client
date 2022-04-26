import HTTP from './http';
import User from './user';

class Transfer {
  constructor(keystore) {
    this.keystore = keystore || {};
    this.http = new HTTP(this.keystore);
    this.user = new User(this.keystore);
  }

  Transaction(body) {
    return this.http.request('POST', '/transactions', body);
  }

  Payment(body) {
    return this.http.request('POST', '/payments', body);
  }

  Transfer(_body) {
    const body = _body;
    body.pin_base64 = this.user.signEd25519PIN();
    return this.http.request('POST', '/transfers', body);
  }

  Output(body) {
    return this.http.request('POST', '/outputs', body);
  }

  Trace(id) {
    return this.http.request('GET', `/transfers/trace/${id}`);
  }
}

export default Transfer;
