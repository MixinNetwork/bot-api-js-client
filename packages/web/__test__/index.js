import { Client } from '@mixin/web'
let client = new Client('test')

client.readAssets().then(console.log)
