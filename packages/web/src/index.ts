import * as browserObj from './browser'
import * as schemaObj from './schema'
const Mixin = { ...browserObj, ...schemaObj }
if (typeof window !== 'undefined') window.Mixin = Mixin
export default Mixin

