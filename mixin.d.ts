export interface Keystore {
  user_id: string;
  session_id: string;
  private_key: string;
  pin: string;
  pin_token: string;
  host?: string;
  access_token?: string;
}

class Mixin {
  constructor(keystore?: Keystore);
}

export default Mixin;
