import 'regenerator-runtime/runtime'

import Server from './Server'
import Agenda from './Agenda'

// TODO: Remove dev crap ==========================
//import addSeconds from 'date-fns/addSeconds'
//import { Task, User } from './models'
//import Notifications from './domains/Notifications'
//const getRandomInt = max => Math.floor(Math.random() * Math.floor(max))
//const createRandomNotifications = async _ => {
  //const user = await User.findOne();

  //[1, 2, 3, 4].forEach(async _ => {
    //const task = await Task.findOne()

    //try {
      //await new Notifications.create({
        //userId: 1,
        //read: false,
        //payload: task.dataValues,
        //activateAt: addSeconds(new Date(), 20 + getRandomInt(5))
      //}, user).perform()
    //} catch (error) {
      //console.log(error)
    //}
  //})
//}
//const beginSendingRandomNotifications = _ => setInterval(createRandomNotifications, 3000)
// ================================================

const PORT = process.env.port || 4000

const start = async _ => {
  if (process.env.RUN_BACKGROUND_JOBS) {
    await Agenda.start()
    //beginSendingRandomNotifications()
    console.log('✔ Agenda started');
  }

  const { url, subscriptionsUrl } = await Server.listen(PORT, '0.0.0.0')
  console.log(`🚀 Server ready at ${url}`)
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`)
}

start()
