import ActualAgenda from 'agenda'

import PublishNotificationActivated from './jobs/PublishNotificationActivated'

const mongoConnectionString = process.env.AGENDA_MONGO_DB_URL
const Agenda = new ActualAgenda({ db: { address: mongoConnectionString }});

const PUBLISH_NOTIFICATION_ACTIVATED = 'publish notification activated'
Agenda.define(PUBLISH_NOTIFICATION_ACTIVATED, PublishNotificationActivated)

export { PUBLISH_NOTIFICATION_ACTIVATED }
export default Agenda
