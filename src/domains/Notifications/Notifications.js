import CreateNotification from './business_actions/CreateNotification'
import CancelNotification from './business_actions/CancelNotification'
import markNotificationsRead from './business_actions/MarkNotificationsRead'

/**
 * A simple namespace to encapsulate notification related business actions.
 */
const Notifications = {
  create: CreateNotification,
  cancel: CancelNotification,
  markAsRead: markNotificationsRead
}

export default Notifications
