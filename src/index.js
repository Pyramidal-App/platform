import 'regenerator-runtime/runtime'

import Server from './Server'
import Agenda from './Agenda'

// TODO: Remove dev crap ==========================
import addSeconds from 'date-fns/addSeconds'
import { Task } from './models'
import CreateNotification from './business_actions/CreateNotification.js'
const getRandomInt = max => Math.floor(Math.random() * Math.floor(max))
// ================================================

const PORT = process.env.port || 4000

const start = async _ => {
  await Agenda.start()
  console.log('✔ Agenda started')

  setInterval(async _ => {
    const task = await Task.findOne()

    try {
      await new CreateNotification({
        userId: 1,
        read: false,
        payload: task.dataValues,
        activateAt: addSeconds(new Date(), 20 + getRandomInt(5))
      }).perform()
    } catch (error) {
      console.log(error)
    }
  }, 3000)

  const { url, subscriptionsUrl } = await Server.listen(PORT)
  console.log(`🚀 Server ready at ${url}`)
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`)
}

start()
