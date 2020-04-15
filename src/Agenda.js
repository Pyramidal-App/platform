import ActualAgenda from 'agenda'

import PublishNotificationActivated from './jobs/PublishNotificationActivated'

const mongoConnectionString = process.env.AGENDA_MONGO_DB_URL
let Agenda
const PUBLISH_NOTIFICATION_ACTIVATED = 'publish notification activated'

if (['1', 'true'].includes(process.env.RUN_BACKGROUND_JOBS?.trim())) {
  Agenda = new ActualAgenda({ db: { address: mongoConnectionString }});
  Agenda.define(PUBLISH_NOTIFICATION_ACTIVATED, PublishNotificationActivated)
} else {
  Agenda = {
    schedule() {},
    now() {},
    start() {}
  }
}

export { PUBLISH_NOTIFICATION_ACTIVATED }
export default Agenda
