import { PubSub } from 'apollo-server'
const NOTIFICATION_ACTIVATED = 'NOTIFICATION_ACTIVATED'
const pubSub = new PubSub()
export { NOTIFICATION_ACTIVATED }
export default pubSub
