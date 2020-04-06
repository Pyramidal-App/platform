import ActualAgenda from 'agenda'

import PublishNotificationActivated from './jobs/PublishNotificationActivated'

const mongoConnectionString = process.env.AGENDA_MONGO_DB_URL
const Agenda = new ActualAgenda({ db: { address: mongoConnectionString }});

Agenda.define('publish notification activated', PublishNotificationActivated)

export default Agenda
